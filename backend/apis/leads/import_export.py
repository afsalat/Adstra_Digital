"""Validated CSV import and spreadsheet-safe export helpers.

This module contains no view or workflow-service imports.  Activity and audit
integration is performed through small hooks (with lazy defaults), which keeps
the bulk-data path usable from API views, management commands, and tests
without creating circular imports.
"""

from __future__ import annotations

import csv
import io
import json
import re
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Callable, Iterable, Mapping, Sequence

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.db.models import Q, QuerySet
from django.db.models.functions import Lower
from django.utils import timezone
from django.utils.dateparse import parse_datetime

try:
    import openpyxl
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False

from .choices import (
    LEAD_STAGE_CHOICES,
    LEAD_TEMPERATURE_CHOICES,
    LEAD_TYPE_CHOICES,
    PRIORITY_CHOICES,
)
from .models import Lead, LeadActivity, TargetCustomer, TargetCustomerList
from .validators import escape_csv_formula, normalize_phone, validate_future_datetime


MAX_IMPORT_ROWS = 5_000
MAX_CSV_BYTES = 10 * 1024 * 1024
MAX_CELL_LENGTH = 20_000
MAX_XLSX_UNCOMPRESSED_BYTES = 100 * 1024 * 1024
MAX_XLSX_MEMBERS = 10_000

AuditHook = Callable[..., Any]
ActivityHook = Callable[..., Any]


class CSVImportError(ValueError):
    """A file-level CSV error that prevents row validation from starting."""

    def __init__(self, message: str, *, code: str = "invalid_csv") -> None:
        super().__init__(message)
        self.code = code


_HEADER_CLEAN_RE = re.compile(r"[^a-z0-9]+")
_COMMON_ALIASES = {
    "name": "customer_name",
    "customer": "customer_name",
    "customername": "customer_name",
    "company": "company_name",
    "companyname": "company_name",
    "contact": "contact_person",
    "contact_name": "contact_person",
    "contactperson": "contact_person",
    "mobile": "phone",
    "mobile_number": "phone",
    "phone_number": "phone",
    "telephone": "phone",
    "whatsapp": "whatsapp_number",
    "whatsapp_no": "whatsapp_number",
    "whatsapp_phone": "whatsapp_number",
    "e_mail": "email",
    "email_address": "email",
    "assignee": "assigned_to",
    "assigned_to_id": "assigned_to",
}

_TARGET_FIELDS = frozenset(
    {
        "customer_name",
        "company_name",
        "contact_person",
        "phone",
        "whatsapp_number",
        "email",
        "website",
        "address",
        "city",
        "state",
        "industry",
        "business_category",
        "customer_type",
        "interested_product",
        "interested_service",
        "source",
        "priority",
        "tags",
        "assigned_to",
        "notes",
        "do_not_call",
    }
)
_TARGET_ALIASES = {
    **_COMMON_ALIASES,
    "product": "interested_product",
    "service": "interested_service",
    "dnc": "do_not_call",
    "donotcall": "do_not_call",
}

_LEAD_FIELDS = frozenset(
    {
        "target_customer_id",
        "lead_type",
        "customer_name",
        "company_name",
        "contact_person",
        "phone",
        "whatsapp_number",
        "email",
        "address",
        "source",
        "campaign",
        "product",
        "service",
        "requirement_summary",
        "assigned_to",
        "priority",
        "temperature",
        "lead_score",
        "estimated_value",
        "conversion_probability",
        "next_follow_up_at",
    }
)
_LEAD_ALIASES = {
    **_COMMON_ALIASES,
    "type": "lead_type",
    "target_id": "target_customer_id",
    "target_customer": "target_customer_id",
    "requirement": "requirement_summary",
    "follow_up": "next_follow_up_at",
    "next_followup": "next_follow_up_at",
    "stage": "current_stage",  # Explicitly rejected as a read-only import field.
}

_NAME_FIELDS = frozenset({"customer_name", "company_name", "contact_person"})
_CONTACT_FIELDS = frozenset({"phone", "whatsapp_number", "email", "target_customer_id"})
_PRIORITIES = frozenset(value for value, _label in PRIORITY_CHOICES)
_TEMPERATURES = frozenset(value for value, _label in LEAD_TEMPERATURE_CHOICES)
_LEAD_TYPES = frozenset(value for value, _label in LEAD_TYPE_CHOICES)
_LEAD_STAGES = frozenset(value for value, _label in LEAD_STAGE_CHOICES)


def import_target_customers(
    upload: Any,
    *,
    customer_list: TargetCustomerList | int,
    actor: Any = None,
    max_rows: int = MAX_IMPORT_ROWS,
    atomic: bool = True,
    activity_hook: ActivityHook | bool | None = None,
    audit_hook: AuditHook | bool | None = None,
    request: Any = None,
    dry_run: bool = False,
    target_queryset: QuerySet[TargetCustomer] | None = None,
    assignee_queryset: QuerySet | None = None,
) -> dict[str, Any]:
    """Validate and import target customers from a multipart upload or bytes.

    Rows are fully validated before any write.  With the default ``atomic=True``
    an invalid row means zero rows are created and no do-not-call flags change.
    Existing and within-file duplicates are skipped and described in the
    result.  A true incoming do-not-call flag may set an existing duplicate to
    true; imports can never clear an existing flag.
    """

    target_list = _resolve_customer_list(customer_list)
    headers, rows = _read_csv(upload, allowed_fields=_TARGET_FIELDS, aliases=_TARGET_ALIASES, max_rows=max_rows)
    _validate_identity_headers(headers)
    assigned_users = _resolve_users(rows, queryset=assignee_queryset)
    now = timezone.now()

    prepared: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    for row_number, row in rows:
        try:
            payload = _prepare_target_row(
                row,
                target_list=target_list,
                assigned_users=assigned_users,
                imported_at=now,
            )
            candidate = TargetCustomer(customer_list=target_list, **payload)
            candidate.full_clean(validate_unique=False, validate_constraints=False)
            prepared.append({"row": row_number, "payload": payload})
        except (ValidationError, ValueError, TypeError) as exc:
            errors.extend(_row_errors(row_number, exc))

    duplicate_index = _target_duplicate_index(prepared, queryset=target_queryset)
    accepted, duplicates, dnc_ids, updated_records = _deduplicate_targets(prepared, duplicate_index)
    if errors and atomic:
        return _import_result(errors=errors, duplicates=duplicates, atomic=atomic)

    objects = [TargetCustomer(customer_list=target_list, **item["payload"]) for item in accepted]
    if not dry_run:
        with transaction.atomic():
            if dnc_ids:
                TargetCustomer.objects.filter(pk__in=dnc_ids).update(do_not_call=True)
            TargetCustomer.objects.bulk_create(objects, batch_size=500)
            _emit_activity(
                activity_hook,
                event="target_customers_imported",
                objects=objects,
                actor=actor,
                metadata={"customer_list_id": target_list.pk, "count": len(objects)},
            )
            _emit_audit(
                audit_hook,
                actor=actor,
                action="Target customers imported",
                details=(
                    f"Imported {len(objects)} target customers into list {target_list.pk}; "
                    f"skipped {len(duplicates)} duplicates."
                ),
                request=request,
            )

    created_records = [
        {
            "row": item["row"],
            "customer_name": (
                item["payload"].get("customer_name")
                or item["payload"].get("company_name")
                or item["payload"].get("contact_person")
                or ""
            ),
            "phone": item["payload"].get("phone") or item["payload"].get("whatsapp_number") or "",
            "email": item["payload"].get("email") or "",
        }
        for item in accepted
    ]
    return _import_result(
        objects=objects,
        errors=errors,
        duplicates=duplicates,
        atomic=atomic,
        do_not_call_preserved=len(dnc_ids),
        created_records=created_records,
        updated_records=updated_records,
    )


def import_leads(
    upload: Any,
    *,
    actor: Any = None,
    target_customer_list: TargetCustomerList | int | None = None,
    max_rows: int = MAX_IMPORT_ROWS,
    atomic: bool = True,
    activity_hook: ActivityHook | bool | None = None,
    audit_hook: AuditHook | bool | None = None,
    request: Any = None,
    dry_run: bool = False,
    lead_queryset: QuerySet[Lead] | None = None,
    target_queryset: QuerySet[TargetCustomer] | None = None,
    assignee_queryset: QuerySet | None = None,
) -> dict[str, Any]:
    """Validate and import leads, linking matching target customers safely."""

    target_list = _resolve_customer_list(target_customer_list) if target_customer_list is not None else None
    headers, rows = _read_csv(upload, allowed_fields=_LEAD_FIELDS, aliases=_LEAD_ALIASES, max_rows=max_rows)
    _validate_identity_headers(headers)
    assigned_users = _resolve_users(rows, queryset=assignee_queryset)
    explicit_targets = _resolve_explicit_targets(rows, target_list=target_list, queryset=target_queryset)
    target_matches = _matching_targets(rows, target_list=target_list, queryset=target_queryset)
    now = timezone.now()

    prepared: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    for row_number, row in rows:
        try:
            payload = _prepare_lead_row(
                row,
                actor=actor,
                assigned_users=assigned_users,
                explicit_targets=explicit_targets,
                target_matches=target_matches,
                imported_at=now,
            )
            candidate = Lead(**payload)
            candidate.full_clean(validate_unique=False, validate_constraints=False)
            prepared.append({"row": row_number, "payload": payload})
        except (ValidationError, ValueError, TypeError) as exc:
            errors.extend(_row_errors(row_number, exc))

    duplicate_index = _lead_duplicate_index(prepared, queryset=lead_queryset)
    accepted, duplicates = _deduplicate_leads(prepared, duplicate_index)
    if errors and atomic:
        return _import_result(errors=errors, duplicates=duplicates, atomic=atomic)

    objects = [Lead(**item["payload"]) for item in accepted]
    if not dry_run:
        with transaction.atomic():
            Lead.objects.bulk_create(objects, batch_size=500)
            _emit_activity(
                activity_hook,
                event="leads_imported",
                objects=objects,
                actor=actor,
                metadata={"count": len(objects)},
            )
            _emit_audit(
                audit_hook,
                actor=actor,
                action="Leads imported",
                details=f"Imported {len(objects)} leads; skipped {len(duplicates)} duplicates.",
                request=request,
            )

    created_records = [
        {
            "row": item["row"],
            "customer_name": (
                item["payload"].get("customer_name")
                or item["payload"].get("company_name")
                or item["payload"].get("contact_person")
                or ""
            ),
            "phone": item["payload"].get("phone") or item["payload"].get("whatsapp_number") or "",
            "email": item["payload"].get("email") or "",
        }
        for item in accepted
    ]
    return _import_result(
        objects=objects,
        errors=errors,
        duplicates=duplicates,
        atomic=atomic,
        created_records=created_records,
    )


def export_leads_csv(
    queryset: QuerySet[Lead] | Iterable[Lead],
    *,
    actor: Any = None,
    activity_hook: ActivityHook | bool | None = None,
    audit_hook: AuditHook | bool | None = None,
    request: Any = None,
) -> str:
    """Return UTF-8 CSV text with Excel BOM, styled headers, and Excel-safe text formatting."""

    headers = [
        "Lead Number",
        "Lead Type",
        "Customer Name",
        "Company Name",
        "Contact Person",
        "Phone",
        "WhatsApp",
        "Email",
        "Address",
        "Source",
        "Campaign",
        "Product",
        "Service",
        "Requirement Summary",
        "Assigned User ID",
        "Assigned User",
        "Priority",
        "Temperature",
        "Lead Score",
        "Estimated Value (₹)",
        "Conversion Probability (%)",
        "Current Stage",
        "Next Follow Up",
        "Last Activity",
        "Do Not Call",
        "Created At",
        "Updated At",
    ]
    output = io.StringIO(newline="")
    output.write("\ufeff")  # UTF-8 BOM for Excel UTF-8 auto-detection
    writer = csv.writer(output, lineterminator="\r\n")
    writer.writerow(headers)

    stage_map = dict(LEAD_STAGE_CHOICES)
    priority_map = dict(PRIORITY_CHOICES)
    temp_map = dict(LEAD_TEMPERATURE_CHOICES)
    type_map = dict(LEAD_TYPE_CHOICES)

    leads: Iterable[Lead]
    if isinstance(queryset, QuerySet):
        leads = queryset.select_related("assigned_to", "target_customer").iterator(chunk_size=1_000)
    else:
        leads = queryset
    exported: list[Lead] = []
    for lead in leads:
        exported.append(lead)
        writer.writerow(
            _safe_csv_row(
                [
                    lead.lead_number,
                    type_map.get(lead.lead_type, lead.lead_type),
                    lead.customer_name,
                    lead.company_name,
                    lead.contact_person,
                    _excel_text_phone(lead.phone),
                    _excel_text_phone(lead.whatsapp_number),
                    lead.email,
                    lead.address,
                    _format_source(lead.source),
                    lead.campaign,
                    lead.product,
                    lead.service,
                    lead.requirement_summary,
                    lead.assigned_to_id or "",
                    _user_label(lead.assigned_to),
                    priority_map.get(lead.priority, lead.priority),
                    temp_map.get(lead.temperature, lead.temperature),
                    lead.lead_score,
                    _format_currency(lead.estimated_value),
                    f"{lead.conversion_probability}%" if lead.conversion_probability is not None else "",
                    stage_map.get(lead.current_stage, lead.current_stage),
                    _format_datetime(lead.next_follow_up_at),
                    _format_datetime(lead.last_activity_at),
                    "Yes" if lead.do_not_call else "No",
                    _format_datetime(lead.created_at),
                    _format_datetime(lead.updated_at),
                ]
            )
        )

    _emit_activity(
        activity_hook,
        event="leads_exported",
        objects=exported,
        actor=actor,
        metadata={"count": len(exported)},
    )
    _emit_audit(
        audit_hook,
        actor=actor,
        action="Leads exported",
        details=f"Exported {len(exported)} leads.",
        request=request,
    )
    return output.getvalue()


def export_target_customers_csv(
    queryset: QuerySet[TargetCustomer] | Iterable[TargetCustomer],
    *,
    actor: Any = None,
    audit_hook: AuditHook | bool | None = None,
    request: Any = None,
) -> str:
    """Return formula-injection-safe CSV text for target customers with Excel BOM and styled headers."""

    headers = [
        "Customer List ID",
        "Customer Name",
        "Company Name",
        "Contact Person",
        "Phone",
        "WhatsApp",
        "Email",
        "Website",
        "Address",
        "City",
        "State",
        "Industry",
        "Business Category",
        "Customer Type",
        "Interested Product",
        "Interested Service",
        "Source",
        "Priority",
        "Tags",
        "Assigned User ID",
        "Assigned User",
        "Notes",
        "Do Not Call",
        "Imported At",
        "Created At",
        "Updated At",
    ]
    output = io.StringIO(newline="")
    output.write("\ufeff")  # UTF-8 BOM for Excel UTF-8 auto-detection
    writer = csv.writer(output, lineterminator="\r\n")
    writer.writerow(headers)

    priority_map = dict(PRIORITY_CHOICES)

    customers: Iterable[TargetCustomer]
    if isinstance(queryset, QuerySet):
        customers = queryset.select_related("assigned_to", "customer_list").iterator(chunk_size=1_000)
    else:
        customers = queryset

    count = 0
    for customer in customers:
        count += 1
        tags_str = ", ".join(customer.tags) if isinstance(customer.tags, list) else str(customer.tags or "")
        writer.writerow(
            _safe_csv_row(
                [
                    customer.customer_list_id or "",
                    customer.customer_name,
                    customer.company_name,
                    customer.contact_person,
                    _excel_text_phone(customer.phone),
                    _excel_text_phone(customer.whatsapp_number),
                    customer.email,
                    customer.website,
                    customer.address,
                    customer.city,
                    customer.state,
                    customer.industry,
                    customer.business_category,
                    customer.customer_type,
                    customer.interested_product,
                    customer.interested_service,
                    _format_source(customer.source),
                    priority_map.get(customer.priority, customer.priority),
                    tags_str,
                    customer.assigned_to_id or "",
                    _user_label(customer.assigned_to),
                    customer.notes,
                    "Yes" if customer.do_not_call else "No",
                    _format_datetime(customer.imported_at),
                    _format_datetime(customer.created_at),
                    _format_datetime(customer.updated_at),
                ]
            )
        )

    _emit_audit(
        audit_hook,
        actor=actor,
        action="Target customers exported",
        details=f"Exported {count} target customers.",
        request=request,
    )
    return output.getvalue()


def export_leads_excel(
    queryset: QuerySet[Lead] | Iterable[Lead],
    *,
    actor: Any = None,
    activity_hook: ActivityHook | bool | None = None,
    audit_hook: AuditHook | bool | None = None,
    request: Any = None,
) -> bytes:
    """Return styled .xlsx binary bytes for leads matching the exact design system."""
    if not OPENPYXL_AVAILABLE:
        raise RuntimeError("openpyxl package is required for Excel export.")

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Leads Export"
    ws.views.sheetView[0].showGridLines = True

    headers = [
        "Lead Number",
        "Lead Type",
        "Customer Name",
        "Company Name",
        "Contact Person",
        "Phone",
        "WhatsApp",
        "Email",
        "Address",
        "Source",
        "Campaign",
        "Product",
        "Service",
        "Requirement Summary",
        "Assigned User ID",
        "Assigned User",
        "Priority",
        "Temperature",
        "Lead Score",
        "Estimated Value (₹)",
        "Conversion Probability (%)",
        "Current Stage",
        "Next Follow Up",
        "Last Activity",
        "Do Not Call",
        "Created At",
        "Updated At",
    ]

    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    header_alignment = Alignment(horizontal="left", vertical="center")

    even_row_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    odd_row_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

    data_font = Font(name="Segoe UI", size=10, color="0F172A")
    muted_font = Font(name="Segoe UI", size=10, color="64748B")
    bold_font = Font(name="Segoe UI", size=10, bold=True, color="0F172A")

    thin_border_side = Side(border_style="thin", color="CBD5E1")
    cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)

    ws.row_dimensions[1].height = 28
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = header_alignment
        cell.border = cell_border

    stage_map = dict(LEAD_STAGE_CHOICES)
    priority_map = dict(PRIORITY_CHOICES)
    temp_map = dict(LEAD_TEMPERATURE_CHOICES)
    type_map = dict(LEAD_TYPE_CHOICES)

    leads: Iterable[Lead]
    if isinstance(queryset, QuerySet):
        leads = queryset.select_related("assigned_to", "target_customer").iterator(chunk_size=1_000)
    else:
        leads = queryset

    exported: list[Lead] = []
    row_num = 2
    for lead in leads:
        exported.append(lead)
        ws.row_dimensions[row_num].height = 22
        row_fill = even_row_fill if row_num % 2 == 0 else odd_row_fill

        phone_val = str(lead.phone or "").strip()
        wa_val = str(lead.whatsapp_number or "").strip()
        est_val = float(lead.estimated_value) if lead.estimated_value is not None else None
        prob_val = (float(lead.conversion_probability) / 100.0) if lead.conversion_probability is not None else None

        next_dt = timezone.localtime(lead.next_follow_up_at).strftime("%Y-%m-%d %H:%M") if lead.next_follow_up_at else ""
        last_dt = timezone.localtime(lead.last_activity_at).strftime("%Y-%m-%d %H:%M") if lead.last_activity_at else ""
        created_dt = timezone.localtime(lead.created_at).strftime("%Y-%m-%d %H:%M") if lead.created_at else ""
        updated_dt = timezone.localtime(lead.updated_at).strftime("%Y-%m-%d %H:%M") if lead.updated_at else ""

        row_data = [
            (lead.lead_number, "@", bold_font),
            (type_map.get(lead.lead_type, lead.lead_type), "@", data_font),
            (lead.customer_name, "@", bold_font),
            (lead.company_name, "@", data_font),
            (lead.contact_person, "@", data_font),
            (phone_val, "@", data_font),
            (wa_val, "@", data_font),
            (lead.email, "@", data_font),
            (lead.address, "@", data_font),
            (_format_source(lead.source), "@", data_font),
            (lead.campaign, "@", data_font),
            (lead.product, "@", data_font),
            (lead.service, "@", data_font),
            (lead.requirement_summary, "@", data_font),
            (lead.assigned_to_id or "", "@", muted_font),
            (_user_label(lead.assigned_to), "@", data_font),
            (priority_map.get(lead.priority, lead.priority), "@", bold_font),
            (temp_map.get(lead.temperature, lead.temperature), "@", data_font),
            (lead.lead_score, "0", data_font),
            (est_val, '₹#,##0.00', bold_font),
            (prob_val, "0%", data_font),
            (stage_map.get(lead.current_stage, lead.current_stage), "@", bold_font),
            (next_dt, "@", data_font),
            (last_dt, "@", data_font),
            ("Yes" if lead.do_not_call else "No", "@", data_font),
            (created_dt, "@", muted_font),
            (updated_dt, "@", muted_font),
        ]

        for col_num, (val, number_format, font_style) in enumerate(row_data, 1):
            cell = ws.cell(row=row_num, column=col_num, value=val)
            cell.fill = row_fill
            cell.font = font_style
            cell.border = cell_border
            if number_format:
                cell.number_format = number_format
            if col_num in (6, 7):
                cell.data_type = "s"

        row_num += 1

    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or "")
            if cell.number_format == '₹#,##0.00' and isinstance(cell.value, (int, float)):
                val_str = f"₹{cell.value:,.2f}"
            max_len = max(max_len, len(val_str))
        ws.column_dimensions[col_letter].width = max(max_len + 5, 14)

    _emit_activity(
        activity_hook,
        event="leads_exported",
        objects=exported,
        actor=actor,
        metadata={"count": len(exported)},
    )
    _emit_audit(
        audit_hook,
        actor=actor,
        action="Leads exported",
        details=f"Exported {len(exported)} leads.",
        request=request,
    )

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def export_target_customers_excel(
    queryset: QuerySet[TargetCustomer] | Iterable[TargetCustomer],
    *,
    actor: Any = None,
    audit_hook: AuditHook | bool | None = None,
    request: Any = None,
) -> bytes:
    """Return styled .xlsx binary bytes for target customers."""
    if not OPENPYXL_AVAILABLE:
        raise RuntimeError("openpyxl package is required for Excel export.")

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Target Customers Export"
    ws.views.sheetView[0].showGridLines = True

    headers = [
        "Customer List ID",
        "Customer Name",
        "Company Name",
        "Contact Person",
        "Phone",
        "WhatsApp",
        "Email",
        "Website",
        "Address",
        "City",
        "State",
        "Industry",
        "Business Category",
        "Customer Type",
        "Interested Product",
        "Interested Service",
        "Source",
        "Priority",
        "Tags",
        "Assigned User ID",
        "Assigned User",
        "Notes",
        "Do Not Call",
        "Imported At",
        "Created At",
        "Updated At",
    ]

    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    header_alignment = Alignment(horizontal="left", vertical="center")

    even_row_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    odd_row_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

    data_font = Font(name="Segoe UI", size=10, color="0F172A")
    muted_font = Font(name="Segoe UI", size=10, color="64748B")
    bold_font = Font(name="Segoe UI", size=10, bold=True, color="0F172A")

    thin_border_side = Side(border_style="thin", color="CBD5E1")
    cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)

    ws.row_dimensions[1].height = 28
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = header_alignment
        cell.border = cell_border

    priority_map = dict(PRIORITY_CHOICES)

    customers: Iterable[TargetCustomer]
    if isinstance(queryset, QuerySet):
        customers = queryset.select_related("assigned_to", "customer_list").iterator(chunk_size=1_000)
    else:
        customers = queryset

    row_num = 2
    count = 0
    for customer in customers:
        count += 1
        ws.row_dimensions[row_num].height = 22
        row_fill = even_row_fill if row_num % 2 == 0 else odd_row_fill
        tags_str = ", ".join(customer.tags) if isinstance(customer.tags, list) else str(customer.tags or "")

        phone_val = str(customer.phone or "").strip()
        wa_val = str(customer.whatsapp_number or "").strip()

        imp_dt = timezone.localtime(customer.imported_at).strftime("%Y-%m-%d %H:%M") if customer.imported_at else ""
        created_dt = timezone.localtime(customer.created_at).strftime("%Y-%m-%d %H:%M") if customer.created_at else ""
        updated_dt = timezone.localtime(customer.updated_at).strftime("%Y-%m-%d %H:%M") if customer.updated_at else ""

        row_data = [
            (customer.customer_list_id or "", "@", muted_font),
            (customer.customer_name, "@", bold_font),
            (customer.company_name, "@", data_font),
            (customer.contact_person, "@", data_font),
            (phone_val, "@", data_font),
            (wa_val, "@", data_font),
            (customer.email, "@", data_font),
            (customer.website, "@", data_font),
            (customer.address, "@", data_font),
            (customer.city, "@", data_font),
            (customer.state, "@", data_font),
            (customer.industry, "@", data_font),
            (customer.business_category, "@", data_font),
            (customer.customer_type, "@", data_font),
            (customer.interested_product, "@", data_font),
            (customer.interested_service, "@", data_font),
            (_format_source(customer.source), "@", data_font),
            (priority_map.get(customer.priority, customer.priority), "@", bold_font),
            (tags_str, "@", data_font),
            (customer.assigned_to_id or "", "@", muted_font),
            (_user_label(customer.assigned_to), "@", data_font),
            (customer.notes, "@", data_font),
            ("Yes" if customer.do_not_call else "No", "@", data_font),
            (imp_dt, "@", muted_font),
            (created_dt, "@", muted_font),
            (updated_dt, "@", muted_font),
        ]

        for col_num, (val, number_format, font_style) in enumerate(row_data, 1):
            cell = ws.cell(row=row_num, column=col_num, value=val)
            cell.fill = row_fill
            cell.font = font_style
            cell.border = cell_border
            if number_format:
                cell.number_format = number_format
            if col_num in (5, 6):
                cell.data_type = "s"

        row_num += 1

    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            max_len = max(max_len, len(str(cell.value or "")))
        ws.column_dimensions[col_letter].width = max(max_len + 5, 14)

    _emit_audit(
        audit_hook,
        actor=actor,
        action="Target customers exported",
        details=f"Exported {count} target customers.",
        request=request,
    )

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def export_employee_excel(
    queryset: QuerySet[Lead] | Iterable[Lead],
    *,
    actor: Any = None,
    audit_hook: AuditHook | bool | None = None,
    request: Any = None,
) -> bytes:
    """Return styled .xlsx binary bytes for employee performance report."""
    if not OPENPYXL_AVAILABLE:
        raise RuntimeError("openpyxl package is required for Excel export.")

    # Lazy selector import
    from .selectors import lead_reports

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Employee Performance Report"
    ws.views.sheetView[0].showGridLines = True

    headers = [
        "Employee ID",
        "Employee Name",
        "Username",
        "Total Assigned Leads",
        "Converted Leads",
        "Rejected Leads",
        "Active Leads",
        "Conversion Rate (%)",
        "Total Pipeline Value (₹)",
    ]

    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    header_alignment = Alignment(horizontal="left", vertical="center")

    even_row_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    odd_row_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

    data_font = Font(name="Segoe UI", size=10, color="0F172A")
    muted_font = Font(name="Segoe UI", size=10, color="64748B")
    bold_font = Font(name="Segoe UI", size=10, bold=True, color="0F172A")

    thin_border_side = Side(border_style="thin", color="CBD5E1")
    cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)

    ws.row_dimensions[1].height = 28
    for col_num, h in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = header_alignment
        cell.border = cell_border

    report = lead_reports(queryset)
    employee_data = report.get("employee", [])

    row_num = 2
    for emp in employee_data:
        ws.row_dimensions[row_num].height = 22
        row_fill = even_row_fill if row_num % 2 == 0 else odd_row_fill
        total = emp.get("total", 0)
        converted = emp.get("converted", 0)
        rejected = emp.get("rejected", 0)
        active = total - converted - rejected
        rate = (converted / total) if total > 0 else 0.0
        val = float(emp.get("pipeline_value") or 0)

        emp_name = emp.get("assigned_to__fullname") or emp.get("assigned_to__username") or "Unassigned"
        emp_username = emp.get("assigned_to__username") or "unassigned"

        row_data = [
            (emp.get("assigned_to_id") or "N/A", "@", muted_font),
            (emp_name, "@", bold_font),
            (emp_username, "@", data_font),
            (total, "0", bold_font),
            (converted, "0", data_font),
            (rejected, "0", data_font),
            (active, "0", data_font),
            (rate, "0.0%", bold_font),
            (val, '₹#,##0.00', bold_font),
        ]

        for col_num, (v, number_format, font_style) in enumerate(row_data, 1):
            cell = ws.cell(row=row_num, column=col_num, value=v)
            cell.fill = row_fill
            cell.font = font_style
            cell.border = cell_border
            if number_format:
                cell.number_format = number_format

        row_num += 1

    for col in ws.columns:
        max_len = max(len(str(c.value or "")) for c in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 5, 14)

    _emit_audit(
        audit_hook,
        actor=actor,
        action="Employee report exported",
        details=f"Exported performance report for {len(employee_data)} employees.",
        request=request,
    )

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def _read_xlsx(
    raw: bytes,
    *,
    allowed_fields: frozenset[str],
    aliases: Mapping[str, str],
    max_rows: int,
) -> tuple[list[str], list[tuple[int, dict[str, str]]]]:
    if not OPENPYXL_AVAILABLE:
        raise CSVImportError(
            "Excel (.xlsx) import is not supported because openpyxl is not installed.",
            code="unsupported_format",
        )

    import zipfile
    try:
        with zipfile.ZipFile(io.BytesIO(raw)) as archive:
            members = archive.infolist()
            if len(members) > MAX_XLSX_MEMBERS or sum(item.file_size for item in members) > MAX_XLSX_UNCOMPRESSED_BYTES:
                raise CSVImportError(
                    "The Excel workbook expands beyond the safe processing limit.",
                    code="xlsx_expansion_too_large",
                )
        wb = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
    except CSVImportError:
        raise
    except (zipfile.BadZipFile, Exception) as exc:
        raise CSVImportError(f"Malformed Excel file: {exc}", code="malformed_excel") from exc

    ws = wb.active
    if ws is None:
        raise CSVImportError("The Excel file contains no active sheet.", code="empty_excel")

    header_row_idx = -1
    raw_headers = None
    row_iterator = ws.iter_rows(values_only=True)
    for idx, row in enumerate(row_iterator, start=1):
        if any(v is not None and str(v).strip() for v in row):
            header_row_idx = idx
            raw_headers = [str(v).strip() if v is not None else "" for v in row]
            break

    if raw_headers is None or not any(raw_headers):
        raise CSVImportError("The Excel sheet must contain a header row.", code="missing_header")

    headers, source_map = _normalize_headers(raw_headers, allowed_fields=allowed_fields, aliases=aliases)

    rows: list[tuple[int, dict[str, str]]] = []
    for row_offset, row in enumerate(row_iterator, start=header_row_idx + 1):
        if not any(v is not None and str(v).strip() for v in row):
            continue

        row_dict: dict[str, str] = {}
        for original, canonical in source_map.items():
            try:
                col_idx = raw_headers.index(original)
                val = row[col_idx] if col_idx < len(row) else ""
            except ValueError:
                val = ""

            if val is None:
                val_str = ""
            elif isinstance(val, bool):
                val_str = "true" if val else "false"
            elif isinstance(val, (int, float)):
                if isinstance(val, float) and val.is_integer():
                    val_str = str(int(val))
                else:
                    val_str = str(val)
            elif isinstance(val, datetime):
                val_str = val.isoformat()
            else:
                val_str = str(val).strip()

            if len(val_str) > MAX_CELL_LENGTH:
                raise CSVImportError(
                    f"Row {row_offset}, field {canonical}, exceeds {MAX_CELL_LENGTH} characters.",
                    code="cell_too_long",
                )
            row_dict[canonical] = val_str

        if any(row_dict.values()):
            if len(rows) >= max_rows:
                raise CSVImportError(
                    f"Excel files may contain at most {max_rows} data rows.", code="too_many_rows"
                )
            rows.append((row_offset, row_dict))

    if not rows:
        raise CSVImportError("The Excel sheet contains no data rows.", code="empty_excel")

    wb.close()
    return headers, rows


def _read_csv(
    upload: Any,
    *,
    allowed_fields: frozenset[str],
    aliases: Mapping[str, str],
    max_rows: int,
) -> tuple[list[str], list[tuple[int, dict[str, str]]]]:
    if not isinstance(max_rows, int) or not 1 <= max_rows <= MAX_IMPORT_ROWS:
        raise CSVImportError(
            f"max_rows must be between 1 and {MAX_IMPORT_ROWS}.", code="invalid_row_limit"
        )
    if isinstance(upload, list):
        if not upload:
            raise CSVImportError("The rows array is empty.", code="empty_csv")
        if len(upload) > max_rows:
            raise CSVImportError(
                f"Imports may contain at most {max_rows} data rows.", code="too_many_rows"
            )
        if any(not isinstance(item, Mapping) for item in upload):
            raise CSVImportError("Every rows entry must be an object.", code="invalid_rows")
        fieldnames: list[str] = []
        for item in upload:
            for key in item:
                key = str(key)
                if key not in fieldnames:
                    fieldnames.append(key)
        headers, source_map = _normalize_headers(
            fieldnames,
            allowed_fields=allowed_fields,
            aliases=aliases,
        )
        rows: list[tuple[int, dict[str, str]]] = []
        for logical_row, source_row in enumerate(upload, start=2):
            row: dict[str, str] = {}
            for original, canonical in source_map.items():
                value = source_row.get(original, "")
                value = "" if value is None else str(value).strip()
                if len(value) > MAX_CELL_LENGTH:
                    raise CSVImportError(
                        f"Row {logical_row}, field {canonical}, exceeds {MAX_CELL_LENGTH} characters.",
                        code="cell_too_long",
                    )
                row[canonical] = value
            if any(row.values()):
                rows.append((logical_row, row))
        if not rows:
            raise CSVImportError("The rows array contains no data.", code="empty_csv")
        return headers, rows
    raw = _read_upload_bytes(upload)
    if raw.startswith(b"PK\x03\x04"):
        return _read_xlsx(
            raw,
            allowed_fields=allowed_fields,
            aliases=aliases,
            max_rows=max_rows,
        )
    text = None
    for enc in ("utf-8-sig", "cp1252", "latin-1"):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    if text is None:
        raise CSVImportError("CSV files must use UTF-8 or compatible encoding.", code="invalid_encoding")
    if "\x00" in text:
        raise CSVImportError("CSV files cannot contain NUL bytes.", code="invalid_content")

    try:
        reader = csv.DictReader(io.StringIO(text, newline=""), strict=True)
        if reader.fieldnames is None:
            raise CSVImportError("The CSV file must contain a header row.", code="missing_header")
        headers, source_map = _normalize_headers(reader.fieldnames, allowed_fields=allowed_fields, aliases=aliases)
        rows: list[tuple[int, dict[str, str]]] = []
        for logical_row, source_row in enumerate(reader, start=2):
            if None in source_row and source_row[None]:
                raise CSVImportError(
                    f"Row {logical_row} contains more columns than the header.", code="extra_columns"
                )
            row: dict[str, str] = {}
            for original, canonical in source_map.items():
                value = source_row.get(original, "")
                value = "" if value is None else str(value).strip()
                if len(value) > MAX_CELL_LENGTH:
                    raise CSVImportError(
                        f"Row {logical_row}, field {canonical}, exceeds {MAX_CELL_LENGTH} characters.",
                        code="cell_too_long",
                    )
                row[canonical] = value
            if any(row.values()):
                if len(rows) >= max_rows:
                    raise CSVImportError(
                        f"CSV files may contain at most {max_rows} data rows.", code="too_many_rows"
                    )
                rows.append((logical_row, row))
    except csv.Error as exc:
        raise CSVImportError(f"Malformed CSV data: {exc}", code="malformed_csv") from exc

    if not rows:
        raise CSVImportError("The CSV file contains no data rows.", code="empty_csv")
    return headers, rows


def _read_upload_bytes(upload: Any) -> bytes:
    if upload is None:
        raise CSVImportError("A CSV file is required.", code="missing_file")
    if isinstance(upload, str):
        data = upload.encode("utf-8")
    elif isinstance(upload, (bytes, bytearray, memoryview)):
        data = bytes(upload)
    else:
        size = getattr(upload, "size", None)
        if isinstance(size, int) and size > MAX_CSV_BYTES:
            raise CSVImportError("CSV files may not exceed 10 MiB.", code="file_too_large")
        if hasattr(upload, "chunks"):
            chunks: list[bytes] = []
            total = 0
            for chunk in upload.chunks():
                chunk = bytes(chunk)
                total += len(chunk)
                if total > MAX_CSV_BYTES:
                    raise CSVImportError("CSV files may not exceed 10 MiB.", code="file_too_large")
                chunks.append(chunk)
            data = b"".join(chunks)
        elif hasattr(upload, "read"):
            data = upload.read(MAX_CSV_BYTES + 1)
            if isinstance(data, str):
                data = data.encode("utf-8")
            data = bytes(data)
        else:
            raise CSVImportError("The uploaded object is not readable.", code="invalid_file")
    if len(data) > MAX_CSV_BYTES:
        raise CSVImportError("CSV files may not exceed 10 MiB.", code="file_too_large")
    if not data.strip():
        raise CSVImportError("The uploaded CSV file is empty.", code="empty_file")
    return data


def _normalize_headers(
    fieldnames: Sequence[str | None],
    *,
    allowed_fields: frozenset[str],
    aliases: Mapping[str, str],
) -> tuple[list[str], dict[str, str]]:
    headers: list[str] = []
    source_map: dict[str, str] = {}
    unknown: list[str] = []
    for raw in fieldnames:
        if raw is None or not str(raw).strip():
            raise CSVImportError("CSV header names cannot be blank.", code="blank_header")
        normalized = _HEADER_CLEAN_RE.sub("_", str(raw).strip().casefold()).strip("_")
        compact = normalized.replace("_", "")
        canonical = aliases.get(normalized, aliases.get(compact, normalized))
        if canonical not in allowed_fields:
            continue
        if canonical in headers:
            raise CSVImportError(
                f"More than one column maps to '{canonical}'.", code="duplicate_header"
            )
        headers.append(canonical)
        source_map[str(raw)] = canonical
    return headers, source_map


def _validate_identity_headers(headers: Sequence[str]) -> None:
    header_set = set(headers)
    if not header_set.intersection(_NAME_FIELDS) and "target_customer_id" not in header_set:
        raise CSVImportError(
            "Include at least one customer_name, company_name, or contact_person column.",
            code="missing_name_header",
        )


def _prepare_target_row(
    row: Mapping[str, str],
    *,
    target_list: TargetCustomerList,
    assigned_users: Mapping[str, Any],
    imported_at: datetime,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        field: row.get(field, "")
        for field in _TARGET_FIELDS
        if field not in {"assigned_to", "do_not_call", "priority", "tags"}
    }
    payload["phone"] = _normalized_phone(row.get("phone"))
    payload["whatsapp_number"] = _normalized_phone(row.get("whatsapp_number"))
    payload["email"] = _normalized_email(row.get("email"))
    payload["priority"] = _choice(row.get("priority"), _PRIORITIES, default="MEDIUM", field="priority")
    payload["tags"] = _parse_tags(row.get("tags"))
    payload["do_not_call"] = _required_bool(row.get("do_not_call"), default=False, field="do_not_call")
    payload["assigned_to"] = _assigned_user(row.get("assigned_to"), assigned_users)
    payload["source"] = payload.get("source") or target_list.source
    payload["imported_at"] = imported_at
    return payload


def _prepare_lead_row(
    row: Mapping[str, str],
    *,
    actor: Any,
    assigned_users: Mapping[str, Any],
    explicit_targets: Mapping[int, TargetCustomer],
    target_matches: Mapping[str, list[TargetCustomer]],
    imported_at: datetime,
) -> dict[str, Any]:
    target = None
    raw_target_id = str(row.get("target_customer_id") or "").strip()
    if raw_target_id:
        if not raw_target_id.isdigit() or int(raw_target_id) not in explicit_targets:
            raise ValidationError({"target_customer_id": "Target customer does not exist."})
        target = explicit_targets[int(raw_target_id)]
    else:
        possible_targets = _matches_for_contact(row, target_matches)
        if possible_targets:
            target = possible_targets[0]

    payload: dict[str, Any] = {
        field: row.get(field, "")
        for field in _LEAD_FIELDS
        if field
        not in {
            "target_customer_id",
            "assigned_to",
            "priority",
            "temperature",
            "lead_score",
            "estimated_value",
            "conversion_probability",
            "next_follow_up_at",
            "lead_type",
        }
    }
    payload["phone"] = _normalized_phone(row.get("phone"))
    payload["whatsapp_number"] = _normalized_phone(row.get("whatsapp_number"))
    payload["email"] = _normalized_email(row.get("email"))
    if target is not None:
        payload["target_customer"] = target
        for field in (
            "customer_name",
            "company_name",
            "contact_person",
            "phone",
            "whatsapp_number",
            "email",
            "address",
            "source",
        ):
            payload[field] = payload.get(field) or getattr(target, field, "")
        payload["product"] = payload.get("product") or target.interested_product
        payload["service"] = payload.get("service") or target.interested_service
        payload["priority"] = _choice(
            row.get("priority"), _PRIORITIES, default=target.priority or "MEDIUM", field="priority"
        )
    else:
        payload["priority"] = _choice(row.get("priority"), _PRIORITIES, default="MEDIUM", field="priority")

    lead_type = str(row.get("lead_type") or "").strip().upper()
    if not lead_type:
        if payload.get("product") and not payload.get("service"):
            lead_type = "PRODUCT"
        elif payload.get("service"):
            lead_type = "SERVICE"
    payload["lead_type"] = _choice(lead_type, _LEAD_TYPES, field="lead_type")
    payload["temperature"] = _choice(row.get("temperature"), _TEMPERATURES, default="COLD", field="temperature")
    payload["lead_score"] = _bounded_integer(row.get("lead_score"), default=0, field="lead_score")
    payload["conversion_probability"] = _bounded_integer(
        row.get("conversion_probability"), default=0, field="conversion_probability"
    )
    payload["estimated_value"] = _decimal(row.get("estimated_value"), field="estimated_value")
    payload["next_follow_up_at"] = _future_datetime(row.get("next_follow_up_at"))
    payload["assigned_to"] = _assigned_user(row.get("assigned_to"), assigned_users)
    payload["created_by"] = actor if getattr(actor, "is_authenticated", False) else None
    payload["last_activity_at"] = imported_at
    return payload


def _resolve_customer_list(value: TargetCustomerList | int) -> TargetCustomerList:
    if isinstance(value, TargetCustomerList):
        return value
    try:
        return TargetCustomerList.objects.get(pk=int(value))
    except (TargetCustomerList.DoesNotExist, TypeError, ValueError) as exc:
        raise CSVImportError("Target customer list does not exist.", code="invalid_customer_list") from exc


def _resolve_users(
    rows: Sequence[tuple[int, Mapping[str, str]]],
    *,
    queryset: QuerySet | None = None,
) -> dict[str, Any]:
    identifiers = {
        str(row.get("assigned_to") or "").strip()
        for _row_number, row in rows
        if str(row.get("assigned_to") or "").strip()
    }
    if not identifiers:
        return {}
    numeric_ids = {int(value) for value in identifiers if value.isdigit()}
    textual = {value.casefold() for value in identifiers if not value.isdigit()}
    query = Q(pk__in=numeric_ids)
    if textual:
        query |= Q(_username_lower__in=textual) | Q(_email_lower__in=textual)
    base_queryset = queryset if queryset is not None else get_user_model().objects.all()
    users = (
        base_queryset.annotate(
            _username_lower=Lower("username"),
            _email_lower=Lower("email"),
        )
        .filter(query, is_active=True)
    )
    result: dict[str, Any] = {}
    for user in users:
        result[str(user.pk)] = user
        result[str(user.username).casefold()] = user
        result[str(user.email).casefold()] = user
    return result


def _assigned_user(value: Any, users: Mapping[str, Any]) -> Any:
    identifier = str(value or "").strip()
    if not identifier:
        return None
    user = users.get(identifier) or users.get(identifier.casefold())
    if user is None:
        raise ValidationError({"assigned_to": "Assignee does not exist or is inactive."})
    return user


def _resolve_explicit_targets(
    rows: Sequence[tuple[int, Mapping[str, str]]],
    *,
    target_list: TargetCustomerList | None,
    queryset: QuerySet[TargetCustomer] | None = None,
) -> dict[int, TargetCustomer]:
    ids = {
        int(value)
        for _row_number, row in rows
        if (value := str(row.get("target_customer_id") or "").strip()).isdigit()
    }
    queryset = (queryset if queryset is not None else TargetCustomer.objects.all()).filter(pk__in=ids)
    if target_list is not None:
        queryset = queryset.filter(customer_list=target_list)
    return queryset.in_bulk()


def _matching_targets(
    rows: Sequence[tuple[int, Mapping[str, str]]],
    *,
    target_list: TargetCustomerList | None,
    queryset: QuerySet[TargetCustomer] | None = None,
) -> dict[str, list[TargetCustomer]]:
    phones, emails = _contact_values(row for _number, row in rows)
    if not phones and not emails:
        return {}
    query = Q(phone__in=phones) | Q(whatsapp_number__in=phones)
    queryset = (queryset if queryset is not None else TargetCustomer.objects.all()).annotate(_email_lower=Lower("email"))
    if emails:
        query |= Q(_email_lower__in=emails)
    queryset = queryset.filter(query).select_related("customer_list")
    if target_list is not None:
        queryset = queryset.filter(customer_list=target_list)
    return _contact_index(queryset)


def _target_duplicate_index(
    prepared: Sequence[Mapping[str, Any]],
    *,
    queryset: QuerySet[TargetCustomer] | None = None,
) -> dict[str, list[TargetCustomer]]:
    phones, emails = _contact_values(item["payload"] for item in prepared)
    if not phones and not emails:
        return {}
    query = Q(phone__in=phones) | Q(whatsapp_number__in=phones)
    queryset = (queryset if queryset is not None else TargetCustomer.objects.all()).annotate(_email_lower=Lower("email"))
    if emails:
        query |= Q(_email_lower__in=emails)
    return _contact_index(
        queryset.filter(query)
        .select_related(None)
        .only("id", "phone", "whatsapp_number", "email", "do_not_call")
    )


def _lead_duplicate_index(
    prepared: Sequence[Mapping[str, Any]],
    *,
    queryset: QuerySet[Lead] | None = None,
) -> dict[str, list[Lead]]:
    phones, emails = _contact_values(item["payload"] for item in prepared)
    if not phones and not emails:
        return {}
    query = Q(phone__in=phones) | Q(whatsapp_number__in=phones)
    queryset = (queryset if queryset is not None else Lead.objects.all()).annotate(_email_lower=Lower("email"))
    if emails:
        query |= Q(_email_lower__in=emails)
    return _contact_index(queryset.filter(query).only("id", "lead_number", "phone", "whatsapp_number", "email"))


def _contact_values(rows: Iterable[Mapping[str, Any]]) -> tuple[set[str], set[str]]:
    phones: set[str] = set()
    emails: set[str] = set()
    for row in rows:
        for field in ("phone", "whatsapp_number"):
            try:
                value = _normalized_phone(row.get(field))
            except ValidationError:
                continue
            if value:
                phones.add(value)
        try:
            email = _normalized_email(row.get("email"))
        except ValidationError:
            continue
        if email:
            emails.add(email)
    return phones, emails


def _contact_index(objects: Iterable[Any]) -> dict[str, list[Any]]:
    result: dict[str, list[Any]] = defaultdict(list)
    for obj in objects:
        for field in ("phone", "whatsapp_number"):
            try:
                value = _normalized_phone(getattr(obj, field, ""))
            except ValidationError:
                continue
            if value:
                result[f"phone:{value}"].append(obj)
        try:
            email = _normalized_email(getattr(obj, "email", ""))
        except ValidationError:
            email = ""
        if email:
            result[f"email:{email}"].append(obj)
    return result


def _matches_for_contact(row: Mapping[str, Any], index: Mapping[str, list[Any]]) -> list[Any]:
    matches: dict[int, Any] = {}
    for field in ("phone", "whatsapp_number"):
        try:
            phone = _normalized_phone(row.get(field))
        except ValidationError:
            phone = ""
        for obj in index.get(f"phone:{phone}", ()) if phone else ():
            matches[obj.pk] = obj
    try:
        email = _normalized_email(row.get("email"))
    except ValidationError:
        email = ""
    for obj in index.get(f"email:{email}", ()) if email else ():
        matches[obj.pk] = obj
    return [matches[key] for key in sorted(matches)]


def _deduplicate_targets(
    prepared: Sequence[dict[str, Any]],
    existing_index: Mapping[str, list[TargetCustomer]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], set[int], list[dict[str, Any]]]:
    accepted: list[dict[str, Any]] = []
    duplicates: list[dict[str, Any]] = []
    dnc_ids: set[int] = set()
    updated_records: list[dict[str, Any]] = []
    seen: dict[str, dict[str, Any]] = {}
    for item in prepared:
        payload = item["payload"]
        matches = _matches_for_contact(payload, existing_index)
        if matches:
            if payload.get("do_not_call"):
                dnc_ids.update(match.pk for match in matches)
                updated_records.append({
                    "row": item["row"],
                    "customer_name": (
                        payload.get("customer_name")
                        or payload.get("company_name")
                        or payload.get("contact_person")
                        or ""
                    ),
                    "phone": payload.get("phone") or payload.get("whatsapp_number") or "",
                    "email": payload.get("email") or "",
                })
            duplicates.append(_duplicate_report(item["row"], matches, reason="existing", row_data=payload))
            continue
        keys = _contact_keys(payload)
        earlier = next((seen[key] for key in keys if key in seen), None)
        if earlier is not None:
            # DNC is monotonic even for two rows representing the same contact.
            earlier["payload"]["do_not_call"] = bool(
                earlier["payload"].get("do_not_call") or payload.get("do_not_call")
            )
            name = (
                payload.get("customer_name")
                or payload.get("company_name")
                or payload.get("contact_person")
                or ""
            )
            duplicates.append(
                {
                    "row": item["row"],
                    "reason": "within_file",
                    "name": name,
                    "matches": [{"row": earlier["row"]}],
                }
            )
            continue
        accepted.append(item)
        for key in keys:
            seen[key] = item
    return accepted, duplicates, dnc_ids, updated_records


def _deduplicate_leads(
    prepared: Sequence[dict[str, Any]], existing_index: Mapping[str, list[Lead]]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    accepted: list[dict[str, Any]] = []
    duplicates: list[dict[str, Any]] = []
    seen: dict[str, dict[str, Any]] = {}
    for item in prepared:
        payload = item["payload"]
        matches = _matches_for_contact(payload, existing_index)
        if matches:
            duplicates.append(_duplicate_report(item["row"], matches, reason="existing", row_data=payload))
            continue
        keys = _contact_keys(payload)
        earlier = next((seen[key] for key in keys if key in seen), None)
        if earlier is not None:
            name = (
                payload.get("customer_name")
                or payload.get("company_name")
                or payload.get("contact_person")
                or ""
            )
            duplicates.append(
                {
                    "row": item["row"],
                    "reason": "within_file",
                    "name": name,
                    "matches": [{"row": earlier["row"]}],
                }
            )
            continue
        accepted.append(item)
        for key in keys:
            seen[key] = item
    return accepted, duplicates


def _contact_keys(payload: Mapping[str, Any]) -> list[str]:
    keys: list[str] = []
    for field in ("phone", "whatsapp_number"):
        value = str(payload.get(field) or "")
        if value:
            keys.append(f"phone:{value}")
    email = str(payload.get("email") or "").casefold()
    if email:
        keys.append(f"email:{email}")
    return keys


def _duplicate_report(row: int, matches: Sequence[Any], *, reason: str, row_data: dict | None = None) -> dict[str, Any]:
    serialized = []
    for match in matches:
        data = {"id": match.pk, "model": match._meta.model_name}
        if isinstance(match, Lead):
            data["lead_number"] = match.lead_number
            data["customer_name"] = match.customer_name or match.company_name or ""
        if isinstance(match, TargetCustomer):
            data["do_not_call"] = match.do_not_call
            data["customer_name"] = match.customer_name or match.company_name or ""
        serialized.append(data)
    result: dict[str, Any] = {"row": row, "reason": reason, "matches": serialized}
    if row_data:
        result["name"] = (
            row_data.get("customer_name")
            or row_data.get("company_name")
            or row_data.get("contact_person")
            or ""
        )
    return result


def _normalized_phone(value: Any) -> str:
    return normalize_phone(value) if str(value or "").strip() else ""


def _normalized_email(value: Any) -> str:
    email = str(value or "").strip().casefold()
    if not email:
        return ""
    validate_email(email)
    return email


def _choice(
    value: Any,
    allowed: frozenset[str],
    *,
    field: str,
    default: str | None = None,
) -> str:
    normalized = str(value or default or "").strip().upper()
    if normalized not in allowed:
        raise ValidationError({field: f"Choose a valid {field.replace('_', ' ')}."})
    return normalized


def _required_bool(value: Any, *, default: bool, field: str) -> bool:
    if value in (None, ""):
        return default
    if isinstance(value, bool):
        return value
    normalized = str(value).strip().casefold()
    if normalized in {"1", "true", "yes", "y", "on"}:
        return True
    if normalized in {"0", "false", "no", "n", "off"}:
        return False
    raise ValidationError({field: "Enter true or false."})


def _bounded_integer(value: Any, *, default: int, field: str) -> int:
    if value in (None, ""):
        return default
    
    val_str = str(value).strip()
    has_percent = "%" in val_str
    text = val_str.rstrip("%")
    
    try:
        val_float = float(text)
        if field == "conversion_probability" and not has_percent and 0.0 < val_float < 1.0:
            val_float *= 100
        parsed = int(round(val_float))
    except (TypeError, ValueError) as exc:
        raise ValidationError({field: "Enter a whole number."}) from exc
        
    if not 0 <= parsed <= 100:
        raise ValidationError({field: "Ensure this value is between 0 and 100."})
    return parsed


def _decimal(value: Any, *, field: str) -> Decimal | None:
    if value in (None, ""):
        return None
    try:
        parsed = Decimal(str(value).replace(",", "").strip())
    except (InvalidOperation, ValueError) as exc:
        raise ValidationError({field: "Enter a valid amount."}) from exc
    if not parsed.is_finite() or parsed < 0:
        raise ValidationError({field: "Amount must be a finite, non-negative number."})
    return parsed


def _future_datetime(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    parsed = parse_datetime(str(value).strip())
    if parsed is None:
        raise ValidationError({"next_follow_up_at": "Enter an ISO-8601 date and time."})
    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed, timezone.get_current_timezone())
    try:
        validate_future_datetime(parsed)
    except ValidationError as exc:
        raise ValidationError({"next_follow_up_at": exc.messages}) from exc
    return parsed


def _parse_tags(value: Any) -> list[str]:
    text = str(value or "").strip()
    if not text:
        return []
    if text.startswith("["):
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValidationError({"tags": "Tags must be a JSON array or semicolon-separated text."}) from exc
        if not isinstance(parsed, list):
            raise ValidationError({"tags": "Tags must be a JSON array."})
        tags = parsed
    else:
        tags = re.split(r"[;|]", text)
    normalized = []
    for tag in tags:
        tag = str(tag).strip()
        if tag and tag not in normalized:
            normalized.append(tag[:100])
    return normalized[:50]


def _row_errors(row: int, exc: Exception) -> list[dict[str, Any]]:
    if isinstance(exc, ValidationError) and hasattr(exc, "message_dict"):
        return [
            {"row": row, "field": field, "message": " ".join(str(message) for message in messages)}
            for field, messages in exc.message_dict.items()
        ]
    if isinstance(exc, ValidationError):
        return [{"row": row, "message": " ".join(exc.messages)}]
    return [{"row": row, "message": str(exc)}]


def _import_result(
    *,
    objects: Sequence[Any] = (),
    errors: Sequence[Mapping[str, Any]] = (),
    duplicates: Sequence[Mapping[str, Any]] = (),
    atomic: bool,
    do_not_call_preserved: int = 0,
    created_records: Sequence[Mapping[str, Any]] = (),
    updated_records: Sequence[Mapping[str, Any]] = (),
) -> dict[str, Any]:
    return {
        "created_count": len(objects),
        "duplicate_count": len(duplicates),
        "error_count": len(errors),
        "created_ids": [obj.pk for obj in objects if obj.pk is not None],
        "duplicates": list(duplicates),
        "errors": list(errors),
        "do_not_call_preserved": do_not_call_preserved,
        "atomic": atomic,
        "created_records": list(created_records),
        "updated_records": list(updated_records),
    }


def _emit_activity(
    hook: ActivityHook | bool | None,
    *,
    event: str,
    objects: Sequence[Any],
    actor: Any,
    metadata: Mapping[str, Any],
) -> None:
    if hook is False or not objects:
        return
    if callable(hook):
        hook(event=event, objects=objects, actor=actor, metadata=dict(metadata))
        return
    if event not in {"leads_imported", "leads_exported"}:
        return
    activity_type = "IMPORTED" if event == "leads_imported" else "EXPORTED"
    title = "Lead imported" if event == "leads_imported" else "Lead exported"
    activities = [
        LeadActivity(
            lead=lead,
            activity_type=activity_type,
            title=title,
            actor=actor if getattr(actor, "is_authenticated", False) else None,
            metadata={**metadata, "source": "csv"},
        )
        for lead in objects
        if isinstance(lead, Lead)
    ]
    LeadActivity.objects.bulk_create(activities, batch_size=500)


def _emit_audit(
    hook: AuditHook | bool | None,
    *,
    actor: Any,
    action: str,
    details: str,
    request: Any,
) -> None:
    if hook is False:
        return
    if callable(hook):
        hook(actor=actor, action=action, details=details, request=request)
        return
    # Lazy import avoids coupling model import order to the settings app.
    from utils.logging_helper import log_action

    log_action(
        actor if getattr(actor, "is_authenticated", False) else None,
        action,
        details,
        request,
    )


def _safe_csv_row(values: Iterable[Any]) -> list[str]:
    return [escape_csv_formula(_csv_value(value)) for value in values]


def _csv_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


def _excel_text_phone(phone: Any) -> str:
    """Format phone number so Excel treats it explicitly as text without 7.36E+09 scientific notation."""
    val = str(phone or "").strip()
    if not val:
        return ""
    if val.startswith("'"):
        return val
    return f"'{val}"


def _format_source(source: Any) -> str:
    val = str(source or "").strip()
    if not val:
        return ""
    return val.replace("_", " ").title()


def _format_currency(value: Any) -> str:
    if value in (None, ""):
        return ""
    try:
        val = Decimal(str(value))
        return f"{val:,.2f}"
    except Exception:
        return str(value)


def _format_datetime(value: datetime | None) -> str:
    if value is None:
        return ""
    if timezone.is_aware(value):
        value = timezone.localtime(value)
    return value.strftime("%Y-%m-%d %H:%M")


def _user_label(user: Any) -> str:
    if user is None:
        return ""
    return str(getattr(user, "fullname", "") or getattr(user, "username", "") or user)


# Compatibility aliases used by API/service layers with alternate verb order.
import_targets_csv = import_target_customers
import_leads_csv = import_leads
export_leads = export_leads_csv
export_target_customers = export_target_customers_csv

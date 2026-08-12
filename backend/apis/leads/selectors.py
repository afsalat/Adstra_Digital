"""Read-only query helpers for the lead-management domain.

The functions in this module deliberately accept already-scoped querysets as
well as users.  This keeps permission decisions in one place while allowing
API views to compose pagination, dashboard, and report queries without
repeating joins or accidentally widening the result set.
"""

from __future__ import annotations

from datetime import datetime, time, timedelta
from decimal import Decimal
from typing import Any, Iterable

from django.db.models import (
    Case,
    Count,
    DecimalField,
    ExpressionWrapper,
    F,
    IntegerField,
    Q,
    QuerySet,
    Sum,
    Value,
    When,
)
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime

from utils.permissions import has_permission

from .choices import (
    ACTIVE_LEAD_STAGES,
    FOLLOW_UP_STATUS_CHOICES,
    LEAD_STAGE_CHOICES,
    LEAD_TEMPERATURE_CHOICES,
    LEAD_TYPE_CHOICES,
    MEETING_STATUS_CHOICES,
    PRIORITY_CHOICES,
)
from .models import (
    Lead,
    LeadCall,
    LeadConversion,
    LeadFollowUp,
    LeadMeeting,
    LeadRejection,
    LeadTask,
)


_CHOICE_VALUES = {
    "current_stage": frozenset(value for value, _label in LEAD_STAGE_CHOICES),
    "lead_type": frozenset(value for value, _label in LEAD_TYPE_CHOICES),
    "priority": frozenset(value for value, _label in PRIORITY_CHOICES),
    "temperature": frozenset(value for value, _label in LEAD_TEMPERATURE_CHOICES),
}

_FILTER_ALIASES = {
    "stage": "current_stage",
    "stages": "current_stage",
    "type": "lead_type",
    "employee": "assigned_to_id",
    "employee_id": "assigned_to_id",
    "assigned_to": "assigned_to_id",
}

# Never pass a client-provided string to order_by.  Labels on the left are the
# public API and ORM paths on the right are reviewed, indexed where useful, and
# intentionally free of related to-many joins.
LEAD_ORDERING_FIELDS = {
    "lead_number": "lead_number",
    "customer_name": "customer_name",
    "company_name": "company_name",
    "lead_type": "lead_type",
    "stage": "current_stage",
    "current_stage": "current_stage",
    "priority": "priority",
    "temperature": "temperature",
    "lead_score": "lead_score",
    "estimated_value": "estimated_value",
    "conversion_probability": "conversion_probability",
    "next_follow_up_at": "next_follow_up_at",
    "last_activity_at": "last_activity_at",
    "created_at": "created_at",
    "updated_at": "updated_at",
}

_DATE_FIELDS = frozenset(
    {"created_at", "updated_at", "next_follow_up_at", "last_activity_at"}
)
_TRUE_VALUES = frozenset({"1", "true", "yes", "on"})
_FALSE_VALUES = frozenset({"0", "false", "no", "off"})
_TERMINAL_STAGES = frozenset({"CONVERTED", "REJECTED", "LOST"})


def optimized_lead_queryset(*, detail: bool = False) -> QuerySet[Lead]:
    """Return a lead queryset with all single-valued API relations joined.

    Detail-only to-many relations are prefetched explicitly.  List, dashboard,
    and report callers therefore do not pay for large timeline payloads.
    """

    queryset = Lead.objects.select_related(
        "target_customer",
        "target_customer__customer_list",
        "customer",
        "quotation",
        "quotation__client",
        "assigned_to",
        "assigned_by",
        "created_by",
        "conversion",
        "conversion__customer",
        "conversion__quotation",
        "conversion__invoice",
        "conversion__converted_by",
    )
    if detail:
        queryset = queryset.prefetch_related(
            "assignment_history",
            "calls",
            "follow_ups",
            "meetings",
            "demos",
            "service_requirements",
            "requirement_items",
            "cost_estimates",
            "tasks",
            "documents",
            "activities",
            "rejections",
        )
    return queryset


def lead_queryset_for(user: Any, *, detail: bool = False) -> QuerySet[Lead]:
    """Return an optimized queryset restricted to ``user``'s visibility.

    Managers/admins and explicit ``lead.view_all`` holders can see everything.
    Team leads can see records assigned to or created by members of their own
    department in addition to their own records.  Everybody else is restricted
    to leads assigned to or created by them.
    """

    queryset = optimized_lead_queryset(detail=detail)
    if not user or not getattr(user, "is_authenticated", False):
        return queryset.none()

    role = str(getattr(user, "role", "") or "").casefold()
    if role in {"admin", "super_admin", "manager"} or has_permission(
        user, "lead.view_all"
    ):
        return queryset

    own_scope = Q(assigned_to_id=user.pk) | Q(created_by_id=user.pk)
    is_team_lead = bool(getattr(user, "is_team_lead", False)) or role == "team_lead"
    department = str(getattr(user, "department", "") or "").strip()
    if is_team_lead and department:
        department_scope = Q(assigned_to__department__iexact=department) | Q(
            created_by__department__iexact=department
        )
        return queryset.filter(own_scope | department_scope).distinct()

    return queryset.filter(own_scope).distinct()


def my_profile_lead_queryset(user: Any, *, detail: bool = False) -> QuerySet[Lead]:
    """Return only leads assigned to ``user`` or unassigned leads created by ``user``.

    Leads assigned to other team members are excluded so the My Profile workspace
    strictly displays the user's own assigned work.
    """

    queryset = optimized_lead_queryset(detail=detail)
    if not user or not getattr(user, "is_authenticated", False):
        return queryset.none()
    return queryset.filter(
        Q(assigned_to_id=user.pk) | Q(assigned_to__isnull=True, created_by_id=user.pk)
    ).distinct()


def get_lead_queryset(
    user: Any,
    params: Any | None = None,
    *,
    detail: bool = False,
    now: datetime | None = None,
) -> QuerySet[Lead]:
    """Convenience wrapper combining permission scope and request filters."""

    queryset = lead_queryset_for(user, detail=detail)
    return apply_lead_filters(queryset, params, now=now) if params is not None else queryset


def apply_lead_filters(
    queryset: QuerySet[Lead],
    params: Any,
    *,
    now: datetime | None = None,
) -> QuerySet[Lead]:
    """Apply the supported lead list query parameters safely.

    Unknown and malformed values are ignored rather than becoming arbitrary ORM
    expressions.  API serializers may still reject them for better client
    feedback; this defensive layer guarantees the selector itself remains safe.
    """

    if not params:
        return queryset.order_by("-updated_at", "-id")

    now = now or timezone.now()
    filters = Q()

    for public_name, model_name in (
        ("stage", "current_stage"),
        ("current_stage", "current_stage"),
        ("lead_type", "lead_type"),
        ("priority", "priority"),
        ("temperature", "temperature"),
    ):
        values = _parameter_values(params, public_name)
        if not values:
            continue
        allowed = _CHOICE_VALUES[model_name]
        normalized = [value.upper() for value in values if value.upper() in allowed]
        if normalized:
            filters &= Q(**{f"{model_name}__in": normalized})

    for name in ("source", "campaign", "product", "service"):
        values = _parameter_values(params, name)
        if values:
            field_filter = Q()
            for value in values[:50]:
                field_filter |= Q(**{f"{name}__iexact": value[:255]})
            filters &= field_filter

    employee_values = _parameter_values(params, "employee")
    if not employee_values:
        employee_values = _parameter_values(params, "assigned_to")
    if employee_values:
        employee_filter = Q()
        employee_ids = [int(value) for value in employee_values if value.isdigit()]
        if employee_ids:
            employee_filter |= Q(assigned_to_id__in=employee_ids[:100])
        if any(value.casefold() in {"none", "null", "unassigned"} for value in employee_values):
            employee_filter |= Q(assigned_to__isnull=True)
        if employee_filter:
            filters &= employee_filter

    target_list_values = _parameter_values(params, "target_list") or _parameter_values(params, "customer_list")
    if target_list_values:
        target_list_filter = Q()
        target_ids = [int(v) for v in target_list_values if v.isdigit()]
        if target_ids:
            target_list_filter |= Q(target_customer__customer_list_id__in=target_ids[:100])
        if any(v.casefold() in {"none", "null", "direct", "unassigned"} for v in target_list_values):
            target_list_filter |= Q(target_customer__isnull=True)
        if target_list_filter:
            filters &= target_list_filter

    do_not_call = _parse_bool(_parameter(params, "do_not_call"))
    if do_not_call is not None:
        filters &= Q(target_customer__do_not_call=do_not_call)

    overdue = _parse_bool(_parameter(params, "overdue"))
    if overdue is True:
        filters &= Q(next_follow_up_at__lt=now) & Q(current_stage__in=ACTIVE_LEAD_STAGES)
    elif overdue is False:
        filters &= Q(next_follow_up_at__isnull=True) | Q(next_follow_up_at__gte=now)

    date_field = str(_parameter(params, "date_field") or "created_at")
    if date_field not in _DATE_FIELDS:
        date_field = "created_at"
    date_from = _parse_bound(
        _first_parameter(params, ("date_from", "created_from", "start_date")),
        upper=False,
    )
    date_to = _parse_bound(
        _first_parameter(params, ("date_to", "created_to", "end_date")),
        upper=True,
    )
    if date_from is not None:
        filters &= Q(**{f"{date_field}__gte": date_from})
    if date_to is not None:
        filters &= Q(**{f"{date_field}__lt": date_to})

    search = str(_parameter(params, "search") or "").strip()
    if search:
        search = search[:200]
        filters &= (
            Q(lead_number__icontains=search)
            | Q(customer_name__icontains=search)
            | Q(company_name__icontains=search)
            | Q(contact_person__icontains=search)
            | Q(phone__icontains=search)
            | Q(whatsapp_number__icontains=search)
            | Q(email__icontains=search)
            | Q(product__icontains=search)
            | Q(service__icontains=search)
            | Q(source__icontains=search)
            | Q(campaign__icontains=search)
        )

    ordering = _safe_ordering(_parameter(params, "ordering") or _parameter(params, "sort"))
    return queryset.filter(filters).order_by(*ordering)


def dashboard_summary(
    user_or_queryset: Any,
    params: Any | None = None,
    *,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Return permission-scoped dashboard cards and chart series.

    The number of queries is fixed regardless of how many leads are visible;
    related rows are aggregated in SQL instead of being traversed per lead.
    """

    now = now or timezone.now()
    queryset = _resolve_queryset(user_or_queryset, params=params, now=now)
    scoped = queryset.order_by()
    start, end = _local_day_bounds(now)
    related_scope = Q(lead__in=scoped.values("pk"))

    lead_cards = scoped.aggregate(
        total_leads=Count("pk"),
        new_leads=Count("pk", filter=Q(current_stage="NEW")),
        converted_leads=Count("pk", filter=Q(current_stage="CONVERTED")),
        rejected_leads=Count("pk", filter=Q(current_stage="REJECTED")),
        high_priority=Count("pk", filter=Q(priority__in={"HIGH", "CRITICAL"})),
        expected_pipeline_value=Coalesce(
            Sum("estimated_value", filter=Q(current_stage__in=ACTIVE_LEAD_STAGES)),
            Value(Decimal("0.00")),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
    )

    follow_up_cards = LeadFollowUp.objects.filter(related_scope).aggregate(
        follow_ups_due=Count(
            "pk",
            filter=Q(status="SCHEDULED", scheduled_at__gte=start, scheduled_at__lt=end),
        ),
        overdue_follow_ups=Count(
            "pk", filter=Q(status__in={"SCHEDULED", "OVERDUE"}, scheduled_at__lt=now)
        ),
        calls_due_today=Count(
            "pk",
            filter=Q(
                follow_up_type="PHONE",
                status="SCHEDULED",
                scheduled_at__gte=start,
                scheduled_at__lt=end,
            ),
        ),
    )
    call_cards = LeadCall.objects.filter(
        related_scope, started_at__gte=start, started_at__lt=end
    ).aggregate(completed_calls=Count("pk"))
    meeting_cards = LeadMeeting.objects.filter(related_scope).aggregate(
        meetings_today=Count(
            "pk",
            filter=Q(scheduled_start__gte=start, scheduled_start__lt=end)
            & ~Q(status="CANCELLED"),
        ),
        product_demos=Count(
            "pk",
            filter=Q(
                meeting_type="PRODUCT_DEMO",
                scheduled_start__gte=start,
                scheduled_start__lt=end,
            )
            & ~Q(status="CANCELLED"),
        ),
        requirement_meetings=Count(
            "pk",
            filter=Q(
                meeting_type__in={"CUSTOMIZATION_REQUIREMENT", "SERVICE_REQUIREMENT"},
                scheduled_start__gte=start,
                scheduled_start__lt=end,
            )
            & ~Q(status="CANCELLED"),
        ),
    )
    commercial_cards = scoped.aggregate(
        proposals_pending=Count(
            "pk", filter=Q(current_stage__in={"PROPOSAL_PREPARATION", "PROPOSAL_SENT"})
        ),
        quotations_pending=Count(
            "pk",
            filter=Q(current_stage__in={"QUOTATION_SENT", "NEGOTIATION", "DECISION_PENDING"}),
        ),
    )
    conversion_cards = LeadConversion.objects.filter(related_scope).aggregate(
        converted_revenue=Coalesce(
            Sum("final_value"),
            Value(Decimal("0.00")),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        )
    )

    cards = {
        **lead_cards,
        **follow_up_cards,
        **call_cards,
        **meeting_cards,
        **commercial_cards,
        **conversion_cards,
    }
    charts = {
        "leads_by_stage": list(
            scoped.values("current_stage")
            .annotate(count=Count("pk"))
            .order_by("current_stage")
        ),
        "leads_by_source": list(
            scoped.values("source").annotate(count=Count("pk")).order_by("-count", "source")[:20]
        ),
        "leads_by_type": list(
            scoped.values("lead_type").annotate(count=Count("pk")).order_by("lead_type")
        ),
        "pipeline_value_by_stage": list(
            scoped.values("current_stage")
            .annotate(
                count=Count("pk"),
                value=Coalesce(
                    Sum("estimated_value"),
                    Value(Decimal("0.00")),
                    output_field=DecimalField(max_digits=18, decimal_places=2),
                ),
            )
            .order_by("current_stage")
        ),
    }
    return {"cards": cards, "charts": charts, **cards}


def lead_reports(
    user_or_queryset: Any,
    params: Any | None = None,
    *,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Build the report datasets requested by the lead workspace."""

    now = now or timezone.now()
    queryset = _resolve_queryset(user_or_queryset, params=params, now=now).order_by()
    related_scope = Q(lead__in=queryset.values("pk"))
    decimal_output = DecimalField(max_digits=18, decimal_places=2)
    weighted_expression = ExpressionWrapper(
        Coalesce(F("estimated_value"), Value(Decimal("0.00")))
        * F("conversion_probability")
        / Value(100),
        output_field=decimal_output,
    )

    source = list(
        queryset.values("source")
        .annotate(count=Count("pk"), pipeline_value=Coalesce(Sum("estimated_value"), Value(Decimal("0.00")), output_field=decimal_output))
        .order_by("-count", "source")
    )
    campaign = list(
        queryset.values("campaign")
        .annotate(count=Count("pk"), pipeline_value=Coalesce(Sum("estimated_value"), Value(Decimal("0.00")), output_field=decimal_output))
        .order_by("-count", "campaign")
    )
    employee = list(
        queryset.values("assigned_to_id", "assigned_to__fullname", "assigned_to__username")
        .annotate(
            total=Count("pk"),
            converted=Count("pk", filter=Q(current_stage="CONVERTED")),
            rejected=Count("pk", filter=Q(current_stage="REJECTED")),
            pipeline_value=Coalesce(Sum("estimated_value"), Value(Decimal("0.00")), output_field=decimal_output),
        )
        .order_by("-converted", "-total")
    )
    offering = {
        "product": list(
            queryset.exclude(product="")
            .values("product")
            .annotate(count=Count("pk"), converted=Count("pk", filter=Q(current_stage="CONVERTED")))
            .order_by("-count", "product")
        ),
        "service": list(
            queryset.exclude(service="")
            .values("service")
            .annotate(count=Count("pk"), converted=Count("pk", filter=Q(current_stage="CONVERTED")))
            .order_by("-count", "service")
        ),
    }
    meetings = list(
        LeadMeeting.objects.filter(related_scope)
        .values("meeting_type", "status")
        .annotate(count=Count("pk"))
        .order_by("meeting_type", "status")
    )
    telecaller = list(
        LeadCall.objects.filter(related_scope)
        .values("caller_id", "caller__fullname", "caller__username")
        .annotate(total_calls=Count("pk"), connected_calls=Count("pk", filter=Q(outcome="CONNECTED")))
        .order_by("-total_calls")
    )
    conversion = list(
        LeadConversion.objects.filter(related_scope)
        .values("conversion_type")
        .annotate(count=Count("pk"), revenue=Coalesce(Sum("final_value"), Value(Decimal("0.00")), output_field=decimal_output))
        .order_by("conversion_type")
    )
    monthly_conversion_trend = list(
        LeadConversion.objects.filter(related_scope)
        .annotate(month=TruncMonth("converted_at"))
        .values("month")
        .annotate(count=Count("pk"), revenue=Coalesce(Sum("final_value"), Value(Decimal("0.00")), output_field=decimal_output))
        .order_by("month")
    )
    rejection = list(
        LeadRejection.objects.filter(related_scope)
        .values("reason")
        .annotate(count=Count("pk"))
        .order_by("-count", "reason")
    )
    pipeline = list(
        queryset.values("current_stage")
        .annotate(
            count=Count("pk"),
            value=Coalesce(Sum("estimated_value"), Value(Decimal("0.00")), output_field=decimal_output),
            expected_revenue=Coalesce(Sum(weighted_expression), Value(Decimal("0.00")), output_field=decimal_output),
        )
        .order_by("current_stage")
    )
    ageing = queryset.aggregate(
        days_0_7=Count("pk", filter=Q(created_at__gte=now - timedelta(days=7))),
        days_8_30=Count("pk", filter=Q(created_at__lt=now - timedelta(days=7), created_at__gte=now - timedelta(days=30))),
        days_31_60=Count("pk", filter=Q(created_at__lt=now - timedelta(days=30), created_at__gte=now - timedelta(days=60))),
        days_61_90=Count("pk", filter=Q(created_at__lt=now - timedelta(days=60), created_at__gte=now - timedelta(days=90))),
        days_91_plus=Count("pk", filter=Q(created_at__lt=now - timedelta(days=90))),
    )
    expected_revenue = queryset.filter(current_stage__in=ACTIVE_LEAD_STAGES).aggregate(
        value=Coalesce(Sum(weighted_expression), Value(Decimal("0.00")), output_field=decimal_output)
    )["value"]

    return {
        "lead_source": source,
        "campaign": campaign,
        "employee": employee,
        "telecaller": telecaller,
        "product": offering["product"],
        "service": offering["service"],
        "meeting": meetings,
        "conversion": conversion,
        "monthly_conversion_trend": monthly_conversion_trend,
        "rejection": rejection,
        "lead_ageing": ageing,
        "pipeline": pipeline,
        "expected_revenue": expected_revenue,
    }


def _resolve_queryset(
    user_or_queryset: Any,
    *,
    params: Any | None,
    now: datetime,
) -> QuerySet[Lead]:
    if isinstance(user_or_queryset, QuerySet):
        queryset = user_or_queryset
        if queryset.model is not Lead:
            raise TypeError("A Lead queryset is required.")
        return apply_lead_filters(queryset, params, now=now) if params else queryset
    return get_lead_queryset(user_or_queryset, params=params, now=now)


def _parameter(params: Any, name: str) -> Any:
    getter = getattr(params, "get", None)
    if getter is None:
        return None
    try:
        return getter(name)
    except (KeyError, TypeError):
        return None


def _first_parameter(params: Any, names: Iterable[str]) -> Any:
    for name in names:
        value = _parameter(params, name)
        if value not in (None, ""):
            return value
    return None


def _parameter_values(params: Any, name: str) -> list[str]:
    values: list[Any]
    getlist = getattr(params, "getlist", None)
    if getlist is not None:
        values = list(getlist(name))
    else:
        value = _parameter(params, name)
        values = value if isinstance(value, (list, tuple, set)) else [value]

    result: list[str] = []
    for value in values:
        if value is None:
            continue
        for item in str(value).split(","):
            item = item.strip()
            if item:
                result.append(item)
    return result


def _parse_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    normalized = str(value or "").strip().casefold()
    if normalized in _TRUE_VALUES:
        return True
    if normalized in _FALSE_VALUES:
        return False
    return None


def _parse_bound(value: Any, *, upper: bool) -> datetime | None:
    if value in (None, ""):
        return None
    text = str(value).strip()
    parsed_datetime = parse_datetime(text)
    if parsed_datetime is not None:
        if timezone.is_naive(parsed_datetime):
            parsed_datetime = timezone.make_aware(parsed_datetime, timezone.get_current_timezone())
        return parsed_datetime

    parsed_date = parse_date(text)
    if parsed_date is None:
        return None
    if upper:
        parsed_date += timedelta(days=1)
    parsed = datetime.combine(parsed_date, time.min)
    return timezone.make_aware(parsed, timezone.get_current_timezone())


def _safe_ordering(raw: Any) -> tuple[str, ...]:
    requested = str(raw or "-updated_at").split(",")[:3]
    ordering: list[str] = []
    for item in requested:
        item = item.strip()
        descending = item.startswith("-")
        public_name = item[1:] if descending else item
        model_name = LEAD_ORDERING_FIELDS.get(public_name)
        if model_name:
            ordering.append(f"-{model_name}" if descending else model_name)
    if not ordering:
        ordering = ["-updated_at"]
    if "id" not in {item.lstrip("-") for item in ordering}:
        ordering.append("-id")
    return tuple(ordering)


def _local_day_bounds(now: datetime) -> tuple[datetime, datetime]:
    local_now = timezone.localtime(now) if timezone.is_aware(now) else now
    start = datetime.combine(local_now.date(), time.min)
    if timezone.is_aware(now):
        start = timezone.make_aware(start, timezone.get_current_timezone())
    return start, start + timedelta(days=1)


# Small compatibility aliases for callers that use noun-first naming.
scope_leads_for_user = lead_queryset_for
filter_leads = apply_lead_filters
get_dashboard_summary = dashboard_summary
get_lead_reports = lead_reports

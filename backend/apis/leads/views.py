import csv
import io
import logging
from decimal import Decimal
from datetime import datetime, timedelta
from pathlib import Path

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Count, Prefetch, Q, Sum
from django.db.models.functions import TruncDate
from django.http import FileResponse, Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.negotiation import DefaultContentNegotiation
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apis.proposal.serializers import ProposalSerializer
from utils.logging_helper import log_action
from utils.permissions import has_permission, permission_denied, require_permission

from .models import (
    Lead,
    LeadActivity,
    LeadCall,
    LeadConversion,
    LeadCostEstimate,
    LeadDocument,
    LeadFollowUp,
    LeadMeeting,
    LeadRequirementItem,
    LeadTask,
    ServiceRequirement,
    TargetCustomer,
    TargetCustomerList,
)
from .choices import ACTIVITY_TYPE_CHOICES, LEAD_STAGE_CHOICES
from .pagination import LeadPagination
from .selectors import (
    apply_lead_filters,
    dashboard_summary,
    lead_queryset_for,
    lead_reports,
    my_profile_lead_queryset,
)
from .import_export import (
    CSVImportError,
    export_employee_excel,
    export_leads_csv,
    export_leads_excel,
    export_target_customers_csv,
    export_target_customers_excel,
    import_leads,
    import_target_customers,
)
from .validators import sanitize_filename
from .serializers import (
    LeadActivitySerializer,
    LeadAssignmentActionSerializer,
    LeadCallSerializer,
    LeadConversionSerializer,
    LeadConvertSerializer,
    LeadCostEstimateSerializer,
    LeadDocumentSerializer,
    LeadFollowUpSerializer,
    LeadImportActionSerializer,
    LeadMeetingSerializer,
    LeadRejectSerializer,
    LeadRejectionSerializer,
    LeadReopenSerializer,
    LeadRequirementItemSerializer,
    LeadSerializer,
    LeadTaskSerializer,
    LeadTransitionSerializer,
    ProductDemoSerializer,
    ServiceRequirementSerializer,
    TargetCustomerListSerializer,
    TargetCustomerSerializer,
)
from .services import (
    DuplicateCustomerError,
    LeadAssignmentService,
    LeadConversionService,
    LeadDemoService,
    LeadQuotationService,
    LeadRejectionService,
    LeadReopenService,
    LeadWorkflowService,
)


logger = logging.getLogger(__name__)


def _validation_payload(exc):
    if hasattr(exc, "message_dict"):
        return {"errors": exc.message_dict}
    return {"errors": getattr(exc, "messages", [str(exc)])}


def _service_error(exc):
    if isinstance(exc, PermissionDenied):
        return Response({"error": str(exc.detail)}, status=status.HTTP_403_FORBIDDEN)
    return Response(_validation_payload(exc), status=status.HTTP_400_BAD_REQUEST)


def _check_view_permission(request):
    if has_permission(request.user, "lead.view_all") or has_permission(request.user, "lead.view_own"):
        return None
    return require_permission(request, "lead.view_own")


def _lead_for_user(request, pk):
    return get_object_or_404(lead_queryset_for(request.user), pk=pk)


def _target_list_queryset(user):
    queryset = TargetCustomerList.objects.select_related("created_by").prefetch_related("customers")
    if has_permission(user, "lead.view_all"):
        return queryset
    if has_permission(user, "lead.view_own"):
        return queryset.filter(Q(created_by=user) | Q(customers__assigned_to=user)).distinct()
    return queryset.none()


def _target_customer_queryset(user):
    queryset = TargetCustomer.objects.select_related("customer_list", "assigned_to", "customer_list__created_by")
    if has_permission(user, "lead.view_all"):
        return queryset
    if has_permission(user, "lead.view_own"):
        return queryset.filter(Q(assigned_to=user) | Q(customer_list__created_by=user)).distinct()
    return queryset.none()


def _paginated_response(request, queryset, serializer_class):
    paginator = LeadPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(page, many=True, context={"request": request})
    return paginator.get_paginated_response(serializer.data)


def _rows_as_csv(rows):
    headers = []
    for row in rows:
        if not isinstance(row, dict):
            raise CSVImportError("Every imported row must be an object.", code="invalid_rows")
        for key in row:
            if key not in headers:
                headers.append(str(key))
    if not headers:
        raise CSVImportError("No import rows were supplied.", code="empty_rows")
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=headers, extrasaction="ignore", lineterminator="\r\n")
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_list_create(request):
    if request.method == "GET":
        denial = _check_view_permission(request)
        if denial:
            return denial
        queryset = apply_lead_filters(lead_queryset_for(request.user), request.query_params).prefetch_related(
            Prefetch(
                "follow_ups",
                queryset=LeadFollowUp.objects.select_related("assigned_to", "created_by").order_by(
                    "-completed_at",
                    "-scheduled_at",
                    "-created_at",
                    "-id",
                ),
            )
        )
        return _paginated_response(request, queryset, LeadSerializer)

    denial = require_permission(request, "lead.create")
    if denial:
        return denial
    for permission_code in ("lead.assign", "lead.reassign"):
        denial = require_permission(request, permission_code)
        if denial:
            return denial
    serializer = LeadSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        lead = serializer.save(created_by=request.user)
        LeadActivity.objects.create(
            lead=lead,
            activity_type="CREATED",
            title="Lead created",
            actor=request.user,
            metadata={"source": lead.source},
        )
        log_action(request.user, "Lead Created", lead.lead_number, request)
    return Response(LeadSerializer(lead, context={"request": request}).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def lead_detail(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        return Response(LeadSerializer(lead, context={"request": request}).data)
    if request.method == "DELETE":
        denial = require_permission(request, "lead.delete")
        if denial:
            return denial
        if lead.current_stage in {"CONVERTED", "REJECTED", "LOST"}:
            return Response(
                {"error": "Closed leads cannot be deleted. Retain them for audit history."},
                status=status.HTTP_409_CONFLICT,
            )
        log_action(request.user, "Lead Deleted", lead.lead_number, request)
        lead.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    denial = require_permission(request, "lead.edit")
    if denial:
        return denial
    serializer = LeadSerializer(
        lead,
        data=request.data,
        partial=request.method == "PATCH",
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        updated = serializer.save()
        LeadActivity.objects.create(
            lead=updated,
            activity_type="UPDATED",
            title="Lead details updated",
            actor=request.user,
        )
    return Response(LeadSerializer(updated, context={"request": request}).data)


def _assignment_action(request, pk, force_reassign=False):
    lead = _lead_for_user(request, pk)
    serializer = LeadAssignmentActionSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    try:
        assigned_to = serializer.validated_data["assigned_to"]
        reason = serializer.validated_data.get("reason", "")
        if force_reassign and lead.assigned_to_id is None:
            return Response({"error": "Use assign for an unassigned lead."}, status=status.HTTP_400_BAD_REQUEST)
        lead = LeadAssignmentService.assign(lead, assigned_to, request.user, reason=reason, request=request)
    except (DjangoValidationError, PermissionDenied) as exc:
        return _service_error(exc)
    return Response(LeadSerializer(lead, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_lead(request, pk):
    return _assignment_action(request, pk)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reassign_lead(request, pk):
    return _assignment_action(request, pk, force_reassign=True)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def qualify_lead(request, pk):
    lead = _lead_for_user(request, pk)
    try:
        lead = LeadWorkflowService.transition(
            lead,
            "QUALIFIED",
            request.user,
            reason=request.data.get("reason", "Lead qualified"),
            request=request,
        )
    except (DjangoValidationError, PermissionDenied) as exc:
        return _service_error(exc)
    return Response(LeadSerializer(lead, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def transition_lead(request, pk):
    lead = _lead_for_user(request, pk)
    serializer = LeadTransitionSerializer(data=request.data, context={"lead": lead, "request": request})
    serializer.is_valid(raise_exception=True)
    try:
        lead = LeadWorkflowService.transition(
            lead,
            serializer.validated_data["target_stage"],
            request.user,
            reason=serializer.validated_data.get("reason", ""),
            request=request,
        )
    except (DjangoValidationError, PermissionDenied) as exc:
        return _service_error(exc)
    return Response(LeadSerializer(lead, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_lead(request, pk):
    lead = _lead_for_user(request, pk)
    serializer = LeadRejectSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    try:
        rejection = LeadRejectionService.reject(lead, request.user, request=request, **serializer.validated_data)
    except (DjangoValidationError, PermissionDenied) as exc:
        return _service_error(exc)
    return Response(LeadRejectionSerializer(rejection).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reopen_lead(request, pk):
    lead = _lead_for_user(request, pk)
    serializer = LeadReopenSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        lead = LeadReopenService.reopen(
            lead,
            request.user,
            reason=serializer.validated_data["reason"],
            request=request,
        )
    except (DjangoValidationError, PermissionDenied) as exc:
        return _service_error(exc)
    return Response(LeadSerializer(lead, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def convert_lead(request, pk):
    lead = _lead_for_user(request, pk)
    serializer = LeadConvertSerializer(data=request.data, context={"lead": lead, "request": request})
    serializer.is_valid(raise_exception=True)
    try:
        conversion = LeadConversionService.convert(
            lead,
            request.user,
            data=serializer.validated_data,
            request=request,
        )
    except DuplicateCustomerError as exc:
        return Response(
            {"error": exc.messages[0], "possible_duplicates": exc.candidates},
            status=status.HTTP_409_CONFLICT,
        )
    except (DjangoValidationError, PermissionDenied) as exc:
        return _service_error(exc)
    return Response(LeadConversionSerializer(conversion).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lead_timeline(request, pk):
    lead = _lead_for_user(request, pk)
    return _paginated_response(request, lead.activities.select_related("actor").all(), LeadActivitySerializer)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_calls(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        return _paginated_response(request, lead.calls.select_related("caller").all(), LeadCallSerializer)
    denial = require_permission(request, "lead.call")
    if denial:
        return denial
    serializer = LeadCallSerializer(data=request.data, context={"request": request, "lead": lead})
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        call = serializer.save(lead=lead, caller=request.user)
        if call.follow_up_required and call.follow_up_at:
            follow_up = LeadFollowUp(
                lead=lead,
                follow_up_type="PHONE",
                scheduled_at=call.follow_up_at,
                purpose="Follow up after recorded call",
                notes=call.discussion_summary or "Follow-up required after call",
                created_by=request.user,
                assigned_to=lead.assigned_to or request.user,
            )
            follow_up.full_clean()
            follow_up.save()
            Lead.objects.filter(pk=lead.pk).update(next_follow_up_at=call.follow_up_at)

        LeadActivity.objects.create(
            lead=lead,
            activity_type="CALL",
            title=f"Call recorded: {call.outcome}",
            description=call.discussion_summary,
            actor=request.user,
            metadata={"call_id": call.id, "outcome": call.outcome},
        )
        try:
            if lead.current_stage == "ASSIGNED":
                lead = LeadWorkflowService.transition(lead, "CONTACT_ATTEMPTED", request.user, request=request)
            connected_outcomes = {"CONNECTED", "INTERESTED", "DEMO_REQUESTED", "MEETING_REQUESTED"}
            if lead.current_stage == "CONTACT_ATTEMPTED" and call.outcome in connected_outcomes:
                LeadWorkflowService.transition(lead, "CONNECTED", request.user, request=request)
            elif lead.current_stage == "CONTACT_ATTEMPTED" and call.follow_up_required:
                LeadWorkflowService.transition(lead, "FOLLOW_UP_REQUIRED", request.user, request=request)
        except DjangoValidationError:
            logger.info("Call saved without automatic workflow transition for lead %s", lead.pk)
    return Response(LeadCallSerializer(call).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_follow_ups(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        return _paginated_response(request, lead.follow_ups.select_related("assigned_to", "created_by").all(), LeadFollowUpSerializer)
    denial = require_permission(request, "lead.follow_up")
    if denial:
        return denial
    existing = get_object_or_404(lead.follow_ups, pk=request.data["id"]) if request.data.get("id") else None
    serializer = LeadFollowUpSerializer(
        existing,
        data=request.data,
        partial=existing is not None,
        context={"request": request, "lead": lead},
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        completed_at = None
        if serializer.validated_data.get("status") == "COMPLETED" and not (existing and existing.completed_at):
            completed_at = timezone.now()
        follow_up = serializer.save(
            lead=lead,
            created_by=existing.created_by if existing else request.user,
            assigned_to=(
                serializer.validated_data.get("assigned_to")
                or (existing.assigned_to if existing else None)
                or lead.assigned_to
                or request.user
            ),
            **({"completed_at": completed_at} if completed_at else {}),
        )
        next_at = follow_up.next_follow_up_at or (
            follow_up.scheduled_at if follow_up.status == "SCHEDULED" else None
        )
        Lead.objects.filter(pk=lead.pk).update(next_follow_up_at=next_at)
        LeadActivity.objects.create(
            lead=lead,
            activity_type="FOLLOW_UP",
            title=f"{follow_up.follow_up_type} follow-up scheduled",
            actor=request.user,
            metadata={"follow_up_id": follow_up.id, "scheduled_at": follow_up.scheduled_at.isoformat()},
        )
    return Response(
        LeadFollowUpSerializer(follow_up).data,
        status=status.HTTP_200_OK if existing else status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_meetings(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        return _paginated_response(request, lead.meetings.select_related("assigned_to", "created_by").all(), LeadMeetingSerializer)
    denial = require_permission(request, "lead.schedule_meeting")
    if denial:
        return denial
    existing = get_object_or_404(lead.meetings, pk=request.data["id"]) if request.data.get("id") else None
    serializer = LeadMeetingSerializer(
        existing,
        data=request.data,
        partial=existing is not None,
        context={"request": request, "lead": lead},
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        meeting = serializer.save(
            lead=lead,
            created_by=existing.created_by if existing else request.user,
            assigned_to=(
                serializer.validated_data.get("assigned_to")
                or (existing.assigned_to if existing else None)
                or lead.assigned_to
                or request.user
            ),
        )
        LeadActivity.objects.create(
            lead=lead,
            activity_type="MEETING",
            title=f"{meeting.meeting_type} meeting scheduled",
            actor=request.user,
            metadata={"meeting_id": meeting.id},
        )
        try:
            if existing is None and lead.current_stage == "QUALIFIED" and meeting.meeting_type == "PRODUCT_DEMO":
                LeadWorkflowService.transition(lead, "DEMO_SCHEDULED", request.user, request=request)
            elif existing is None and lead.current_stage in {"QUALIFIED", "CUSTOMIZATION_REQUIRED"} and meeting.meeting_type in {
                "SERVICE_REQUIREMENT", "CUSTOMIZATION_REQUIREMENT"
            }:
                LeadWorkflowService.transition(lead, "REQUIREMENT_MEETING_SCHEDULED", request.user, request=request)
        except DjangoValidationError:
            logger.info("Meeting saved without automatic workflow transition for lead %s", lead.pk)
    return Response(
        LeadMeetingSerializer(meeting).data,
        status=status.HTTP_200_OK if existing else status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_demo(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        demos = lead.demos.select_related("meeting", "presented_by").all()
        return Response(ProductDemoSerializer(demos, many=True).data)
    denial = require_permission(request, "lead.complete_demo")
    if denial:
        return denial
    existing = None
    if request.data.get("id"):
        existing = get_object_or_404(lead.demos, pk=request.data["id"])
    serializer = ProductDemoSerializer(
        existing,
        data=request.data,
        partial=existing is not None,
        context={"request": request, "lead": lead},
    )
    serializer.is_valid(raise_exception=True)
    is_first_completion = bool(serializer.validated_data.get("completed_at")) and not (
        existing and existing.completed_at
    )
    if is_first_completion and lead.current_stage != "DEMO_SCHEDULED":
        return Response(
            {"error": "A demo can only be completed from the DEMO_SCHEDULED stage."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    with transaction.atomic():
        save_values = {
            "lead": lead,
            "presented_by": serializer.validated_data.get("presented_by") or request.user,
        }
        if is_first_completion:
            save_values["completed_at"] = None
        demo = serializer.save(**save_values)
        LeadActivity.objects.create(
            lead=lead,
            activity_type="DEMO",
            title="Product demo recorded",
            actor=request.user,
            metadata={"demo_id": demo.id, "outcome": demo.outcome},
        )
        if is_first_completion or demo.completed_at:
            demo = LeadDemoService.complete(demo, request.user, request=request)
    return Response(ProductDemoSerializer(demo).data, status=status.HTTP_201_CREATED if existing is None else status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_requirements(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        requirements = lead.service_requirements.select_related("meeting", "created_by").prefetch_related("items")
        items = lead.requirement_items.select_related("requirement")
        return Response({
            "requirements": ServiceRequirementSerializer(requirements, many=True).data,
            "items": LeadRequirementItemSerializer(items, many=True).data,
        })
    denial = require_permission(request, "lead.capture_requirement")
    if denial:
        return denial
    is_item = str(request.data.get("kind", "")).lower() == "item"
    serializer_class = LeadRequirementItemSerializer if is_item else ServiceRequirementSerializer
    source_queryset = lead.requirement_items if is_item else lead.service_requirements
    existing = get_object_or_404(source_queryset, pk=request.data["id"]) if request.data.get("id") else None
    serializer = serializer_class(
        existing,
        data=request.data,
        partial=existing is not None,
        context={"request": request, "lead": lead},
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        if is_item:
            instance = serializer.save(lead=lead)
        else:
            instance = serializer.save(lead=lead, created_by=existing.created_by if existing else request.user)
        LeadActivity.objects.create(
            lead=lead,
            activity_type="REQUIREMENT",
            title="Requirement item captured" if is_item else "Requirement captured",
            actor=request.user,
            metadata={"requirement_id": instance.id, "kind": "item" if is_item else "requirement"},
        )
        if (
            not is_item
            and instance.requirement_status in {"COLLECTED", "APPROVED", "COMPLETED"}
            and lead.current_stage == "REQUIREMENT_MEETING_SCHEDULED"
        ):
            LeadWorkflowService.transition(lead, "REQUIREMENT_COLLECTED", request.user, request=request)
    return Response(
        serializer_class(instance).data,
        status=status.HTTP_200_OK if existing else status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_cost_estimates(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        return Response(LeadCostEstimateSerializer(lead.cost_estimates.select_related("prepared_by", "approved_by"), many=True).data)
    denial = require_permission(request, "lead.create_cost_estimate")
    if denial:
        return denial
    requested_approval_status = request.data.get("approval_status")
    approving = requested_approval_status == "APPROVED"
    if requested_approval_status in {"APPROVED", "REJECTED", "REVISION_REQUIRED"}:
        denial = require_permission(request, "lead.approve_cost_estimate")
        if denial:
            return denial
    existing = get_object_or_404(lead.cost_estimates, pk=request.data["id"]) if request.data.get("id") else None
    serializer = LeadCostEstimateSerializer(
        existing,
        data=request.data,
        partial=existing is not None,
        context={"request": request, "lead": lead},
    )
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        estimate = serializer.save(
            lead=lead,
            prepared_by=existing.prepared_by if existing else request.user,
            approved_by=request.user if approving else (existing.approved_by if existing else None),
            approved_at=timezone.now() if approving else (existing.approved_at if existing else None),
        )
        LeadActivity.objects.create(
            lead=lead,
            activity_type="APPROVAL" if approving else "COST_ESTIMATE",
            title="Cost estimate approved" if approving else "Cost estimate created",
            actor=request.user,
            metadata={"estimate_id": estimate.id, "amount": str(estimate.final_amount)},
        )
    return Response(
        LeadCostEstimateSerializer(estimate).data,
        status=status.HTTP_200_OK if existing else status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_tasks(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        return _paginated_response(request, lead.tasks.select_related("assigned_to", "created_by"), LeadTaskSerializer)
    denial = require_permission(request, "lead.edit")
    if denial:
        return denial
    existing = get_object_or_404(lead.tasks, pk=request.data["id"]) if request.data.get("id") else None
    serializer = LeadTaskSerializer(
        existing,
        data=request.data,
        partial=existing is not None,
        context={"request": request, "lead": lead},
    )
    serializer.is_valid(raise_exception=True)
    task = serializer.save(
        lead=lead,
        created_by=existing.created_by if existing else request.user,
        assigned_to=(
            serializer.validated_data.get("assigned_to")
            or (existing.assigned_to if existing else None)
            or lead.assigned_to
            or request.user
        ),
    )
    LeadActivity.objects.create(
        lead=lead,
        activity_type="TASK",
        title=f"Task created: {task.title}",
        actor=request.user,
        metadata={"task_id": task.id},
    )
    return Response(
        LeadTaskSerializer(task).data,
        status=status.HTTP_200_OK if existing else status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def lead_documents(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        return Response(LeadDocumentSerializer(lead.documents.select_related("uploaded_by"), many=True).data)
    denial = require_permission(request, "lead.edit")
    if denial:
        return denial
    serializer = LeadDocumentSerializer(data=request.data, context={"request": request, "lead": lead})
    serializer.is_valid(raise_exception=True)
    document = serializer.save(lead=lead, uploaded_by=request.user)
    LeadActivity.objects.create(
        lead=lead,
        activity_type="DOCUMENT",
        title=f"Document uploaded: {document.title}",
        actor=request.user,
        metadata={"document_id": document.id, "document_type": document.document_type},
    )
    log_action(request.user, "Lead Document Uploaded", f"{lead.lead_number}: document {document.id}", request)
    return Response(LeadDocumentSerializer(document).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_lead_document(request, pk, document_id):
    lead = _lead_for_user(request, pk)
    document = get_object_or_404(lead.documents, pk=document_id)
    try:
        file_handle = document.file.open("rb")
    except (FileNotFoundError, OSError) as exc:
        raise Http404("Document file not found.") from exc
    suffix = Path(document.file.name).suffix.lower()
    safe_download_name = sanitize_filename(document.title)
    if Path(safe_download_name).suffix.lower() != suffix:
        safe_download_name = f"{safe_download_name}{suffix}"
    response = FileResponse(
        file_handle,
        as_attachment=True,
        filename=safe_download_name,
    )
    response["X-Content-Type-Options"] = "nosniff"
    response["Cache-Control"] = "private, no-store"
    return response


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_quotation(request, pk):
    lead = _lead_for_user(request, pk)
    if request.method == "GET":
        if not lead.quotation_id:
            return Response({"detail": "No quotation has been created."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProposalSerializer(lead.quotation).data)
    try:
        proposal = LeadQuotationService.create(lead, request.user, data=request.data, request=request)
    except (DjangoValidationError, PermissionDenied) as exc:
        return _service_error(exc)
    return Response(ProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def target_customer_lists(request):
    if request.method == "GET":
        denial = _check_view_permission(request)
        if denial:
            return denial
        return _paginated_response(request, _target_list_queryset(request.user), TargetCustomerListSerializer)
    denial = require_permission(request, "lead.create")
    if denial:
        return denial
    serializer = TargetCustomerListSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    instance = serializer.save(created_by=request.user)
    return Response(TargetCustomerListSerializer(instance).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def target_customer_list_detail(request, pk):
    instance = get_object_or_404(_target_list_queryset(request.user), pk=pk)
    if request.method == "GET":
        return Response(TargetCustomerListSerializer(instance).data)
    if request.method == "DELETE":
        denial = require_permission(request, "lead.delete")
        if denial:
            return denial
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    denial = require_permission(request, "lead.edit")
    if denial:
        return denial
    serializer = TargetCustomerListSerializer(instance, data=request.data, partial=request.method == "PATCH")
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def target_customer_list_convert_to_leads(request, pk):
    denial = require_permission(request, "lead.create")
    if denial:
        return denial
    target_list = get_object_or_404(_target_list_queryset(request.user), pk=pk)
    assigned_user_id = request.data.get("assigned_to") or request.user.pk
    from apis.user.models import CustomUser
    assigned_user = get_object_or_404(CustomUser, pk=assigned_user_id, is_active=True)

    customers = target_list.customers.select_for_update().all()
    created_leads = []
    reassigned_count = 0

    with transaction.atomic():
        for tc in customers:
            lead = Lead.objects.select_for_update().filter(target_customer=tc).first()
            if not lead:
                lead = Lead.objects.create(
                    target_customer=tc,
                    customer_name=tc.customer_name or "",
                    company_name=tc.company_name or "",
                    contact_person=tc.contact_person or "",
                    phone=tc.phone or "",
                    whatsapp_number=tc.whatsapp_number or "",
                    email=tc.email or "",
                    address=tc.address or "",
                    source=tc.source or target_list.source or "WEBSITE",
                    product=tc.interested_product or "",
                    service=tc.interested_service or "",
                    created_by=request.user,
                    current_stage="NEW",
                    lead_type="PRODUCT" if tc.interested_product and not tc.interested_service else "SERVICE",
                    priority=tc.priority or "MEDIUM",
                )
                created_leads.append(lead)
            was_different = lead.assigned_to_id not in {None, assigned_user.pk}
            lead = LeadAssignmentService.assign(
                lead,
                assigned_user,
                request.user,
                reason=f"Converted from target list {target_list.pk}",
                request=request,
            )
            if was_different:
                reassigned_count += 1

    return Response({
        "status": "success",
        "message": f"Created {len(created_leads)} lead(s) and reassigned {reassigned_count} lead(s) to {assigned_user.fullname or assigned_user.username}.",
        "created_count": len(created_leads),
        "reassigned_count": reassigned_count,
    }, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def target_customers(request):
    if request.method == "GET":
        denial = _check_view_permission(request)
        if denial:
            return denial
        queryset = _target_customer_queryset(request.user)
        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(customer_name__icontains=search) | Q(company_name__icontains=search)
                | Q(contact_person__icontains=search) | Q(phone__icontains=search)
                | Q(email__icontains=search)
            )
        for key in ("customer_list", "assigned_to", "priority", "source", "do_not_call"):
            if request.query_params.get(key) not in (None, ""):
                queryset = queryset.filter(**{key: request.query_params[key]})
        return _paginated_response(request, queryset, TargetCustomerSerializer)
    denial = require_permission(request, "lead.create")
    if denial:
        return denial
    serializer = TargetCustomerSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    instance = serializer.save()
    return Response(TargetCustomerSerializer(instance).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def target_customer_detail(request, pk):
    instance = get_object_or_404(_target_customer_queryset(request.user), pk=pk)
    if request.method == "GET":
        return Response(TargetCustomerSerializer(instance).data)
    if request.method == "DELETE":
        denial = require_permission(request, "lead.delete")
        if denial:
            return denial
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    denial = require_permission(request, "lead.edit")
    if denial:
        return denial
    serializer = TargetCustomerSerializer(instance, data=request.data, partial=request.method == "PATCH")
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def lead_import(request):
    denial = require_permission(request, "lead.import")
    if denial:
        return denial
    serializer = LeadImportActionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    source = request.FILES.get("file")
    if source is None:
        try:
            source = _rows_as_csv(serializer.validated_data.get("rows", []))
        except CSVImportError as exc:
            return Response({"errors": [str(exc)]}, status=status.HTTP_400_BAD_REQUEST)
    mode = serializer.validated_data.get("mode", "targets")
    dry_run = serializer.validated_data.get("dry_run", False)
    from apis.user.models import CustomUser
    assignee_queryset = CustomUser.objects.filter(is_active=True)
    if not (has_permission(request.user, "lead.assign") or has_permission(request.user, "lead.reassign")):
        assignee_queryset = assignee_queryset.filter(pk=request.user.pk)
    visible_targets = _target_customer_queryset(request.user)
    visible_leads = lead_queryset_for(request.user)
    try:
        if mode == "leads":
            result = import_leads(
                source,
                actor=request.user,
                request=request,
                dry_run=dry_run,
                lead_queryset=visible_leads,
                target_queryset=visible_targets,
                assignee_queryset=assignee_queryset,
            )
        else:
            customer_list_value = serializer.validated_data["customer_list"]
            customer_list = get_object_or_404(
                _target_list_queryset(request.user),
                pk=getattr(customer_list_value, "pk", customer_list_value),
            )
            result = import_target_customers(
                source,
                actor=request.user,
                customer_list=customer_list,
                request=request,
                dry_run=dry_run,
                target_queryset=visible_targets,
                assignee_queryset=assignee_queryset,
            )
    except (DjangoValidationError, CSVImportError) as exc:
        return _service_error(exc)
    return Response(result, status=status.HTTP_201_CREATED)


class IgnoreFormatContentNegotiation(DefaultContentNegotiation):
    def filter_renderers(self, renderers, format):
        # Ignore format parameter to prevent 404 on custom export types (excel/csv)
        return renderers


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lead_export(request):
    user = request.user

    denial = require_permission(request, "lead.export")
    if denial and not (user.is_staff or user.is_superuser or getattr(user, "role", "") in {"admin", "super_admin", "manager", "team_lead", "employee"}):
        return HttpResponse('{"error": "Permission denied."}', content_type="application/json", status=403)

    params = request.GET if hasattr(request, "GET") else getattr(request, "query_params", {})
    export_type = params.get("type", "leads")
    fmt = str(params.get("format", "excel")).lower()

    if export_type == "employee":
        content = export_employee_excel(
            apply_lead_filters(lead_queryset_for(user), params),
            actor=user,
            request=request,
        )
        filename = "employee-performance-report.xlsx"
        content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif export_type == "targets":
        if fmt == "csv":
            content = export_target_customers_csv(
                _target_customer_queryset(user),
                actor=user,
                request=request,
            )
            filename = "target-customers.csv"
            content_type = "text/csv; charset=utf-8"
        else:
            content = export_target_customers_excel(
                _target_customer_queryset(user),
                actor=user,
                request=request,
            )
            filename = "target-customers.xlsx"
            content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        if fmt == "csv":
            content = export_leads_csv(
                apply_lead_filters(lead_queryset_for(user), params),
                actor=user,
                request=request,
            )
            filename = "leads.csv"
            content_type = "text/csv; charset=utf-8"
        else:
            content = export_leads_excel(
                apply_lead_filters(lead_queryset_for(user), params),
                actor=user,
                request=request,
            )
            filename = "leads.xlsx"
            content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    response = HttpResponse(content, content_type=content_type, status=200)
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    response["X-Content-Type-Options"] = "nosniff"
    return response

lead_export.cls.content_negotiation_class = IgnoreFormatContentNegotiation


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lead_dashboard(request):
    if not (has_permission(request.user, "lead.view_own") or has_permission(request.user, "lead.view_all") or has_permission(request.user, "lead.view_reports")):
        return permission_denied("lead.view_reports")
    queryset = apply_lead_filters(lead_queryset_for(request.user), request.query_params)
    return Response(dashboard_summary(queryset))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lead_report_view(request):
    if not (has_permission(request.user, "lead.view_own") or has_permission(request.user, "lead.view_all") or has_permission(request.user, "lead.view_reports")):
        return permission_denied("lead.view_reports")
    queryset = apply_lead_filters(lead_queryset_for(request.user), request.query_params)
    return Response(lead_reports(queryset))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lead_my_profile(request):
    """Return the authenticated user's lead profile without accepting a user id."""

    denial = require_permission(request, "lead.view_my_profile")
    if denial:
        return denial

    try:
        page = max(1, int(request.query_params.get("page", 1)))
        page_size = min(100, max(1, int(request.query_params.get("page_size", 25))))
    except (TypeError, ValueError):
        return Response(
            {"error": "page and page_size must be positive integers."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user
    now = timezone.now()
    schedule_date_value = request.query_params.get("schedule_date")
    if schedule_date_value:
        try:
            schedule_date = datetime.strptime(schedule_date_value, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            return Response(
                {"error": "schedule_date must use YYYY-MM-DD format."},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        schedule_date = timezone.localdate(now)

    report_end_value = request.query_params.get("report_end")
    report_start_value = request.query_params.get("report_start")
    report_end = timezone.localdate(now)
    report_start = report_end - timedelta(days=29)
    try:
        if report_start_value:
            report_start = datetime.strptime(report_start_value, "%Y-%m-%d").date()
        if report_end_value:
            report_end = datetime.strptime(report_end_value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return Response(
            {"error": "report_start and report_end must use YYYY-MM-DD format."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if report_start > report_end:
        return Response(
            {"error": "report_start must be on or before report_end."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if (report_end - report_start).days > 365:
        return Response(
            {"error": "The reporting period cannot exceed 366 days."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    report_company = request.query_params.get("report_company", "").strip()
    report_stage = request.query_params.get("report_stage", "").strip().upper()
    report_activity_type = request.query_params.get("report_activity_type", "").strip().upper()
    valid_stages = {value for value, _label in LEAD_STAGE_CHOICES}
    # EMAIL is emitted by the existing send-email flow and is retained as a
    # backwards-compatible report activity even though it predates the enum.
    valid_activity_types = {value for value, _label in ACTIVITY_TYPE_CHOICES} | {"EMAIL"}
    if report_stage and report_stage not in valid_stages:
        return Response({"error": "report_stage is not a valid lead stage."}, status=status.HTTP_400_BAD_REQUEST)
    if report_activity_type and report_activity_type not in valid_activity_types:
        return Response({"error": "report_activity_type is not a valid activity type."}, status=status.HTTP_400_BAD_REQUEST)
    current_tz = timezone.get_current_timezone()
    schedule_start = timezone.make_aware(datetime.combine(schedule_date, datetime.min.time()), current_tz)
    schedule_end = schedule_start + timedelta(days=1)
    leads = my_profile_lead_queryset(user).order_by("-updated_at", "-id")
    lead_ids = leads.values("pk")
    lead_count = leads.count()
    start = (page - 1) * page_size
    page_leads = leads[start:start + page_size]

    own_follow_ups = LeadFollowUp.objects.filter(lead_id__in=lead_ids).filter(
        Q(assigned_to=user) | Q(created_by=user)
    )
    own_tasks = LeadTask.objects.filter(lead_id__in=lead_ids).filter(
        Q(assigned_to=user) | Q(created_by=user)
    )
    own_meetings = LeadMeeting.objects.filter(lead_id__in=lead_ids).filter(
        Q(assigned_to=user) | Q(created_by=user)
    )
    own_calls = LeadCall.objects.filter(lead_id__in=lead_ids, caller=user)
    own_conversions = LeadConversion.objects.filter(lead_id__in=lead_ids, converted_by=user)
    own_activities = LeadActivity.objects.filter(lead_id__in=lead_ids, actor=user)

    active_follow_ups = own_follow_ups.filter(status__in={"SCHEDULED", "OVERDUE"})
    open_tasks = own_tasks.exclude(status__in={"COMPLETED", "CANCELLED"})
    upcoming_meetings = own_meetings.filter(
        status__in={"SCHEDULED", "CONFIRMED", "RESCHEDULED"},
        scheduled_start__gte=now,
    )

    # Incentive is based on this user's conversion records in the current
    # calendar month (using the backend's active timezone), never estimated
    # lead values or another user's conversions.
    month_start_date = timezone.localdate(now).replace(day=1)
    if month_start_date.month == 12:
        next_month_date = month_start_date.replace(year=month_start_date.year + 1, month=1)
    else:
        next_month_date = month_start_date.replace(month=month_start_date.month + 1)
    month_start_at = timezone.make_aware(datetime.combine(month_start_date, datetime.min.time()), current_tz)
    next_month_at = timezone.make_aware(datetime.combine(next_month_date, datetime.min.time()), current_tz)
    monthly_conversions = LeadConversion.objects.filter(
        converted_by=user,
        converted_at__gte=month_start_at,
        converted_at__lt=next_month_at,
    ).select_related("lead", "customer", "quotation", "invoice").order_by("-converted_at", "-id")
    monthly_value = monthly_conversions.aggregate(total=Sum("final_value"))["total"] or Decimal("0.00")
    monthly_discount = monthly_conversions.aggregate(total=Sum("discount"))["total"] or Decimal("0.00")
    monthly_net_value = monthly_value - monthly_discount
    monthly_rate = Decimal("10")
    monthly_incentive = (monthly_value * monthly_rate / Decimal("100")).quantize(Decimal("0.01"))
    monthly_incentive_data = {
        "month": month_start_date.strftime("%B %Y"),
        "rate": 10,
        "deal_count": monthly_conversions.count(),
        "conversion_value": format(monthly_value, ".2f"),
        "incentive_amount": format(monthly_incentive, ".2f"),
        "gross_value": format(monthly_value, ".2f"),
        "discount_total": format(monthly_discount, ".2f"),
        "net_value": format(monthly_net_value, ".2f"),
        "records": [],
    }
    for conversion in monthly_conversions:
        final_value = conversion.final_value or Decimal("0.00")
        discount = conversion.discount or Decimal("0.00")
        net_value = final_value - discount
        record_incentive = (final_value * monthly_rate / Decimal("100")).quantize(Decimal("0.01"))
        converted_at = timezone.localtime(conversion.converted_at, current_tz) if conversion.converted_at else None
        monthly_incentive_data["records"].append({
            "id": conversion.id,
            "lead_id": conversion.lead_id,
            "lead_number": conversion.lead.lead_number if conversion.lead else "",
            "customer_name": (
                (conversion.customer.company_name or conversion.customer.name)
                if conversion.customer else (conversion.lead.company_name or conversion.lead.customer_name if conversion.lead else "")
            ),
            "conversion_type": conversion.get_conversion_type_display(),
            "converted_at": converted_at.isoformat() if converted_at else None,
            "final_value": format(final_value, ".2f"),
            "discount": format(discount, ".2f"),
            "net_value": format(net_value, ".2f"),
            "incentive_rate": format(monthly_rate, ".2f"),
            "incentive_amount": format(record_incentive, ".2f"),
            "payment_terms": conversion.payment_terms or "",
            "quotation_reference": getattr(conversion.quotation, "proposal_no", "") if conversion.quotation else "",
            "invoice_reference": getattr(conversion.invoice, "invoice_no", "") if conversion.invoice else "",
            "project_reference": conversion.project or "",
            "sales_order_reference": conversion.sales_order or "",
        })

    follow_up_rows = active_follow_ups.select_related("lead", "assigned_to", "created_by").order_by("scheduled_at", "id")[:50]
    task_rows = open_tasks.select_related("lead", "assigned_to", "created_by").order_by("due_at", "id")[:50]
    activity_rows = own_activities.select_related("lead").order_by("-created_at", "-id")[:50]
    telecalling_leads = leads.filter(
        current_stage__in={"NEW", "ASSIGNED", "CONTACT_ATTEMPTED", "FOLLOW_UP_REQUIRED", "CONNECTED"}
    ).exclude(phone="").exclude(target_customer__do_not_call=True)

    dialable_ids = list(telecalling_leads.values_list("pk", flat=True))
    active_phone_follow_ups = own_follow_ups.filter(
        lead_id__in=dialable_ids,
        follow_up_type="PHONE",
        status__in={"SCHEDULED", "OVERDUE"},
    )
    selected_phone_follow_ups = active_phone_follow_ups.filter(
        scheduled_at__gte=schedule_start,
        scheduled_at__lt=schedule_end,
    ).select_related("lead").order_by("lead_id", "scheduled_at", "id")
    # Keep one actionable schedule item per lead even if historical imports left
    # duplicate active reminders behind.
    scheduled_items = []
    scheduled_lead_ids = []
    seen_scheduled_leads = set()
    for item in selected_phone_follow_ups:
        if item.lead_id in seen_scheduled_leads:
            continue
        seen_scheduled_leads.add(item.lead_id)
        scheduled_lead_ids.append(item.lead_id)
        scheduled_items.append({
            "id": item.pk,
            "lead_id": item.lead_id,
            "scheduled_at": item.scheduled_at,
            "purpose": item.purpose,
            "notes": item.notes,
            "status": item.status,
        })
    active_phone_items = []
    seen_active_phone_leads = set()
    for item in active_phone_follow_ups.select_related("lead").order_by("lead_id", "scheduled_at", "id"):
        if item.lead_id in seen_active_phone_leads:
            continue
        seen_active_phone_leads.add(item.lead_id)
        active_phone_items.append({
            "id": item.pk,
            "lead_id": item.lead_id,
            "scheduled_at": item.scheduled_at,
            "purpose": item.purpose,
            "notes": item.notes,
            "status": item.status,
        })
    completed_lead_ids = list(
        own_calls.filter(
            lead_id__in=dialable_ids,
            started_at__gte=schedule_start,
            started_at__lt=schedule_end,
        ).values_list("lead_id", flat=True).distinct()
    )
    overdue_lead_ids = list(
        active_phone_follow_ups.filter(scheduled_at__lt=now)
        .values_list("lead_id", flat=True).distinct()
    )
    actively_scheduled_ids = active_phone_follow_ups.values_list("lead_id", flat=True).distinct()
    unscheduled_lead_ids = list(
        telecalling_leads.exclude(pk__in=actively_scheduled_ids).values_list("pk", flat=True)
    )
    telecalling_schedule = {
        "date": schedule_date,
        "scheduled_lead_ids": scheduled_lead_ids,
        "scheduled_items": scheduled_items,
        "active_phone_items": active_phone_items,
        "completed_lead_ids": completed_lead_ids,
        "overdue_lead_ids": overdue_lead_ids,
        "unscheduled_lead_ids": unscheduled_lead_ids,
        "summary": {
            "scheduled": len(scheduled_lead_ids),
            "completed": len(completed_lead_ids),
            "overdue": len(overdue_lead_ids),
            "unscheduled": len(unscheduled_lead_ids),
            "dialable": len(dialable_ids),
        },
    }
    target_lists = TargetCustomerList.objects.filter(
        Q(created_by=user) | Q(customers__assigned_to=user)
    ).select_related("created_by").distinct().order_by("-updated_at", "-id")
    target_list_rows = []
    for target_list in target_lists:
        contacts = target_list.customers.all()
        if target_list.created_by_id != user.pk:
            contacts = contacts.filter(assigned_to=user)
        contact_count = contacts.count()
        contact_rows = list(contacts.order_by("-updated_at", "-id")[:100])
        target_list_rows.append({
            "id": target_list.pk,
            "name": target_list.name,
            "description": target_list.description,
            "campaign": target_list.campaign,
            "source": target_list.source,
            "status": target_list.status,
            "customer_count": contact_count,
            "created_at": target_list.created_at,
            "updated_at": target_list.updated_at,
            "contacts": [
                {
                    "id": contact.pk,
                    "company_name": contact.company_name,
                    "customer_name": contact.customer_name,
                    "contact_person": contact.contact_person,
                    "phone": contact.phone,
                    "email": contact.email,
                    "city": contact.city,
                    "industry": contact.industry,
                    "priority": contact.priority,
                    "do_not_call": contact.do_not_call,
                }
                for contact in contact_rows
            ],
        })
    target_customers = TargetCustomer.objects.filter(
        Q(customer_list__created_by=user) | Q(assigned_to=user)
    ).distinct()

    # The report deliberately starts from the same self-scoped lead queryset.
    # Report query parameters can narrow that scope, never widen it.
    report_start_at = timezone.make_aware(datetime.combine(report_start, datetime.min.time()), current_tz)
    report_end_at = timezone.make_aware(datetime.combine(report_end + timedelta(days=1), datetime.min.time()), current_tz)
    report_leads = leads
    if report_company:
        report_leads = report_leads.filter(
            Q(company_name__iexact=report_company) | Q(customer_name__iexact=report_company)
        )
    if report_stage:
        report_leads = report_leads.filter(current_stage=report_stage)
    candidate_report_lead_ids = report_leads.values("pk")
    report_activities = own_activities.filter(
        lead_id__in=candidate_report_lead_ids,
        created_at__gte=report_start_at,
        created_at__lt=report_end_at,
    )
    if report_activity_type:
        report_activities = report_activities.filter(activity_type=report_activity_type)
    # One report slice contract: a lead belongs to the report only when it has
    # an authenticated-user activity matching the selected period and type.
    # Every downstream lead KPI, chart, workload row and export uses these IDs.
    report_leads = report_leads.filter(
        pk__in=report_activities.values("lead_id").distinct()
    )
    report_lead_ids = report_leads.values("pk")
    report_activities = report_activities.filter(lead_id__in=report_lead_ids)
    report_calls = own_calls.filter(
        lead_id__in=report_lead_ids,
        started_at__gte=report_start_at,
        started_at__lt=report_end_at,
    )
    report_meetings = own_meetings.filter(
        lead_id__in=report_lead_ids,
        created_at__gte=report_start_at,
        created_at__lt=report_end_at,
    )
    report_conversions = own_conversions.filter(
        lead_id__in=report_lead_ids,
        converted_at__gte=report_start_at,
        converted_at__lt=report_end_at,
    )
    activity_breakdown = list(
        report_activities.values("activity_type")
        .annotate(count=Count("pk"))
        .order_by("activity_type")
    )
    activity_by_day = {
        row["day"]: row
        for row in report_activities
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(
            calls=Count("pk", filter=Q(activity_type="CALL")),
            emails=Count("pk", filter=Q(activity_type="EMAIL")),
            meetings=Count("pk", filter=Q(activity_type__in={"MEETING", "DEMO"})),
            tasks=Count("pk", filter=Q(activity_type="TASK")),
            total=Count("pk"),
        )
    }
    daily_activity = []
    period_days = (report_end - report_start).days + 1
    for offset in range(period_days):
        day = report_start + timedelta(days=offset)
        values = activity_by_day.get(day, {})
        calls = values.get("calls", 0)
        emails = values.get("emails", 0)
        meetings = values.get("meetings", 0)
        tasks = values.get("tasks", 0)
        total = values.get("total", 0)
        daily_activity.append({
            "date": day,
            "calls": calls,
            "emails": emails,
            "meetings": meetings,
            "tasks": tasks,
            "other": total - calls - emails - meetings - tasks,
            "total": total,
        })
    report_lead_count = report_leads.count()
    assigned_count = report_leads.filter(assigned_to=user).count()
    created_count = report_leads.filter(created_by=user).count()
    converted_count = report_leads.filter(current_stage="CONVERTED").count()
    report_follow_ups = active_follow_ups.filter(lead_id__in=report_lead_ids)
    report_tasks = open_tasks.filter(lead_id__in=report_lead_ids)
    pending_follow_up_count = report_follow_ups.count()
    overdue_follow_up_count = report_follow_ups.filter(scheduled_at__lt=now).count()
    open_task_count = report_tasks.count()
    meeting_count = report_meetings.count() if not report_activity_type or report_activity_type in {"MEETING", "DEMO"} else 0
    upcoming_meeting_count = upcoming_meetings.filter(lead_id__in=report_lead_ids).count() if not report_activity_type or report_activity_type in {"MEETING", "DEMO"} else 0
    conversion_count = report_conversions.count() if not report_activity_type or report_activity_type == "CONVERTED" else 0
    report_target_customers = target_customers.filter(leads__in=report_leads).distinct()
    report_activity_rows = report_activities.select_related("lead").order_by("-created_at", "-id")
    company_options = sorted({
        value.strip()
        for pair in leads.values_list("company_name", "customer_name")
        for value in pair if value and value.strip()
    }, key=str.casefold)
    activity_type_labels = dict(ACTIVITY_TYPE_CHOICES)
    activity_type_labels["EMAIL"] = "Email"
    available_activity_types = sorted(
        own_activities.values_list("activity_type", flat=True).distinct()
    )
    performance_report = {
        "period": {"days": period_days, "start": report_start, "end": report_end},
        "applied_filters": {
            "start": report_start,
            "end": report_end,
            "company": report_company,
            "stage": report_stage,
            "activity_type": report_activity_type,
        },
        "filter_options": {
            "companies": company_options,
            "stages": [{"value": value, "label": label} for value, label in LEAD_STAGE_CHOICES if leads.filter(current_stage=value).exists()],
            "activity_types": [{"value": value, "label": activity_type_labels.get(value, value.replace("_", " ").title())} for value in available_activity_types],
        },
        "summary": {
            "total_leads": report_lead_count,
            "assigned_leads": assigned_count,
            "created_leads": created_count,
            "converted_leads": converted_count,
            "conversion_rate": round((converted_count / report_lead_count) * 100, 1) if report_lead_count else 0,
            "high_priority": report_leads.filter(priority__in={"HIGH", "CRITICAL"}).count(),
        },
        "engagement": {
            "calls": report_calls.count() if not report_activity_type or report_activity_type == "CALL" else 0,
            "emails": report_activities.filter(activity_type="EMAIL").count(),
            "meetings": meeting_count,
            "upcoming_meetings": upcoming_meeting_count,
            "conversions": conversion_count,
        },
        "workload": {
            "pending_follow_ups": pending_follow_up_count,
            "overdue_follow_ups": overdue_follow_up_count,
            "open_tasks": open_task_count,
        },
        "targets": {
            "total_lists": report_target_customers.values("customer_list_id").distinct().count(),
            "total_contacts": report_target_customers.count(),
            "do_not_call": report_target_customers.filter(do_not_call=True).count(),
        },
        "stage_distribution": list(report_leads.values("current_stage").annotate(count=Count("pk")).order_by("current_stage")),
        "priority_distribution": list(report_leads.values("priority").annotate(count=Count("pk")).order_by("priority")),
        "source_distribution": list(report_leads.values("source").annotate(count=Count("pk")).order_by("source")),
        "activity_breakdown": activity_breakdown,
        "call_outcomes": list(report_calls.values("outcome").annotate(count=Count("pk")).order_by("outcome")) if not report_activity_type or report_activity_type == "CALL" else [],
        "daily_activity": daily_activity,
        "leads": [
            {
                "id": item.pk, "lead_number": item.lead_number,
                "company_name": item.company_name, "customer_name": item.customer_name,
                "stage": item.current_stage, "priority": item.priority, "source": item.source,
                "service": item.service, "product": item.product,
                "estimated_value": item.estimated_value, "created_at": item.created_at,
            }
            for item in report_leads.order_by("-updated_at", "-id")
        ],
        "activities": [
            {
                "id": item.pk, "lead_id": item.lead_id,
                "lead_name": item.lead.company_name or item.lead.customer_name or item.lead.lead_number,
                "type": item.activity_type, "title": item.title,
                "description": item.description, "created_at": item.created_at,
            }
            for item in report_activity_rows
        ],
    }

    return Response({
        "user": {
            "id": user.pk,
            "username": user.username,
            "fullname": user.fullname or user.username,
            "email": user.email,
            "phone": user.phone or "",
            "designation": user.designation or "",
            "department": user.department or "",
            "role": user.role or "",
            "joining_date": user.joining_date,
        },
        "overview": {
            "total_leads": lead_count,
            "assigned_leads": leads.filter(assigned_to=user).count(),
            "created_leads": leads.filter(created_by=user).count(),
            "converted_leads": leads.filter(current_stage="CONVERTED").count(),
            "high_priority": leads.filter(priority__in={"HIGH", "CRITICAL"}).count(),
            "pending_follow_ups": active_follow_ups.count(),
            "overdue_follow_ups": active_follow_ups.filter(scheduled_at__lt=now).count(),
            "open_tasks": open_tasks.count(),
            "calls_made": own_calls.count(),
            "emails_sent": own_activities.filter(activity_type="EMAIL").count(),
            "meetings": own_meetings.count(),
            "upcoming_meetings": upcoming_meetings.count(),
            "conversions": own_conversions.count(),
        },
        "monthly_incentive": monthly_incentive_data,
        "performance_report": performance_report,
        "stage_summary": list(
            leads.values("current_stage")
            .annotate(count=Count("pk"))
            .order_by("current_stage")
        ),
        "leads": {
            "count": lead_count,
            "page": page,
            "page_size": page_size,
            "results": LeadSerializer(page_leads, many=True).data,
        },
        "telecalling_leads": LeadSerializer(telecalling_leads, many=True).data,
        "telecalling_schedule": telecalling_schedule,
        "target_lists": target_list_rows,
        "target_summary": {
            "total_lists": len(target_list_rows),
            "total_customers": sum(item["customer_count"] for item in target_list_rows),
            "do_not_call": target_customers.filter(do_not_call=True).count(),
        },
        "follow_ups": [
            {
                "id": item.pk,
                "lead_id": item.lead_id,
                "lead_name": item.lead.company_name or item.lead.customer_name or item.lead.lead_number,
                "type": item.follow_up_type,
                "purpose": item.purpose,
                "status": item.status,
                "scheduled_at": item.scheduled_at,
                "assigned_to": item.assigned_to_id,
                "assigned_to_name": item.assigned_to.fullname if item.assigned_to else "",
                "created_by": item.created_by_id,
                "created_by_name": item.created_by.fullname if item.created_by else "",
                "created_at": item.created_at,
                "is_overdue": item.scheduled_at < now,
            }
            for item in follow_up_rows
        ],
        "tasks": [
            {
                "id": item.pk,
                "lead_id": item.lead_id,
                "lead_name": item.lead.company_name or item.lead.customer_name or item.lead.lead_number,
                "title": item.title,
                "type": item.task_type,
                "priority": item.priority,
                "status": item.status,
                "due_at": item.due_at,
                "assigned_to": item.assigned_to_id,
                "assigned_to_name": item.assigned_to.fullname if item.assigned_to else "",
                "created_by": item.created_by_id,
                "created_by_name": item.created_by.fullname if item.created_by else "",
                "created_at": item.created_at,
                "is_overdue": bool(item.due_at and item.due_at < now),
            }
            for item in task_rows
        ],
        "recent_activity": [
            {
                "id": item.pk,
                "lead_id": item.lead_id,
                "lead_name": item.lead.company_name or item.lead.customer_name or item.lead.lead_number,
                "type": item.activity_type,
                "title": item.title,
                "description": item.description,
                "created_at": item.created_at,
            }
            for item in activity_rows
        ],
    })


def _my_profile_target_list(user, pk):
    return get_object_or_404(
        TargetCustomerList.objects.filter(
            Q(created_by=user) | Q(customers__assigned_to=user)
        ).distinct(),
        pk=pk,
    )


def _my_profile_target_contacts(user, target_list):
    contacts = target_list.customers.all()
    if target_list.created_by_id != user.pk:
        contacts = contacts.filter(assigned_to=user)
    return contacts


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lead_my_profile_target_contacts(request, pk):
    denial = require_permission(request, "lead.view_my_profile")
    if denial:
        return denial
    target_list = _my_profile_target_list(request.user, pk)
    contacts = _my_profile_target_contacts(request.user, target_list)
    if request.method == "GET":
        return _paginated_response(request, contacts, TargetCustomerSerializer)

    denial = require_permission(request, "lead.create")
    if denial:
        return denial
    serializer = TargetCustomerSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    contact = serializer.save(customer_list=target_list, assigned_to=request.user)
    return Response(TargetCustomerSerializer(contact).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def lead_my_profile_target_contact_detail(request, pk, contact_id):
    denial = require_permission(request, "lead.view_my_profile")
    if denial:
        return denial
    target_list = _my_profile_target_list(request.user, pk)
    contact = get_object_or_404(
        _my_profile_target_contacts(request.user, target_list),
        pk=contact_id,
    )
    if request.method == "DELETE":
        denial = require_permission(request, "lead.delete")
        if denial:
            return denial
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    denial = require_permission(request, "lead.edit")
    if denial:
        return denial
    serializer = TargetCustomerSerializer(
        contact,
        data=request.data,
        partial=request.method == "PATCH",
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def lead_my_profile_target_list_convert(request, pk):
    denial = require_permission(request, "lead.view_my_profile")
    if denial:
        return denial
    denial = require_permission(request, "lead.create")
    if denial:
        return denial
    target_list = _my_profile_target_list(request.user, pk)
    contacts = _my_profile_target_contacts(request.user, target_list).select_for_update()
    created_leads = []
    reassigned_count = 0
    with transaction.atomic():
        for contact in contacts:
            lead = Lead.objects.select_for_update().filter(target_customer=contact).first()
            if not lead:
                lead = Lead.objects.create(
                    target_customer=contact,
                    customer_name=contact.customer_name or "",
                    company_name=contact.company_name or "",
                    contact_person=contact.contact_person or "",
                    phone=contact.phone or "",
                    whatsapp_number=contact.whatsapp_number or "",
                    email=contact.email or "",
                    address=contact.address or "",
                    source=contact.source or target_list.source or "WEBSITE",
                    product=contact.interested_product or "",
                    service=contact.interested_service or "",
                    created_by=request.user,
                    current_stage="NEW",
                    lead_type="PRODUCT" if contact.interested_product and not contact.interested_service else "SERVICE",
                    priority=contact.priority or "MEDIUM",
                )
                created_leads.append(lead)
            was_different = lead.assigned_to_id not in {None, request.user.pk}
            LeadAssignmentService.assign(
                lead,
                request.user,
                request.user,
                reason=f"Converted from own target list {target_list.pk}",
                request=request,
            )
            if was_different:
                reassigned_count += 1
    return Response({
        "status": "success",
        "message": f"Created {len(created_leads)} lead(s) and reassigned {reassigned_count} lead(s) to your profile.",
        "created_count": len(created_leads),
        "reassigned_count": reassigned_count,
    })


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def tele_sales_users(request):
    """Return all active users with aggregated lead + target stats for the Sales Team view, with DB-persisted designation filtering."""
    from django.db.models import Count, Q
    from apis.user.models import CustomUser
    from .models import SalesTeamConfig

    is_team_lead = getattr(request.user, "role", "") == "team_lead" or getattr(request.user, "is_team_lead", False)
    if not (has_permission(request.user, "lead.view_all") or request.user.is_staff or request.user.is_superuser or is_team_lead):
        return permission_denied("lead.view_reports")

    config, _ = SalesTeamConfig.objects.get_or_create(pk=1)

    if request.method == "POST":
        denial = require_permission(request, "lead.manage_settings")
        if denial:
            return denial
        new_designations = request.data.get("selected_designations", [])
        if isinstance(new_designations, list):
            config.selected_designations = [str(d).strip() for d in new_designations if str(d).strip()]
            config.save()
        return Response({
            "status": "saved",
            "selected_designations": config.selected_designations
        })

    # Available designation & department choices from active users
    avail_desigs = [str(d).strip() for d in CustomUser.objects.filter(is_active=True).values_list("designation", flat=True).distinct() if d and str(d).strip()]
    avail_depts = [str(d).strip() for d in CustomUser.objects.filter(is_active=True).values_list("department", flat=True).distinct() if d and str(d).strip()]
    all_designation_options = sorted(list(set(avail_desigs + avail_depts)))

    saved_selected = [str(d).strip() for d in (config.selected_designations or []) if d and str(d).strip()]
    if not saved_selected:
        saved_selected = all_designation_options

    sales_keywords = [
        "sales", "marketing", "tele", "telecaller", "telecalling",
        "seo", "social media", "bd", "bda", "bde", "business development",
        "growth", "crm"
    ]

    users_qs = (
        CustomUser.objects.filter(is_active=True)
        .annotate(
            agg_total_leads=Count("assigned_leads", distinct=True),
            agg_converted_leads=Count(
                "assigned_leads",
                filter=Q(assigned_leads__current_stage="CONVERTED"),
                distinct=True,
            ),
            agg_rejected_leads=Count(
                "assigned_leads",
                filter=Q(assigned_leads__current_stage="REJECTED"),
                distinct=True,
            ),
            agg_calls_made=Count("lead_calls", distinct=True),
            agg_target_customers=Count("assigned_target_customers", distinct=True),
        )
        .values(
            "id", "fullname", "username", "designation", "department",
            "role", "is_active", "is_team_lead",
            "agg_total_leads", "agg_converted_leads", "agg_rejected_leads",
            "agg_calls_made", "agg_target_customers",
        )
        .order_by("-agg_total_leads", "fullname")
    )
    if is_team_lead and not has_permission(request.user, "lead.view_all"):
        users_qs = users_qs.filter(department__iexact=getattr(request.user, "department", ""))

    result = []
    for u in users_qs:
        dept = u.get("department") or ""
        desig = u.get("designation") or ""
        role = u.get("role") or ""
        text_to_check = f"{dept} {desig} {role}".lower()

        is_match = (
            not saved_selected
            or desig in saved_selected
            or dept in saved_selected
            or any(sel.lower() in text_to_check for sel in saved_selected)
            or role in {"admin", "super_admin", "manager"}
        )

        if is_match:
            pending = (u.get("agg_total_leads") or 0) - (u.get("agg_converted_leads") or 0) - (u.get("agg_rejected_leads") or 0)
            result.append({
                "id": u["id"],
                "fullname": u["fullname"] or u["username"],
                "username": u["username"],
                "designation": u["designation"] or "",
                "department": u["department"] or "",
                "role": u["role"] or "",
                "is_team_lead": u.get("is_team_lead", False),
                "stats": {
                    "total_leads": u.get("agg_total_leads") or 0,
                    "converted": u.get("agg_converted_leads") or 0,
                    "rejected": u.get("agg_rejected_leads") or 0,
                    "pending": max(pending, 0),
                    "calls_made": u.get("agg_calls_made") or 0,
                    "target_customers": u.get("agg_target_customers") or 0,
                },
            })

    return Response({
        "users": result,
        "selected_designations": saved_selected,
        "available_designations": all_designation_options,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tele_sales_user_report(request, user_id):
    """Return detailed performance report for a single sales user."""
    from apis.user.models import CustomUser
    from django.shortcuts import get_object_or_404

    target_user = get_object_or_404(CustomUser, pk=user_id, is_active=True)
    is_team_lead = getattr(request.user, "role", "") == "team_lead" or getattr(request.user, "is_team_lead", False)
    same_department = (
        is_team_lead
        and bool(getattr(request.user, "department", ""))
        and str(request.user.department).casefold() == str(target_user.department or "").casefold()
    )
    if not (
        has_permission(request.user, "lead.view_all")
        or request.user.is_staff
        or request.user.is_superuser
        or request.user.pk == user_id
        or same_department
    ):
        return permission_denied("lead.view_reports")

    # Scope leads to this user only
    from .selectors import optimized_lead_queryset
    from django.db.models import Q as DQ
    queryset = optimized_lead_queryset().filter(DQ(assigned_to=target_user) | DQ(created_by=target_user)).distinct()

    report = lead_reports(queryset)

    # Add target customer summary for this user
    tc_qs = TargetCustomer.objects.filter(assigned_to=target_user)
    report["target_summary"] = {
        "total_lists": TargetCustomerList.objects.filter(
            customers__assigned_to=target_user
        ).distinct().count(),
        "total_customers": tc_qs.count(),
        "do_not_call": tc_qs.filter(do_not_call=True).count(),
    }
    report["user"] = {
        "id": target_user.pk,
        "fullname": target_user.fullname or target_user.username,
        "username": target_user.username,
        "designation": target_user.designation or "",
        "department": target_user.department or "",
    }

    return Response(report)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def lead_send_email(request, pk):
    lead = _lead_for_user(request, pk)
    denial = require_permission(request, "lead.send_email")
    if denial:
        return denial

    from django.core.mail import EmailMultiAlternatives, get_connection
    from django.core.validators import validate_email
    from email.utils import formataddr
    from .models import EmailAdvancedConfig, EmailSmtpConfig

    recipient_email = str(request.data.get("recipient_email") or lead.email or "").strip().lower()
    if not recipient_email or not lead.email:
        return Response({"error": "Recipient email address is required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_email(recipient_email)
    except DjangoValidationError:
        return Response({"error": "Enter a valid recipient email address."}, status=status.HTTP_400_BAD_REQUEST)
    if recipient_email != str(lead.email).strip().lower():
        return Response(
            {"error": "Recipient must match the selected lead's email address."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    subject = str(request.data.get("subject", "")).strip()
    body = str(request.data.get("body", "")).strip()
    if not subject or not body:
        return Response({"error": "Subject and body content are required."}, status=status.HTTP_400_BAD_REQUEST)
    if len(subject) > 255 or len(body) > 100_000:
        return Response({"error": "Email subject or body is too long."}, status=status.HTTP_400_BAD_REQUEST)

    advanced, _ = EmailAdvancedConfig.objects.get_or_create(pk=1)
    day_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    sent_today = LeadActivity.objects.filter(
        actor=request.user,
        activity_type="EMAIL",
        created_at__gte=day_start,
        metadata__sent_successfully=True,
    ).count()
    if sent_today >= advanced.daily_limit:
        return Response(
            {"error": f"Daily email limit ({advanced.daily_limit}) reached."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    signature = str(advanced.signature or "").strip()
    final_body = f"{body}\n\n{signature}" if signature and signature not in body else body

    try:
        from django.conf import settings

        smtp_config = EmailSmtpConfig.objects.filter(pk=1).first()
        smtp_password = smtp_config.get_app_password() if smtp_config else ""
        connection = None
        sender = getattr(settings, "DEFAULT_FROM_EMAIL", "info@adstradigital.com")
        if smtp_config and smtp_password:
            connection = get_connection(
                host=smtp_config.smtp_host,
                port=int(smtp_config.smtp_port),
                username=smtp_config.sender_email,
                password=smtp_password,
                use_tls=smtp_config.use_tls,
                fail_silently=False,
            )
            sender = formataddr((smtp_config.sender_name, smtp_config.sender_email))
        msg = EmailMultiAlternatives(subject, final_body, sender, [recipient_email], connection=connection)
        if any(marker in final_body.lower() for marker in ("<p", "<br", "<div", "<html")):
            msg.attach_alternative(final_body, "text/html")
        if msg.send(fail_silently=False) != 1:
            raise RuntimeError("The email backend did not accept the message.")
    except Exception:
        logger.exception("Lead email delivery failed for lead %s", lead.pk)
        return Response(
            {"error": "Email delivery failed. No sent activity was recorded."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    with transaction.atomic():
        activity = LeadActivity.objects.create(
            lead=lead,
            activity_type="EMAIL",
            title=f"Email sent: {subject}",
            description=f"To: {recipient_email}\n\n{final_body}",
            actor=request.user,
            metadata={
                "recipient_email": recipient_email,
                "subject": subject,
                "sent_successfully": True,
            },
        )
        if lead.current_stage == "ASSIGNED":
            try:
                LeadWorkflowService.transition(lead, "CONTACT_ATTEMPTED", request.user, request=request)
            except DjangoValidationError:
                pass

    return Response(
        {
            "status": "success",
            "message": f"Email dispatched to {recipient_email}.",
            "activity_id": activity.id,
            "sent_successfully": True,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def email_templates_api(request):
    from .models import EmailTemplate
    required_permission = "lead.manage_settings" if request.method == "POST" else "lead.send_email"
    denial = require_permission(request, required_permission)
    if denial:
        return denial
    if request.method == "GET":
        templates = list(EmailTemplate.objects.values())
        return Response(templates, status=status.HTTP_200_OK)
    elif request.method == "POST":
        name = str(request.data.get("name", "New Template")).strip()[:255]
        subject = str(request.data.get("subject", "")).strip()[:255]
        body = str(request.data.get("body", "")).strip()
        if not name or not subject or not body or len(body) > 100_000:
            return Response({"error": "Name, subject, and a valid body are required."}, status=status.HTTP_400_BAD_REQUEST)
        tpl = EmailTemplate.objects.create(name=name, subject=subject, body=body)
        log_action(request.user, "Lead Email Template Created", f"Template {tpl.pk}", request)
        return Response({"status": "success", "id": tpl.id, "name": tpl.name, "subject": tpl.subject, "body": tpl.body}, status=status.HTTP_201_CREATED)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def email_template_detail_api(request, pk):
    from .models import EmailTemplate
    denial = require_permission(request, "lead.manage_settings")
    if denial:
        return denial
    try:
        tpl = EmailTemplate.objects.get(pk=pk)
    except EmailTemplate.DoesNotExist:
        return Response({"error": "Template not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        tpl.delete()
        log_action(request.user, "Lead Email Template Deleted", f"Template {pk}", request)
        return Response({"status": "deleted"}, status=status.HTTP_200_OK)

    tpl.name = str(request.data.get("name", tpl.name)).strip()[:255]
    tpl.subject = str(request.data.get("subject", tpl.subject)).strip()[:255]
    tpl.body = str(request.data.get("body", tpl.body)).strip()
    if not tpl.name or not tpl.subject or not tpl.body or len(tpl.body) > 100_000:
        return Response({"error": "Name, subject, and a valid body are required."}, status=status.HTTP_400_BAD_REQUEST)
    tpl.save()
    log_action(request.user, "Lead Email Template Updated", f"Template {tpl.pk}", request)
    return Response({"status": "updated", "id": tpl.id, "name": tpl.name, "subject": tpl.subject, "body": tpl.body}, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def email_smtp_config_api(request):
    from .models import EmailSmtpConfig
    denial = require_permission(request, "lead.manage_settings")
    if denial:
        return denial
    cfg, _ = EmailSmtpConfig.objects.get_or_create(id=1)
    if request.method == "POST":
        from django.core.validators import validate_email
        sender_email = str(request.data.get("sender_email", cfg.sender_email)).strip().lower()
        try:
            validate_email(sender_email)
            port = int(request.data.get("smtp_port", cfg.smtp_port))
            if not 1 <= port <= 65535:
                raise ValueError
        except (DjangoValidationError, TypeError, ValueError):
            return Response({"error": "Enter a valid sender email and SMTP port."}, status=status.HTTP_400_BAD_REQUEST)
        cfg.sender_name = str(request.data.get("sender_name", cfg.sender_name)).strip()[:255]
        cfg.sender_email = sender_email
        cfg.smtp_host = str(request.data.get("smtp_host", cfg.smtp_host)).strip()[:255]
        cfg.smtp_port = str(port)
        cfg.use_tls = bool(request.data.get("use_tls", cfg.use_tls))
        password_value = request.data.get("app_password")
        password_mask = "•••• •••• •••• ••••"
        if password_value not in (None, "", password_mask):
            cfg.set_app_password(password_value)
        elif cfg.app_password and not cfg.app_password.startswith(cfg._ENCRYPTED_PREFIX):
            cfg.set_app_password(cfg.app_password)
        cfg.save()
        log_action(request.user, "Lead SMTP Settings Updated", f"SMTP host {cfg.smtp_host}", request)
        return Response({"status": "success", "message": "SMTP Configuration saved."}, status=status.HTTP_200_OK)

    return Response({
        "sender_name": cfg.sender_name,
        "sender_email": cfg.sender_email,
        "smtp_host": cfg.smtp_host,
        "smtp_port": cfg.smtp_port,
        "use_tls": cfg.use_tls,
        "app_password": "•••• •••• •••• ••••" if cfg.app_password else "",
        "password_configured": bool(cfg.app_password),
    }, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def email_advanced_config_api(request):
    from .models import EmailAdvancedConfig
    denial = require_permission(request, "lead.manage_settings")
    if denial:
        return denial
    cfg, _ = EmailAdvancedConfig.objects.get_or_create(id=1)
    if request.method == "POST":
        try:
            daily_limit = int(request.data.get("daily_limit", cfg.daily_limit))
            if not 1 <= daily_limit <= 10_000:
                raise ValueError
        except (TypeError, ValueError):
            return Response({"error": "Daily limit must be between 1 and 10,000."}, status=status.HTTP_400_BAD_REQUEST)
        cfg.signature = str(request.data.get("signature", cfg.signature))[:20_000]
        cfg.track_opens = bool(request.data.get("track_opens", cfg.track_opens))
        cfg.track_clicks = bool(request.data.get("track_clicks", cfg.track_clicks))
        cfg.daily_limit = daily_limit
        cfg.save()
        log_action(request.user, "Lead Email Rules Updated", f"Daily limit {cfg.daily_limit}", request)
        return Response({"status": "success", "message": "Advanced rules saved."}, status=status.HTTP_200_OK)

    return Response({
        "signature": cfg.signature,
        "track_opens": cfg.track_opens,
        "track_clicks": cfg.track_clicks,
        "daily_limit": cfg.daily_limit,
    }, status=status.HTTP_200_OK)


# Compatibility names retained for the original scaffold.
list_leads = lead_list_create
create_lead = lead_list_create
update_lead = lead_detail
delete_lead = lead_detail

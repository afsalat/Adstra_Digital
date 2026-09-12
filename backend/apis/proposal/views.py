import logging
from datetime import date

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apis.leads.selectors import lead_queryset_for, my_profile_lead_queryset
from apis.leads.services import DuplicateCustomerError, DuplicateCustomerMatchingService, LeadQuotationService
from utils.permissions import has_permission, require_permission

from .models import Client, Proposal, ProposalRequest
from .serializers import ClientSerializer, ProposalRequestSerializer, ProposalSerializer


logger = logging.getLogger(__name__)


def _require_any_permission(request, *codes):
    if any(has_permission(request.user, code) for code in codes):
        return None
    return Response(
        {"error": "Permission denied.", "required_permission": codes[0]},
        status=status.HTTP_403_FORBIDDEN,
    )


def _can_view_all(user):
    role = str(getattr(user, "role", "") or "").casefold()
    return role in {"admin", "super_admin", "manager"} or has_permission(user, "proposals.view_all")


def proposal_queryset_for(user):
    queryset = (
        Proposal.objects.select_related("client", "created_by")
        .prefetch_related("services", "sections", "source_leads", "source_leads__assigned_to")
    )
    if _can_view_all(user):
        return queryset
    visible_leads = lead_queryset_for(user).values("pk")
    return queryset.filter(Q(created_by=user) | Q(source_leads__in=visible_leads)).distinct()


def _my_proposal_queryset(user):
    own_leads = my_profile_lead_queryset(user).values("pk")
    return proposal_queryset_for(user).filter(
        Q(created_by=user) | Q(source_leads__in=own_leads)
    ).filter(source_leads__isnull=False).distinct()


def _positive_int(value, default, maximum=None):
    try:
        result = max(1, int(value))
    except (TypeError, ValueError):
        result = default
    return min(result, maximum) if maximum else result


def _lead_snapshot(lead):
    target = lead.target_customer
    company_name = lead.company_name or (target.company_name if target else "")
    customer_name = lead.customer_name or (target.customer_name if target else "")
    contact_person = lead.contact_person or (target.contact_person if target else "")
    phone = lead.phone or (target.phone if target else "")
    whatsapp_number = lead.whatsapp_number or (target.whatsapp_number if target else "")
    email = lead.email or (target.email if target else "")
    address = lead.address or (target.address if target else "")
    if target:
        locality = ", ".join(value for value in [target.city, target.state] if value)
        if locality and locality.casefold() not in address.casefold():
            address = ", ".join(value for value in [address, locality] if value)
    product = lead.product or (target.interested_product if target else "")
    service = lead.service or (target.interested_service if target else "")
    proposal_request = getattr(lead, "proposal_request", None)
    request_notes = proposal_request.notes if proposal_request else ""
    requirement = lead.service_requirements.order_by("-updated_at", "-id").first()
    offering = service or product or (requirement.service if requirement else "")
    purpose = (
        lead.requirement_summary
        or (requirement.required_solution if requirement else "")
        or request_notes
        or (target.notes if target else "")
        or (f"Proposal for {offering}" if offering else f"Proposal for {company_name or customer_name}")
    )
    approved_cost = lead.cost_estimates.filter(approval_status="APPROVED").order_by("-updated_at", "-id").first()
    estimated_value = (
        approved_cost.final_amount if approved_cost
        else requirement.estimated_budget if requirement and requirement.estimated_budget is not None
        else lead.estimated_value
    )
    requirement_items = list(lead.requirement_items.order_by("id")[:50])
    proposal_services = [
        {
            "description": item.title or item.description,
            "quantity": 1,
            "rate": item.estimated_cost or 0,
            "amount": item.estimated_cost or 0,
            "gst": 18,
        }
        for item in requirement_items
    ]
    if not proposal_services:
        proposal_services = [{
            "description": offering or purpose,
            "quantity": 1,
            "rate": estimated_value or 0,
            "amount": estimated_value or 0,
            "gst": 18,
        }]
    return {
        "company_name": company_name,
        "customer_name": customer_name,
        "contact_person": contact_person,
        "phone": phone,
        "whatsapp_number": whatsapp_number,
        "email": email,
        "address": address,
        "website": target.website if target else "",
        "product": product,
        "service": service,
        "purpose": purpose,
        "estimated_value": estimated_value,
        "proposal_services": proposal_services,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def next_proposal_no(request):
    denial = _require_any_permission(request, "proposals.create", "lead.create_proposal", "lead.view_my_profile")
    if denial:
        return denial
    year = date.today().year
    prefix = f"AD/{year}/"
    existing_seqs = set()
    for proposal_no in Proposal.objects.filter(proposal_no__startswith=prefix).values_list("proposal_no", flat=True):
        try:
            existing_seqs.add(int(proposal_no.split("/")[-1]))
        except (ValueError, IndexError):
            continue
    candidate = max(existing_seqs, default=1000) + 1
    while candidate in existing_seqs:
        candidate += 1
    return Response({"proposal_no": f"{prefix}{candidate:04d}"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_clients(request):
    denial = require_permission(request, "clients.view")
    if denial:
        return denial
    return Response(ClientSerializer(Client.objects.all().order_by("company_name", "name"), many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_client(request):
    denial = require_permission(request, "clients.create")
    if denial:
        return denial
    serializer = ClientSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_client_from_lead(request, lead_id):
    denial = _require_any_permission(request, "proposals.create", "lead.create_proposal")
    if denial:
        return denial
    with transaction.atomic():
        lead = get_object_or_404(lead_queryset_for(request.user).select_for_update(), pk=lead_id)
        snapshot = _lead_snapshot(lead)
        if lead.customer_id:
            client = Client.objects.select_for_update().get(pk=lead.customer_id)
            created = False
        else:
            matches = DuplicateCustomerMatchingService.find(
                phone=snapshot["phone"] or snapshot["whatsapp_number"],
                email=snapshot["email"],
                company_name=snapshot["company_name"],
            )
            if matches:
                client = Client.objects.select_for_update().get(pk=matches[0]["id"])
                created = False
            else:
                client = Client.objects.create(
                    company_name=snapshot["company_name"] or None,
                    name=snapshot["customer_name"] or snapshot["contact_person"] or snapshot["company_name"] or "Lead customer",
                    address=snapshot["address"] or None,
                    email=snapshot["email"] or None,
                    contact=snapshot["phone"] or snapshot["whatsapp_number"] or None,
                    gstin=str(request.data.get("gstin") or "").strip().upper() or None,
                    lut=str(request.data.get("lut") or "").strip() or None,
                )
                created = True
        client_updates = []
        for field, value in {
            "company_name": snapshot["company_name"],
            "name": snapshot["customer_name"] or snapshot["contact_person"] or snapshot["company_name"],
            "address": snapshot["address"],
            "email": snapshot["email"],
            "contact": snapshot["phone"] or snapshot["whatsapp_number"],
        }.items():
            if value and not getattr(client, field):
                setattr(client, field, value)
                client_updates.append(field)
        if client_updates:
            client.save(update_fields=client_updates)
        lead.customer = client
        lead.save(update_fields=["customer", "updated_at"])
    return Response({"created": created, "client": ClientSerializer(client).data}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_proposals(request):
    denial = require_permission(request, "proposals.view")
    if denial:
        return denial
    proposals = proposal_queryset_for(request.user).order_by("-id")
    return Response(ProposalSerializer(proposals, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_proposals(request):
    denial = _require_any_permission(request, "proposals.view", "lead.view_my_profile")
    if denial:
        return denial
    queryset = _my_proposal_queryset(request.user)
    search = request.query_params.get("search", "").strip()
    proposal_status = request.query_params.get("status", "").strip().lower()
    if search:
        queryset = queryset.filter(
            Q(proposal_no__icontains=search)
            | Q(company_name__icontains=search)
            | Q(client__name__icontains=search)
            | Q(client__company_name__icontains=search)
            | Q(source_leads__lead_number__icontains=search)
        ).distinct()
    counts = {
        row["status"] or "draft": row["count"]
        for row in queryset.values("status").annotate(count=Count("id"))
    }
    if proposal_status in {"draft", "sent", "approved"}:
        queryset = queryset.filter(status=proposal_status)
    queryset = queryset.order_by("-id")
    page = _positive_int(request.query_params.get("page"), 1)
    page_size = _positive_int(request.query_params.get("page_size"), 20, 100)
    total = queryset.count()
    start = (page - 1) * page_size
    request_queryset = (
        ProposalRequest.objects.select_related("lead", "lead__quotation", "requested_by")
        .filter(Q(requested_by=request.user) | Q(lead__in=my_profile_lead_queryset(request.user)))
        .distinct()
    )
    request_counts = {
        row["status"]: row["count"]
        for row in request_queryset.values("status").annotate(count=Count("id"))
    }
    return Response({
        "count": total,
        "page": page,
        "page_size": page_size,
        "counts": {"all": sum(counts.values()), **counts},
        "results": ProposalSerializer(queryset[start:start + page_size], many=True).data,
        "requests": ProposalRequestSerializer(request_queryset[:100], many=True).data,
        "request_counts": {"all": sum(request_counts.values()), **request_counts},
    })


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def proposal_requests(request):
    if request.method == "GET":
        denial = _require_any_permission(request, "proposals.view", "lead.view_my_profile")
        if denial:
            return denial
        visible_leads = lead_queryset_for(request.user).values("pk")
        queryset = (
            ProposalRequest.objects.select_related("lead", "lead__quotation", "requested_by")
            .filter(lead__in=visible_leads)
            .order_by("-updated_at", "-id")
        )
        return Response(ProposalRequestSerializer(queryset, many=True).data)

    denial = _require_any_permission(request, "lead.view_my_profile", "lead.create_proposal")
    if denial:
        return denial
    lead = get_object_or_404(my_profile_lead_queryset(request.user), pk=request.data.get("lead_id"))
    if lead.quotation_id:
        return Response(
            {"error": "This lead already has a proposal.", "code": "proposal_exists", "proposal_id": lead.quotation_id},
            status=status.HTTP_409_CONFLICT,
        )
    proposal_request, created = ProposalRequest.objects.get_or_create(
        lead=lead,
        defaults={"requested_by": request.user, "notes": str(request.data.get("notes") or "").strip()},
    )
    if not created:
        proposal_request.requested_by = request.user
        proposal_request.notes = str(request.data.get("notes") or proposal_request.notes).strip()
        if proposal_request.status in {"rejected", "completed"}:
            proposal_request.status = "pending"
        proposal_request.save(update_fields=["requested_by", "notes", "status", "updated_at"])
    return Response(
        ProposalRequestSerializer(proposal_request).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def proposal_detail(request, pk):
    denial = _require_any_permission(request, "proposals.view", "lead.view_my_profile")
    if denial:
        return denial
    proposal = get_object_or_404(proposal_queryset_for(request.user), pk=pk)
    return Response(ProposalSerializer(proposal).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def eligible_leads(request):
    denial = _require_any_permission(request, "proposals.create", "lead.create_proposal", "lead.view_my_profile")
    if denial:
        return denial
    queryset = lead_queryset_for(request.user).order_by("-updated_at", "-id")
    lead_id = request.query_params.get("lead_id")
    if lead_id:
        queryset = queryset.filter(pk=lead_id)
    search = request.query_params.get("search", "").strip()
    if search:
        queryset = queryset.filter(
            Q(lead_number__icontains=search)
            | Q(company_name__icontains=search)
            | Q(customer_name__icontains=search)
            | Q(contact_person__icontains=search)
            | Q(phone__icontains=search)
            | Q(email__icontains=search)
            | Q(product__icontains=search)
            | Q(service__icontains=search)
        )
    page = _positive_int(request.query_params.get("page"), 1)
    page_size = _positive_int(request.query_params.get("page_size"), 30, 100)
    total = queryset.count()
    start = (page - 1) * page_size
    results = []
    for lead in queryset[start:start + page_size]:
        snapshot = _lead_snapshot(lead)
        results.append({
            "id": lead.id,
            "lead_number": lead.lead_number,
            **snapshot,
            "requirement_summary": lead.requirement_summary,
            "current_stage": lead.current_stage,
            "assigned_to_name": lead.assigned_to.fullname if lead.assigned_to else "",
            "customer_record": ClientSerializer(lead.customer).data if lead.customer else None,
            "existing_proposal": (
                {"id": lead.quotation_id, "proposal_no": lead.quotation.proposal_no}
                if lead.quotation_id else None
            ),
            "proposal_request": (
                ProposalRequestSerializer(lead.proposal_request).data
                if hasattr(lead, "proposal_request") else None
            ),
        })
    return Response({"count": total, "page": page, "page_size": page_size, "results": results})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_proposal(request):
    lead_id = request.data.get("lead_id")
    if lead_id:
        denial = _require_any_permission(request, "proposals.create", "lead.create_proposal")
        if denial:
            return denial
        lead = get_object_or_404(lead_queryset_for(request.user), pk=lead_id)
        if lead.quotation_id:
            return Response(
                {
                    "error": "This lead already has a proposal.",
                    "code": "proposal_exists",
                    "existing_proposal": ProposalSerializer(lead.quotation).data,
                },
                status=status.HTTP_409_CONFLICT,
            )
        try:
            proposal = LeadQuotationService.create(
                lead,
                request.user,
                data=request.data,
                request=request,
                permission="lead.create_proposal",
            )
        except DuplicateCustomerError as exc:
            return Response(
                {"error": "A matching client already exists. Select it before saving.", "code": "client_match_required", "candidates": exc.candidates},
                status=status.HTTP_409_CONFLICT,
            )
        except (DjangoValidationError, PermissionDenied) as exc:
            detail = getattr(exc, "message_dict", None) or getattr(exc, "messages", None) or str(exc)
            return Response({"errors": detail}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)

    denial = require_permission(request, "proposals.create")
    if denial:
        return denial
    serializer = ProposalSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        proposal = serializer.save(created_by=request.user)
    return Response(ProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_proposal(request, pk):
    denial = require_permission(request, "proposals.update")
    if denial:
        return denial
    proposal = get_object_or_404(proposal_queryset_for(request.user), pk=pk)
    serializer = ProposalSerializer(proposal, data=request.data, partial=True, context={"request": request})
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        serializer.save()
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_client(request, pk):
    denial = require_permission(request, "clients.update")
    if denial:
        return denial
    client = get_object_or_404(Client, pk=pk)
    serializer = ClientSerializer(client, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_client(request, pk):
    denial = require_permission(request, "clients.delete")
    if denial:
        return denial
    client = get_object_or_404(Client, pk=pk)
    client.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_proposal(request, pk):
    denial = require_permission(request, "proposals.delete")
    if denial:
        return denial
    proposal = get_object_or_404(proposal_queryset_for(request.user), pk=pk)
    proposal.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

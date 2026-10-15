import logging
from datetime import date

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apis.leads.selectors import lead_queryset_for, my_profile_lead_queryset
from apis.leads.services import DuplicateCustomerError, DuplicateCustomerMatchingService, LeadQuotationService
from utils.permissions import has_permission, require_permission

from .models import Client, Proposal, ProposalRequest, ServicePackage, ServicePackageItem
from .serializers import ClientSerializer, ProposalRequestSerializer, ProposalSerializer, ServicePackageSerializer, ServicePackageItemSerializer


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

    req_data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
    client_id = req_data.get("client_id")
    if not client_id and (req_data.get("client_name") or req_data.get("company_name")):
        c_name = str(req_data.get("client_name") or req_data.get("company_name") or "Client").strip()
        comp_name = str(req_data.get("company_name") or "").strip()
        contact = str(req_data.get("contact") or "").strip()
        email = str(req_data.get("email") or "").strip().lower()
        address = str(req_data.get("address") or "").strip()
        gstin = str(req_data.get("gstin") or "").strip().upper() or None
        lut = str(req_data.get("lut") or "").strip() or None

        client = None
        if contact or email or comp_name:
            matches = DuplicateCustomerMatchingService.find(phone=contact, email=email, company_name=comp_name, gstin=gstin or "")
            if matches:
                client = Client.objects.filter(pk=matches[0]["id"]).first()
        if not client:
            client = Client.objects.create(
                company_name=comp_name or None,
                name=c_name,
                address=address or None,
                email=email or None,
                contact=contact or None,
                gstin=gstin,
                lut=lut,
            )
        req_data["client_id"] = client.id

    serializer = ProposalSerializer(data=req_data, context={"request": request})
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


DEFAULT_PACKAGES = [
    {
        "name": "Digital Marketing",
        "category": "Marketing",
        "description": "Accelerate brand visibility, drive qualified organic search traffic, and capture high-intent leads across search and social channels.",
        "scope_details": "Includes technical site audit, on-page optimization, meta tags, schema markup, authoritative backlink acquisition, monthly content calendar across Instagram/LinkedIn/Facebook, and Google/Meta ad campaign setup with weekly ROI reporting.",
        "items": [
            {"description": "Search Engine Optimization (On-page & Off-page)", "quantity": 1, "rate": 12000, "gst": 18, "order": 0},
            {"description": "Social Media Strategy & Content Creation (12 Posts/mo)", "quantity": 1, "rate": 15000, "gst": 18, "order": 1},
            {"description": "Google & Meta Ads Setup & Performance Optimization", "quantity": 1, "rate": 10000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Social Media Marketing",
        "category": "Marketing",
        "description": "Comprehensive social media management and creative storytelling to grow community, boost brand loyalty, and drive conversions.",
        "scope_details": "High-impact reels, carousel graphics, motion shorts, targeted paid advertising on Meta/YouTube, complete profile redesign, bio optimization, and community comment management.",
        "items": [
            {"description": "Monthly Social Media Content Calendar (Reels, Carousels & Posts)", "quantity": 1, "rate": 18000, "gst": 18, "order": 0},
            {"description": "Meta Ads (Instagram & Facebook) Campaign Management", "quantity": 1, "rate": 12000, "gst": 18, "order": 1},
            {"description": "Profile Optimization (Bio, Highlights, Links, SEO)", "quantity": 1, "rate": 5000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Lead Generation & Performance Ads",
        "category": "Marketing",
        "description": "Data-driven, ROI-focused performance marketing designed to generate qualified business inquiries, bookings, and revenue.",
        "scope_details": "High-converting custom landing pages, multi-channel paid ads funnel across Google, Meta, and YouTube with custom audience personas and A/B copy testing, plus CRM and WhatsApp automation flows.",
        "items": [
            {"description": "High-Converting Custom Landing Page Design & Funnel Setup", "quantity": 1, "rate": 15000, "gst": 18, "order": 0},
            {"description": "Multi-Channel Paid Ads Funnel (Meta, Google & YouTube)", "quantity": 1, "rate": 20000, "gst": 18, "order": 1},
            {"description": "CRM Lead Automation & WhatsApp Auto-Responder Flow", "quantity": 1, "rate": 10000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Website Design & Development",
        "category": "Development",
        "description": "Modern, lightning-fast, and responsive web solutions tailored to elevate brand presence and drive conversions.",
        "scope_details": "UI/UX wireframing in Figma, modern frontend development in Next.js/React, dynamic CMS and REST API backend integration, 95+ PageSpeed optimization, SSL, and contact forms.",
        "items": [
            {"description": "UI/UX Wireframing & Responsive Custom Design", "quantity": 1, "rate": 15000, "gst": 18, "order": 0},
            {"description": "Modern Web Frontend Development (Next.js / React)", "quantity": 1, "rate": 25000, "gst": 18, "order": 1},
            {"description": "Backend Integration, Dynamic CMS & Speed Optimization", "quantity": 1, "rate": 15000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "E-Commerce Website",
        "category": "Development",
        "description": "Full-featured, conversion-optimized online store designed for seamless shopping experiences and scalable commercial operations.",
        "scope_details": "Product catalog configuration, inventory alerts, payment gateway integration (Razorpay/Stripe), courier logistics APIs, admin sales analytics dashboard, coupon engine, and mobile CRO.",
        "items": [
            {"description": "E-Commerce Store Setup & Product Catalog Configuration", "quantity": 1, "rate": 25000, "gst": 18, "order": 0},
            {"description": "Payment Gateway, Shipping API & Invoice Automation", "quantity": 1, "rate": 10000, "gst": 18, "order": 1},
            {"description": "Admin Dashboard, Inventory Tracking & Coupon Engine", "quantity": 1, "rate": 15000, "gst": 18, "order": 2},
            {"description": "Mobile-First Conversion Rate Optimization (CRO)", "quantity": 1, "rate": 10000, "gst": 18, "order": 3},
        ],
    },
    {
        "name": "Mobile App Development",
        "category": "Development",
        "description": "Enterprise-grade native and cross-platform mobile application development for iOS and Android.",
        "scope_details": "Mobile UI/UX design system in Figma, 60fps Flutter/React Native app development, scalable cloud database and REST API architecture, and Apple App Store / Google Play Store release.",
        "items": [
            {"description": "Mobile App UI/UX Design System & Interactive Prototypes", "quantity": 1, "rate": 25000, "gst": 18, "order": 0},
            {"description": "Cross-Platform Mobile App (Flutter / React Native - iOS & Android)", "quantity": 1, "rate": 65000, "gst": 18, "order": 1},
            {"description": "Scalable Backend REST API & Cloud Database Architecture", "quantity": 1, "rate": 25000, "gst": 18, "order": 2},
            {"description": "Apple App Store & Google Play Store Publishing & CI/CD", "quantity": 1, "rate": 10000, "gst": 18, "order": 3},
        ],
    },
    {
        "name": "CRM / ERP Solutions",
        "category": "Enterprise",
        "description": "Tailor-made Enterprise Resource Planning and Customer Relationship Management platforms to unify business operations.",
        "scope_details": "Business process mapping, sales pipeline tracking, inventory and GST billing automation, role-based security permissions, multi-branch support, and staff onboarding training.",
        "items": [
            {"description": "Business Process Mapping & Architecture Consultation", "quantity": 1, "rate": 25000, "gst": 18, "order": 0},
            {"description": "Sales Pipeline & Lead Management CRM Module", "quantity": 1, "rate": 35000, "gst": 18, "order": 1},
            {"description": "Billing, Tax Invoicing & Inventory Management System", "quantity": 1, "rate": 35000, "gst": 18, "order": 2},
            {"description": "User Roles, Permissions & Team Training Sessions", "quantity": 1, "rate": 15000, "gst": 18, "order": 3},
        ],
    },
    {
        "name": "Branding & Identity Design",
        "category": "Design & Creative",
        "description": "Strategic brand design that transforms business concepts into memorable, recognizable market leaders.",
        "scope_details": "Primary and secondary logo suite, vector master files (AI/SVG/PDF), brand manual with color palettes and font hierarchy, business cards, letterhead, and social media template kits.",
        "items": [
            {"description": "Primary Logo Design (3 Concepts, Scalable Vectors & Color Codes)", "quantity": 1, "rate": 12000, "gst": 18, "order": 0},
            {"description": "Brand Identity Manual (Typography, Palette & Usage Guidelines)", "quantity": 1, "rate": 10000, "gst": 18, "order": 1},
            {"description": "Brand Stationery (Business Cards, Letterhead & Social Media Kit)", "quantity": 1, "rate": 8000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Graphic Design",
        "category": "Design & Creative",
        "description": "High-end graphic design services for print, digital advertising, and corporate collateral.",
        "scope_details": "Flyers, corporate brochures, pitch decks, monthly social media graphic pack, infographics, display banners, and CMYK packaging print-ready files.",
        "items": [
            {"description": "Marketing Collateral Design (Flyers, Brochures & Pitch Decks)", "quantity": 1, "rate": 8000, "gst": 18, "order": 0},
            {"description": "Monthly Social Media Graphics Package (15 Creatives)", "quantity": 1, "rate": 12000, "gst": 18, "order": 1},
            {"description": "Packaging & Print Production Ready Assets", "quantity": 1, "rate": 10000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Photoshoot & Video Production",
        "category": "Media Production",
        "description": "In-house commercial media production to capture products, facilities, and brand stories in cinematic clarity.",
        "scope_details": "Full day studio/location product photography, cinematic corporate promotional video with professional lighting and audio, and licensed drone aerial videography.",
        "items": [
            {"description": "Commercial Brand & Product Photography (Full Day Studio/Location)", "quantity": 1, "rate": 25000, "gst": 18, "order": 0},
            {"description": "Cinematic Corporate / Promo Video Production & Direction", "quantity": 1, "rate": 35000, "gst": 18, "order": 1},
            {"description": "Drone & 4K Aerial Videography with Licensed Pilot", "quantity": 1, "rate": 15000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Video Editing & Creative Enhancements",
        "category": "Media Production",
        "description": "Professional post-production turning raw footage into viral, attention-grabbing visual assets.",
        "scope_details": "High-retention editing for Instagram Reels/Shorts with animated captions, master color grading, dynamic sound design, licensed audio, and motion graphic title cards.",
        "items": [
            {"description": "Social Media Reels / TikToks / Shorts Editing (Pack of 10)", "quantity": 1, "rate": 15000, "gst": 18, "order": 0},
            {"description": "Commercial Video Post-Production, Color Grading & Sound Mix", "quantity": 1, "rate": 20000, "gst": 18, "order": 1},
            {"description": "Custom Motion Graphics, Lower Thirds & Animated Titles", "quantity": 1, "rate": 10000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "SEO & Search Optimization",
        "category": "Marketing",
        "description": "Data-backed search engine optimization to establish organic domain authority and rank higher on Google.",
        "scope_details": "Crawl audit, XML sitemaps, robots.txt, Core Web Vitals remediation, high-intent keyword clustering, on-page content optimization, schema markup, and white-hat backlink outreach.",
        "items": [
            {"description": "Comprehensive Technical SEO & Core Web Vitals Audit", "quantity": 1, "rate": 10000, "gst": 18, "order": 0},
            {"description": "On-Page SEO, Content Optimization & Schema Markup", "quantity": 1, "rate": 12000, "gst": 18, "order": 1},
            {"description": "High-Authority Backlink Acquisition & Monthly Keyword Tracking", "quantity": 1, "rate": 15000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Content Marketing & Copywriting",
        "category": "Content",
        "description": "Persuasive, SEO-optimized copywriting that educates prospects, establishes authority, and inspires action.",
        "scope_details": "Long-form research blog posts, high-converting website landing page copy, email newsletter drip sequences, and company thought leadership articles.",
        "items": [
            {"description": "SEO Blog Articles & Industry Thought Leadership (4 Articles/mo)", "quantity": 1, "rate": 10000, "gst": 18, "order": 0},
            {"description": "High-Converting Website Copywriting (5 Core Pages)", "quantity": 1, "rate": 15000, "gst": 18, "order": 1},
            {"description": "Email Marketing Sequences & Newsletter Campaign Setup", "quantity": 1, "rate": 8000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Website Maintenance & AMC",
        "category": "Maintenance",
        "description": "Dedicated annual maintenance and cloud hosting support to guarantee 99.9% uptime and high security.",
        "scope_details": "High-speed cloud server hosting, SSL certificate management, weekly security scans, off-site daily backups, core software updates, and 24/7 technical incident support.",
        "items": [
            {"description": "High-Speed Managed Cloud Server Hosting, SSL & CDN Setup", "quantity": 1, "rate": 8000, "gst": 18, "order": 0},
            {"description": "Monthly Security Audits, Daily Backups & Core Plugin Updates", "quantity": 1, "rate": 12000, "gst": 18, "order": 1},
            {"description": "Dedicated Technical Support & Performance Monitoring (24/7)", "quantity": 1, "rate": 5000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Influencer Marketing & PR",
        "category": "Marketing",
        "description": "End-to-end influencer campaigns and digital PR to build brand trust and reach high-intent consumer demographics.",
        "scope_details": "Micro and macro influencer selection, negotiation, contract execution, creative campaign briefs, product seeding, and press release distribution across leading digital media.",
        "items": [
            {"description": "Influencer Identification, Outreach & Contract Negotiations", "quantity": 1, "rate": 20000, "gst": 18, "order": 0},
            {"description": "Campaign Strategy, Creative Briefs & Deliverables Quality Check", "quantity": 1, "rate": 15000, "gst": 18, "order": 1},
            {"description": "Digital PR Distribution Across Regional & National Media", "quantity": 1, "rate": 15000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Custom App Development",
        "category": "Development",
        "description": "Full-stack custom software development addressing complex business workflows and enterprise data needs.",
        "scope_details": "System architecture design, scalable REST APIs, secure database schema, modern Next.js/React frontend interfaces, Docker containerization, and AWS/GCP cloud deployment.",
        "items": [
            {"description": "Technical Architecture & System Requirements Specification", "quantity": 1, "rate": 20000, "gst": 18, "order": 0},
            {"description": "Enterprise Core Backend Development & RESTful APIs", "quantity": 1, "rate": 45000, "gst": 18, "order": 1},
            {"description": "Cloud Infrastructure Setup, Dockerization & CI/CD Pipeline", "quantity": 1, "rate": 15000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Project Management",
        "category": "Consulting",
        "description": "Professional agile project management ensuring technology and marketing initiatives are delivered on time.",
        "scope_details": "Sprint planning, milestone backlogs, Gantt charts, dedicated Scrum master, cross-device QA testing, risk mitigation, and executive reporting burn-down charts.",
        "items": [
            {"description": "Agile Project Planning, Sprint Milestones & Scope Roadmap", "quantity": 1, "rate": 15000, "gst": 18, "order": 0},
            {"description": "Dedicated Scrum Master, QA Testing & Weekly Progress Reports", "quantity": 1, "rate": 15000, "gst": 18, "order": 1},
            {"description": "Production Deployment, User Handover & Training Documentation", "quantity": 1, "rate": 10000, "gst": 18, "order": 2},
        ],
    },
    {
        "name": "Campaigns",
        "category": "Marketing",
        "description": "High-impact seasonal and promotional ad campaigns built to generate massive momentum for new launches.",
        "scope_details": "Multi-channel PPC advertising blitz across Google Search, Shopping, Meta, and YouTube with custom promotional landing pages and retargeting cart-recovery funnels.",
        "items": [
            {"description": "High-ROI PPC Campaign Setup (Google Search & Shopping Ads)", "quantity": 1, "rate": 15000, "gst": 18, "order": 0},
            {"description": "Seasonal Festival / Product Launch Promotional Campaign", "quantity": 1, "rate": 15000, "gst": 18, "order": 1},
            {"description": "Full-Funnel Retargeting & Lead Generation Campaign", "quantity": 1, "rate": 12000, "gst": 18, "order": 2},
        ],
    },
]


def seed_default_packages_if_empty():
    if ServicePackage.objects.count() == 0:
        for pkg_data in DEFAULT_PACKAGES:
            items_data = pkg_data.get("items", [])
            pkg = ServicePackage.objects.create(
                name=pkg_data["name"],
                category=pkg_data.get("category", "General"),
                description=pkg_data.get("description", ""),
                scope_details=pkg_data.get("scope_details", ""),
            )
            for idx, it in enumerate(items_data):
                ServicePackageItem.objects.create(
                    package=pkg,
                    description=it["description"],
                    quantity=it.get("quantity", 1),
                    rate=it.get("rate", 0),
                    gst=it.get("gst", 18),
                    order=it.get("order", idx),
                )


@api_view(["GET"])
@permission_classes([AllowAny])
def list_packages(request):
    seed_default_packages_if_empty()
    queryset = ServicePackage.objects.prefetch_related("items").filter(is_active=True).order_by("category", "name")
    search = request.query_params.get("search", "").strip()
    category = request.query_params.get("category", "").strip()
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(description__icontains=search)
            | Q(category__icontains=search)
            | Q(items__description__icontains=search)
        ).distinct()
    if category and category.lower() != "all":
        queryset = queryset.filter(category__iexact=category)
    serializer = ServicePackageSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def create_package(request):
    name = (request.data.get("name") or "").strip()
    if not name:
        return Response({"error": "Package name is required."}, status=status.HTTP_400_BAD_REQUEST)
    if ServicePackage.objects.filter(name__iexact=name).exists():
        return Response({"error": f"Package with name '{name}' already exists."}, status=status.HTTP_400_BAD_REQUEST)
    serializer = ServicePackageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        package = serializer.save()
    return Response(ServicePackageSerializer(package).data, status=status.HTTP_201_CREATED)


@api_view(["PUT", "PATCH"])
@permission_classes([AllowAny])
def update_package(request, pk):
    package = get_object_or_404(ServicePackage, pk=pk)
    name = (request.data.get("name") or "").strip()
    if name and ServicePackage.objects.filter(name__iexact=name).exclude(pk=pk).exists():
        return Response({"error": f"Another package with name '{name}' already exists."}, status=status.HTTP_400_BAD_REQUEST)
    serializer = ServicePackageSerializer(package, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        package = serializer.save()
    return Response(ServicePackageSerializer(package).data)


@api_view(["DELETE"])
@permission_classes([AllowAny])
def delete_package(request, pk):
    package = get_object_or_404(ServicePackage, pk=pk)
    package.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_packages(request):
    with transaction.atomic():
        ServicePackageItem.objects.all().delete()
        ServicePackage.objects.all().delete()
        for pkg_data in DEFAULT_PACKAGES:
            items_data = pkg_data.get("items", [])
            pkg = ServicePackage.objects.create(
                name=pkg_data["name"],
                category=pkg_data.get("category", "General"),
                description=pkg_data.get("description", ""),
                scope_details=pkg_data.get("scope_details", ""),
            )
            for idx, it in enumerate(items_data):
                ServicePackageItem.objects.create(
                    package=pkg,
                    description=it["description"],
                    quantity=it.get("quantity", 1),
                    rate=it.get("rate", 0),
                    gst=it.get("gst", 18),
                    order=it.get("order", idx),
                )
    packages = ServicePackage.objects.prefetch_related("items").filter(is_active=True).order_by("category", "name")
    return Response(ServicePackageSerializer(packages, many=True).data)

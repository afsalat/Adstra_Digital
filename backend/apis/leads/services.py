"""Transactional domain services for lead-management state changes.

Views and serializers must never mutate ``Lead.current_stage`` directly.  This
module is the single boundary for stage changes and other sensitive actions.
"""

from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from apis.invoice.models import Invoice, create_invoice_from_proposal
from apis.proposal.models import Client, Proposal, ProposalSection, ProposalService
from utils.logging_helper import log_action
from utils.permissions import has_permission

from .choices import (
    ACTIVE_LEAD_STAGES,
    LEAD_STAGE_CHOICES,
    REJECTION_REASON_CHOICES,
)
from .models import (
    Lead,
    LeadActivity,
    LeadAssignmentHistory,
    LeadConversion,
    LeadCostEstimate,
    LeadMeeting,
    LeadRejection,
    LeadTask,
    ProductDemo,
    ServiceRequirement,
)
from .validators import normalize_phone


VALID_STAGES = {value for value, _label in LEAD_STAGE_CHOICES}
VALID_REJECTION_REASONS = {value for value, _label in REJECTION_REASON_CHOICES}


def _require_actor(actor):
    if not actor or not getattr(actor, "is_authenticated", False):
        raise PermissionDenied("An authenticated actor is required.")


def _require_permission(actor, code):
    _require_actor(actor)
    if not has_permission(actor, code):
        raise PermissionDenied(f"Permission '{code}' is required.")


def _record_activity(lead, activity_type, title, actor, *, description="", metadata=None):
    return LeadActivity.objects.create(
        lead=lead,
        activity_type=activity_type,
        title=title,
        description=description,
        actor=actor,
        metadata=metadata or {},
    )


def _audit(actor, action, details, request=None):
    if actor:
        log_action(actor, action, details, request)


class DuplicateCustomerError(ValidationError):
    """Raised when conversion needs an explicit existing-customer choice."""

    def __init__(self, candidates):
        self.candidates = candidates
        super().__init__("Possible duplicate customers found. Select one or confirm creation.")


class LeadWorkflowService:
    TRANSITIONS = {
        "TARGETED": {"NEW"},
        "NEW": {"ASSIGNED"},
        "ASSIGNED": {"CONTACT_ATTEMPTED"},
        "CONTACT_ATTEMPTED": {"CONNECTED", "FOLLOW_UP_REQUIRED", "REJECTED"},
        "CONNECTED": {"QUALIFIED", "FOLLOW_UP_REQUIRED", "REJECTED"},
        "QUALIFIED": {"DEMO_SCHEDULED", "REQUIREMENT_MEETING_SCHEDULED"},
        "FOLLOW_UP_REQUIRED": {
            "CONTACT_ATTEMPTED", "CONNECTED", "QUALIFIED", "DEMO_SCHEDULED",
            "REQUIREMENT_MEETING_SCHEDULED", "REJECTED",
        },
        "DEMO_SCHEDULED": {"DEMO_COMPLETED"},
        "DEMO_COMPLETED": {"CUSTOMIZATION_REQUIRED", "COST_ESTIMATION", "FOLLOW_UP_REQUIRED", "REJECTED"},
        "CUSTOMIZATION_REQUIRED": {"REQUIREMENT_MEETING_SCHEDULED"},
        "REQUIREMENT_MEETING_SCHEDULED": {"REQUIREMENT_COLLECTED"},
        "REQUIREMENT_COLLECTED": {"TECHNICAL_REVIEW", "COST_ESTIMATION"},
        "TECHNICAL_REVIEW": {"FEASIBILITY_REVIEW"},
        "FEASIBILITY_REVIEW": {"COST_ESTIMATION", "REJECTED"},
        "COST_ESTIMATION": {"PROPOSAL_PREPARATION"},
        "PROPOSAL_PREPARATION": {"PROPOSAL_SENT"},
        "PROPOSAL_SENT": {"QUOTATION_SENT"},
        "QUOTATION_SENT": {"NEGOTIATION"},
        "NEGOTIATION": {"DECISION_PENDING", "QUOTATION_SENT"},
        "DECISION_PENDING": {"CONVERTED", "REJECTED"},
    }

    TARGET_PERMISSIONS = {
        "DEMO_SCHEDULED": "lead.schedule_meeting",
        "DEMO_COMPLETED": "lead.complete_demo",
        "CUSTOMIZATION_REQUIRED": "lead.complete_demo",
        "REQUIREMENT_MEETING_SCHEDULED": "lead.schedule_meeting",
        "REQUIREMENT_COLLECTED": "lead.capture_requirement",
        "TECHNICAL_REVIEW": "lead.technical_review",
        "FEASIBILITY_REVIEW": "lead.technical_review",
        "COST_ESTIMATION": "lead.create_cost_estimate",
        "PROPOSAL_PREPARATION": "lead.create_proposal",
        "PROPOSAL_SENT": "lead.create_proposal",
        "QUOTATION_SENT": "lead.create_quotation",
        "CONVERTED": "lead.convert",
        "REJECTED": "lead.reject",
    }

    @classmethod
    def allowed_transitions(cls, lead):
        if lead.current_stage == "ON_HOLD":
            return [lead.stage_before_hold] if lead.stage_before_hold else []
        allowed = set(cls.TRANSITIONS.get(lead.current_stage, set()))
        if lead.current_stage in ACTIVE_LEAD_STAGES:
            allowed.add("ON_HOLD")
        return sorted(allowed)

    @classmethod
    def transition(
        cls,
        lead,
        target_stage,
        actor,
        *,
        reason="",
        metadata=None,
        request=None,
        _action="transition",
        _permission=None,
    ):
        _require_actor(actor)
        target_stage = str(target_stage or "").upper()
        if target_stage not in VALID_STAGES:
            raise ValidationError({"current_stage": "Unknown lead stage."})

        permission = _permission or cls.TARGET_PERMISSIONS.get(target_stage, "lead.edit")
        _require_permission(actor, permission)

        with transaction.atomic():
            locked = (
                Lead.objects.select_for_update()
                .select_related("target_customer", "quotation", "assigned_to")
                .get(pk=lead.pk)
            )
            source_stage = locked.current_stage
            if source_stage == target_stage:
                return locked

            if target_stage == "REJECTED" and _action != "rejection":
                raise ValidationError("Use the reject action so a reason and detailed notes are recorded.")
            if target_stage == "CONVERTED" and _action != "conversion":
                raise ValidationError("Use the conversion action for conversion stage changes.")
            if _action == "reopen":
                if source_stage not in {"REJECTED", "LOST"} or target_stage != "NEW":
                    raise ValidationError("Only rejected or lost leads can be reopened to NEW.")
            elif source_stage == "ON_HOLD":
                if not locked.stage_before_hold or target_stage != locked.stage_before_hold:
                    raise ValidationError("An on-hold lead can only resume its previous stage.")
            else:
                allowed = set(cls.TRANSITIONS.get(source_stage, set()))
                if source_stage in ACTIVE_LEAD_STAGES:
                    allowed.add("ON_HOLD")
                if target_stage not in allowed:
                    raise ValidationError(
                        {"current_stage": f"Transition {source_stage} -> {target_stage} is not permitted."}
                    )

            cls._validate_prerequisites(locked, source_stage, target_stage)
            previous_for_hold = source_stage if target_stage == "ON_HOLD" else ""
            locked._save_workflow_stage(target_stage, previous_stage=previous_for_hold)

            activity_type = "STAGE_CHANGED"
            if target_stage == "ON_HOLD":
                activity_type = "PUT_ON_HOLD"
            elif source_stage == "ON_HOLD":
                activity_type = "RESUMED"
            elif target_stage == "REJECTED":
                activity_type = "REJECTED"
            elif target_stage == "CONVERTED":
                activity_type = "CONVERTED"
            elif _action == "reopen":
                activity_type = "REOPENED"

            event_metadata = {"from_stage": source_stage, "to_stage": target_stage}
            event_metadata.update(metadata or {})
            _record_activity(
                locked,
                activity_type,
                f"Stage changed from {source_stage} to {target_stage}",
                actor,
                description=reason,
                metadata=event_metadata,
            )
            _audit(
                actor,
                "Lead Stage Changed",
                f"{locked.lead_number}: {source_stage} -> {target_stage}. {reason}".strip(),
                request,
            )
            return locked

    @classmethod
    def _validate_prerequisites(cls, lead, source_stage, target_stage):
        if target_stage == "ASSIGNED" and not lead.assigned_to_id:
            raise ValidationError("Assign the lead to an active user before moving it to ASSIGNED.")

        if target_stage == "DEMO_SCHEDULED":
            if lead.lead_type != "PRODUCT":
                raise ValidationError("Only product leads can schedule a product demo.")
            if not lead.meetings.filter(
                meeting_type="PRODUCT_DEMO",
                status__in=["SCHEDULED", "CONFIRMED", "RESCHEDULED"],
            ).exists():
                raise ValidationError("Schedule a product-demo meeting before this transition.")

        if target_stage == "REQUIREMENT_MEETING_SCHEDULED":
            customized_product = lead.demos.filter(
                customization_required=True,
                completed_at__isnull=False,
            ).exists()
            if lead.lead_type == "PRODUCT" and not customized_product:
                raise ValidationError("A product lead needs a completed customization-required demo first.")
            valid_types = ["SERVICE_REQUIREMENT"] if lead.lead_type == "SERVICE" else ["CUSTOMIZATION_REQUIREMENT"]
            if not lead.meetings.filter(
                meeting_type__in=valid_types,
                status__in=["SCHEDULED", "CONFIRMED", "RESCHEDULED"],
            ).exists():
                raise ValidationError("Schedule the required requirement meeting first.")

        if target_stage == "DEMO_COMPLETED":
            if not lead.demos.filter(completed_at__isnull=False).exists():
                raise ValidationError("A completed product demo record is required.")

        if target_stage == "CUSTOMIZATION_REQUIRED":
            if not lead.demos.filter(customization_required=True, completed_at__isnull=False).exists():
                raise ValidationError("The completed demo must mark customization as required.")

        if target_stage in {"REQUIREMENT_COLLECTED", "TECHNICAL_REVIEW", "FEASIBILITY_REVIEW"}:
            requirements = lead.service_requirements.filter(
                requirement_status__in=["COLLECTED", "UNDER_REVIEW", "APPROVED", "COMPLETED"]
            )
            if not requirements.exists():
                raise ValidationError("Collected requirement data is required for this transition.")

        if target_stage == "COST_ESTIMATION":
            if source_stage == "DEMO_COMPLETED" and lead.demos.filter(customization_required=True).exists():
                raise ValidationError("Customized products must complete requirement and feasibility review first.")
            if source_stage == "REQUIREMENT_COLLECTED" and lead.service_requirements.filter(
                technical_review_required=True
            ).exists():
                raise ValidationError("Technical review is required before cost estimation.")
            if source_stage == "FEASIBILITY_REVIEW" and not lead.service_requirements.filter(
                feasibility_status__in=["FEASIBLE", "FEASIBLE_WITH_CHANGES"]
            ).exists():
                raise ValidationError("A feasible requirement result is required for cost estimation.")

        if target_stage == "REJECTED" and source_stage == "FEASIBILITY_REVIEW":
            if not lead.service_requirements.filter(feasibility_status="NOT_FEASIBLE").exists():
                raise ValidationError("A not-feasible requirement result is required for this rejection.")

        if target_stage == "PROPOSAL_PREPARATION":
            if not lead.cost_estimates.filter(approval_status="APPROVED").exists():
                raise ValidationError("An approved cost estimate is required before proposal preparation.")

        if target_stage in {"PROPOSAL_SENT", "QUOTATION_SENT", "NEGOTIATION", "DECISION_PENDING", "CONVERTED"}:
            if not lead.quotation_id:
                raise ValidationError("An existing Proposal/quotation record is required.")

        if target_stage == "REJECTED" and not lead.rejections.exists():
            raise ValidationError("A rejection record is required.")
        if target_stage == "CONVERTED" and not hasattr(lead, "conversion"):
            raise ValidationError("A conversion record is required.")


class LeadAssignmentService:
    @classmethod
    def assign(cls, lead, assigned_to, actor, *, reason="", request=None):
        _require_actor(actor)
        if not assigned_to or not getattr(assigned_to, "is_active", False):
            raise ValidationError({"assigned_to": "Select an active user."})

        with transaction.atomic():
            locked = Lead.objects.select_for_update().select_related("assigned_to").get(pk=lead.pk)
            is_reassignment = locked.assigned_to_id is not None and locked.assigned_to_id != assigned_to.pk
            permission = "lead.reassign" if is_reassignment else "lead.assign"
            _require_permission(actor, permission)
            if locked.assigned_to_id == assigned_to.pk:
                return locked

            previous = locked.assigned_to
            locked.assigned_to = assigned_to
            locked.assigned_by = actor
            locked.save(update_fields=["assigned_to", "assigned_by", "updated_at"])
            LeadAssignmentHistory.objects.create(
                lead=locked,
                assigned_from=previous,
                assigned_to=assigned_to,
                assigned_by=actor,
                reason=reason,
            )
            event = "REASSIGNED" if is_reassignment else "ASSIGNED"
            _record_activity(
                locked,
                event,
                f"Lead {event.lower()} to {assigned_to.fullname or assigned_to.username}",
                actor,
                description=reason,
                metadata={"from_user_id": getattr(previous, "id", None), "to_user_id": assigned_to.id},
            )
            _audit(actor, f"Lead {event.title()}", f"{locked.lead_number} -> {assigned_to.username}", request)
            if locked.current_stage == "NEW":
                locked = LeadWorkflowService.transition(
                    locked,
                    "ASSIGNED",
                    actor,
                    reason="Lead assigned",
                    request=request,
                    _permission=permission,
                )
            return locked

    reassign = assign


class LeadRejectionService:
    @classmethod
    def reject(
        cls,
        lead,
        actor,
        *,
        reason,
        detailed_notes,
        competitor="",
        recontact_allowed=False,
        recontact_at=None,
        request=None,
    ):
        _require_permission(actor, "lead.reject")
        if reason not in VALID_REJECTION_REASONS:
            raise ValidationError({"reason": "Select a valid rejection reason."})
        if not str(detailed_notes or "").strip():
            raise ValidationError({"detailed_notes": "Detailed rejection notes are required."})
        if recontact_at and (not recontact_allowed or recontact_at <= timezone.now()):
            raise ValidationError({"recontact_at": "Recontact must be enabled and scheduled in the future."})

        with transaction.atomic():
            locked = Lead.objects.select_for_update().get(pk=lead.pk)
            rejection = LeadRejection(
                lead=locked,
                reason=reason,
                detailed_notes=str(detailed_notes).strip(),
                competitor=competitor,
                rejected_by=actor,
                recontact_allowed=recontact_allowed,
                recontact_at=recontact_at,
            )
            rejection.full_clean()
            rejection.save()
            locked = LeadWorkflowService.transition(
                locked,
                "REJECTED",
                actor,
                reason=str(detailed_notes).strip(),
                metadata={"rejection_id": rejection.id, "reason": reason},
                request=request,
                _action="rejection",
            )
            _audit(actor, "Lead Rejected", f"{locked.lead_number}: {reason}", request)
            return rejection


class LeadReopenService:
    @classmethod
    def reopen(cls, lead, actor, *, reason, request=None):
        _require_permission(actor, "lead.reopen")
        if not str(reason or "").strip():
            raise ValidationError({"reason": "A reopen reason is required."})
        with transaction.atomic():
            locked = Lead.objects.select_for_update().get(pk=lead.pk)
            reopened = LeadWorkflowService.transition(
                locked,
                "NEW",
                actor,
                reason=str(reason).strip(),
                request=request,
                _action="reopen",
                _permission="lead.reopen",
            )
            _audit(actor, "Lead Reopened", f"{reopened.lead_number}: {reason}", request)
            return reopened


class DuplicateCustomerMatchingService:
    @staticmethod
    def find(*, phone="", email="", company_name="", gstin=""):
        normalized_phone = ""
        if phone:
            try:
                normalized_phone = normalize_phone(phone)
            except ValidationError:
                normalized_phone = ""
        normalized_email = str(email or "").strip().lower()
        normalized_company = " ".join(str(company_name or "").split()).strip()
        normalized_gstin = str(gstin or "").strip().upper()

        query = Q(pk__in=[])
        if normalized_email:
            query |= Q(email__iexact=normalized_email)
        if normalized_company:
            query |= Q(company_name__iexact=normalized_company)
        if normalized_gstin:
            query |= Q(gstin__iexact=normalized_gstin)
        if normalized_phone:
            query |= Q(contact__icontains=normalized_phone[-10:])

        candidates = []
        for client in Client.objects.filter(query).order_by("id")[:25]:
            reasons = []
            client_phone = ""
            if client.contact:
                try:
                    client_phone = normalize_phone(client.contact)
                except ValidationError:
                    client_phone = ""
            if normalized_phone and client_phone and client_phone[-10:] == normalized_phone[-10:]:
                reasons.append("phone")
            if normalized_email and (client.email or "").strip().lower() == normalized_email:
                reasons.append("email")
            if normalized_company and (client.company_name or "").strip().casefold() == normalized_company.casefold():
                reasons.append("company_name")
            if normalized_gstin and (client.gstin or "").strip().upper() == normalized_gstin:
                reasons.append("gstin")
            if reasons:
                candidates.append({
                    "id": client.id,
                    "name": client.name,
                    "company_name": client.company_name,
                    "email": client.email,
                    "contact": client.contact,
                    "gstin": client.gstin,
                    "matched_on": reasons,
                })
        return candidates

    @classmethod
    def for_lead(cls, lead, *, gstin=""):
        return cls.find(
            phone=lead.phone or lead.whatsapp_number,
            email=lead.email,
            company_name=lead.company_name,
            gstin=gstin,
        )


class LeadQuotationService:
    @classmethod
    def create(cls, lead, actor, *, data=None, request=None, permission="lead.create_quotation"):
        _require_permission(actor, permission)
        data = data or {}
        with transaction.atomic():
            locked = Lead.objects.select_for_update().select_related("customer", "quotation").get(pk=lead.pk)
            if locked.quotation_id:
                return locked.quotation

            year = timezone.localdate().year
            proposal_no = data.get("proposal_no") or f"AD/{year}/LEAD-{locked.id}"
            total = Decimal(str(data.get("total_amount") or locked.estimated_value or "0"))
            client = locked.customer
            client_id = data.get("client_id")
            if client_id:
                try:
                    client = Client.objects.select_for_update().get(pk=client_id)
                except Client.DoesNotExist as exc:
                    raise ValidationError({"client_id": "Client not found."}) from exc
            elif client is None:
                matches = DuplicateCustomerMatchingService.for_lead(
                    locked,
                    gstin=data.get("gstin", ""),
                )
                if matches and not data.get("confirm_create_client"):
                    raise DuplicateCustomerError(matches)
                phone = ""
                if locked.phone or locked.whatsapp_number:
                    phone = normalize_phone(locked.phone or locked.whatsapp_number)
                client = Client(
                    company_name=" ".join((locked.company_name or "").split()) or None,
                    name=locked.customer_name or locked.contact_person or locked.company_name or "Lead customer",
                    address=locked.address or None,
                    gstin=str(data.get("gstin") or "").strip().upper() or None,
                    lut=str(data.get("lut") or "").strip() or None,
                    email=(locked.email or "").strip().lower() or None,
                    contact=phone or None,
                )
                client.full_clean()
                client.save()

            proposal = Proposal(
                proposal_no=proposal_no,
                reference=locked.lead_number,
                company_name=data.get("company_name") or locked.company_name,
                purpose=data.get("purpose") or locked.requirement_summary or locked.product or locked.service,
                total_amount=total,
                total_in_words=data.get("total_in_words") or "",
                client=client,
                notes=data.get("notes") or "",
                status=data.get("status") or "draft",
                created_by=actor,
            )
            proposal.full_clean()
            proposal.save()
            for item in data.get("services", []):
                service = ProposalService(
                    proposal=proposal,
                    description=item.get("description") or locked.product or locked.service,
                    quantity=item.get("quantity") or 1,
                    rate=item.get("rate") or total,
                    amount=item.get("amount") or total,
                    gst=item.get("gst") or 0,
                )
                service.full_clean()
                service.save()
            for item in data.get("sections", []):
                section = ProposalSection(
                    proposal=proposal,
                    title=item.get("title") or "",
                    type=item.get("type") or "textarea",
                    alignment=item.get("alignment") or "left",
                    content=item.get("content") or "",
                )
                section.full_clean()
                section.save()
            if locked.customer_id != client.id:
                locked.customer = client
            locked.quotation = proposal
            locked.save(update_fields=["customer", "quotation", "updated_at"])
            if hasattr(locked, "proposal_request"):
                locked.proposal_request.status = "completed"
                locked.proposal_request.save(update_fields=["status", "updated_at"])
            _record_activity(
                locked,
                "QUOTATION",
                f"Quotation {proposal.proposal_no} created",
                actor,
                metadata={"proposal_id": proposal.id, "amount": str(total)},
            )
            _audit(actor, "Lead Quotation Created", f"{locked.lead_number}: {proposal.proposal_no}", request)
            return proposal


class LeadConversionService:
    @classmethod
    def convert(cls, lead, actor, *, data=None, request=None):
        _require_permission(actor, "lead.convert")
        data = data or {}
        with transaction.atomic():
            locked = (
                Lead.objects.select_for_update()
                .select_related("customer", "quotation")
                .get(pk=lead.pk)
            )
            existing = LeadConversion.objects.select_related("customer", "quotation", "invoice").filter(lead=locked).first()
            if existing:
                return existing
            if locked.current_stage != "DECISION_PENDING":
                raise ValidationError("Only a decision-pending lead can be converted.")
            if not locked.quotation_id:
                raise ValidationError("Create a quotation before conversion.")

            customer = None
            customer_id = data.get("customer_id")
            if customer_id:
                try:
                    customer = Client.objects.select_for_update().get(pk=customer_id)
                except Client.DoesNotExist as exc:
                    raise ValidationError({"customer_id": "Customer not found."}) from exc
            elif locked.customer_id:
                customer = locked.customer
            else:
                candidates = DuplicateCustomerMatchingService.for_lead(locked, gstin=data.get("gstin", ""))
                if candidates and not data.get("confirm_create_customer"):
                    raise DuplicateCustomerError(candidates)
                phone = normalize_phone(locked.phone or locked.whatsapp_number) if (locked.phone or locked.whatsapp_number) else ""
                customer = Client(
                    company_name=" ".join((locked.company_name or "").split()),
                    name=locked.customer_name or locked.contact_person or locked.company_name or "Lead customer",
                    address=locked.address,
                    gstin=str(data.get("gstin") or "").strip().upper() or None,
                    lut=str(data.get("lut") or "").strip() or None,
                    email=(locked.email or "").strip().lower() or None,
                    contact=phone or None,
                )
                customer.full_clean()
                customer.save()

            if locked.quotation.client_id != customer.id or not locked.quotation.company_name:
                locked.quotation.client = customer
                if not locked.quotation.company_name:
                    locked.quotation.company_name = customer.company_name
                locked.quotation.save(update_fields=["client", "company_name"])

            invoice = None
            if data.get("create_invoice"):
                invoice = Invoice.objects.filter(proposal=locked.quotation, is_deleted=False).order_by("id").first()
                if invoice is None:
                    invoice = create_invoice_from_proposal(locked.quotation)

            final_value = Decimal(str(
                data.get("final_value")
                or locked.quotation.total_amount
                or locked.cost_estimates.filter(approval_status="APPROVED").values_list("final_amount", flat=True).first()
                or locked.estimated_value
                or "0"
            ))
            discount = Decimal(str(data.get("discount") or "0"))
            if final_value < 0 or discount < 0:
                raise ValidationError("Conversion values cannot be negative.")

            conversion = LeadConversion(
                lead=locked,
                conversion_type=data.get("conversion_type") or ("PRODUCT_ORDER" if locked.lead_type == "PRODUCT" else "SERVICE_ORDER"),
                customer=customer,
                product=locked.product,
                service=locked.service,
                final_value=final_value,
                discount=discount,
                payment_terms=data.get("payment_terms") or "",
                converted_by=actor,
                quotation=locked.quotation,
                invoice=invoice,
                project=data.get("project") or "",
                sales_order=data.get("sales_order") or "",
                notes=data.get("notes") or "",
            )
            conversion.full_clean()
            conversion.save()
            locked.customer = customer
            locked.save(update_fields=["customer", "updated_at"])
            LeadWorkflowService.transition(
                locked,
                "CONVERTED",
                actor,
                reason="Lead conversion completed",
                metadata={"conversion_id": conversion.id, "customer_id": customer.id},
                request=request,
                _action="conversion",
            )
            _audit(actor, "Lead Converted", f"{locked.lead_number} -> customer {customer.id}", request)
            return conversion


class LeadDemoService:
    @classmethod
    def complete(cls, demo, actor, *, request=None):
        _require_permission(actor, "lead.complete_demo")
        with transaction.atomic():
            locked_demo = ProductDemo.objects.select_for_update().select_related("lead", "meeting").get(pk=demo.pk)
            if locked_demo.lead.lead_type != "PRODUCT":
                raise ValidationError("Product demos are only valid for product leads.")
            if not locked_demo.completed_at and locked_demo.lead.current_stage != "DEMO_SCHEDULED":
                raise ValidationError("A demo can only be completed from the DEMO_SCHEDULED stage.")
            if not locked_demo.completed_at:
                locked_demo.completed_at = timezone.now()
                locked_demo.full_clean()
                locked_demo.save(update_fields=["completed_at"])
            if locked_demo.meeting_id and locked_demo.meeting.status != "COMPLETED":
                meeting = locked_demo.meeting
                meeting.status = "COMPLETED"
                meeting.save(update_fields=["status", "updated_at"])
            lead = locked_demo.lead
            if lead.current_stage == "DEMO_SCHEDULED":
                lead = LeadWorkflowService.transition(lead, "DEMO_COMPLETED", actor, request=request)
            if locked_demo.customization_required and lead.current_stage == "DEMO_COMPLETED":
                lead = LeadWorkflowService.transition(lead, "CUSTOMIZATION_REQUIRED", actor, request=request)
                if not lead.tasks.filter(
                    task_type="CUSTOMIZATION_REQUIREMENT",
                    status__in=["TODO", "IN_PROGRESS"],
                ).exists():
                    LeadTask.objects.create(
                        lead=lead,
                        title="Schedule customization requirement meeting",
                        task_type="CUSTOMIZATION_REQUIREMENT",
                        description="Created automatically after the customized product demo.",
                        assigned_to=lead.assigned_to,
                        priority=lead.priority,
                        status="TODO",
                        created_by=actor,
                    )
                _record_activity(
                    lead,
                    "AUTOMATION",
                    "Customization requirement meeting task created",
                    actor,
                    metadata={"demo_id": locked_demo.id},
                )
            return locked_demo


# Compatibility aliases used by API code and tests.
LeadAssignmentHistoryService = LeadAssignmentService
LeadDuplicateMatchingService = DuplicateCustomerMatchingService
LeadRejectionWorkflowService = LeadRejectionService
LeadConversionWorkflowService = LeadConversionService

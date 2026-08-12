from datetime import timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apis.leads.models import (
    Lead,
    LeadCostEstimate,
    LeadMeeting,
    ProductDemo,
    ServiceRequirement,
)
from apis.leads.services import (
    LeadQuotationService,
    LeadRejectionService,
    LeadReopenService,
    LeadWorkflowService,
)
from apis.user.models import CustomUser


class WorkflowTransitionContractTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.manager = CustomUser.objects.create_user(
            username="workflow-manager",
            email="workflow-manager@example.com",
            fullname="Workflow Manager",
            role="manager",
        )

    def make_lead(self, *, lead_type="SERVICE", stage="QUALIFIED", suffix="1"):
        values = {
            "lead_type": lead_type,
            "customer_name": f"Workflow prospect {suffix}",
            "company_name": f"Workflow company {suffix}",
            "phone": f"9876501{int(suffix):03d}",
            "email": f"workflow-{suffix}@example.com",
            "service": "Implementation" if lead_type == "SERVICE" else "",
            "product": "CRM" if lead_type == "PRODUCT" else "",
            "created_by": self.manager,
        }
        lead = Lead.objects.create(**values)
        if stage != "NEW":
            lead._save_workflow_stage(stage)
        return lead

    def future_meeting(self, lead, meeting_type):
        start = timezone.now() + timedelta(days=1)
        return LeadMeeting.objects.create(
            lead=lead,
            title=f"{meeting_type} meeting",
            meeting_type=meeting_type,
            meeting_mode="ONLINE",
            scheduled_start=start,
            scheduled_end=start + timedelta(hours=1),
            assigned_to=self.manager,
            created_by=self.manager,
        )

    def test_transition_table_matches_the_required_workflow(self):
        expected = {
            "TARGETED": {"NEW"},
            "NEW": {"ASSIGNED"},
            "ASSIGNED": {"CONTACT_ATTEMPTED"},
            "CONTACT_ATTEMPTED": {"CONNECTED", "FOLLOW_UP_REQUIRED", "REJECTED"},
            "CONNECTED": {"QUALIFIED", "FOLLOW_UP_REQUIRED", "REJECTED"},
            "QUALIFIED": {"DEMO_SCHEDULED", "REQUIREMENT_MEETING_SCHEDULED"},
            "FOLLOW_UP_REQUIRED": {
                "CONTACT_ATTEMPTED",
                "CONNECTED",
                "QUALIFIED",
                "DEMO_SCHEDULED",
                "REQUIREMENT_MEETING_SCHEDULED",
                "REJECTED",
            },
            "DEMO_SCHEDULED": {"DEMO_COMPLETED"},
            "DEMO_COMPLETED": {
                "CUSTOMIZATION_REQUIRED",
                "COST_ESTIMATION",
                "FOLLOW_UP_REQUIRED",
                "REJECTED",
            },
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
        self.assertEqual(LeadWorkflowService.TRANSITIONS, expected)

    def test_standard_product_demo_prerequisites_and_cost_path(self):
        lead = self.make_lead(lead_type="PRODUCT", suffix="11")
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "DEMO_SCHEDULED", self.manager)

        meeting = self.future_meeting(lead, "PRODUCT_DEMO")
        lead = LeadWorkflowService.transition(lead, "DEMO_SCHEDULED", self.manager)
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "DEMO_COMPLETED", self.manager)

        ProductDemo.objects.create(
            lead=lead,
            meeting=meeting,
            product="CRM",
            presented_by=self.manager,
            completed_at=timezone.now(),
            customization_required=False,
            outcome="INTERESTED",
        )
        lead = LeadWorkflowService.transition(lead, "DEMO_COMPLETED", self.manager)
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "CUSTOMIZATION_REQUIRED", self.manager)
        lead = LeadWorkflowService.transition(lead, "COST_ESTIMATION", self.manager)
        self.assertEqual(lead.current_stage, "COST_ESTIMATION")

    def test_customized_product_requires_meeting_and_collected_requirements(self):
        lead = self.make_lead(lead_type="PRODUCT", stage="DEMO_COMPLETED", suffix="12")
        ProductDemo.objects.create(
            lead=lead,
            product="CRM",
            presented_by=self.manager,
            completed_at=timezone.now(),
            customization_required=True,
            outcome="CUSTOMIZATION_REQUIRED",
        )
        lead = LeadWorkflowService.transition(lead, "CUSTOMIZATION_REQUIRED", self.manager)

        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "REQUIREMENT_MEETING_SCHEDULED", self.manager)
        meeting = self.future_meeting(lead, "CUSTOMIZATION_REQUIREMENT")
        lead = LeadWorkflowService.transition(lead, "REQUIREMENT_MEETING_SCHEDULED", self.manager)
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "REQUIREMENT_COLLECTED", self.manager)

        requirement = ServiceRequirement.objects.create(
            lead=lead,
            meeting=meeting,
            business_objective="Reduce handling time",
            current_problem="Manual routing",
            required_solution="Custom workflow",
            technical_review_required=True,
            requirement_status="COLLECTED",
            feasibility_status="FEASIBLE_WITH_CHANGES",
            created_by=self.manager,
        )
        lead = LeadWorkflowService.transition(lead, "REQUIREMENT_COLLECTED", self.manager)
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "COST_ESTIMATION", self.manager)
        lead = LeadWorkflowService.transition(lead, "TECHNICAL_REVIEW", self.manager)
        lead = LeadWorkflowService.transition(lead, "FEASIBILITY_REVIEW", self.manager)
        lead = LeadWorkflowService.transition(lead, "COST_ESTIMATION", self.manager)
        self.assertEqual(lead.current_stage, "COST_ESTIMATION")
        self.assertEqual(requirement.lead_id, lead.id)

    def test_service_requirement_meeting_and_simple_requirement_path(self):
        lead = self.make_lead(lead_type="SERVICE", suffix="13")
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "REQUIREMENT_MEETING_SCHEDULED", self.manager)
        meeting = self.future_meeting(lead, "SERVICE_REQUIREMENT")
        lead = LeadWorkflowService.transition(lead, "REQUIREMENT_MEETING_SCHEDULED", self.manager)
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "REQUIREMENT_COLLECTED", self.manager)
        ServiceRequirement.objects.create(
            lead=lead,
            meeting=meeting,
            service="Implementation",
            business_objective="Launch faster",
            current_problem="Disconnected tools",
            required_solution="Integrated portal",
            technical_review_required=False,
            requirement_status="COLLECTED",
            created_by=self.manager,
        )
        lead = LeadWorkflowService.transition(lead, "REQUIREMENT_COLLECTED", self.manager)
        lead = LeadWorkflowService.transition(lead, "COST_ESTIMATION", self.manager)
        self.assertEqual(lead.current_stage, "COST_ESTIMATION")

    def test_commercial_path_requires_approval_and_quotation(self):
        lead = self.make_lead(lead_type="SERVICE", stage="COST_ESTIMATION", suffix="14")
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "PROPOSAL_PREPARATION", self.manager)
        LeadCostEstimate.objects.create(
            lead=lead,
            prepared_by=self.manager,
            development_cost="1000",
            final_amount="1000",
            approval_status="APPROVED",
            approved_by=self.manager,
            approved_at=timezone.now(),
        )
        lead = LeadWorkflowService.transition(lead, "PROPOSAL_PREPARATION", self.manager)
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "PROPOSAL_SENT", self.manager)

        LeadQuotationService.create(lead, self.manager, data={"total_amount": "1000"})
        lead.refresh_from_db()
        lead = LeadWorkflowService.transition(lead, "PROPOSAL_SENT", self.manager)
        lead = LeadWorkflowService.transition(lead, "QUOTATION_SENT", self.manager)
        lead = LeadWorkflowService.transition(lead, "NEGOTIATION", self.manager)
        lead = LeadWorkflowService.transition(lead, "QUOTATION_SENT", self.manager)
        lead = LeadWorkflowService.transition(lead, "NEGOTIATION", self.manager)
        lead = LeadWorkflowService.transition(lead, "DECISION_PENDING", self.manager)
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "CONVERTED", self.manager)

    def test_reopen_lost_and_reject_not_feasible_prerequisites(self):
        lost = self.make_lead(lead_type="SERVICE", stage="LOST", suffix="15")
        reopened = LeadReopenService.reopen(lost, self.manager, reason="Fresh requirement")
        self.assertEqual(reopened.current_stage, "NEW")

        infeasible = self.make_lead(lead_type="SERVICE", stage="FEASIBILITY_REVIEW", suffix="16")
        requirement = ServiceRequirement.objects.create(
            lead=infeasible,
            service="Implementation",
            business_objective="Launch faster",
            current_problem="Legacy platform",
            required_solution="Replacement",
            requirement_status="UNDER_REVIEW",
            feasibility_status="PENDING",
            created_by=self.manager,
        )
        with self.assertRaises(ValidationError):
            LeadRejectionService.reject(
                infeasible,
                self.manager,
                reason="NOT_FEASIBLE",
                detailed_notes="The current requirement cannot be delivered safely.",
            )
        self.assertFalse(infeasible.rejections.exists())

        requirement.feasibility_status = "NOT_FEASIBLE"
        requirement.save(update_fields=["feasibility_status", "updated_at"])
        rejection = LeadRejectionService.reject(
            infeasible,
            self.manager,
            reason="NOT_FEASIBLE",
            detailed_notes="The reviewed requirement is not technically feasible.",
        )
        rejection.lead.refresh_from_db()
        self.assertEqual(rejection.lead.current_stage, "REJECTED")

    def test_representative_forbidden_and_unknown_transitions(self):
        lead = self.make_lead(lead_type="SERVICE", stage="NEW", suffix="17")
        for target in ("CONNECTED", "QUALIFIED", "LOST"):
            with self.subTest(target=target), self.assertRaises(ValidationError):
                LeadWorkflowService.transition(lead, target, self.manager)
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "NOT_A_STAGE", self.manager)

from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apis.proposal.models import Client, Proposal
from apis.user.models import CustomUser
from apis.leads.models import Lead, LeadActivity, LeadAssignmentHistory
from apis.leads.services import (
    DuplicateCustomerError,
    LeadAssignmentService,
    LeadConversionService,
    LeadQuotationService,
    LeadRejectionService,
    LeadReopenService,
    LeadWorkflowService,
)


class LeadWorkflowTests(TestCase):
    def setUp(self):
        self.manager = CustomUser.objects.create_user(
            username="manager",
            email="manager@example.com",
            fullname="Sales Manager",
            role="manager",
        )
        self.employee = CustomUser.objects.create_user(
            username="employee",
            email="employee@example.com",
            fullname="Sales Employee",
            role="employee",
        )
        self.lead = Lead.objects.create(
            lead_type="SERVICE",
            customer_name="Prospect",
            company_name="Prospect Ltd",
            contact_person="Decision Maker",
            phone="9876543210",
            email="prospect@example.com",
            service="Digital consulting",
            created_by=self.manager,
        )

    def test_assignment_records_history_activity_and_stage(self):
        assigned = LeadAssignmentService.assign(
            self.lead,
            self.employee,
            self.manager,
            reason="Round robin",
        )
        self.assertEqual(assigned.current_stage, "ASSIGNED")
        self.assertEqual(assigned.assigned_to, self.employee)
        self.assertTrue(LeadAssignmentHistory.objects.filter(lead=self.lead, assigned_to=self.employee).exists())
        self.assertTrue(LeadActivity.objects.filter(lead=self.lead, activity_type="ASSIGNED").exists())

    def test_basic_permitted_and_forbidden_transitions(self):
        lead = LeadAssignmentService.assign(self.lead, self.employee, self.manager)
        lead = LeadWorkflowService.transition(lead, "CONTACT_ATTEMPTED", self.manager)
        lead = LeadWorkflowService.transition(lead, "CONNECTED", self.manager)
        lead = LeadWorkflowService.transition(lead, "QUALIFIED", self.manager)
        self.assertEqual(lead.current_stage, "QUALIFIED")
        with self.assertRaises(ValidationError):
            LeadWorkflowService.transition(lead, "CONVERTED", self.manager)

    def test_hold_and_resume_return_to_previous_stage(self):
        lead = LeadAssignmentService.assign(self.lead, self.employee, self.manager)
        held = LeadWorkflowService.transition(lead, "ON_HOLD", self.manager, reason="Customer asked to pause")
        self.assertEqual(held.stage_before_hold, "ASSIGNED")
        resumed = LeadWorkflowService.transition(held, "ASSIGNED", self.manager)
        self.assertEqual(resumed.current_stage, "ASSIGNED")
        self.assertEqual(resumed.stage_before_hold, "")

    def test_rejection_requires_details_and_reopen_is_authorized_action(self):
        lead = LeadAssignmentService.assign(self.lead, self.employee, self.manager)
        lead = LeadWorkflowService.transition(lead, "CONTACT_ATTEMPTED", self.manager)
        with self.assertRaises(ValidationError):
            LeadRejectionService.reject(
                lead,
                self.manager,
                reason="NOT_INTERESTED",
                detailed_notes="",
            )
        rejection = LeadRejectionService.reject(
            lead,
            self.manager,
            reason="NOT_INTERESTED",
            detailed_notes="Customer confirmed no current requirement.",
        )
        rejection.lead.refresh_from_db()
        self.assertEqual(rejection.lead.current_stage, "REJECTED")
        reopened = LeadReopenService.reopen(rejection.lead, self.manager, reason="Customer requested a new discussion")
        self.assertEqual(reopened.current_stage, "NEW")

    def test_duplicate_customer_is_returned_before_conversion(self):
        Client.objects.create(
            name="Existing Prospect",
            company_name="Prospect Ltd",
            contact="+919876543210",
            email="prospect@example.com",
        )
        proposal = Proposal.objects.create(
            proposal_no="AD/2026/TEST-1",
            company_name="Prospect Ltd",
            total_amount=Decimal("10000"),
            created_by=self.manager,
        )
        self.lead.quotation = proposal
        self.lead.save(update_fields=["quotation", "updated_at"])
        self.lead._save_workflow_stage("DECISION_PENDING")
        with self.assertRaises(DuplicateCustomerError) as captured:
            LeadConversionService.convert(self.lead, self.manager, data={"final_value": "10000"})
        self.assertEqual(captured.exception.candidates[0]["matched_on"], ["phone", "email", "company_name"])

    def test_conversion_is_idempotent_and_reuses_selected_customer(self):
        customer = Client.objects.create(
            name="Prospect",
            company_name="Prospect Ltd",
            contact="+919876543210",
            email="prospect@example.com",
        )
        self.lead.customer = customer
        self.lead.save(update_fields=["customer", "updated_at"])
        proposal = LeadQuotationService.create(
            self.lead,
            self.manager,
            data={"total_amount": "12500", "purpose": "Consulting"},
        )
        self.lead.refresh_from_db()
        self.lead._save_workflow_stage("DECISION_PENDING")
        first = LeadConversionService.convert(
            self.lead,
            self.manager,
            data={"customer_id": customer.id, "final_value": "12000"},
        )
        second = LeadConversionService.convert(
            self.lead,
            self.manager,
            data={"customer_id": customer.id, "final_value": "12000"},
        )
        self.assertEqual(first.id, second.id)
        self.assertEqual(first.quotation, proposal)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.current_stage, "CONVERTED")

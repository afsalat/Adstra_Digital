from datetime import timedelta

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone

from apis.user.models import CustomUser
from apis.leads.models import (
    Lead,
    LeadActivity,
    LeadDocument,
    LeadMeeting,
    LeadRequirementItem,
    ProductDemo,
    ServiceRequirement,
)


class LeadModelTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="manager",
            email="manager@example.com",
            fullname="Manager",
            role="manager",
        )

    def make_lead(self, **overrides):
        values = {
            "lead_type": "SERVICE",
            "customer_name": "A Customer",
            "contact_person": "A Customer",
            "phone": "+91 98765 43210",
            "email": "  PERSON@EXAMPLE.COM ",
            "service": "Web development",
            "created_by": self.user,
        }
        values.update(overrides)
        lead = Lead(**values)
        lead.full_clean()
        lead.save()
        return lead

    def test_lead_number_is_unique_and_contact_data_is_canonical(self):
        first = self.make_lead()
        second = self.make_lead(email="second@example.com", phone="9876543211")
        self.assertNotEqual(first.lead_number, second.lead_number)
        self.assertTrue(first.lead_number.startswith("LD-"))
        self.assertEqual(first.email, "person@example.com")
        self.assertEqual(first.phone, "+919876543210")

        duplicate = Lead(
            lead_number=first.lead_number,
            lead_type="SERVICE",
            customer_name="Another customer",
            phone="9876543212",
            service="Support",
        )
        with self.assertRaises(ValidationError):
            duplicate.full_clean()
        with self.assertRaises(IntegrityError), transaction.atomic():
            duplicate.save()

    def test_contact_and_numeric_validation_rejects_invalid_values(self):
        invalid_phone = Lead(
            lead_type="SERVICE",
            customer_name="Invalid phone",
            phone="call-me",
            service="Support",
        )
        with self.assertRaises(ValidationError):
            invalid_phone.full_clean()

        invalid_score = Lead(
            lead_type="SERVICE",
            customer_name="Invalid score",
            phone="9876543212",
            service="Support",
            lead_score=101,
            conversion_probability=101,
            estimated_value=-1,
        )
        with self.assertRaises(ValidationError) as captured:
            invalid_score.full_clean()
        self.assertIn("lead_score", captured.exception.message_dict)
        self.assertIn("conversion_probability", captured.exception.message_dict)

    def test_direct_initial_and_existing_stage_mutations_are_blocked(self):
        with self.assertRaises(ValidationError):
            Lead.objects.create(
                lead_type="SERVICE",
                customer_name="Invalid",
                phone="9876543210",
                service="Consulting",
                current_stage="CONVERTED",
            )
        lead = self.make_lead()
        lead.current_stage = "CONNECTED"
        with self.assertRaises(ValidationError):
            lead.save()

    def test_product_lead_requires_product_and_service_lead_requires_service(self):
        product = Lead(
            lead_type="PRODUCT",
            customer_name="Product Buyer",
            phone="9876543210",
        )
        with self.assertRaises(ValidationError):
            product.full_clean()
        service = Lead(
            lead_type="SERVICE",
            customer_name="Service Buyer",
            phone="9876543210",
        )
        with self.assertRaises(ValidationError):
            service.full_clean()

    def test_cross_lead_meeting_and_requirement_links_are_rejected(self):
        lead = self.make_lead()
        other = self.make_lead(email="other@example.com", phone="9876543211")
        start = timezone.now() + timedelta(days=1)
        meeting = LeadMeeting.objects.create(
            lead=other,
            title="Requirements",
            meeting_type="SERVICE_REQUIREMENT",
            meeting_mode="ONLINE",
            scheduled_start=start,
            scheduled_end=start + timedelta(hours=1),
            assigned_to=self.user,
            created_by=self.user,
        )
        requirement = ServiceRequirement(
            lead=lead,
            meeting=meeting,
            service="Web development",
            business_objective="Grow sales",
            current_problem="Manual process",
            required_solution="Portal",
            created_by=self.user,
        )
        with self.assertRaises(ValidationError):
            requirement.full_clean()

    def test_product_demo_requires_same_lead_product_demo_meeting(self):
        lead = self.make_lead(lead_type="PRODUCT", product="CRM", service="")
        other = self.make_lead(email="other@example.com", phone="9876543211")
        start = timezone.now() + timedelta(days=1)
        meeting = LeadMeeting.objects.create(
            lead=other,
            title="Demo",
            meeting_type="PRODUCT_DEMO",
            meeting_mode="ONLINE",
            scheduled_start=start,
            scheduled_end=start + timedelta(hours=1),
            assigned_to=self.user,
            created_by=self.user,
        )
        demo = ProductDemo(lead=lead, meeting=meeting, product="CRM", presented_by=self.user)
        with self.assertRaises(ValidationError):
            demo.full_clean()

    def test_requirement_item_must_match_requirement_lead(self):
        lead = self.make_lead()
        other = self.make_lead(email="other@example.com", phone="9876543211")
        requirement = ServiceRequirement.objects.create(
            lead=other,
            service="Support",
            business_objective="Support users",
            current_problem="Slow response",
            required_solution="Helpdesk",
            created_by=self.user,
        )
        item = LeadRequirementItem(
            lead=lead,
            requirement=requirement,
            title="Ticket routing",
            description="Automatic routing",
        )
        with self.assertRaises(ValidationError):
            item.full_clean()

    def test_activity_does_not_rewind_last_activity(self):
        lead = self.make_lead()
        recent = LeadActivity.objects.create(lead=lead, activity_type="NOTE", title="Recent", actor=self.user)
        lead.refresh_from_db()
        recent_time = lead.last_activity_at
        old = LeadActivity.objects.create(lead=lead, activity_type="NOTE", title="Old", actor=self.user)
        old.created_at = recent_time - timedelta(days=1)
        old.save()
        lead.refresh_from_db()
        self.assertGreaterEqual(lead.last_activity_at, recent_time)

    def test_document_validator_checks_signature_and_type(self):
        lead = self.make_lead()
        upload = SimpleUploadedFile("proposal.pdf", b"%PDF-1.7\ncontent", content_type="application/pdf")
        document = LeadDocument(lead=lead, document_type="PROPOSAL", title="Proposal", file=upload, uploaded_by=self.user)
        document.full_clean()
        bad = SimpleUploadedFile("malware.pdf", b"MZ executable", content_type="application/pdf")
        invalid = LeadDocument(lead=lead, document_type="OTHER", title="Bad", file=bad, uploaded_by=self.user)
        with self.assertRaises(ValidationError):
            invalid.full_clean()

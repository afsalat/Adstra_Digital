from django.test import TestCase
from rest_framework.test import APIClient

from apis.leads.models import Lead, LeadActivity
from apis.user.models import CustomUser

from .models import Proposal, ProposalRequest


class ProposalLeadIntegrationTests(TestCase):
    def setUp(self):
        self.owner = CustomUser.objects.create_user(
            username="sales-owner",
            email="owner@example.com",
            fullname="Sales Owner",
            role="sales_and_marketing",
        )
        self.other = CustomUser.objects.create_user(
            username="sales-other",
            email="other@example.com",
            fullname="Other Sales",
            role="sales_and_marketing",
        )
        self.lead = Lead.objects.create(
            lead_type="SERVICE",
            customer_name="Prospect",
            company_name="Prospect Ltd",
            contact_person="Decision Maker",
            phone="9876543210",
            email="prospect@example.com",
            address="Kozhikode",
            service="SEO",
            estimated_value="10000",
            assigned_to=self.owner,
            created_by=self.owner,
        )
        self.hidden_lead = Lead.objects.create(
            lead_type="PRODUCT",
            customer_name="Hidden Prospect",
            phone="9876543211",
            product="CRM",
            assigned_to=self.other,
            created_by=self.other,
        )
        self.client = APIClient()
        self.client.force_authenticate(self.owner)

    def test_eligible_leads_are_user_scoped(self):
        response = self.client.get("/api/proposal/eligible-leads/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([row["id"] for row in response.data["results"]], [self.lead.id])
        self.assertEqual(response.data["results"][0]["purpose"], "Proposal for SEO")
        self.assertEqual(response.data["results"][0]["proposal_services"][0]["description"], "SEO")

    def test_selecting_lead_creates_and_links_fully_filled_client(self):
        response = self.client.post(f"/api/proposal/clients/from-lead/{self.lead.id}/", {}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        client = response.data["client"]
        self.assertEqual(client["company_name"], "Prospect Ltd")
        self.assertEqual(client["name"], "Prospect")
        self.assertEqual(client["address"], "Kozhikode")
        self.assertEqual(client["email"], "prospect@example.com")
        self.assertTrue(client["contact"].endswith("9876543210"))
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.customer_id, client["id"])

    def test_sales_user_can_request_and_track_a_proposal(self):
        response = self.client.post(
            "/api/proposal/requests/",
            {"lead_id": self.lead.id},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["status"], "pending")
        self.assertEqual(response.data["lead_number"], self.lead.lead_number)
        mine = self.client.get("/api/proposal/mine/")
        self.assertEqual(mine.status_code, 200)
        self.assertEqual(mine.data["requests"][0]["lead"], self.lead.id)
        self.assertEqual(mine.data["request_counts"]["pending"], 1)
        self.assertTrue(ProposalRequest.objects.filter(lead=self.lead, requested_by=self.owner).exists())

    def test_create_from_lead_sets_owner_client_nested_rows_and_link(self):
        response = self.client.post(
            "/api/proposal/create/",
            {
                "lead_id": self.lead.id,
                "proposal_no": "AD/2026/1001",
                "purpose": "SEO proposal",
                "total_amount": "11800.00",
                "total_in_words": "Eleven Thousand Eight Hundred Only",
                "services": [{"description": "SEO", "quantity": 1, "rate": "10000", "amount": "10000", "gst": "18"}],
                "sections": [{"title": "Scope", "type": "textarea", "alignment": "left", "content": "SEO scope"}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        proposal = Proposal.objects.get(pk=response.data["id"])
        self.assertEqual(proposal.created_by, self.owner)
        self.assertEqual(proposal.services.count(), 1)
        self.assertEqual(proposal.sections.count(), 1)
        self.assertIsNotNone(proposal.client_id)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.quotation, proposal)
        self.assertEqual(self.lead.customer, proposal.client)
        self.assertTrue(LeadActivity.objects.filter(lead=self.lead, activity_type="QUOTATION").exists())
        self.assertEqual(response.data["source_lead"]["id"], self.lead.id)

    def test_duplicate_lead_creation_returns_existing_proposal(self):
        proposal = Proposal.objects.create(proposal_no="AD/2026/1002", created_by=self.owner)
        self.lead.quotation = proposal
        self.lead.save(update_fields=["quotation", "updated_at"])
        response = self.client.post(
            "/api/proposal/create/",
            {"lead_id": self.lead.id, "proposal_no": "AD/2026/1003", "services": []},
            format="json",
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data["code"], "proposal_exists")
        self.assertEqual(response.data["existing_proposal"]["id"], proposal.id)

    def test_mine_and_detail_do_not_expose_other_users_proposals(self):
        own = Proposal.objects.create(proposal_no="AD/2026/1004", created_by=self.owner)
        hidden = Proposal.objects.create(proposal_no="AD/2026/1005", created_by=self.other)
        mine = self.client.get("/api/proposal/mine/")
        self.assertEqual(mine.status_code, 200)
        self.assertEqual([row["id"] for row in mine.data["results"]], [own.id])
        detail = self.client.get(f"/api/proposal/detail/{hidden.id}/")
        self.assertEqual(detail.status_code, 404)
        update = self.client.patch(
            f"/api/proposal/update/{hidden.id}/",
            {"purpose": "Not allowed"},
            format="json",
        )
        self.assertEqual(update.status_code, 404)
        hidden.refresh_from_db()
        self.assertNotEqual(hidden.purpose, "Not allowed")

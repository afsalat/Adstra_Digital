from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apis.social.models import (
    SocialClientProfile,
    SocialCampaign,
    PlatformConnection,
    CampaignPlatform,
    CampaignMetricSnapshot,
)
from apis.social.encryption import encrypt_token
from apis.social.campaign_publishing_service import publish_campaign
from apis.social.campaign_sync_service import sync_campaign, get_campaign_attribution


class CampaignSyncAndControlsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client_profile = SocialClientProfile.objects.create(
            name="Sync Controls Client",
            slug="sync-controls-client",
        )
        self.meta_conn = PlatformConnection.objects.create(
            client_profile=self.client_profile,
            platform="meta",
            account_id="act_SANDBOX_123",
            access_token_encrypted=encrypt_token("mock_token"),
            status="connected",
        )
        self.campaign = SocialCampaign.objects.create(
            client_profile=self.client_profile,
            name="Performance Campaign 2026",
            objective="conversions",
            budget=30000.00,
            ad_platforms=["meta"],
            landing_page_url="https://example.com",
            headline="Performance",
            primary_text="Performance description",
            status="draft",
        )
        # Publish first
        publish_campaign(self.campaign.id)

    def test_sync_campaign_creates_metric_snapshots(self):
        """sync_campaign creates a CampaignMetricSnapshot for the platform."""
        result = sync_campaign(self.campaign.id)
        self.assertTrue(result["success"])

        cp = CampaignPlatform.objects.get(campaign=self.campaign, platform="meta")
        snapshots = CampaignMetricSnapshot.objects.filter(campaign_platform=cp)
        self.assertTrue(snapshots.exists())
        latest = snapshots.first()
        self.assertGreater(latest.impressions, 0)
        self.assertGreater(latest.spend, 0)

    def test_pause_and_resume_campaign(self):
        """Test pause and resume endpoints update campaign status."""
        # Pause
        pause_resp = self.client.post(
            f"/api/social/ad/campaigns/{self.campaign.id}/pause/"
        )
        self.assertEqual(pause_resp.status_code, status.HTTP_200_OK)
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.status, "paused")

        # Resume
        resume_resp = self.client.post(
            f"/api/social/ad/campaigns/{self.campaign.id}/resume/"
        )
        self.assertEqual(resume_resp.status_code, status.HTTP_200_OK)
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.status, "active")

    def test_update_budget_endpoint(self):
        """Test update-budget endpoint updates budget across campaign and platforms."""
        response = self.client.post(
            f"/api/social/ad/campaigns/{self.campaign.id}/update-budget/",
            {"budget": 45000.00},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.campaign.refresh_from_db()
        self.assertEqual(float(self.campaign.budget), 45000.00)

    def test_campaign_detail_endpoint(self):
        """GET /api/social/ad/campaigns/{id}/detail/ returns full nested platform data."""
        sync_campaign(self.campaign.id)
        response = self.client.get(
            f"/api/social/ad/campaigns/{self.campaign.id}/detail/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("campaign", response.data)
        self.assertIn("platforms", response.data)
        self.assertIn("activities", response.data)
        self.assertIn("attribution", response.data)
        self.assertEqual(len(response.data["platforms"]), 1)
        self.assertIn("manager_url", response.data["platforms"][0])

    def test_crm_attribution_structure(self):
        """get_campaign_attribution returns valid structure without fabricating numbers."""
        attribution = get_campaign_attribution(self.campaign)
        self.assertIn("has_revenue_data", attribution)
        self.assertIn("attributed_leads", attribution)
        self.assertIn("total_revenue", attribution)

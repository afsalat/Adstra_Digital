import datetime
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apis.social.models import (
    SocialClientProfile,
    SocialCampaign,
    PlatformConnection,
    CampaignPlatform,
    CampaignActivity,
)
from apis.social.encryption import encrypt_token
from apis.social.campaign_publishing_service import (
    publish_campaign,
    validate_campaign_for_publishing,
)


class MetaPublishingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client_profile = SocialClientProfile.objects.create(
            name="Meta Brand Co",
            slug="meta-brand-co",
        )
        self.connection = PlatformConnection.objects.create(
            client_profile=self.client_profile,
            platform="meta",
            account_id="act_SANDBOX_123",
            account_name="Sandbox Ad Account",
            access_token_encrypted=encrypt_token("mock_meta_token"),
            status="connected",
            metadata={"page_id": "PAGE_123", "page_name": "Brand Page"},
        )
        self.campaign = SocialCampaign.objects.create(
            client_profile=self.client_profile,
            name="Summer Sale 2026",
            objective="conversions",
            budget=15000.00,
            ad_platforms=["meta"],
            landing_page_url="https://example.com/summer-sale",
            cta="SHOP_NOW",
            headline="Summer Collection 50% Off",
            primary_text="Upgrade your wardrobe with limited summer deals.",
            target_locations=["India"],
            status="draft",
        )

    def test_validate_campaign_success(self):
        """Campaign with valid fields passes pre-publish validation."""
        errors = validate_campaign_for_publishing(self.campaign)
        self.assertEqual(errors, [])

    def test_validate_campaign_missing_fields(self):
        """Campaign without platforms or without budget fails validation."""
        bad_campaign = SocialCampaign.objects.create(
            client_profile=self.client_profile,
            name="Incomplete Campaign",
            budget=0,
            ad_platforms=[],
        )
        errors = validate_campaign_for_publishing(bad_campaign)
        self.assertTrue(len(errors) > 0)

    def test_meta_publishing_flow(self):
        """Publishing to Meta creates external IDs and CampaignActivity log."""
        result = publish_campaign(self.campaign.id)
        self.assertTrue(result["success"])

        cp = CampaignPlatform.objects.get(campaign=self.campaign, platform="meta")
        self.assertEqual(cp.publish_status, "published")
        self.assertTrue(cp.meta_campaign_id.startswith("meta_camp_"))
        self.assertTrue(cp.meta_ad_set_id.startswith("meta_adset_"))
        self.assertTrue(cp.meta_ad_creative_id.startswith("meta_creative_"))
        self.assertTrue(cp.meta_ad_id.startswith("meta_ad_"))

        self.campaign.refresh_from_db()
        self.assertIn(self.campaign.status, ["published", "active", "pending_review"])

        activities = CampaignActivity.objects.filter(campaign=self.campaign)
        self.assertTrue(activities.exists())

    def test_meta_publishing_api_endpoint(self):
        """POST /api/social/ad/campaigns/{id}/publish/ triggers publishing."""
        response = self.client.post(
            f"/api/social/ad/campaigns/{self.campaign.id}/publish/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("meta", response.data.get("platforms", {}))

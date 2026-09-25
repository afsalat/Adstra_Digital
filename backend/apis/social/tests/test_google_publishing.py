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
from apis.social.campaign_publishing_service import publish_campaign


class GooglePublishingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client_profile = SocialClientProfile.objects.create(
            name="Search Brand Pro",
            slug="search-brand-pro",
        )
        self.google_conn = PlatformConnection.objects.create(
            client_profile=self.client_profile,
            platform="google",
            account_id="123-456-7890",
            account_name="Google Ads Customer Account",
            access_token_encrypted=encrypt_token("mock_google_token"),
            status="connected",
            metadata={"customer_id": "123-456-7890"},
        )
        self.meta_conn = PlatformConnection.objects.create(
            client_profile=self.client_profile,
            platform="meta",
            account_id="act_SANDBOX_999",
            account_name="Meta Ad Account",
            access_token_encrypted=encrypt_token("mock_meta_token"),
            status="connected",
        )
        self.campaign = SocialCampaign.objects.create(
            client_profile=self.client_profile,
            name="Google Search Leads Q4",
            objective="lead_generation",
            budget=20000.00,
            ad_platforms=["google"],
            landing_page_url="https://example.com/demo",
            headline="Top Marketing Agency In India",
            primary_text="Scale your business with proven ROI marketing.",
            cta="SIGN_UP",
            status="draft",
        )

    def test_google_publishing_flow(self):
        """Publishing to Google creates Google Ads hierarchy external IDs."""
        result = publish_campaign(self.campaign.id)
        self.assertTrue(result["success"])

        cp = CampaignPlatform.objects.get(campaign=self.campaign, platform="google")
        self.assertEqual(cp.publish_status, "published")
        self.assertTrue(cp.google_campaign_id.startswith("goog_camp_"))
        self.assertTrue(cp.google_ad_group_id.startswith("goog_adgroup_"))
        self.assertTrue(cp.google_ad_id.startswith("goog_ad_"))

    def test_multi_platform_publishing(self):
        """Publishing campaign with both meta and google publishes to both platforms."""
        multi_campaign = SocialCampaign.objects.create(
            client_profile=self.client_profile,
            name="Omnichannel Product Launch",
            objective="traffic",
            budget=50000.00,
            ad_platforms=["meta", "google"],
            landing_page_url="https://example.com/launch",
            headline="Omnichannel Experience",
            primary_text="Experience our new product line across web and mobile.",
            cta="LEARN_MORE",
            status="draft",
        )
        result = publish_campaign(multi_campaign.id)
        self.assertTrue(result["success"])

        meta_cp = CampaignPlatform.objects.get(campaign=multi_campaign, platform="meta")
        google_cp = CampaignPlatform.objects.get(campaign=multi_campaign, platform="google")
        self.assertEqual(meta_cp.publish_status, "published")
        self.assertEqual(google_cp.publish_status, "published")

import datetime
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from apis.social.models import PlatformConnection, SocialClientProfile
from apis.social.encryption import encrypt_token, decrypt_token
from apis.social.serializers import PlatformConnectionSerializer


class PlatformConnectionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client_profile = SocialClientProfile.objects.create(
            name="Test Client",
            slug="test-client",
            package_tier="Growth Package",
        )

    def test_token_encryption_roundtrip(self):
        """Ensure AES Fernet encryption securely protects and decrypts tokens."""
        raw_token = "EAABwzLIX104BO71...sensitive_meta_token_12345"
        encrypted = encrypt_token(raw_token)
        self.assertNotEqual(raw_token, encrypted)
        self.assertNotIn("EAABwzLIX", encrypted)

        decrypted = decrypt_token(encrypted)
        self.assertEqual(raw_token, decrypted)

    def test_token_excluded_from_serializer(self):
        """Tokens must NEVER be exposed in serializer output."""
        conn = PlatformConnection.objects.create(
            client_profile=self.client_profile,
            platform="meta",
            account_id="act_123456789",
            account_name="Meta Ad Account",
            access_token_encrypted=encrypt_token("super_secret_token"),
            refresh_token_encrypted=encrypt_token("super_secret_refresh"),
            status="connected",
            token_expires_at=timezone.now() + datetime.timedelta(days=30),
        )
        data = PlatformConnectionSerializer(conn).data
        self.assertNotIn("access_token_encrypted", data)
        self.assertNotIn("refresh_token_encrypted", data)
        self.assertNotIn("super_secret_token", str(data))
        self.assertTrue(data["is_token_valid"])

    def test_sandbox_connect_meta(self):
        """Test sandbox-connect endpoint connects a mock Meta account."""
        response = self.client.post(
            "/api/social/platform-connections/sandbox-connect/",
            {"platform": "meta", "client_id": self.client_profile.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        conn = PlatformConnection.objects.get(
            client_profile=self.client_profile, platform="meta"
        )
        self.assertEqual(conn.status, "connected")
        self.assertTrue(conn.account_id.startswith("act_SANDBOX"))

    def test_sandbox_connect_google(self):
        """Test sandbox-connect endpoint connects a mock Google account."""
        response = self.client.post(
            "/api/social/platform-connections/sandbox-connect/",
            {"platform": "google", "client_id": self.client_profile.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        conn = PlatformConnection.objects.get(
            client_profile=self.client_profile, platform="google"
        )
        self.assertEqual(conn.status, "connected")
        self.assertEqual(conn.account_id, "123-456-7890")

    def test_disconnect_clears_tokens(self):
        """Disconnecting must clear encrypted tokens and mark disconnected."""
        conn = PlatformConnection.objects.create(
            client_profile=self.client_profile,
            platform="meta",
            account_id="act_123456",
            access_token_encrypted=encrypt_token("token_to_clear"),
            status="connected",
        )
        response = self.client.post(
            f"/api/social/platform-connections/{conn.id}/disconnect/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        conn.refresh_from_db()
        self.assertEqual(conn.status, "disconnected")
        self.assertEqual(conn.access_token_encrypted, "")
        self.assertEqual(conn.refresh_token_encrypted, "")

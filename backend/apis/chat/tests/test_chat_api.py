from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apis.chat.models import Membership, Message, UserChatState
from apis.user.models import CustomUser


class ChatAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.alice = CustomUser.objects.create_user("alice-chat", "alice@example.com", fullname="Alice Adams")
        cls.bob = CustomUser.objects.create_user("bob-chat", "bob@example.com", fullname="Bob Bose")
        cls.cara = CustomUser.objects.create_user("cara-chat", "cara@example.com", fullname="Cara Cruz")

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(self.alice)

    def make_direct(self):
        response = self.client.post("/api/chat/conversations/", {"kind": "DIRECT", "member_ids": [self.bob.id]}, format="json")
        self.assertIn(response.status_code, (200, 201), response.data)
        return response.data["id"]

    def test_direct_is_canonical_and_private(self):
        conversation_id = self.make_direct()
        self.assertEqual(self.make_direct(), conversation_id)
        self.client.force_authenticate(self.cara)
        self.assertEqual(self.client.get(f"/api/chat/conversations/{conversation_id}/messages/").status_code, 404)

    def test_message_lifecycle_incremental_and_read(self):
        conversation_id = self.make_direct()
        first = self.client.post(f"/api/chat/conversations/{conversation_id}/messages/", {"body": "Hello Bob"}, format="json")
        self.assertEqual(first.status_code, 201)
        second = self.client.post(f"/api/chat/conversations/{conversation_id}/messages/", {"body": "Follow up"}, format="json")
        incremental = self.client.get(f"/api/chat/conversations/{conversation_id}/messages/?after_id={first.data['id']}")
        self.assertEqual([m["id"] for m in incremental.data["results"]], [second.data["id"]])
        edited = self.client.patch(f"/api/chat/conversations/{conversation_id}/messages/{second.data['id']}/", {"body": "Updated"}, format="json")
        self.assertEqual(edited.data["body"], "Updated")
        self.assertEqual(self.client.delete(f"/api/chat/conversations/{conversation_id}/messages/{second.data['id']}/").status_code, 200)
        self.assertTrue(Message.objects.get(id=second.data["id"]).deleted_at)

    def test_unread_then_read(self):
        conversation_id = self.make_direct()
        self.client.force_authenticate(self.bob)
        sent = self.client.post(f"/api/chat/conversations/{conversation_id}/messages/", {"body": "Unread"}, format="json")
        self.client.force_authenticate(self.alice)
        self.assertEqual(self.client.get("/api/chat/conversations/").data["unread_count"], 1)
        self.client.post(f"/api/chat/conversations/{conversation_id}/read/", {}, format="json")
        self.assertEqual(self.client.get("/api/chat/conversations/").data["unread_count"], 0)

    def test_group_admin_controls_membership(self):
        response = self.client.post("/api/chat/conversations/", {"kind": "GROUP", "name": "Launch Team", "member_ids": [self.bob.id]}, format="json")
        conversation_id = response.data["id"]
        self.assertEqual(self.client.post(f"/api/chat/conversations/{conversation_id}/members/", {"user_id": self.cara.id}, format="json").status_code, 200)
        self.client.force_authenticate(self.bob)
        self.assertEqual(self.client.delete(f"/api/chat/conversations/{conversation_id}/members/", {"user_id": self.cara.id}, format="json").status_code, 403)
        self.assertTrue(Membership.objects.filter(conversation_id=conversation_id, user=self.cara).exists())

    def test_presence_and_typing_expire(self):
        conversation_id = self.make_direct()
        self.client.post("/api/chat/presence/", {}, format="json")
        state = UserChatState.objects.get(user=self.alice)
        self.assertGreater(state.last_seen_at, timezone.now() - timedelta(seconds=5))
        self.client.post(f"/api/chat/conversations/{conversation_id}/typing/", {"typing": True}, format="json")
        self.assertGreater(UserChatState.objects.get(user=self.alice).typing_expires_at, timezone.now())
        state.typing_expires_at = timezone.now() - timedelta(seconds=1); state.save()
        self.client.force_authenticate(self.bob)
        self.assertEqual(self.client.get(f"/api/chat/conversations/{conversation_id}/messages/").data["typing"], [])

    def test_kind_and_group_member_invariants(self):
        invalid = self.client.post("/api/chat/conversations/", {"kind": "CHANNEL", "member_ids": [self.bob.id]}, format="json")
        self.assertEqual(invalid.status_code, 400)
        solo = self.client.post("/api/chat/conversations/", {"kind": "GROUP", "name": "Solo", "member_ids": [self.alice.id]}, format="json")
        self.assertEqual(solo.status_code, 400)

    def test_membership_changes_emit_system_messages_and_receipts(self):
        group = self.client.post("/api/chat/conversations/", {"kind": "GROUP", "name": "Launch", "member_ids": [self.bob.id]}, format="json").data
        self.client.post(f"/api/chat/conversations/{group['id']}/members/", {"user_id": self.cara.id}, format="json")
        history = self.client.get(f"/api/chat/conversations/{group['id']}/messages/").data["results"]
        self.assertTrue(history[-1]["is_system"])
        sent = self.client.post(f"/api/chat/conversations/{group['id']}/messages/", {"body": "Status update"}, format="json")
        self.assertEqual(sent.data["receipt"]["state"], "delivered")
        cursor = sent.data["updated_at"]
        self.client.patch(f"/api/chat/conversations/{group['id']}/messages/{sent.data['id']}/", {"body": "Edited status"}, format="json")
        changed = self.client.get(f"/api/chat/conversations/{group['id']}/messages/", {"after_id": sent.data["id"], "changed_after": cursor})
        self.assertEqual(changed.data["results"][0]["body"], "Edited status")

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    DIRECT = "DIRECT"
    GROUP = "GROUP"
    kind = models.CharField(max_length=10, choices=((DIRECT, "Direct"), (GROUP, "Group")))
    name = models.CharField(max_length=120, blank=True)
    direct_key = models.CharField(max_length=80, unique=True, null=True, blank=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="created_chats")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)


class Membership(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_memberships")
    is_admin = models.BooleanField(default=False)
    pinned = models.BooleanField(default=False)
    muted = models.BooleanField(default=False)
    last_read_message = models.ForeignKey("Message", null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("conversation", "user"), name="unique_chat_member")]


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="chat_messages")
    body = models.TextField()
    reply_to = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="replies")
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)


class UserChatState(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_state")
    last_seen_at = models.DateTimeField(null=True, blank=True)
    typing_conversation = models.ForeignKey(Conversation, null=True, blank=True, on_delete=models.SET_NULL, related_name="typing_states")
    typing_expires_at = models.DateTimeField(null=True, blank=True)

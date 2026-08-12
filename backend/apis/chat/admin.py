from django.contrib import admin
from .models import Conversation, Membership, Message, UserChatState

admin.site.register((Conversation, Membership, Message, UserChatState))


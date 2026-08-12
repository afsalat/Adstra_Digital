from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Max, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Conversation, Membership, Message, UserChatState

User = get_user_model()


def user_data(user, now=None):
    now = now or timezone.now()
    state = getattr(user, "chat_state", None)
    return {"id": user.id, "name": user.fullname or user.username, "username": user.username,
            "designation": user.designation or "Employee", "department": user.department or "",
            "online": bool(state and state.last_seen_at and state.last_seen_at > now - timedelta(seconds=45))}


def member_for(user, conversation_id):
    return get_object_or_404(Membership.objects.select_related("conversation"), user=user, conversation_id=conversation_id)


def message_data(message, viewer_id=None, member_reads=None):
    receipt = None
    if viewer_id and message.sender_id == viewer_id and not message.is_system:
        reads = member_reads or []
        recipient_reads = [last_id for user_id, last_id in reads if user_id != viewer_id]
        read_count = sum(1 for last_id in recipient_reads if last_id and last_id >= message.id)
        receipt = {"state": "read" if recipient_reads and read_count == len(recipient_reads) else "delivered",
                   "read_count": read_count, "recipient_count": len(recipient_reads)}
    return {"id": message.id, "conversation_id": message.conversation_id,
            "sender": user_data(message.sender) if message.sender else None,
            "body": "" if message.deleted_at else message.body, "is_system": message.is_system,
            "reply_to": ({"id": message.reply_to_id, "body": message.reply_to.body[:180], "sender_name": message.reply_to.sender.fullname or message.reply_to.sender.username} if message.reply_to_id and message.reply_to.sender else None),
            "created_at": message.created_at, "edited_at": message.edited_at, "deleted_at": message.deleted_at,
            "updated_at": message.updated_at, "receipt": receipt}


def conversation_data(membership):
    conversation = membership.conversation
    memberships = list(conversation.memberships.all())
    others = [m.user for m in memberships if m.user_id != membership.user_id]
    last = conversation.messages.select_related("sender").order_by("-id").first()
    unread = conversation.messages.filter(id__gt=membership.last_read_message_id or 0).exclude(sender_id=membership.user_id).count()
    title = conversation.name if conversation.kind == Conversation.GROUP else (user_data(others[0])["name"] if others else "Direct message")
    return {"id": conversation.id, "kind": conversation.kind, "name": title, "pinned": membership.pinned,
            "muted": membership.muted, "unread_count": unread, "updated_at": conversation.updated_at,
            "last_message": message_data(last, membership.user_id, [(m.user_id, m.last_read_message_id) for m in memberships]) if last else None, "members": [dict(user_data(m.user), is_admin=m.is_admin) for m in memberships]}


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employees(request):
    query = request.query_params.get("search", "").strip()
    users = User.objects.filter(is_active=True).exclude(id=request.user.id).select_related("chat_state").order_by("fullname")
    if query:
        users = users.filter(Q(fullname__icontains=query) | Q(username__icontains=query) | Q(department__icontains=query))
    return Response([user_data(user) for user in users[:100]])


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def conversations(request):
    if request.method == "GET":
        memberships = Membership.objects.filter(user=request.user).select_related("conversation").prefetch_related("conversation__memberships__user", "conversation__memberships__user__chat_state").order_by("-pinned", "-conversation__updated_at")
        data = [conversation_data(m) for m in memberships]
        return Response({"results": data, "unread_count": sum(item["unread_count"] for item in data)})
    kind = request.data.get("kind", Conversation.DIRECT)
    if kind not in (Conversation.DIRECT, Conversation.GROUP):
        return Response({"detail": "Conversation kind must be DIRECT or GROUP."}, status=400)
    ids = list(dict.fromkeys(request.data.get("member_ids") or []))
    if kind == Conversation.DIRECT:
        if len(ids) != 1 or ids[0] == request.user.id or not User.objects.filter(id=ids[0], is_active=True).exists():
            return Response({"detail": "Select one valid employee."}, status=400)
        key = ":".join(map(str, sorted((request.user.id, int(ids[0])))))
        with transaction.atomic():
            conversation, created = Conversation.objects.get_or_create(direct_key=key, defaults={"kind": kind, "creator": request.user})
            Membership.objects.get_or_create(conversation=conversation, user=request.user)
            Membership.objects.get_or_create(conversation=conversation, user_id=ids[0])
    else:
        name = str(request.data.get("name") or "").strip()
        valid_ids = list(User.objects.filter(id__in=ids, is_active=True).values_list("id", flat=True))
        valid_ids = [user_id for user_id in valid_ids if user_id != request.user.id]
        if not 2 <= len(name) <= 120 or len(valid_ids) < 1:
            return Response({"detail": "A group name and at least one employee are required."}, status=400)
        with transaction.atomic():
            conversation = Conversation.objects.create(kind=kind, name=name, creator=request.user)
            Membership.objects.create(conversation=conversation, user=request.user, is_admin=True)
            Membership.objects.bulk_create([Membership(conversation=conversation, user_id=i) for i in valid_ids if i != request.user.id])
    membership = Membership.objects.select_related("conversation").prefetch_related("conversation__memberships__user", "conversation__memberships__user__chat_state").get(conversation=conversation, user=request.user)
    return Response(conversation_data(membership), status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def messages(request, conversation_id):
    membership = member_for(request.user, conversation_id)
    if request.method == "GET":
        query_cursor = timezone.now()
        qs = Message.objects.filter(conversation_id=conversation_id).select_related("sender", "sender__chat_state", "reply_to", "reply_to__sender")
        after = request.query_params.get("after_id")
        before = request.query_params.get("before_id")
        changed_after = request.query_params.get("changed_after")
        if after:
            query = Q(id__gt=after)
            if changed_after:
                query |= Q(updated_at__gt=changed_after)
            qs = qs.filter(query).distinct().order_by("id")
        elif before: qs = qs.filter(id__lt=before).order_by("-id")
        else: qs = qs.order_by("-id")
        rows = list(qs[:50])
        if not after: rows.reverse()
        typing = UserChatState.objects.filter(typing_conversation_id=conversation_id, typing_expires_at__gt=timezone.now()).exclude(user=request.user).select_related("user")
        member_reads = list(Membership.objects.filter(conversation_id=conversation_id).values_list("user_id", "last_read_message_id"))
        return Response({"results": [message_data(m, request.user.id, member_reads) for m in rows], "has_more": len(rows) == 50,
                         "typing": [user_data(s.user) for s in typing], "cursor": query_cursor})
    body = str(request.data.get("body") or "").strip()
    if not body or len(body) > 4000:
        return Response({"detail": "Message must contain 1 to 4000 characters."}, status=400)
    reply = None
    if request.data.get("reply_to"):
        reply = Message.objects.filter(id=request.data["reply_to"], conversation_id=conversation_id).first()
        if not reply: return Response({"detail": "Invalid reply message."}, status=400)
    message = Message.objects.create(conversation_id=conversation_id, sender=request.user, body=body, reply_to=reply)
    Conversation.objects.filter(id=conversation_id).update(updated_at=timezone.now())
    membership.last_read_message = message; membership.save(update_fields=("last_read_message",))
    member_reads = list(Membership.objects.filter(conversation_id=conversation_id).values_list("user_id", "last_read_message_id"))
    return Response(message_data(message, request.user.id, member_reads), status=201)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def message_detail(request, conversation_id, message_id):
    member_for(request.user, conversation_id)
    message = get_object_or_404(Message, id=message_id, conversation_id=conversation_id)
    if message.sender_id != request.user.id or message.is_system:
        return Response({"detail": "You can only modify your own messages."}, status=403)
    if request.method == "DELETE":
        message.deleted_at = timezone.now(); message.body = ""; message.save(update_fields=("deleted_at", "body", "updated_at"))
    else:
        body = str(request.data.get("body") or "").strip()
        if not body or len(body) > 4000: return Response({"detail": "Message must contain 1 to 4000 characters."}, status=400)
        message.body = body; message.edited_at = timezone.now(); message.save(update_fields=("body", "edited_at", "updated_at"))
    Conversation.objects.filter(id=conversation_id).update(updated_at=timezone.now())
    reads = list(Membership.objects.filter(conversation_id=conversation_id).values_list("user_id", "last_read_message_id"))
    return Response(message_data(message, request.user.id, reads))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def read(request, conversation_id):
    membership = member_for(request.user, conversation_id)
    message = Message.objects.filter(conversation_id=conversation_id).order_by("-id").first()
    membership.last_read_message = message; membership.save(update_fields=("last_read_message",))
    return Response({"last_read_message_id": message.id if message else None})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def heartbeat(request):
    state, _ = UserChatState.objects.get_or_create(user=request.user)
    state.last_seen_at = timezone.now(); state.save(update_fields=("last_seen_at",))
    return Response({"online": True, "last_seen_at": state.last_seen_at})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def typing(request, conversation_id):
    member_for(request.user, conversation_id)
    state, _ = UserChatState.objects.get_or_create(user=request.user)
    active = bool(request.data.get("typing"))
    state.typing_conversation_id = conversation_id if active else None
    state.typing_expires_at = timezone.now() + timedelta(seconds=8) if active else None
    state.save(update_fields=("typing_conversation", "typing_expires_at"))
    return Response({"typing": active})


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def members(request, conversation_id):
    own = member_for(request.user, conversation_id)
    if own.conversation.kind != Conversation.GROUP or not own.is_admin:
        return Response({"detail": "Group admin access required."}, status=403)
    user_id = request.data.get("user_id")
    if request.method == "DELETE":
        if int(user_id or 0) == request.user.id: return Response({"detail": "Admins cannot remove themselves."}, status=400)
        target = Membership.objects.filter(conversation_id=conversation_id, user_id=user_id).select_related("user").first()
        if not target: return Response({"detail": "Employee is not a group member."}, status=404)
        target_name = target.user.fullname or target.user.username
        with transaction.atomic():
            target.delete()
            Message.objects.create(conversation_id=conversation_id, sender=request.user, body=f"{target_name} was removed from the group.", is_system=True)
            Conversation.objects.filter(id=conversation_id).update(updated_at=timezone.now())
    else:
        user = get_object_or_404(User, id=user_id, is_active=True)
        with transaction.atomic():
            _, created = Membership.objects.get_or_create(conversation_id=conversation_id, user=user)
            if not created: return Response({"detail": "Employee is already a group member."}, status=400)
            Message.objects.create(conversation_id=conversation_id, sender=request.user, body=f"{user.fullname or user.username} was added to the group.", is_system=True)
            Conversation.objects.filter(id=conversation_id).update(updated_at=timezone.now())
    return Response({"ok": True})

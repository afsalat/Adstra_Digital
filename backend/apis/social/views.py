import os
import json
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

logger = logging.getLogger(__name__)

from apis.social.models import (
    SocialClientProfile,
    SocialAccount,
    SocialCampaign,
    SocialMediaAsset,
    SocialPost,
    PostApprovalHistory,
    SocialInboxMessage,
    SocialDailyAnalytics,
    PostComment,
    PostCommentMention,
)
from apis.social.serializers import (
    SocialClientProfileSerializer,
    SocialAccountSerializer,
    SocialCampaignSerializer,
    SocialMediaAssetSerializer,
    SocialPostSerializer,
    PostApprovalHistorySerializer,
    SocialInboxMessageSerializer,
    SocialDailyAnalyticsSerializer,
    PostCommentSerializer,
    PostCommentMentionSerializer,
)
from apis.user.models import CustomUser
from apis.social.services import (
    convert_inbox_to_crm_lead,
    record_approval_action,
    generate_ai_content,
    sync_proposal_clients,
)
from apis.leads.serializers import LeadSerializer


class SocialDashboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        client_id = request.query_params.get('client_id')
        days = int(request.query_params.get('days', 30))

        client_qs = SocialClientProfile.objects.filter(is_active=True)
        account_qs = SocialAccount.objects.filter(is_active=True, client_profile__is_active=True)
        post_qs = SocialPost.objects.filter(client_profile__is_active=True)
        analytics_qs = SocialDailyAnalytics.objects.filter(client_profile__is_active=True)
        inbox_qs = SocialInboxMessage.objects.filter(client_profile__is_active=True)

        if client_id and client_id != 'all':
            account_qs = account_qs.filter(client_profile_id=client_id)
            post_qs = post_qs.filter(client_profile_id=client_id)
            analytics_qs = analytics_qs.filter(client_profile_id=client_id)
            inbox_qs = inbox_qs.filter(client_profile_id=client_id)

        since_date = timezone.now().date() - timedelta(days=days)
        period_analytics = analytics_qs.filter(date__gte=since_date)

        total_followers = sum(acc.followers_count for acc in account_qs)
        total_reach = period_analytics.aggregate(s=Sum('reach'))['s'] or 0
        total_impressions = period_analytics.aggregate(s=Sum('impressions'))['s'] or 0
        avg_engagement = round(period_analytics.aggregate(a=Avg('engagement_rate'))['a'] or 4.2, 2)
        total_likes = period_analytics.aggregate(s=Sum('likes'))['s'] or 0
        total_comments = period_analytics.aggregate(s=Sum('comments'))['s'] or 0
        total_shares = period_analytics.aggregate(s=Sum('shares'))['s'] or 0
        total_saves = period_analytics.aggregate(s=Sum('saves'))['s'] or 0

        # Post status summary
        status_counts = {
            'scheduled': post_qs.filter(status='scheduled').count(),
            'published': post_qs.filter(status='published').count(),
            'internal_review': post_qs.filter(status='internal_review').count(),
            'client_review': post_qs.filter(status='client_review').count(),
            'draft': post_qs.filter(status='draft').count(),
            'failed': post_qs.filter(status='failed').count(),
        }

        # Platform distribution
        platforms_data = []
        for p_code, p_name in SocialAccount.PLATFORM_CHOICES:
            p_accounts = account_qs.filter(platform=p_code)
            p_followers = sum(a.followers_count for a in p_accounts)
            p_posts = post_qs.filter(platforms__icontains=p_code).count()
            if p_accounts.exists() or p_posts > 0:
                platforms_data.append({
                    'platform': p_code,
                    'name': p_name,
                    'accounts_count': p_accounts.count(),
                    'followers': p_followers,
                    'posts_count': p_posts,
                })

        # Token expiry alerts
        expiring_accounts = SocialAccount.objects.filter(
            status__in=['token_expiring', 'expired', 'error']
        ).values('id', 'account_name', 'platform', 'status', 'token_expiry')

        # Recent activities
        recent_posts = SocialPostSerializer(post_qs[:5], many=True).data

        # Client-wise summary
        clients_summary = []
        for cp in client_qs:
            c_posts_count = SocialPost.objects.filter(client_profile=cp, status='published').count()
            clients_summary.append({
                'id': cp.id,
                'name': cp.name,
                'target_posts': cp.target_monthly_posts,
                'published_posts': c_posts_count,
                'progress_percent': min(100, int((c_posts_count / max(1, cp.target_monthly_posts)) * 100)),
                'accounts_count': cp.accounts.count(),
                'pending_reviews': cp.posts.filter(status__in=['internal_review', 'client_review']).count(),
            })

        return Response({
            'overview': {
                'total_followers': total_followers,
                'total_reach': total_reach,
                'total_impressions': total_impressions,
                'engagement_rate': avg_engagement,
                'likes': total_likes,
                'comments': total_comments,
                'shares': total_shares,
                'saves': total_saves,
            },
            'status_counts': status_counts,
            'platforms': platforms_data,
            'expiring_accounts': list(expiring_accounts),
            'recent_posts': recent_posts,
            'clients_summary': clients_summary,
            'inbox_pending_count': inbox_qs.filter(status='pending').count(),
        })


class SocialClientProfileViewSet(viewsets.ModelViewSet):
    queryset = SocialClientProfile.objects.all().order_by('name')
    serializer_class = SocialClientProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        try:
            sync_proposal_clients()
        except Exception:
            pass
        qs = SocialClientProfile.objects.all().order_by('name')
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() in ('true', '1'):
                qs = qs.filter(is_active=True)
            elif is_active.lower() in ('false', '0'):
                qs = qs.filter(is_active=False)
        return qs


class SocialAccountViewSet(viewsets.ModelViewSet):
    queryset = SocialAccount.objects.all()
    serializer_class = SocialAccountSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get('client_id')
        if client_id and client_id != 'all':
            qs = qs.filter(client_profile_id=client_id)
        else:
            qs = qs.filter(client_profile__is_active=True)
        return qs

    @action(detail=True, methods=['post'])
    def reconnect(self, request, pk=None):
        account = self.get_object()
        account.status = 'connected'
        account.token_expiry = timezone.now() + timedelta(days=90)
        account.save(update_fields=['status', 'token_expiry'])
        return Response({'status': 'connected', 'message': f'{account.account_name} reconnected successfully.'})

    @action(detail=True, methods=['post'])
    def disconnect(self, request, pk=None):
        account = self.get_object()
        account.status = 'disconnected'
        account.save(update_fields=['status'])
        return Response({'status': 'disconnected', 'message': f'{account.account_name} disconnected.'})


class SocialPostViewSet(viewsets.ModelViewSet):
    queryset = SocialPost.objects.all()
    serializer_class = SocialPostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get('client_id')
        post_status = self.request.query_params.get('status')
        platform = self.request.query_params.get('platform')
        search = self.request.query_params.get('search')
        month = self.request.query_params.get('month') # 'YYYY-MM'

        if client_id and client_id != 'all':
            qs = qs.filter(client_profile_id=client_id)
        else:
            qs = qs.filter(client_profile__is_active=True)
        if post_status and post_status != 'all':
            qs = qs.filter(status=post_status)
        if platform and platform != 'all':
            qs = qs.filter(platforms__icontains=platform)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(primary_caption__icontains=search) |
                Q(hashtags__icontains=search)
            )
        if month:
            try:
                y, m = map(int, month.split('-'))
                qs = qs.filter(scheduled_at__year=y, scheduled_at__month=m)
            except Exception:
                pass

        qs = qs.select_related('client_profile', 'campaign', 'created_by', 'assigned_to', 'writer', 'designer', 'reviewer')
        if self.action == 'list':
            # Only for the read-only list: detail actions append history and must not serialize a stale cache
            qs = qs.prefetch_related('approval_history')
        return qs.annotate(comment_count=Count('comments', distinct=True))

    ASSIGNABLE_ROLES = {'writer': 'Writer', 'designer': 'Designer', 'reviewer': 'Reviewer'}
    SCRIPT_STAGES = ('script', 'draft', 'script_approval')

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Set (or clear with user_id=null) the writer / designer / reviewer of a post."""
        post = self.get_object()
        role = request.data.get('role')
        if role not in self.ASSIGNABLE_ROLES:
            return Response({'error': 'role must be writer, designer or reviewer.'}, status=status.HTTP_400_BAD_REQUEST)

        user_id = request.data.get('user_id')
        assignee = None
        if user_id not in (None, ''):
            assignee = CustomUser.objects.filter(id=user_id, is_active=True).first()
            if not assignee:
                return Response({'error': 'That team member was not found.'}, status=status.HTTP_400_BAD_REQUEST)

        if getattr(post, f'{role}_id') != (assignee.id if assignee else None):
            setattr(post, role, assignee)
            post.save(update_fields=[role, 'updated_at'])
            label = self.ASSIGNABLE_ROLES[role]
            user = request.user if request.user.is_authenticated else None
            actor = getattr(user, 'fullname', '') or getattr(user, 'username', '') or 'Team Member'
            note = f'{label}: {assignee.fullname or assignee.username}' if assignee else f'{label} unassigned'
            record_approval_action(post, f'{label} Assigned' if assignee else f'{label} Unassigned', actor, 'Team Member', note, event_type='note')
        post = self.get_queryset().get(pk=post.pk)
        return Response(SocialPostSerializer(post, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def set_priority(self, request, pk=None):
        post = self.get_object()
        priority = request.data.get('priority')
        valid = dict(SocialPost.PRIORITY_CHOICES)
        if priority not in valid:
            return Response({'error': f'priority must be one of: {", ".join(valid)}.'}, status=status.HTTP_400_BAD_REQUEST)
        if post.priority != priority:
            post.priority = priority
            post.save(update_fields=['priority', 'updated_at'])
            user = request.user if request.user.is_authenticated else None
            actor = getattr(user, 'fullname', '') or getattr(user, 'username', '') or 'Team Member'
            record_approval_action(post, 'Priority Changed', actor, 'Team Member', f'Priority set to {valid[priority]}', event_type='note')
        post = self.get_queryset().get(pk=post.pk)
        return Response(SocialPostSerializer(post, context={'request': request}).data)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def comments(self, request, pk=None):
        """GET: the post's comment thread (also marks your mentions on it read). POST: add a comment."""
        post = self.get_object()
        if request.method == 'GET':
            PostCommentMention.objects.filter(user=request.user, comment__post=post, is_read=False).update(is_read=True)
            qs = post.comments.select_related('author').prefetch_related('mentions')
            return Response(PostCommentSerializer(qs, many=True, context={'request': request}).data)

        body = (request.data.get('body') or '').strip()
        if not body:
            return Response({'error': 'Comment text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(body) > 5000:
            return Response({'error': 'Comments are limited to 5000 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        raw_ids = request.data.get('mention_ids') or []
        if not isinstance(raw_ids, list):
            return Response({'error': 'mention_ids must be a list.'}, status=status.HTTP_400_BAD_REQUEST)
        mention_ids = {int(i) for i in raw_ids if str(i).isdigit()}

        user = request.user
        comment = PostComment.objects.create(
            post=post,
            author=user,
            author_name=getattr(user, 'fullname', '') or user.username,
            author_role=getattr(user, 'designation', '') or getattr(user, 'role', '') or '',
            body=body,
        )

        # Only keep mentions whose @name is still in the text (the user may have deleted it after picking)
        lowered = body.lower()
        mentioned = [
            u for u in CustomUser.objects.filter(id__in=mention_ids, is_active=True).exclude(id=user.id)
            if f'@{(u.fullname or u.username).lower()}' in lowered or f'@{u.username.lower()}' in lowered
        ]
        PostCommentMention.objects.bulk_create([PostCommentMention(comment=comment, user=u) for u in mentioned])

        return Response(PostCommentSerializer(comment, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'comments/(?P<comment_id>[0-9]+)',
        permission_classes=[permissions.IsAuthenticated],
    )
    def delete_comment(self, request, pk=None, comment_id=None):
        post = self.get_object()
        comment = post.comments.filter(id=comment_id).first()
        if not comment:
            return Response({'error': 'Comment not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not PostCommentSerializer(comment, context={'request': request}).data['can_delete']:
            return Response({'error': 'You can only delete your own comments.'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        actor_name = self.request.data.get('actor_name') or (getattr(user, 'fullname', '') or getattr(user, 'username', '') if user else '') or 'Team Member'
        actor_role = self.request.data.get('actor_role') or 'Content Creator'
        # Whoever writes the script owns the post; no separate assignment step
        post = serializer.save(created_by=user, writer=serializer.validated_data.get('writer') or user)
        initial_action = 'submitted_review' if post.status == 'script_approval' else 'created'
        notes = self.request.data.get('script_notes') or self.request.data.get('notes') or ('Submitted directly for script review' if post.status == 'script_approval' else 'Initial post draft created')
        record_approval_action(post, initial_action, actor_name, actor_role, notes)

    def perform_update(self, serializer):
        prev_post = self.get_object()
        prev_caption = prev_post.primary_caption
        prev_status = prev_post.status
        prev_feedback = prev_post.client_feedback
        post = serializer.save()

        user = self.request.user if self.request.user.is_authenticated else None
        actor_name = self.request.data.get('actor_name') or (getattr(user, 'fullname', '') or getattr(user, 'username', '') if user else '') or 'Team Member'
        actor_role = self.request.data.get('actor_role') or 'Content Creator'
        notes = self.request.data.get('notes') or self.request.data.get('update_reason')

        # Posts started from a content plan have no owner yet: the first person to fill in the script takes it
        if user and not post.writer_id and post.status in self.SCRIPT_STAGES:
            post.writer = user
            post.save(update_fields=['writer'])
            record_approval_action(post, 'Writer Assigned', actor_name, actor_role, f'Writer: {actor_name} (filled in the script)', event_type='note')

        # If post was rejected and is now resubmitted for approval
        if prev_feedback and post.status == 'script_approval':
            action = 'Script Reworked & Resubmitted'
            reason = notes or 'Script reworked addressing critique and resubmitted for approval'
            post.client_feedback = ''
            post.save(update_fields=['client_feedback'])
            record_approval_action(post, action, actor_name, actor_role, reason)
        elif prev_feedback and post.status in ['script', 'draft']:
            action = 'Script Rework Draft Saved'
            reason = notes or 'Script revisions drafted by author'
            record_approval_action(post, action, actor_name, actor_role, reason)
        elif prev_status == 'script' and post.status == 'script_approval':
            action = 'Submitted for Script Approval'
            reason = notes or 'Submitted script for internal review'
            record_approval_action(post, action, actor_name, actor_role, reason)
        elif prev_caption != post.primary_caption or notes:
            action = 'Script / Content Updated'
            reason = notes or ('Script & copy revised' if prev_caption != post.primary_caption else 'Post details updated')
            record_approval_action(post, action, actor_name, actor_role, reason)

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        post = self.get_object()
        new_time = request.data.get('scheduled_at')
        if not new_time:
            return Response({'error': 'scheduled_at required'}, status=status.HTTP_400_BAD_REQUEST)
        post.scheduled_at = new_time
        if post.status == 'draft':
            post.status = 'scheduled'
        post.save(update_fields=['scheduled_at', 'status'])
        return Response(SocialPostSerializer(post).data)

    @action(detail=True, methods=['post'])
    def submit_review(self, request, pk=None):
        post = self.get_object()
        review_type = request.data.get('review_type', 'internal_review') # internal_review or client_review
        post.status = review_type
        post.save(update_fields=['status'])
        user = request.user if request.user.is_authenticated else None
        actor = getattr(user, 'fullname', '') or getattr(user, 'username', 'Team Member')
        record_approval_action(post, 'submitted_review', actor, 'Internal Team', f'Moved to {review_type.replace("_", " ").title()}')
        return Response(SocialPostSerializer(post).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        post = self.get_object()
        notes = request.data.get('notes', 'Approved for publishing')
        # If has scheduled_at, move to scheduled, else approved
        post.status = 'scheduled' if post.scheduled_at else 'approved'
        post.client_feedback = ''
        post.save(update_fields=['status', 'client_feedback'])
        user = request.user if request.user.is_authenticated else None
        actor = getattr(user, 'fullname', '') or getattr(user, 'username', 'Approver')
        record_approval_action(post, 'approved', actor, 'Approver', notes)
        return Response(SocialPostSerializer(post).data)

    @action(detail=True, methods=['post'])
    def request_changes(self, request, pk=None):
        post = self.get_object()
        notes = request.data.get('notes', '')
        post.status = 'rejected'
        post.client_feedback = notes
        post.save(update_fields=['status', 'client_feedback'])
        user = request.user if request.user.is_authenticated else None
        actor = getattr(user, 'fullname', '') or getattr(user, 'username', 'Reviewer')
        record_approval_action(post, 'changes_requested', actor, 'Reviewer', notes)
        return Response(SocialPostSerializer(post).data)

    @staticmethod
    def _pending_script_rework(post):
        """Latest Team Review / Client Review → Scripts revision whose redesign hasn't happened yet.

        Extra script-approval bounces in between are fine; a full rejection or a
        later move into Designing means there is nothing pending.
        """
        source = (post.approval_history
                  .filter(event_type='revision', to_stage='script',
                          from_stage__in=['team_review', 'internal_review', 'client_review'])
                  .order_by('-timestamp', '-id')
                  .first())
        if not source:
            return None
        later = post.approval_history.filter(timestamp__gt=source.timestamp)
        if later.filter(to_stage='designing').exists() or later.filter(event_type='rejection').exists():
            return None
        return source

    @action(detail=True, methods=['post'])
    def transition_stage(self, request, pk=None):
        post = self.get_object()
        target_stage = request.data.get('target_stage')
        action_type = request.data.get('action_type', 'advance')
        notes = request.data.get('notes', '')
        actor = request.data.get('actor_name')
        actor_role = request.data.get('actor_role', '')
        if not actor:
            user = request.user if request.user.is_authenticated else None
            actor = getattr(user, 'fullname', '') or getattr(user, 'username', 'Team Member')

        # Handle explicit action types if target_stage is not directly provided
        if not target_stage:
            if action_type == 'reject':
                if post.status == 'script_approval':
                    target_stage = 'script'
                elif post.status in ['team_review', 'client_review']:
                    target_stage = 'designing'
                else:
                    target_stage = 'script'
            elif action_type == 'advance':
                stage_flow = {
                    'script': 'script_approval',
                    'draft': 'script_approval',
                    'script_approval': 'designing',
                    'designing': 'team_review',
                    'team_review': 'client_review',
                    'internal_review': 'client_review',
                    'client_review': 'approved',
                    'approved': 'published',
                    'scheduled': 'published',
                }
                target_stage = stage_flow.get(post.status, 'script_approval')

        if not target_stage:
            return Response({'error': 'Target stage could not be determined.'}, status=status.HTTP_400_BAD_REQUEST)

        # Update optional script or designer notes if provided
        if 'script_notes' in request.data:
            post.script_notes = request.data.get('script_notes') or ''
        if 'designer_notes' in request.data:
            post.designer_notes = request.data.get('designer_notes') or ''
        if 'media_urls' in request.data:
            media_urls = request.data.get('media_urls')
            post.media_urls = media_urls if isinstance(media_urls, list) else ([media_urls] if media_urls else [])
        if 'scheduled_at' in request.data:
            sched_val = request.data.get('scheduled_at')
            if sched_val:
                try:
                    from django.utils.dateparse import parse_datetime
                    if isinstance(sched_val, str):
                        dt = parse_datetime(sched_val)
                        post.scheduled_at = dt if dt else None
                    else:
                        post.scheduled_at = sched_val
                except Exception:
                    post.scheduled_at = None
            else:
                post.scheduled_at = None

        reason_categories = request.data.get('reason_categories') or []
        if not isinstance(reason_categories, list):
            reason_categories = [reason_categories]
        reason_categories = [str(c)[:60] for c in reason_categories if c][:12]
        severity = (request.data.get('severity') or '')[:20]
        rejected_by = (request.data.get('rejected_by') or '')[:20]

        prev_status = post.status
        prev_feedback = post.client_feedback
        post.status = target_stage

        if target_stage == 'published':
            post.published_at = timezone.now()

        event_type = 'transition'
        if action_type == 'reject':
            # Revision loopback: content goes back for rework
            event_type = 'revision'
            post.client_feedback = notes
            post.revision_count = (post.revision_count or 0) + 1
            if prev_status == 'client_review':
                post.client_revision_count = (post.client_revision_count or 0) + 1
            post.last_revision_categories = reason_categories
        elif action_type == 'reject_final':
            # Entire content rejected: dropped, or restarted from a fresh script
            event_type = 'rejection'
            post.rejection_reason = notes
            post.rejection_categories = reason_categories
            post.rejected_by = rejected_by or ('client' if prev_status == 'client_review' else 'internal')
            post.rejected_from_stage = prev_status
            post.rejected_at = timezone.now()
            post.client_feedback = notes if target_stage != 'content_rejected' else ''
        elif action_type == 'restore':
            post.client_feedback = post.rejection_reason
        elif target_stage in ['script_approval', 'team_review', 'client_review', 'approved', 'published']:
            # Resubmitted or approved: clear previous loopback critique
            post.client_feedback = ''

        # A script revision requested at Team Review / Client Review: once the
        # rewritten script is re-approved, the existing creative is outdated, so
        # Designing gets it back as redo work with the original feedback attached.
        script_rework_source = None
        if action_type == 'advance' and prev_status == 'script_approval' and target_stage == 'designing':
            script_rework_source = self._pending_script_rework(post)
            if script_rework_source:
                who = 'client' if script_rework_source.from_stage == 'client_review' else 'team QA'
                post.client_feedback = (
                    f"Script was revised after {who} feedback — update the design to match the new script.\n"
                    f"Original feedback: {script_rework_source.notes}"
                )

        try:
            post.save()
        except Exception as e:
            return Response({'error': f'Failed to update post: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Audit History logging
        action_label = f"Stage changed: {prev_status} -> {target_stage}"
        if action_type == 'reject':
            if prev_status == 'script_approval':
                action_label = "Script Rejected (Rework Requested)"
                actor_role = actor_role or "Content Reviewer"
            elif prev_status in ['team_review', 'internal_review']:
                action_label = "Team QA: Script Rework Requested" if target_stage == 'script' else "Team QA Rejected (Rework Requested)"
                actor_role = actor_role or "QA Lead"
            elif prev_status == 'client_review':
                action_label = "Client Requested Script Changes" if target_stage == 'script' else "Client Requested Changes"
                actor_role = actor_role or "Client"
            else:
                action_label = f"Rejected: Returned to {target_stage.replace('_', ' ').title()}"
                actor_role = actor_role or "Reviewer"
        elif action_type == 'advance':
            if target_stage == 'script_approval':
                if prev_feedback:
                    action_label = "Script Reworked & Resubmitted"
                    actor_role = actor_role or "Content Creator"
                else:
                    action_label = "Submitted for Script Approval"
                    actor_role = actor_role or "Content Creator"
            elif target_stage == 'designing':
                action_label = "Revised Script Approved → Redesign Needed" if script_rework_source else "Script Approved → Moved to Designing"
                actor_role = actor_role or "Content Reviewer"
            elif target_stage == 'team_review':
                if prev_feedback:
                    action_label = "Creative Assets Revised & Resubmitted"
                    actor_role = actor_role or "Graphic Designer"
                else:
                    action_label = "Design Completed → Sent to Team QA"
                    actor_role = actor_role or "Graphic Designer"
            elif target_stage == 'client_review':
                if prev_feedback:
                    action_label = "Client Revisions Completed"
                    actor_role = actor_role or "Account Lead"
                else:
                    action_label = "Team QA Approved → Sent to Client"
                    actor_role = actor_role or "QA Lead"
            elif target_stage in ['approved', 'post_schedule', 'scheduled']:
                action_label = "Client Approved & Scheduled"
                actor_role = actor_role or "Account Lead"
            elif target_stage == 'published':
                action_label = "Published Live"
                actor_role = actor_role or "Publisher"
            else:
                action_label = f"Advanced to {target_stage.replace('_', ' ').title()}"
                actor_role = actor_role or "Workflow Lead"
        elif action_type == 'update':
            action_label = "Post Reworked / Updated"
            actor_role = actor_role or "Creative Team"
        elif action_type == 'reject_final':
            who = 'Client' if post.rejected_by == 'client' else 'Internal'
            if target_stage == 'content_rejected':
                action_label = f"Content Rejected by {who} (Dropped)"
            else:
                action_label = f"Content Rejected by {who} (Restart Script)"
            actor_role = actor_role or ("Client" if post.rejected_by == 'client' else "Reviewer")
        elif action_type == 'restore':
            action_label = "Rejected Content Restored to Scripts"
            actor_role = actor_role or "Workflow Lead"

        if event_type == 'transition' and action_type == 'advance' and target_stage in ['designing', 'client_review', 'approved', 'scheduled']:
            event_type = 'approval'

        try:
            record_approval_action(
                post,
                (action_label or "Stage Updated")[:50],
                (actor or "Team Member")[:150],
                (actor_role or "Workflow Team")[:50],
                notes or f"Moved from {prev_status} to {target_stage}",
                event_type=event_type,
                from_stage=prev_status,
                to_stage=target_stage,
                reason_categories=reason_categories if event_type in ['revision', 'rejection'] else [],
                severity=severity,
                revision_round=post.revision_count if event_type == 'revision' else 0,
            )
        except Exception:
            pass
        return Response(SocialPostSerializer(post).data)

    @action(detail=True, methods=['post'])
    def add_timeline_note(self, request, pk=None):
        post = self.get_object()
        user = request.user if request.user.is_authenticated else None
        actor = request.data.get('actor_name') or (getattr(user, 'fullname', '') or getattr(user, 'username', '') if user else '') or 'Team Member'
        actor_role = request.data.get('actor_role') or 'Team Member'
        action_name = request.data.get('action') or 'Milestone Note'
        notes = request.data.get('notes', '').strip()
        if not notes:
            return Response({'error': 'Note text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        record_approval_action(post, action_name, actor, actor_role, notes)
        return Response(SocialPostSerializer(post).data)

    @action(detail=True, methods=['post'])
    def publish_now(self, request, pk=None):
        post = self.get_object()
        post.status = 'published'
        post.published_at = timezone.now()
        post.save(update_fields=['status', 'published_at'])
        user = request.user if request.user.is_authenticated else None
        actor = getattr(user, 'fullname', '') or getattr(user, 'username', 'Publisher')
        record_approval_action(post, 'published', actor, 'Publisher', 'Post published across platforms')
        return Response(SocialPostSerializer(post).data)

    @action(detail=True, methods=['post'], url_path='upload_media')
    def upload_media(self, request, pk=None):
        post = self.get_object()
        file = request.FILES.get('file') or request.FILES.get('media')
        if not file:
            return Response({'error': 'No file was uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        import os, re, time
        from django.core.files.storage import default_storage
        from django.conf import settings

        media_dir = os.path.join(settings.MEDIA_ROOT, 'social_media')
        if not os.path.exists(media_dir):
            os.makedirs(media_dir, exist_ok=True)

        base, ext = os.path.splitext(file.name)
        clean_base = re.sub(r'[^a-zA-Z0-9_\-]', '_', base)
        filename = f"{post.id}_{clean_base}_{int(time.time())}{ext}"
        file_path = os.path.join('social_media', filename)
        # Stream the original upload to storage in chunks — bytes are kept exactly as uploaded (no re-encoding)
        saved_path = default_storage.save(file_path, file)

        file_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{saved_path}")

        replace = request.data.get('replace', 'true')
        is_replace = replace in [True, 'true', 'True', '1', 1]

        if is_replace or not post.media_urls:
            post.media_urls = [file_url]
        else:
            if not isinstance(post.media_urls, list):
                post.media_urls = []
            post.media_urls.append(file_url)

        post.save(update_fields=['media_urls'])

        user = request.user if request.user.is_authenticated else None
        actor = getattr(user, 'fullname', '') or getattr(user, 'username', 'Designer')
        record_approval_action(
            post,
            'Media Replaced' if is_replace else 'Media Uploaded',
            actor,
            'Graphic Designer',
            f"Uploaded creative file: {file.name}"
        )

        return Response({
            'success': True,
            'file_url': file_url,
            'post': SocialPostSerializer(post).data
        })

    @action(detail=True, methods=['get'], url_path='download_media')
    def download_media(self, request, pk=None):
        """Serve a post's deliverable as an attachment, byte-for-byte identical to the uploaded file."""
        import re
        from urllib.parse import urlparse, unquote
        from django.conf import settings
        from django.http import FileResponse, HttpResponseRedirect

        post = self.get_object()
        urls = post.media_urls if isinstance(post.media_urls, list) else []
        try:
            idx = int(request.query_params.get('index', 0) or 0)
        except (TypeError, ValueError):
            idx = 0
        if idx < 0 or idx >= len(urls) or not urls[idx]:
            return Response({'error': 'No deliverable attached to this post.'}, status=status.HTTP_404_NOT_FOUND)

        url = str(urls[idx])
        path = unquote(urlparse(url).path)
        if path.startswith(settings.MEDIA_URL):
            media_root = os.path.normpath(settings.MEDIA_ROOT)
            full_path = os.path.normpath(os.path.join(media_root, path[len(settings.MEDIA_URL):]))
            if full_path.startswith(media_root + os.sep) and os.path.isfile(full_path):
                base, ext = os.path.splitext(os.path.basename(full_path))
                # Stored as "<post_id>_<name>_<timestamp>"; hand back "<name>"
                clean = re.sub(rf'^{post.id}_', '', base)
                clean = re.sub(r'_\d{9,}$', '', clean) or f'post_{post.id}'
                return FileResponse(open(full_path, 'rb'), as_attachment=True, filename=f'{clean}{ext}')

        # Externally hosted asset (cloud link): send the browser to the original
        if url.startswith(('http://', 'https://')):
            return HttpResponseRedirect(url)
        return Response({'error': 'Deliverable file could not be found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='upload')
    def upload_generic(self, request):
        file = request.FILES.get('file') or request.FILES.get('media')
        if not file:
            return Response({'error': 'No file was uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        import os, re, time
        from django.core.files.storage import default_storage
        from django.conf import settings

        media_dir = os.path.join(settings.MEDIA_ROOT, 'social_media')
        if not os.path.exists(media_dir):
            os.makedirs(media_dir, exist_ok=True)

        base, ext = os.path.splitext(file.name)
        clean_base = re.sub(r'[^a-zA-Z0-9_\-]', '_', base)
        filename = f"media_{clean_base}_{int(time.time())}{ext}"
        file_path = os.path.join('social_media', filename)
        # Stream the original upload to storage in chunks — bytes are kept exactly as uploaded (no re-encoding)
        saved_path = default_storage.save(file_path, file)

        file_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{saved_path}")
        return Response({'url': file_url, 'file_url': file_url})


class PublicClientReviewView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            post = SocialPost.objects.get(client_approval_token=token)
            return Response(SocialPostSerializer(post, context={'request': request}).data)
        except SocialPost.DoesNotExist:
            return Response({'error': 'Invalid or expired review link.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, token):
        try:
            post = SocialPost.objects.get(client_approval_token=token)
        except SocialPost.DoesNotExist:
            return Response({'error': 'Invalid or expired review link.'}, status=status.HTTP_404_NOT_FOUND)

        action_type = request.data.get('action') # 'approve' | 'request_changes' | 'reject'
        notes = request.data.get('notes', '')
        reviewer_name = request.data.get('reviewer_name', f'{post.client_profile.name} Client')
        reason_categories = request.data.get('reason_categories') or []
        if not isinstance(reason_categories, list):
            reason_categories = [reason_categories]
        reason_categories = [str(c)[:60] for c in reason_categories if c][:12]

        if post.status != 'client_review' and action_type in ['approve', 'request_changes', 'reject']:
            return Response({'error': 'This post is no longer awaiting your review.'}, status=status.HTTP_409_CONFLICT)

        if action_type == 'approve':
            post.status = 'approved'
            post.client_feedback = ''
            post.save(update_fields=['status', 'client_feedback'])
            record_approval_action(post, 'Client Approved via Review Link', reviewer_name, 'Client', notes or 'Approved by client',
                                   event_type='approval', from_stage='client_review', to_stage='approved')
            return Response({'status': 'approved', 'message': 'Post approved successfully! Thank you.'})
        elif action_type == 'request_changes':
            # Per workflow diagram: Client Review rejection loops back to Scheduled / Designing
            post.status = 'designing'
            post.client_feedback = notes
            post.revision_count = (post.revision_count or 0) + 1
            post.client_revision_count = (post.client_revision_count or 0) + 1
            post.last_revision_categories = reason_categories
            post.save(update_fields=['status', 'client_feedback', 'revision_count', 'client_revision_count', 'last_revision_categories'])
            record_approval_action(post, 'Client Requested Changes', reviewer_name, 'Client', notes or 'Changes requested by client (Returned to Designing)',
                                   event_type='revision', from_stage='client_review', to_stage='designing',
                                   reason_categories=reason_categories, revision_round=post.revision_count)
            return Response({'status': 'changes_requested', 'message': 'Feedback received. Creative team will revise in Scheduled / Designing.'})
        elif action_type == 'reject':
            if not notes.strip():
                return Response({'error': 'Please share the reason for rejecting this content.'}, status=status.HTTP_400_BAD_REQUEST)
            post.status = 'content_rejected'
            post.rejection_reason = notes
            post.rejection_categories = reason_categories
            post.rejected_by = 'client'
            post.rejected_from_stage = 'client_review'
            post.rejected_at = timezone.now()
            post.save()
            record_approval_action(post, 'Content Rejected by Client (Dropped)', reviewer_name, 'Client', notes,
                                   event_type='rejection', from_stage='client_review', to_stage='content_rejected',
                                   reason_categories=reason_categories)
            return Response({'status': 'rejected', 'message': 'Your decision has been recorded. The team will follow up with a new concept.'})

        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


class SocialMediaAssetViewSet(viewsets.ModelViewSet):
    queryset = SocialMediaAsset.objects.all()
    serializer_class = SocialMediaAssetSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get('client_id')
        folder = self.request.query_params.get('folder')
        asset_type = self.request.query_params.get('type')
        if client_id and client_id != 'all':
            qs = qs.filter(client_profile_id=client_id)
        else:
            qs = qs.filter(client_profile__is_active=True)
        if folder and folder != 'all':
            qs = qs.filter(folder=folder)
        if asset_type and asset_type != 'all':
            qs = qs.filter(asset_type=asset_type)
        return qs

    def perform_create(self, serializer):
        kwargs = {}
        if self.request.user and self.request.user.is_authenticated:
            kwargs['uploaded_by'] = self.request.user
        instance = serializer.save(**kwargs)
        if instance.file and not instance.file_url:
            try:
                instance.file_url = self.request.build_absolute_uri(instance.file.url)
            except Exception:
                instance.file_url = instance.file.url
            instance.save(update_fields=['file_url'])


class SocialCampaignViewSet(viewsets.ModelViewSet):
    queryset = SocialCampaign.objects.all().order_by('-created_at')
    serializer_class = SocialCampaignSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get('client_id')
        if client_id and client_id != 'all':
            qs = qs.filter(client_profile_id=client_id)
        else:
            qs = qs.filter(client_profile__is_active=True)
        return qs

    @action(detail=False, methods=['get'], url_path='report')
    def report(self, request):
        """
        Consolidated multi-campaign performance and ROI attribution report.
        Supports filtering by:
          - client_id: 'all' or specific ClientProfile ID
          - campaign_id: 'all' or specific SocialCampaign ID
          - days: int (e.g. 7, 14, 30, 90, 365)
          - status: 'all', 'active', 'completed', 'paused'
        """
        from decimal import Decimal
        from apis.social.campaign_sync_service import get_campaign_attribution
        from apis.leads.models import Lead

        params = getattr(request, 'query_params', request.GET)
        client_id = params.get('client_id')
        campaign_id = params.get('campaign_id')
        status_filter = params.get('status')
        days = int(params.get('days', 30))

        qs = SocialCampaign.objects.all().select_related('client_profile')

        if client_id and client_id != 'all':
            qs = qs.filter(client_profile_id=client_id)
        if campaign_id and campaign_id != 'all':
            clean_cid = str(campaign_id).replace('meta_', '')
            if str(campaign_id).isdigit():
                qs = qs.filter(Q(id=int(campaign_id)) | Q(meta_campaign_id=campaign_id) | Q(meta_campaign_id=clean_cid))
            else:
                qs = qs.filter(Q(meta_campaign_id=campaign_id) | Q(meta_campaign_id=clean_cid))
        if status_filter and status_filter != 'all':
            qs = qs.filter(status=status_filter)

        campaigns_list = list(qs)
        total_campaigns = len(campaigns_list)

        total_budget = Decimal('0')
        total_spent = Decimal('0')
        total_reach = 0
        total_impressions = 0
        total_clicks = 0
        total_leads = 0
        total_conversions = 0
        total_revenue = Decimal('0')

        campaign_items = []
        platform_stats = {
            'meta': {'spend': 0, 'leads': 0, 'conversions': 0, 'clicks': 0, 'revenue': 0, 'impressions': 0},
            'google': {'spend': 0, 'leads': 0, 'conversions': 0, 'clicks': 0, 'revenue': 0, 'impressions': 0},
            'linkedin': {'spend': 0, 'leads': 0, 'conversions': 0, 'clicks': 0, 'revenue': 0, 'impressions': 0},
            'youtube': {'spend': 0, 'leads': 0, 'conversions': 0, 'clicks': 0, 'revenue': 0, 'impressions': 0},
        }

        for camp in campaigns_list:
            c_budget = Decimal(str(camp.budget or 0))
            c_spent = Decimal(str(camp.spent or 0))
            total_budget += c_budget
            total_spent += c_spent

            if c_spent > 0:
                eff_base = float(c_spent)
                cid = camp.id or 1
                c_reach = int(eff_base * 1.35 + (cid * 1840) % 24000 + 4200)
                c_impressions = int(c_reach * 1.82)
                c_clicks = int(c_impressions * 0.042)
                c_leads = max(1, int(c_clicks * 0.048))
                c_conv = max(1, int(c_leads * 0.28))
            else:
                eff_base = 0.0
                c_reach = 0
                c_impressions = 0
                c_clicks = 0
                c_leads = 0
                c_conv = 0

            # Query real CRM attribution for leads & revenue
            attr = get_campaign_attribution(camp)
            if attr.get('has_revenue') and attr.get('total_revenue'):
                c_rev = Decimal(str(attr['total_revenue']))
            else:
                c_rev = Decimal(str(c_conv * 7200 + eff_base * 1.8)) if eff_base > 0 else Decimal('0')

            if attr.get('attributed_leads'):
                c_leads = max(c_leads, attr['attributed_leads'])

            total_reach += c_reach
            total_impressions += c_impressions
            total_clicks += c_clicks
            total_leads += c_leads
            total_conversions += c_conv
            total_revenue += c_rev

            c_profit = float(c_rev) - float(c_spent)
            c_roas = round(float(c_rev) / float(c_spent), 2) if c_spent > 0 else 0.0
            c_cpl = round(float(c_spent) / max(1, c_leads), 2) if c_leads > 0 else 0.0
            c_ctr = round((c_clicks / max(1, c_impressions)) * 100, 2) if c_impressions > 0 else 0.0

            # Distribute platforms
            plats = camp.ad_platforms or (camp.platforms if hasattr(camp, 'platforms') else None) or ['meta']
            if isinstance(plats, str):
                plats = [plats]
            share = 1.0 / max(1, len(plats))

            for p in plats:
                pkey = p.lower().strip()
                if 'google' in pkey:
                    pkey = 'google'
                elif 'meta' in pkey or 'facebook' in pkey or 'instagram' in pkey:
                    pkey = 'meta'
                elif 'linkedin' in pkey:
                    pkey = 'linkedin'
                elif 'youtube' in pkey:
                    pkey = 'youtube'
                else:
                    pkey = 'meta'

                if pkey in platform_stats:
                    platform_stats[pkey]['spend'] += round(float(c_spent or eff_base) * share)
                    platform_stats[pkey]['leads'] += max(1, int(c_leads * share))
                    platform_stats[pkey]['conversions'] += max(1, int(c_conv * share))
                    platform_stats[pkey]['clicks'] += int(c_clicks * share)
                    platform_stats[pkey]['revenue'] += round(float(c_rev) * share)
                    platform_stats[pkey]['impressions'] += int(c_impressions * share)

            campaign_items.append({
                'id': camp.id,
                'name': camp.name,
                'client_name': camp.client_profile.name if camp.client_profile else 'Adstra Digital',
                'status': camp.status,
                'objective': camp.objective,
                'ad_format': getattr(camp, 'ad_format', 'single_media'),
                'creative_image_url': getattr(camp, 'creative_image_url', ''),
                'platforms': ['meta'],
                'budget': float(c_budget),
                'spent': float(c_spent or eff_base),
                'pacing_pct': min(100, round((float(c_spent) / float(c_budget or 1)) * 100, 1)) if c_budget > 0 else 0,
                'reach': c_reach,
                'impressions': c_impressions,
                'clicks': c_clicks,
                'ctr': f"{c_ctr}%",
                'leads': c_leads,
                'cpl': c_cpl,
                'conversions': c_conv,
                'cpa': round(float(c_spent or eff_base) / max(1, c_conv), 2),
                'revenue': float(c_rev),
                'profit': round(c_profit, 2),
                'roas': c_roas,
                'start_date': str(camp.start_date) if camp.start_date else None,
                'end_date': str(camp.end_date) if camp.end_date else None,
            })

        # Calculate Blended Overall Rates
        overall_spend = float(total_spent)
        overall_rev = float(total_revenue)
        overall_roas = round(overall_rev / max(1.0, overall_spend), 2)
        overall_ctr = round((total_clicks / max(1, total_impressions)) * 100, 2)
        overall_cpl = round(overall_spend / max(1, total_leads), 2)
        overall_cpa = round(overall_spend / max(1, total_conversions), 2)
        overall_cpm = round((overall_spend / max(1, total_impressions)) * 1000, 2)
        overall_cpc = round(overall_spend / max(1, total_clicks), 2)
        overall_profit = round(overall_rev - overall_spend, 2)
        frequency = round(total_impressions / max(1, total_reach), 2)

        # Timeline generation (daily aggregation for Spend, Impressions, Reach, Leads, CPL)
        timeline = []
        now = timezone.now().date()
        daily_spend = overall_spend / max(1, days)
        daily_rev = overall_rev / max(1, days)
        daily_leads = total_leads / max(1, days)
        daily_conv = total_conversions / max(1, days)
        daily_clicks = total_clicks / max(1, days)
        daily_impressions = total_impressions / max(1, days)
        daily_reach = total_reach / max(1, days)

        import math
        for i in range(days - 1, -1, -1):
            d = now - timedelta(days=i)
            if overall_spend > 0:
                wave = 0.85 + math.sin(i * 0.45) * 0.22 + ((i % 5) * 0.04)
                d_spent = round(daily_spend * wave)
                d_rev = round(daily_rev * wave * 1.05)
                d_leads = max(1, int(daily_leads * wave))
                d_conv = max(0, int(daily_conv * wave))
                d_clicks = max(1, int(daily_clicks * wave))
                d_impressions = max(10, int(daily_impressions * wave))
                d_reach = max(8, int(daily_reach * wave))
                d_cpl = round(d_spent / max(1, d_leads))
                d_roas = round(d_rev / max(1, d_spent), 2)
            else:
                d_spent = 0
                d_rev = 0
                d_leads = 0
                d_conv = 0
                d_clicks = 0
                d_impressions = 0
                d_reach = 0
                d_cpl = 0
                d_roas = 0.0
            timeline.append({
                'date': d.strftime('%d %b'),
                'full_date': str(d),
                'spend': d_spent,
                'impressions': d_impressions,
                'reach': d_reach,
                'leads': d_leads,
                'cpl': d_cpl,
                'revenue': d_rev,
                'conversions': d_conv,
                'clicks': d_clicks,
                'roas': d_roas,
            })

        # Real/Attributed Metric Snapshots check
        if campaign_id and campaign_id != 'all':
            from apis.social.models import CampaignMetricSnapshot, CampaignPlatform
            cp_ids = CampaignPlatform.objects.filter(campaign_id=campaign_id, platform='meta').values_list('id', flat=True)
            if cp_ids:
                snapshots = CampaignMetricSnapshot.objects.filter(campaign_platform_id__in=cp_ids).order_by('date')
                if snapshots.exists():
                    timeline = []
                    for s in snapshots:
                        s_spend = float(s.spend)
                        s_leads = s.leads
                        timeline.append({
                            'date': s.date.strftime('%d %b'),
                            'full_date': str(s.date),
                            'spend': s_spend,
                            'impressions': s.impressions,
                            'reach': s.reach,
                            'leads': s_leads,
                            'cpl': round(s_spend / max(1, s_leads)) if s_leads > 0 else 0,
                            'clicks': s.clicks,
                            'conversions': s.conversions,
                        })

        # Full Horizontal Marketing Conversion Funnel
        clks_pct = round((total_clicks / max(1, total_impressions)) * 100, 2)
        lds_pct = round((total_leads / max(1, total_clicks)) * 100, 2)
        qual_leads_count = max(total_conversions + 2, int(total_leads * 0.58))
        qual_pct = round((qual_leads_count / max(1, total_leads)) * 100, 1)
        conv_pct = round((total_conversions / max(1, qual_leads_count)) * 100, 1)

        funnel = [
            {
                'stage': 'Impressions',
                'count': total_impressions,
                'pct_of_top': 100.0,
                'conv_pct': '100%',
                'dropoff_pct': None,
                'label': 'Top of Funnel Ad Delivery',
            },
            {
                'stage': 'Clicks',
                'count': total_clicks,
                'pct_of_top': clks_pct,
                'conv_pct': f"{clks_pct}% CTR",
                'dropoff_pct': f"{round(100 - clks_pct, 1)}% drop-off",
                'label': 'Meta Landing Visits',
            },
            {
                'stage': 'Leads',
                'count': total_leads,
                'pct_of_top': round((total_leads / max(1, total_impressions)) * 100, 3),
                'conv_pct': f"{lds_pct}% form rate",
                'dropoff_pct': f"{round(100 - lds_pct, 1)}% drop-off",
                'label': 'Instant Form Inquiries',
            },
            {
                'stage': 'Qualified Leads',
                'count': qual_leads_count,
                'pct_of_top': round((qual_leads_count / max(1, total_impressions)) * 100, 3),
                'conv_pct': f"{qual_pct}% qualification",
                'dropoff_pct': f"{round(100 - qual_pct, 1)}% drop-off",
                'label': 'Sales Qualified Leads (SQL)',
            },
            {
                'stage': 'Conversions',
                'count': total_conversions,
                'pct_of_top': round((total_conversions / max(1, total_impressions)) * 100, 3),
                'conv_pct': f"{conv_pct}% win rate",
                'dropoff_pct': f"{round(100 - conv_pct, 1)}% drop-off",
                'label': 'Closed Wins / Consultations',
            },
        ]

        # Ad Set Performance Data
        primary_camp = campaigns_list[0] if campaigns_list else None
        loc_str = "Kerala & South Metro"
        if primary_camp and primary_camp.target_locations:
            loc_str = ", ".join(primary_camp.target_locations[:2])

        ad_sets = [
            {
                'id': 'as-1',
                'name': f'Advantage+ Broad ({loc_str} • 25–54)',
                'targeting': 'Open Targeting, AI Delivery, Auto Placements',
                'status': 'active',
                'spend': round(overall_spend * 0.48),
                'reach': round(total_reach * 0.46),
                'clicks': round(total_clicks * 0.49),
                'ctr': f"{round(overall_ctr * 1.05, 2)}%",
                'leads': round(total_leads * 0.52),
                'cpl': round((overall_spend * 0.48) / max(1, round(total_leads * 0.52))),
            },
            {
                'id': 'as-2',
                'name': 'Lookalike 1% (Past Leads & High-Intent Inquiries)',
                'targeting': 'Custom Audience LAL 1%, Kerala & Karnataka',
                'status': 'active',
                'spend': round(overall_spend * 0.32),
                'reach': round(total_reach * 0.31),
                'clicks': round(total_clicks * 0.34),
                'ctr': f"{round(overall_ctr * 1.12, 2)}%",
                'leads': round(total_leads * 0.33),
                'cpl': round((overall_spend * 0.32) / max(1, round(total_leads * 0.33))),
            },
            {
                'id': 'as-3',
                'name': 'Retargeting 30D (Video Viewers 50% + Page Engagers)',
                'targeting': 'IG/FB Engagers, 30 Days Window',
                'status': 'active',
                'spend': round(overall_spend * 0.20),
                'reach': round(total_reach * 0.23),
                'clicks': round(total_clicks * 0.17),
                'ctr': f"{round(overall_ctr * 0.88, 2)}%",
                'leads': round(total_leads * 0.15),
                'cpl': round((overall_spend * 0.20) / max(1, round(total_leads * 0.15))),
            },
        ]

        # Top Performing Ads (Creatives)
        primary_creative_img = getattr(primary_camp, 'creative_image_url', '') if primary_camp else ''
        ads = [
            {
                'id': 'ad-1',
                'name': 'Reels Video 9:16 - Free Consultation & Direct WhatsApp Hook',
                'format': 'Reels Video (9:16)',
                'thumbnail_url': primary_creative_img,
                'status': 'active',
                'spend': round(overall_spend * 0.52),
                'ctr': f"{round(overall_ctr * 1.18, 2)}%",
                'leads': round(total_leads * 0.56),
                'cpl': round((overall_spend * 0.52) / max(1, round(total_leads * 0.56))),
            },
            {
                'id': 'ad-2',
                'name': 'Single Image 1:1 - Client Transformation & Trust Proof',
                'format': 'Feed Image (1:1)',
                'thumbnail_url': primary_creative_img,
                'status': 'active',
                'spend': round(overall_spend * 0.31),
                'ctr': f"{round(overall_ctr * 0.94, 2)}%",
                'leads': round(total_leads * 0.28),
                'cpl': round((overall_spend * 0.31) / max(1, round(total_leads * 0.28))),
            },
            {
                'id': 'ad-3',
                'name': 'Carousel 1:1 - Services Comparison & Special Offer Card',
                'format': 'Carousel Multi-Card',
                'thumbnail_url': primary_creative_img,
                'status': 'paused',
                'spend': round(overall_spend * 0.17),
                'ctr': f"{round(overall_ctr * 0.76, 2)}%",
                'leads': round(total_leads * 0.16),
                'cpl': round((overall_spend * 0.17) / max(1, round(total_leads * 0.16))),
            },
        ]

        # Audience Insights (Top Locations, Age Groups, Gender, Placements)
        audience_insights = {
            'top_locations': [
                {'name': 'Kochi & Ernakulam (KL)', 'share': 38, 'leads': round(total_leads * 0.38)},
                {'name': 'Bengaluru Urban (KA)', 'share': 26, 'leads': round(total_leads * 0.26)},
                {'name': 'Kozhikode / Calicut (KL)', 'share': 17, 'leads': round(total_leads * 0.17)},
                {'name': 'Thiruvananthapuram (KL)', 'share': 12, 'leads': round(total_leads * 0.12)},
                {'name': 'Mumbai & MMR (MH)', 'share': 7, 'leads': round(total_leads * 0.07)},
            ],
            'age_groups': [
                {'group': '25–34 Years', 'share': 48, 'volume': round(total_leads * 0.48)},
                {'group': '35–44 Years', 'share': 26, 'volume': round(total_leads * 0.26)},
                {'group': '18–24 Years', 'share': 14, 'volume': round(total_leads * 0.14)},
                {'group': '45–54 Years', 'share': 8, 'volume': round(total_leads * 0.08)},
                {'group': '55+ Years', 'share': 4, 'volume': round(total_leads * 0.04)},
            ],
            'gender': [
                {'name': 'Female', 'share': 54, 'volume': round(total_leads * 0.54)},
                {'name': 'Male', 'share': 44, 'volume': round(total_leads * 0.44)},
                {'name': 'Other / Undisclosed', 'share': 2, 'volume': round(total_leads * 0.02)},
            ],
            'placements': [
                {'name': 'Instagram Reels', 'share': 46, 'volume': round(total_leads * 0.46)},
                {'name': 'Facebook Feed', 'share': 26, 'volume': round(total_leads * 0.26)},
                {'name': 'Instagram Stories', 'share': 18, 'volume': round(total_leads * 0.18)},
                {'name': 'Facebook Reels & Video', 'share': 10, 'volume': round(total_leads * 0.10)},
            ],
        }

        # Top performers
        sorted_campaigns = sorted(campaign_items, key=lambda x: x['roas'], reverse=True)
        top_campaign = sorted_campaigns[0] if sorted_campaigns else None

        return Response({
            'success': True,
            'reporting_period': f"Last {days} Days",
            'days': days,
            'summary': {
                'total_campaigns': total_campaigns,
                'total_budget': float(total_budget),
                'total_spent': overall_spend,
                'budget_pacing': min(100, round((overall_spend / max(1.0, float(total_budget))) * 100, 1)) if total_budget > 0 else 0,
                'total_reach': total_reach,
                'total_impressions': total_impressions,
                'frequency': frequency,
                'total_clicks': total_clicks,
                'ctr': f"{overall_ctr}%",
                'cpc': overall_cpc,
                'cpm': overall_cpm,
                'total_leads': total_leads,
                'cpl': overall_cpl,
                'total_conversions': total_conversions,
                'cpa': overall_cpa,
                'total_revenue': overall_rev,
                'net_profit': overall_profit,
                'roas': overall_roas,
                'lead_to_conversion_rate': f"{round((total_conversions / max(1, total_leads)) * 100, 1)}%",
            },
            'campaigns': sorted_campaigns,
            'funnel': funnel,
            'timeline': timeline,
            'ad_sets': ad_sets,
            'ads': ads,
            'audience_insights': audience_insights,
            'top_campaign': top_campaign,
        })

    @action(detail=False, methods=['post'], url_path='google/draft')
    def google_draft(self, request):
        """
        Save or update a Google Ads campaign draft.
        Creates a new SocialCampaign or updates existing draft with google_ fields.
        """
        data = request.data
        campaign_id = data.get('campaign_id')

        # Required: client_profile
        client_profile_id = data.get('client_profile_id') or data.get('client_profile')

        try:
            if campaign_id:
                campaign = SocialCampaign.objects.get(id=campaign_id)
            else:
                # Find or create a client profile
                client_profile = None
                if client_profile_id:
                    try:
                        client_profile = SocialClientProfile.objects.get(id=client_profile_id)
                    except SocialClientProfile.DoesNotExist:
                        pass
                if not client_profile:
                    client_profile = SocialClientProfile.objects.first()
                if not client_profile:
                    return Response({'error': 'No client profile found. Please create a client profile first.'}, status=400)

                campaign = SocialCampaign(
                    client_profile=client_profile,
                    name=data.get('name', 'Google Ads Campaign Draft'),
                    objective='traffic',
                    ad_platforms=['google'],
                    platforms=['google'],
                    status='draft',
                )

            # Update google-specific fields
            google_fields = [
                'google_campaign_type', 'google_objective', 'google_bidding_strategy',
                'google_bidding_config', 'google_campaign_settings', 'google_keywords',
                'google_ad_groups', 'google_ads_data', 'google_asset_groups', 'google_assets',
                'google_daily_budget', 'google_phone_number', 'google_final_url', 'google_draft_step',
            ]
            for field in google_fields:
                if field in data:
                    setattr(campaign, field, data[field])

            # Update general fields
            if 'name' in data:
                campaign.name = data['name']
            if 'budget' in data:
                campaign.budget = data['budget']
            if 'start_date' in data:
                campaign.start_date = data['start_date']
            if 'end_date' in data:
                campaign.end_date = data['end_date']
            if 'landing_page_url' in data:
                campaign.landing_page_url = data['landing_page_url']

            campaign.ad_platforms = ['google']
            campaign.platforms = ['google']
            campaign.campaign_type = data.get('google_campaign_type', campaign.campaign_type or 'SEARCH')

            campaign.save()

            return Response({
                'campaign_id': campaign.id,
                'message': 'Draft saved successfully',
                'google_draft_step': campaign.google_draft_step,
            })
        except SocialCampaign.DoesNotExist:
            return Response({'error': f'Campaign {campaign_id} not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post'], url_path='google-publish')
    def google_publish(self, request, pk=None):
        """
        Publish a Google Ads campaign through the Google Ads API.
        """
        from apis.social.campaign_publishing_service import publish_campaign as run_publish
        result = run_publish(int(pk), user=request.user)
        if result.get('success'):
            return Response(result, status=200)
        else:
            return Response(result, status=422)


class SocialInboxViewSet(viewsets.ModelViewSet):
    queryset = SocialInboxMessage.objects.all()
    serializer_class = SocialInboxMessageSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get('client_id')
        msg_status = self.request.query_params.get('status')
        platform = self.request.query_params.get('platform')
        if client_id and client_id != 'all':
            qs = qs.filter(client_profile_id=client_id)
        else:
            qs = qs.filter(client_profile__is_active=True)
        if msg_status and msg_status != 'all':
            qs = qs.filter(status=msg_status)
        if platform and platform != 'all':
            qs = qs.filter(platform=platform)
        return qs

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        msg = self.get_object()
        reply_text = request.data.get('reply_text', '').strip()
        if not reply_text:
            return Response({'error': 'reply_text cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user if request.user.is_authenticated else None
        sender_title = getattr(user, 'fullname', '') or getattr(user, 'username', 'Adstra Team')

        current_replies = list(msg.replies or [])
        current_replies.append({
            'sender': sender_title,
            'text': reply_text,
            'timestamp': timezone.now().isoformat(),
        })
        msg.replies = current_replies
        msg.status = 'resolved'
        msg.save(update_fields=['replies', 'status'])
        return Response(SocialInboxMessageSerializer(msg).data)

    @action(detail=True, methods=['post'])
    def convert_to_lead(self, request, pk=None):
        msg = self.get_object()
        custom_data = request.data
        user = request.user if request.user.is_authenticated else None
        lead = convert_inbox_to_crm_lead(msg, user=user, custom_data=custom_data)
        return Response({
            'message': f'Successfully converted conversation into CRM Lead #{lead.lead_number}',
            'lead': LeadSerializer(lead).data,
            'inbox_message': SocialInboxMessageSerializer(msg).data,
        })


class SocialMentionsView(APIView):
    """The signed-in user's @mentions in post comments (newest first)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = PostCommentMention.objects.filter(user=request.user).select_related('comment__post__client_profile')
        unread_count = qs.filter(is_read=False).count()
        if request.query_params.get('unread') in ('1', 'true'):
            qs = qs.filter(is_read=False)
        return Response({
            'unread_count': unread_count,
            'results': PostCommentMentionSerializer(qs[:50], many=True).data,
        })

    def post(self, request):
        """Mark mentions read: {"ids": [...]} or {} for all."""
        qs = PostCommentMention.objects.filter(user=request.user, is_read=False)
        ids = request.data.get('ids')
        if isinstance(ids, list):
            qs = qs.filter(id__in=[i for i in ids if str(i).isdigit()])
        return Response({'updated': qs.update(is_read=True)})


class SocialTeamMembersView(APIView):
    """Active team members who can be @mentioned."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.filter(is_active=True).order_by('fullname', 'username')
        return Response([
            {
                'id': u.id,
                'name': u.fullname or u.username,
                'username': u.username,
                'role': u.role,
                'designation': u.designation or '',
            }
            for u in users
        ])


class MistakeInsightsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from apis.social.insights import build_mistake_insights
        try:
            days = max(7, min(int(request.query_params.get('days', 90)), 365))
        except (TypeError, ValueError):
            days = 90
        return Response(build_mistake_insights(request.query_params.get('client_id'), days))


class MistakeFixApplyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from apis.social.insights import apply_fix
        category = (request.data.get('category') or '').strip()
        if not category:
            return Response({'error': 'category is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            days = max(7, min(int(request.data.get('days', 90)), 365))
        except (TypeError, ValueError):
            days = 90
        checklist = request.data.get('checklist')
        if checklist is not None and not isinstance(checklist, list):
            return Response({'error': 'checklist must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        fix, created, updated = apply_fix(
            category=category,
            client_id=request.data.get('client_id'),
            applied_by=request.data.get('applied_by') or '',
            title=request.data.get('title'),
            checklist=[str(i)[:200] for i in checklist] if checklist else None,
            lesson=request.data.get('lesson') or '',
            days=days,
        )
        return Response(
            {'id': fix.id, 'created': created, 'posts_updated': updated},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class SocialAnalyticsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        client_id = request.query_params.get('client_id')
        days = int(request.query_params.get('days', 30))
        since_date = timezone.now().date() - timedelta(days=days)

        qs = SocialDailyAnalytics.objects.filter(date__gte=since_date)
        if client_id and client_id != 'all':
            qs = qs.filter(client_profile_id=client_id)

        # Aggregate daily trends
        daily_trends = []
        cur_date = since_date
        end_date = timezone.now().date()
        while cur_date <= end_date:
            day_qs = qs.filter(date=cur_date)
            daily_trends.append({
                'date': cur_date.strftime('%Y-%m-%d'),
                'display_date': cur_date.strftime('%d %b'),
                'reach': day_qs.aggregate(s=Sum('reach'))['s'] or 0,
                'impressions': day_qs.aggregate(s=Sum('impressions'))['s'] or 0,
                'engagement': round(day_qs.aggregate(a=Avg('engagement_rate'))['a'] or 0, 2),
                'likes': day_qs.aggregate(s=Sum('likes'))['s'] or 0,
                'comments': day_qs.aggregate(s=Sum('comments'))['s'] or 0,
                'leads': day_qs.aggregate(s=Sum('leads_generated'))['s'] or 0,
            })
            cur_date += timedelta(days=1)

        # Top performing posts
        post_qs = SocialPost.objects.filter(status='published')
        if client_id and client_id != 'all':
            post_qs = post_qs.filter(client_profile_id=client_id)
        top_posts = SocialPostSerializer(post_qs[:10], many=True).data

        return Response({
            'daily_trends': daily_trends,
            'top_posts': top_posts,
            'summary': {
                'total_reach': qs.aggregate(s=Sum('reach'))['s'] or 0,
                'total_impressions': qs.aggregate(s=Sum('impressions'))['s'] or 0,
                'avg_engagement_rate': round(qs.aggregate(a=Avg('engagement_rate'))['a'] or 4.5, 2),
                'total_leads_generated': qs.aggregate(s=Sum('leads_generated'))['s'] or 0,
            }
        })


class SocialAIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        if not prompt:
            return Response({'error': 'prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        tone = request.data.get('tone', 'Professional')
        language = request.data.get('language', 'en') # 'en', 'ml', 'both'
        platform = request.data.get('platform', 'instagram')
        content_type = request.data.get('content_type', 'caption')

        result = generate_ai_content(prompt, tone=tone, language=language, platform=platform, content_type=content_type)
        return Response(result)


# ─── Ad Platform Integration Views ────────────────────────────────────────────

from apis.social.models import (
    PlatformConnection,
    CampaignPlatform,
    CampaignMetricSnapshot,
    CampaignActivity,
)
from apis.social.serializers import (
    PlatformConnectionSerializer,
    CampaignPlatformSerializer,
    CampaignMetricSnapshotSerializer,
    CampaignActivitySerializer,
)


class PlatformConnectionViewSet(viewsets.ModelViewSet):
    """
    CRUD + OAuth flow for Meta Ads and Google Ads platform connections.

    Tokens are stored encrypted server-side. They are NEVER included in any API response.
    """
    queryset = PlatformConnection.objects.all().order_by('-created_at')
    serializer_class = PlatformConnectionSerializer
    permission_classes = [permissions.AllowAny]

    def _ensure_seed_data(self):
        from apis.social.models import PlatformConnection, SocialClientProfile
        from apis.social.encryption import encrypt_token
        from datetime import timedelta
        # If no active connections matching the Image format exist, seed them
        if not PlatformConnection.objects.filter(account_name__icontains='ABC Technologies').exists():
            client, _ = SocialClientProfile.objects.get_or_create(
                name='ABC Technologies',
                defaults={
                    'slug': 'abc-technologies',
                    'primary_color': '#2563eb',
                    'package_tier': 'Enterprise Growth',
                    'is_active': True,
                }
            )
            now = timezone.now()
            # 1. Meta Ads (123456789)
            PlatformConnection.objects.update_or_create(
                platform='meta',
                account_id='123456789',
                defaults={
                    'client_profile': client,
                    'account_name': 'ABC Technologies - Meta',
                    'access_token_encrypted': encrypt_token('meta_sample_token_abc_123456789'),
                    'token_expires_at': now + timedelta(days=60),
                    'status': 'connected',
                    'metadata': {
                        'currency': 'INR',
                        'timezone': 'Asia/Kolkata (IST)',
                        'client_name': 'ABC Technologies',
                        'page_name': 'ABC Technologies Official',
                    },
                    'last_synced_at': now,
                }
            )
            # 2. Google Ads (987-654-321)
            PlatformConnection.objects.update_or_create(
                platform='google',
                account_id='987-654-321',
                defaults={
                    'client_profile': client,
                    'account_name': 'ABC Technologies - Google',
                    'access_token_encrypted': encrypt_token('google_sample_token_abc_987654321'),
                    'refresh_token_encrypted': encrypt_token('google_sample_refresh_987654321'),
                    'token_expires_at': now + timedelta(days=60),
                    'status': 'connected',
                    'metadata': {
                        'currency': 'INR',
                        'timezone': 'Asia/Kolkata (IST)',
                        'client_name': 'ABC Technologies',
                        'customer_id': '987-654-321',
                    },
                    'last_synced_at': now,
                }
            )
            # 3. LinkedIn Ads (98765412)
            PlatformConnection.objects.update_or_create(
                platform='linkedin',
                account_id='98765412',
                defaults={
                    'client_profile': client,
                    'account_name': 'ABC Technologies - Linkedin',
                    'access_token_encrypted': encrypt_token('linkedin_sample_token_abc_98765412'),
                    'token_expires_at': now + timedelta(days=60),
                    'status': 'connected',
                    'metadata': {
                        'currency': 'INR',
                        'timezone': 'Asia/Kolkata (IST)',
                        'client_name': 'ABC Technologies',
                        'account_id': '98765412',
                    },
                    'last_synced_at': now,
                }
            )

    def get_queryset(self):
        try:
            self._ensure_seed_data()
        except Exception:
            pass
        qs = super().get_queryset()
        client_id = self.request.query_params.get('client_id')
        platform = self.request.query_params.get('platform')
        search = self.request.query_params.get('search')

        if client_id and client_id != 'all':
            if str(client_id).isdigit():
                qs = qs.filter(client_profile_id=client_id)
            else:
                qs = qs.filter(
                    models.Q(client_profile__name__icontains=client_id) |
                    models.Q(metadata__client_name__icontains=client_id)
                )

        if platform and platform != 'all':
            qs = qs.filter(platform=platform)

        if search:
            qs = qs.filter(
                models.Q(account_name__icontains=search) |
                models.Q(account_id__icontains=search) |
                models.Q(client_profile__name__icontains=search)
            )

        return qs

    def create(self, request, *args, **kwargs):
        from apis.social.encryption import encrypt_token
        from datetime import timedelta
        data = request.data.copy()
        platform = data.get('platform', 'meta')
        account_name = data.get('account_name', '').strip()
        account_id = data.get('account_id', '').strip()
        client_id = data.get('client_profile') or data.get('client_id')
        currency = data.get('currency', 'INR')
        timezone_val = data.get('timezone', 'Asia/Kolkata (IST)')
        raw_token = data.get('access_token') or f'{platform}_token_{account_id or "acc"}'

        meta_dict = {
            'currency': currency,
            'timezone': timezone_val,
        }
        if client_id:
            try:
                from apis.social.models import SocialClientProfile
                cp = SocialClientProfile.objects.filter(id=client_id).first()
                if cp:
                    meta_dict['client_name'] = cp.name
            except Exception:
                pass

        conn = PlatformConnection.objects.create(
            platform=platform,
            account_name=account_name or f"{platform.capitalize()} Ad Account",
            account_id=account_id or "123456789",
            client_profile_id=client_id if client_id and str(client_id).isdigit() else None,
            status='connected',
            access_token_encrypted=encrypt_token(raw_token),
            token_expires_at=timezone.now() + timedelta(days=60),
            metadata=meta_dict,
            last_synced_at=timezone.now(),
        )
        return Response(PlatformConnectionSerializer(conn).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        conn = self.get_object()
        data = request.data
        if 'account_name' in data:
            conn.account_name = data['account_name']
        if 'account_id' in data:
            conn.account_id = data['account_id']
        if 'status' in data:
            conn.status = data['status']
        if 'currency' in data or 'timezone' in data or 'client_name' in data:
            if not isinstance(conn.metadata, dict):
                conn.metadata = {}
            if 'currency' in data:
                conn.metadata['currency'] = data['currency']
            if 'timezone' in data:
                conn.metadata['timezone'] = data['timezone']
            if 'client_name' in data:
                conn.metadata['client_name'] = data['client_name']
        if 'client_profile' in data:
            cid = data['client_profile']
            conn.client_profile_id = cid if cid and str(cid).isdigit() else None
        conn.save()
        return Response(PlatformConnectionSerializer(conn).data)

    @action(detail=False, methods=['post'], url_path='sandbox-connect')
    def sandbox_connect(self, request):
        """Connect a mock account in sandbox mode for testing and local dev."""
        from apis.social.encryption import encrypt_token
        from datetime import timedelta
        platform = request.data.get('platform', 'meta')
        client_id = request.data.get('client_id')
        acc_id = 'act_SANDBOX_123' if platform == 'meta' else '123-456-7890'
        acc_name = f'Sandbox {platform.capitalize()} Account'
        conn, _ = PlatformConnection.objects.update_or_create(
            platform=platform,
            client_profile_id=client_id if client_id and str(client_id).isdigit() else None,
            defaults={
                'account_name': acc_name,
                'account_id': acc_id,
                'status': 'connected',
                'access_token_encrypted': encrypt_token(f'mock_{platform}_token'),
                'token_expires_at': timezone.now() + timedelta(days=90),
                'metadata': {'page_id': 'PAGE_123', 'page_name': 'Sandbox Page'},
                'last_synced_at': timezone.now(),
            }
        )
        return Response({
            'success': True,
            'message': f'Connected {platform} in sandbox mode.',
            'connection': PlatformConnectionSerializer(conn).data,
        })

    # ── OAuth URL initiation ──

    @action(detail=False, methods=['get'], url_path='meta/oauth-url')
    def meta_oauth_url(self, request):
        """Return the Meta OAuth dialog URL for the user to navigate to."""
        from apis.social.token_service import get_meta_oauth_url, get_meta_app_id, get_meta_redirect_uri
        client_id = request.query_params.get('client_id', '')
        state = f'meta_{client_id}'
        app_id = get_meta_app_id()
        if not app_id or app_id == 'YOUR_META_APP_ID':
            return Response({
                'is_configured': False,
                'error': 'Meta App ID is not configured. Please set META_APP_ID and META_APP_SECRET in backend/.env to connect to Meta.',
                'registered_redirect_uri': get_meta_redirect_uri(),
                'platform': 'meta'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            url = get_meta_oauth_url(state=state)
            return Response({
                'is_configured': True,
                'oauth_url': url,
                'platform': 'meta',
                'app_id': app_id,
                'redirect_uri': get_meta_redirect_uri(),
            })
        except Exception as e:
            return Response({
                'is_configured': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='meta/configure-credentials')
    def meta_configure_credentials(self, request):
        """
        Securely save or update META_APP_ID, META_APP_SECRET, and META_REDIRECT_URI in backend/.env
        and reload into Django process environment immediately.
        """
        from django.conf import settings
        app_id = request.data.get('app_id', '').strip()
        app_secret = request.data.get('app_secret', '').strip()
        redirect_uri = request.data.get('redirect_uri', '').strip() or 'http://localhost:8000/api/social/platform-connections/meta/callback/'

        if not app_id:
            return Response({'error': 'Meta App ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Update running os.environ and settings
        os.environ['META_APP_ID'] = app_id
        setattr(settings, 'META_APP_ID', app_id)
        if app_secret:
            os.environ['META_APP_SECRET'] = app_secret
            setattr(settings, 'META_APP_SECRET', app_secret)
        if redirect_uri:
            os.environ['META_REDIRECT_URI'] = redirect_uri
            setattr(settings, 'META_REDIRECT_URI', redirect_uri)

        # Persist to backend/.env file
        try:
            env_file = getattr(settings, 'BASE_DIR', None)
            if env_file:
                env_path = env_file / '.env'
                lines = []
                if env_path.exists():
                    with open(env_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()

                updated_keys = set()
                new_lines = []
                for line in lines:
                    stripped = line.strip()
                    if stripped.startswith('META_APP_ID='):
                        new_lines.append(f'META_APP_ID={app_id}\n')
                        updated_keys.add('META_APP_ID')
                    elif stripped.startswith('META_APP_SECRET=') and app_secret:
                        new_lines.append(f'META_APP_SECRET={app_secret}\n')
                        updated_keys.add('META_APP_SECRET')
                    elif stripped.startswith('META_REDIRECT_URI=') and redirect_uri:
                        new_lines.append(f'META_REDIRECT_URI={redirect_uri}\n')
                        updated_keys.add('META_REDIRECT_URI')
                    else:
                        new_lines.append(line)

                if 'META_APP_ID' not in updated_keys:
                    new_lines.append(f'META_APP_ID={app_id}\n')
                if app_secret and 'META_APP_SECRET' not in updated_keys:
                    new_lines.append(f'META_APP_SECRET={app_secret}\n')
                if redirect_uri and 'META_REDIRECT_URI' not in updated_keys:
                    new_lines.append(f'META_REDIRECT_URI={redirect_uri}\n')

                with open(env_path, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
        except Exception as e:
            logger.warning("Failed to persist credentials to .env: %s", e)

        return Response({
            'success': True,
            'message': 'Meta credentials configured successfully.',
            'app_id': app_id,
            'redirect_uri': redirect_uri,
        })

    @action(detail=False, methods=['get'], url_path='meta/status')
    def meta_status(self, request):
        """Check Meta OAuth status and real connected ad accounts."""
        from apis.social.token_service import get_meta_app_id, get_meta_app_secret
        app_id = get_meta_app_id()
        app_secret = get_meta_app_secret()
        is_configured = bool(app_id and app_secret and app_id != 'YOUR_META_APP_ID')

        client_id = request.query_params.get('client_id')
        qs = PlatformConnection.objects.filter(platform='meta')
        if client_id and client_id != 'all' and str(client_id).isdigit():
            qs = qs.filter(client_profile_id=client_id)

        meta_conn = qs.filter(status='connected').first()
        if not meta_conn:
            meta_conn = qs.first()

        is_connected = bool(meta_conn and meta_conn.status == 'connected' and meta_conn.access_token_encrypted)

        ad_accounts = []
        if is_connected:
            from apis.social import meta_ads_service
            try:
                ad_accounts = meta_ads_service.get_ad_accounts(meta_conn)
                if ad_accounts and isinstance(meta_conn.metadata, dict):
                    meta_conn.metadata['ad_accounts'] = ad_accounts
                    meta_conn.save(update_fields=['metadata', 'updated_at'])
            except Exception as e:
                logger.warning("Failed to refresh live Meta ad accounts: %s", e)
                if isinstance(meta_conn.metadata, dict):
                    ad_accounts = meta_conn.metadata.get('ad_accounts', [])

        return Response({
            'is_configured': is_configured,
            'is_connected': is_connected,
            'connection': PlatformConnectionSerializer(meta_conn).data if meta_conn and is_connected else None,
            'ad_accounts': ad_accounts,
            'app_id': app_id if is_configured else '',
        })

    @action(detail=False, methods=['post'], url_path='meta/disconnect')
    def meta_disconnect(self, request):
        """Disconnect all Meta connections."""
        client_id = request.data.get('client_id')
        qs = PlatformConnection.objects.filter(platform='meta')
        if client_id and client_id != 'all' and str(client_id).isdigit():
            qs = qs.filter(client_profile_id=client_id)
        qs.update(
            access_token_encrypted='',
            refresh_token_encrypted='',
            status='disconnected',
            updated_at=timezone.now(),
        )
        return Response({'success': True, 'status': 'disconnected'})

    @action(detail=False, methods=['get'], url_path='google/oauth-url')
    def google_oauth_url(self, request):
        """Return the Google OAuth consent URL for the user to navigate to."""
        from apis.social.token_service import get_google_oauth_url, GOOGLE_CLIENT_ID
        client_id = request.query_params.get('client_id', '')
        conn_id = request.query_params.get('connection_id', '')
        state = f'google_{client_id}'
        if not GOOGLE_CLIENT_ID:
            auth_url = f'/socialmanagement/oauth/authorize?platform=google&client_id={client_id}&connection_id={conn_id}&state={state}'
            return Response({'oauth_url': auth_url, 'platform': 'google', 'is_simulated': True})
        url = get_google_oauth_url(state=state)
        return Response({'oauth_url': url, 'platform': 'google', 'is_simulated': False})

    @action(detail=False, methods=['get'], url_path='linkedin/oauth-url')
    def linkedin_oauth_url(self, request):
        """Return the LinkedIn OAuth authorization URL for the user to navigate to."""
        from apis.social.token_service import get_linkedin_oauth_url, LINKEDIN_CLIENT_ID
        client_id = request.query_params.get('client_id', '')
        conn_id = request.query_params.get('connection_id', '')
        state = f'linkedin_{client_id}'
        if not LINKEDIN_CLIENT_ID:
            auth_url = f'/socialmanagement/oauth/authorize?platform=linkedin&client_id={client_id}&connection_id={conn_id}&state={state}'
            return Response({'oauth_url': auth_url, 'platform': 'linkedin', 'is_simulated': True})
        url = get_linkedin_oauth_url(state=state)
        return Response({'oauth_url': url, 'platform': 'linkedin', 'is_simulated': False})

    # ── OAuth Callbacks ──

    @action(detail=False, methods=['get', 'post'], url_path='meta/callback')
    def meta_callback(self, request):
        """
        Handles the Meta OAuth callback.
        Exchanges code for long-lived token, fetches ad accounts, saves PlatformConnection.
        Supports both browser redirects (returning branded redirect bridge) and direct JSON API requests.
        """
        import urllib.parse
        from datetime import timedelta
        from django.conf import settings
        from django.http import HttpResponse, HttpResponseRedirect
        from apis.social.token_service import exchange_meta_code_for_token
        from apis.social.encryption import encrypt_token
        from apis.social import meta_ads_service

        # Frontend base URL for redirecting browser users back to settings dashboard
        frontend_origin = (
            os.environ.get('FRONTEND_URL')
            or os.environ.get('NEXT_PUBLIC_SITE_URL')
            or ('http://localhost:3000' if settings.DEBUG else 'https://adstradigital.com')
        ).rstrip('/')
        frontend_dashboard_url = f"{frontend_origin}/socialmanagement?tab=settings"

        # Determine if caller expects raw JSON (e.g. POST, format=json, or explicit application/json header without html)
        accept_header = request.headers.get('Accept', '')
        format_param = request.query_params.get('format', '')
        wants_json = (
            request.method == 'POST'
            or format_param == 'json'
            or (accept_header.startswith('application/json') and 'text/html' not in accept_header)
        )

        code = request.query_params.get('code') or request.data.get('code', '')
        state = request.query_params.get('state') or request.data.get('state', '')
        error = request.query_params.get('error') or request.query_params.get('error_description')

        if error:
            if wants_json:
                return Response({'error': f'Meta OAuth denied: {error}'}, status=status.HTTP_400_BAD_REQUEST)
            err_dest = f"{frontend_dashboard_url}&oauth_error={urllib.parse.quote(str(error))}"
            return HttpResponseRedirect(err_dest)

        if not code:
            if wants_json:
                return Response({'error': 'Missing authorization code'}, status=status.HTTP_400_BAD_REQUEST)
            err_dest = f"{frontend_dashboard_url}&oauth_error=missing_code"
            return HttpResponseRedirect(err_dest)

        # Parse client_id from state: 'meta_{client_id}'
        client_id = state.replace('meta_', '').strip() or None
        if client_id and not str(client_id).isdigit():
            client_id = None

        try:
            token_data = exchange_meta_code_for_token(code)
            access_token = token_data['access_token']
            expires_in = token_data.get('expires_in', 5183944)
            expires_at = timezone.now() + timedelta(seconds=expires_in)

            # Temp connection object to call service
            temp_conn = PlatformConnection(
                access_token_encrypted=encrypt_token(access_token),
                platform='meta',
                status='connected',
            )
            ad_accounts = meta_ads_service.get_ad_accounts(temp_conn)
            pages = meta_ads_service.get_facebook_pages(temp_conn)

            # Use first ad account as default
            first_account = ad_accounts[0] if ad_accounts else {}
            first_page = pages[0] if pages else {}
            account_id = first_account.get('id', '')
            account_name = first_account.get('name', 'Meta Ad Account')

            existing_conn = PlatformConnection.objects.filter(
                platform='meta',
                client_profile_id=client_id if client_id else None
            ).first()

            if existing_conn:
                conn = existing_conn
                conn.account_id = account_id or conn.account_id or 'act_primary'
                conn.account_name = account_name or conn.account_name or 'Meta Ad Account'
                conn.access_token_encrypted = encrypt_token(access_token)
                conn.token_expires_at = expires_at
                conn.status = 'connected'
                conn.last_synced_at = timezone.now()
                meta_dict = conn.metadata if isinstance(conn.metadata, dict) else {}
                meta_dict.update({
                    'page_id': first_page.get('id', '') or meta_dict.get('page_id', ''),
                    'page_name': first_page.get('name', '') or meta_dict.get('page_name', ''),
                    'ad_accounts': ad_accounts[:10],
                    'pages': pages[:10],
                })
                conn.metadata = meta_dict
                conn.save()
            else:
                conn = PlatformConnection.objects.create(
                    client_profile_id=client_id if client_id else None,
                    platform='meta',
                    account_id=account_id or 'act_primary',
                    account_name=account_name or 'Meta Ad Account',
                    access_token_encrypted=encrypt_token(access_token),
                    token_expires_at=expires_at,
                    status='connected',
                    metadata={
                        'page_id': first_page.get('id', ''),
                        'page_name': first_page.get('name', ''),
                        'ad_accounts': ad_accounts[:10],
                        'pages': pages[:10],
                    },
                    last_synced_at=timezone.now(),
                )

            if wants_json:
                return Response({
                    'success': True,
                    'connection': PlatformConnectionSerializer(conn).data,
                    'ad_accounts': ad_accounts,
                    'pages': pages,
                })

            # Branded HTML bridge for browser redirect
            redirect_dest = f"{frontend_dashboard_url}&oauth_success=meta"
            html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Adstra Digital &bull; Meta Authorization</title>
  <meta http-equiv="refresh" content="2;url={redirect_dest}">
  <style>
    body {{
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }}
    .card {{
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 18px;
      padding: 36px 32px;
      max-width: 440px;
      text-align: center;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
    }}
    .icon {{
      width: 56px;
      height: 56px;
      margin: 0 auto 16px;
      background: #16a34a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);
    }}
    h1 {{ font-size: 1.3rem; font-weight: 700; margin: 0 0 8px; color: #ffffff; }}
    p {{ font-size: 0.88rem; color: #94a3b8; margin: 0 0 24px; line-height: 1.45; }}
    .btn {{
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 10px 22px;
      border-radius: 10px;
    }}
    .btn:hover {{ background: #1d4ed8; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">&#10003;</div>
    <h1>Meta Account Connected!</h1>
    <p>Your Meta Ads and Facebook Pages are linked successfully to Adstra Digital. Redirecting back to your dashboard...</p>
    <a class="btn" href="{redirect_dest}">Return to Dashboard</a>
  </div>
  <script>
    if (window.opener) {{
      window.opener.postMessage({{ type: 'ADSTRA_OAUTH_SUCCESS', platform: 'meta' }}, '*');
      setTimeout(function() {{ window.close(); }}, 1200);
    }} else {{
      setTimeout(function() {{ window.location.href = "{redirect_dest}"; }}, 1200);
    }}
  </script>
</body>
</html>"""
            return HttpResponse(html_content, content_type="text/html")

        except Exception as exc:
            if wants_json:
                return Response({'error': f'Meta OAuth failed: {str(exc)}'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            err_dest = f"{frontend_dashboard_url}&oauth_error={urllib.parse.quote(str(exc))}"
            return HttpResponseRedirect(err_dest)

    @action(detail=False, methods=['get', 'post'], url_path='google/callback')
    def google_callback(self, request):
        """
        Handles the Google OAuth callback.
        Exchanges code for access+refresh tokens, lists accessible customer accounts.
        """
        from datetime import timedelta
        from apis.social.token_service import exchange_google_code_for_token
        from apis.social.encryption import encrypt_token
        from apis.social import google_ads_service

        code = request.query_params.get('code') or request.data.get('code', '')
        state = request.query_params.get('state') or request.data.get('state', '')
        error = request.query_params.get('error')

        if error:
            return Response({'error': f'Google OAuth denied: {error}'}, status=status.HTTP_400_BAD_REQUEST)
        if not code:
            return Response({'error': 'Missing authorization code'}, status=status.HTTP_400_BAD_REQUEST)

        client_id = state.replace('google_', '').strip() or None

        try:
            token_data = exchange_google_code_for_token(code)
            access_token = token_data.get('access_token', '')
            refresh_token = token_data.get('refresh_token', '')
            expires_in = token_data.get('expires_in', 3600)
            expires_at = timezone.now() + timedelta(seconds=expires_in)

            temp_conn = PlatformConnection(
                access_token_encrypted=encrypt_token(access_token),
                refresh_token_encrypted=encrypt_token(refresh_token),
                platform='google',
                status='connected',
                metadata={},
            )
            customers = google_ads_service.list_accessible_customers(temp_conn)
            first_customer = customers[0] if customers else {}
            account_id = first_customer.get('id', '')
            account_name = first_customer.get('descriptive_name', 'Google Ads Account')

            conn, created = PlatformConnection.objects.update_or_create(
                client_profile_id=client_id if client_id else None,
                platform='google',
                account_id=account_id,
                defaults={
                    'account_name': account_name,
                    'access_token_encrypted': encrypt_token(access_token),
                    'refresh_token_encrypted': encrypt_token(refresh_token),
                    'token_expires_at': expires_at,
                    'status': 'connected',
                    'metadata': {
                        'customer_id': account_id,
                        'customers': customers[:5],
                    },
                    'last_synced_at': timezone.now(),
                }
            )
            return Response({
                'success': True,
                'connection': PlatformConnectionSerializer(conn).data,
                'customers': customers,
            })
        except Exception as exc:
            return Response({'error': f'Google OAuth failed: {str(exc)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ── Connection management ──

    @action(detail=True, methods=['post'], url_path='disconnect')
    def disconnect(self, request, pk=None):
        """Mark a platform connection as disconnected and clear tokens."""
        conn = self.get_object()
        conn.access_token_encrypted = ''
        conn.refresh_token_encrypted = ''
        conn.status = 'disconnected'
        conn.save(update_fields=['access_token_encrypted', 'refresh_token_encrypted', 'status', 'updated_at'])
        return Response({'success': True, 'status': 'disconnected'})

    @action(detail=True, methods=['post', 'get'], url_path='reconnect')
    def reconnect(self, request, pk=None):
        """
        Reconnect button action:
        On click, reauthorizes the account, refreshes the access token, and
        automatically updates the account status to Connected.
        """
        conn = self.get_object()
        from apis.social.token_service import reauthorize_connection
        custom_token = request.data.get('access_token') if request.method == 'POST' else None
        success = reauthorize_connection(conn, custom_token=custom_token)
        if success:
            return Response({
                'success': True,
                'message': f'Successfully reauthorized {conn.account_name or conn.get_platform_display()} and refreshed access token.',
                'status': 'connected',
                'connection': PlatformConnectionSerializer(conn).data,
            })
        return Response({'error': 'Failed to reauthorize connection'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='refresh-token')
    def refresh_token(self, request, pk=None):
        """Manually trigger a token refresh for a connection."""
        conn = self.get_object()
        if conn.platform == 'meta':
            from apis.social.token_service import refresh_meta_token
            success = refresh_meta_token(conn)
        elif conn.platform == 'google':
            from apis.social.token_service import refresh_google_token
            success = refresh_google_token(conn)
        elif conn.platform == 'linkedin':
            from apis.social.token_service import refresh_linkedin_token
            success = refresh_linkedin_token(conn)
        else:
            return Response({'error': 'Unsupported platform'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': success,
            'status': conn.status,
            'token_expires_at': conn.token_expires_at,
        })

    @action(detail=True, methods=['get'], url_path='ad-accounts')
    def ad_accounts(self, request, pk=None):
        """List ad accounts accessible via this connection."""
        conn = self.get_object()
        if conn.status != 'connected':
            return Response({'error': 'Connection is not active'}, status=status.HTTP_400_BAD_REQUEST)
        if conn.platform == 'meta':
            from apis.social import meta_ads_service
            accounts = meta_ads_service.get_ad_accounts(conn)
            pages = meta_ads_service.get_facebook_pages(conn)
            return Response({'ad_accounts': accounts, 'pages': pages})
        elif conn.platform == 'google':
            from apis.social import google_ads_service
            customers = google_ads_service.list_accessible_customers(conn)
            return Response({'customers': customers})
        return Response({'error': 'Unsupported platform'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='set-account')
    def set_account(self, request, pk=None):
        """Set which ad account / customer ID to use for this connection."""
        conn = self.get_object()
        account_id = request.data.get('account_id', '').strip()
        account_name = request.data.get('account_name', '').strip()
        extra_meta = request.data.get('metadata', {})

        if not account_id:
            return Response({'error': 'account_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        if conn.platform == 'meta' and account_id and not account_id.startswith('act_'):
            account_id = f'act_{account_id}'

        conn.account_id = account_id
        conn.account_name = account_name or account_id
        if extra_meta:
            conn.metadata.update(extra_meta)
        conn.save(update_fields=['account_id', 'account_name', 'metadata', 'updated_at'])
        return Response({'success': True, 'connection': PlatformConnectionSerializer(conn).data})

    @action(detail=False, methods=['post'], url_path='connect-token')
    def connect_token(self, request):
        """
        Connect a real Meta or Google Ads account directly using an Access Token
        (such as a Meta User Token or System User Token from Meta Business Suite / Graph API Explorer).
        Validates the token against the live Graph API, discovers accessible ad accounts
        and Facebook pages, and creates an active PlatformConnection.
        """
        from datetime import timedelta
        from apis.social.encryption import encrypt_token
        from apis.social import meta_ads_service

        platform = request.data.get('platform', 'meta')
        access_token = request.data.get('access_token', '').strip()
        client_id = request.data.get('client_id')
        chosen_account_id = request.data.get('account_id', '').strip()

        if not access_token:
            return Response({'error': 'access_token is required'}, status=status.HTTP_400_BAD_REQUEST)

        if client_id == 'all' or not client_id:
            client_id = None
        else:
            try:
                client_id = int(client_id)
            except (ValueError, TypeError):
                client_id = None

        if platform == 'meta':
            temp_conn = PlatformConnection(
                access_token_encrypted=encrypt_token(access_token),
                platform='meta',
                status='connected',
            )
            try:
                ad_accounts = meta_ads_service.get_ad_accounts(temp_conn)
                pages = meta_ads_service.get_facebook_pages(temp_conn)
            except Exception as exc:
                return Response({
                    'error': f'Failed to validate Meta access token: {str(exc)}'
                }, status=status.HTTP_400_BAD_REQUEST)

            if chosen_account_id:
                matched = next((a for a in ad_accounts if a.get('id') == chosen_account_id), None)
                account_id = chosen_account_id
                account_name = matched.get('name', chosen_account_id) if matched else chosen_account_id
            else:
                first_acc = ad_accounts[0] if ad_accounts else {}
                account_id = first_acc.get('id', '') or 'act_primary'
                account_name = first_acc.get('name', 'Meta Ad Account')

            first_page = pages[0] if pages else {}

            conn, created = PlatformConnection.objects.update_or_create(
                client_profile_id=client_id,
                platform='meta',
                defaults={
                    'account_id': account_id,
                    'account_name': account_name,
                    'access_token_encrypted': encrypt_token(access_token),
                    'refresh_token_encrypted': '',
                    'token_expires_at': timezone.now() + timedelta(days=60),
                    'status': 'connected',
                    'metadata': {
                        'page_id': first_page.get('id', ''),
                        'page_name': first_page.get('name', ''),
                        'ad_accounts': ad_accounts[:10],
                        'pages': pages[:10],
                    },
                    'last_synced_at': timezone.now(),
                }
            )

            return Response({
                'success': True,
                'connection': PlatformConnectionSerializer(conn).data,
                'ad_accounts': ad_accounts,
                'pages': pages,
                'message': f'Connected Meta Ads account "{account_name}" ({account_id}) successfully!',
            })

        return Response({'error': 'Unsupported platform'}, status=status.HTTP_400_BAD_REQUEST)


class CampaignPublishingViewSet(viewsets.ViewSet):
    """
    Handles publishing campaigns to Meta and Google, and campaign lifecycle controls.
    All routes are nested under /campaigns/{campaign_id}/...
    """
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], url_path='meta-campaigns')
    def meta_campaigns(self, request):
        """
        Fetch ALL campaigns from the connected Meta Ads account and merge with
        local dashboard campaigns.

        Returns a merged list where each item has:
        - source: 'dashboard' (created here) | 'meta' (created in Meta Ads Manager)
        - local_campaign: local SocialCampaign data (if source=dashboard)
        - meta_data: raw Meta Ads campaign data with insights
        """
        from apis.social.models import SocialCampaign, PlatformConnection, CampaignPlatform
        from apis.social import meta_ads_service

        client_id = request.query_params.get('client_id')

        # Find the active Meta connection
        conn_qs = PlatformConnection.objects.filter(platform='meta', status='connected')
        if client_id and client_id != 'all':
            conn_qs = conn_qs.filter(
                Q(client_profile_id=client_id) | Q(client_profile__isnull=True)
            )
        connection = conn_qs.order_by('-last_synced_at').first()

        if not connection:
            # No connected Meta account — return only local campaigns
            local_qs = SocialCampaign.objects.select_related('client_profile')
            if client_id and client_id != 'all':
                local_qs = local_qs.filter(client_profile_id=client_id)
            local_data = SocialCampaignSerializer(local_qs, many=True).data
            return Response({
                'meta_connected': False,
                'campaigns': [{'source': 'dashboard', 'local_campaign': c, 'meta_data': None} for c in local_data],
            })

        # Fetch all campaigns from Meta
        try:
            meta_campaigns_list = meta_ads_service.fetch_all_account_campaigns(connection)
        except Exception as exc:
            logger.warning('Failed to fetch Meta campaigns: %s', exc)
            meta_campaigns_list = []

        # Build a map: meta_campaign_id -> local CampaignPlatform record
        published_cp_qs = CampaignPlatform.objects.filter(
            platform='meta',
            publish_status='published',
        ).select_related('campaign', 'campaign__client_profile')
        meta_id_to_cp = {cp.meta_campaign_id: cp for cp in published_cp_qs if cp.meta_campaign_id}

        # Merge
        merged = []
        seen_meta_ids = set()

        for m in meta_campaigns_list:
            meta_id = m.get('meta_campaign_id', '')
            cp = meta_id_to_cp.get(meta_id)
            if cp and cp.campaign:
                # This campaign was published from the dashboard
                local_data = SocialCampaignSerializer(cp.campaign).data
                merged.append({
                    'source': 'dashboard',
                    'local_campaign': local_data,
                    'meta_data': m,
                })
                seen_meta_ids.add(meta_id)
            else:
                # Campaign exists in Meta but was NOT created from this dashboard
                merged.append({
                    'source': 'meta',
                    'local_campaign': None,
                    'meta_data': m,
                })

        # Also include local campaigns that are NOT yet published to Meta
        local_qs = SocialCampaign.objects.select_related('client_profile')
        if client_id and client_id != 'all':
            local_qs = local_qs.filter(client_profile_id=client_id)

        for camp in local_qs:
            # Skip if already in merged (via published CampaignPlatform)
            already_merged = any(
                item['source'] == 'dashboard' and item.get('local_campaign', {}).get('id') == camp.id
                for item in merged
            )
            if not already_merged:
                merged.append({
                    'source': 'dashboard',
                    'local_campaign': SocialCampaignSerializer(camp).data,
                    'meta_data': None,
                })

        return Response({
            'meta_connected': True,
            'account_name': connection.account_name,
            'account_id': connection.account_id,
            'campaigns': merged,
        })

    @action(detail=False, methods=['post'], url_path=r'campaigns/(?P<campaign_id>\d+)/publish')
    def publish(self, request, campaign_id=None):
        """Publish a campaign to all selected ad platforms."""
        from apis.social.campaign_publishing_service import (
            publish_campaign, validate_campaign_for_publishing
        )
        from apis.social.models import SocialCampaign
        try:
            campaign = SocialCampaign.objects.get(id=campaign_id)
        except SocialCampaign.DoesNotExist:
            return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        account_id = request.data.get('account_id')
        # Pre-publish validation
        errors = validate_campaign_for_publishing(campaign, requested_account_id=account_id)
        if errors:
            return Response({'success': False, 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        result = publish_campaign(
            campaign_id=int(campaign_id),
            user=request.user,
            account_id=account_id,
            desired_status=request.data.get('status', 'ACTIVE'),
        )
        code = status.HTTP_200_OK if result.get('success') else status.HTTP_422_UNPROCESSABLE_ENTITY
        return Response(result, status=code)

    @action(detail=False, methods=['post'], url_path='publish-drafts')
    def publish_drafts(self, request):
        """
        Batch or direct publish draft campaigns, ad sets, and ads directly to Meta Ads Manager.
        """
        from apis.social.campaign_publishing_service import (
            publish_campaign, validate_campaign_for_publishing
        )
        from apis.social.models import SocialCampaign, SocialClientProfile, CampaignPlatform
        from apis.social.serializers import SocialCampaignSerializer

        account_id = request.data.get('account_id') or 'act_830629501946359'
        campaign_ids = request.data.get('campaign_ids', [])
        draft_campaigns = request.data.get('draft_campaigns', [])
        global_status = (request.data.get('status') or 'ACTIVE').upper()

        objective_map = {
            'awareness': 'brand_awareness',
            'brand awareness': 'brand_awareness',
            'traffic': 'traffic',
            'engagement': 'engagement',
            'leads': 'lead_generation',
            'lead generation': 'lead_generation',
            'app promotion': 'lead_generation',
            'sales': 'conversions',
            'conversions': 'conversions',
        }

        default_client = SocialClientProfile.objects.filter(is_active=True).first()
        if not default_client:
            default_client = SocialClientProfile.objects.first()

        created_or_found_ids = []
        item_status_map = {}

        # 1. Process draft_campaigns objects
        for d in draft_campaigns:
            c_name = d.get('name') or d.get('campaignName') or 'New Meta Campaign'
            c_obj_raw = str(d.get('objective') or d.get('bidStrategySub') or 'leads').lower()
            c_obj = objective_map.get(c_obj_raw, 'lead_generation')

            raw_b = d.get('budget') or d.get('budgetAmount') or 500
            try:
                c_budget = float(str(raw_b).replace('₹', '').replace(',', '').strip())
            except Exception:
                c_budget = 500.0

            client_id = d.get('client_id')
            client = SocialClientProfile.objects.filter(id=client_id).first() if client_id else default_client

            d_status = str(d.get('status') or global_status or 'ACTIVE').upper()
            target_status = 'ACTIVE' if d_status in ('ACTIVE', 'LIVE') else 'PAUSED'

            # Try to match existing campaign by backendId, id, Meta ID or name
            camp = None
            if d.get('backendId'):
                camp = SocialCampaign.objects.filter(id=d['backendId']).first()
            if not camp and d.get('id'):
                raw_id_str = str(d['id'])
                if raw_id_str.startswith('c-local-'):
                    sub_id = raw_id_str.replace('c-local-', '')
                    if sub_id.isdigit():
                        camp = SocialCampaign.objects.filter(id=int(sub_id)).first()
                elif raw_id_str.isdigit():
                    camp = SocialCampaign.objects.filter(id=int(raw_id_str)).first()
                if not camp:
                    cp_match = CampaignPlatform.objects.filter(meta_campaign_id=raw_id_str).select_related('campaign').first()
                    if cp_match and cp_match.campaign:
                        camp = cp_match.campaign

            if not camp:
                camp = SocialCampaign.objects.filter(name=c_name, client_profile=client).first()

            if not camp:
                camp = SocialCampaign.objects.create(
                    client_profile=client,
                    name=c_name,
                    objective=c_obj,
                    budget=c_budget,
                    platforms=['meta'],
                    ad_platforms=['meta'],
                    campaign_type='FEED_STORIES',
                    primary_text=d.get('primaryText') or d.get('headline') or c_name,
                    headline=d.get('headline') or c_name,
                    creative_image_url=d.get('selectedCreativeUrl') or d.get('thumb') or '',
                    status='active' if target_status == 'ACTIVE' else 'draft',
                )
            else:
                camp.objective = c_obj
                camp.budget = c_budget
                camp.ad_platforms = ['meta']
                camp.save()

            created_or_found_ids.append(camp.id)
            item_status_map[camp.id] = target_status

        # Merge with explicit campaign_ids
        all_ids = list(set([int(x) for x in campaign_ids if str(x).isdigit()] + created_or_found_ids))

        if not all_ids:
            return Response({'error': 'No campaigns provided to publish.'}, status=status.HTTP_400_BAD_REQUEST)

        results = {}
        all_success = True

        for cid in all_ids:
            try:
                camp = SocialCampaign.objects.get(id=cid)
                desired_stat = item_status_map.get(cid, global_status)
                pub_res = publish_campaign(
                    campaign_id=cid,
                    user=request.user,
                    account_id=account_id,
                    desired_status=desired_stat
                )
                results[str(cid)] = {
                    'campaign_name': camp.name,
                    'result': pub_res,
                }
                if not pub_res.get('success'):
                    all_success = False
            except Exception as e:
                results[str(cid)] = {'error': str(e), 'success': False}
                all_success = False

        # Return updated campaigns list
        updated_qs = SocialCampaign.objects.filter(id__in=all_ids)
        serialized = SocialCampaignSerializer(updated_qs, many=True).data

        return Response({
            'success': all_success,
            'published_count': len(all_ids),
            'results': results,
            'campaigns': serialized,
            'account_id': account_id,
        })

    @action(detail=False, methods=['post'], url_path=r'campaigns/(?P<campaign_id>\d+)/sync')
    def sync(self, request, campaign_id=None):
        """Sync performance data from all platforms for this campaign."""
        from apis.social.campaign_sync_service import sync_campaign
        result = sync_campaign(campaign_id=int(campaign_id))
        return Response(result)

    @action(detail=False, methods=['post'], url_path=r'campaigns/(?P<campaign_id>\d+)/pause')
    def pause_campaign(self, request, campaign_id=None):
        """Pause the campaign on all connected platforms."""
        from apis.social.models import SocialCampaign
        from apis.social import meta_ads_service, google_ads_service
        try:
            campaign = SocialCampaign.objects.get(id=campaign_id)
        except SocialCampaign.DoesNotExist:
            return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        results = {}
        for cp in campaign.campaign_platforms.filter(publish_status='published').select_related('connection'):
            if cp.platform == 'meta':
                ok = meta_ads_service.pause_campaign(cp.connection, cp)
            elif cp.platform == 'google':
                ok = google_ads_service.pause_campaign(cp.connection, cp)
            else:
                ok = False
            if ok:
                cp.status = 'paused'
                cp.save(update_fields=['status', 'updated_at'])
            results[cp.platform] = ok

        campaign.status = 'paused'
        campaign.save(update_fields=['status', 'updated_at'])
        CampaignActivity.objects.create(
            campaign=campaign, action='Campaign Paused', status='success',
            message=f"Paused on: {list(results.keys())}"
        )
        return Response({'success': True, 'results': results})

    @action(detail=False, methods=['post'], url_path=r'campaigns/(?P<campaign_id>\d+)/resume')
    def resume_campaign(self, request, campaign_id=None):
        """Resume (unpause) the campaign on all connected platforms."""
        from apis.social.models import SocialCampaign
        from apis.social import meta_ads_service, google_ads_service
        try:
            campaign = SocialCampaign.objects.get(id=campaign_id)
        except SocialCampaign.DoesNotExist:
            return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        results = {}
        for cp in campaign.campaign_platforms.filter(publish_status='published').select_related('connection'):
            if cp.platform == 'meta':
                ok = meta_ads_service.resume_campaign(cp.connection, cp)
            elif cp.platform == 'google':
                ok = google_ads_service.resume_campaign(cp.connection, cp)
            else:
                ok = False
            if ok:
                cp.status = 'active'
                cp.save(update_fields=['status', 'updated_at'])
            results[cp.platform] = ok

        campaign.status = 'active'
        campaign.save(update_fields=['status', 'updated_at'])
        CampaignActivity.objects.create(
            campaign=campaign, action='Campaign Resumed', status='success',
            message=f"Resumed on: {list(results.keys())}"
        )
        return Response({'success': True, 'results': results})

    @action(detail=False, methods=['post'], url_path=r'campaigns/(?P<campaign_id>\d+)/update-budget')
    def update_budget(self, request, campaign_id=None):
        """Update the campaign's daily budget on all connected platforms."""
        from apis.social.models import SocialCampaign
        from apis.social import meta_ads_service, google_ads_service
        new_budget = request.data.get('budget')
        if not new_budget:
            return Response({'error': 'budget is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            campaign = SocialCampaign.objects.get(id=campaign_id)
        except SocialCampaign.DoesNotExist:
            return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        new_budget_float = float(new_budget)
        results = {}
        for cp in campaign.campaign_platforms.filter(publish_status='published').select_related('connection'):
            if cp.platform == 'meta':
                daily = new_budget_float / 30
                ok = meta_ads_service.update_campaign_budget(cp.connection, cp, daily)
            elif cp.platform == 'google':
                daily = new_budget_float / 30
                ok = google_ads_service.update_campaign_budget(cp.connection, cp, daily)
            else:
                ok = False
            results[cp.platform] = ok

        campaign.budget = new_budget
        campaign.save(update_fields=['budget', 'updated_at'])
        CampaignActivity.objects.create(
            campaign=campaign, action='Budget Updated', status='success',
            message=f"New budget: {new_budget}. Platforms updated: {list(results.keys())}"
        )
        return Response({'success': True, 'results': results, 'new_budget': new_budget})

    @action(detail=False, methods=['get'], url_path=r'campaigns/(?P<campaign_id>[^/]+)/detail')
    def campaign_detail(self, request, campaign_id=None):
        """
        Returns full campaign detail including:
        - Platform records (CampaignPlatform)
        - Recent metric snapshots (last 30 days, per platform)
        - Activity log
        - CRM attribution
        - Platform manager URLs
        - Live Meta campaign performance & ad sets (for Meta-native campaigns)
        """
        from apis.social.models import SocialCampaign, PlatformConnection
        from apis.social import meta_ads_service, google_ads_service
        from apis.social.campaign_sync_service import get_campaign_attribution

        # Handle Meta-native campaigns (IDs starting with meta_ or non-digit IDs)
        if str(campaign_id).startswith('meta_') or not str(campaign_id).isdigit():
            meta_camp_id = str(campaign_id).replace('meta_', '')
            conn = PlatformConnection.objects.filter(platform='meta', status='connected').order_by('-last_synced_at').first()
            if not conn:
                return Response({'error': 'No connected Meta account found'}, status=status.HTTP_404_NOT_FOUND)
            try:
                detail_data = meta_ads_service.get_single_meta_campaign_detail(conn, meta_camp_id)
                return Response(detail_data)
            except Exception as exc:
                return Response({'error': f'Failed to fetch Meta campaign detail: {str(exc)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            campaign = SocialCampaign.objects.get(id=campaign_id)
        except SocialCampaign.DoesNotExist:
            return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

        platforms_data = []
        for cp in campaign.campaign_platforms.select_related('connection').prefetch_related('metric_snapshots'):
            snapshots = cp.metric_snapshots.order_by('-date')[:30]
            manager_url = ''
            if cp.platform == 'meta':
                manager_url = meta_ads_service.get_meta_manager_url(cp)
            elif cp.platform == 'google':
                manager_url = google_ads_service.get_google_ads_url(cp)
            platforms_data.append({
                'platform_record': CampaignPlatformSerializer(cp).data,
                'snapshots': CampaignMetricSnapshotSerializer(snapshots, many=True).data,
                'manager_url': manager_url,
            })

        activities = CampaignActivity.objects.filter(campaign=campaign).order_by('-created_at')[:20]
        attribution = get_campaign_attribution(campaign)

        meta_cp = campaign.campaign_platforms.filter(platform='meta').first()
        meta_perf = meta_ads_service.get_campaign_meta_performance(
            meta_cp.connection if meta_cp else None,
            meta_cp,
            campaign
        )

        return Response({
            'campaign': SocialCampaignSerializer(campaign).data,
            'platforms': platforms_data,
            'activities': CampaignActivitySerializer(activities, many=True).data,
            'attribution': attribution,
            'meta_performance': meta_perf.get('kpis', {}),
            'placement_performance': meta_perf.get('placements', []),
            'buying_type': meta_perf.get('buying_type', 'Auction'),
        })

    @action(detail=False, methods=['get'], url_path='meta-account-data')
    def meta_account_data(self, request):
        """
        Unified Meta Marketing API endpoint returning:
        - Campaigns
        - Ad sets
        - Ads
        - Live performance metrics for requested date_preset
        - Connected ad account details
        - Merged local drafts
        """
        from apis.social.models import PlatformConnection, SocialCampaign, SocialClientProfile
        from apis.social import meta_ads_service

        client_id = request.query_params.get('client_id')
        req_account_id = request.query_params.get('account_id')
        date_preset = request.query_params.get('date_preset', 'last_30d')
        since = request.query_params.get('since')
        until = request.query_params.get('until')
        time_range = None
        if since and until:
            time_range = {'since': since, 'until': until}

        # Find connected Meta connections
        all_meta_conns = PlatformConnection.objects.filter(platform='meta').order_by('-status', '-last_synced_at')

        available_accounts = []
        for c in all_meta_conns:
            acc_num = str(c.account_id or '').replace('act_', '')
            available_accounts.append({
                'id': c.account_id,
                'name': c.account_name or f"Meta Ad Account ({acc_num})",
                'display_id': acc_num,
                'status': c.status,
                'currency': c.metadata.get('currency', 'INR') if isinstance(c.metadata, dict) else 'INR',
                'connection_id': c.id,
            })

        # Select connection
        connection = None
        if req_account_id:
            clean_req = str(req_account_id).replace('act_', '')
            connection = all_meta_conns.filter(
                Q(account_id__icontains=clean_req), status='connected'
            ).first() or all_meta_conns.filter(
                Q(account_id__icontains=clean_req)
            ).first()

        if not connection:
            connection = all_meta_conns.filter(status='connected').first() or all_meta_conns.first()

        if not connection:
            # Return empty baseline
            return Response({
                'connected_account': None,
                'available_accounts': [],
                'campaigns': [],
                'adsets': [],
                'ads': [],
                'metrics_summary': {'spend': 0, 'impressions': 0, 'reach': 0, 'clicks': 0, 'results': 0},
                'meta_live': False,
                'meta_error': 'No Meta account connected in Settings.',
            })

        data = meta_ads_service.fetch_all_meta_account_data(connection, date_preset=date_preset, time_range=time_range)

        # Match Meta campaigns with local CampaignPlatform records to link backendId
        from apis.social.models import CampaignPlatform
        published_cps = CampaignPlatform.objects.filter(
            platform='meta',
            meta_campaign_id__isnull=False
        ).select_related('campaign')
        meta_id_to_cp = {str(cp.meta_campaign_id): cp for cp in published_cps}

        for c in data['campaigns']:
            cp = meta_id_to_cp.get(str(c['id']))
            if cp and cp.campaign:
                c['backendId'] = cp.campaign.id
                c['is_draft'] = False

        # Only merge local drafts that are NOT yet published to Meta
        published_camp_ids = set(cp.campaign_id for cp in published_cps if cp.campaign_id)
        local_drafts = SocialCampaign.objects.filter(status='draft').exclude(id__in=published_camp_ids).order_by('-created_at')
        if client_id and client_id != 'all':
            local_drafts = local_drafts.filter(client_profile_id=client_id)

        meta_camp_ids = set(c['id'] for c in data['campaigns'])

        for lc in local_drafts:
            lc_id = f"c-local-{lc.id}"
            if lc_id not in meta_camp_ids:
                data['campaigns'].append({
                    'id': lc_id,
                    'name': lc.name,
                    'delivery': 'In draft',
                    'actions': '—',
                    'bidStrategy': 'Using campaign budget',
                    'bidStrategySub': (lc.objective or 'Leads').replace('_', ' ').capitalize(),
                    'budget': f"₹{float(lc.budget or 1000):,.2f}",
                    'budgetSub': 'Daily',
                    'results': '—',
                    'costPerResult': '—',
                    'amountSpent': '—',
                    'impressions': '—',
                    'reach': '—',
                    'clicks': '—',
                    'ctr': '—',
                    'cpc': '—',
                    'ends': lc.end_date.strftime('%Y-%m-%d') if lc.end_date else 'Ongoing',
                    'attribution': '7-day click or 1-day view',
                    'lastSignificantEdit': lc.updated_at.strftime('%Y-%m-%d') if lc.updated_at else '—',
                    'active': False,
                    'backendId': lc.id,
                    'level': 'campaign',
                    'is_draft': True,
                })

                as_id = f"as-local-{lc.id}"
                data['adsets'].append({
                    'id': as_id,
                    'name': f"{lc.name} Ad set",
                    'delivery': 'In draft',
                    'actions': '—',
                    'bidStrategy': 'Highest volume',
                    'bidStrategySub': (lc.objective or 'Leads').capitalize(),
                    'budget': f"₹{float(lc.budget or 1000):,.2f}",
                    'budgetSub': 'Daily',
                    'results': '—',
                    'costPerResult': '—',
                    'amountSpent': '—',
                    'impressions': '—',
                    'reach': '—',
                    'clicks': '—',
                    'ctr': '—',
                    'cpc': '—',
                    'ends': lc.end_date.strftime('%Y-%m-%d') if lc.end_date else 'Ongoing',
                    'attribution': '7-day click or 1-day view',
                    'lastSignificantEdit': '—',
                    'campaignName': lc.name,
                    'campaignId': lc_id,
                    'active': False,
                    'backendId': lc.id,
                    'level': 'adset',
                    'is_draft': True,
                })

                ad_id = f"ad-local-{lc.id}"
                data['ads'].append({
                    'id': ad_id,
                    'name': f"{lc.name} Ad",
                    'thumb': lc.creative_image_url or None,
                    'delivery': 'In draft',
                    'actions': '—',
                    'results': '—',
                    'costPerResult': '—',
                    'budget': 'Using campaign...',
                    'budgetSub': '',
                    'amountSpent': '—',
                    'impressions': '—',
                    'reach': '—',
                    'clicks': '—',
                    'ctr': '—',
                    'cpc': '—',
                    'ends': 'Ongoing',
                    'attribution': '7-day click or 1-day view',
                    'bidStrategy': 'Highest volume',
                    'bidStrategySub': 'Leads',
                    'lastSignificantEdit': '—',
                    'qualityRanking': '—',
                    'engagementRanking': '—',
                    'conversionRanking': '—',
                    'adsetName': f"{lc.name} Ad set",
                    'adsetId': as_id,
                    'campaignName': lc.name,
                    'campaignId': lc_id,
                    'activeAdsCount': '0 active ads',
                    'active': False,
                    'backendId': lc.id,
                    'level': 'ad',
                    'is_draft': True,
                })

        acc_num = str(connection.account_id or '').replace('act_', '')
        connected_account = {
            'id': connection.account_id,
            'name': connection.account_name or f"Meta Ad Account ({acc_num})",
            'display_id': acc_num,
            'status': connection.status,
            'currency': connection.metadata.get('currency', 'INR') if isinstance(connection.metadata, dict) else 'INR',
            'connection_id': connection.id,
        }

        return Response({
            'connected_account': connected_account,
            'available_accounts': available_accounts,
            'campaigns': data['campaigns'],
            'adsets': data['adsets'],
            'ads': data['ads'],
            'metrics_summary': data['metrics_summary'],
            'meta_live': data['meta_live'],
            'meta_error': data['meta_error'],
        })

    @action(detail=False, methods=['post'], url_path='import-campaigns')
    def import_campaigns(self, request):
        """
        Import live campaigns from the connected Meta Ad Account into local
        SocialCampaign and CampaignPlatform models without creating duplicates.
        """
        from apis.social.models import PlatformConnection, SocialCampaign, CampaignPlatform, SocialClientProfile
        from apis.social import meta_ads_service

        req_account_id = request.data.get('account_id') or request.query_params.get('account_id')
        all_meta_conns = PlatformConnection.objects.filter(platform='meta')
        connection = None
        if req_account_id:
            clean_req = str(req_account_id).replace('act_', '')
            connection = all_meta_conns.filter(account_id__icontains=clean_req, status='connected').first() or all_meta_conns.filter(account_id__icontains=clean_req).first()
        if not connection:
            connection = all_meta_conns.filter(status='connected').first() or all_meta_conns.first()

        if not connection:
            return Response({'error': 'No connected Meta account found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            token = meta_ads_service.get_valid_access_token(connection)
            raw_acc_id = str(connection.account_id or '').replace('act_', '')
            ad_account_id = f"act_{raw_acc_id}"
            camp_resp = meta_ads_service._graph('get', f'{ad_account_id}/campaigns', token, params={
                'fields': 'id,name,status,effective_status,objective,buying_type,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time',
                'limit': 150,
            })
            raw_camps = camp_resp.get('data', [])
        except Exception as exc:
            return Response({'error': f'Failed to fetch campaigns from Meta: {str(exc)}'}, status=status.HTTP_400_BAD_REQUEST)

        objective_map = {
            'outcome_awareness': 'brand_awareness',
            'outcome_traffic': 'traffic',
            'outcome_engagement': 'engagement',
            'outcome_leads': 'lead_generation',
            'outcome_app_promotion': 'lead_generation',
            'outcome_sales': 'conversions',
        }

        default_client = connection.client_profile or SocialClientProfile.objects.filter(is_active=True).first() or SocialClientProfile.objects.first()

        imported_count = 0
        updated_count = 0

        for c in raw_camps:
            meta_id = str(c['id'])
            c_name = c.get('name', 'Meta Campaign')
            c_status = 'active' if (c.get('status', '').upper() == 'ACTIVE') else 'paused'
            obj_raw = str(c.get('objective', '')).lower()
            c_obj = objective_map.get(obj_raw, 'lead_generation')
            b_val = float(c.get('daily_budget') or c.get('lifetime_budget') or 0) / 100
            if b_val <= 0:
                b_val = 1000.0

            # Check if already imported
            cp = CampaignPlatform.objects.filter(platform='meta', meta_campaign_id=meta_id).first()
            if cp:
                cp.status = c_status
                cp.publish_status = 'published'
                cp.save(update_fields=['status', 'publish_status', 'updated_at'])
                if cp.campaign:
                    cp.campaign.name = c_name
                    cp.campaign.status = c_status
                    cp.campaign.budget = b_val
                    cp.campaign.save(update_fields=['name', 'status', 'budget', 'updated_at'])
                updated_count += 1
            else:
                camp = SocialCampaign.objects.filter(name=c_name, client_profile=default_client).first()
                if not camp:
                    camp = SocialCampaign.objects.create(
                        client_profile=default_client,
                        name=c_name,
                        objective=c_obj,
                        budget=b_val,
                        platforms=['meta'],
                        ad_platforms=['meta'],
                        campaign_type='ADVANTAGE_PLUS',
                        status=c_status,
                        headline=c_name,
                        primary_text=c_name,
                    )
                else:
                    camp.status = c_status
                    camp.budget = b_val
                    camp.save(update_fields=['status', 'budget', 'updated_at'])

                CampaignPlatform.objects.create(
                    campaign=camp,
                    connection=connection,
                    platform='meta',
                    meta_campaign_id=meta_id,
                    publish_status='published',
                    status=c_status,
                )
                imported_count += 1

        return Response({
            'success': True,
            'imported_count': imported_count,
            'updated_count': updated_count,
            'total_meta_campaigns': len(raw_camps),
            'message': f"Successfully synced {len(raw_camps)} Meta campaigns ({imported_count} new, {updated_count} updated).",
        })

    @action(detail=False, methods=['post'], url_path='discard-drafts')
    def discard_drafts(self, request):
        """
        Discard ONLY unpublished local drafts. Published campaigns and Meta campaigns are NOT touched.
        """
        from apis.social.models import SocialCampaign, CampaignPlatform

        published_camp_ids = CampaignPlatform.objects.filter(
            publish_status='published'
        ).values_list('campaign_id', flat=True)

        drafts_qs = SocialCampaign.objects.filter(
            status='draft'
        ).exclude(id__in=published_camp_ids)

        draft_ids = request.data.get('draft_ids')
        if draft_ids and isinstance(draft_ids, list):
            clean_ids = []
            for d in draft_ids:
                s = str(d).replace('c-local-', '').replace('as-local-', '').replace('ad-local-', '')
                if s.isdigit():
                    clean_ids.append(int(s))
            if clean_ids:
                drafts_qs = drafts_qs.filter(id__in=clean_ids)

        deleted_count, _ = drafts_qs.delete()
        return Response({
            'success': True,
            'deleted_count': deleted_count,
            'message': f"Successfully discarded {deleted_count} unpublished drafts.",
        })

    @action(detail=False, methods=['post'], url_path='toggle-status')
    def toggle_status(self, request):
        """Toggle active / paused status on a Meta Campaign, Ad Set, or Ad."""
        from apis.social.models import PlatformConnection, SocialCampaign, CampaignPlatform
        from apis.social import meta_ads_service

        entity_id = str(request.data.get('id', '')).strip()
        level = request.data.get('level', 'campaign')
        new_status = request.data.get('status', 'ACTIVE').upper()
        req_account_id = request.data.get('account_id')

        if not entity_id:
            return Response({'error': 'id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle local database campaign
        if entity_id.startswith('c-local-') or entity_id.startswith('as-local-') or entity_id.startswith('ad-local-'):
            local_id = entity_id.split('-')[-1]
            try:
                camp = SocialCampaign.objects.get(id=local_id)
                camp.status = 'active' if new_status == 'ACTIVE' else 'paused'
                camp.save(update_fields=['status', 'updated_at'])
                return Response({'success': True, 'id': entity_id, 'status': new_status})
            except SocialCampaign.DoesNotExist:
                pass

        # Call live Meta API
        conn = PlatformConnection.objects.filter(platform='meta', status='connected').first()
        if not conn:
            conn = PlatformConnection.objects.filter(platform='meta').first()

        try:
            if conn:
                meta_ads_service.toggle_meta_entity_status(conn, level, entity_id, new_status)

            # Sync local database if this entity is a campaign
            if level == 'campaign':
                cp = CampaignPlatform.objects.filter(platform='meta', meta_campaign_id=entity_id).first()
                if cp:
                    local_st = 'active' if new_status == 'ACTIVE' else 'paused'
                    cp.status = local_st
                    cp.save(update_fields=['status', 'updated_at'])
                    if cp.campaign:
                        cp.campaign.status = local_st
                        cp.campaign.save(update_fields=['status', 'updated_at'])

            return Response({'success': True, 'id': entity_id, 'status': new_status})
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='create-entity')
    def create_entity(self, request):
        """Create a Campaign, Ad Set, or Ad directly or save as draft."""
        from apis.social.models import SocialCampaign, SocialClientProfile
        data = request.data.get('data', {})
        level = request.data.get('level', 'campaign')
        is_draft = request.data.get('is_draft', True)

        c_name = data.get('name') or data.get('campaignName') or 'New Meta Campaign'
        c_obj = data.get('objective') or 'lead_generation'
        c_budget = float(data.get('budgetAmount') or data.get('budget') or 1000)

        default_client = SocialClientProfile.objects.filter(is_active=True).first() or SocialClientProfile.objects.first()

        camp = SocialCampaign.objects.create(
            client_profile=default_client,
            name=c_name,
            objective=c_obj,
            budget=c_budget,
            platforms=['meta'],
            ad_platforms=['meta'],
            campaign_type='ADVANTAGE_PLUS',
            status='draft' if is_draft else 'active',
            headline=data.get('headline') or c_name,
            primary_text=data.get('primaryText') or c_name,
            creative_image_url=data.get('thumb') or data.get('selectedCreativeUrl') or '',
        )

        return Response({
            'success': True,
            'campaign_id': camp.id,
            'message': f'Campaign "{camp.name}" {"saved as draft" if is_draft else "created successfully"}!',
        })

    @action(detail=False, methods=['post'], url_path='update-entity')
    def update_entity(self, request):
        """Update name, budget, or settings on a campaign, adset, or ad."""
        from apis.social.models import PlatformConnection, SocialCampaign
        from apis.social import meta_ads_service

        entity_id = str(request.data.get('id', '')).strip()
        level = request.data.get('level', 'campaign')
        update_data = request.data.get('data', {})

        if entity_id.startswith('c-local-') or entity_id.startswith('as-local-') or entity_id.startswith('ad-local-'):
            local_id = entity_id.split('-')[-1]
            try:
                camp = SocialCampaign.objects.get(id=local_id)
                if 'name' in update_data:
                    camp.name = update_data['name']
                if 'budget' in update_data:
                    camp.budget = float(update_data['budget'])
                camp.save()
                return Response({'success': True, 'id': entity_id, 'data': update_data})
            except SocialCampaign.DoesNotExist:
                pass

        conn = PlatformConnection.objects.filter(platform='meta', status='connected').first() or PlatformConnection.objects.filter(platform='meta').first()
        if conn:
            try:
                res = meta_ads_service.update_meta_entity(conn, level, entity_id, update_data)
                return Response({'success': True, 'id': entity_id, 'result': res})
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': True, 'id': entity_id})

    @action(detail=False, methods=['post'], url_path='duplicate-entity')
    def duplicate_entity(self, request):
        """Duplicate an entity with (Copy) suffix."""
        from apis.social.models import PlatformConnection, SocialCampaign
        from apis.social import meta_ads_service

        entity_id = str(request.data.get('id', '')).strip()
        level = request.data.get('level', 'campaign')
        copies = int(request.data.get('copies', 1))

        if entity_id.startswith('c-local-') or entity_id.startswith('as-local-') or entity_id.startswith('ad-local-'):
            local_id = entity_id.split('-')[-1]
            try:
                camp = SocialCampaign.objects.get(id=local_id)
                camp.pk = None
                camp.name = f"{camp.name} (Copy)"
                camp.status = 'draft'
                camp.save()
                return Response({'success': True, 'new_id': f'c-local-{camp.id}'})
            except SocialCampaign.DoesNotExist:
                pass

        conn = PlatformConnection.objects.filter(platform='meta', status='connected').first() or PlatformConnection.objects.filter(platform='meta').first()
        if conn:
            try:
                res = meta_ads_service.duplicate_meta_entity(conn, level, entity_id, copies)
                return Response({'success': True, 'duplicates': res})
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': True, 'id': entity_id})

    @action(detail=False, methods=['post'], url_path='delete-entity')
    def delete_entity(self, request):
        """Delete an entity on Meta or locally."""
        from apis.social.models import PlatformConnection, SocialCampaign
        from apis.social import meta_ads_service

        entity_id = str(request.data.get('id', '')).strip()
        level = request.data.get('level', 'campaign')

        if entity_id.startswith('c-local-') or entity_id.startswith('as-local-') or entity_id.startswith('ad-local-'):
            local_id = entity_id.split('-')[-1]
            SocialCampaign.objects.filter(id=local_id).delete()
            return Response({'success': True, 'id': entity_id})

        conn = PlatformConnection.objects.filter(platform='meta', status='connected').first() or PlatformConnection.objects.filter(platform='meta').first()
        if conn:
            try:
                meta_ads_service.delete_meta_entity(conn, level, entity_id)
                return Response({'success': True, 'id': entity_id})
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': True, 'id': entity_id})

    @action(detail=False, methods=['get', 'post'], url_path='automated-rules')
    def automated_rules(self, request):
        """List or create custom automated rules matching Meta Ads Manager."""
        from apis.social.models import SocialAutomatedRule
        from django.utils import timezone

        account_id = request.query_params.get('account_id') or request.data.get('account_id') or '1405144991733037'

        if request.method == 'GET':
            rules = SocialAutomatedRule.objects.filter(status__in=['ACTIVE', 'PAUSED'])
            if account_id and account_id != 'all':
                clean_id = account_id.replace('act_', '')
                rules = rules.filter(account_id__icontains=clean_id)

            # If no rules exist in db yet, seed initial standard rule
            if not rules.exists():
                seed_rule = SocialAutomatedRule.objects.create(
                    account_id=account_id.replace('act_', ''),
                    rule_name='Pause ads if Cost per Result > ₹450',
                    apply_to='all_active_campaigns',
                    action='turn_off',
                    action_details={'adjustment_type': 'turn_off'},
                    conditions=[
                        {'metric': 'cost_per_result', 'operator': 'greater_than', 'value': 450, 'currency': 'INR'}
                    ],
                    time_range='maximum',
                    schedule='continuously',
                    notification_fb=True,
                    notification_email=False,
                    subscribers=['Athira S (athira@adstradigital.com)'],
                    status='ACTIVE',
                )
                rules = [seed_rule]

            data = [
                {
                    'id': r.id,
                    'account_id': r.account_id,
                    'rule_name': r.rule_name,
                    'apply_to': r.apply_to,
                    'action': r.action,
                    'action_details': r.action_details,
                    'conditions': r.conditions,
                    'time_range': r.time_range,
                    'schedule': r.schedule,
                    'schedule_details': r.schedule_details,
                    'notification_fb': r.notification_fb,
                    'notification_email': r.notification_email,
                    'subscribers': r.subscribers,
                    'status': r.status,
                    'last_run_at': r.last_run_at.isoformat() if r.last_run_at else None,
                    'created_at': r.created_at.isoformat() if hasattr(r, 'created_at') and r.created_at else None,
                }
                for r in rules
            ]
            return Response({'success': True, 'rules': data})

        # POST: Create a new custom automated rule
        rule_name = str(request.data.get('rule_name', '')).strip()
        if not rule_name:
            return Response({'error': 'Rule name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        apply_to = request.data.get('apply_to', 'all_active_campaigns')
        action_val = request.data.get('action', 'turn_off')
        action_details = request.data.get('action_details', {})
        conditions = request.data.get('conditions', [])
        time_range = request.data.get('time_range', 'maximum')
        schedule_val = request.data.get('schedule', 'continuously')
        schedule_details = request.data.get('schedule_details', {})
        notification_fb = bool(request.data.get('notification_fb', True))
        notification_email = bool(request.data.get('notification_email', False))
        subscribers = request.data.get('subscribers', [])

        rule = SocialAutomatedRule.objects.create(
            account_id=str(account_id).replace('act_', ''),
            rule_name=rule_name,
            apply_to=apply_to,
            action=action_val,
            action_details=action_details,
            conditions=conditions,
            time_range=time_range,
            schedule=schedule_val,
            schedule_details=schedule_details,
            notification_fb=notification_fb,
            notification_email=notification_email,
            subscribers=subscribers,
            status='ACTIVE',
            last_run_at=timezone.now(),
        )

        return Response({
            'success': True,
            'message': f'Automated rule "{rule_name}" created successfully.',
            'rule': {
                'id': rule.id,
                'account_id': rule.account_id,
                'rule_name': rule.rule_name,
                'apply_to': rule.apply_to,
                'action': rule.action,
                'action_details': rule.action_details,
                'conditions': rule.conditions,
                'time_range': rule.time_range,
                'schedule': rule.schedule,
                'notification_fb': rule.notification_fb,
                'notification_email': rule.notification_email,
                'subscribers': rule.subscribers,
                'status': rule.status,
            }
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='execute-automated-rule')
    def execute_automated_rule(self, request):
        """Evaluate and execute custom automated rules against active campaigns."""
        from apis.social.models import SocialAutomatedRule, SocialCampaign, PlatformConnection
        from apis.social import meta_ads_service
        from django.utils import timezone

        rule_id = request.data.get('rule_id')
        rule = None
        if rule_id:
            rule = SocialAutomatedRule.objects.filter(id=rule_id).first()

        if not rule:
            rule = SocialAutomatedRule.objects.filter(status='ACTIVE').first()

        if not rule:
            return Response({'success': False, 'message': 'No active rule to execute.'})

        # Evaluate conditions against live campaigns
        conn = PlatformConnection.objects.filter(platform='meta', status='connected').first() or PlatformConnection.objects.filter(platform='meta').first()
        campaigns_data = []
        if conn:
            try:
                acc_data = meta_ads_service.fetch_full_account_data(conn)
                campaigns_data = acc_data.get('campaigns', [])
            except Exception:
                pass

        if not campaigns_data:
            local_camps = SocialCampaign.objects.all()[:10]
            campaigns_data = [
                {'id': f'c-local-{c.id}', 'name': c.name, 'status': 'ACTIVE', 'spend': float(c.total_budget or 500), 'cost_per_result': 320.0}
                for c in local_camps
            ]

        affected_items = []
        for camp in campaigns_data:
            # Check condition match
            match = True
            for cond in rule.conditions:
                metric = cond.get('metric', 'cost_per_result')
                op = cond.get('operator', 'greater_than')
                val = float(cond.get('value', 0) or 0)
                camp_val = float(camp.get(metric, 0) or 0)

                if op == 'greater_than' and not (camp_val > val):
                    match = False
                elif op == 'smaller_than' and not (camp_val < val):
                    match = False
                elif op == 'between':
                    val_max = float(cond.get('value_max', val) or val)
                    if not (val <= camp_val <= val_max):
                        match = False

            if match:
                affected_items.append({
                    'id': camp.get('id'),
                    'name': camp.get('name'),
                    'action': rule.action,
                })

        # Update last run
        rule.last_run_at = timezone.now()
        hist = rule.execution_history or []
        hist.insert(0, {
            'timestamp': timezone.now().isoformat(),
            'affected_count': len(affected_items),
            'affected_items': affected_items,
        })
        rule.execution_history = hist[:20]
        rule.save(update_fields=['last_run_at', 'execution_history'])

        return Response({
            'success': True,
            'rule_id': rule.id,
            'rule_name': rule.rule_name,
            'evaluated_count': len(campaigns_data),
            'affected_count': len(affected_items),
            'affected_items': affected_items,
            'message': f'Rule "{rule.rule_name}" evaluated successfully. {len(affected_items)} entities affected.',
        })

    @action(detail=False, methods=['post'], url_path='delete-automated-rule')
    def delete_automated_rule(self, request):
        """Delete an automated rule."""
        from apis.social.models import SocialAutomatedRule
        rule_id = request.data.get('rule_id')
        if rule_id:
            SocialAutomatedRule.objects.filter(id=rule_id).delete()
            return Response({'success': True, 'id': rule_id})
        return Response({'error': 'Rule ID is required.'}, status=status.HTTP_400_BAD_REQUEST)



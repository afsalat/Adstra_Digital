import os
import json
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from apis.social.models import (
    SocialClientProfile,
    SocialAccount,
    SocialCampaign,
    SocialMediaAsset,
    SocialPost,
    PostApprovalHistory,
    SocialInboxMessage,
    SocialDailyAnalytics,
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
)
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

        return qs

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        actor_name = self.request.data.get('actor_name') or (getattr(user, 'fullname', '') or getattr(user, 'username', '') if user else '') or 'Team Member'
        actor_role = self.request.data.get('actor_role') or 'Content Creator'
        post = serializer.save(created_by=user)
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
            post.script_notes = request.data.get('script_notes')
        if 'designer_notes' in request.data:
            post.designer_notes = request.data.get('designer_notes')
        if 'media_urls' in request.data:
            post.media_urls = request.data.get('media_urls')
        if 'scheduled_at' in request.data and request.data.get('scheduled_at'):
            post.scheduled_at = request.data.get('scheduled_at')

        prev_status = post.status
        prev_feedback = post.client_feedback
        post.status = target_stage

        if target_stage == 'published':
            post.published_at = timezone.now()

        if action_type == 'reject' or 'reject' in notes.lower():
            post.client_feedback = notes
        elif target_stage in ['script_approval', 'team_review', 'client_review', 'approved', 'published']:
            # Resubmitted or approved: clear previous loopback critique
            post.client_feedback = ''

        post.save()

        # Audit History logging
        action_label = f"Stage changed: {prev_status} -> {target_stage}"
        if action_type == 'reject':
            if prev_status == 'script_approval':
                action_label = "Script Rejected (Rework Requested)"
                actor_role = actor_role or "Content Reviewer"
            elif prev_status == 'team_review':
                action_label = "Team QA Rejected (Rework Requested)"
                actor_role = actor_role or "QA Lead"
            elif prev_status == 'client_review':
                action_label = "Client Requested Changes"
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
                action_label = "Script Approved → Moved to Designing"
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

        record_approval_action(post, action_label, actor, actor_role or "Workflow Team", notes or f"Moved from {prev_status} to {target_stage}")
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


class PublicClientReviewView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            post = SocialPost.objects.get(client_approval_token=token)
            return Response(SocialPostSerializer(post).data)
        except SocialPost.DoesNotExist:
            return Response({'error': 'Invalid or expired review link.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, token):
        try:
            post = SocialPost.objects.get(client_approval_token=token)
        except SocialPost.DoesNotExist:
            return Response({'error': 'Invalid or expired review link.'}, status=status.HTTP_404_NOT_FOUND)

        action_type = request.data.get('action') # 'approve' or 'request_changes'
        notes = request.data.get('notes', '')
        reviewer_name = request.data.get('reviewer_name', f'{post.client_profile.name} Client')

        if action_type == 'approve':
            post.status = 'scheduled' if post.scheduled_at else 'approved'
            post.client_feedback = ''
            post.save(update_fields=['status', 'client_feedback'])
            record_approval_action(post, 'client_approved', reviewer_name, 'Client', notes or 'Approved by client')
            return Response({'status': 'approved', 'message': 'Post approved successfully! Thank you.'})
        elif action_type == 'request_changes':
            # Per workflow diagram: Client Review rejection loops back to Scheduled / Designing
            post.status = 'designing'
            post.client_feedback = notes
            post.save(update_fields=['status', 'client_feedback'])
            record_approval_action(post, 'client_changes_requested', reviewer_name, 'Client', notes or 'Changes requested by client (Returned to Designing)')
            return Response({'status': 'changes_requested', 'message': 'Feedback received. Creative team will revise in Scheduled / Designing.'})
        
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

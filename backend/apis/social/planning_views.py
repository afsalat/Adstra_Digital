"""API for monthly content planning (the Plan stage before Script)."""

from datetime import date, timedelta

from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apis.social.models import (
    CONTENT_TYPE_CHOICES,
    ContentIdea,
    ContentPackage,
    ContentPlan,
    ContentPlanItem,
    KeyDate,
    ProductionVendor,
    ShootSchedule,
    SocialClientProfile,
)
from apis.social.schedule_engine import STAGES, ScheduleContext, holiday_calendar
from apis.social.planning_serializers import (
    ContentIdeaSerializer,
    ContentPackageSerializer,
    ContentPlanItemSerializer,
    ContentPlanSerializer,
    KeyDateSerializer,
    ProductionVendorSerializer,
    PublicPlanSerializer,
    ShootScheduleSerializer,
    schedule_summary,
)
from apis.social.planning_service import (
    actor_name,
    close_month,
    create_plan,
    create_plan_with_slots,
    default_platforms,
    ensure_default_key_dates,
    generate_slots,
    item_current_due,
    item_schedule,
    item_stage,
    month_end,
    parse_month,
    plan_progress,
    save_quotas,
    start_script,
    sync_plan_slots,
    team_workload,
)

ITEM_RELATED = ('plan', 'plan__client_profile', 'post', 'writer', 'designer', 'vendor', 'shoot', 'key_date')


def _bad(message, code=status.HTTP_400_BAD_REQUEST):
    return Response({'error': message}, status=code)


def _tz_offset(request):
    try:
        return int(request.data.get('tz_offset', 0))
    except (TypeError, ValueError):
        return 0


class ContentPackageViewSet(viewsets.ModelViewSet):
    queryset = ContentPackage.objects.all()
    serializer_class = ContentPackageSerializer
    permission_classes = [permissions.IsAuthenticated]


def _parse_slots(raw_slots):
    """Validate the planner's slot list -> (slots, error message)."""
    valid_types = {c[0] for c in CONTENT_TYPE_CHOICES}
    slots = []
    for raw in raw_slots or []:
        if raw.get('post_type') not in valid_types:
            return None, 'Unknown content type in the schedule.'
        planned = None
        if raw.get('planned_date'):
            try:
                planned = date.fromisoformat(str(raw['planned_date'])[:10])
            except ValueError:
                return None, 'Every post needs a valid date.'
        slots.append({
            'id': raw.get('id') or None,
            'post_type': raw['post_type'],
            'planned_date': planned,
            'title': (raw.get('title') or '').strip(),
            'key_date': raw.get('key_date') or None,
        })
    return slots, None


class ContentPlanViewSet(viewsets.ModelViewSet):
    serializer_class = ContentPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ContentPlan.objects.select_related('client_profile', 'package').prefetch_related('quotas')
        params = self.request.query_params
        client_id = params.get('client_id')
        if client_id and client_id != 'all':
            qs = qs.filter(client_profile_id=client_id)
        if params.get('month'):
            qs = qs.filter(month=parse_month(params['month']))
        if params.get('status'):
            qs = qs.filter(status=params['status'])
        return qs

    def _detail(self, plan):
        plan = self.get_queryset().get(pk=plan.pk)
        data = ContentPlanSerializer(plan, context={'request': self.request}).data
        items = plan.items.select_related(*ITEM_RELATED)
        data['items'] = ContentPlanItemSerializer(items, many=True, context={'request': self.request}).data
        return data

    def retrieve(self, request, *args, **kwargs):
        return Response(self._detail(self.get_object()))

    def create(self, request, *args, **kwargs):
        client = SocialClientProfile.objects.filter(id=request.data.get('client_profile')).first()
        if not client:
            return _bad('Choose a client company first.')
        try:
            month = parse_month(request.data.get('month'))
        except (TypeError, ValueError, IndexError):
            return _bad('month must look like 2026-10.')
        plan = create_plan(
            client,
            month,
            source=request.data.get('source') or 'previous',
            package_id=request.data.get('package_id'),
            copy_slots=bool(request.data.get('copy_slots')),
            user=request.user,
        )
        return Response(self._detail(plan), status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def wizard(self, request):
        """Create a month's plan in one go: {client_profile, month, slots: [{post_type, planned_date, title?, key_date?}]}."""
        client = SocialClientProfile.objects.filter(id=request.data.get('client_profile')).first()
        if not client:
            return _bad('Choose a client company first.')
        try:
            month = parse_month(request.data.get('month'))
        except (TypeError, ValueError, IndexError):
            return _bad('month must look like 2026-10.')
        slots, error = _parse_slots(request.data.get('slots'))
        if error:
            return _bad(error)
        if not slots:
            return _bad('Add at least one deliverable.')
        try:
            plan = create_plan_with_slots(client, month, slots, user=request.user)
        except ValueError as exc:
            return _bad(str(exc), status.HTTP_409_CONFLICT)
        return Response(self._detail(plan), status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        super().update(request, *args, **kwargs)
        return Response(self._detail(self.get_object()))

    @action(detail=True, methods=['post'])
    def sync_slots(self, request, pk=None):
        """Save the planner popup: slots = [{id?, post_type, planned_date, title?, key_date?}]."""
        plan = self.get_object()
        if plan.status == 'closed':
            return _bad('This month is closed.')
        slots, error = _parse_slots(request.data.get('slots'))
        if error:
            return _bad(error)
        sync_plan_slots(plan, slots)
        return Response(self._detail(plan))

    @action(detail=True, methods=['post'])
    def set_quotas(self, request, pk=None):
        plan = self.get_object()
        rows = request.data.get('quotas')
        if not isinstance(rows, list):
            return _bad('quotas must be a list.')
        save_quotas(plan, rows)
        return Response(self._detail(plan))

    @action(detail=True, methods=['post'])
    def generate_slots(self, request, pk=None):
        plan = self.get_object()
        if plan.status == 'closed':
            return _bad('This month is closed.')
        created = generate_slots(plan)
        data = self._detail(plan)
        data['created_count'] = len(created)
        return Response(data)

    @action(detail=True, methods=['post'])
    def send_to_client(self, request, pk=None):
        plan = self.get_object()
        if plan.status == 'closed':
            return _bad('This month is closed.')
        if not plan.items.exclude(status='dropped').exists():
            return _bad('Add some planned posts before sending the plan to the client.')
        plan.status = 'sent'
        plan.sent_at = timezone.now()
        plan.save(update_fields=['status', 'sent_at', 'updated_at'])
        return Response(self._detail(plan))

    @action(detail=True, methods=['post'])
    def mark_approved(self, request, pk=None):
        """Client approved outside the link (call, WhatsApp, meeting)."""
        plan = self.get_object()
        if plan.status == 'closed':
            return _bad('This month is closed.')
        plan.status = 'approved'
        plan.approved_at = timezone.now()
        plan.approved_by_name = (request.data.get('approved_by') or '').strip()[:150] or f'Marked by {actor_name(request.user)}'
        plan.client_feedback = ''
        plan.save(update_fields=['status', 'approved_at', 'approved_by_name', 'client_feedback', 'updated_at'])
        return Response(self._detail(plan))

    @action(detail=True, methods=['post'])
    def back_to_draft(self, request, pk=None):
        plan = self.get_object()
        if plan.status == 'closed':
            return _bad('This month is closed.')
        plan.status = 'draft'
        plan.save(update_fields=['status', 'updated_at'])
        return Response(self._detail(plan))

    @action(detail=True, methods=['post'])
    def close_month(self, request, pk=None):
        plan = self.get_object()
        if plan.status == 'closed':
            return _bad('This month is already closed.')
        close_month(plan, request.user)
        return Response(self._detail(plan))

    @action(detail=True, methods=['get'])
    def schedule_insights(self, request, pk=None):
        """Working days each stage takes per format for this client, and where each number comes from."""
        plan = self.get_object()
        ctx = ScheduleContext.for_plan(plan)
        formats = []
        for post_type, label in ContentPlanItem._meta.get_field('post_type').choices:
            method = 'ai_generated' if post_type in ('reel', 'video') else 'in_house'
            stages = []
            for stage in STAGES:
                days, source, detail = ctx.stage_days(stage, post_type, method)
                stages.append({'stage': stage, 'days': days, 'source': source, 'detail': detail})
            total = sum(r['days'] for r in stages) + ctx.settings['buffer']
            formats.append({'post_type': post_type, 'label': label, 'method': method, 'stages': stages, 'total_days': total})
        cal = holiday_calendar(ctx.settings['workdays'], plan.client_profile_id)
        month_days = [plan.month + timedelta(days=i) for i in range((month_end(plan.month) - plan.month).days + 1)]
        closed = [d.isoformat() for d in month_days if d.weekday() in cal.workdays and not cal.is_workday(d)]
        return Response({
            'settings': ctx.settings,
            'formats': formats,
            'revision_rate': ctx.stats['revision_rate'].get(plan.client_profile_id),
            'learned_samples': sum(v['n'] for k, v in ctx.stats['durations'].items() if k[1] is None and k[2] is None),
            'office_closed_days': closed,
            'working_days_in_month': cal.count(plan.month, month_end(plan.month)),
        })

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Every active client with its plan status for one month."""
        month = parse_month(request.query_params.get('month'))
        clients = SocialClientProfile.objects.filter(is_active=True).select_related('default_package').order_by('name')
        client_id = request.query_params.get('client_id')
        if client_id and client_id != 'all':
            clients = clients.filter(id=client_id)
        plans = {
            p.client_profile_id: p
            for p in ContentPlan.objects.filter(month=month, client_profile__in=clients)
            .select_related('client_profile').prefetch_related('quotas')
        }
        rows = []
        for client in clients:
            plan = plans.get(client.id)
            progress = plan_progress(plan) if plan else None
            rows.append({
                'client_id': client.id,
                'client_name': client.name,
                'logo_url': client.logo_url,
                'primary_color': client.primary_color,
                'carry_over_policy': client.carry_over_policy,
                'default_package': client.default_package.name if client.default_package_id else '',
                'plan': {
                    'id': plan.id,
                    'status': plan.status,
                    'effective_policy': plan.effective_policy,
                    'totals': progress['totals'],
                    'types': [{k: t[k] for k in ('post_type', 'target', 'planned', 'delivered')} for t in progress['types']],
                    'overdue': progress['overdue'],
                    'warnings': len([w for w in progress['warnings'] if w['level'] in ('danger', 'warning')]),
                } if plan else None,
            })
        return Response({'month': month.isoformat(), 'clients': rows})

    @action(detail=False, methods=['get'])
    def attention(self, request):
        """Pipeline badge: slots that should be started (script due within a week) but aren't yet."""
        today = timezone.localdate()
        items = ContentPlanItem.objects.filter(
            status='planned', post__isnull=True,
            plan__month__gte=parse_month(today) - timedelta(days=31),
            plan__month__lte=month_end(parse_month(today)) + timedelta(days=31),
            plan__client_profile__is_active=True,
        ).exclude(plan__status='closed').select_related('plan')
        client_id = request.query_params.get('client_id')
        if client_id and client_id != 'all':
            items = items.filter(plan__client_profile_id=client_id)
        soon = today + timedelta(days=7)
        count = 0
        contexts = {}
        for item in items:
            if item.plan_id not in contexts:
                contexts[item.plan_id] = ScheduleContext.for_plan(item.plan)
            due = item_current_due(item, 'planned', ctx=contexts[item.plan_id])
            if due and due <= soon:
                count += 1
        return Response({'count': count})


class ContentPlanItemViewSet(viewsets.ModelViewSet):
    serializer_class = ContentPlanItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ContentPlanItem.objects.select_related(*ITEM_RELATED)
        params = self.request.query_params
        if params.get('plan'):
            qs = qs.filter(plan_id=params['plan'])
        client_id = params.get('client_id')
        if client_id and client_id != 'all':
            qs = qs.filter(plan__client_profile_id=client_id)
        if params.get('month'):
            qs = qs.filter(plan__month=parse_month(params['month']))
        return qs

    def perform_create(self, serializer):
        plan = serializer.validated_data['plan']
        platforms = serializer.validated_data.get('platforms') or default_platforms(plan.client_profile)
        serializer.save(platforms=platforms, planned_time=serializer.validated_data.get('planned_time') or plan.posting_time)

    def _fresh(self, item):
        return ContentPlanItemSerializer(self.get_queryset().get(pk=item.pk), context={'request': self.request}).data

    @action(detail=True, methods=['post'])
    def start_script(self, request, pk=None):
        item = self.get_object()
        if item.status == 'dropped':
            return _bad('Restore this slot before starting its script.')
        if item.post_id and item_stage(item) != 'rejected':
            return _bad('A script has already been started for this slot.')
        post = start_script(item, request.user, _tz_offset(request))
        data = self._fresh(item)
        data['created_post_id'] = post.id
        return Response(data)

    @action(detail=False, methods=['post'])
    def preview_schedule(self, request):
        """Deadlines for a slot as it is being edited (nothing is saved)."""
        data = request.data
        plan = ContentPlan.objects.select_related('client_profile').filter(id=data.get('plan')).first()
        if not plan:
            return _bad('plan is required.')
        existing = ContentPlanItem.objects.filter(id=data.get('id'), plan=plan).first() if data.get('id') else None
        item = ContentPlanItem(
            plan=plan,
            post_type=data.get('post_type') or 'image',
            production_method=data.get('production_method') or 'in_house',
            planned_date=data.get('planned_date') or None,
            vendor=ProductionVendor.objects.filter(id=data.get('vendor')).first() if data.get('vendor') else None,
            shoot=ShootSchedule.objects.filter(id=data.get('shoot')).first() if data.get('shoot') else None,
        )
        if item.planned_date:
            try:
                item.planned_date = date.fromisoformat(str(item.planned_date)[:10])
            except ValueError:
                return _bad('planned_date must look like 2026-10-24.')
        item.created_at = existing.created_at if existing else None
        schedule = item_schedule(item)
        if not schedule:
            return Response({'deadlines': {}, 'schedule': None})
        return Response({
            'deadlines': {k: v.isoformat() for k, v in schedule['deadlines'].items()},
            'schedule': schedule_summary(schedule),
        })

    @action(detail=True, methods=['post'])
    def drop(self, request, pk=None):
        item = self.get_object()
        item.status = 'dropped'
        item.save(update_fields=['status', 'updated_at'])
        return Response(self._fresh(item))

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        item = self.get_object()
        item.status = 'started' if item.post_id else 'planned'
        item.save(update_fields=['status', 'updated_at'])
        return Response(self._fresh(item))

    @action(detail=False, methods=['post'])
    def bulk(self, request):
        """Apply one action to many slots: start_script, drop, restore, delete or update (fields)."""
        ids = request.data.get('ids') or []
        op = request.data.get('action')
        if not isinstance(ids, list) or not ids:
            return _bad('Select at least one slot.')
        items = list(self.get_queryset().filter(id__in=ids))
        done, skipped = 0, 0
        if op == 'start_script':
            offset = _tz_offset(request)
            for item in items:
                if item.status == 'dropped' or (item.post_id and item_stage(item) != 'rejected'):
                    skipped += 1
                    continue
                start_script(item, request.user, offset)
                done += 1
        elif op == 'drop':
            done = ContentPlanItem.objects.filter(id__in=[i.id for i in items]).update(status='dropped')
        elif op == 'restore':
            for item in items:
                item.status = 'started' if item.post_id else 'planned'
                item.save(update_fields=['status', 'updated_at'])
                done += 1
        elif op == 'delete':
            started = [i.id for i in items if i.post_id]
            done, _ = ContentPlanItem.objects.filter(id__in=[i.id for i in items if not i.post_id]).delete()
            skipped = len(started)
        elif op == 'update':
            fields = request.data.get('fields') or {}
            allowed = {'writer', 'designer', 'production_method', 'vendor', 'shoot', 'pillar', 'planned_time'}
            changes = {f'{k}_id' if k in ('writer', 'designer', 'vendor', 'shoot') else k: v for k, v in fields.items() if k in allowed}
            if not changes:
                return _bad('Nothing to update.')
            done = ContentPlanItem.objects.filter(id__in=[i.id for i in items]).update(**changes, updated_at=timezone.now())
        else:
            return _bad('Unknown bulk action.')
        return Response({'done': done, 'skipped': skipped})


class KeyDateViewSet(viewsets.ModelViewSet):
    serializer_class = KeyDateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ensure_default_key_dates()
        qs = KeyDate.objects.select_related('client_profile')
        params = self.request.query_params
        client_id = params.get('client_id')
        if client_id and client_id != 'all':
            qs = qs.filter(Q(client_profile__isnull=True) | Q(client_profile_id=client_id))
        if params.get('month'):
            month = parse_month(params['month'])
            qs = qs.filter(
                Q(recurring_yearly=True, date__month=month.month)
                | Q(recurring_yearly=False, date__year=month.year, date__month=month.month)
            )
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.query_params.get('month'):
            context['year'] = parse_month(self.request.query_params['month']).year
        return context


class ProductionVendorViewSet(viewsets.ModelViewSet):
    queryset = ProductionVendor.objects.all()
    serializer_class = ProductionVendorSerializer
    permission_classes = [permissions.IsAuthenticated]


class ShootScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ShootScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ShootSchedule.objects.select_related('client_profile', 'vendor')
        params = self.request.query_params
        client_id = params.get('client_id')
        if client_id and client_id != 'all':
            qs = qs.filter(client_profile_id=client_id)
        if params.get('plan'):
            qs = qs.filter(plan_id=params['plan'])
        if params.get('month'):
            month = parse_month(params['month'])
            qs = qs.filter(date__gte=month, date__lte=month_end(month))
        return qs


class ContentIdeaViewSet(viewsets.ModelViewSet):
    serializer_class = ContentIdeaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ContentIdea.objects.select_related('client_profile')
        params = self.request.query_params
        client_id = params.get('client_id')
        if client_id and client_id != 'all':
            qs = qs.filter(Q(client_profile__isnull=True) | Q(client_profile_id=client_id))
        idea_status = params.get('status', 'open')
        if idea_status != 'all':
            qs = qs.filter(status=idea_status)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(submitted_by=user, submitted_by_name=actor_name(user))

    @action(detail=True, methods=['post'])
    def use(self, request, pk=None):
        """Pull the idea into a plan: fill an existing slot (item_id) or create one (plan_id + planned_date)."""
        idea = self.get_object()
        item = None
        if request.data.get('item_id'):
            item = ContentPlanItem.objects.filter(id=request.data['item_id']).select_related('plan').first()
            if not item:
                return _bad('Slot not found.')
            if item.post_id:
                return _bad('That slot already has a script in progress.')
            item.title = idea.title
            item.idea = idea.description or item.idea
            if idea.pillar:
                item.pillar = idea.pillar
            item.save()
        else:
            plan = ContentPlan.objects.filter(id=request.data.get('plan_id')).first()
            if not plan:
                return _bad('Choose a plan.')
            item = ContentPlanItem.objects.create(
                plan=plan,
                post_type=idea.post_type or 'image',
                title=idea.title,
                idea=idea.description,
                pillar=idea.pillar,
                platforms=default_platforms(plan.client_profile),
                planned_date=request.data.get('planned_date') or None,
                planned_time=plan.posting_time,
                production_method='ai_generated' if idea.post_type in ('reel', 'video') else 'in_house',
            )
        if idea.reference_url and idea.reference_url not in (item.notes or ''):
            item.notes = f'{item.notes}\nReference: {idea.reference_url}'.strip()
            item.save(update_fields=['notes'])
        idea.status = 'used'
        idea.used_in = item
        idea.save(update_fields=['status', 'used_in'])
        item = ContentPlanItem.objects.select_related(*ITEM_RELATED).get(pk=item.pk)
        return Response(ContentPlanItemSerializer(item, context={'request': request}).data)


class PlanWorkloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        params = request.query_params

        def num(key, default):
            try:
                return max(1, float(params.get(key, default)))
            except (TypeError, ValueError):
                return default

        return Response(team_workload(
            params.get('month'),
            params.get('client_id'),
            writer_capacity=num('writer_capacity', 10),
            designer_capacity=num('designer_capacity', 8),
        ))


class PublicPlanReviewView(APIView):
    """Client sign-off on the monthly plan via a private link."""

    permission_classes = [permissions.AllowAny]

    def _plan(self, token):
        return ContentPlan.objects.select_related('client_profile').filter(client_approval_token=token).first()

    def get(self, request, token):
        plan = self._plan(token)
        if not plan:
            return _bad('Invalid or expired plan link.', status.HTTP_404_NOT_FOUND)
        return Response(PublicPlanSerializer(plan).data)

    def post(self, request, token):
        plan = self._plan(token)
        if not plan:
            return _bad('Invalid or expired plan link.', status.HTTP_404_NOT_FOUND)
        if plan.status != 'sent':
            return _bad('This plan is no longer waiting for your review.', status.HTTP_409_CONFLICT)
        action_type = request.data.get('action')
        notes = (request.data.get('notes') or '').strip()
        reviewer = (request.data.get('reviewer_name') or '').strip()[:150] or f'{plan.client_profile.name} Client'
        if action_type == 'approve':
            plan.status = 'approved'
            plan.approved_at = timezone.now()
            plan.approved_by_name = reviewer
            plan.client_feedback = notes
            plan.save(update_fields=['status', 'approved_at', 'approved_by_name', 'client_feedback', 'updated_at'])
            return Response({'status': 'approved', 'message': 'Plan approved. Thank you! The team will start production.'})
        if action_type == 'request_changes':
            if not notes:
                return _bad('Please tell us what you would like changed.')
            plan.status = 'changes_requested'
            plan.client_feedback = f'{reviewer}: {notes}'
            plan.save(update_fields=['status', 'client_feedback', 'updated_at'])
            return Response({'status': 'changes_requested', 'message': 'Thanks! The team will update the plan and share it again.'})
        return _bad('Invalid action.')

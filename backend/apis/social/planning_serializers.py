from rest_framework import serializers

from apis.social.models import (
    ContentIdea,
    ContentPackage,
    ContentPlan,
    ContentPlanItem,
    ContentPlanQuota,
    KeyDate,
    ProductionVendor,
    ShootSchedule,
)
from apis.social.planning_service import (
    item_current_due,
    item_schedule,
    item_stage,
    plan_progress,
)
from apis.social.schedule_engine import ScheduleContext
from django.utils import timezone


def _name(user):
    return (getattr(user, 'fullname', '') or user.username) if user else ''


def schedule_summary(schedule):
    """JSON-friendly schedule details (everything except the deadline dates)."""
    if not schedule:
        return None
    return {
        'status': schedule['status'],
        'start_by': schedule['start_by'].isoformat() if schedule['start_by'] else None,
        'squeeze_pct': schedule['squeeze_pct'],
        'total_days': schedule['total_days'],
        'breakdown': schedule['breakdown'],
        'notes': schedule['notes'],
        'ideal': {k: v.isoformat() for k, v in schedule['ideal'].items()},
    }


class ContentPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentPackage
        fields = '__all__'


class ContentPlanQuotaSerializer(serializers.ModelSerializer):
    target = serializers.IntegerField(read_only=True)

    class Meta:
        model = ContentPlanQuota
        fields = '__all__'


class ProductionVendorSerializer(serializers.ModelSerializer):
    vendor_type_display = serializers.CharField(source='get_vendor_type_display', read_only=True)

    class Meta:
        model = ProductionVendor
        fields = '__all__'


class ShootScheduleSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True, default='')
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = ShootSchedule
        fields = '__all__'

    def get_item_count(self, obj):
        return obj.items.exclude(status='dropped').count()


class KeyDateSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    occurs_on = serializers.SerializerMethodField()

    class Meta:
        model = KeyDate
        fields = '__all__'

    def get_occurs_on(self, obj):
        """Recurring dates are projected onto the year being viewed."""
        year = self.context.get('year')
        if obj.recurring_yearly and year:
            try:
                return obj.date.replace(year=int(year)).isoformat()
            except ValueError:  # 29 Feb in a non-leap year
                return obj.date.replace(year=int(year), day=28).isoformat()
        return obj.date.isoformat()


class ContentIdeaSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True, default='')

    class Meta:
        model = ContentIdea
        fields = '__all__'
        read_only_fields = ['submitted_by', 'submitted_by_name', 'used_in']


class ContentPlanItemSerializer(serializers.ModelSerializer):
    stage = serializers.SerializerMethodField()
    deadlines = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()
    current_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    post_info = serializers.SerializerMethodField()
    writer_name = serializers.SerializerMethodField()
    designer_name = serializers.SerializerMethodField()
    vendor_name = serializers.CharField(source='vendor.name', read_only=True, default='')
    shoot_label = serializers.SerializerMethodField()
    key_date_title = serializers.CharField(source='key_date.title', read_only=True, default='')
    client_profile = serializers.IntegerField(source='plan.client_profile_id', read_only=True)

    class Meta:
        model = ContentPlanItem
        fields = '__all__'
        read_only_fields = ['post', 'is_carry_over', 'carried_from']

    def _schedule(self, obj):
        cache = self.context.setdefault('_schedules', {})
        if obj.pk not in cache:
            contexts = self.context.setdefault('_schedule_ctx', {})
            if obj.plan_id not in contexts:
                contexts[obj.plan_id] = ScheduleContext.for_plan(obj.plan)
            cache[obj.pk] = item_schedule(obj, contexts[obj.plan_id])
        return cache[obj.pk]

    def _deadlines(self, obj):
        schedule = self._schedule(obj)
        return schedule['deadlines'] if schedule else {}

    def get_schedule(self, obj):
        return schedule_summary(self._schedule(obj))

    def get_stage(self, obj):
        return item_stage(obj)

    def get_deadlines(self, obj):
        return {k: v.isoformat() for k, v in self._deadlines(obj).items()}

    def get_current_due(self, obj):
        due = item_current_due(obj, deadlines=self._deadlines(obj))
        return due.isoformat() if due else None

    def get_is_overdue(self, obj):
        due = item_current_due(obj, deadlines=self._deadlines(obj))
        return bool(due and due < timezone.localdate())

    def get_post_info(self, obj):
        if not obj.post_id:
            return None
        p = obj.post
        return {'id': p.id, 'status': p.status, 'title': p.title, 'scheduled_at': p.scheduled_at}

    def get_writer_name(self, obj):
        return _name(obj.writer)

    def get_designer_name(self, obj):
        return _name(obj.designer)

    def get_shoot_label(self, obj):
        if not obj.shoot_id:
            return ''
        return obj.shoot.title or f'Shoot {obj.shoot.date:%d %b}'


class ContentPlanSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    client_policy = serializers.CharField(source='client_profile.carry_over_policy', read_only=True)
    effective_policy = serializers.CharField(read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True, default='')
    quotas = ContentPlanQuotaSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = ContentPlan
        fields = '__all__'
        read_only_fields = [
            'client_approval_token', 'sent_at', 'approved_at', 'approved_by_name',
            'closed_at', 'close_summary', 'created_by', 'status',
        ]

    def get_progress(self, obj):
        return plan_progress(obj)


class PublicPlanSerializer(serializers.ModelSerializer):
    """What the client sees on the plan sign-off page."""

    client_name = serializers.CharField(source='client_profile.name', read_only=True)
    client_logo = serializers.CharField(source='client_profile.logo_url', read_only=True)
    quotas = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    class Meta:
        model = ContentPlan
        fields = [
            'id', 'client_name', 'client_logo', 'month', 'status', 'brief_goals', 'brief_offers', 'brief_focus',
            'brief_avoid', 'brief_references', 'brief_notes', 'pillar_mix', 'client_feedback', 'approved_at',
            'approved_by_name', 'quotas', 'items',
        ]

    def get_quotas(self, obj):
        return [{'post_type': q.post_type, 'label': q.get_post_type_display(), 'target': q.target} for q in obj.quotas.all()]

    def get_items(self, obj):
        return [
            {
                'id': i.id, 'post_type': i.post_type, 'type_label': i.get_post_type_display(), 'title': i.title,
                'idea': i.idea, 'pillar': i.pillar, 'pillar_label': i.get_pillar_display() if i.pillar else '',
                'platforms': i.platforms, 'planned_date': i.planned_date, 'occasion': i.key_date.title if i.key_date_id else '',
            }
            for i in obj.items.exclude(status='dropped').select_related('key_date')
        ]

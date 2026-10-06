"""Monthly content planning: plan creation, slot generation, deadlines, month close and workload."""

import calendar
from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone as dt_timezone
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apis.social.models import (
    ContentPackage,
    KeyDate,
    ContentPlan,
    ContentPlanItem,
    ContentPlanQuota,
    SocialAccount,
    SocialPost,
)
from apis.social.services import record_approval_action
from apis.social.schedule_engine import ScheduleContext, build_schedule, schedule_settings

VIDEO_TYPES = {'reel', 'video'}

# Default posting weekdays per format (0 = Monday)
DEFAULT_POSTING_DAYS = {
    'reel': [1, 4],
    'video': [3],
    'image': [0, 2, 5],
    'carousel': [3],
    'text': [2],
}

# Fixed-date days that repeat every year (seeded once). Lunar festivals (Onam, Diwali, Eid, Holi...)
# move each year, so the team adds those per year from the planning calendar.
# The last value marks the office as closed, which deadlines skip.
DEFAULT_KEY_DATES = [
    (1, 1, "New Year's Day", 'festival', False),
    (1, 14, 'Makar Sankranti / Pongal', 'festival', False),
    (1, 26, 'Republic Day', 'national', True),
    (2, 14, "Valentine's Day", 'other', False),
    (3, 8, "International Women's Day", 'awareness', False),
    (4, 7, 'World Health Day', 'awareness', False),
    (4, 14, 'Vishu', 'festival', True),
    (5, 1, 'Labour Day', 'national', False),
    (6, 5, 'World Environment Day', 'awareness', False),
    (6, 21, 'International Yoga Day', 'awareness', False),
    (8, 15, 'Independence Day', 'national', True),
    (9, 5, "Teachers' Day", 'awareness', False),
    (10, 2, 'Gandhi Jayanti', 'national', True),
    (11, 1, 'Kerala Piravi', 'national', False),
    (11, 14, "Children's Day", 'awareness', False),
    (12, 25, 'Christmas', 'festival', True),
    (12, 31, "New Year's Eve", 'festival', False),
]


# Moving festivals / world days for 2026 (Kerala, India, world). Lunar dates can shift by a day with
# moon sighting, so the team can edit them from the key-dates screen. Seeded idempotently by title + date.
# (month, day, title, category, region)
FESTIVAL_CALENDAR_2026 = [
    (2, 15, 'Maha Shivaratri', 'festival', 'India'),
    (2, 18, 'Ramadan begins', 'festival', 'World'),
    (3, 4, 'Holi', 'festival', 'India'),
    (3, 19, 'Ugadi', 'festival', 'India'),
    (3, 21, 'Eid al-Fitr', 'festival', 'Kerala'),
    (3, 26, 'Ram Navami', 'festival', 'India'),
    (4, 3, 'Good Friday', 'festival', 'Kerala'),
    (4, 5, 'Easter', 'festival', 'Kerala'),
    (4, 22, 'Earth Day', 'awareness', 'World'),
    (5, 10, "Mother's Day", 'other', 'World'),
    (5, 28, 'Eid al-Adha (Bakrid)', 'festival', 'Kerala'),
    (6, 21, "Father's Day", 'other', 'World'),
    (6, 26, 'Muharram', 'festival', 'India'),
    (8, 17, 'Chingam 1 (Malayalam New Year)', 'festival', 'Kerala'),
    (8, 25, 'Uthradom (First Onam)', 'festival', 'Kerala'),
    (8, 26, 'Onam (Thiruvonam)', 'festival', 'Kerala'),
    (8, 28, 'Raksha Bandhan', 'festival', 'India'),
    (9, 4, 'Janmashtami', 'festival', 'India'),
    (9, 14, 'Ganesh Chaturthi', 'festival', 'India'),
    (10, 11, 'Navratri begins', 'festival', 'India'),
    (10, 19, 'Maha Navami / Ayudha Puja', 'festival', 'Kerala'),
    (10, 20, 'Vijayadashami (Vidyarambham)', 'festival', 'Kerala'),
    (10, 31, 'Halloween', 'other', 'World'),
    (11, 6, 'Dhanteras', 'festival', 'India'),
    (11, 8, 'Diwali', 'festival', 'India'),
    (11, 24, 'Guru Nanak Jayanti', 'festival', 'India'),
    (11, 26, 'Thanksgiving', 'other', 'World'),
    (11, 27, 'Black Friday', 'offer', 'World'),
    (11, 30, 'Cyber Monday', 'offer', 'World'),
    (12, 24, 'Christmas Eve', 'festival', 'World'),
]
_festivals_seeded = False


def ensure_festival_calendar():
    """Add the moving festivals to the key dates once per process (safe to call repeatedly)."""
    global _festivals_seeded
    if _festivals_seeded:
        return
    existing = set(KeyDate.objects.filter(client_profile__isnull=True).values_list('title', 'date'))
    fresh = [
        KeyDate(date=date(2026, month, day), title=title, category=category, notes=region)
        for month, day, title, category, region in FESTIVAL_CALENDAR_2026
        if (title, date(2026, month, day)) not in existing
    ]
    if fresh:
        KeyDate.objects.bulk_create(fresh)
    _festivals_seeded = True


DEFAULT_PILLAR_MIX = {'educational': 35, 'promotional': 25, 'engagement': 20, 'behind_the_scenes': 10, 'testimonial': 10}

# Post status -> plan item stage
POST_STAGE = {
    'script': 'script', 'draft': 'script',
    'script_approval': 'script_approval',
    'designing': 'designing', 'rejected': 'designing',
    'team_review': 'team_review', 'internal_review': 'team_review',
    'client_review': 'client_review',
    'approved': 'ready', 'scheduled': 'ready', 'publishing': 'ready', 'failed': 'ready',
    'published': 'published', 'archived': 'published',
    'content_rejected': 'rejected',
}
DELIVERED_STAGES = {'ready', 'published'}  # approved / scheduled count as delivered for billing

# The deadline that matters for each stage (what must be finished next)
STAGE_DEADLINE = {
    'planned': 'script',
    'script': 'script',
    'script_approval': 'script_approval',
    'designing': 'designing',
    'team_review': 'team_review',
    'client_review': 'client_review',
}

DESIGN_WEIGHT = {'reel': 2, 'video': 2, 'carousel': 1.5, 'image': 1, 'text': 0.5}


# ─── Month helpers ───

def parse_month(value):
    """'2026-10' or '2026-10-01' -> date(2026, 10, 1). Defaults to the current month."""
    if not value:
        today = timezone.localdate()
        return date(today.year, today.month, 1)
    if isinstance(value, date):
        return date(value.year, value.month, 1)
    parts = str(value).split('-')
    return date(int(parts[0]), int(parts[1]), 1)


def add_months(month, n):
    total = month.year * 12 + (month.month - 1) + n
    return date(total // 12, total % 12 + 1, 1)


def month_end(month):
    return date(month.year, month.month, calendar.monthrange(month.year, month.month)[1])


def actor_name(user):
    if user and getattr(user, 'is_authenticated', False):
        return getattr(user, 'fullname', '') or user.username
    return 'Team Member'


def ensure_default_key_dates():
    """Seed the yearly key dates the first time the calendar is used (table still empty)."""
    ensure_festival_calendar()
    if KeyDate.objects.exclude(notes__in=('Kerala', 'India', 'World')).exists():
        return
    KeyDate.objects.bulk_create([
        KeyDate(date=date(2026, month, day), title=title, category=category, recurring_yearly=True, office_closed=closed)
        for month, day, title, category, closed in DEFAULT_KEY_DATES
    ])


# ─── Deadlines & stage ───

def item_schedule(item, ctx=None):
    """Full schedule for a slot (deadlines, status, start-by, how each duration was chosen)."""
    if not item.planned_date:
        return None
    ctx = ctx or ScheduleContext.for_plan(item.plan)
    anchor = timezone.localtime(item.created_at).date() if item.created_at else timezone.localdate()
    return build_schedule(
        ctx,
        post_type=item.post_type,
        method=item.production_method,
        publish=item.planned_date,
        anchor=anchor,
        vendor=item.vendor if item.vendor_id else None,
        shoot=item.shoot if item.shoot_id and item.production_method == 'shoot' else None,
    )


def item_deadlines(item, ctx=None):
    """Due date for each stage (working days, learned durations, compressed if planned late)."""
    schedule = item_schedule(item, ctx)
    return schedule['deadlines'] if schedule else {}


def item_stage(item):
    if item.status == 'dropped':
        return 'dropped'
    if not item.post_id:
        return 'planned'
    return POST_STAGE.get(item.post.status, 'script')


def item_current_due(item, stage=None, deadlines=None, ctx=None):
    stage = stage or item_stage(item)
    key = STAGE_DEADLINE.get(stage)
    if not key:
        return None
    deadlines = deadlines if deadlines is not None else item_deadlines(item, ctx)
    return deadlines.get(key)


# ─── Plan progress / delivery ───

def plan_progress(plan, items=None):
    """Quota progress per content type, pillar mix and a delivery / billing preview."""
    items = list(items if items is not None else plan.items.select_related('post', 'vendor', 'shoot'))
    quotas = list(plan.quotas.all())
    today = timezone.localdate()
    ctx = ScheduleContext.for_plan(plan)
    at_risk = 0
    tight = 0

    by_type = defaultdict(lambda: defaultdict(int))
    pillar_counts = defaultdict(int)
    overdue = 0
    unscheduled = 0
    for item in items:
        stage = item_stage(item)
        row = by_type[item.post_type]
        if stage == 'dropped':
            row['dropped'] += 1
            continue
        if stage == 'rejected':
            row['rejected'] += 1
            continue
        row['planned'] += 1
        if stage == 'planned':
            row['not_started'] += 1
        elif stage in DELIVERED_STAGES:
            row['delivered'] += 1
            if stage == 'published':
                row['published'] += 1
        else:
            row['in_progress'] += 1
        if item.pillar:
            pillar_counts[item.pillar] += 1
        if not item.planned_date:
            unscheduled += 1
            continue
        schedule = item_schedule(item, ctx)
        due = item_current_due(item, stage, schedule['deadlines'])
        if due and due < today:
            overdue += 1
        if stage not in DELIVERED_STAGES and schedule['status'] == 'at_risk':
            at_risk += 1
        elif stage not in DELIVERED_STAGES and schedule['status'] == 'tight':
            tight += 1

    types = []
    seen = set()
    billing_short = Decimal('0')
    billing_extra = Decimal('0')
    month_over = today > month_end(plan.month)
    warnings = []
    for q in quotas:
        seen.add(q.post_type)
        row = by_type[q.post_type]
        target = q.target
        shortfall = max(0, target - row['delivered'])
        extra = max(0, row['delivered'] - target)
        billing_short += shortfall * q.unit_price
        billing_extra += extra * q.unit_price
        types.append({
            'post_type': q.post_type,
            'quantity': q.quantity,
            'carried_in': q.carried_in,
            'target': target,
            'unit_price': str(q.unit_price),
            'platforms': q.platforms,
            'notes': q.notes,
            'planned': row['planned'],
            'not_started': row['not_started'],
            'in_progress': row['in_progress'],
            'delivered': row['delivered'],
            'published': row['published'],
            'rejected': row['rejected'],
            'dropped': row['dropped'],
            'to_plan': max(0, target - row['planned']),
            'over_planned': max(0, row['planned'] - target),
            'shortfall': shortfall,
            'extra': extra,
        })
        if row['planned'] < target:
            warnings.append({'level': 'warning', 'code': 'under_planned', 'post_type': q.post_type,
                             'message': f'{target - row["planned"]} {q.get_post_type_display()} still to plan ({row["planned"]}/{target}).'})
        elif row['planned'] > target:
            warnings.append({'level': 'info', 'code': 'over_planned', 'post_type': q.post_type,
                             'message': f'{row["planned"] - target} more {q.get_post_type_display()} planned than the package ({row["planned"]}/{target}).'})
        if extra:
            warnings.append({'level': 'info', 'code': 'over_delivered', 'post_type': q.post_type,
                             'message': f'{extra} extra {q.get_post_type_display()} delivered - bill as extra?'})
        if month_over and shortfall:
            warnings.append({'level': 'danger', 'code': 'under_delivered', 'post_type': q.post_type,
                             'message': f'{shortfall} {q.get_post_type_display()} not delivered this month.'})

    # Content planned for a type that isn't in the package at all
    type_labels = dict(SocialPost.POST_TYPE_CHOICES)
    for post_type, row in by_type.items():
        if post_type in seen or not row['planned']:
            continue
        types.append({
            'post_type': post_type, 'quantity': 0, 'carried_in': 0, 'target': 0, 'unit_price': '0',
            'platforms': [], 'notes': '', 'planned': row['planned'], 'not_started': row['not_started'],
            'in_progress': row['in_progress'], 'delivered': row['delivered'], 'published': row['published'],
            'rejected': row['rejected'], 'dropped': row['dropped'], 'to_plan': 0,
            'over_planned': row['planned'], 'shortfall': 0, 'extra': row['delivered'], 'outside_package': True,
        })
        warnings.append({'level': 'info', 'code': 'outside_package', 'post_type': post_type,
                         'message': f'{row["planned"]} {type_labels.get(post_type, post_type)} planned outside the package.'})

    if overdue:
        warnings.append({'level': 'danger', 'code': 'overdue', 'message': f'{overdue} item(s) behind their stage deadline.'})
    if at_risk:
        warnings.append({'level': 'danger', 'code': 'at_risk',
                         'message': f'{at_risk} item(s) cannot realistically make their publish date - move the date or simplify.'})
    if tight:
        warnings.append({'level': 'warning', 'code': 'tight',
                         'message': f'{tight} item(s) were planned late and have a compressed schedule.'})
    if unscheduled:
        warnings.append({'level': 'warning', 'code': 'unscheduled', 'message': f'{unscheduled} item(s) have no publish date yet.'})

    # Pillar mix: actual share vs target share
    active_total = sum(pillar_counts.values())
    mix = plan.pillar_mix or {}
    pillars = []
    for key in sorted(set(mix) | set(pillar_counts), key=lambda k: -float(mix.get(k, 0) or 0)):
        actual_pct = round(pillar_counts[key] * 100 / active_total) if active_total else 0
        pillars.append({'pillar': key, 'target_pct': float(mix.get(key, 0) or 0), 'count': pillar_counts[key], 'actual_pct': actual_pct})

    totals = {k: sum(t[k] for t in types) for k in ('target', 'planned', 'not_started', 'in_progress', 'delivered', 'published', 'rejected', 'shortfall', 'extra')}
    policy = plan.effective_policy
    return {
        'types': types,
        'totals': totals,
        'pillars': pillars,
        'overdue': overdue,
        'at_risk': at_risk,
        'tight': tight,
        'unscheduled': unscheduled,
        'warnings': warnings,
        'billing': {
            'policy': policy,
            'monthly_fee': str(plan.monthly_fee),
            'shortfall_value': str(billing_short),
            'extra_value': str(billing_extra),
            # Carry-over clients get the missing items next month instead of a reduced bill
            'deduction': str(billing_short if policy == 'adjust_billing' else Decimal('0')),
            'estimated_bill': str(max(Decimal('0'), plan.monthly_fee - (billing_short if policy == 'adjust_billing' else 0) + billing_extra))
            if plan.monthly_fee else None,
        },
    }


# ─── Plan creation ───

def default_platforms(client):
    platforms = list(
        SocialAccount.objects.filter(client_profile=client).exclude(status='disconnected')
        .values_list('platform', flat=True).distinct()
    )
    return platforms or ['instagram', 'facebook']


def _shift_date(day, month):
    """Same day-of-month in another month (clamped to its length)."""
    if not day:
        return None
    return date(month.year, month.month, min(day.day, calendar.monthrange(month.year, month.month)[1]))


@transaction.atomic
def create_plan(client, month, source='previous', package_id=None, copy_slots=False, user=None):
    month = parse_month(month)
    existing = ContentPlan.objects.filter(client_profile=client, month=month).first()
    if existing:
        return existing

    previous = ContentPlan.objects.filter(client_profile=client, month__lt=month).order_by('-month').first()
    package = None
    if source == 'package':
        package = ContentPackage.objects.filter(id=package_id).first() or client.default_package
    elif source == 'previous' and not previous:
        package = client.default_package  # first plan for this client: start from its package

    plan = ContentPlan(
        client_profile=client,
        month=month,
        created_by=user if user and user.is_authenticated else None,
        lead_days=schedule_settings(None),
        posting_days=dict(DEFAULT_POSTING_DAYS),
        pillar_mix=dict(DEFAULT_PILLAR_MIX),
    )

    quotas = []
    if source == 'previous' and previous:
        for field in ('package', 'carry_over_policy', 'monthly_fee', 'posting_time', 'brief_avoid', 'brief_references'):
            setattr(plan, field, getattr(previous, field))
        plan.pillar_mix = previous.pillar_mix or plan.pillar_mix
        plan.posting_days = previous.posting_days or plan.posting_days
        plan.lead_days = schedule_settings(previous.lead_days)
        quotas = [
            {'post_type': q.post_type, 'quantity': q.quantity, 'unit_price': q.unit_price, 'platforms': q.platforms, 'notes': q.notes}
            for q in previous.quotas.all()
        ]
    elif package:
        plan.package = package
        plan.monthly_fee = package.monthly_fee
        plan.pillar_mix = package.pillar_mix or plan.pillar_mix
        quotas = package.quotas or []
    plan.save()

    platforms = default_platforms(client)
    for q in quotas:
        if not q.get('post_type'):
            continue
        ContentPlanQuota.objects.create(
            plan=plan,
            post_type=q['post_type'],
            quantity=int(q.get('quantity') or 0),
            unit_price=Decimal(str(q.get('unit_price') or 0)),
            platforms=q.get('platforms') or platforms,
            notes=q.get('notes', '') or '',
        )

    if copy_slots and source == 'previous' and previous:
        for item in previous.items.exclude(status='dropped').filter(is_carry_over=False):
            ContentPlanItem.objects.create(
                plan=plan,
                post_type=item.post_type,
                title=item.title,
                idea=item.idea,
                pillar=item.pillar,
                platforms=item.platforms,
                planned_date=_shift_date(item.planned_date, month),
                planned_time=item.planned_time,
                production_method=item.production_method,
                vendor=item.vendor,
                writer=item.writer,
                designer=item.designer,
            )
    return plan


@transaction.atomic
def sync_plan_slots(plan, slots):
    """Make the plan's slots match the list: update known ids, create new ones, delete the rest.

    Slots that already have a script (post) are never deleted or retyped. Quotas follow the slot counts.
    """
    keep_ids = {s['id'] for s in slots if s.get('id')}
    for item in plan.items.exclude(id__in=keep_ids):
        if not item.post_id:
            item.delete()

    existing = {i.id: i for i in plan.items.all()}
    key_dates = {k.id: k for k in KeyDate.objects.filter(id__in={s['key_date'] for s in slots if s.get('key_date')})}
    platforms = default_platforms(plan.client_profile)
    for slot in slots:
        key_date = key_dates.get(slot.get('key_date'))
        item = existing.get(slot.get('id'))
        if item:
            if not item.post_id:
                item.post_type = slot['post_type']
            item.planned_date = slot.get('planned_date')
            item.title = (slot.get('title') or '')[:255]
            item.key_date = key_date
            if key_date:
                item.pillar = 'festive'
            elif item.pillar == 'festive':
                item.pillar = ''
            item.save()
            continue
        ContentPlanItem.objects.create(
            plan=plan,
            post_type=slot['post_type'],
            title=(slot.get('title') or '')[:255],
            pillar='festive' if key_date else '',
            key_date=key_date,
            platforms=platforms,
            planned_date=slot.get('planned_date'),
            planned_time=plan.posting_time,
            production_method='ai_generated' if slot['post_type'] in VIDEO_TYPES else 'in_house',
        )

    counts = defaultdict(int)
    for item in plan.items.exclude(status='dropped').filter(is_carry_over=False):
        counts[item.post_type] += 1
    old = {q.post_type: q for q in plan.quotas.all()}
    package = plan.client_profile.default_package
    package_prices = {q.get('post_type'): q.get('unit_price') for q in (package.quotas if package else [])}
    save_quotas(plan, [
        {
            'post_type': t,
            'quantity': n,
            'carried_in': old[t].carried_in if t in old else 0,
            'unit_price': old[t].unit_price if t in old else (package_prices.get(t) or 0),
            'platforms': (old[t].platforms if t in old else None) or platforms,
            'notes': old[t].notes if t in old else '',
        }
        for t, n in counts.items()
    ])
    return plan


@transaction.atomic
def create_plan_with_slots(client, month, slots, user=None):
    """One-shot plan creation: deliverables (quotas) plus one dated slot per post, optionally tied to a festival."""
    month = parse_month(month)
    if ContentPlan.objects.filter(client_profile=client, month=month).exists():
        raise ValueError('This client already has a plan for that month.')
    plan = create_plan(client, month, source='blank', user=user)
    package = client.default_package
    plan.package = package
    plan.monthly_fee = package.monthly_fee if package else 0
    plan.save(update_fields=['package', 'monthly_fee', 'updated_at'])
    return sync_plan_slots(plan, slots)


def save_quotas(plan, rows):
    """Replace a plan's quotas with the given rows (upsert by post_type)."""
    keep = set()
    for row in rows or []:
        post_type = row.get('post_type')
        if not post_type:
            continue
        keep.add(post_type)
        ContentPlanQuota.objects.update_or_create(
            plan=plan,
            post_type=post_type,
            defaults={
                'quantity': max(0, int(row.get('quantity') or 0)),
                'carried_in': max(0, int(row.get('carried_in') or 0)),
                'unit_price': Decimal(str(row.get('unit_price') or 0)),
                'platforms': row.get('platforms') or [],
                'notes': (row.get('notes') or '')[:255],
            },
        )
    plan.quotas.exclude(post_type__in=keep).delete()


# ─── Slot generation ───

def _spread(candidates, n):
    """Pick n dates spaced evenly through the period, snapping each to the nearest unused candidate."""
    if n <= 0 or not candidates:
        return []
    if n >= len(candidates):
        return [candidates[i % len(candidates)] for i in range(n)]
    first, span = candidates[0], (candidates[-1] - candidates[0]).days + 1
    remaining = list(candidates)
    picked = []
    for i in range(n):
        ideal = first + timedelta(days=span * (i + 0.5) / n)
        best = min(remaining, key=lambda d: abs((d - ideal).days))
        remaining.remove(best)
        picked.append(best)
    return sorted(picked)


@transaction.atomic
def generate_slots(plan):
    """Create the missing slots for every quota, spread over the month on its posting days."""
    today = timezone.localdate()
    start = max(plan.month, today + timedelta(days=1)) if plan.month <= today <= month_end(plan.month) else plan.month
    end = month_end(plan.month)
    days = [start + timedelta(days=i) for i in range((end - start).days + 1)] if start <= end else []
    posting_days = {**DEFAULT_POSTING_DAYS, **(plan.posting_days or {})}

    items = list(plan.items.exclude(status='dropped'))
    existing_by_type = defaultdict(int)
    used_dates = defaultdict(set)
    pillar_counts = defaultdict(int)
    for item in items:
        if item_stage(item) == 'rejected':
            continue
        existing_by_type[item.post_type] += 1
        if item.planned_date:
            used_dates[item.post_type].add(item.planned_date)
        if item.pillar:
            pillar_counts[item.pillar] += 1

    quotas = list(plan.quotas.all())
    total_target = sum(q.target for q in quotas) or 1
    mix = {k: float(v or 0) for k, v in (plan.pillar_mix or {}).items() if float(v or 0) > 0}
    mix_total = sum(mix.values()) or 1
    pillar_target = {k: v * total_target / mix_total for k, v in mix.items()}

    def next_pillar():
        if not pillar_target:
            return ''
        key = max(pillar_target, key=lambda k: pillar_target[k] - pillar_counts[k])
        pillar_counts[key] += 1
        return key

    fallback_platforms = None
    created = []
    for q in quotas:
        need = q.target - existing_by_type[q.post_type]
        if need <= 0:
            continue
        weekdays = posting_days.get(q.post_type) or []
        candidates = [d for d in days if d.weekday() in weekdays] or days
        free = [d for d in candidates if d not in used_dates[q.post_type]]
        if len(free) >= need:
            candidates = free
        if q.platforms:
            platforms = q.platforms
        else:
            fallback_platforms = fallback_platforms or default_platforms(plan.client_profile)
            platforms = fallback_platforms
        for day in _spread(candidates, need) or [None] * need:
            created.append(ContentPlanItem.objects.create(
                plan=plan,
                post_type=q.post_type,
                pillar=next_pillar(),
                platforms=platforms,
                planned_date=day,
                planned_time=plan.posting_time,
                production_method='ai_generated' if q.post_type in VIDEO_TYPES else 'in_house',
            ))
    return created


# ─── Start script ───

def _scheduled_at(item, tz_offset_minutes):
    if not item.planned_date:
        return None
    local = datetime.combine(item.planned_date, item.planned_time or item.plan.posting_time or time(19, 0))
    # tz_offset follows JS getTimezoneOffset(): minutes to add to local time to get UTC
    return (local + timedelta(minutes=int(tz_offset_minutes or 0))).replace(tzinfo=dt_timezone.utc)


def build_script_notes(item):
    plan = item.plan
    lines = []
    if item.idea:
        lines.append(f'Idea: {item.idea}')
    if item.pillar:
        lines.append(f'Pillar: {item.get_pillar_display()}')
    lines.append(f'Production: {item.get_production_method_display()}' + (f' ({item.vendor.name})' if item.vendor_id else ''))
    if item.key_date_id:
        lines.append(f'Occasion: {item.key_date.title}')
    for label, value in (('Goals', plan.brief_goals), ('Offers', plan.brief_offers), ('Focus', plan.brief_focus), ('Avoid', plan.brief_avoid)):
        if value:
            lines.append(f'{label}: {value}')
    if item.notes:
        lines.append(f'Notes: {item.notes}')
    return '\n'.join(lines)


@transaction.atomic
def start_script(item, user=None, tz_offset_minutes=0):
    """Create the SocialPost for a slot in the Script stage."""
    if item.post_id and item_stage(item) != 'rejected':
        return item.post
    deadlines = item_deadlines(item)
    script_due = deadlines.get('script')
    today = timezone.localdate()
    priority = 'medium'
    if script_due:
        days_left = (script_due - today).days
        priority = 'urgent' if days_left < 0 else 'high' if days_left <= 2 else 'medium'

    fallback_title = item.get_post_type_display() + (f' - {item.planned_date:%d %b}' if item.planned_date else '')
    title = item.title or fallback_title
    post = SocialPost.objects.create(
        client_profile=item.plan.client_profile,
        title=title,
        post_type=item.post_type,
        platforms=item.platforms or default_platforms(item.plan.client_profile),
        scheduled_at=_scheduled_at(item, tz_offset_minutes),
        status='script',
        priority=priority,
        script_notes=build_script_notes(item),
        writer=item.writer,
        designer=item.designer,
        created_by=user if user and user.is_authenticated else None,
    )
    item.post = post
    item.status = 'started'
    item.save(update_fields=['post', 'status', 'updated_at'])
    due_note = f' Script due {script_due:%d %b}.' if script_due else ''
    record_approval_action(post, 'created', actor_name(user), 'Planner', f'Created from the {item.plan.month:%B %Y} content plan.{due_note}')
    return post


# ─── Month close: carry-over or billing adjustment ───

@transaction.atomic
def close_month(plan, user=None):
    if plan.status == 'closed':
        return plan
    items = list(plan.items.select_related('post'))
    progress = plan_progress(plan, items)
    policy = plan.effective_policy
    next_month = add_months(plan.month, 1)
    moved, dropped = 0, 0
    next_plan = None

    if policy == 'carry_over':
        next_plan = ContentPlan.objects.filter(client_profile=plan.client_profile, month=next_month).first() \
            or create_plan(plan.client_profile, next_month, source='previous', user=user)
        for row in progress['types']:
            if row['shortfall'] <= 0:
                continue
            quota, _ = ContentPlanQuota.objects.get_or_create(
                plan=next_plan, post_type=row['post_type'],
                defaults={'quantity': 0, 'unit_price': Decimal(row['unit_price'] or 0), 'platforms': row['platforms']},
            )
            quota.carried_in += row['shortfall']
            quota.save(update_fields=['carried_in'])
        for item in items:
            if item_stage(item) in ('planned', 'script', 'script_approval', 'designing', 'team_review', 'client_review'):
                item.plan = next_plan
                item.is_carry_over = True
                item.carried_from = plan
                if not item.post_id:
                    item.planned_date = None  # needs a new date in the next month
                item.save()
                moved += 1
    else:
        for item in items:
            if item_stage(item) == 'planned':
                item.status = 'dropped'
                item.save(update_fields=['status', 'updated_at'])
                dropped += 1

    plan.status = 'closed'
    plan.closed_at = timezone.now()
    plan.close_summary = {
        'policy': policy,
        'closed_by': actor_name(user),
        'types': [
            {k: row[k] for k in ('post_type', 'target', 'delivered', 'shortfall', 'extra', 'unit_price')}
            for row in progress['types']
        ],
        'billing': progress['billing'],
        'moved_items': moved,
        'dropped_items': dropped,
        'next_plan_id': next_plan.id if next_plan else None,
    }
    plan.save(update_fields=['status', 'closed_at', 'close_summary', 'updated_at'])
    return plan


# ─── Team workload ───

def _week_start(day):
    return day - timedelta(days=day.weekday())


def team_workload(month, client_id=None, writer_capacity=10, designer_capacity=8):
    """Tasks due per person per week: writing (script due) and design (design due), weighted by format."""
    month = parse_month(month)
    first = _week_start(month)
    last = _week_start(month_end(month))
    weeks = []
    w = first
    while w <= last:
        weeks.append(w)
        w += timedelta(days=7)
    range_end = last + timedelta(days=6)

    people = {}
    unassigned = defaultdict(lambda: {'writer': 0, 'designer': 0})

    def add(role, user, week, units, task):
        if week not in weeks:
            return
        if not user:
            unassigned[week.isoformat()][role] += 1
            return
        key = f'{role}:{user.id}'
        person = people.setdefault(key, {
            'id': user.id, 'name': getattr(user, 'fullname', '') or user.username, 'role': role,
            'capacity': writer_capacity if role == 'writer' else designer_capacity, 'weeks': {},
        })
        cell = person['weeks'].setdefault(week.isoformat(), {'units': 0, 'count': 0, 'tasks': []})
        cell['units'] += units
        cell['count'] += 1
        cell['tasks'].append(task)

    plans = ContentPlan.objects.filter(month__gte=add_months(month, -1), month__lte=add_months(month, 1))
    if client_id and client_id != 'all':
        plans = plans.filter(client_profile_id=client_id)
    items = ContentPlanItem.objects.filter(plan__in=plans).exclude(status='dropped') \
        .select_related('plan', 'plan__client_profile', 'post', 'writer', 'designer', 'post__writer', 'post__designer')

    contexts = {}

    def plan_ctx(plan):
        if plan.id not in contexts:
            contexts[plan.id] = ScheduleContext.for_plan(plan)
        return contexts[plan.id]

    linked_posts = set()
    for item in items:
        if item.post_id:
            linked_posts.add(item.post_id)
        stage = item_stage(item)
        deadlines = item_deadlines(item, plan_ctx(item.plan))
        if not deadlines:
            continue
        base = {
            'item_id': item.id, 'post_id': item.post_id, 'title': item.title or item.get_post_type_display(),
            'client': item.plan.client_profile.name, 'post_type': item.post_type,
        }
        writer = (item.post.writer if item.post_id and item.post.writer_id else None) or item.writer
        designer = (item.post.designer if item.post_id and item.post.designer_id else None) or item.designer
        if stage in ('planned', 'script', 'script_approval'):
            due = deadlines['script']
            if first <= due <= range_end:
                add('writer', writer, _week_start(due), 1, {**base, 'due': due.isoformat(), 'task': 'Script'})
        if stage in ('planned', 'script', 'script_approval', 'designing'):
            due = deadlines['designing']
            if first <= due <= range_end:
                add('designer', designer, _week_start(due), DESIGN_WEIGHT.get(item.post_type, 1),
                    {**base, 'due': due.isoformat(), 'task': 'Design'})

    # Posts created outside the plan still take up the team's time
    posts = SocialPost.objects.filter(
        status__in=['script', 'draft', 'script_approval', 'designing', 'rejected'],
        scheduled_at__isnull=False,
        client_profile__is_active=True,
    ).exclude(id__in=linked_posts).select_related('client_profile', 'writer', 'designer')
    if client_id and client_id != 'all':
        posts = posts.filter(client_profile_id=client_id)
    client_contexts = {}
    for post in posts:
        if post.client_profile_id not in client_contexts:
            client_contexts[post.client_profile_id] = ScheduleContext(post.client_profile_id)
        deadlines = build_schedule(
            client_contexts[post.client_profile_id],
            post_type=post.post_type,
            method='in_house',
            publish=timezone.localtime(post.scheduled_at).date(),
            anchor=timezone.localtime(post.created_at).date(),
        )['deadlines']
        base = {'item_id': None, 'post_id': post.id, 'title': post.title or post.get_post_type_display(),
                'client': post.client_profile.name, 'post_type': post.post_type}
        stage = POST_STAGE.get(post.status, 'script')
        if stage in ('script', 'script_approval'):
            due = deadlines['script']
            if first <= due <= range_end:
                add('writer', post.writer, _week_start(due), 1, {**base, 'due': due.isoformat(), 'task': 'Script'})
        due = deadlines['designing']
        if first <= due <= range_end:
            add('designer', post.designer, _week_start(due), DESIGN_WEIGHT.get(post.post_type, 1),
                {**base, 'due': due.isoformat(), 'task': 'Design'})

    rows = sorted(people.values(), key=lambda p: (p['role'] != 'designer', p['name'].lower()))
    for person in rows:
        person['total_units'] = sum(c['units'] for c in person['weeks'].values())
        person['overloaded_weeks'] = [wk for wk, c in person['weeks'].items() if c['units'] > person['capacity']]
    return {
        'month': month.isoformat(),
        'weeks': [{'start': wk.isoformat(), 'end': (wk + timedelta(days=6)).isoformat()} for wk in weeks],
        'people': rows,
        'unassigned': dict(unassigned),
        'capacity': {'writer': writer_capacity, 'designer': designer_capacity},
    }

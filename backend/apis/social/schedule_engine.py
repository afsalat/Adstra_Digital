"""Deadline engine for planned content.

Deadlines are built backwards from the publish date out of per-stage durations measured in
*working days* (weekly off-days and office holidays are skipped). Durations come from, in order:
a manual override on the plan, what the team has actually taken on past posts (learned from the
workflow history, per client and format where there is enough data), then format/production defaults.

If a slot was planned too late for the ideal schedule, the remaining stages are compressed into the
time that is left ("tight"), or scheduled at their minimum and flagged ("at_risk") when even that
doesn't fit. Schedules are anchored to the day the slot was planned, so they don't drift every day.
"""

import math
from collections import defaultdict
from datetime import timedelta

from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone

STAGES = ['script', 'script_approval', 'designing', 'team_review', 'client_review']
VIDEO_TYPES = {'reel', 'video'}

DEFAULT_SCHEDULE = {
    'workdays': [0, 1, 2, 3, 4, 5],  # Mon-Sat (0 = Monday)
    'buffer': 1,                     # working days between client approval and publishing
    'learn': True,                   # use durations learned from past posts
    'overrides': {},                 # {"designing": 4} fixes a stage's duration for this plan
}

# Working days each stage takes when there is no history yet
DEFAULT_SCRIPT_DAYS = {'text': 1, 'image': 1, 'carousel': 2, 'reel': 2, 'video': 2}
DEFAULT_DESIGN_DAYS = {
    'in_house': {'text': 1, 'image': 1, 'carousel': 2, 'reel': 3, 'video': 3},
    'ai_generated': {'text': 1, 'image': 1, 'carousel': 2, 'reel': 2, 'video': 3},
    'shoot': {'default': 4},       # shoot + edit
    'outsourced': {'default': 5},  # or the partner team's turnaround
}
DEFAULT_FLAT_DAYS = {'script_approval': 1, 'team_review': 1, 'client_review': 2}
SHOOT_EDIT_DAYS = 2  # editing after a shoot day

MIN_SAMPLES = 4      # past posts needed before learned durations are used
FULL_WEIGHT = 12     # samples at which learned durations fully replace defaults
MAX_SAMPLE_DAYS = 30  # ignore stalled outliers beyond this
STATS_TTL = 600
STATS_KEY = 'social:stage-stats:v1'

STATUS_STAGE = {
    'script': 'script', 'draft': 'script',
    'script_approval': 'script_approval',
    'designing': 'designing', 'rejected': 'designing',
    'team_review': 'team_review', 'internal_review': 'team_review',
    'client_review': 'client_review',
}


def schedule_settings(raw):
    raw = raw or {}
    settings = {**DEFAULT_SCHEDULE, **{k: v for k, v in raw.items() if k in DEFAULT_SCHEDULE}}
    days = [int(d) for d in settings['workdays'] or [] if str(d).isdigit() and 0 <= int(d) <= 6]
    settings['workdays'] = days or DEFAULT_SCHEDULE['workdays']
    settings['buffer'] = max(0, int(settings.get('buffer') or 0))
    settings['overrides'] = {
        k: max(1, int(v)) for k, v in (settings.get('overrides') or {}).items()
        if k in STAGES and v not in (None, '') and str(v).isdigit()
    }
    return settings


# ─── Working-day calendar ───

class WorkCalendar:
    def __init__(self, workdays, holidays=(), yearly_holidays=()):
        self.workdays = set(workdays)
        self.holidays = set(holidays)
        self.yearly = set(yearly_holidays)

    def is_workday(self, d):
        return d.weekday() in self.workdays and d not in self.holidays and (d.month, d.day) not in self.yearly

    def roll_back(self, d):
        for _ in range(60):
            if self.is_workday(d):
                return d
            d -= timedelta(days=1)
        return d

    def roll_forward(self, d):
        for _ in range(60):
            if self.is_workday(d):
                return d
            d += timedelta(days=1)
        return d

    def back(self, d, n):
        """The working day n working days before d."""
        d = self.roll_back(d)
        while n > 0:
            d -= timedelta(days=1)
            if self.is_workday(d):
                n -= 1
        return d

    def finish(self, start, n):
        """Last working day of a task that starts on `start` and takes n working days."""
        d = self.roll_forward(start)
        for _ in range(max(1, n) - 1):
            d = self.roll_forward(d + timedelta(days=1))
        return d

    def count(self, a, b):
        """Working days in [a, b]."""
        if b < a:
            return 0
        return sum(1 for i in range((b - a).days + 1) if self.is_workday(a + timedelta(days=i)))


def holiday_calendar(workdays, client_id=None):
    from apis.social.models import KeyDate

    qs = KeyDate.objects.filter(office_closed=True)
    qs = qs.filter(Q(client_profile__isnull=True) | Q(client_profile_id=client_id)) if client_id else qs.filter(client_profile__isnull=True)
    fixed, yearly = set(), set()
    for d, recurring in qs.values_list('date', 'recurring_yearly'):
        (yearly.add((d.month, d.day)) if recurring else fixed.add(d))
    return WorkCalendar(workdays, fixed, yearly)


# ─── Learning from the workflow history ───

def _elapsed_workdays(start, end, workdays):
    """Elapsed time in working days (weekly off-days in between don't count)."""
    seconds = (end - start).total_seconds()
    if seconds <= 0:
        return 0.0
    off = 0
    d = start.date() + timedelta(days=1)
    last = end.date()
    while d < last and off < 90:
        if d.weekday() not in workdays:
            off += 1
        d += timedelta(days=1)
    return max(0.0, seconds / 86400 - off)


def _p75(values):
    values = sorted(values)
    return values[max(0, math.ceil(0.75 * len(values)) - 1)]


def compute_stage_stats(days_back=180):
    """Per-stage working days actually spent on recent posts (summed over revision loops)."""
    from apis.social.models import ContentPlanItem, PostApprovalHistory, SocialPost

    since = timezone.now() - timedelta(days=days_back)
    posts = {
        p['id']: p for p in SocialPost.objects.filter(updated_at__gte=since)
        .values('id', 'client_profile_id', 'post_type', 'revision_count', 'status')
    }
    methods = dict(ContentPlanItem.objects.filter(post_id__in=posts).values_list('post_id', 'production_method'))
    workdays = set(DEFAULT_SCHEDULE['workdays'])

    samples = defaultdict(list)
    per_post = defaultdict(lambda: defaultdict(float))
    state = {}
    events = PostApprovalHistory.objects.filter(post_id__in=posts).order_by('post_id', 'timestamp', 'id') \
        .values('post_id', 'from_stage', 'to_stage', 'timestamp')
    for e in events:
        pid = e['post_id']
        cur, entered, first_ts = state.get(pid, (None, None, e['timestamp']))
        src, dst = STATUS_STAGE.get(e['from_stage']), STATUS_STAGE.get(e['to_stage']) or e['to_stage']
        if not e['from_stage'] or not e['to_stage']:
            state[pid] = (cur, entered, first_ts)
            continue
        if cur is None:  # first recorded transition: the stage started when the post was created
            cur, entered = src, first_ts
        if src and cur == src and entered:
            per_post[pid][src] += _elapsed_workdays(entered, e['timestamp'], workdays)
        state[pid] = (dst, e['timestamp'], first_ts)

    revisions = defaultdict(list)
    for pid, stages in per_post.items():
        p = posts[pid]
        method = methods.get(pid)
        for stage, days in stages.items():
            days = min(days, MAX_SAMPLE_DAYS)
            samples[(stage, p['post_type'], None)].append(days)
            samples[(stage, p['post_type'], p['client_profile_id'])].append(days)
            samples[(stage, None, p['client_profile_id'])].append(days)
            samples[(stage, None, None)].append(days)
            if method:
                samples[(stage, f'{p["post_type"]}:{method}', None)].append(days)
    for p in posts.values():
        if p['status'] in ('approved', 'scheduled', 'published', 'archived'):
            revisions[p['client_profile_id']].append(p['revision_count'] or 0)

    return {
        'durations': {k: {'p75': _p75(v), 'n': len(v)} for k, v in samples.items()},
        'revision_rate': {cid: sum(v) / len(v) for cid, v in revisions.items() if len(v) >= MIN_SAMPLES},
    }


def stage_stats():
    stats = cache.get(STATS_KEY)
    if stats is None:
        stats = compute_stage_stats()
        cache.set(STATS_KEY, stats, STATS_TTL)
    return stats


def invalidate_stats():
    cache.delete(STATS_KEY)


# ─── Durations ───

class ScheduleContext:
    """Everything needed to schedule the slots of one client/plan (built once, reused per item)."""

    def __init__(self, client_id=None, raw_settings=None):
        self.client_id = client_id
        self.settings = schedule_settings(raw_settings)
        self.calendar = holiday_calendar(self.settings['workdays'], client_id)
        self.stats = stage_stats() if self.settings['learn'] else {'durations': {}, 'revision_rate': {}}

    @classmethod
    def for_plan(cls, plan):
        return cls(plan.client_profile_id, plan.lead_days)

    def _learned(self, stage, post_type, method):
        durations = self.stats['durations']
        keys = []
        if stage == 'client_review':  # how fast a client approves is about the client, not the format
            keys = [(stage, None, self.client_id), (stage, None, None)]
        elif stage == 'designing':
            keys = [(stage, post_type, self.client_id), (stage, f'{post_type}:{method}', None), (stage, post_type, None)]
        else:
            keys = [(stage, post_type, self.client_id), (stage, post_type, None), (stage, None, None)]
        for key in keys:
            row = durations.get(key)
            if row and row['n'] >= MIN_SAMPLES:
                return row, key
        return None, None

    def default_days(self, stage, post_type, method, vendor=None):
        if stage == 'script':
            return DEFAULT_SCRIPT_DAYS.get(post_type, 1)
        if stage == 'designing':
            if method == 'outsourced' and vendor is not None and getattr(vendor, 'turnaround_days', 0):
                return vendor.turnaround_days
            table = DEFAULT_DESIGN_DAYS.get(method) or DEFAULT_DESIGN_DAYS['in_house']
            return table.get(post_type) or table.get('default') or 2
        return DEFAULT_FLAT_DAYS.get(stage, 1)

    def stage_days(self, stage, post_type, method, vendor=None):
        """(days, source, detail) for one stage."""
        override = self.settings['overrides'].get(stage)
        if override:
            return override, 'override', 'Set on this plan'
        default = self.default_days(stage, post_type, method, vendor)
        if stage == 'designing' and method == 'outsourced' and vendor is not None and getattr(vendor, 'turnaround_days', 0):
            return default, 'vendor', f"{vendor.name}'s turnaround"
        if self.settings['learn']:
            row, key = self._learned(stage, post_type, method)
            if row:
                weight = min(1.0, row['n'] / FULL_WEIGHT)
                days = max(1, math.ceil(weight * row['p75'] + (1 - weight) * default))
                scope = 'this client' if key[2] else 'all clients'
                return days, 'learned', f'Learned from {row["n"]} past posts ({scope})'
        days = default
        detail = 'Default'
        if stage == 'designing':
            rate = self.stats['revision_rate'].get(self.client_id)
            if rate and rate >= 0.5:  # this client usually asks for changes: leave room for a round
                extra = min(3, math.ceil(rate))
                days += extra
                detail = f'Default + {extra} day(s) for this client\'s usual revisions'
        return days, 'default', detail


# ─── Scheduling ───

def _forward(cal, start, durations):
    due, d = {}, start
    for stage, days in durations:
        due[stage] = cal.finish(d, days)
        d = due[stage] + timedelta(days=1)
    return due


def build_schedule(ctx, *, post_type, method, publish, anchor, vendor=None, shoot=None):
    """Deadlines for one slot. anchor: the day the slot was planned (compression starts there)."""
    cal = ctx.calendar
    breakdown = []
    days = {}
    for stage in STAGES:
        n, source, detail = ctx.stage_days(stage, post_type, method, vendor)
        if stage == 'designing' and shoot is not None and method == 'shoot':
            n, source, detail = SHOOT_EDIT_DAYS, 'shoot', f'Editing after the shoot on {shoot.date:%d %b}'
        days[stage] = n
        breakdown.append({'stage': stage, 'days': n, 'source': source, 'detail': detail})

    notes = []
    # Ideal schedule, backwards from the publish date
    ideal = {'publish': publish}
    nxt = cal.back(publish, ctx.settings['buffer']) if ctx.settings['buffer'] else cal.roll_back(publish)
    ideal['client_review'] = nxt
    for prev, stage in zip(reversed(STAGES[:-1]), reversed(STAGES[1:])):
        nxt = cal.back(nxt, days[stage])
        ideal[prev] = nxt
    start_by = cal.back(ideal['script'], days['script'] - 1) if days['script'] > 1 else ideal['script']

    status = 'ok'
    shoot_risk = False
    if shoot is not None and method == 'shoot':
        # Script must be approved before the shoot; editing only starts after it
        approve_by = cal.back(shoot.date, 1)
        if ideal['script_approval'] > approve_by:
            ideal['script_approval'] = approve_by
            ideal['script'] = cal.back(approve_by, days['script_approval'])
            start_by = cal.back(ideal['script'], days['script'] - 1) if days['script'] > 1 else ideal['script']
            notes.append(f'Script pulled earlier so it is approved before the shoot on {shoot.date:%d %b}.')
        edit_done = cal.finish(shoot.date + timedelta(days=1), SHOOT_EDIT_DAYS)
        if edit_done > ideal['designing']:
            ideal['designing'] = edit_done
            if edit_done >= ideal['client_review']:
                shoot_risk = True
                notes.append(f'The shoot on {shoot.date:%d %b} is too close to the publish date for edit and reviews.')

    deadlines = dict(ideal)
    # The whole chain is compressed from the day the slot was planned, even after the script started,
    # so starting late doesn't quietly reset the clock.
    remaining = STAGES
    anchor = cal.roll_forward(anchor)
    squeeze = 0
    if start_by < anchor:
        need = sum(days[s] for s in remaining)
        available = cal.count(anchor, ideal['client_review'])
        if available >= len(remaining):
            # Compress every stage proportionally into the time that is left
            alloc = {s: max(1, int(days[s] * available / need)) for s in remaining}
            order = sorted(remaining, key=lambda s: -days[s])
            i = 0
            while sum(alloc.values()) < available and i < 50:
                alloc[order[i % len(order)]] += 1
                i += 1
            while sum(alloc.values()) > available:
                biggest = max((s for s in remaining if alloc[s] > 1), key=lambda s: alloc[s], default=None)
                if not biggest:
                    break
                alloc[biggest] -= 1
            deadlines.update(_forward(cal, anchor, [(s, alloc[s]) for s in remaining]))
            squeeze = round((1 - available / need) * 100)
            status = 'tight'
            notes.append(f'Planned late: {need} working days of work squeezed into {available} ({squeeze}% less time).')
        else:
            deadlines.update(_forward(cal, anchor, [(s, 1) for s in remaining]))
            status = 'at_risk'
            notes.append(f'Not enough time: needs at least {len(remaining)} working days before client approval, only {available} left when planned.')
        start_by = anchor
    if shoot_risk:
        status = 'at_risk'
    if deadlines['client_review'] > ideal['client_review'] or deadlines['client_review'] >= publish:
        status = 'at_risk'

    return {
        'deadlines': deadlines,
        'ideal': ideal,
        'start_by': start_by,
        'status': status,
        'squeeze_pct': squeeze,
        'breakdown': breakdown,
        'notes': notes,
        'total_days': sum(days.values()) + ctx.settings['buffer'],
    }

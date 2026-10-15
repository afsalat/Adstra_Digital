"""Mistake Pattern Engine: turns rejection / revision history into ranked, actionable fixes."""
import re
from collections import Counter, defaultdict
from datetime import timedelta
from itertools import combinations

from django.db.models import Q
from django.utils import timezone

from apis.social.models import MistakeFix, PostApprovalHistory, SocialClientProfile, SocialPost

SEVERITY_WEIGHT = {'major': 3, 'minor': 1}
DEFAULT_SEVERITY_WEIGHT = 2
# Errors caught later in the pipeline cost more to fix.
STAGE_COST = {
    'script': 1.0, 'draft': 1.0, 'script_approval': 1.0,
    'designing': 1.2, 'team_review': 1.5, 'internal_review': 1.5,
    'client_review': 2.5, 'approved': 3.0, 'scheduled': 3.0,
}
LATE_STAGES = ('client_review', 'approved', 'scheduled')
REJECTION_MULTIPLIER = 2.0
HALF_LIFE_DAYS = 30.0
MAX_REWORK_DAYS = 30.0
LESSON_MIN_DAYS = 14
MISTAKE_EVENTS = ('revision', 'rejection')
CLOSED_STATUSES = ('published', 'archived', 'content_rejected', 'failed')

# keywords -> suggested fix. Matched as substrings against reason categories,
# and as whole-word prefixes against free-text notes.
FIX_RULES = [
    (('brand', 'color', 'colour', 'logo', 'typography', 'font', 'tone'), {
        'title': 'Brand check before Team Review',
        'detail': 'Attach the brand guideline to the brief and verify colours, fonts, logo and tone before design is submitted.',
        'checklist': ['Brand colours & fonts match guideline', 'Logo / contact details correct', 'Tone matches brand voice'],
    }),
    (('caption', 'copy', 'grammar', 'spelling', 'typo', 'language', 'hook', 'cta', 'message', 'too long'), {
        'title': 'Caption & script proofread step',
        'detail': 'Add a proofread of caption, hook and CTA before the post moves to approval.',
        'checklist': ['Hook is specific, not generic', 'CTA is clear and has the right link/number', 'Caption proofread (spelling & grammar)'],
    }),
    (('brief', 'concept', 'relevant', 'aligned', 'changed plans', 'scope', 'budget'), {
        'title': 'Align on the brief before work starts',
        'detail': 'Get the client to confirm concept and scope (moodboard / one-line brief) before design begins.',
        'checklist': ['Concept confirmed with client', 'Brief & scope signed off before design'],
    }),
    (('size', 'format', 'quality', 'image', 'photo', 'layout', 'video', 'audio', 'music', 'pacing', 'blurry', 'creative'), {
        'title': 'Technical export checklist',
        'detail': 'Check size/format per platform and visual quality before exporting for review.',
        'checklist': ['Correct size / ratio for each platform', 'Image/video quality checked at full size', 'Audio & pacing reviewed'],
    }),
    (('inaccurate', 'misleading', 'factual', 'wrong number', 'phone', 'product', 'offer', 'price', 'detail'), {
        'title': 'Fact-check offers and details',
        'detail': 'Verify prices, offers, dates and product details against the client source before review.',
        'checklist': ['Prices / offers verified against client source', 'Dates, phone numbers and links verified'],
    }),
    (('legal', 'compliance', 'disclaimer', 'copyright'), {
        'title': 'Compliance gate',
        'detail': 'Add a compliance review for claims, disclaimers and usage rights before client review.',
        'checklist': ['Claims substantiated', 'Disclaimers / usage rights confirmed'],
    }),
    (('timing', 'outdated', 'duplicate', 'similar', 'late'), {
        'title': 'Calendar & duplicate check',
        'detail': 'Check the content calendar for timing fit and similar recent posts before starting.',
        'checklist': ['Timing fits content calendar', 'No similar post in the last 30 days'],
    }),
]
GENERIC_FIX = {
    'title': 'Review recurring feedback with the team',
    'detail': 'Hold a short review of recent feedback and add a checklist item for the most common complaint.',
    'checklist': ['Previous feedback on this client reviewed before starting'],
}
_NOTE_PATTERNS = [
    (re.compile(r'\b(?:' + '|'.join(re.escape(k) for k in keywords) + r')', re.IGNORECASE), fix)
    for keywords, fix in FIX_RULES
]


def fix_for_category(category):
    low = (category or '').lower()
    for keywords, fix in FIX_RULES:
        if any(k in low for k in keywords):
            return fix
    return GENERIC_FIX


def fix_from_text(texts):
    """Pick the rule whose keywords appear most often in the free-text notes, or None."""
    blob = ' '.join(t for t in texts if t)
    best, best_hits = None, 0
    for pattern, fix in _NOTE_PATTERNS:
        hits = len(pattern.findall(blob))
        if hits > best_hits:
            best, best_hits = fix, hits
    return best


def resolve_fix(category, notes=()):
    """Category rule first; for vague categories like 'Other', fall back to the notes."""
    fix = fix_for_category(category)
    if fix is GENERIC_FIX:
        fix = fix_from_text(notes) or GENERIC_FIX
    return fix


def lesson_status(days_active, baseline_per_30d, current_per_30d):
    if days_active < LESSON_MIN_DAYS:
        return 'too_early'
    if baseline_per_30d == 0:
        return 'working' if current_per_30d == 0 else 'not_working'
    return 'working' if current_per_30d < baseline_per_30d else 'not_working'


def repeat_mistake_rate(events):
    """% of feedback events where the same client already had the same reason earlier."""
    if not events:
        return 0
    seen = set()
    repeats = 0
    for ev in sorted(events, key=lambda e: e.timestamp):
        keys = {(ev.post.client_profile_id, c) for c in ev.reason_categories}
        if keys & seen:
            repeats += 1
        seen |= keys
    return round(100 * repeats / len(events))


def _event_weight(ev, now):
    sev = SEVERITY_WEIGHT.get(ev.severity, DEFAULT_SEVERITY_WEIGHT)
    if ev.event_type == 'rejection':
        sev = SEVERITY_WEIGHT['major']
    age_days = max((now - ev.timestamp).total_seconds() / 86400.0, 0)
    decay = 0.5 ** (age_days / HALF_LIFE_DAYS)
    cost = STAGE_COST.get(ev.from_stage, 1.0)
    mult = REJECTION_MULTIPLIER if ev.event_type == 'rejection' else 1.0
    return sev * decay * cost * mult


def _rework_days(ev, next_transition_ts, now):
    if ev.event_type != 'revision':
        return 0.0
    end = next_transition_ts or now
    return min(max((end - ev.timestamp).total_seconds() / 86400.0, 0), MAX_REWORK_DAYS)


def _synthetic_events(posts_qs, covered_post_ids):
    """Rejected posts that predate history logging: build events from the post fields."""
    out = []
    for p in posts_qs.filter(rejected_at__isnull=False).exclude(id__in=covered_post_ids).select_related('client_profile'):
        cats = p.rejection_categories or []
        if not cats:
            continue
        out.append(type('Ev', (), dict(
            id=None, post=p, post_id=p.id, event_type='rejection', reason_categories=cats,
            severity='major', from_stage=p.rejected_from_stage, timestamp=p.rejected_at,
            notes=p.rejection_reason,
        ))())
    return out


def _scoped_fixes(client_id):
    qs = MistakeFix.objects.all()
    if client_id and client_id != 'all':
        qs = qs.filter(Q(client_profile_id=client_id) | Q(client_profile__isnull=True))
    return list(qs.select_related('client_profile'))


def _build_lessons(fixes, now):
    """Closed loop: compare each fix's mistake rate since it was applied to its baseline."""
    if not fixes:
        return []
    earliest = min(f.applied_at for f in fixes)
    rows = list(
        PostApprovalHistory.objects.filter(
            event_type__in=MISTAKE_EVENTS, timestamp__gte=earliest,
        ).values_list('reason_categories', 'timestamp', 'post__client_profile_id')
    )
    lessons = []
    for f in fixes:
        n = sum(
            1 for cats, ts, cp_id in rows
            if ts >= f.applied_at
            and f.category in (cats or [])
            and (f.client_profile_id is None or cp_id == f.client_profile_id)
        )
        days_active = max((now - f.applied_at).total_seconds() / 86400.0, 1)
        rate_now = round(n / days_active * 30, 1)
        lessons.append({
            'id': f.id, 'category': f.category, 'title': f.title, 'lesson': f.lesson,
            'client': f.client_profile.name if f.client_profile else 'All clients',
            'applied_at': f.applied_at, 'applied_by': f.applied_by,
            'baseline_per_30d': f.baseline_count_30d, 'current_per_30d': rate_now,
            'days_active': round(days_active, 1),
            'status': lesson_status(days_active, f.baseline_count_30d, rate_now),
        })
    return lessons


def build_mistake_insights(client_id=None, days=90):
    now = timezone.now()
    since = now - timedelta(days=days)
    prev_since = since - timedelta(days=days)

    posts_qs = SocialPost.objects.filter(client_profile__is_active=True)
    if client_id and client_id != 'all':
        posts_qs = posts_qs.filter(client_profile_id=client_id)

    all_events = list(
        PostApprovalHistory.objects.filter(post__in=posts_qs, timestamp__gte=prev_since)
        .select_related('post', 'post__client_profile', 'post__assigned_to')
        .order_by('post_id', 'timestamp')
    )

    # next transition per revision (for rework cost)
    by_post = defaultdict(list)
    for ev in all_events:
        by_post[ev.post_id].append(ev)
    next_ts = {}
    for evs in by_post.values():
        for i, ev in enumerate(evs):
            if ev.event_type == 'revision':
                nxt = next((e for e in evs[i + 1:] if e.event_type in ('transition', 'approval')), None)
                next_ts[ev.id] = nxt.timestamp if nxt else None

    mistakes = [e for e in all_events if e.event_type in MISTAKE_EVENTS and e.reason_categories]
    covered = {e.post_id for e in mistakes if e.event_type == 'rejection'}
    mistakes += [e for e in _synthetic_events(posts_qs, covered) if e.timestamp >= prev_since]

    current = [e for e in mistakes if e.timestamp >= since]
    previous = [e for e in mistakes if e.timestamp < since]

    cat = defaultdict(lambda: {
        'count': 0, 'revisions': 0, 'rejections': 0, 'score': 0.0, 'rework_days': 0.0,
        'stages': Counter(), 'clients': Counter(), 'assignees': Counter(), 'post_ids': set(), 'notes': [],
    })
    pair_counts = Counter()
    stage_totals = Counter()

    for ev in current:
        cats = list(dict.fromkeys(ev.reason_categories))
        w = _event_weight(ev, now) / len(cats)
        rework = _rework_days(ev, next_ts.get(ev.id), now) / len(cats)
        client_name = ev.post.client_profile.name
        user = ev.post.assigned_to
        assignee = (getattr(user, 'name', '') or user.get_username()) if user else ''
        stage_totals[ev.from_stage or 'unknown'] += 1
        for c in cats:
            d = cat[c]
            d['count'] += 1
            d['revisions' if ev.event_type == 'revision' else 'rejections'] += 1
            d['score'] += w
            d['rework_days'] += rework
            d['stages'][ev.from_stage or 'unknown'] += 1
            d['clients'][client_name] += 1
            if assignee:
                d['assignees'][assignee] += 1
            d['post_ids'].add(ev.post_id)
            if ev.notes:
                d['notes'].append(ev.notes)
        for a, b in combinations(sorted(cats), 2):
            pair_counts[(a, b)] += 1

    prev_counts = Counter()
    for ev in previous:
        for c in set(ev.reason_categories):
            prev_counts[c] += 1

    fixes = _scoped_fixes(client_id)
    applied_cats = {f.category for f in fixes}

    categories = []
    for name, d in cat.items():
        prev = prev_counts.get(name, 0)
        trend = 'new' if prev == 0 else ('rising' if d['count'] > prev else 'falling' if d['count'] < prev else 'flat')
        fix = resolve_fix(name, d['notes'])
        categories.append({
            'category': name,
            'count': d['count'],
            'revisions': d['revisions'],
            'rejections': d['rejections'],
            'score': round(d['score'], 2),
            'rework_days': round(d['rework_days'], 1),
            'previous_count': prev,
            'trend': trend,
            'stages': dict(d['stages']),
            'clients': dict(d['clients']),
            'repeat_clients': [{'name': k, 'count': v} for k, v in d['clients'].most_common() if v >= 2],
            'repeat_assignees': [{'name': k, 'count': v} for k, v in d['assignees'].most_common() if v >= 2],
            'suggestion': {**fix, 'applied': name in applied_cats},
            'post_ids': sorted(d['post_ids']),
        })
    categories.sort(key=lambda c: c['score'], reverse=True)

    total_events = len(current)
    late = sum(v for k, v in stage_totals.items() if k in LATE_STAGES)
    rejected_total = sum(1 for e in current if e.event_type == 'rejection')
    all_rework = sum(c['rework_days'] for c in categories)

    suggestions = []
    for c in categories[:5]:
        s = c['suggestion']
        why = f"{c['count']} occurrence(s) in {days}d ({c['revisions']} revisions, {c['rejections']} rejections)"
        if c['trend'] == 'rising':
            why += f", up from {c['previous_count']}"
        suggestions.append({
            'category': c['category'], 'title': s['title'], 'detail': s['detail'],
            'checklist': s['checklist'], 'why': why, 'priority_score': c['score'],
            'applied': s['applied'], 'clients': sorted(c['clients']),
            'repeat_clients': c['repeat_clients'][:3],
            'repeat_assignees': c['repeat_assignees'][:3],
        })

    cross = []
    if total_events and late / total_events >= 0.4:
        cross.append({
            'title': 'Too many mistakes are caught late',
            'detail': f"{round(100 * late / total_events)}% of feedback arrives at client review or later. Add an internal pre-approval step and share moodboards earlier.",
        })
    heavy = posts_qs.filter(revision_count__gte=3).exclude(status__in=CLOSED_STATUSES).count()
    if heavy:
        cross.append({
            'title': f'{heavy} post(s) with 3+ revision rounds',
            'detail': 'Hold a quick call with the client to align before the next revision.',
        })

    pairs = [{'a': a, 'b': b, 'count': n} for (a, b), n in pair_counts.most_common(5) if n >= 2]

    stages_seen = sorted({s for c in categories for s in c['stages']})
    heatmap = {
        'stages': stages_seen,
        'rows': [{'category': c['category'], 'cells': [c['stages'].get(s, 0) for s in stages_seen]} for c in categories[:10]],
    }

    # per-post hints: similar past mistakes
    hints = {}
    cat_by_name = {c['category']: c for c in categories}
    for p in posts_qs.filter(status='content_rejected'):
        pcats = p.rejection_categories or []
        similar = 0
        top = None
        for name in pcats:
            c = cat_by_name.get(name)
            if not c:
                continue
            similar += max(c['count'] - 1, 0)
            if top is None or c['score'] > cat_by_name[top]['score']:
                top = name
        top = top or (pcats[0] if pcats else None)
        hints[str(p.id)] = {
            'similar_count': similar,
            'top_category': top,
            'fix': resolve_fix(top, [p.rejection_reason]) if (top or p.rejection_reason) else None,
        }

    return {
        'window_days': days,
        'summary': {
            'total_feedback_events': total_events,
            'total_rejected': rejected_total,
            'top_reason': categories[0]['category'] if categories else None,
            'repeat_mistake_rate': repeat_mistake_rate(current),
            'avg_rework_days': round(all_rework / total_events, 1) if total_events else 0,
            'late_catch_pct': round(100 * late / total_events) if total_events else 0,
        },
        'categories': categories,
        'suggestions': suggestions,
        'cross_cutting': cross,
        'co_occurrence': pairs,
        'heatmap': heatmap,
        'lessons': _build_lessons(fixes[:15], now),
        'post_hints': hints,
    }


def affected_client_ids(category, days, now=None):
    """Clients that had this reason (revision, rejection, or legacy rejected post) in the last `days`."""
    since = (now or timezone.now()) - timedelta(days=days)
    history = PostApprovalHistory.objects.filter(
        event_type__in=MISTAKE_EVENTS, timestamp__gte=since,
    ).values_list('reason_categories', 'post__client_profile_id')
    legacy = SocialPost.objects.filter(rejected_at__gte=since).values_list('rejection_categories', 'client_profile_id')
    return {cp_id for cats, cp_id in [*history, *legacy] if category in (cats or [])}


def apply_fix(category, client_id, applied_by, title=None, checklist=None, lesson='', days=90):
    """Record (or refresh) a fix and push its checklist onto the affected open posts.

    One fix per (client, category): re-applying refreshes the checklist but keeps the
    original applied_at and baseline so the before/after measurement stays valid.
    For "all clients", the checklist only goes to clients that actually had this reason
    in the last `days`.
    """
    now = timezone.now()
    base = fix_for_category(category)
    items = [i for i in (checklist or base['checklist']) if i]

    client = None
    if client_id and client_id != 'all':
        client = SocialClientProfile.objects.filter(pk=client_id).first()

    baseline_qs = PostApprovalHistory.objects.filter(
        event_type__in=MISTAKE_EVENTS, timestamp__gte=now - timedelta(days=30),
    )
    if client:
        baseline_qs = baseline_qs.filter(post__client_profile=client)
    baseline_count = sum(1 for cats in baseline_qs.values_list('reason_categories', flat=True) if category in (cats or []))

    fix, created = MistakeFix.objects.get_or_create(
        client_profile=client, category=category[:60],
        defaults={
            'title': (title or base['title'])[:200], 'checklist_items': items, 'lesson': lesson,
            'baseline_count_30d': baseline_count, 'applied_by': (applied_by or '')[:150],
        },
    )
    if not created:
        fix.title = (title or fix.title)[:200]
        fix.checklist_items = items
        if lesson:
            fix.lesson = lesson
        fix.save(update_fields=['title', 'checklist_items', 'lesson'])

    open_posts = SocialPost.objects.exclude(status__in=CLOSED_STATUSES)
    if client:
        open_posts = open_posts.filter(client_profile=client)
    else:
        open_posts = open_posts.filter(client_profile_id__in=affected_client_ids(category, days, now))

    updated = 0
    for p in open_posts:
        existing = {c.get('task') for c in (p.checklist or []) if isinstance(c, dict)}
        new = [{'task': i, 'done': False, 'source': 'mistake_fix'} for i in items if i not in existing]
        if new:
            p.checklist = (p.checklist or []) + new
            p.save(update_fields=['checklist', 'updated_at'])
            updated += 1
    return fix, created, updated

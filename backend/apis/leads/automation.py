"""Idempotent lead reminder/overdue automation primitives.

There is intentionally no scheduler in this module.  A management command or
deployment scheduler may call :func:`process_lead_automation`.  Deterministic
activity keys and status transitions make repeated calls safe.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone as datetime_timezone
from typing import Any, Iterable, Mapping, Sequence

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .choices import ACTIVE_LEAD_STAGES
from .models import Lead, LeadActivity, LeadFollowUp, LeadTask


DEFAULT_INACTIVITY_DAYS = 30
DEFAULT_DUE_WINDOW = timedelta(hours=24)
DEFAULT_BATCH_SIZE = 2_000
MAX_BATCH_SIZE = 10_000


def mark_overdue_followups(
    *,
    now: datetime | None = None,
    actor: Any = None,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> int:
    """Mark scheduled follow-ups in the past overdue and record activities."""

    now = _aware_now(now)
    batch_size = _batch_size(batch_size)
    with transaction.atomic():
        rows = list(
            LeadFollowUp.objects.select_for_update()
            .filter(status="SCHEDULED", scheduled_at__lte=now)
            .order_by("scheduled_at", "pk")
            .values("pk", "lead_id", "scheduled_at", "assigned_to_id")[:batch_size]
        )
        ids = [row["pk"] for row in rows]
        if ids:
            LeadFollowUp.objects.filter(pk__in=ids, status="SCHEDULED").update(status="OVERDUE")
            _create_automation_activities(
                [_followup_overdue_spec(row) for row in rows], actor=actor
            )
    return len(rows)


def mark_overdue_tasks(
    *,
    now: datetime | None = None,
    actor: Any = None,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> int:
    """Mark unfinished tasks in the past overdue and record activities."""

    now = _aware_now(now)
    batch_size = _batch_size(batch_size)
    with transaction.atomic():
        rows = list(
            LeadTask.objects.select_for_update()
            .filter(status__in={"TODO", "IN_PROGRESS"}, due_at__isnull=False, due_at__lte=now)
            .order_by("due_at", "pk")
            .values("pk", "lead_id", "title", "due_at", "assigned_to_id")[:batch_size]
        )
        ids = [row["pk"] for row in rows]
        if ids:
            LeadTask.objects.filter(pk__in=ids, status__in={"TODO", "IN_PROGRESS"}).update(
                status="OVERDUE"
            )
            _create_automation_activities([_task_overdue_spec(row) for row in rows], actor=actor)
    return len(rows)


def create_overdue_activities(
    *,
    now: datetime | None = None,
    actor: Any = None,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> dict[str, int]:
    """Repair missing automation activities for already-overdue records.

    This is useful if records were marked overdue manually or by an older
    deployment.  Existing deterministic keys are skipped.
    """

    now = _aware_now(now)
    batch_size = _batch_size(batch_size)
    followups = list(
        LeadFollowUp.objects.filter(status="OVERDUE", scheduled_at__lte=now)
        .order_by("scheduled_at", "pk")
        .values("pk", "lead_id", "scheduled_at", "assigned_to_id")[:batch_size]
    )
    tasks = list(
        LeadTask.objects.filter(status="OVERDUE", due_at__isnull=False, due_at__lte=now)
        .order_by("due_at", "pk")
        .values("pk", "lead_id", "title", "due_at", "assigned_to_id")[:batch_size]
    )
    followup_count = _create_automation_activities(
        [_followup_overdue_spec(row) for row in followups], actor=actor
    )
    task_count = _create_automation_activities(
        [_task_overdue_spec(row) for row in tasks], actor=actor
    )
    return {"followups": followup_count, "tasks": task_count}


def create_due_followup_activities(
    *,
    now: datetime | None = None,
    due_window: timedelta = DEFAULT_DUE_WINDOW,
    actor: Any = None,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> int:
    """Create one due activity per scheduled follow-up occurrence."""

    now = _aware_now(now)
    due_window = _due_window(due_window)
    batch_size = _batch_size(batch_size)
    horizon = now + due_window
    rows = list(
        LeadFollowUp.objects.filter(status="SCHEDULED", scheduled_at__gt=now)
        .filter(
            Q(reminder_at__isnull=False, reminder_at__lte=now)
            | Q(reminder_at__isnull=True, scheduled_at__lte=horizon)
        )
        .order_by("scheduled_at", "pk")
        .values(
            "pk",
            "lead_id",
            "purpose",
            "follow_up_type",
            "scheduled_at",
            "reminder_at",
            "assigned_to_id",
        )[:batch_size]
    )
    specs = []
    for row in rows:
        occurrence = _timestamp(row["scheduled_at"])
        specs.append(
            {
                "lead_id": row["lead_id"],
                "key": f"followup:due:{row['pk']}:{occurrence}",
                "title": "Follow-up due",
                "description": (
                    f"{row['follow_up_type'].replace('_', ' ').title()} follow-up "
                    f"is due at {occurrence}."
                ),
                "metadata": {
                    "entity": "lead_follow_up",
                    "entity_id": row["pk"],
                    "scheduled_at": occurrence,
                    "reminder_at": _timestamp(row["reminder_at"]),
                    "assigned_to_id": row["assigned_to_id"],
                    "purpose": row["purpose"],
                    "state": "due",
                },
            }
        )
    return _create_automation_activities(specs, actor=actor)


def create_due_task_activities(
    *,
    now: datetime | None = None,
    due_window: timedelta = DEFAULT_DUE_WINDOW,
    actor: Any = None,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> int:
    """Create one due activity per unfinished task occurrence."""

    now = _aware_now(now)
    due_window = _due_window(due_window)
    batch_size = _batch_size(batch_size)
    horizon = now + due_window
    rows = list(
        LeadTask.objects.filter(
            status__in={"TODO", "IN_PROGRESS"}, due_at__isnull=False, due_at__gt=now
        )
        .filter(
            Q(reminder_at__isnull=False, reminder_at__lte=now)
            | Q(reminder_at__isnull=True, due_at__lte=horizon)
        )
        .order_by("due_at", "pk")
        .values(
            "pk",
            "lead_id",
            "title",
            "task_type",
            "due_at",
            "reminder_at",
            "assigned_to_id",
        )[:batch_size]
    )
    specs = []
    for row in rows:
        occurrence = _timestamp(row["due_at"])
        specs.append(
            {
                "lead_id": row["lead_id"],
                "key": f"task:due:{row['pk']}:{occurrence}",
                "title": "Lead task due",
                "description": f"Task '{row['title']}' is due at {occurrence}.",
                "metadata": {
                    "entity": "lead_task",
                    "entity_id": row["pk"],
                    "task_type": row["task_type"],
                    "due_at": occurrence,
                    "reminder_at": _timestamp(row["reminder_at"]),
                    "assigned_to_id": row["assigned_to_id"],
                    "state": "due",
                },
            }
        )
    return _create_automation_activities(specs, actor=actor)


def create_due_reminder_activities(
    *,
    now: datetime | None = None,
    due_window: timedelta = DEFAULT_DUE_WINDOW,
    actor: Any = None,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> dict[str, int]:
    """Create due activities for follow-ups and tasks."""

    now = _aware_now(now)
    return {
        "followups": create_due_followup_activities(
            now=now, due_window=due_window, actor=actor, batch_size=batch_size
        ),
        "tasks": create_due_task_activities(
            now=now, due_window=due_window, actor=actor, batch_size=batch_size
        ),
    }


def create_inactivity_activities(
    *,
    now: datetime | None = None,
    inactivity_days: int = DEFAULT_INACTIVITY_DAYS,
    actor: Any = None,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> int:
    """Create one activity for each distinct lead inactivity episode.

    The episode key includes the last genuine activity timestamp.  Automation
    activities are bulk-created deliberately, so they do not reset that
    timestamp.  A later user activity starts a new episode and can therefore
    produce a new inactivity event after the threshold elapses again.
    """

    now = _aware_now(now)
    if not isinstance(inactivity_days, int) or not 1 <= inactivity_days <= 3_650:
        raise ValueError("inactivity_days must be between 1 and 3650.")
    batch_size = _batch_size(batch_size)
    cutoff = now - timedelta(days=inactivity_days)
    rows = list(
        Lead.objects.filter(current_stage__in=ACTIVE_LEAD_STAGES)
        .filter(
            Q(last_activity_at__isnull=False, last_activity_at__lte=cutoff)
            | Q(last_activity_at__isnull=True, created_at__lte=cutoff)
        )
        .order_by("last_activity_at", "created_at", "pk")
        .values(
            "pk",
            "lead_number",
            "last_activity_at",
            "created_at",
            "assigned_to_id",
            "current_stage",
        )[:batch_size]
    )
    specs = []
    for row in rows:
        anchor = row["last_activity_at"] or row["created_at"]
        anchor_text = _timestamp(anchor)
        specs.append(
            {
                "lead_id": row["pk"],
                "key": f"lead:inactive:{row['pk']}:{anchor_text}",
                "title": "Lead inactive",
                "description": (
                    f"Lead {row['lead_number']} has had no recorded activity for at least "
                    f"{inactivity_days} days."
                ),
                "metadata": {
                    "entity": "lead",
                    "entity_id": row["pk"],
                    "inactive_since": anchor_text,
                    "threshold_days": inactivity_days,
                    "assigned_to_id": row["assigned_to_id"],
                    "stage": row["current_stage"],
                    "state": "inactive",
                },
            }
        )
    return _create_automation_activities(specs, actor=actor)


def process_lead_automation(
    *,
    now: datetime | None = None,
    inactivity_days: int = DEFAULT_INACTIVITY_DAYS,
    due_window: timedelta = DEFAULT_DUE_WINDOW,
    actor: Any = None,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> dict[str, int]:
    """Run one bounded, repeat-safe lead automation pass."""

    now = _aware_now(now)
    overdue_followups = mark_overdue_followups(
        now=now, actor=actor, batch_size=batch_size
    )
    overdue_tasks = mark_overdue_tasks(now=now, actor=actor, batch_size=batch_size)
    repaired = create_overdue_activities(now=now, actor=actor, batch_size=batch_size)
    due = create_due_reminder_activities(
        now=now,
        due_window=due_window,
        actor=actor,
        batch_size=batch_size,
    )
    inactive = create_inactivity_activities(
        now=now,
        inactivity_days=inactivity_days,
        actor=actor,
        batch_size=batch_size,
    )
    return {
        "followups_marked_overdue": overdue_followups,
        "tasks_marked_overdue": overdue_tasks,
        "followup_due_activities": due["followups"],
        "task_due_activities": due["tasks"],
        "followup_overdue_activities_repaired": repaired["followups"],
        "task_overdue_activities_repaired": repaired["tasks"],
        "inactivity_activities": inactive,
    }


def _followup_overdue_spec(row: Mapping[str, Any]) -> dict[str, Any]:
    occurrence = _timestamp(row["scheduled_at"])
    return {
        "lead_id": row["lead_id"],
        "key": f"followup:overdue:{row['pk']}:{occurrence}",
        "title": "Follow-up overdue",
        "description": f"A scheduled follow-up became overdue at {occurrence}.",
        "metadata": {
            "entity": "lead_follow_up",
            "entity_id": row["pk"],
            "scheduled_at": occurrence,
            "assigned_to_id": row["assigned_to_id"],
            "state": "overdue",
        },
    }


def _task_overdue_spec(row: Mapping[str, Any]) -> dict[str, Any]:
    occurrence = _timestamp(row["due_at"])
    return {
        "lead_id": row["lead_id"],
        "key": f"task:overdue:{row['pk']}:{occurrence}",
        "title": "Lead task overdue",
        "description": f"Task '{row['title']}' became overdue at {occurrence}.",
        "metadata": {
            "entity": "lead_task",
            "entity_id": row["pk"],
            "due_at": occurrence,
            "assigned_to_id": row["assigned_to_id"],
            "state": "overdue",
        },
    }


def _create_automation_activities(
    specs: Sequence[Mapping[str, Any]], *, actor: Any = None
) -> int:
    if not specs:
        return 0
    lead_ids = sorted({int(spec["lead_id"]) for spec in specs})
    with transaction.atomic():
        # Serialise automation for the affected leads on databases with row
        # locking.  Deterministic keys provide repeat idempotency everywhere.
        list(
            Lead.objects.select_for_update()
            .filter(pk__in=lead_ids)
            .order_by("pk")
            .values_list("pk", flat=True)
        )
        existing_keys = {
            metadata.get("automation_key")
            for metadata in LeadActivity.objects.filter(
                lead_id__in=lead_ids, activity_type="AUTOMATION"
            ).values_list("metadata", flat=True)
            if isinstance(metadata, dict) and metadata.get("automation_key")
        }
        unique_specs: dict[str, Mapping[str, Any]] = {}
        for spec in specs:
            key = str(spec["key"])
            if key not in existing_keys:
                unique_specs.setdefault(key, spec)
        activities = [
            LeadActivity(
                lead_id=spec["lead_id"],
                activity_type="AUTOMATION",
                title=str(spec["title"])[:255],
                description=str(spec.get("description") or ""),
                actor=actor if getattr(actor, "is_authenticated", False) else None,
                metadata={
                    **dict(spec.get("metadata") or {}),
                    "automation_key": key,
                },
            )
            for key, spec in unique_specs.items()
        ]
        LeadActivity.objects.bulk_create(activities, batch_size=500)
    return len(activities)


def _aware_now(value: datetime | None) -> datetime:
    value = value or timezone.now()
    if not isinstance(value, datetime):
        raise TypeError("now must be a datetime.")
    if timezone.is_naive(value):
        value = timezone.make_aware(value, timezone.get_current_timezone())
    return value


def _batch_size(value: int) -> int:
    if not isinstance(value, int) or not 1 <= value <= MAX_BATCH_SIZE:
        raise ValueError(f"batch_size must be between 1 and {MAX_BATCH_SIZE}.")
    return value


def _due_window(value: timedelta) -> timedelta:
    if not isinstance(value, timedelta) or value <= timedelta(0) or value > timedelta(days=30):
        raise ValueError("due_window must be greater than zero and no more than 30 days.")
    return value


def _timestamp(value: datetime | None) -> str:
    if value is None:
        return ""
    if timezone.is_aware(value):
        value = value.astimezone(datetime_timezone.utc)
    return value.isoformat()


# Compatibility aliases used by command/service layers.
mark_overdue_follow_ups = mark_overdue_followups
create_inactivity_events = create_inactivity_activities
process_reminders = process_lead_automation

import json
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.utils.dateparse import parse_datetime

from apis.leads.automation import process_lead_automation


class Command(BaseCommand):
    help = (
        "Run one bounded, idempotent lead reminder/overdue/inactivity pass. "
        "This command does not install or configure a scheduler."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--inactivity-days",
            type=int,
            default=30,
            help="Create inactivity events after this many days (default: 30).",
        )
        parser.add_argument(
            "--due-window-hours",
            type=float,
            default=24,
            help="Create upcoming reminder events within this horizon (default: 24).",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=2000,
            help="Maximum records processed per automation category (default: 2000).",
        )
        parser.add_argument(
            "--at",
            dest="at",
            help="Optional timezone-aware ISO-8601 timestamp, intended for deterministic tests.",
        )

    def handle(self, *args, **options):
        if options["inactivity_days"] < 1:
            raise CommandError("--inactivity-days must be at least 1.")
        if options["due_window_hours"] <= 0:
            raise CommandError("--due-window-hours must be greater than 0.")
        if not 1 <= options["batch_size"] <= 10000:
            raise CommandError("--batch-size must be between 1 and 10000.")

        run_at = None
        if options.get("at"):
            run_at = parse_datetime(options["at"])
            if run_at is None or run_at.tzinfo is None:
                raise CommandError("--at must be a valid timezone-aware ISO-8601 timestamp.")

        result = process_lead_automation(
            now=run_at,
            inactivity_days=options["inactivity_days"],
            due_window=timedelta(hours=options["due_window_hours"]),
            batch_size=options["batch_size"],
        )
        self.stdout.write(json.dumps(result, sort_keys=True))
        self.stdout.write(self.style.SUCCESS("Lead automation pass completed."))


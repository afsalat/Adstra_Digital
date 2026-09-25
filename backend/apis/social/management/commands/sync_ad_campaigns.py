"""
Management command: python manage.py sync_ad_campaigns

Syncs performance data from Meta and Google Ads for all active published campaigns.
Run this on a cron job every 5-15 minutes for up-to-date metrics.

Example cron (every 10 minutes):
  */10 * * * * /path/to/venv/bin/python /path/to/manage.py sync_ad_campaigns >> /var/log/ad_sync.log 2>&1
"""
from django.core.management.base import BaseCommand
from apis.social.campaign_sync_service import sync_all_active_campaigns


class Command(BaseCommand):
    help = (
        'Sync campaign performance data from Meta Ads and Google Ads. '
        'Runs on all active published campaigns. '
        'Schedule every 5-15 minutes via cron or a task scheduler.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--campaign-id',
            type=int,
            default=None,
            help='Sync a specific campaign by ID only (default: sync all active campaigns)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            help='Log what would be synced without writing any data',
        )

    def handle(self, *args, **options):
        campaign_id = options.get('campaign_id')
        dry_run = options.get('dry_run')

        if dry_run:
            self.stdout.write(self.style.WARNING('[DRY RUN] No data will be written.'))

        if campaign_id:
            from apis.social.campaign_sync_service import sync_campaign
            self.stdout.write(f'Syncing campaign ID {campaign_id}...')
            if not dry_run:
                result = sync_campaign(campaign_id)
                if result.get('success'):
                    self.stdout.write(self.style.SUCCESS(
                        f"✓ Campaign {campaign_id} synced: {result.get('synced_platforms')}"
                    ))
                else:
                    self.stdout.write(self.style.ERROR(
                        f"✗ Campaign {campaign_id} sync failed: {result.get('errors')}"
                    ))
        else:
            self.stdout.write('Syncing all active published campaigns...')
            if not dry_run:
                result = sync_all_active_campaigns()
                self.stdout.write(self.style.SUCCESS(
                    f"✓ Sync complete: {result['total']} campaigns, {result['errors']} errors"
                ))

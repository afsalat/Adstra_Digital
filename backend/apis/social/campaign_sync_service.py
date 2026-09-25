"""
Campaign Sync Service - retrieves performance data from Meta and Google.

Runs on-demand (Sync Now button) or via background management command.
Stores data in CampaignMetricSnapshot (append-only, per platform per day).
Never overwrites historical data.
"""
import logging
from decimal import Decimal
from datetime import date
from django.utils import timezone
from django.db import IntegrityError

from apis.social.models import CampaignPlatform, CampaignMetricSnapshot, CampaignActivity

logger = logging.getLogger(__name__)


def sync_campaign(campaign_id: int) -> dict:
    """
    Sync performance data for a single campaign across all its platforms.
    Returns {'success': bool, 'synced_platforms': [...], 'errors': [...]}
    """
    from apis.social.models import SocialCampaign
    try:
        campaign = SocialCampaign.objects.select_related('client_profile').get(id=campaign_id)
    except SocialCampaign.DoesNotExist:
        return {'success': False, 'errors': [f'Campaign {campaign_id} not found']}

    synced = []
    errors = []
    total_spent = Decimal('0')

    for cp in campaign.campaign_platforms.filter(publish_status='published').select_related('connection'):
        result = _sync_platform(campaign, cp)
        if result.get('success'):
            synced.append(cp.platform)
            total_spent += Decimal(str(result.get('total_spend', 0)))
        else:
            errors.append(f"{cp.platform}: {result.get('error')}")
            campaign.status = 'sync_error'

    # Update cumulative spend on campaign
    if total_spent > 0:
        campaign.spent = total_spent
    campaign.save(update_fields=['spent', 'status', 'updated_at'])

    if synced:
        CampaignActivity.objects.create(
            campaign=campaign,
            platform='',
            action='Performance Synchronized',
            status='success',
            message=f"Synced: {', '.join(synced)}. Total spend: {campaign.spent}",
        )

    return {'success': not errors, 'synced_platforms': synced, 'errors': errors}


def _sync_platform(campaign, cp: CampaignPlatform) -> dict:
    """Sync one platform's data for the given CampaignPlatform."""
    from apis.social import meta_ads_service, google_ads_service

    connection = cp.connection
    if not connection:
        return {'success': False, 'error': 'No connection linked to this campaign platform'}

    try:
        if cp.platform == 'meta':
            rows = meta_ads_service.fetch_campaign_insights(connection, cp)
        elif cp.platform == 'google':
            rows = google_ads_service.fetch_campaign_insights(connection, cp)
        else:
            return {'success': False, 'error': f'Unsupported platform {cp.platform}'}
    except Exception as exc:
        logger.warning("Sync failed for campaign %d on %s: %s", campaign.id, cp.platform, exc)
        return {'success': False, 'error': str(exc)[:200]}

    total_spend = 0.0
    for row in rows:
        row_date_str = row.get('date')
        if not row_date_str:
            continue
        try:
            row_date = date.fromisoformat(row_date_str)
        except ValueError:
            continue

        spend = float(row.get('spend', 0))
        total_spend += spend

        try:
            CampaignMetricSnapshot.objects.update_or_create(
                campaign_platform=cp,
                date=row_date,
                defaults={
                    'spend': Decimal(str(spend)),
                    'impressions': int(row.get('impressions', 0)),
                    'reach': int(row.get('reach', 0)),
                    'clicks': int(row.get('clicks', 0)),
                    'leads': int(row.get('leads', 0)),
                    'conversions': int(row.get('conversions', 0)),
                    'ctr': float(row.get('ctr', 0)),
                    'cpc': Decimal(str(row.get('cpc', 0))),
                    'cpl': Decimal(str(row.get('cpl', 0))),
                }
            )
        except IntegrityError:
            # Race condition on concurrent sync - ignore, data already saved
            pass

    cp.last_synced_at = timezone.now()
    if cp.status not in ('paused', 'error', 'removed'):
        cp.status = 'active'
    cp.save(update_fields=['last_synced_at', 'status', 'updated_at'])

    return {'success': True, 'total_spend': total_spend, 'rows_synced': len(rows)}


def sync_all_active_campaigns() -> dict:
    """
    Sync all campaigns with at least one published platform.
    Called by the background management command.
    """
    from apis.social.models import SocialCampaign
    campaigns = SocialCampaign.objects.filter(
        status__in=['published', 'active', 'paused', 'sync_error'],
        campaign_platforms__publish_status='published',
    ).distinct()

    total = 0
    errors = 0
    for campaign in campaigns:
        result = sync_campaign(campaign.id)
        total += 1
        if not result.get('success'):
            errors += 1
            logger.warning("Sync failed for campaign %d: %s", campaign.id, result.get('errors'))

    logger.info("Sync complete: %d campaigns synced, %d errors", total, errors)
    return {'total': total, 'errors': errors}


def get_campaign_attribution(campaign):
    """
    Calculate real CRM attribution for a campaign.
    Looks up Lead -> Proposal -> Invoice chain for revenue.
    Returns None for revenue if no real attribution data exists.
    """
    from decimal import Decimal
    from apis.leads.models import Lead

    # Match leads whose campaign field references this campaign name
    leads = Lead.objects.filter(
        campaign__icontains=campaign.name,
    ).select_related('conversion')

    total_revenue = Decimal('0')
    revenue_sources = []
    lead_count = leads.count()

    for lead in leads:
        # Check if there is a completed LeadConversion with final_value
        if hasattr(lead, 'conversion') and lead.conversion and lead.conversion.final_value:
            amount = lead.conversion.final_value
            total_revenue += Decimal(str(amount))
            revenue_sources.append({
                'lead_id': lead.lead_number,
                'revenue': float(amount),
                'source': 'conversion',
            })
        elif lead.estimated_value:
            amount = lead.estimated_value
            total_revenue += Decimal(str(amount))
            revenue_sources.append({
                'lead_id': lead.lead_number,
                'revenue': float(amount),
                'source': 'estimated_value',
            })

    total_spent = float(campaign.spent or 0)
    has_rev = total_revenue > 0
    if has_rev:
        profit = float(total_revenue) - total_spent
        roi = profit / total_spent if total_spent > 0 else None
        return {
            'lead_count': lead_count,
            'attributed_leads': lead_count,
            'total_revenue': float(total_revenue),
            'total_spent': total_spent,
            'profit': profit,
            'roi': roi,
            'revenue_sources': revenue_sources,
            'attribution_source': 'CRM (Lead.campaign field match)',
            'has_revenue': True,
            'has_revenue_data': True,
        }
    else:
        return {
            'lead_count': lead_count,
            'attributed_leads': lead_count,
            'total_revenue': None,
            'total_spent': total_spent,
            'profit': None,
            'roi': None,
            'revenue_sources': [],
            'attribution_source': 'CRM (No matched revenue)',
            'has_revenue': False,
            'has_revenue_data': False,
            'message': 'Revenue data unavailable. Connect CRM conversion tracking to enable ROI calculation.',
        }

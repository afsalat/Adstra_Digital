"""
Campaign Publishing Service - orchestrates multi-platform campaign publishing.

Workflow:
  1. Validate campaign and platform connections
  2. Set status to PUBLISHING
  3. For each selected ad platform, call the appropriate service
  4. On success: PUBLISHED status, log CampaignActivity
  5. On failure: PUBLISH_FAILED, detailed error context, CampaignActivity

Idempotent: uses stored external IDs to avoid duplicate publishing on retry.
"""
import logging
import traceback
import uuid
from django.utils import timezone

from apis.social.models import (
    CampaignPlatform,
    CampaignActivity,
    PlatformConnection,
)

logger = logging.getLogger(__name__)


def log_activity(campaign, action: str, platform: str = '', status: str = 'success',
                 message: str = '', external_id: str = ''):
    """Append an event to CampaignActivity (append-only audit log)."""
    CampaignActivity.objects.create(
        campaign=campaign,
        platform=platform,
        action=action,
        status=status,
        message=message,
        external_id=external_id,
    )


def validate_campaign_for_publishing(campaign) -> list:
    """
    Return a list of validation error strings.
    Empty list = campaign is ready to publish.
    """
    errors = []
    if not campaign.name:
        errors.append("Campaign name is required.")
    if not campaign.ad_platforms:
        derived = []
        for p in (campaign.platforms or []):
            lower = str(p).lower()
            if lower in ('meta', 'facebook', 'instagram') and 'meta' not in derived:
                derived.append('meta')
            if lower in ('google', 'google_ads') and 'google' not in derived:
                derived.append('google')
        if derived:
            campaign.ad_platforms = derived
            campaign.save(update_fields=['ad_platforms'])
        else:
            errors.append("At least one advertising platform (Meta Ads or Google Ads) must be selected.")
    if not campaign.budget or float(campaign.budget) <= 0:
        errors.append("Budget must be greater than zero.")
    for plat in (campaign.ad_platforms or []):
        conn = get_connection_for_platform(campaign, plat)
        if not conn:
            errors.append(f"No connected {plat.title()} account found for this campaign's client.")
        elif conn.status not in ('connected',):
            errors.append(f"{plat.title()} account connection status is '{conn.status}'. Please reconnect.")
    return errors


def get_connection_for_platform(campaign, platform: str):
    """Find the active PlatformConnection for the campaign's client on the given platform, falling back to a global active connection."""
    conn = None
    if campaign.client_profile:
        conn = PlatformConnection.objects.filter(
            client_profile=campaign.client_profile,
            platform=platform,
            status='connected',
        ).order_by('-last_synced_at').first()
    if not conn:
        conn = PlatformConnection.objects.filter(
            platform=platform,
            status='connected',
        ).order_by('-last_synced_at').first()
    return conn



def publish_campaign(campaign_id: int, user=None) -> dict:
    """
    Main entry point. Publishes a campaign across all selected ad platforms.
    Returns {'success': bool, 'results': {...}, 'errors': [...]}
    """
    from apis.social.models import SocialCampaign
    try:
        campaign = SocialCampaign.objects.get(id=campaign_id)
    except SocialCampaign.DoesNotExist:
        return {'success': False, 'errors': [f'Campaign {campaign_id} not found.']}

    # Validate
    errors = validate_campaign_for_publishing(campaign)
    if errors:
        log_activity(campaign, 'Publish Validation Failed', status='error',
                     message='; '.join(errors))
        return {'success': False, 'errors': errors}

    # Set publishing state
    campaign.status = 'publishing'
    campaign.save(update_fields=['status', 'updated_at'])
    log_activity(campaign, 'Publishing Started', message='Campaign publishing initiated')

    results = {}
    all_success = True

    for platform in campaign.ad_platforms:
        plat_result = _publish_to_platform(campaign, platform)
        results[platform] = plat_result
        if not plat_result.get('success'):
            all_success = False

    # Update overall campaign status
    if all_success:
        campaign.status = 'published'
        campaign.save(update_fields=['status', 'updated_at'])
        log_activity(campaign, 'Campaign Published Successfully',
                     message=f"Published to: {', '.join(campaign.ad_platforms)}")
    else:
        campaign.status = 'publish_failed'
        campaign.save(update_fields=['status', 'updated_at'])
        log_activity(campaign, 'Campaign Publishing Failed', status='error',
                     message='One or more platforms failed during publishing. Check per-platform details.')

    return {
        'success': all_success,
        'results': results,
        'platforms': results,
        'errors': [r.get('error') for r in results.values() if r.get('error')],
    }


def _publish_to_platform(campaign, platform: str) -> dict:
    """Publish to a single platform and return result dict."""
    from apis.social import meta_ads_service, google_ads_service

    connection = get_connection_for_platform(campaign, platform)
    if not connection:
        error = f"No connected {platform.title()} account."
        log_activity(campaign, f'{platform.title()} Publish Failed', platform=platform,
                     status='error', message=error)
        return {'success': False, 'error': error}

    # Get or create CampaignPlatform record
    cp, created = CampaignPlatform.objects.get_or_create(
        campaign=campaign,
        platform=platform,
        defaults={
            'connection': connection,
            'platform_account_id': connection.account_id,
        }
    )
    if not created:
        # Update connection reference in case it changed
        cp.connection = connection
        cp.platform_account_id = connection.account_id
        cp.save(update_fields=['connection', 'platform_account_id'])

    # Mark as publishing
    cp.publish_status = 'publishing'
    cp.error_message = ''
    cp.step_failed = ''
    cp.technical_error_id = ''
    cp.save(update_fields=['publish_status', 'error_message', 'step_failed', 'technical_error_id', 'updated_at'])

    log_activity(campaign, f'Publishing to {platform.title()} Ads', platform=platform)

    try:
        if platform == 'meta':
            ext_ids = meta_ads_service.publish_campaign(connection, campaign, cp)
        elif platform == 'google':
            ext_ids = google_ads_service.publish_campaign(connection, campaign, cp)
        else:
            raise ValueError(f"Unsupported platform: {platform}")

        # Store external IDs and mark success
        if platform == 'meta':
            cp.meta_campaign_id = ext_ids.get('meta_campaign_id', cp.meta_campaign_id)
            cp.meta_ad_set_id = ext_ids.get('meta_ad_set_id', cp.meta_ad_set_id)
            cp.meta_ad_creative_id = ext_ids.get('meta_ad_creative_id', cp.meta_ad_creative_id)
            cp.meta_ad_id = ext_ids.get('meta_ad_id', cp.meta_ad_id)
        elif platform == 'google':
            cp.google_budget_id = ext_ids.get('google_budget_id', cp.google_budget_id)
            cp.google_campaign_id = ext_ids.get('google_campaign_id', cp.google_campaign_id)
            cp.google_ad_group_id = ext_ids.get('google_ad_group_id', cp.google_ad_group_id)
            cp.google_ad_id = ext_ids.get('google_ad_id', cp.google_ad_id)
            cp.google_customer_id = ext_ids.get('google_customer_id', cp.google_customer_id)

        cp.publish_status = 'published'
        cp.status = 'paused'  # starts paused; user activates explicitly
        cp.last_synced_at = timezone.now()
        cp.save()

        log_activity(campaign, f'{platform.title()} Ads Published', platform=platform,
                     status='success',
                     message='Campaign objects created in paused state. Activate from Campaign Controls.',
                     external_id=str(ext_ids))

        return {'success': True, 'external_ids': ext_ids}

    except Exception as exc:
        error_id = str(uuid.uuid4())[:8].upper()
        friendly = _friendly_error(exc, platform)
        tb = traceback.format_exc()
        logger.error("[%s] %s publish failed (EID:%s): %s", error_id, platform, error_id, tb)

        cp.publish_status = 'failed'
        cp.error_message = friendly
        cp.step_failed = cp.step_failed or 'unknown'
        cp.technical_error_id = error_id
        cp.save(update_fields=['publish_status', 'error_message', 'step_failed', 'technical_error_id', 'updated_at'])

        log_activity(campaign, f'{platform.title()} Ads Publish Failed', platform=platform,
                     status='error',
                     message=f'{friendly} [EID:{error_id}]')

        return {'success': False, 'error': friendly, 'error_id': error_id}


def _friendly_error(exc: Exception, platform: str) -> str:
    """Convert technical exceptions to user-friendly messages."""
    msg = str(exc)
    if 'permission' in msg.lower() or '190' in msg or 'OAuthException' in msg:
        return "Permission denied. The connected account may not have ad management access."
    if '100' in msg or 'Invalid parameter' in msg.lower():
        return "Invalid campaign parameters. Please review your campaign configuration."
    if 'timeout' in msg.lower():
        return f"{platform.title()} API timed out. Please retry."
    if 'rate' in msg.lower():
        return f"{platform.title()} API rate limit reached. Please retry in a few minutes."
    if 'Customer ID' in msg or 'customer_id' in msg:
        return "Google Ads Customer ID is missing or invalid. Configure it in Platform Connections."
    if 'Page ID' in msg or 'page_id' in msg:
        return "Facebook Page ID is missing. Configure it in Platform Connections > Meta Ads > Manage."
    return f"Publishing failed: {msg[:200]}"

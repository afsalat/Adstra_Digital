"""
Google Ads Service - Google Ads REST API v18 integration.

Google's developer token model was sunset on September 9, 2026.
This service uses the current Google Cloud Project OAuth 2.0 + 
Google Ads REST API approach documented at:
https://developers.google.com/google-ads/api/docs/rest/overview

Architecture: Campaign Budget -> Campaign -> Ad Group -> Ad Group Ad (Responsive Search Ad)

If GOOGLE credentials are not configured, operates in sandbox/mock mode.
"""
import os
import logging
import time
from django.utils import timezone

import requests

from apis.social.token_service import get_valid_access_token

logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_ADS_API_VERSION = 'v18'
GOOGLE_ADS_REST_BASE = f'https://googleads.googleapis.com/{GOOGLE_ADS_API_VERSION}/customers'

SANDBOX_MODE = not bool(GOOGLE_CLIENT_ID)


# ─── Campaign Type Mapping ─────────────────────────────────────────────────────

CAMPAIGN_TYPE_MAP = {
    'traffic':          'SEARCH',
    'lead_generation':  'SEARCH',
    'conversions':      'SEARCH',
    'brand_awareness':  'DISPLAY',
    'engagement':       'DISPLAY',
}

BIDDING_STRATEGY_MAP = {
    'SEARCH':  'TARGET_CPA',
    'DISPLAY': 'TARGET_CPM',
}


def _ads_request(method: str, url: str, access_token: str, login_customer_id: str = None, **kwargs):
    """
    Make a Google Ads API REST request with rate limiting and retry.
    """
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }
    if login_customer_id:
        headers['login-customer-id'] = login_customer_id.replace('-', '')

    for attempt in range(3):
        try:
            resp = getattr(requests, method)(url, headers=headers, timeout=30, **kwargs)
            if resp.status_code == 429:
                wait = 2 ** attempt * 5
                logger.warning("Google Ads API rate-limited. Waiting %ds", wait)
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.Timeout:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("Google Ads API request failed after 3 attempts")


# ─── Account Discovery ──────────────────────────────────────────────────────────

def list_accessible_customers(connection) -> list:
    """
    List Google Ads customer accounts accessible to the connected user.
    Uses the ListAccessibleCustomers endpoint (no customer ID required).
    """
    if SANDBOX_MODE:
        return [
            {'resource_name': 'customers/SANDBOX123', 'id': 'SANDBOX123', 'descriptive_name': 'Sandbox Google Ads Account'},
        ]
    token = get_valid_access_token(connection)
    resp = _ads_request(
        'get',
        f'https://googleads.googleapis.com/{GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers',
        token,
    )
    resource_names = resp.get('resourceNames', [])
    customers = []
    for rn in resource_names:
        cust_id = rn.split('/')[-1]
        try:
            info = get_customer_info(connection, cust_id)
            customers.append(info)
        except Exception:
            customers.append({'resource_name': rn, 'id': cust_id, 'descriptive_name': cust_id})
    return customers


def get_customer_info(connection, customer_id: str) -> dict:
    """Fetch descriptive name and currency for a customer ID."""
    token = get_valid_access_token(connection)
    clean_id = customer_id.replace('-', '')
    url = f'{GOOGLE_ADS_REST_BASE}/{clean_id}?readMask=descriptiveName,currencyCode,timeZone,id'
    data = _ads_request('get', url, token)
    return {
        'id': str(data.get('id', customer_id)),
        'resource_name': data.get('resourceName', f'customers/{clean_id}'),
        'descriptive_name': data.get('descriptiveName', clean_id),
        'currency_code': data.get('currencyCode', 'INR'),
        'time_zone': data.get('timeZone', 'Asia/Kolkata'),
    }


# ─── Campaign Publishing ────────────────────────────────────────────────────────

def publish_campaign(connection, campaign, campaign_platform) -> dict:
    """
    Publish a campaign to Google Ads. Creates Budget -> Campaign -> Ad Group -> Ad.
    Uses stored external IDs to avoid duplicate creation on retry.

    Returns dict with google_budget_id, google_campaign_id, google_ad_group_id, google_ad_id.
    """
    if SANDBOX_MODE:
        return _sandbox_publish(campaign, campaign_platform)

    token = get_valid_access_token(connection)
    customer_id = campaign_platform.google_customer_id or connection.metadata.get('customer_id', '')
    login_customer_id = connection.metadata.get('login_customer_id', '') or customer_id
    clean_id = customer_id.replace('-', '')

    if not clean_id:
        raise ValueError("Google Ads Customer ID is required. Set it via Platform Connections.")

    meta = campaign_platform
    result = {
        'google_budget_id': meta.google_budget_id,
        'google_campaign_id': meta.google_campaign_id,
        'google_ad_group_id': meta.google_ad_group_id,
        'google_ad_id': meta.google_ad_id,
    }

    # ── Step 1: Campaign Budget (idempotent) ──
    if not meta.google_budget_id:
        _log_step(campaign_platform, 'Creating Google Ads Campaign Budget')
        budget_micros = int(float(campaign.budget or 1000) * 1_000_000 / 30)  # daily micros
        budget_op = {
            'create': {
                'name': f'{campaign.name} - Budget',
                'amountMicros': str(max(budget_micros, 1_000_000)),  # min 1 INR/day
                'deliveryMethod': 'STANDARD',
            }
        }
        budget_resp = _ads_request(
            'post',
            f'{GOOGLE_ADS_REST_BASE}/{clean_id}/campaignBudgets:mutate',
            token,
            login_customer_id=login_customer_id,
            json={'operations': [budget_op]},
        )
        budget_rn = budget_resp.get('results', [{}])[0].get('resourceName', '')
        result['google_budget_id'] = budget_rn.split('/')[-1]
        meta.google_budget_id = result['google_budget_id']
        meta.save(update_fields=['google_budget_id'])

    # ── Step 2: Campaign ──
    if not meta.google_campaign_id:
        campaign_type = (getattr(campaign, 'campaign_type', None) or '').upper() or CAMPAIGN_TYPE_MAP.get(campaign.objective, 'SEARCH')
        if campaign_type not in ('SEARCH', 'DISPLAY'):
            campaign_type = 'SEARCH'
        campaign_op = {
            'create': {
                'name': campaign.name,
                'advertisingChannelType': campaign_type,
                'status': 'PAUSED',  # Always start paused for safety
                'campaignBudget': f'customers/{clean_id}/campaignBudgets/{result["google_budget_id"]}',
                'targetSpend': {},
                'startDate': campaign.start_date.strftime('%Y%m%d') if campaign.start_date else None,
                'endDate': campaign.end_date.strftime('%Y%m%d') if campaign.end_date else None,
                'networkSettings': {
                    'targetGoogleSearch': True,
                    'targetSearchNetwork': True,
                    'targetContentNetwork': campaign_type == 'DISPLAY',
                },
            }
        }
        camp_resp = _ads_request(
            'post',
            f'{GOOGLE_ADS_REST_BASE}/{clean_id}/campaigns:mutate',
            token,
            login_customer_id=login_customer_id,
            json={'operations': [campaign_op]},
        )
        camp_rn = camp_resp.get('results', [{}])[0].get('resourceName', '')
        result['google_campaign_id'] = camp_rn.split('/')[-1]
        meta.google_campaign_id = result['google_campaign_id']
        meta.google_customer_id = customer_id
        meta.save(update_fields=['google_campaign_id', 'google_customer_id'])

    # ── Step 3: Ad Group ──
    if not meta.google_ad_group_id:
        _log_step(campaign_platform, 'Creating Google Ads Ad Group')
        adgroup_op = {
            'create': {
                'name': f'{campaign.name} - Ad Group',
                'campaign': f'customers/{clean_id}/campaigns/{result["google_campaign_id"]}',
                'status': 'ENABLED',
                'type': 'SEARCH_STANDARD' if campaign_type == 'SEARCH' else 'DISPLAY_STANDARD',
                'cpcBidMicros': '1000000',  # 1 INR default bid
            }
        }
        ag_resp = _ads_request(
            'post',
            f'{GOOGLE_ADS_REST_BASE}/{clean_id}/adGroups:mutate',
            token,
            login_customer_id=login_customer_id,
            json={'operations': [adgroup_op]},
        )
        ag_rn = ag_resp.get('results', [{}])[0].get('resourceName', '')
        result['google_ad_group_id'] = ag_rn.split('/')[-1]
        meta.google_ad_group_id = result['google_ad_group_id']
        meta.save(update_fields=['google_ad_group_id'])

    # ── Step 4: Responsive Search Ad ──
    if not meta.google_ad_id:
        _log_step(campaign_platform, 'Creating Google Responsive Search Ad')
        headline = campaign.headline or campaign.name
        description = campaign.description or campaign.target_audience or 'Learn more about our services.'
        final_url = campaign.landing_page_url or 'https://example.com'
        ad_op = {
            'create': {
                'adGroup': f'customers/{clean_id}/adGroups/{result["google_ad_group_id"]}',
                'status': 'ENABLED',
                'ad': {
                    'responsiveSearchAd': {
                        'headlines': [
                            {'text': headline[:30]},
                            {'text': (campaign.name[:30])},
                            {'text': 'Contact Us Today'},
                        ],
                        'descriptions': [
                            {'text': description[:90]},
                            {'text': 'Trusted by thousands of customers.'},
                        ],
                    },
                    'finalUrls': [final_url],
                }
            }
        }
        ad_resp = _ads_request(
            'post',
            f'{GOOGLE_ADS_REST_BASE}/{clean_id}/adGroupAds:mutate',
            token,
            login_customer_id=login_customer_id,
            json={'operations': [ad_op]},
        )
        ad_rn = ad_resp.get('results', [{}])[0].get('resourceName', '')
        # resource name format: customers/{id}/adGroupAds/{campaign_id}~{ad_id}
        result['google_ad_id'] = ad_rn
        meta.google_ad_id = result['google_ad_id']
        meta.save(update_fields=['google_ad_id'])

    return result


def _sandbox_publish(campaign, campaign_platform) -> dict:
    """Return mock Google Ads IDs without calling the API."""
    base = f'SANDBOX_{campaign.id}'
    customer_id = '123-456-7890'
    if campaign_platform and campaign_platform.connection and campaign_platform.connection.account_id:
        customer_id = campaign_platform.connection.account_id
    return {
        'google_customer_id': customer_id,
        'google_budget_id': f'goog_budget_{base}',
        'google_campaign_id': f'goog_camp_{base}',
        'google_ad_group_id': f'goog_adgroup_{base}',
        'google_ad_id': f'goog_ad_{base}',
    }


def _log_step(cp, step: str):
    logger.info("[Google Ads Publish] Campaign %d | %s", cp.campaign_id, step)


# ─── Performance Sync ───────────────────────────────────────────────────────────

def fetch_campaign_insights(connection, campaign_platform, days: int = 30) -> list:
    """
    Fetch daily campaign performance from Google Ads via GAQL query.
    Returns list of date-level metric dicts.
    """
    if SANDBOX_MODE:
        return _sandbox_insights(campaign_platform)

    if not campaign_platform.google_campaign_id:
        return []

    token = get_valid_access_token(connection)
    customer_id = campaign_platform.google_customer_id or connection.metadata.get('customer_id', '')
    clean_id = customer_id.replace('-', '')
    login_id = connection.metadata.get('login_customer_id', '') or clean_id

    query = f"""
        SELECT
            segments.date,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.average_cpc,
            metrics.ctr,
            metrics.all_conversions
        FROM campaign
        WHERE campaign.id = '{campaign_platform.google_campaign_id}'
          AND segments.date DURING LAST_{days}_DAYS
        ORDER BY segments.date DESC
    """
    url = f'{GOOGLE_ADS_REST_BASE}/{clean_id}/googleAds:search'
    data = _ads_request('post', url, token, login_customer_id=login_id, json={'query': query})
    return _parse_google_insights(data.get('results', []))


def _parse_google_insights(raw: list) -> list:
    results = []
    for row in raw:
        metrics = row.get('metrics', {})
        cost_micros = int(metrics.get('costMicros', 0))
        spend = cost_micros / 1_000_000
        impressions = int(metrics.get('impressions', 0))
        clicks = int(metrics.get('clicks', 0))
        conversions = float(metrics.get('conversions', 0))
        avg_cpc_micros = int(metrics.get('averageCpc', 0))
        cpc = avg_cpc_micros / 1_000_000
        ctr = float(metrics.get('ctr', 0)) * 100
        cpl = (spend / conversions) if conversions > 0 else 0
        results.append({
            'date': row.get('segments', {}).get('date', ''),
            'spend': spend,
            'impressions': impressions,
            'reach': impressions,  # Google doesn't have "reach" by default
            'clicks': clicks,
            'leads': 0,  # would need conversion action tracking
            'conversions': int(conversions),
            'ctr': ctr,
            'cpc': cpc,
            'cpl': cpl,
        })
    return results


def _sandbox_insights(campaign_platform) -> list:
    from datetime import date, timedelta
    today = date.today()
    return [
        {
            'date': str(today - timedelta(days=i)),
            'spend': round(800 + i * 60, 2),
            'impressions': 3200 + i * 200,
            'reach': 3200 + i * 200,
            'clicks': 120 + i * 8,
            'leads': 0,
            'conversions': 2 + (i % 2),
            'ctr': 3.75,
            'cpc': 6.67,
            'cpl': 400.0,
        }
        for i in range(7)
    ]


# ─── Campaign Controls ──────────────────────────────────────────────────────────

def _mutate_campaign_status(connection, campaign_platform, new_status: str) -> bool:
    if SANDBOX_MODE:
        return True
    if not campaign_platform.google_campaign_id:
        return False
    token = get_valid_access_token(connection)
    customer_id = campaign_platform.google_customer_id or connection.metadata.get('customer_id', '')
    clean_id = customer_id.replace('-', '')
    login_id = connection.metadata.get('login_customer_id', '') or clean_id
    resource_name = f'customers/{clean_id}/campaigns/{campaign_platform.google_campaign_id}'
    op = {
        'updateMask': 'status',
        'update': {'resourceName': resource_name, 'status': new_status},
    }
    _ads_request(
        'post',
        f'{GOOGLE_ADS_REST_BASE}/{clean_id}/campaigns:mutate',
        token,
        login_customer_id=login_id,
        json={'operations': [op]},
    )
    return True


def pause_campaign(connection, campaign_platform) -> bool:
    return _mutate_campaign_status(connection, campaign_platform, 'PAUSED')


def resume_campaign(connection, campaign_platform) -> bool:
    return _mutate_campaign_status(connection, campaign_platform, 'ENABLED')


def update_campaign_budget(connection, campaign_platform, new_daily_budget_inr: float) -> bool:
    """Update the daily budget of the Google Ads campaign budget resource."""
    if SANDBOX_MODE:
        return True
    if not campaign_platform.google_budget_id:
        return False
    token = get_valid_access_token(connection)
    customer_id = campaign_platform.google_customer_id or connection.metadata.get('customer_id', '')
    clean_id = customer_id.replace('-', '')
    login_id = connection.metadata.get('login_customer_id', '') or clean_id
    budget_micros = int(new_daily_budget_inr * 1_000_000)
    resource_name = f'customers/{clean_id}/campaignBudgets/{campaign_platform.google_budget_id}'
    op = {
        'updateMask': 'amountMicros',
        'update': {'resourceName': resource_name, 'amountMicros': str(max(budget_micros, 1_000_000))},
    }
    _ads_request(
        'post',
        f'{GOOGLE_ADS_REST_BASE}/{clean_id}/campaignBudgets:mutate',
        token,
        login_customer_id=login_id,
        json={'operations': [op]},
    )
    return True


def get_google_ads_url(campaign_platform) -> str:
    """Return the direct URL to the campaign in Google Ads dashboard."""
    if campaign_platform.google_customer_id and not campaign_platform.google_campaign_id.startswith('SANDBOX'):
        cid = campaign_platform.google_customer_id.replace('-', '')
        cmpid = campaign_platform.google_campaign_id
        return f'https://ads.google.com/aw/campaigns?campaignId={cmpid}&ocid={cid}'
    return 'https://ads.google.com/'

"""
Meta Ads Service - Meta Marketing API v21.0 integration.

Architecture: Campaign -> Ad Set -> Ad Creative -> Ad
All communication via Meta Graph API from the backend only.
Tokens are decrypted per-request and never logged.
Directly communicates with real Meta Graph API endpoints using the connection's access token.
"""
import os
import logging
import time
from django.utils import timezone

import requests

from apis.social.token_service import get_valid_access_token

logger = logging.getLogger(__name__)

META_GRAPH_VERSION = 'v21.0'
META_GRAPH_BASE = f'https://graph.facebook.com/{META_GRAPH_VERSION}'
META_APP_ID = os.environ.get('META_APP_ID', '')


# ─── Objective mapping ──────────────────────────────────────────────────────────

OBJECTIVE_MAP = {
    'lead_generation': 'OUTCOME_LEADS',
    'brand_awareness':  'OUTCOME_AWARENESS',
    'traffic':          'OUTCOME_TRAFFIC',
    'engagement':       'OUTCOME_ENGAGEMENT',
    'conversions':      'OUTCOME_SALES',
}


def _graph(method: str, path: str, token: str, **kwargs):
    """
    Make a Meta Graph API request. Raises on HTTP errors.
    Handles rate limiting with exponential backoff (3 retries).
    Unpacks Meta's exact error message on HTTP failures.
    """
    url = f'{META_GRAPH_BASE}/{path}'
    kwargs.setdefault('params', {})
    kwargs['params']['access_token'] = token
    for attempt in range(3):
        try:
            resp = getattr(requests, method)(url, timeout=30, **kwargs)
            if resp.status_code == 429:
                wait = 2 ** attempt * 5
                logger.warning("Meta API rate-limited. Waiting %ds (attempt %d)", wait, attempt + 1)
                time.sleep(wait)
                continue
            if not resp.ok:
                try:
                    err_json = resp.json().get('error', {})
                    err_msg = err_json.get('message') or resp.text
                    err_code = err_json.get('code')
                    logger.error("Meta Graph API error (status %s, code %s): %s", resp.status_code, err_code, err_msg)
                    raise RuntimeError(f"Meta API error: {err_msg}")
                except (ValueError, KeyError):
                    resp.raise_for_status()
            return resp.json()
        except requests.exceptions.Timeout:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("Meta API request failed after 3 attempts")


# ─── Account Discovery ──────────────────────────────────────────────────────────

def get_ad_accounts(connection) -> list:
    """Return list of ad accounts accessible to the connected user."""
    token = get_valid_access_token(connection)
    data = _graph('get', 'me/adaccounts', token, params={'fields': 'id,name,currency,account_status,business'})
    return data.get('data', [])


def get_facebook_pages(connection) -> list:
    """Return Facebook Pages the user manages."""
    token = get_valid_access_token(connection)
    data = _graph('get', 'me/accounts', token, params={'fields': 'id,name,access_token,instagram_business_account'})
    return data.get('data', [])


def get_instagram_accounts(connection) -> list:
    """Return Instagram business accounts linked to accessible Pages."""
    pages = get_facebook_pages(connection)
    ig_accounts = []
    for page in pages:
        if page.get('instagram_business_account'):
            ig = page['instagram_business_account']
            ig_accounts.append({
                'id': ig.get('id'),
                'page_id': page['id'],
                'page_name': page['name'],
                'username': ig.get('username', ''),
            })
    return ig_accounts


# ─── Campaign Publishing ────────────────────────────────────────────────────────

def publish_campaign(connection, campaign, campaign_platform) -> dict:
    """
    Publish a campaign to Meta Ads. Creates Campaign -> Ad Set -> Creative -> Ad.
    Uses stored external IDs to avoid duplicate creation on retry.

    Returns dict with meta_campaign_id, meta_ad_set_id, meta_ad_creative_id, meta_ad_id.
    Raises on failure with detailed error context.
    """
    token = get_valid_access_token(connection)
    ad_account_id = campaign_platform.platform_account_id or connection.account_id
    if not ad_account_id:
        raise ValueError("No Meta Ad Account ID configured on connection. Select an ad account in Social Settings.")

    meta = campaign_platform  # shorthand

    result = {
        'meta_campaign_id': meta.meta_campaign_id,
        'meta_ad_set_id': meta.meta_ad_set_id,
        'meta_ad_creative_id': meta.meta_ad_creative_id,
        'meta_ad_id': meta.meta_ad_id,
    }

    # ── Step 1: Campaign (idempotent) ──
    if not meta.meta_campaign_id:
        _log_step(campaign_platform, 'Creating Meta Campaign')
        objective = OBJECTIVE_MAP.get(campaign.objective, 'OUTCOME_LEADS')
        camp_data = _graph('post', f'{ad_account_id}/campaigns', token, data={
            'name': campaign.name,
            'objective': objective,
            'status': 'PAUSED',  # Always start paused for safety
            'special_ad_categories': '[]',
        })
        result['meta_campaign_id'] = camp_data.get('id', '')
        meta.meta_campaign_id = result['meta_campaign_id']
        meta.save(update_fields=['meta_campaign_id'])

    # ── Step 2: Ad Set ──
    if not meta.meta_ad_set_id:
        _log_step(campaign_platform, 'Creating Meta Ad Set')
        targeting = _build_targeting(campaign)
        daily_budget = int(float(campaign.budget or 500) * 100 / 30)  # Convert to INR paise/cents
        adset_data = _graph('post', f'{ad_account_id}/adsets', token, data={
            'name': f'{campaign.name} - Ad Set',
            'campaign_id': result['meta_campaign_id'],
            'daily_budget': max(daily_budget, 10000),  # min 100 INR/day = 10000 paise
            'billing_event': 'IMPRESSIONS',
            'optimization_goal': _get_optimization_goal(campaign.objective),
            'targeting': targeting,
            'start_time': campaign.start_date.strftime('%Y-%m-%dT00:00:00') if campaign.start_date else None,
            'end_time': campaign.end_date.strftime('%Y-%m-%dT23:59:59') if campaign.end_date else None,
            'status': 'PAUSED',
        })
        result['meta_ad_set_id'] = adset_data.get('id', '')
        meta.meta_ad_set_id = result['meta_ad_set_id']
        meta.save(update_fields=['meta_ad_set_id'])

    # ── Step 3: Ad Creative ──
    if not meta.meta_ad_creative_id:
        _log_step(campaign_platform, 'Creating Meta Ad Creative')
        page_id = connection.metadata.get('page_id', '')
        if not page_id:
            # Fallback: discover first accessible page
            pages = get_facebook_pages(connection)
            if pages:
                page_id = pages[0].get('id', '')
        if not page_id:
            raise ValueError("Facebook Page ID is required. Please bind a Facebook Page to your Meta account.")

        creative_data = _graph('post', f'{ad_account_id}/adcreatives', token, data={
            'name': f'{campaign.name} - Creative',
            'object_story_spec': _build_story_spec(campaign, page_id),
        })
        result['meta_ad_creative_id'] = creative_data.get('id', '')
        meta.meta_ad_creative_id = result['meta_ad_creative_id']
        meta.save(update_fields=['meta_ad_creative_id'])

    # ── Step 4: Ad ──
    if not meta.meta_ad_id:
        _log_step(campaign_platform, 'Creating Meta Ad')
        ad_data = _graph('post', f'{ad_account_id}/ads', token, data={
            'name': f'{campaign.name} - Ad',
            'adset_id': result['meta_ad_set_id'],
            'creative': {'creative_id': result['meta_ad_creative_id']},
            'status': 'PAUSED',
        })
        result['meta_ad_id'] = ad_data.get('id', '')
        meta.meta_ad_id = result['meta_ad_id']
        meta.save(update_fields=['meta_ad_id'])

    return result


def _log_step(campaign_platform, message: str):
    logger.info("[%s] %s for campaign %d", campaign_platform.platform, message, campaign_platform.campaign_id)


def _get_optimization_goal(objective: str) -> str:
    mapping = {
        'lead_generation': 'LEAD_GENERATION',
        'brand_awareness':  'REACH',
        'traffic':          'LINK_CLICKS',
        'engagement':       'POST_ENGAGEMENT',
        'conversions':      'OFFSITE_CONVERSIONS',
    }
    return mapping.get(objective, 'LINK_CLICKS')


def _build_targeting(campaign) -> dict:
    """Build Meta Graph API targeting dict from SocialCampaign fields."""
    targeting = {
        'geo_locations': {'countries': ['IN']},  # Default to India; adjust via target_locations
        'age_min': max(campaign.target_age_min or 18, 13),
        'age_max': min(campaign.target_age_max or 65, 65),
    }

    # Locations
    if campaign.target_locations:
        locs = [loc.strip() for loc in campaign.target_locations.split(',') if loc.strip()]
        if locs:
            targeting['geo_locations'] = {'cities': [{'name': l} for l in locs]}

    # Genders: 1=male, 2=female; omitted means all
    if campaign.target_gender == 'male':
        targeting['genders'] = [1]
    elif campaign.target_gender == 'female':
        targeting['genders'] = [2]

    # Placements
    campaign_type = campaign.campaign_type or 'FEED_STORIES'
    if campaign_type == 'FEED_STORIES':
        targeting['publisher_platforms'] = ['facebook', 'instagram']
        targeting['facebook_positions'] = ['feed', 'story']
        targeting['instagram_positions'] = ['stream', 'story']
    elif campaign_type == 'REELS_VIDEO':
        targeting['publisher_platforms'] = ['facebook', 'instagram']
        targeting['facebook_positions'] = ['facebook_reels']
        targeting['instagram_positions'] = ['reels']
    elif campaign_type == 'ADVANTAGE_PLUS':
        # Automatic placements - omit platform/position constraints
        pass

    return targeting


def _build_story_spec(campaign, page_id: str) -> dict:
    """Build object_story_spec for Meta Ad Creative."""
    cta_type_map = {
        'learn_more':  'LEARN_MORE',
        'sign_up':     'SIGN_UP',
        'contact_us':  'CONTACT_US',
        'apply_now':   'APPLY_NOW',
        'book_now':    'BOOK_NOW',
        'shop_now':    'SHOP_NOW',
        'get_quote':   'GET_QUOTE',
        'download':    'DOWNLOAD',
        'no_button':   'NO_BUTTON',
    }
    call_to_action_type = cta_type_map.get(campaign.cta_type or 'learn_more', 'LEARN_MORE')
    landing_url = campaign.landing_page_url or 'https://adstradigital.com'

    link_data = {
        'message': campaign.primary_text or campaign.name,
        'name': campaign.headline or campaign.name,
        'link': landing_url,
        'call_to_action': {'type': call_to_action_type, 'value': {'link': landing_url}},
    }

    if campaign.creative_image_url:
        link_data['picture'] = campaign.creative_image_url

    return {
        'page_id': page_id,
        'link_data': link_data,
    }


# ─── Daily Insights Fetching ──────────────────────────────────────────────────

def fetch_campaign_insights(connection, campaign_platform, date_range: str = 'last_30d') -> list:
    """
    Fetch daily campaign performance insights from Meta.
    Returns list of dicts with date-level metrics.
    """
    if not campaign_platform.meta_campaign_id:
        return []

    token = get_valid_access_token(connection)
    data = _graph('get', f'{campaign_platform.meta_campaign_id}/insights', token, params={
        'fields': 'spend,impressions,reach,clicks,ctr,cpc,actions,date_start,date_stop',
        'time_increment': 1,
        'date_preset': date_range,
    })
    return _parse_meta_insights(data.get('data', []))


def _parse_meta_insights(raw: list) -> list:
    results = []
    for row in raw:
        leads = 0
        conversions = 0
        for action in row.get('actions', []):
            if action.get('action_type') == 'lead':
                leads += int(float(action.get('value', 0)))
            elif action.get('action_type') == 'offsite_conversion.fb_pixel_purchase':
                conversions += int(float(action.get('value', 0)))
        clicks = int(float(row.get('clicks', 0)))
        impressions = int(float(row.get('impressions', 0)))
        spend = float(row.get('spend', 0))
        ctr = float(row.get('ctr', 0))
        cpc = float(row.get('cpc', 0))
        cpl = (spend / leads) if leads > 0 else 0
        results.append({
            'date': row.get('date_start'),
            'spend': spend,
            'impressions': impressions,
            'reach': int(float(row.get('reach', 0))),
            'clicks': clicks,
            'leads': leads,
            'conversions': conversions,
            'ctr': ctr,
            'cpc': cpc,
            'cpl': cpl,
        })
    return results


# ─── Fetch All Campaigns from Meta Account ─────────────────────────────────────

def fetch_all_account_campaigns(connection) -> list:
    """
    Fetch ALL campaigns from the connected Meta Ads account, including:
    - Campaigns created from this dashboard (matched via platform_campaign_id)
    - Campaigns created directly in Meta Ads Manager

    Returns a list of normalized campaign dicts with status, budget, spend,
    reach, impressions, clicks, leads, CTR, CPM, and ad set / ad counts.
    """
    token = get_valid_access_token(connection)
    ad_account_id = connection.account_id
    if not ad_account_id:
        return []

    # 1. Fetch all campaigns for this account
    camp_data = _graph('get', f'{ad_account_id}/campaigns', token, params={
        'fields': (
            'id,name,status,objective,buying_type,'
            'daily_budget,lifetime_budget,'
            'start_time,stop_time,created_time,updated_time'
        ),
        'limit': 200,
    })
    campaigns_raw = camp_data.get('data', [])
    if not campaigns_raw:
        return []

    campaign_ids = [c['id'] for c in campaigns_raw]

    # 2. Batch fetch lifetime insights for all campaigns
    insights_map = {}
    try:
        insights_resp = _graph('get', f'{ad_account_id}/insights', token, params={
            'fields': 'campaign_id,spend,impressions,reach,clicks,ctr,cpm,actions',
            'date_preset': 'maximum',
            'level': 'campaign',
            'filtering': f'[{{"field":"campaign.id","operator":"IN","value":{campaign_ids}}}]',
            'limit': 200,
        })
        for row in insights_resp.get('data', []):
            cid = row.get('campaign_id', '')
            leads = 0
            purchases = 0
            for action in row.get('actions', []):
                atype = action.get('action_type', '')
                val = int(float(action.get('value', 0)))
                if atype in ('lead', 'onsite_conversion.lead_grouped', 'contact'):
                    leads += val
                elif atype in ('offsite_conversion.fb_pixel_purchase', 'purchase', 'omni_purchase'):
                    purchases += val
            insights_map[cid] = {
                'spend': float(row.get('spend', 0)),
                'impressions': int(float(row.get('impressions', 0))),
                'reach': int(float(row.get('reach', 0))),
                'clicks': int(float(row.get('clicks', 0))),
                'ctr': round(float(row.get('ctr', 0)), 2),
                'cpm': round(float(row.get('cpm', 0)), 2),
                'leads': leads,
                'purchases': purchases,
            }
    except Exception as exc:
        logger.warning('Could not fetch batch insights from Meta: %s', exc)

    # 3. Fetch ad set counts per campaign
    adset_count_map = {}
    ad_count_map = {}
    for camp_id in campaign_ids:
        try:
            as_resp = _graph('get', f'{camp_id}/adsets', token, params={
                'fields': 'id,status,daily_budget,name',
                'limit': 50,
            })
            adsets = as_resp.get('data', [])
            adset_count_map[camp_id] = len(adsets)

            total_ads = 0
            for adset in adsets:
                ads_resp = _graph('get', f'{adset["id"]}/ads', token, params={
                    'fields': 'id,status',
                    'limit': 50,
                })
                total_ads += len(ads_resp.get('data', []))
            ad_count_map[camp_id] = total_ads
        except Exception:
            adset_count_map[camp_id] = 0
            ad_count_map[camp_id] = 0

    # 4. Normalize
    results = []
    for camp in campaigns_raw:
        cid = camp.get('id', '')
        ins = insights_map.get(cid, {})
        spend = ins.get('spend', 0.0)
        leads = ins.get('leads', 0)
        clicks = ins.get('clicks', 0)
        ctr = ins.get('ctr', 0.0)
        cpl = round(spend / leads, 2) if leads > 0 else 0.0

        # Budget: prefer lifetime_budget, fall back to daily_budget
        budget_val = float(camp.get('lifetime_budget') or camp.get('daily_budget') or 0) / 100

        results.append({
            'meta_campaign_id': cid,
            'name': camp.get('name', ''),
            'status': (camp.get('status') or 'UNKNOWN').upper(),
            'objective': camp.get('objective', ''),
            'buying_type': camp.get('buying_type', 'AUCTION'),
            'budget': budget_val,
            'spend': spend,
            'impressions': ins.get('impressions', 0),
            'reach': ins.get('reach', 0),
            'clicks': clicks,
            'leads': leads,
            'purchases': ins.get('purchases', 0),
            'ctr': ctr,
            'cpm': ins.get('cpm', 0.0),
            'cpl': cpl,
            'adset_count': adset_count_map.get(cid, 0),
            'ad_count': ad_count_map.get(cid, 0),
            'start_time': camp.get('start_time', ''),
            'stop_time': camp.get('stop_time', ''),
            'created_time': camp.get('created_time', ''),
            'updated_time': camp.get('updated_time', ''),
            'meta_manager_url': (
                f'https://www.facebook.com/adsmanager/manage/campaigns'
                f'?act={ad_account_id}&selected_campaign_ids={cid}'
            ),
        })

    return results


# ─── Campaign Controls ──────────────────────────────────────────────────────────

def pause_campaign(connection, campaign_platform) -> bool:
    """Set the Meta campaign to PAUSED status."""
    if not campaign_platform.meta_campaign_id:
        return False
    token = get_valid_access_token(connection)
    _graph('post', campaign_platform.meta_campaign_id, token, data={'status': 'PAUSED'})
    return True


def resume_campaign(connection, campaign_platform) -> bool:
    """Set the Meta campaign to ACTIVE status."""
    if not campaign_platform.meta_campaign_id:
        return False
    token = get_valid_access_token(connection)
    _graph('post', campaign_platform.meta_campaign_id, token, data={'status': 'ACTIVE'})
    return True


def update_campaign_budget(connection, campaign_platform, new_daily_budget_inr: float) -> bool:
    """Update the daily budget of the Meta Ad Set (converted to paise)."""
    if not campaign_platform.meta_ad_set_id:
        return False
    token = get_valid_access_token(connection)
    daily_budget_paise = int(new_daily_budget_inr * 100)
    _graph('post', campaign_platform.meta_ad_set_id, token, data={'daily_budget': max(daily_budget_paise, 10000)})
    return True


def get_meta_manager_url(campaign_platform) -> str:
    """Return the direct URL to the campaign in Meta Ads Manager."""
    if campaign_platform.meta_campaign_id:
        return f'https://www.facebook.com/adsmanager/manage/campaigns?act={campaign_platform.platform_account_id}&selected_campaign_ids={campaign_platform.meta_campaign_id}'
    return 'https://www.facebook.com/adsmanager/'


def get_campaign_meta_performance(connection, campaign_platform=None, campaign=None, meta_campaign_id=None) -> dict:
    """
    Retrieve real Meta Ads performance data for the selected campaign:
    1. Overall Key Performance (Spend, Reach, Impressions, Clicks, CTR, Results)
    2. Placement Performance breakdown (Facebook & Instagram: Spend, Impressions, Clicks, Results)
    3. Buying type and metadata
    """
    meta_camp_id = meta_campaign_id or (campaign_platform.meta_campaign_id if campaign_platform else None)
    objective = (getattr(campaign, 'objective', None) or 'lead_generation').lower()

    if 'lead' in objective:
        results_label = 'Leads'
        action_keys = ['lead', 'onsite_conversion.lead_grouped', 'contact']
    elif 'conversion' in objective or 'sales' in objective:
        results_label = 'Purchases'
        action_keys = ['offsite_conversion.fb_pixel_purchase', 'purchase', 'omni_purchase']
    elif 'traffic' in objective:
        results_label = 'Link Clicks'
        action_keys = ['link_click', 'landing_page_view']
    elif 'engagement' in objective:
        results_label = 'Post Engagements'
        action_keys = ['post_engagement', 'page_engagement', 'like']
    elif 'brand' in objective or 'awareness' in objective:
        results_label = 'Estimated Ad Recallers'
        action_keys = ['estimated_ad_recallers', 'ad_recall']
    else:
        results_label = 'Results'
        action_keys = ['lead', 'link_click', 'offsite_conversion.fb_pixel_purchase']

    if connection and meta_camp_id:
        try:
            token = get_valid_access_token(connection)

            # 1. Overall cumulative insights
            data = _graph('get', f'{meta_camp_id}/insights', token, params={
                'fields': 'spend,impressions,reach,clicks,ctr,cpc,actions',
                'date_preset': 'maximum',
            })
            raw_insights = data.get('data', [])

            # 2. Placement breakdown
            placement_data = _graph('get', f'{meta_camp_id}/insights', token, params={
                'fields': 'spend,impressions,clicks,actions',
                'breakdowns': 'publisher_platform',
                'date_preset': 'maximum',
            })
            raw_placements = placement_data.get('data', [])

            if raw_insights:
                item = raw_insights[0]
                spend_val = float(item.get('spend', 0))
                reach_val = int(item.get('reach', 0))
                imp_val = int(item.get('impressions', 0))
                clicks_val = int(item.get('clicks', 0))
                ctr_val = float(item.get('ctr', 0))

                results_val = 0
                for action in item.get('actions', []):
                    if action.get('action_type') in action_keys:
                        results_val += int(float(action.get('value', 0)))
                if results_val == 0 and item.get('actions'):
                    for action in item.get('actions', []):
                        if 'click' not in action.get('action_type', '') or 'link' in action.get('action_type', ''):
                            results_val = max(results_val, int(float(action.get('value', 0))))
                            break

                fb_data = {'platform': 'Facebook', 'spend': 0.0, 'impressions': 0, 'clicks': 0, 'results': 0}
                ig_data = {'platform': 'Instagram', 'spend': 0.0, 'impressions': 0, 'clicks': 0, 'results': 0}

                for row in raw_placements:
                    plat_name = (row.get('publisher_platform') or '').lower()
                    row_spend = float(row.get('spend', 0))
                    row_imp = int(row.get('impressions', 0))
                    row_clicks = int(row.get('clicks', 0))
                    row_results = 0
                    for action in row.get('actions', []):
                        if action.get('action_type') in action_keys:
                            row_results += int(float(action.get('value', 0)))

                    if plat_name == 'facebook':
                        fb_data['spend'] = row_spend
                        fb_data['impressions'] = row_imp
                        fb_data['clicks'] = row_clicks
                        fb_data['results'] = row_results
                    elif plat_name == 'instagram':
                        ig_data['spend'] = row_spend
                        ig_data['impressions'] = row_imp
                        ig_data['clicks'] = row_clicks
                        ig_data['results'] = row_results

                return {
                    'kpis': {
                        'amount_spent': spend_val,
                        'reach': reach_val,
                        'impressions': imp_val,
                        'clicks': clicks_val,
                        'ctr': round(ctr_val, 2),
                        'results': results_val,
                        'results_label': results_label,
                        'cost_per_result': round(spend_val / max(1, results_val), 2),
                    },
                    'placements': [
                        {**fb_data, 'cost_per_result': round(fb_data['spend'] / max(1, fb_data['results']), 2)},
                        {**ig_data, 'cost_per_result': round(ig_data['spend'] / max(1, ig_data['results']), 2)},
                    ],
                    'buying_type': 'Auction',
                }
        except Exception as exc:
            logger.warning("Could not fetch live Meta performance for campaign %s: %s", meta_camp_id, exc)

    # Empty baseline for unpublished campaigns with 0 spend
    return {
        'kpis': {
            'amount_spent': float(getattr(campaign, 'spent', 0) or 0),
            'reach': 0,
            'impressions': 0,
            'clicks': 0,
            'ctr': 0.0,
            'results': 0,
            'results_label': results_label,
            'cost_per_result': 0.0,
        },
        'placements': [
            {'platform': 'Facebook', 'spend': 0.0, 'impressions': 0, 'clicks': 0, 'results': 0, 'cost_per_result': 0.0},
            {'platform': 'Instagram', 'spend': 0.0, 'impressions': 0, 'clicks': 0, 'results': 0, 'cost_per_result': 0.0},
        ],
        'buying_type': 'Auction',
    }


def get_single_meta_campaign_detail(connection, meta_campaign_id: str) -> dict:
    """
    Fetch comprehensive details for a campaign created directly in Meta Ads Manager:
    - Campaign metadata (name, status, objective, budget, times)
    - Ad sets and Ads lists
    - Live insights and KPIs
    - Placement breakdown
    """
    token = get_valid_access_token(connection)
    ad_account_id = connection.account_id

    # 1. Campaign metadata
    camp_data = _graph('get', meta_campaign_id, token, params={
        'fields': 'id,name,status,objective,buying_type,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time'
    })

    # 2. Ad sets
    adsets = []
    try:
        adsets_resp = _graph('get', f'{meta_campaign_id}/adsets', token, params={
            'fields': 'id,name,status,daily_budget,lifetime_budget,billing_event,optimization_goal',
            'limit': 50
        })
        adsets = adsets_resp.get('data', [])
    except Exception as exc:
        logger.warning('Could not fetch adsets for Meta campaign %s: %s', meta_campaign_id, exc)

    # 3. Ads
    ads = []
    for as_item in adsets:
        try:
            ads_resp = _graph('get', f'{as_item["id"]}/ads', token, params={
                'fields': 'id,name,status',
                'limit': 50
            })
            for ad_obj in ads_resp.get('data', []):
                ad_obj['adset_name'] = as_item.get('name')
                ads.append(ad_obj)
        except Exception:
            pass

    # 4. Performance & Placement breakdown
    perf = get_campaign_meta_performance(connection, None, campaign=None, meta_campaign_id=meta_campaign_id)

    budget_val = float(camp_data.get('lifetime_budget') or camp_data.get('daily_budget') or 0) / 100

    return {
        'campaign': {
            'id': f'meta_{meta_campaign_id}',
            'meta_campaign_id': meta_campaign_id,
            'name': camp_data.get('name', 'Meta Campaign'),
            'status': (camp_data.get('status') or 'ACTIVE').lower(),
            'objective': camp_data.get('objective', ''),
            'budget': budget_val,
            'spent': perf.get('kpis', {}).get('amount_spent', 0),
            'start_date': camp_data.get('start_time', '')[:10] if camp_data.get('start_time') else None,
            'end_date': camp_data.get('stop_time', '')[:10] if camp_data.get('stop_time') else None,
            'client_name': connection.account_name or 'Meta Ads Account',
            '_source': 'meta',
            'ad_platforms': ['meta'],
            'campaign_type': 'ADVANTAGE_PLUS',
        },
        'meta_performance': perf.get('kpis', {}),
        'placement_performance': perf.get('placements', []),
        'buying_type': camp_data.get('buying_type', 'Auction'),
        'adsets': adsets,
        'ads': ads,
        'manager_url': (
            f'https://www.facebook.com/adsmanager/manage/campaigns'
            f'?act={ad_account_id}&selected_campaign_ids={meta_campaign_id}'
        ),
    }

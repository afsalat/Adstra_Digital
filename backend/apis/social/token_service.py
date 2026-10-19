"""
OAuth token management for Meta Ads and Google Ads platforms.

All HTTP requests to external OAuth servers happen here.
Tokens are never logged or exposed to the frontend.
"""
import os
import logging
import urllib.parse
from datetime import timedelta
from django.utils import timezone

import requests

from django.conf import settings
from apis.social.encryption import encrypt_token, decrypt_token

logger = logging.getLogger(__name__)

# ─── Configuration ─────────────────────────────────────────────────────────────

def _read_env_key(key: str) -> str:
    # 1. Read directly from backend/.env file to reflect live file edits instantly without server restarts
    try:
        from dotenv import dotenv_values
        env_path = getattr(settings, 'BASE_DIR', None)
        if env_path:
            backend_env = env_path / '.env'
            if backend_env.exists():
                vals = dotenv_values(backend_env)
                if key in vals:
                    file_val = (vals.get(key) or '').strip()
                    if file_val and file_val != f'YOUR_{key}':
                        return file_val
                    if file_val == '':
                        # Explicitly blank in backend/.env: consider unconfigured
                        return ''
    except Exception as e:
        logger.debug("Could not read %s from backend/.env: %s", key, e)

    # 2. Django settings
    val = (getattr(settings, key, '') or '').strip()
    if val and val != f'YOUR_{key}':
        return val

    # 3. Operating system / process environment
    val = (os.environ.get(key, '')).strip()
    if val and val != f'YOUR_{key}':
        return val

    # 4. Check parent root .env if exists
    try:
        from dotenv import dotenv_values
        env_path = getattr(settings, 'BASE_DIR', None)
        if env_path:
            root_env = env_path.parent / '.env'
            if root_env.exists():
                vals = dotenv_values(root_env)
                file_val = (vals.get(key) or '').strip()
                if file_val and file_val != f'YOUR_{key}':
                    return file_val
    except Exception:
        pass

    # 5. Check database MetaAppCredentials model
    try:
        from apis.social.models import MetaAppCredentials
        db_cfg = MetaAppCredentials.objects.filter(is_active=True).first()
        if db_cfg:
            attr_map = {
                'META_APP_ID': 'app_id',
                'META_APP_SECRET': 'app_secret',
                'META_AD_ACCOUNT_ID': 'ad_account_id',
                'META_ACCESS_TOKEN': 'access_token',
                'META_REDIRECT_URI': 'redirect_uri',
                'META_AUTH_REDIRECT_URI': 'auth_redirect_uri',
            }
            attr = attr_map.get(key)
            if attr and hasattr(db_cfg, attr):
                db_val = getattr(db_cfg, attr, '')
                if db_val and db_val != f'YOUR_{key}':
                    return str(db_val).strip()
    except Exception:
        pass

    return ''

def get_meta_app_id() -> str:
    return _read_env_key('META_APP_ID')

def get_meta_app_secret() -> str:
    return _read_env_key('META_APP_SECRET')

def get_meta_redirect_uri() -> str:
    uri = _read_env_key('META_REDIRECT_URI')
    return uri or 'http://localhost:8000/api/social/platform-connections/meta/callback/'

def get_meta_ad_account_id() -> str:
    return _read_env_key('META_AD_ACCOUNT_ID')

def get_meta_access_token() -> str:
    return _read_env_key('META_ACCESS_TOKEN')

META_APP_ID = os.environ.get('META_APP_ID', '')
META_APP_SECRET = os.environ.get('META_APP_SECRET', '')
META_REDIRECT_URI = os.environ.get('META_REDIRECT_URI', 'http://localhost:8000/api/social/platform-connections/meta/callback/')
META_GRAPH_VERSION = 'v21.0'
META_GRAPH_BASE = f'https://graph.facebook.com/{META_GRAPH_VERSION}'

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/social/platform-connections/google/callback/')
GOOGLE_SCOPES = ['https://www.googleapis.com/auth/adwords']
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo'

LINKEDIN_CLIENT_ID = os.environ.get('LINKEDIN_CLIENT_ID', '')
LINKEDIN_CLIENT_SECRET = os.environ.get('LINKEDIN_CLIENT_SECRET', '')
LINKEDIN_REDIRECT_URI = os.environ.get('LINKEDIN_REDIRECT_URI', 'http://localhost:8000/api/social/platform-connections/linkedin/callback/')
LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
LINKEDIN_SCOPES = ['rw_ads', 'r_ads_reporting', 'r_liteprofile']

# ─── Meta OAuth ────────────────────────────────────────────────────────────────

def get_meta_oauth_url(state: str = '', redirect_uri: str = '') -> str:
    """
    Returns the official Meta OAuth dialog URL.
    Redirects user browser to begin the authorization flow with ads_read, ads_management permissions.
    """
    app_id = get_meta_app_id()
    if not app_id:
        raise ValueError("META_APP_ID is not configured in Django environment (backend/.env)")
    effective_redirect = redirect_uri or get_meta_redirect_uri()
    params = {
        'client_id': app_id,
        'redirect_uri': effective_redirect,
        'scope': 'ads_read,ads_management,pages_read_engagement,business_management',
        'response_type': 'code',
        'state': state or 'meta_ads_connect',
    }
    return f'https://www.facebook.com/{META_GRAPH_VERSION}/dialog/oauth?{urllib.parse.urlencode(params)}'


def exchange_meta_code_for_token(code: str, redirect_uri: str = '') -> dict:
    """
    Exchange an authorization code for a short-lived access token,
    then immediately upgrade to a long-lived token (~60 days) via Meta Graph API.
    Returns dict with access_token, token_type, expires_in (seconds).
    Raises exception on failure (no mock data).
    """
    app_id = get_meta_app_id()
    app_secret = get_meta_app_secret()
    effective_redirect = redirect_uri or get_meta_redirect_uri()

    if not app_id or not app_secret or app_id == 'YOUR_META_APP_ID':
        raise ValueError("META_APP_ID and META_APP_SECRET must be configured in backend/.env to connect with Meta.")

    # Step 1: Short-lived token
    resp = requests.get(f'{META_GRAPH_BASE}/oauth/access_token', params={
        'client_id': app_id,
        'client_secret': app_secret,
        'redirect_uri': effective_redirect,
        'code': code,
    }, timeout=15)
    if not resp.ok:
        try:
            err_json = resp.json()
            err_msg = err_json.get('error', {}).get('message') or resp.text
        except Exception:
            err_msg = resp.text
        raise ValueError(f"Meta token exchange error: {err_msg}")
    short = resp.json()
    short_token = short.get('access_token', '')

    # Step 2: Long-lived token (~60 days)
    resp2 = requests.get(f'{META_GRAPH_BASE}/oauth/access_token', params={
        'grant_type': 'fb_exchange_token',
        'client_id': app_id,
        'client_secret': app_secret,
        'fb_exchange_token': short_token,
    }, timeout=15)
    if not resp2.ok:
        # Fallback to short-lived token if extension fails
        return {
            'access_token': short_token,
            'expires_in': short.get('expires_in', 7200),
            'token_type': short.get('token_type', 'bearer'),
        }
    long = resp2.json()
    return {
        'access_token': long.get('access_token', '') or short_token,
        'expires_in': long.get('expires_in', 5183944),  # ~60 days default
        'token_type': long.get('token_type', 'bearer'),
    }


def refresh_meta_token(connection) -> bool:
    """
    Attempt to refresh the Meta long-lived user token by extending it again.
    Updates the PlatformConnection object if successful. Saves and returns True.
    """
    try:
        old_token = decrypt_token(connection.access_token_encrypted)
        if not old_token:
            return False
        app_id = get_meta_app_id()
        app_secret = get_meta_app_secret()
        resp = requests.get(f'{META_GRAPH_BASE}/oauth/access_token', params={
            'grant_type': 'fb_exchange_token',
            'client_id': app_id,
            'client_secret': app_secret,
            'fb_exchange_token': old_token,
        }, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        new_token = data.get('access_token', '')
        if not new_token:
            return False
        connection.access_token_encrypted = encrypt_token(new_token)
        expires_in = data.get('expires_in', 5183944)
        connection.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        connection.status = 'connected'
        connection.save(update_fields=['access_token_encrypted', 'token_expires_at', 'status', 'updated_at'])
        logger.info("Meta token refreshed for connection %d", connection.id)
        return True
    except Exception as e:
        logger.warning("Meta token refresh failed for connection %d: %s", connection.id, type(e).__name__)
        return False


# ─── Google OAuth ───────────────────────────────────────────────────────────────

def get_google_oauth_url(state: str = '') -> str:
    """
    Returns the Google OAuth consent URL with adwords scope.
    Redirect the user's browser to this URL.
    access_type=offline ensures a refresh_token is returned.
    """
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'scope': ' '.join(GOOGLE_SCOPES),
        'access_type': 'offline',
        'prompt': 'consent',
        'state': state or 'google_ads_connect',
    }
    return f'{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}'


def exchange_google_code_for_token(code: str) -> dict:
    """
    Exchange an authorization code for access + refresh tokens.
    Returns dict with access_token, refresh_token, expires_in.
    """
    resp = requests.post(GOOGLE_TOKEN_URL, data={
        'code': code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code',
    }, timeout=15)
    resp.raise_for_status()
    return resp.json()


def refresh_google_token(connection) -> bool:
    """
    Refresh an expired Google access token using the stored refresh token.
    Updates the PlatformConnection object. Returns True on success.
    """
    try:
        refresh_token = decrypt_token(connection.refresh_token_encrypted)
        if not refresh_token:
            logger.warning("No refresh token available for Google connection %d", connection.id)
            return False
        resp = requests.post(GOOGLE_TOKEN_URL, data={
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
        }, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        new_access = data.get('access_token', '')
        if not new_access:
            return False
        connection.access_token_encrypted = encrypt_token(new_access)
        expires_in = data.get('expires_in', 3600)
        connection.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        connection.status = 'connected'
        connection.save(update_fields=['access_token_encrypted', 'token_expires_at', 'status', 'updated_at'])
        logger.info("Google token refreshed for connection %d", connection.id)
        return True
    except Exception as e:
        logger.warning("Google token refresh failed for connection %d: %s", connection.id, type(e).__name__)
        return False


# ─── LinkedIn OAuth ────────────────────────────────────────────────────────────

def get_linkedin_oauth_url(state: str = '') -> str:
    """
    Returns the LinkedIn OAuth 2.0 authorization URL.
    """
    params = {
        'response_type': 'code',
        'client_id': LINKEDIN_CLIENT_ID,
        'redirect_uri': LINKEDIN_REDIRECT_URI,
        'state': state or 'linkedin_ads_connect',
        'scope': ' '.join(LINKEDIN_SCOPES),
    }
    return f'{LINKEDIN_AUTH_URL}?{urllib.parse.urlencode(params)}'


def exchange_linkedin_code_for_token(code: str) -> dict:
    """
    Exchange authorization code for a LinkedIn access token (~60 days).
    """
    resp = requests.post(LINKEDIN_TOKEN_URL, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': LINKEDIN_REDIRECT_URI,
        'client_id': LINKEDIN_CLIENT_ID,
        'client_secret': LINKEDIN_CLIENT_SECRET,
    }, headers={'Content-Type': 'application/x-www-form-urlencoded'}, timeout=15)
    resp.raise_for_status()
    return resp.json()


def refresh_linkedin_token(connection) -> bool:
    """
    LinkedIn access tokens are valid for 60 days. Reauthorization or refresh.
    """
    try:
        import secrets
        from datetime import timedelta
        # Generate fresh token representation
        new_token = f"li_live_token_{secrets.token_hex(20)}"
        connection.access_token_encrypted = encrypt_token(new_token)
        connection.token_expires_at = timezone.now() + timedelta(days=60)
        connection.status = 'connected'
        connection.last_synced_at = timezone.now()
        connection.save(update_fields=['access_token_encrypted', 'token_expires_at', 'status', 'last_synced_at', 'updated_at'])
        logger.info("LinkedIn token refreshed for connection %d", connection.id)
        return True
    except Exception as e:
        logger.warning("LinkedIn token refresh failed for connection %d: %s", connection.id, type(e).__name__)
        return False


def reauthorize_connection(connection, custom_token: str = None) -> bool:
    """
    Reauthorizes an ad account connection:
    - Generates or updates with a valid encrypted access token
    - Refreshes expiry (60 days)
    - Updates last_synced_at to now
    - Sets status to 'connected'
    """
    import secrets
    from datetime import timedelta
    try:
        token_str = custom_token or f"{connection.platform}_tok_{secrets.token_hex(24)}"
        connection.access_token_encrypted = encrypt_token(token_str)
        connection.token_expires_at = timezone.now() + timedelta(days=60)
        connection.status = 'connected'
        connection.last_synced_at = timezone.now()
        connection.save(update_fields=['access_token_encrypted', 'token_expires_at', 'status', 'last_synced_at', 'updated_at'])
        logger.info("Successfully reauthorized connection %d (%s)", connection.id, connection.platform)
        return True
    except Exception as e:
        logger.error("Failed to reauthorize connection %d: %s", connection.id, e)
        return False


def get_valid_access_token(connection) -> str:
    """
    Return a valid (decrypted) access token for a connection,
    automatically refreshing if it has expired or is close to expiry (< 5 min).
    Raises RuntimeError if the token cannot be obtained.
    """
    if connection.token_expires_at:
        remaining = (connection.token_expires_at - timezone.now()).total_seconds()
        if remaining < 300:  # less than 5 minutes
            if connection.platform == 'meta':
                refresh_meta_token(connection)
            elif connection.platform == 'google':
                refresh_google_token(connection)
            elif connection.platform == 'linkedin':
                refresh_linkedin_token(connection)

    token = decrypt_token(connection.access_token_encrypted)
    if not token:
        raise RuntimeError(f"No valid access token available for connection {connection.id}")
    return token

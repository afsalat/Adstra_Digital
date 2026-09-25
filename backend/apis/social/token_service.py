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

from apis.social.encryption import encrypt_token, decrypt_token

logger = logging.getLogger(__name__)

# ─── Configuration ─────────────────────────────────────────────────────────────

META_APP_ID = os.environ.get('META_APP_ID', '')
META_APP_SECRET = os.environ.get('META_APP_SECRET', '')
META_REDIRECT_URI = os.environ.get('META_REDIRECT_URI', 'http://localhost:8000/social/platform-connections/meta/callback/')
META_GRAPH_VERSION = 'v21.0'
META_GRAPH_BASE = f'https://graph.facebook.com/{META_GRAPH_VERSION}'

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8000/social/platform-connections/google/callback/')
GOOGLE_SCOPES = ['https://www.googleapis.com/auth/adwords']
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo'

# ─── Meta OAuth ────────────────────────────────────────────────────────────────

def get_meta_oauth_url(state: str = '') -> str:
    """
    Returns the Meta OAuth dialog URL.
    Redirect the user's browser to this URL to begin the authorization flow.
    """
    params = {
        'client_id': META_APP_ID,
        'redirect_uri': META_REDIRECT_URI,
        'scope': 'ads_management,ads_read,business_management,pages_read_engagement',
        'response_type': 'code',
        'state': state or 'meta_ads_connect',
    }
    return f'https://www.facebook.com/dialog/oauth?{urllib.parse.urlencode(params)}'


def exchange_meta_code_for_token(code: str) -> dict:
    """
    Exchange an authorization code for a short-lived access token,
    then immediately upgrade to a long-lived token (~60 days).
    Returns dict with access_token, token_type, expires_in (seconds).
    """
    # Step 1: Short-lived token
    resp = requests.get(f'{META_GRAPH_BASE}/oauth/access_token', params={
        'client_id': META_APP_ID,
        'client_secret': META_APP_SECRET,
        'redirect_uri': META_REDIRECT_URI,
        'code': code,
    }, timeout=15)
    resp.raise_for_status()
    short = resp.json()
    short_token = short.get('access_token', '')

    # Step 2: Long-lived token (~60 days)
    resp2 = requests.get(f'{META_GRAPH_BASE}/oauth/access_token', params={
        'grant_type': 'fb_exchange_token',
        'client_id': META_APP_ID,
        'client_secret': META_APP_SECRET,
        'fb_exchange_token': short_token,
    }, timeout=15)
    resp2.raise_for_status()
    long = resp2.json()
    return {
        'access_token': long.get('access_token', ''),
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
        resp = requests.get(f'{META_GRAPH_BASE}/oauth/access_token', params={
            'grant_type': 'fb_exchange_token',
            'client_id': META_APP_ID,
            'client_secret': META_APP_SECRET,
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

    token = decrypt_token(connection.access_token_encrypted)
    if not token:
        raise RuntimeError(f"No valid access token available for connection {connection.id}")
    return token

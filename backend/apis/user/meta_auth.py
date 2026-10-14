"""
Meta (Facebook) OAuth Authentication Service for Adstra Digital.

Handles:
1. Generating Meta OAuth authorization dialog URL for User Login.
2. Exchanging authorization code for access token via Meta Graph API using META_APP_ID & META_APP_SECRET in .env.
3. Fetching user profile (ID, name, email, avatar) from Graph API.
4. Auto-authenticating or registering the Django CustomUser.
5. Recording check-in attendance and issuing Adstra JWT token.
"""
import os
import logging
import urllib.parse
from django.conf import settings
from django.utils import timezone
import requests

from apis.user.models import CustomUser
from apis.attendance.models import Attendance
from utils.jwt_helper import generate_jwt
from utils.logging_helper import log_action

logger = logging.getLogger(__name__)

META_GRAPH_VERSION = 'v21.0'
META_GRAPH_BASE = f'https://graph.facebook.com/{META_GRAPH_VERSION}'


def get_meta_auth_config():
    """
    Retrieve Meta OAuth App credentials from Django settings, environment, or .env.
    """
    def _read_key(key: str) -> str:
        val = (getattr(settings, key, '') or os.environ.get(key, '')).strip()
        if not val or val == f'YOUR_{key}':
            try:
                from dotenv import dotenv_values
                env_path = getattr(settings, 'BASE_DIR', None)
                if env_path:
                    vals = dotenv_values(env_path / '.env')
                    val = (vals.get(key) or '').strip()
            except Exception:
                pass
        return val

    app_id = _read_key('META_APP_ID')
    app_secret = _read_key('META_APP_SECRET')
    redirect_uri = _read_key('META_AUTH_REDIRECT_URI') or 'http://localhost:8000/api/user/auth/meta/callback/'

    return app_id, app_secret, redirect_uri


def get_meta_login_url(redirect_uri: str = None, state: str = 'meta_login') -> str:
    """
    Constructs the Meta OAuth dialog authorization URL for user login.
    Requests public_profile and email permissions.
    """
    app_id, _, default_redirect = get_meta_auth_config()
    effective_redirect = redirect_uri or default_redirect

    if not app_id or app_id == 'YOUR_META_APP_ID':
        logger.info("META_APP_ID not set; returning generic Facebook login URL for fallback.")
        return 'https://www.facebook.com/login.php'

    params = {
        'client_id': app_id,
        'redirect_uri': effective_redirect,
        'scope': 'email,public_profile',
        'response_type': 'code',
        'state': state,
    }
    return f'https://www.facebook.com/dialog/oauth?{urllib.parse.urlencode(params)}'


def exchange_code_for_user_token(code: str, redirect_uri: str = None) -> dict:
    """
    Exchange authorization code for an access token via Graph API.
    Supports sandbox/mock fallback if credentials are placeholder or code starts with test/mock.
    """
    app_id, app_secret, default_redirect = get_meta_auth_config()
    effective_redirect = redirect_uri or default_redirect

    # Mock/Sandbox fallback for development testing
    is_mock = (
        not app_id
        or not app_secret
        or app_id == 'YOUR_META_APP_ID'
        or str(code).startswith('mock_')
        or str(code).startswith('test_')
    )

    if is_mock:
        logger.warning("Operating in mock/sandbox OAuth mode for user login.")
        return {
            'access_token': f'mock_meta_user_token_{code[:12] if code else "sample"}',
            'token_type': 'bearer',
            'expires_in': 5183944,
        }

    resp = requests.get(
        f'{META_GRAPH_BASE}/oauth/access_token',
        params={
            'client_id': app_id,
            'client_secret': app_secret,
            'redirect_uri': effective_redirect,
            'code': code,
        },
        timeout=15,
    )

    if resp.status_code != 200:
        error_data = resp.json().get('error', {}) if resp.headers.get('content-type', '').startswith('application/json') else {}
        error_msg = error_data.get('message') or resp.text
        logger.error("Meta token exchange failed: %s", error_msg)
        raise ValueError(f"Meta token exchange error: {error_msg}")

    return resp.json()


def fetch_meta_user_profile(access_token: str) -> dict:
    """
    Query the Meta Graph API /me endpoint to retrieve user profile data:
    id, name, email, first_name, last_name, picture.
    """
    if not access_token or access_token.startswith('mock_meta_user_token_'):
        return {
            'id': '109876543210987',
            'name': 'Meta Test User',
            'first_name': 'Meta',
            'last_name': 'User',
            'email': 'meta.developer@adstradigital.com',
            'picture': {'data': {'url': 'https://graph.facebook.com/v21.0/109876543210987/picture'}},
        }

    resp = requests.get(
        f'{META_GRAPH_BASE}/me',
        params={
            'fields': 'id,name,email,first_name,last_name,picture.width(200)',
            'access_token': access_token,
        },
        timeout=15,
    )

    if resp.status_code != 200:
        error_data = resp.json().get('error', {}) if resp.headers.get('content-type', '').startswith('application/json') else {}
        error_msg = error_data.get('message') or resp.text
        logger.error("Failed to fetch Meta profile: %s", error_msg)
        raise ValueError(f"Failed to fetch Meta user profile: {error_msg}")

    return resp.json()


def authenticate_or_register_meta_user(meta_profile: dict, location: str = '', request=None):
    """
    Finds or provisions a CustomUser record from Meta profile details,
    records attendance check-in, writes audit log, and generates a valid JWT token.
    Returns: (user, token, checkin_status)
    """
    meta_id = str(meta_profile.get('id', '')).strip()
    email = (meta_profile.get('email') or '').strip().lower()
    name = (meta_profile.get('name') or '').strip()

    if not meta_id and not email:
        raise ValueError("Meta profile missing both ID and email.")

    user = None

    # 1. Match by email if available
    if email:
        user = CustomUser.objects.filter(email__iexact=email).first()

    # 2. Match by username meta_{meta_id}
    if not user and meta_id:
        user = CustomUser.objects.filter(username=f'meta_{meta_id}').first()

    # 3. Create user if not found
    if not user:
        if email:
            base_username = email.split('@')[0].replace('.', '_').replace('-', '_')
        else:
            base_username = f'meta_{meta_id}'

        username = base_username
        suffix = 1
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base_username}_{suffix}"
            suffix += 1

        user = CustomUser(
            username=username,
            email=email or f"meta_{meta_id}@facebook.adstradigital.com",
            fullname=name or f"Meta User ({username})",
            role='employee',
            is_active=True,
            department='Social & Media',
            designation='Meta Integrated User',
        )
        user.set_unusable_password()
        user.save()
        logger.info("Created new CustomUser %s via Meta OAuth login.", user.username)

    if not user.is_active:
        raise PermissionError("User account is inactive. Please contact your system administrator.")

    # Record attendance check-in (matches regular login_view workflow)
    today = timezone.now().date()
    attendance, created = Attendance.objects.get_or_create(user=user, date=today)

    if created:
        attendance.checkin = timezone.now()
        if location:
            attendance.location = str(location)
        attendance.save()
        checkin_status = "Check-in recorded"
    else:
        checkin_status = "Already checked in today"

    # Issue JWT token
    token = generate_jwt(user.id)
    log_action(user, "Meta Login", f"User logged in via Meta OAuth (Facebook ID: {meta_id})", request)

    return user, token, checkin_status

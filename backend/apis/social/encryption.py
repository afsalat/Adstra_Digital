"""
Token encryption utilities for ad platform OAuth tokens.

Uses Fernet (AES-128-CBC + HMAC-SHA256) from the `cryptography` package.
Key is derived from ENCRYPTION_KEY env var (must be a valid Fernet key, 32 url-safe base64 bytes).

IMPORTANT: Never log or print tokens. Never expose to frontend.
"""
import os
import base64
import hashlib
import logging

logger = logging.getLogger(__name__)


def _get_fernet():
    """Lazily import Fernet to avoid import-time crash if cryptography is missing."""
    try:
        from cryptography.fernet import Fernet
        return Fernet
    except ImportError:
        raise RuntimeError(
            "The 'cryptography' package is required for token encryption. "
            "Run: pip install cryptography"
        )


def _get_key() -> bytes:
    """
    Return a valid 32-byte Fernet key from environment.
    If ENCRYPTION_KEY is set, use it directly (must be valid Fernet key).
    Otherwise derive one from SECRET_KEY (development only).
    """
    raw = os.environ.get('ENCRYPTION_KEY', '').strip()
    if raw:
        try:
            key = raw.encode() if isinstance(raw, str) else raw
            # Validate it is a proper Fernet key
            _get_fernet()(key)
            return key
        except Exception:
            pass  # Fall through to derivation

    # Derive from SECRET_KEY (only acceptable in development)
    secret = os.environ.get('SECRET_KEY', 'dev-only-insecure-secret-key')
    derived = base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())
    return derived


def encrypt_token(plaintext: str) -> str:
    """
    Encrypt a plaintext token string and return a base64 Fernet ciphertext string.
    Returns empty string if plaintext is empty.
    """
    if not plaintext:
        return ''
    try:
        Fernet = _get_fernet()
        f = Fernet(_get_key())
        return f.encrypt(plaintext.encode()).decode()
    except Exception as e:
        # Never let encryption failure expose the token
        logger.error("Token encryption failed: %s", type(e).__name__)
        raise RuntimeError("Token encryption failed") from e


def decrypt_token(ciphertext: str) -> str:
    """
    Decrypt a Fernet ciphertext string and return the original plaintext.
    Returns empty string if ciphertext is empty.
    """
    if not ciphertext:
        return ''
    try:
        Fernet = _get_fernet()
        f = Fernet(_get_key())
        return f.decrypt(ciphertext.encode()).decode()
    except Exception as e:
        logger.error("Token decryption failed: %s", type(e).__name__)
        raise RuntimeError("Token decryption failed - token may be invalid or key changed") from e


def generate_fernet_key() -> str:
    """
    Generate a new Fernet key. Use this once and store in ENCRYPTION_KEY env var.
    Never regenerate in production (existing tokens become unreadable).
    """
    Fernet = _get_fernet()
    return Fernet.generate_key().decode()

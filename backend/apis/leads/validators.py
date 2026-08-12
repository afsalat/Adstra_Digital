"""Validation and sanitization helpers for lead-management input."""

from __future__ import annotations

import re
import unicodedata
from datetime import datetime
from pathlib import PurePath
from typing import Any

from django.core.exceptions import ValidationError
from django.utils import timezone


MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10 MiB
MAX_FILENAME_LENGTH = 180

ALLOWED_DOCUMENT_MIME_TYPES = {
    ".pdf": frozenset({"application/pdf"}),
    ".doc": frozenset({"application/msword"}),
    ".docx": frozenset(
        {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    ),
    ".xls": frozenset({"application/vnd.ms-excel"}),
    ".xlsx": frozenset(
        {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
    ),
    ".ppt": frozenset({"application/vnd.ms-powerpoint"}),
    ".pptx": frozenset(
        {"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
    ),
    ".csv": frozenset({"text/csv", "application/csv", "application/vnd.ms-excel"}),
    ".txt": frozenset({"text/plain"}),
    ".png": frozenset({"image/png"}),
    ".jpg": frozenset({"image/jpeg"}),
    ".jpeg": frozenset({"image/jpeg"}),
    ".webp": frozenset({"image/webp"}),
}
ALLOWED_DOCUMENT_EXTENSIONS = frozenset(ALLOWED_DOCUMENT_MIME_TYPES)

_DANGEROUS_EXTENSIONS = frozenset(
    {
        ".bat",
        ".cmd",
        ".com",
        ".exe",
        ".htm",
        ".html",
        ".jar",
        ".js",
        ".msi",
        ".php",
        ".ps1",
        ".py",
        ".scr",
        ".sh",
        ".svg",
        ".vbs",
    }
)
_WINDOWS_RESERVED_NAMES = frozenset(
    {
        "CON",
        "PRN",
        "AUX",
        "NUL",
        *(f"COM{number}" for number in range(1, 10)),
        *(f"LPT{number}" for number in range(1, 10)),
    }
)
_PHONE_ALLOWED_RE = re.compile(r"^[+0-9().\-\s]+$")
_UNSAFE_FILENAME_RE = re.compile(r"[^\w.\- ]+", flags=re.UNICODE)
_CSV_FORMULA_PREFIXES = ("=", "+", "-", "@")


def normalize_phone(value: Any) -> str:
    """Return a compact local or E.164-style phone number.

    Common visual separators are accepted.  An international ``00`` prefix is
    normalized to ``+``.  Country-specific numbering plans are deliberately not
    guessed, but the E.164 maximum of 15 digits is enforced.
    """

    if value is None:
        return ""

    phone = str(value).strip()
    if not phone:
        return ""
    if not _PHONE_ALLOWED_RE.fullmatch(phone):
        raise ValidationError(
            "Enter a valid phone number using digits and an optional country code.",
            code="invalid_phone",
        )
    if phone.count("+") > 1 or ("+" in phone and not phone.startswith("+")):
        raise ValidationError(
            "The country-code prefix must appear only at the start.",
            code="invalid_phone",
        )

    digits = re.sub(r"\D", "", phone)
    has_international_prefix = phone.startswith("+") or phone.startswith("00")
    if phone.startswith("00"):
        digits = digits[2:]

    if not 7 <= len(digits) <= 15:
        raise ValidationError(
            "A phone number must contain between 7 and 15 digits.",
            code="invalid_phone_length",
        )
    if has_international_prefix and digits.startswith("0"):
        raise ValidationError(
            "An international country code cannot start with zero.",
            code="invalid_country_code",
        )

    return f"+{digits}" if has_international_prefix else digits


def validate_phone(value: Any) -> None:
    """Django-compatible validator for local and international phone input."""

    normalize_phone(value)


def validate_future_datetime(value: datetime) -> None:
    """Require a timezone-aware datetime strictly later than the current time."""

    if not isinstance(value, datetime):
        raise ValidationError("Enter a valid date and time.", code="invalid_datetime")
    if timezone.is_naive(value):
        raise ValidationError(
            "The date and time must include a timezone.",
            code="naive_datetime",
        )
    if value <= timezone.now():
        raise ValidationError(
            "The date and time must be in the future.",
            code="not_in_future",
        )


def validate_meeting_interval(start: datetime, end: datetime) -> None:
    """Validate that two aware meeting datetimes form a positive interval."""

    if not isinstance(start, datetime) or not isinstance(end, datetime):
        raise ValidationError(
            "Meeting start and end must be valid date-times.",
            code="invalid_meeting_interval",
        )
    if timezone.is_naive(start) or timezone.is_naive(end):
        raise ValidationError(
            "Meeting start and end must include a timezone.",
            code="naive_datetime",
        )
    if end <= start:
        raise ValidationError(
            "Meeting end must be later than meeting start.",
            code="invalid_meeting_interval",
        )


def sanitize_filename(filename: Any) -> str:
    """Return a traversal-safe, portable filename while preserving its suffix."""

    if filename is None:
        filename = ""
    raw_name = unicodedata.normalize("NFKC", str(filename))
    # Handle both POSIX and Windows separators, regardless of the host platform.
    basename = raw_name.replace("\\", "/").rsplit("/", 1)[-1]
    basename = "".join(
        character
        for character in basename
        if not unicodedata.category(character).startswith("C")
    )
    basename = _UNSAFE_FILENAME_RE.sub("_", basename)
    basename = re.sub(r"\s+", "_", basename)
    basename = re.sub(r"_+", "_", basename).strip(" ._")

    suffix = PurePath(basename).suffix.lower()
    stem = basename[: -len(suffix)] if suffix else basename
    stem = stem.rstrip(" ._") or "document"
    if stem.upper() in _WINDOWS_RESERVED_NAMES:
        stem = f"_{stem}"

    available_stem_length = max(1, MAX_FILENAME_LENGTH - len(suffix))
    stem = stem[:available_stem_length].rstrip(" ._") or "document"
    return f"{stem}{suffix}"


def validate_document_file(value: Any) -> None:
    """Validate lead-document size, suffix, declared MIME type, and filename."""

    if value is None:
        raise ValidationError("A document file is required.", code="missing_file")

    original_name = str(getattr(value, "name", "") or "")
    if not original_name:
        raise ValidationError("The document must have a filename.", code="missing_filename")
    if "\x00" in original_name:
        raise ValidationError("The filename is invalid.", code="invalid_filename")

    safe_name = sanitize_filename(original_name)
    suffixes = {suffix.lower() for suffix in PurePath(safe_name).suffixes}
    extension = PurePath(safe_name).suffix.lower()
    if suffixes & _DANGEROUS_EXTENSIONS:
        raise ValidationError(
            "Executable or active-content filenames are not allowed.",
            code="unsafe_file_type",
        )
    if extension not in ALLOWED_DOCUMENT_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_DOCUMENT_EXTENSIONS))
        raise ValidationError(
            f"Unsupported document type. Allowed extensions: {allowed}.",
            code="unsupported_file_type",
        )

    size = getattr(value, "size", None)
    if not isinstance(size, int):
        raise ValidationError(
            "The document size could not be determined.",
            code="invalid_file_size",
        )
    if size <= 0:
        raise ValidationError("Empty documents are not allowed.", code="empty_file")
    if size > MAX_DOCUMENT_SIZE:
        raise ValidationError(
            "Document files may not exceed 10 MiB.",
            code="file_too_large",
        )

    wrapped_file = getattr(value, "file", None)
    content_type = str(
        getattr(value, "content_type", "")
        or getattr(wrapped_file, "content_type", "")
        or ""
    )
    content_type = content_type.partition(";")[0].strip().lower()
    if not content_type:
        raise ValidationError(
            "The document content type is required.",
            code="missing_content_type",
        )
    if content_type not in ALLOWED_DOCUMENT_MIME_TYPES[extension]:
        raise ValidationError(
            "The document content type does not match its filename extension.",
            code="content_type_mismatch",
        )

    try:
        original_position = value.tell()
    except (AttributeError, OSError):
        original_position = None
    try:
        value.seek(0)
        header = value.read(4096)
    except (AttributeError, OSError) as exc:
        raise ValidationError(
            "The document content could not be inspected.",
            code="unreadable_file",
        ) from exc
    finally:
        try:
            value.seek(original_position or 0)
        except (AttributeError, OSError):
            pass

    signatures_valid = {
        ".pdf": header.startswith(b"%PDF-"),
        ".png": header.startswith(b"\x89PNG\r\n\x1a\n"),
        ".jpg": header.startswith(b"\xff\xd8\xff"),
        ".jpeg": header.startswith(b"\xff\xd8\xff"),
        ".webp": header.startswith(b"RIFF") and header[8:12] == b"WEBP",
        ".docx": header.startswith(b"PK\x03\x04"),
        ".xlsx": header.startswith(b"PK\x03\x04"),
        ".pptx": header.startswith(b"PK\x03\x04"),
        ".doc": header.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"),
        ".xls": header.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"),
        ".ppt": header.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"),
        ".csv": b"\x00" not in header,
        ".txt": b"\x00" not in header,
    }
    if not signatures_valid.get(extension, False):
        raise ValidationError(
            "The document signature does not match its declared file type.",
            code="file_signature_mismatch",
        )


def escape_csv_formula(value: Any) -> str:
    """Escape a value that spreadsheet programs could interpret as a formula."""

    if value is None:
        return ""

    text = str(value)
    if not text:
        return text

    probe = text.lstrip(" \t\r\n")
    starts_with_control = text[0] in {"\t", "\r", "\n"}
    if starts_with_control or (
        probe and probe.startswith(_CSV_FORMULA_PREFIXES)
    ):
        return f"'{text}"
    return text

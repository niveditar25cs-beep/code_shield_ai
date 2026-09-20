"""
verifier.py
~~~~~~~~~~~
PyPI JSON API lookup with TTL cache and proper error classification.

404              -> NOT_FOUND
timeout / 5xx   -> RegistryUnavailableError  (never treated as NOT_FOUND)
200              -> returns parsed metadata dict
"""

import time
import urllib.parse
import threading
from typing import Any

import requests as _requests

PYPI_JSON_URL = "https://pypi.org/pypi/{name}/json"
REQUEST_TIMEOUT = 5  # seconds
CACHE_TTL = 300       # seconds


class RegistryUnavailableError(Exception):
    """Raised when PyPI is unreachable or returns a server error."""


# ---------------------------------------------------------------------------
# Simple thread-safe TTL cache
# ---------------------------------------------------------------------------

_cache: dict[str, tuple[float, Any]] = {}
_cache_lock = threading.Lock()


def _cache_get(key: str) -> Any | None:
    with _cache_lock:
        entry = _cache.get(key)
    if entry is None:
        return None
    ts, value = entry
    if time.monotonic() - ts > CACHE_TTL:
        with _cache_lock:
            _cache.pop(key, None)
        return None
    return value


def _cache_set(key: str, value: Any) -> None:
    with _cache_lock:
        _cache[key] = (time.monotonic(), value)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def fetch_pypi_data(normalized_name: str) -> dict | None:
    """
    Fetch package metadata from PyPI.

    Returns:
        dict  – PyPI info dict on success
        None  – package not found (404)

    Raises:
        RegistryUnavailableError – on timeout or 5xx response
    """
    cached = _cache_get(normalized_name)
    if cached is not None:
        # Sentinel for "not found" cached results
        if cached == "__NOT_FOUND__":
            return None
        return cached

    url = PYPI_JSON_URL.format(name=urllib.parse.quote(normalized_name, safe=""))

    try:
        resp = _requests.get(url, timeout=REQUEST_TIMEOUT)
    except _requests.exceptions.Timeout:
        raise RegistryUnavailableError(
            f"Timed out querying PyPI for '{normalized_name}'"
        )
    except _requests.exceptions.ConnectionError as exc:
        raise RegistryUnavailableError(
            f"Connection error querying PyPI: {exc}"
        )
    except _requests.exceptions.RequestException as exc:
        raise RegistryUnavailableError(
            f"Request error querying PyPI: {exc}"
        )

    if resp.status_code == 404:
        _cache_set(normalized_name, "__NOT_FOUND__")
        return None

    if resp.status_code >= 500:
        raise RegistryUnavailableError(
            f"PyPI returned HTTP {resp.status_code} for '{normalized_name}'"
        )

    if resp.status_code != 200:
        # Unexpected status – treat as unavailable
        raise RegistryUnavailableError(
            f"PyPI returned unexpected HTTP {resp.status_code} for '{normalized_name}'"
        )

    try:
        data = resp.json()
    except ValueError as exc:
        raise RegistryUnavailableError(
            f"Could not parse PyPI response: {exc}"
        )

    _cache_set(normalized_name, data)
    return data


def check_exists(normalized_name: str) -> bool:
    """Return True if the package exists on PyPI, False if 404.
    Raises RegistryUnavailableError on network/server issues."""
    try:
        result = fetch_pypi_data(normalized_name)
        return result is not None
    except RegistryUnavailableError:
        raise

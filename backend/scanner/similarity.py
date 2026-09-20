"""
similarity.py
~~~~~~~~~~~~~
Name-similarity comparison against a list of popular PyPI packages.
Uses difflib.SequenceMatcher (ratio) and verifies candidates via PyPI.
"""

from __future__ import annotations

import difflib
from typing import TYPE_CHECKING

from .popular_packages import POPULAR_PACKAGES
from .verifier import fetch_pypi_data, RegistryUnavailableError

if TYPE_CHECKING:
    pass

# Minimum similarity ratio to include in suggestions
SIMILARITY_THRESHOLD = 0.6
# Maximum suggestions returned
MAX_SUGGESTIONS = 5
# Minimum package name length to run similarity (very short names are noise)
MIN_NAME_LEN = 4


def _ratio(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, a, b).ratio()


def find_similar_packages(
    normalized_name: str,
    threshold: float = SIMILARITY_THRESHOLD,
    max_results: int = MAX_SUGGESTIONS,
) -> list[dict]:
    """
    Compare *normalized_name* against POPULAR_PACKAGES with difflib.
    Returns a list of suggestion dicts sorted by similarity descending.

    Each dict:
        name          : str   - popular package name
        similarity    : float - 0-1 rounded to 4dp
        exists_on_pypi: bool  - verified via real lookup (graceful on error)
        reason        : str   - human readable reason for inclusion
    """
    if len(normalized_name) < MIN_NAME_LEN:
        return []

    candidates: list[tuple[float, str]] = []

    for pkg in POPULAR_PACKAGES:
        norm_pkg = pkg.lower().replace("-", "").replace("_", "").replace(".", "")
        norm_input = normalized_name.lower().replace("-", "").replace("_", "").replace(".", "")

        # Skip exact matches
        if norm_input == norm_pkg or normalized_name == pkg:
            continue

        ratio = _ratio(normalized_name, pkg)
        if ratio >= threshold:
            candidates.append((ratio, pkg))

    # Sort by ratio descending, then alphabetically for stability
    candidates.sort(key=lambda x: (-x[0], x[1]))
    candidates = candidates[:max_results]

    suggestions = []
    for ratio, pkg in candidates:
        exists = _check_exists_graceful(pkg)
        reason = _build_reason(ratio, normalized_name, pkg)
        suggestions.append(
            {
                "name": pkg,
                "similarity": round(ratio, 4),
                "exists_on_pypi": exists,
                "reason": reason,
            }
        )

    return suggestions


def get_highest_similarity(normalized_name: str) -> tuple[float, str | None]:
    """
    Return (highest_ratio, matching_package_name) against popular packages,
    excluding exact matches.  Returns (0.0, None) if no candidates.
    """
    best_ratio = 0.0
    best_name: str | None = None

    for pkg in POPULAR_PACKAGES:
        if normalized_name == pkg:
            continue
        ratio = _ratio(normalized_name, pkg)
        if ratio > best_ratio:
            best_ratio = ratio
            best_name = pkg

    return best_ratio, best_name


def _check_exists_graceful(pkg_name: str) -> bool:
    """Check if pkg_name exists on PyPI; returns False on any error."""
    try:
        result = fetch_pypi_data(pkg_name)
        return result is not None
    except RegistryUnavailableError:
        return False


def _build_reason(ratio: float, input_name: str, popular_name: str) -> str:
    pct = int(ratio * 100)
    if ratio >= 0.9:
        return f"{pct}% name match with '{popular_name}' — very high similarity, verify carefully."
    elif ratio >= 0.75:
        return f"{pct}% name match with '{popular_name}' — high similarity, possible lookalike."
    else:
        return f"{pct}% name match with '{popular_name}' — moderate similarity."

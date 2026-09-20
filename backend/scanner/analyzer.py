"""
analyzer.py
~~~~~~~~~~~
Orchestrates the full package-analysis pipeline and applies status rules.

Status rules (named constants):
  NOT_FOUND         - package not in PyPI (404)
  REVIEW_REQUIRED   - exists AND any of:
                        • name similarity ratio >= 0.85 to a DIFFERENT popular package
                        • first release < 30 days ago
                        • <= 2 releases AND no project links
  VERIFIED          - exists with no warning signals
"""

from __future__ import annotations

import datetime
import logging
from typing import Any

from .normalizer import normalize_name
from .verifier import fetch_pypi_data, RegistryUnavailableError
from .similarity import find_similar_packages, get_highest_similarity
from .explainer import generate_explanation

logger = logging.getLogger(__name__)

# ── Status constants ──────────────────────────────────────────────────────────
STATUS_VERIFIED = "VERIFIED"
STATUS_REVIEW = "REVIEW_REQUIRED"
STATUS_NOT_FOUND = "NOT_FOUND"

STATUS_LABELS = {
    STATUS_VERIFIED: "Verified in registry",
    STATUS_REVIEW: "Review Required",
    STATUS_NOT_FOUND: "Not Found",
}

DISCLAIMER = (
    "Registry existence does not guarantee a package is safe. "
    "CodeShield AI checks PyPI registry evidence and name similarity. "
    "It does not scan package contents for malware or vulnerabilities, "
    "and a malicious package can exist in the registry."
)

# Thresholds
LOOKALIKE_RATIO_THRESHOLD = 0.85
NEW_PACKAGE_DAYS = 30
LOW_RELEASE_THRESHOLD = 2

# ── Next step text by status ──────────────────────────────────────────────────

NEXT_STEPS = {
    STATUS_VERIFIED: (
        "This package exists in the PyPI registry, but existence does not prove it is free "
        "from malicious code. Check the official project page, repository, and maintainer "
        "history. Pin a specific version in your requirements, use a virtual environment, "
        "and consider auditing the package source before use."
    ),
    STATUS_REVIEW: (
        "Do not install this package yet. Confirm the spelling carefully and compare it "
        "with any similar well-known packages listed above. Verify the project page and "
        "repository are legitimate. If you received this name from an AI assistant, "
        "cross-check it against official documentation."
    ),
    STATUS_NOT_FOUND: (
        "Do not run pip install with this name. Check the spelling and consult the "
        "suggestions above. If you received this name from an AI assistant, ask the "
        "assistant where it found the package, or search PyPI directly at pypi.org. "
        "The package may exist only in a private registry, or it may be an AI hallucination "
        "(slopsquatting risk)."
    ),
}


# ── Main pipeline ─────────────────────────────────────────────────────────────


def analyze_package(raw_name: str) -> dict:
    """
    Run the full analysis pipeline for *raw_name*.

    Returns a response dict ready for JSON serialisation.
    Raises RegistryUnavailableError on PyPI connectivity problems.
    """
    normalized = normalize_name(raw_name)
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    # ── 1. PyPI lookup ────────────────────────────────────────────────────────
    pypi_data = fetch_pypi_data(normalized)  # None = 404; raises on 5xx/timeout

    if pypi_data is None:
        # NOT_FOUND
        suggestions = find_similar_packages(normalized)
        explanation = generate_explanation(
            normalized, STATUS_NOT_FOUND, [], []
        )
        return {
            "package_name": raw_name,
            "normalized_name": normalized,
            "status": STATUS_NOT_FOUND,
            "status_label": STATUS_LABELS[STATUS_NOT_FOUND],
            "evidence": [],
            "explanation": explanation,
            "suggestions": suggestions,
            "next_step": NEXT_STEPS[STATUS_NOT_FOUND],
            "disclaimer": DISCLAIMER,
            "checked_at": now_iso,
        }

    # ── 2. Extract evidence ───────────────────────────────────────────────────
    info = pypi_data.get("info", {})
    releases = pypi_data.get("releases", {})

    latest_version = info.get("version", "unknown")
    release_count = len(releases)

    # Determine first/latest release dates
    first_release_date: str | None = None
    latest_release_date: str | None = None
    first_release_age_days: int | None = None

    all_upload_times: list[str] = []
    for files in releases.values():
        for f in files:
            t = f.get("upload_time")
            if t:
                all_upload_times.append(t)

    if all_upload_times:
        all_upload_times_sorted = sorted(all_upload_times)
        first_release_date = all_upload_times_sorted[0][:10]
        latest_release_date = all_upload_times_sorted[-1][:10]
        try:
            first_dt = datetime.datetime.fromisoformat(first_release_date)
            first_release_age_days = (datetime.datetime.utcnow() - first_dt).days
        except ValueError:
            pass

    # Project links
    project_urls: dict = info.get("project_urls") or {}
    has_project_links = bool(project_urls)
    project_url_str = info.get("project_url") or info.get("home_page") or ""

    # License
    license_str = info.get("license") or "Not specified"
    if len(license_str) > 80:
        license_str = license_str[:77] + "..."

    # Author
    author = info.get("author") or info.get("maintainer") or "Not specified"

    # ── 3. Similarity check ───────────────────────────────────────────────────
    highest_ratio, closest_pkg = get_highest_similarity(normalized)
    suggestions = find_similar_packages(normalized)

    # ── 4. Apply status rules ─────────────────────────────────────────────────
    triggered_signals: list[str] = []

    if highest_ratio >= LOOKALIKE_RATIO_THRESHOLD and closest_pkg:
        triggered_signals.append(
            f"Name is {int(highest_ratio * 100)}% similar to popular package '{closest_pkg}'"
        )

    if first_release_age_days is not None and first_release_age_days < NEW_PACKAGE_DAYS:
        triggered_signals.append(
            f"First release was only {first_release_age_days} day(s) ago (< 30 days)"
        )

    if release_count <= LOW_RELEASE_THRESHOLD and not has_project_links:
        triggered_signals.append(
            f"Only {release_count} release(s) and no project links"
        )

    status = STATUS_REVIEW if triggered_signals else STATUS_VERIFIED

    # ── 5. Build evidence list ────────────────────────────────────────────────
    def signal_for_key(key: str) -> str | None:
        """Return a warning signal text if this evidence key is problematic."""
        if key == "name_similarity" and highest_ratio >= LOOKALIKE_RATIO_THRESHOLD:
            return triggered_signals[0] if triggered_signals else None
        if key == "first_release_date" and first_release_age_days is not None and first_release_age_days < NEW_PACKAGE_DAYS:
            return f"Very recent package ({first_release_age_days}d old)"
        if key == "release_count" and release_count <= LOW_RELEASE_THRESHOLD and not has_project_links:
            return f"Only {release_count} release(s), no project links"
        return None

    evidence: list[dict] = []

    evidence.append({
        "key": "latest_version",
        "label": "Latest version",
        "value": latest_version,
        "signal": None,
    })
    evidence.append({
        "key": "release_count",
        "label": "Release count",
        "value": str(release_count),
        "signal": signal_for_key("release_count"),
    })
    if first_release_date:
        evidence.append({
            "key": "first_release_date",
            "label": "First release",
            "value": first_release_date
            + (f" ({first_release_age_days}d ago)" if first_release_age_days is not None else ""),
            "signal": signal_for_key("first_release_date"),
        })
    if latest_release_date:
        evidence.append({
            "key": "latest_release_date",
            "label": "Latest release",
            "value": latest_release_date,
            "signal": None,
        })
    evidence.append({
        "key": "project_links",
        "label": "Project links",
        "value": ", ".join(project_urls.keys()) if project_urls else (project_url_str or "None"),
        "signal": None if has_project_links else "No project links provided",
    })
    evidence.append({
        "key": "license",
        "label": "License",
        "value": license_str,
        "signal": None,
    })
    evidence.append({
        "key": "author",
        "label": "Author / Maintainer",
        "value": author,
        "signal": None,
    })
    evidence.append({
        "key": "name_similarity",
        "label": "Closest popular package",
        "value": f"{closest_pkg} ({int(highest_ratio * 100)}% match)" if closest_pkg else "None",
        "signal": signal_for_key("name_similarity"),
    })

    # ── 6. Explanation ────────────────────────────────────────────────────────
    explanation = generate_explanation(normalized, status, evidence, triggered_signals)

    return {
        "package_name": raw_name,
        "normalized_name": normalized,
        "status": status,
        "status_label": STATUS_LABELS[status],
        "evidence": evidence,
        "explanation": explanation,
        "suggestions": suggestions,
        "next_step": NEXT_STEPS[status],
        "disclaimer": DISCLAIMER,
        "checked_at": now_iso,
    }

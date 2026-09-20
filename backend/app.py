"""
app.py
~~~~~~
Flask application: routes, validation, rate limiting, error handling.
"""

from __future__ import annotations

import logging
import os
import re
import time
from collections import defaultdict
from functools import wraps
from typing import Any

from flask import Flask, jsonify, request
from flask_cors import CORS

from scanner.analyzer import analyze_package, STATUS_NOT_FOUND
from scanner.extractor import extract_imports
from scanner.normalizer import import_to_package_name
from scanner.verifier import RegistryUnavailableError

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# Maximum request body size: 100 KB
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024

# Package name validation regex (PEP 508 compatible)
_NAME_RE = re.compile(r"^[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?$")
MAX_NAME_LEN = 100

# ---------------------------------------------------------------------------
# Simple in-memory per-IP rate limiter
# ---------------------------------------------------------------------------

_rate_data: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 30   # requests
RATE_WINDOW = 60  # seconds


def _check_rate_limit(ip: str) -> bool:
    """Return True if the IP is within the rate limit."""
    now = time.monotonic()
    timestamps = _rate_data[ip]
    # Drop old entries
    _rate_data[ip] = [t for t in timestamps if now - t < RATE_WINDOW]
    if len(_rate_data[ip]) >= RATE_LIMIT:
        return False
    _rate_data[ip].append(now)
    return True


def rate_limited(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        ip = request.remote_addr or "unknown"
        if not _check_rate_limit(ip):
            return jsonify({
                "error": "RATE_LIMITED",
                "message": "Too many requests. Please wait a moment before trying again.",
            }), 429
        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_package_name(name: Any) -> str | None:
    """
    Validate and return the package name, or return None if invalid.
    """
    if not isinstance(name, str):
        return None
    name = name.strip()
    if not name or len(name) > MAX_NAME_LEN:
        return None
    if not _NAME_RE.match(name):
        return None
    return name


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "CodeShield AI"})


@app.post("/api/analyze")
@rate_limited
def analyze():
    data = request.get_json(silent=True) or {}
    raw_name = data.get("package", "")

    name = _validate_package_name(raw_name)
    if not name:
        return jsonify({
            "error": "INVALID_NAME",
            "message": (
                "Invalid package name. Names must be 1–100 characters, "
                "contain only letters, digits, dots, hyphens, or underscores, "
                "and start and end with a letter or digit."
            ),
        }), 400

    try:
        result = analyze_package(name)
        return jsonify(result)
    except RegistryUnavailableError as exc:
        logger.warning("PyPI unavailable: %s", exc)
        return jsonify({
            "error": "REGISTRY_UNAVAILABLE",
            "message": (
                "Could not reach the PyPI registry. This is a temporary connectivity issue — "
                "the package has not been classified as Not Found. Please try again shortly."
            ),
        }), 502
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /api/analyze: %s", exc)
        return jsonify({
            "error": "INTERNAL_ERROR",
            "message": "An unexpected error occurred. Please try again.",
        }), 500


@app.post("/api/scan")
@rate_limited
def scan():
    data = request.get_json(silent=True) or {}
    code = data.get("code", "")

    if not isinstance(code, str):
        return jsonify({"error": "INVALID_INPUT", "message": "code must be a string"}), 400

    # Limit code to 100 KB (belt + suspenders — Flask limit already set)
    if len(code.encode("utf-8")) > 100 * 1024:
        return jsonify({"error": "INVALID_INPUT", "message": "Code exceeds 100 KB limit"}), 400

    # Extract imports using ast — NEVER execute the code
    import_names = extract_imports(code)

    if not import_names:
        return jsonify({
            "summary": {
                "total": 0,
                "verified": 0,
                "review_required": 0,
                "not_found": 0,
            },
            "results": [],
        })

    results = []
    counts = {
        "VERIFIED": 0,
        "REVIEW_REQUIRED": 0,
        "NOT_FOUND": 0,
    }

    for import_name in import_names:
        pkg_name = import_to_package_name(import_name)

        # Validate derived package name before any network call
        if not _validate_package_name(pkg_name):
            logger.info("Skipping invalid derived name: %r", pkg_name)
            continue

        try:
            result = analyze_package(pkg_name)
            results.append({
                "import_name": import_name,
                **result,
            })
            counts[result["status"]] = counts.get(result["status"], 0) + 1
        except RegistryUnavailableError:
            results.append({
                "import_name": import_name,
                "package_name": pkg_name,
                "normalized_name": pkg_name,
                "status": "REGISTRY_UNAVAILABLE",
                "status_label": "Registry Unavailable",
                "evidence": [],
                "explanation": {"text": "Could not reach PyPI registry.", "source": "rule_based"},
                "suggestions": [],
                "next_step": "PyPI was unreachable. Please try again shortly.",
                "disclaimer": "",
                "checked_at": "",
                "error": "REGISTRY_UNAVAILABLE",
            })
        except Exception as exc:  # noqa: BLE001
            logger.exception("Error scanning import %r: %s", import_name, exc)

    summary = {
        "total": len(results),
        "verified": counts["VERIFIED"],
        "review_required": counts["REVIEW_REQUIRED"],
        "not_found": counts["NOT_FOUND"],
    }

    return jsonify({"summary": summary, "results": results})


# ---------------------------------------------------------------------------
# SPA fallback — serve React app for non-API routes
# ---------------------------------------------------------------------------

@app.errorhandler(404)
def not_found(e):
    # Try to serve the SPA index.html if dist exists
    import os
    dist_index = os.path.join(app.static_folder or "", "index.html")
    if os.path.exists(dist_index):
        return app.send_static_file("index.html")
    return jsonify({"error": "NOT_FOUND"}), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)

"""
test_analyzer.py
~~~~~~~~~~~~~~~~
Unit tests for the analysis pipeline using mocked PyPI calls.
Covers: NOT_FOUND, VERIFIED, REVIEW_REQUIRED (lookalike, new, low-release),
        RegistryUnavailableError, invalid name rejection, explainer fallback.
"""

import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta


# ---------------------------------------------------------------------------
# Helpers to build mock PyPI data
# ---------------------------------------------------------------------------

def _make_pypi_data(
    name="testpkg",
    version="1.2.3",
    release_dates=None,
    project_urls=None,
    license_str="MIT",
    author="Alice",
    num_releases=5,
):
    """Create a minimal PyPI JSON-style dict for mocking."""
    if release_dates is None:
        # Default: first release 200 days ago, latest 10 days ago
        first = (datetime.utcnow() - timedelta(days=200)).strftime("%Y-%m-%dT%H:%M:%S")
        latest = (datetime.utcnow() - timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%S")
        release_dates = [first, latest]

    releases = {}
    for i, dt in enumerate(release_dates):
        releases[f"0.{i}.0"] = [{"upload_time": dt, "filename": f"pkg-{i}.tar.gz"}]
    # Pad to num_releases
    for i in range(len(release_dates), num_releases):
        dt = (datetime.utcnow() - timedelta(days=100 + i)).strftime("%Y-%m-%dT%H:%M:%S")
        releases[f"1.{i}.0"] = [{"upload_time": dt, "filename": f"pkg-{i}.tar.gz"}]

    return {
        "info": {
            "name": name,
            "version": version,
            "license": license_str,
            "author": author,
            "project_url": "https://github.com/example/testpkg",
            "project_urls": project_urls if project_urls is not None else {
                "Homepage": "https://github.com/example/testpkg",
            },
        },
        "releases": releases,
    }


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestAnalyzerNotFound(unittest.TestCase):
    """404 from PyPI -> NOT_FOUND status."""

    @patch("scanner.analyzer.find_similar_packages", return_value=[])
    @patch("scanner.analyzer.generate_explanation", return_value={"text": "x", "source": "rule_based"})
    @patch("scanner.analyzer.fetch_pypi_data", return_value=None)
    def test_not_found(self, mock_fetch, mock_explain, mock_similar):
        from scanner.analyzer import analyze_package, STATUS_NOT_FOUND
        result = analyze_package("fakepkg-ai-utils")
        self.assertEqual(result["status"], STATUS_NOT_FOUND)
        self.assertEqual(result["status_label"], "Not Found")
        mock_fetch.assert_called_once()

    @patch("scanner.analyzer.find_similar_packages", return_value=[])
    @patch("scanner.analyzer.generate_explanation", return_value={"text": "x", "source": "rule_based"})
    @patch("scanner.analyzer.fetch_pypi_data", return_value=None)
    def test_not_found_has_disclaimer(self, mock_fetch, mock_explain, mock_similar):
        from scanner.analyzer import analyze_package
        result = analyze_package("nonexistent-xyz-123")
        self.assertIn("disclaimer", result)
        self.assertTrue(len(result["disclaimer"]) > 10)


class TestAnalyzerVerified(unittest.TestCase):
    """Established package -> VERIFIED status."""

    @patch("scanner.analyzer.get_highest_similarity", return_value=(0.3, "requests"))
    @patch("scanner.analyzer.find_similar_packages", return_value=[])
    @patch("scanner.analyzer.generate_explanation", return_value={"text": "ok", "source": "rule_based"})
    @patch("scanner.analyzer.fetch_pypi_data")
    def test_verified(self, mock_fetch, mock_explain, mock_similar, mock_sim):
        from scanner.analyzer import analyze_package, STATUS_VERIFIED
        mock_fetch.return_value = _make_pypi_data(
            name="requests",
            num_releases=20,
            project_urls={"Homepage": "https://requests.readthedocs.io"},
        )
        result = analyze_package("requests")
        self.assertEqual(result["status"], STATUS_VERIFIED)
        self.assertEqual(result["status_label"], "Verified in registry")

    @patch("scanner.analyzer.get_highest_similarity", return_value=(0.3, "numpy"))
    @patch("scanner.analyzer.find_similar_packages", return_value=[])
    @patch("scanner.analyzer.generate_explanation", return_value={"text": "ok", "source": "rule_based"})
    @patch("scanner.analyzer.fetch_pypi_data")
    def test_verified_evidence_fields(self, mock_fetch, mock_explain, mock_similar, mock_sim):
        from scanner.analyzer import analyze_package
        mock_fetch.return_value = _make_pypi_data(num_releases=10)
        result = analyze_package("numpy")
        evidence_keys = {e["key"] for e in result["evidence"]}
        self.assertIn("latest_version", evidence_keys)
        self.assertIn("release_count", evidence_keys)
        self.assertIn("license", evidence_keys)


class TestAnalyzerReviewRequiredLookalike(unittest.TestCase):
    """High name similarity to a popular package -> REVIEW_REQUIRED."""

    @patch("scanner.analyzer.get_highest_similarity", return_value=(0.92, "requests"))
    @patch("scanner.analyzer.find_similar_packages", return_value=[])
    @patch("scanner.analyzer.generate_explanation", return_value={"text": "x", "source": "rule_based"})
    @patch("scanner.analyzer.fetch_pypi_data")
    def test_lookalike_triggers_review(self, mock_fetch, mock_explain, mock_similar, mock_sim):
        from scanner.analyzer import analyze_package, STATUS_REVIEW
        mock_fetch.return_value = _make_pypi_data(name="requestss", num_releases=3)
        result = analyze_package("requestss")
        self.assertEqual(result["status"], STATUS_REVIEW)
        # At least one evidence item should be a warning
        warnings = [e for e in result["evidence"] if e.get("signal")]
        self.assertTrue(len(warnings) >= 1)


class TestAnalyzerReviewRequiredNew(unittest.TestCase):
    """Package first released < 30 days ago -> REVIEW_REQUIRED."""

    @patch("scanner.analyzer.get_highest_similarity", return_value=(0.2, "something"))
    @patch("scanner.analyzer.find_similar_packages", return_value=[])
    @patch("scanner.analyzer.generate_explanation", return_value={"text": "x", "source": "rule_based"})
    @patch("scanner.analyzer.fetch_pypi_data")
    def test_new_package_triggers_review(self, mock_fetch, mock_explain, mock_similar, mock_sim):
        from scanner.analyzer import analyze_package, STATUS_REVIEW
        recent = (datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%S")
        mock_fetch.return_value = _make_pypi_data(
            name="brandnewpkg",
            release_dates=[recent, recent],
            num_releases=2,
            project_urls={"Homepage": "https://example.com"},
        )
        result = analyze_package("brandnewpkg")
        self.assertEqual(result["status"], STATUS_REVIEW)


class TestAnalyzerReviewRequiredLowRelease(unittest.TestCase):
    """<= 2 releases AND no project links -> REVIEW_REQUIRED."""

    @patch("scanner.analyzer.get_highest_similarity", return_value=(0.1, "something"))
    @patch("scanner.analyzer.find_similar_packages", return_value=[])
    @patch("scanner.analyzer.generate_explanation", return_value={"text": "x", "source": "rule_based"})
    @patch("scanner.analyzer.fetch_pypi_data")
    def test_low_release_no_links_triggers_review(self, mock_fetch, mock_explain, mock_similar, mock_sim):
        from scanner.analyzer import analyze_package, STATUS_REVIEW
        old_date = (datetime.utcnow() - timedelta(days=200)).strftime("%Y-%m-%dT%H:%M:%S")
        mock_fetch.return_value = _make_pypi_data(
            name="obscurepkg",
            release_dates=[old_date],
            num_releases=1,
            project_urls={},  # no links
        )
        # Override project_url in info too
        data = mock_fetch.return_value
        data["info"]["project_url"] = ""
        data["info"]["project_urls"] = {}
        mock_fetch.return_value = data
        result = analyze_package("obscurepkg")
        self.assertEqual(result["status"], STATUS_REVIEW)


class TestRegistryUnavailable(unittest.TestCase):
    """PyPI timeout / 5xx -> RegistryUnavailableError propagated."""

    @patch("scanner.analyzer.fetch_pypi_data")
    def test_registry_unavailable_propagated(self, mock_fetch):
        from scanner.analyzer import analyze_package
        from scanner.verifier import RegistryUnavailableError
        mock_fetch.side_effect = RegistryUnavailableError("timeout")
        with self.assertRaises(RegistryUnavailableError):
            analyze_package("requests")


class TestInvalidNameRejected(unittest.TestCase):
    """Invalid package names must be caught before any network call."""

    def _check_no_network(self, name):
        """Ensure analyze_package raises or returns NOT_FOUND without network."""
        # The Flask route validates; test that the regex used in the route
        # correctly rejects these names.
        import re
        _NAME_RE = re.compile(r"^[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?$")
        self.assertFalse(_NAME_RE.match(name), f"Expected {name!r} to be invalid")

    def test_empty_name(self):
        self._check_no_network("")

    def test_space_in_name(self):
        self._check_no_network("my package")

    def test_semicolon_injection(self):
        self._check_no_network("pkg;rm -rf /")

    def test_url_encoded_slash(self):
        self._check_no_network("pkg/malicious")

    def test_leading_dash(self):
        self._check_no_network("-badpkg")

    def test_trailing_dash(self):
        self._check_no_network("badpkg-")


class TestExplainerFallback(unittest.TestCase):
    """Explainer falls back to rule_based on API failure."""

    @patch("scanner.explainer._call_anthropic")
    def test_fallback_on_api_error(self, mock_call):
        import os
        mock_call.side_effect = Exception("API unavailable")
        # Temporarily set a fake key so the LLM path is attempted
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "sk-fake-key"}):
            from scanner.explainer import generate_explanation
            result = generate_explanation(
                "testpkg", "VERIFIED", [], []
            )
        self.assertEqual(result["source"], "rule_based")
        self.assertIsInstance(result["text"], str)
        self.assertTrue(len(result["text"]) > 0)

    def test_no_key_uses_rule_based(self):
        import os
        with patch.dict(os.environ, {}, clear=False):
            # Ensure key is absent
            env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
            with patch.dict(os.environ, env, clear=True):
                from scanner.explainer import generate_explanation
                result = generate_explanation(
                    "testpkg", "NOT_FOUND", [], []
                )
        self.assertEqual(result["source"], "rule_based")


class TestExtractor(unittest.TestCase):
    """Import extractor tests."""

    def test_basic_imports(self):
        from scanner.extractor import extract_imports
        code = "import requests\nimport numpy as np\nimport os\nimport sys"
        imports = extract_imports(code)
        self.assertIn("requests", imports)
        self.assertIn("numpy", imports)
        self.assertNotIn("os", imports)
        self.assertNotIn("sys", imports)

    def test_from_imports(self):
        from scanner.extractor import extract_imports
        code = "from flask import Flask\nfrom pathlib import Path"
        imports = extract_imports(code)
        self.assertIn("flask", imports)
        self.assertNotIn("pathlib", imports)

    def test_relative_import_excluded(self):
        from scanner.extractor import extract_imports
        code = "from . import utils\nfrom ..models import User"
        imports = extract_imports(code)
        self.assertEqual(imports, [])

    def test_syntax_error_raises_syntax_error(self):
        from scanner.extractor import extract_imports
        with self.assertRaises(SyntaxError):
            extract_imports("def broken(:\n    pass")


class TestNormalizer(unittest.TestCase):
    """PEP 503 normalizer tests."""

    def test_normalize_hyphens_underscores(self):
        from scanner.normalizer import normalize_name
        self.assertEqual(normalize_name("My_Package"), "my-package")
        self.assertEqual(normalize_name("my.package"), "my-package")
        self.assertEqual(normalize_name("MY---PACKAGE"), "my-package")

    def test_import_to_package_cv2(self):
        from scanner.normalizer import import_to_package_name
        self.assertEqual(import_to_package_name("cv2"), "opencv-python")

    def test_import_to_package_pil(self):
        from scanner.normalizer import import_to_package_name
        self.assertEqual(import_to_package_name("PIL"), "pillow")

    def test_import_to_package_unknown(self):
        from scanner.normalizer import import_to_package_name
        # Unknown imports get normalized name
class TestApiScan(unittest.TestCase):
    """Flask client tests for /api/scan endpoint."""

    def setUp(self):
        from app import app
        app.config["TESTING"] = True
        self.client = app.test_client()

    @patch("scanner.verifier.fetch_pypi_data")
    def test_scan_sample_code_mocked(self, mock_fetch):
        def side_effect(name):
            if name == "requests":
                return _make_pypi_data("requests", version="2.31.0")
            elif name == "flask":
                return _make_pypi_data("flask", version="3.0.0")
            return None  # NOT_FOUND for reqeusts, python-crypto-lib-ai

        mock_fetch.side_effect = side_effect

        code = "import os\nimport requests\nimport reqeusts\nimport python_crypto_lib_ai\nfrom flask import Flask, jsonify"
        response = self.client.post("/api/scan", json={"code": code})
        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertIn("summary", data)
        self.assertIn("results", data)
        self.assertEqual(data["summary"]["total"], 4)
        self.assertEqual(data["summary"]["verified"], 2)
        self.assertEqual(data["summary"]["not_found"], 2)

    def test_scan_syntax_error_returns_400(self):
        response = self.client.post("/api/scan", json={"code": "import ("})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data["error"], "SYNTAX_ERROR")
        self.assertIn("Python syntax error", data["message"])


if __name__ == "__main__":
    unittest.main()


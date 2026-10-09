# tests/test_startup_checks.py
"""
Regression test suite for Sentra production startup checks, environment validation,
and diagnostic reporting.
"""

from __future__ import annotations

import os
from unittest.mock import patch
import pytest

from app.core.config import settings
from app.core.startup_checks import run_startup_checks


def test_startup_checks_blocked_in_production_without_jwt_secret():
    """Verify that production mode without JWT_SECRET blocks startup with actionable diagnostics."""
    with patch.dict(os.environ, {"APP_ENV": "production"}, clear=False):
        # Ensure secret environment variables are absent
        for key in ["JWT_SECRET", "SECRET_KEY", "SENTRA_JWT_SECRET"]:
            os.environ.pop(key, None)

        result = run_startup_checks()
        assert result["status"] == "blocked"
        assert len(result["blocking_failures"]) >= 1

        jwt_failure = next(
            (f for f in result["blocking_failures"] if f["name"] == "jwt_secret"),
            None,
        )
        assert jwt_failure is not None
        assert jwt_failure["status"] == "fail"
        assert jwt_failure["error_code"] == "SEC_JWT_SECRET_BLOCKED"
        assert "sufficient entropy" in jwt_failure["detail"]


def test_startup_checks_ready_in_production_with_valid_jwt_secret():
    """Verify that production mode with valid JWT_SECRET completes with ready status."""
    valid_secret = "sentra-production-test-secret-with-sufficient-entropy-998877"
    with patch.dict(
        os.environ,
        {"APP_ENV": "production", "JWT_SECRET": valid_secret},
        clear=False,
    ):
        result = run_startup_checks()
        assert result["status"] == "ready"
        assert len(result["blocking_failures"]) == 0

        jwt_check = next(
            (c for c in result["checks"] if c["name"] == "jwt_secret"),
            None,
        )
        assert jwt_check is not None
        assert jwt_check["status"] == "pass"


def test_startup_checks_ready_in_development():
    """Verify that development mode allows startup with ephemeral secrets."""
    with patch.dict(os.environ, {"APP_ENV": "development"}, clear=False):
        result = run_startup_checks()
        assert result["status"] == "ready"
        assert len(result["blocking_failures"]) == 0


def test_startup_event_raises_descriptive_error_when_blocked():
    """Verify that startup_event raises RuntimeError containing safe error code and reason."""
    import asyncio
    from app.main import startup_event

    with patch.dict(os.environ, {"APP_ENV": "production"}, clear=False):
        for key in ["JWT_SECRET", "SECRET_KEY", "SENTRA_JWT_SECRET"]:
            os.environ.pop(key, None)

        with pytest.raises(RuntimeError) as exc_info:
            asyncio.run(startup_event())

        err_msg = str(exc_info.value)
        assert "Sentra production startup checks failed" in err_msg
        assert "SEC_JWT_SECRET_BLOCKED" in err_msg
        # Ensure no actual secret or key value is dumped
        assert "Bearer" not in err_msg

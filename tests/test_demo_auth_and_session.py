# tests/test_demo_auth_and_session.py
"""
Regression tests for Sentra demo authentication, session retention,
and synthetic demo token acceptance.
"""

from __future__ import annotations

import pytest
from starlette.testclient import TestClient

from app.auth.store import auth_store
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_demo_user_login_seeded(client: TestClient) -> None:
    """Test that POST /auth/login succeeds for all canonical demo accounts."""
    demo_accounts = [
        ("admin@sentra.demo", "admin"),
        ("manager@sentra.demo", "security_manager"),
        ("staff@sentra.demo", "staff"),
        ("responder@sentra.demo", "responder"),
        ("analyst@sentra.demo", "analyst"),
    ]

    for email, expected_role in demo_accounts:
        response = client.post(
            "/auth/login",
            json={"email": email, "password": "SentraDemo!2026"},
        )
        assert response.status_code == 200, f"Login failed for {email}: {response.text}"
        data = response.json()
        assert data.get("authenticated") is True
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == email
        assert data["user"]["role"] == expected_role


def test_demo_token_header_accepted(client: TestClient) -> None:
    """
    Test that endpoints requiring auth accept client-side synthetic demo tokens
    (e.g., demo-token-admin, demo-token-manager, demo-token-responder) without HTTP 401.
    """
    roles = [
        "admin",
        "manager",
        "security_manager",
        "commander",
        "staff",
        "responder",
        "analyst",
    ]

    for role in roles:
        demo_token = f"demo-token-{role}"
        # Test protected me endpoint (accessible to all authenticated users)
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {demo_token}"},
        )
        assert response.status_code == 200, f"Synthetic demo token rejected for {role}: {response.text}"
        payload = response.json()
        assert payload["email"].endswith("@sentra.demo")

    # Test /geo/live for roles that have geo permissions (admin, manager, commander)
    for privileged_role in ["admin", "manager", "security_manager", "commander"]:
        demo_token = f"demo-token-{privileged_role}"
        geo_res = client.get(
            "/geo/live",
            headers={"Authorization": f"Bearer {demo_token}"},
        )
        assert geo_res.status_code == 200, f"/geo/live rejected demo token {demo_token}"


def test_demo_refresh_endpoint(client: TestClient) -> None:
    """Test that /auth/refresh accepts demo-refresh-* tokens."""
    response = client.post(
        "/auth/refresh",
        json={"refresh_token": "demo-refresh-admin"},
    )
    assert response.status_code == 200, f"Refresh failed: {response.text}"
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_invalid_token_returns_401(client: TestClient) -> None:
    """Test that genuinely invalid tokens are correctly rejected with 401."""
    response = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer totally-invalid-random-garbage-token"},
    )
    assert response.status_code == 401

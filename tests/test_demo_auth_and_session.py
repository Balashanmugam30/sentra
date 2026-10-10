# tests/test_demo_auth_and_session.py
"""
Zero-trust security tests for Sentra demo authentication, session retention,
cryptographic token validation, and strict rejection of synthetic bypass tokens.
"""

from __future__ import annotations

import pytest
from starlette.testclient import TestClient

from app.auth.store import auth_store
from app.main import app
from app.rbac.store import seed_demo_users


@pytest.fixture(autouse=True)
def ensure_demo_users() -> None:
    seed_demo_users()


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def test_demo_user_login_seeded(client: TestClient) -> None:
    """Test that POST /auth/login succeeds for canonical demo accounts with real JWTs."""
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

        # Verify access token is a real JWT (header.payload.signature)
        token_parts = data["access_token"].split(".")
        assert len(token_parts) == 3, f"Expected signed JWT, got: {data['access_token']}"


def test_synthetic_tokens_strictly_rejected_401(client: TestClient) -> None:
    """
    Test Gate 4 zero-trust enforcement: synthetic demo tokens
    (e.g., demo-token-admin, demo-token-manager) must be strictly rejected with HTTP 401.
    """
    synthetic_tokens = [
        "demo-token-admin",
        "demo-token-manager",
        "demo-token-security_manager",
        "demo-token-commander",
        "demo-token-staff",
        "demo-token-responder",
        "demo-token-analyst",
        "demo-token-restored",
    ]

    for token in synthetic_tokens:
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert (
            response.status_code == 401
        ), f"Zero-trust violation: synthetic token '{token}' was accepted (got {response.status_code})"


def test_synthetic_refresh_token_rejected_401(client: TestClient) -> None:
    """Test that /auth/refresh strictly rejects synthetic demo-refresh-* tokens."""
    response = client.post(
        "/auth/refresh",
        json={"refresh_token": "demo-refresh-admin"},
    )
    assert (
        response.status_code == 401
    ), f"Zero-trust violation: synthetic refresh token was accepted (got {response.status_code})"


def test_wrong_password_rejected(client: TestClient) -> None:
    """Test that incorrect passwords are rejected with 401."""
    response = client.post(
        "/auth/login",
        json={"email": "admin@sentra.demo", "password": "WrongPassword999!"},
    )
    assert response.status_code == 401


def test_real_jwt_lifecycle(client: TestClient) -> None:
    """Test full authenticated lifecycle: login, access protected route, refresh token."""
    login_res = client.post(
        "/auth/login",
        json={"email": "admin@sentra.demo", "password": "SentraDemo!2026"},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    access_token = login_data["access_token"]
    refresh_token = login_data["refresh_token"]

    # Access /auth/me with genuine JWT
    me_res = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "admin@sentra.demo"

    # Access /geo/live with genuine JWT
    geo_res = client.get(
        "/geo/live",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert geo_res.status_code == 200

    # Refresh session using genuine refresh token
    refresh_res = client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    refreshed_data = refresh_res.json()
    new_access_token = refreshed_data["access_token"]
    assert new_access_token != access_token

    # Verify new token works
    me_refreshed = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {new_access_token}"},
    )
    assert me_refreshed.status_code == 200


def test_bootstrap_admin_secret_enforced(client: TestClient) -> None:
    """Test that /auth/bootstrap-admin enforces secret when configured."""
    from app.core.config import settings

    orig = settings.auth_bootstrap_secret
    object.__setattr__(settings, "auth_bootstrap_secret", "secret-key-12345")
    try:
        # Missing secret should be rejected with 403
        unauth = client.post(
            "/auth/bootstrap-admin",
            json={
                "email": "fresh-admin@sentra.demo",
                "password": "ValidPassword123!",
                "name": "Fresh Admin",
            },
        )
        assert unauth.status_code == 403

        # Wrong secret should be rejected with 403
        wrong = client.post(
            "/auth/bootstrap-admin",
            json={
                "email": "fresh-admin@sentra.demo",
                "password": "ValidPassword123!",
                "name": "Fresh Admin",
                "secret": "wrong-secret",
            },
        )
        assert wrong.status_code == 403

        # Correct secret in payload or header should pass secret check (may 409 if admin exists)
        valid = client.post(
            "/auth/bootstrap-admin",
            json={
                "email": "fresh-admin@sentra.demo",
                "password": "ValidPassword123!",
                "name": "Fresh Admin",
                "secret": "secret-key-12345",
            },
        )
        assert valid.status_code in {200, 409}
    finally:
        object.__setattr__(settings, "auth_bootstrap_secret", orig)


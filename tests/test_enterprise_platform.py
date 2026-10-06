from __future__ import annotations

import os
import tempfile

os.environ.setdefault("SENTRA_AUTH_STORE_PATH", f"{tempfile.mkdtemp()}/auth_store.json")
os.environ.setdefault("SENTRA_AUDIT_STORE_PATH", f"{tempfile.mkdtemp()}/audit_store.json")
os.environ.setdefault("JWT_SECRET", "test-secret-that-is-long-enough-for-ci")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


def _auth_headers() -> dict[str, str]:
    bootstrap = client.post(
        "/auth/bootstrap-admin",
        json={
            "email": "admin@sentra.local",
            "password": "StrongPass123!",
            "name": "Sentra Admin",
        },
    )
    assert bootstrap.status_code in {200, 409}
    login = client.post(
        "/auth/login",
        json={"email": "admin@sentra.local", "password": "StrongPass123!"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_and_observability_endpoints() -> None:
    assert client.get("/health").status_code == 200
    assert client.get("/system/performance").status_code == 200
    assert client.get("/system/health/deep").status_code == 200
    metrics = client.get("/system/metrics")
    assert metrics.status_code == 200
    assert "sentra_requests_last_minute" in metrics.text


def test_auth_soc_geo_environment_osint_public_safety_smoke() -> None:
    headers = _auth_headers()
    for path in [
        "/auth/me",
        "/soc/live",
        "/geo/live",
        "/environment/live",
        "/osint/live",
        "/public-safety/live",
        "/system/observability",
    ]:
        response = client.get(path, headers=headers)
        assert response.status_code == 200, path


def test_incident_creation_and_logout() -> None:
    headers = _auth_headers()
    incident = client.post(
        "/incidents",
        headers=headers,
        json={
            "type": "fire",
            "severity": 4,
            "location": "Zone 2",
            "risk_level": "high",
            "incident_type": "critical_fire",
            "confidence": 0.91,
            "detected_by": "ci-smoke",
            "recommended_action": "Dispatch field team",
        },
    )
    assert incident.status_code in {200, 201}
    logout = client.post("/auth/logout", headers=headers)
    assert logout.status_code == 200

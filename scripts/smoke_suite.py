"""FastAPI smoke suite for production launch-critical routes."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app


def main() -> int:
    results: list[dict[str, Any]] = []
    with TestClient(app) as client:
        login = client.post("/auth/login", json={"email": "admin@sentra.local", "password": "admin123"})
        results.append({"route": "POST /auth/login", "status": login.status_code})
        token = None
        if login.headers.get("content-type", "").startswith("application/json"):
            body = login.json()
            token = body.get("access_token") or body.get("data", {}).get("access_token")
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        for route in [
            "/auth/me",
            "/billing/plans",
            "/crm/leads",
            "/success/live",
            "/world/live",
            "/government/live",
            "/autonomy/live",
            "/execution/live",
            "/ops/launch-readiness",
        ]:
            response = client.get(route, headers=headers)
            results.append({"route": f"GET {route}", "status": response.status_code})
    ok = all(item["status"] < 500 for item in results)
    print(json.dumps({"ok": ok, "results": results}, indent=2))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())

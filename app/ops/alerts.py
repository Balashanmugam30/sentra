"""Operational alert synthesis."""

from __future__ import annotations

from typing import Any

from app.core.observability import compute_operational_alerts
from app.security.session_guard import session_anomaly_snapshot


def platform_alerts() -> dict[str, Any]:
    alerts = compute_operational_alerts()
    session = session_anomaly_snapshot()
    if session["anomalies"]:
        alerts.append(
            {
                "alert_id": "OPS-SESSION-ANOMALY",
                "severity": "warning",
                "title": "Session anomaly detected",
                "description": "A session was observed across unusual IP/user-agent patterns.",
                "recommended_action": "Review auth audit trail and rotate affected refresh tokens.",
            }
        )
    return {"alerts": alerts, "session_anomalies": session}


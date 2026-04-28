from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def days_until(date_value: str) -> int:
    try:
        target = datetime.fromisoformat(str(date_value))
    except ValueError:
        return 365
    if target.tzinfo is None:
        target = target.replace(tzinfo=timezone.utc)
    return (target - datetime.now(timezone.utc)).days


def health_band(score: int) -> str:
    if score >= 78:
        return "healthy"
    if score >= 62:
        return "watch"
    if score >= 42:
        return "risk"
    return "critical"


def compute_health(account: dict[str, Any]) -> dict[str, Any]:
    seat_utilization = min(100, round((int(account["seats_used"]) / max(1, int(account["seats_limit"]))) * 100))
    feature_depth = round(sum(int(value) for value in account["feature_usage"].values()) / max(1, len(account["feature_usage"])))
    nps_quality = int(account["NPS_score"]) * 10
    support_satisfaction = round((int(account["CSAT_score"]) + max(0, 100 - int(account["support_tickets"]) * 6)) / 2)
    payment_score = 100 if account.get("payment_status") == "healthy" else 35
    renewal_days = days_until(str(account["renewal_date"]))
    renewal_score = 100 if renewal_days > 90 else 78 if renewal_days > 45 else 55 if renewal_days > 14 else 35
    sentiment_score = {"rising": 100, "stable": 78, "falling": 42}.get(str(account.get("sentiment_trend")), 65)
    score = round(
        int(account["adoption_score"]) * 0.18
        + int(account["login_frequency"]) * 0.13
        + seat_utilization * 0.1
        + feature_depth * 0.12
        + int(account["stakeholder_engagement"]) * 0.12
        + support_satisfaction * 0.12
        + int(account["uptime_experience"]) * 0.08
        + payment_score * 0.08
        + renewal_score * 0.04
        + sentiment_score * 0.03
    )
    drivers: list[str] = []
    risks: list[str] = []
    if int(account["adoption_score"]) >= 75:
        drivers.append("Strong product adoption")
    if feature_depth >= 70:
        drivers.append("Broad feature depth across command modules")
    if int(account["stakeholder_engagement"]) >= 75:
        drivers.append("Executive stakeholder engagement is active")
    if seat_utilization < 35:
        risks.append("Seat utilization is below expansion baseline")
    if int(account["NPS_score"]) <= 6:
        risks.append("NPS indicates detractor or passive sentiment")
    if int(account["support_tickets"]) >= 8:
        risks.append("Support escalation volume is elevated")
    if account.get("payment_status") != "healthy":
        risks.append("Payment health is degraded")
    if renewal_days <= 30:
        risks.append("Renewal window is approaching")

    return {
        "tenant_id": account["tenant_id"],
        "workspace_name": account["workspace_name"],
        "health_score": max(0, min(100, score)),
        "status": health_band(score),
        "drivers": drivers or ["Baseline usage is stable"],
        "risks": risks,
        "trend": str(account.get("sentiment_trend") or "stable"),
    }

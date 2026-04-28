from __future__ import annotations

from typing import Any

from app.customer_success.health import compute_health, days_until, health_band


def predict_churn(account: dict[str, Any]) -> dict[str, Any]:
    health = compute_health(account)
    risk = max(0, 100 - int(health["health_score"]))
    causes: list[str] = []
    if int(account["login_frequency"]) < 45:
        risk += 12
        causes.append("Declining weekly active usage")
    if int(account["stakeholder_engagement"]) < 45:
        risk += 10
        causes.append("Inactive executive stakeholders")
    if int(account["NPS_score"]) <= 6:
        risk += 12
        causes.append("Poor NPS sentiment")
    if account.get("payment_status") != "healthy":
        risk += 16
        causes.append("Failed or degraded payment status")
    if int(account["support_tickets"]) >= 8:
        risk += 10
        causes.append("Support escalations are elevated")
    if int(account["adoption_score"]) < 55:
        risk += 12
        causes.append("Low product adoption")
    if int(account["seats_used"]) / max(1, int(account["seats_limit"])) < 0.35:
        risk += 8
        causes.append("Seat utilization is low")
    if days_until(str(account["renewal_date"])) <= 30:
        risk += 8
        causes.append("Renewal is approaching")

    risk_percent = max(0, min(100, risk))
    save_actions = []
    if "Poor NPS sentiment" in causes:
        save_actions.append("Schedule executive listening session within 72 hours")
    if "Low product adoption" in causes or "Declining weekly active usage" in causes:
        save_actions.append("Run adoption rescue workshop with admin team")
    if "Failed or degraded payment status" in causes:
        save_actions.append("Trigger billing recovery and commercial save offer")
    if days_until(str(account["renewal_date"])) <= 30:
        save_actions.append("Prioritize renewal call and confirm decision makers")
    save_actions.append("Assign CSM owner to weekly rescue cadence")
    severity = health_band(100 - risk_percent)
    return {
        "tenant_id": account["tenant_id"],
        "workspace_name": account["workspace_name"],
        "risk_percent": risk_percent,
        "top_causes": causes or ["No critical churn drivers detected"],
        "save_actions": save_actions,
        "estimated_revenue_at_risk": round(int(account["contract_value"]) * risk_percent / 100),
        "severity": severity,
    }

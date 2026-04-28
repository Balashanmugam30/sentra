from __future__ import annotations

from typing import Any

from app.customer_success.churn import predict_churn
from app.customer_success.health import days_until


def renewal_bucket(days: int) -> str:
    if days < 0:
        return "overdue"
    if days <= 7:
        return "due_this_week"
    if days <= 14:
        return "due_in_14d"
    if days <= 30:
        return "due_in_30d"
    if days <= 60:
        return "due_in_60d"
    if days <= 90:
        return "due_in_90d"
    return "future"


def build_renewal(account: dict[str, Any]) -> dict[str, Any]:
    days = days_until(str(account["renewal_date"]))
    churn = predict_churn(account)
    probability = max(12, min(96, 100 - int(churn["risk_percent"]) + int(account["stakeholder_engagement"]) // 7))
    blockers = []
    if int(churn["risk_percent"]) >= 55:
        blockers.append("Customer health risk requires save plan")
    if int(account["support_tickets"]) >= 8:
        blockers.append("Open support escalations")
    if account.get("payment_status") != "healthy":
        blockers.append("Billing recovery needed")
    return {
        "tenant_id": account["tenant_id"],
        "workspace_name": account["workspace_name"],
        "renewal_date": account["renewal_date"],
        "days_until_renewal": days,
        "bucket": renewal_bucket(days),
        "renewal_probability": probability,
        "owner": account["account_owner"],
        "blockers": blockers,
        "decision_makers": ["Executive sponsor", "Security leader", "Operations owner"],
        "last_touchpoint": "QBR scheduled" if int(account["stakeholder_engagement"]) >= 70 else "CSM follow-up pending",
        "expansion_opportunity": int(account["expansion_potential"]),
        "contract_value": int(account["contract_value"]),
    }

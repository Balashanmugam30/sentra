from __future__ import annotations

from typing import Any
from uuid import uuid4

from app.customer_success.churn import predict_churn
from app.customer_success.expansion import detect_expansion
from app.customer_success.renewals import build_renewal


def build_copilot_actions(accounts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    actions: list[dict[str, Any]] = []
    for account in accounts:
        churn = predict_churn(account)
        expansion = detect_expansion(account)
        renewal = build_renewal(account)
        if int(churn["risk_percent"]) >= 62:
            actions.append(
                _action(
                    account,
                    "Trigger account rescue motion",
                    f"{account['workspace_name']} has {churn['risk_percent']}% churn risk from {', '.join(churn['top_causes'][:2])}.",
                    "critical",
                    "Protects revenue at risk and rebuilds executive trust",
                    "48h",
                )
            )
        if int(renewal["days_until_renewal"]) <= 60:
            actions.append(
                _action(
                    account,
                    "Prioritize renewal call",
                    f"Renewal is in {renewal['days_until_renewal']} days with {renewal['renewal_probability']}% probability.",
                    "high" if int(renewal["days_until_renewal"]) <= 30 else "medium",
                    "Improves renewal certainty and surfaces blockers early",
                    "7d",
                )
            )
        if int(expansion["opportunity_score"]) >= 70:
            actions.append(
                _action(
                    account,
                    f"Offer {expansion['recommended_offer']}",
                    f"Expansion score is {expansion['opportunity_score']} with ${expansion['expected_MRR_gain']} expected MRR gain.",
                    "high",
                    "Creates expansion revenue and improves NRR",
                    "14d",
                )
            )
        if int(account["adoption_score"]) < 60:
            actions.append(
                _action(
                    account,
                    "Send adoption guide and book admin training",
                    "Usage depth and adoption are below customer health baseline.",
                    "medium",
                    "Raises activation and reduces silent churn risk",
                    "5d",
                )
            )
    return sorted(actions, key=lambda item: {"critical": 0, "high": 1, "medium": 2, "low": 3}[item["priority"]])[:12]


def _action(
    account: dict[str, Any],
    recommendation: str,
    why: str,
    priority: str,
    expected_impact: str,
    due: str,
) -> dict[str, Any]:
    return {
        "action_id": f"CS-AI-{uuid4().hex[:8].upper()}",
        "tenant_id": account["tenant_id"],
        "workspace_name": account["workspace_name"],
        "recommendation": recommendation,
        "why": why,
        "priority": priority,
        "expected_impact": expected_impact,
        "owner": account["account_owner"],
        "due": due,
    }

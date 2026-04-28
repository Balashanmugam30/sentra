from __future__ import annotations

from typing import Any


def detect_expansion(account: dict[str, Any]) -> dict[str, Any]:
    seat_utilization = round((int(account["seats_used"]) / max(1, int(account["seats_limit"]))) * 100)
    feature_depth = round(sum(int(value) for value in account["feature_usage"].values()) / max(1, len(account["feature_usage"])))
    score = round(
        seat_utilization * 0.28
        + feature_depth * 0.24
        + int(account["adoption_score"]) * 0.2
        + int(account["stakeholder_engagement"]) * 0.16
        + max(0, int(account["NPS_score"]) * 10) * 0.12
    )
    signals: list[str] = []
    if seat_utilization >= 70:
        signals.append("Seat utilization supports seat expansion")
    if feature_depth >= 75:
        signals.append("Broad module usage supports enterprise upgrade")
    if int(account["AI_actions_used"]) >= 180:
        signals.append("High AI action volume supports advanced AI packaging")
    if account["plan"] in {"starter", "business"}:
        signals.append("Plan tier has clear upgrade path")
    if int(account["NPS_score"]) >= 8:
        signals.append("Promoter sentiment supports expansion ask")
    offer = "Enterprise security + advanced AI upgrade"
    if account["plan"] == "government":
        offer = "Government multi-site command expansion"
    elif seat_utilization >= 70:
        offer = "Seat expansion and multi-department rollout"
    elif feature_depth >= 75:
        offer = "White-label analytics and executive reports"
    gain = max(1_500, round(int(account["MRR"]) * min(0.45, max(0.12, score / 220))))
    return {
        "tenant_id": account["tenant_id"],
        "workspace_name": account["workspace_name"],
        "opportunity_score": max(0, min(100, score)),
        "expected_MRR_gain": gain,
        "recommended_offer": offer,
        "close_probability": max(20, min(88, round(score * 0.78))),
        "signals": signals or ["Expansion requires more adoption signal"],
    }

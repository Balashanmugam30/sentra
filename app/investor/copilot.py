from __future__ import annotations

from typing import Any


def build_copilot(metrics: dict[str, Any], readiness: dict[str, Any], valuation: dict[str, Any], investors: list[dict[str, Any]]) -> dict[str, Any]:
    best_investors = sorted(investors, key=lambda investor: int(investor["interest_score"]), reverse=True)[:3]
    return {
        "recommended_raise": "$10M Series A",
        "realistic_valuation": "$62M base with credible path to $110M aggressive if UAE/GovTech traction closes.",
        "series_a_ready": readiness["score"] >= 80,
        "metrics_that_hurt": ["Negative EBITDA margin", "SOC2 still in progress", "Government procurement cycle length"],
        "next_90_days": readiness["ninety_day_priorities"],
        "best_fit_investors": best_investors,
        "maximize_valuation": [
            "Close one $1M+ ARR government or critical infrastructure deal.",
            "Package AI command moat into investor narrative and technical proof.",
            "Complete due diligence vault to 90%+ readiness.",
            "Show repeatable channel-led launch in UAE and India.",
        ],
        "strategic_answer": "Raise $10M now while runway is strong; negotiate from strength around AI moat, NRR, and government expansion.",
    }


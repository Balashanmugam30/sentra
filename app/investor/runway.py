from __future__ import annotations

from typing import Any


def build_runway(metrics: dict[str, Any]) -> dict[str, Any]:
    cash = int(metrics["cash_on_hand"])
    burn = int(metrics["monthly_burn"])
    runway_months = round(cash / max(1, burn))
    survival_score = min(100, round(runway_months * 2.4 + int(metrics["gross_margin_percent"]) * 0.28))
    return {
        "cash_on_hand": cash,
        "monthly_burn": burn,
        "net_burn": int(metrics["net_burn"]),
        "runway_months": runway_months,
        "hiring_impact": {
            "hire_10_engineers": {"monthly_burn_delta": 90_000, "runway_months": round(cash / (burn + 90_000))},
            "hire_25_sales_reps": {"monthly_burn_delta": 275_000, "runway_months": round(cash / (burn + 275_000))},
        },
        "raise_required": 8_500_000,
        "survival_score": survival_score,
        "scenarios": [
            {"action": "Cut burn 20%", "runway_months": round(cash / (burn * 0.8)), "impact": "Extends runway while preserving core AI roadmap."},
            {"action": "Raise $2M", "runway_months": round((cash + 2_000_000) / burn), "impact": "Adds bridge optionality."},
            {"action": "Raise $10M", "runway_months": round((cash + 10_000_000) / burn), "impact": "Funds global GTM and enterprise security certification."},
            {"action": "Land $1M ARR deal", "runway_months": runway_months + 5, "impact": "Improves burn multiple and Series A narrative."},
            {"action": "Reduce churn by 2%", "runway_months": runway_months + 2, "impact": "Raises NRR quality and valuation confidence."},
        ],
    }


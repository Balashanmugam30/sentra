from __future__ import annotations

from typing import Any


def build_fundraising_readiness(metrics: dict[str, Any]) -> dict[str, Any]:
    drivers = {
        "revenue_maturity": 78,
        "growth_rate": min(100, round(int(metrics["YoY_growth_percent"]) / 2)),
        "churn_quality": 86,
        "security_posture": 92,
        "product_depth": 96,
        "GTM_repeatability": 82,
        "team_maturity": 74,
        "market_size": 93,
        "AI_moat": 95,
        "investor_narrative_quality": 89,
    }
    score = round(sum(drivers.values()) / len(drivers))
    readiness_class = "Growth Equity Ready" if score >= 92 else "Series B Ready" if score >= 84 else "Series A Ready" if score >= 74 else "Seed Ready"
    return {
        "score": score,
        "class": readiness_class,
        "drivers": drivers,
        "raise_recommendation": {"amount": 10_000_000, "target_valuation": 62_000_000, "instrument": "priced Series A"},
        "ninety_day_priorities": [
            "Close $1M+ government reference deal.",
            "Complete SOC2 evidence package.",
            "Show repeatable UAE and India GTM motion.",
            "Turn AI command moat into concise board narrative.",
        ],
    }


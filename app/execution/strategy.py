from __future__ import annotations

from typing import Any


def build_strategy_plan(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "company_readiness_score": 92,
        "strategic_confidence_score": int(metrics["CEO_confidence"]),
        "revenue_trajectory": "triple-digit growth with global GTM leverage",
        "risk_pressure": 34,
        "top_board_priorities": [
            "Close UAE anchor customer.",
            "Turn partner distribution into repeatable GTM motion.",
            "Protect 36 month runway while hiring quota-carrying leaders.",
            "Complete enterprise security controls for government procurement.",
            "Use M&A only if it accelerates communications distribution.",
        ],
        "plan_30_60_90": {
            "30_days": ["Lock UAE decision makers", "Freeze non-core hiring", "Run CAC reduction sprint"],
            "60_days": ["Launch partner-led sales blitz", "Complete security evidence pack", "Build Singapore HQ plan"],
            "90_days": ["Close anchor deal", "Prepare Series C narrative", "Evaluate acquisition target"],
        },
        "expansion_recommendations": ["UAE first", "Singapore healthcare second", "Germany public sector third"],
        "acquisition_recommendations": ["Civic SMS alerting", "Public-sector workflow automation", "Facility IoT connector"],
    }

from __future__ import annotations

from typing import Any

from app.execution.strategy import build_strategy_plan


def build_ceo_ai(metrics: dict[str, Any]) -> dict[str, Any]:
    strategy = build_strategy_plan(metrics)
    return {
        **strategy,
        "CEO_agent": "Hold pricing power, defend cash, and concentrate expansion through UAE plus partner-led public-sector motion.",
        "operating_posture": "dominant but disciplined",
        "recommended_mode": "aggressive_growth_with_cost_guardrails",
        "next_review": "weekly executive council",
    }

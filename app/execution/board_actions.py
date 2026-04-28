from __future__ import annotations

from typing import Any

from app.execution.models import BOARD_ACTIONS


def build_board_actions(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "board_readiness": int(metrics["board_readiness"]),
        "recommended_actions": list(BOARD_ACTIONS),
        "decision_posture": "approve growth with CFO guardrails",
        "top_vote": BOARD_ACTIONS[0],
    }

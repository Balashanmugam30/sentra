from __future__ import annotations

from typing import Any


def build_wargame(metrics: dict[str, Any]) -> dict[str, Any]:
    options = [
        {"option": "Option A", "name": "Civilian-led evacuation first", "lives_saved": 78, "cost": 210_000_000, "stability": 82, "recovery_speed": 76, "reputation": 88, "international_confidence": 84},
        {"option": "Option B", "name": "Military logistics surge", "lives_saved": 86, "cost": 340_000_000, "stability": 90, "recovery_speed": 89, "reputation": 82, "international_confidence": 91},
        {"option": "Option C", "name": "Infrastructure protection first", "lives_saved": 69, "cost": 160_000_000, "stability": 86, "recovery_speed": 81, "reputation": 79, "international_confidence": 80},
    ]
    winner = max(options, key=lambda item: item["lives_saved"] + item["stability"] + item["recovery_speed"] + item["international_confidence"] - item["cost"] / 20_000_000)
    return {
        "options": options,
        "winning_option": winner,
        "war_game_status": "executive_ready",
        "scenario": "Cyclone plus grid instability",
        "confidence": int(metrics["recovery_confidence"]),
    }

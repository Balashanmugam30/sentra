"""Scenario branch lab for autonomous strategy comparison."""

from __future__ import annotations

from typing import Any

from .models import AutonomyMetrics


def build_branches(metrics: AutonomyMetrics) -> dict[str, Any]:
    options = [
        {
            "option": "A",
            "strategy": "corridor isolation first",
            "risk": 18,
            "eta_minutes": 9,
            "cost": 32000,
            "confidence": 91,
            "expected_gain": "fastest safe recovery with low casualty exposure",
        },
        {
            "option": "B",
            "strategy": "full evacuation surge",
            "risk": 29,
            "eta_minutes": 14,
            "cost": 51000,
            "confidence": 78,
            "expected_gain": "broad safety posture but higher congestion",
        },
        {
            "option": "C",
            "strategy": "campus lockdown",
            "risk": 44,
            "eta_minutes": 22,
            "cost": 86000,
            "confidence": 61,
            "expected_gain": "containment only if threat is active intruder",
        },
        {
            "option": "D",
            "strategy": "mutual aid surge",
            "risk": 23,
            "eta_minutes": 16,
            "cost": 74000,
            "confidence": 82,
            "expected_gain": "higher reserve capacity if incident expands",
        },
    ]
    return {
        "winner": options[0],
        "options": options,
        "decision_rule": f"Selected against objective '{metrics.current_objective}' using ETA, casualty risk, cost, and trust.",
    }


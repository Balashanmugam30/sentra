from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ai.decision_engine import build_autonomous_snapshot, set_test_scenario
from app.ai.orchestration import build_predictive_forecast
from app.ai.strategic_learning import STRATEGIC_SCENARIOS, build_weak_signals


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clamp(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, round(value)))


def _chains_for(threat: str) -> tuple[str, list[str], list[str], str]:
    if "cyber" in threat:
        return (
            "Command trust degradation",
            ["access control failure", "elevator control uncertainty", "responder routing friction"],
            ["panic crowding", "media backlash", "executive continuity pressure"],
            "Freeze privileged actions and move to verified manual command channel",
        )
    if "misinformation" in threat:
        return (
            "Narrative pressure spike",
            ["rumor panic", "crowd misrouting", "public-safety congestion"],
            ["reputation damage", "operator distraction", "delayed stabilization"],
            "Publish verified statement before rumor velocity crosses crowd threshold",
        )
    if "power" in threat or "storm" in threat:
        return (
            "Utility resilience loss",
            ["lighting degradation", "network instability", "field sync delays"],
            ["medical staging delay", "facility automation fallback", "executive continuity pressure"],
            "Activate backup power and offline-local routing before system health degrades",
        )
    if "panic" in threat or "crowd" in threat:
        return (
            "Crowd pressure acceleration",
            ["gate choke", "evacuation hesitation", "responder access delay"],
            ["casualty risk", "rumor amplification", "traffic spillover"],
            "Pause inflow and open supervised outbound corridors",
        )
    return (
        "Hazard spread from primary zone",
        ["smoke spread", "evacuation surge", "traffic choke"],
        ["rumor panic", "medical overload", "executive pressure"],
        "Protect corridor-first evacuation before selective containment",
    )


def build_cascade_snapshot() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    forecast = build_predictive_forecast()["forecasts"]
    weak = build_weak_signals()["highest_probability"]
    threat = str(live["top_threat"])
    first, secondary, tertiary, interruption = _chains_for(threat)
    urgency = int(live["urgency_score"])
    confidence = int(live["confidence_score"])
    nodes: list[dict[str, Any]] = []
    for index, effect in enumerate([first, *secondary, *tertiary], start=1):
        nodes.append(
            {
                "node_id": f"CAS-{index:02d}",
                "label": effect,
                "stage": "first" if index == 1 else "secondary" if index <= 4 else "tertiary",
                "probability": _clamp(urgency * 0.58 + index * 5 - confidence * 0.12),
                "time_window": ["0-5 min", "5-15 min", "15-30 min", "30-60 min", "1-2 hr", "2-4 hr", "4-6 hr"][index - 1],
                "interruption_value": _clamp(100 - index * 8 + confidence * 0.12),
            }
        )
    breakpoints = [
        f"Forecast escalation reaches {forecast[1]['escalation_probability']}% by {forecast[1]['horizon']}",
        f"Weak signal probability reaches {weak['probability_of_incident']}%",
        f"Containment probability below {forecast[2]['containment_probability']}% at {forecast[2]['horizon']}",
    ]
    return {
        "generated_at": _now(),
        "scenario": threat,
        "first_impact": first,
        "secondary_chain": secondary,
        "tertiary_chain": tertiary,
        "chain_nodes": nodes,
        "containment_breakpoints": breakpoints,
        "best_interruption_node": interruption,
        "cascade_risk_score": _clamp(urgency * 0.72 + weak["probability_of_incident"] * 0.28),
        "summary": f"{first} can cascade into {secondary[0]} unless Sentra interrupts at: {interruption}.",
    }


def test_cascade_scenario(scenario: str | None = None) -> dict[str, Any]:
    if scenario and scenario in STRATEGIC_SCENARIOS:
        set_test_scenario(str(STRATEGIC_SCENARIOS[scenario]["mapped"]))
    return build_cascade_snapshot()

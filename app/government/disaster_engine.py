from __future__ import annotations

from typing import Any


DISASTER_SCENARIOS: tuple[dict[str, Any], ...] = (
    {"scenario": "Flood", "casualty_estimate": 420, "recovery_eta": "11 days", "financial_damage": 185_000_000, "resource_gaps": ["water rescue units", "temporary shelters"]},
    {"scenario": "Earthquake", "casualty_estimate": 1_840, "recovery_eta": "46 days", "financial_damage": 1_250_000_000, "resource_gaps": ["heavy lift equipment", "field hospitals"]},
    {"scenario": "Terror attack", "casualty_estimate": 96, "recovery_eta": "72 hours", "financial_damage": 92_000_000, "resource_gaps": ["forensic teams", "counter-drone coverage"]},
    {"scenario": "Chemical leak", "casualty_estimate": 310, "recovery_eta": "5 days", "financial_damage": 140_000_000, "resource_gaps": ["hazmat suits", "mobile decontamination"]},
    {"scenario": "Power outage", "casualty_estimate": 54, "recovery_eta": "38 hours", "financial_damage": 310_000_000, "resource_gaps": ["mobile generators", "telecom backup fuel"]},
    {"scenario": "Wildfire", "casualty_estimate": 220, "recovery_eta": "14 days", "financial_damage": 460_000_000, "resource_gaps": ["aerial suppression", "evacuation buses"]},
    {"scenario": "Cyclone", "casualty_estimate": 690, "recovery_eta": "21 days", "financial_damage": 720_000_000, "resource_gaps": ["coastal shelters", "grid repair crews"]},
    {"scenario": "Pandemic wave", "casualty_estimate": 2_300, "recovery_eta": "90 days", "financial_damage": 2_600_000_000, "resource_gaps": ["ICU surge beds", "regional oxygen reserves"]},
)


def build_disaster_engine(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "active_scenario": "Cyclone",
        "scenarios": list(DISASTER_SCENARIOS),
        "best_response_plan": [
            "Pre-position military logistics and telecom backup nodes.",
            "Open emergency hospitals in south and coastal corridors.",
            "Shift evacuees through rail and university shelter grids.",
            "Route public messaging through verified multi-agency channels.",
        ],
        "recovery_confidence": int(metrics["recovery_confidence"]),
    }


def run_disaster_simulation(metrics: dict[str, Any], scenario: str | None = None) -> dict[str, Any]:
    selected = scenario or "Cyclone"
    match = next((item for item in DISASTER_SCENARIOS if item["scenario"].lower() == selected.lower()), DISASTER_SCENARIOS[6])
    return {
        **match,
        "scenario": selected,
        "best_response_plan": [
            "Activate national incident command.",
            "Deploy reserves to highest-risk region.",
            "Open emergency medical corridors.",
            "Protect grid and telecom continuity first.",
        ],
        "recovery_confidence": int(metrics["recovery_confidence"]),
        "international_confidence": 84,
    }

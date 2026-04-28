from __future__ import annotations

from app.models.incident import Incident
from app.prediction.memory import generate_memory_snapshot


def generate_learning_decisions(incidents: list[Incident]) -> dict[str, object]:
    memory = generate_memory_snapshot(incidents)
    adaptive_actions: list[str] = []

    if memory["trusted_safe_zones"]:
        preferred_zone = memory["trusted_safe_zones"][0].zone
        adaptive_actions.append(f"Prefer evacuation toward {preferred_zone}")

    fire_effectiveness = [
        item
        for item in memory["resource_effectiveness"]
        if item.best_unit == "fire_team"
    ]
    if fire_effectiveness:
        adaptive_actions.append(
            f"Pre-stage fire teams near {fire_effectiveness[0].zone}"
        )

    if memory["hotspot_zones"]:
        avoid_zone = memory["hotspot_zones"][0].zone
        adaptive_actions.append(
            f"Avoid {avoid_zone} corridor during spread events"
        )

    if memory["historical_route_success"]:
        best_route = memory["historical_route_success"][0]
        adaptive_actions.append(
            f"Keep route {best_route.from_zone} to {best_route.to_zone} as primary fallback"
        )

    confidence = min(
        95,
        35 + round(memory["total_incidents_observed"] * 1.2),
    )

    return {
        "adaptive_actions": adaptive_actions[:4],
        "confidence": confidence,
        "based_on_events": memory["total_incidents_observed"],
    }

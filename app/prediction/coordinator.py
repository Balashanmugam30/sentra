from __future__ import annotations

from app.models.incident import Incident
from app.prediction.commander import generate_commander_decisions
from app.prediction.communications import generate_communications_intelligence
from app.prediction.evacuation import generate_evacuation_recommendations
from app.prediction.fire_spread import forecastFireSpread
from app.prediction.learning import generate_learning_decisions
from app.prediction.memory import generate_memory_snapshot
from app.prediction.resources import generate_resource_deployments
from app.prediction.schemas import CoordinatedActionItem, CoordinatorConflictItem
from app.prediction.service import generate_predictions


def _system_health(
    critical_prediction_count: int,
    critical_spread_count: int,
    blocked_zone_count: int,
) -> str:
    critical_zone_pressure = max(
        critical_prediction_count,
        critical_spread_count,
        blocked_zone_count,
    )

    if critical_zone_pressure >= 3:
        return "critical"

    if critical_zone_pressure >= 1:
        return "elevated"

    return "normal"


def _global_mode(
    safe_zone_count: int,
    route_count: int,
    max_spread_probability: float,
) -> str:
    if safe_zone_count == 0:
        return "lockdown"

    if route_count > 0:
        return "evacuation"

    if max_spread_probability > 0.85:
        return "containment"

    return "stabilize"


def _conflicts(
    evacuation: dict[str, object],
    spread_forecasts: list[object],
    memory: dict[str, object],
) -> list[CoordinatorConflictItem]:
    safe_zone_names = {zone.zone for zone in evacuation["recommended_safe_zones"]}
    blocked_zone_names = {zone.zone for zone in evacuation["blocked_zones"]}
    forecast_targets = {forecast.target_zone for forecast in spread_forecasts}
    hotspot_names = {
        hotspot.zone for hotspot in memory["hotspot_zones"] if hotspot.score >= 75
    }

    items: list[CoordinatorConflictItem] = []

    for safe_zone in sorted(safe_zone_names & blocked_zone_names):
        items.append(
            CoordinatorConflictItem(
                source="evacuation",
                issue=f"{safe_zone} is marked safe while already blocked",
            )
        )

    for safe_zone in sorted(safe_zone_names & forecast_targets):
        items.append(
            CoordinatorConflictItem(
                source="evacuation",
                issue=f"{safe_zone} recommended as safe zone becoming unsafe",
            )
        )

    for safe_zone in sorted(safe_zone_names & hotspot_names):
        items.append(
            CoordinatorConflictItem(
                source="memory",
                issue=f"{safe_zone} is historically unstable for evacuation staging",
            )
        )

    return items


def _priority_stack(
    blocked_zones: list[object],
    spread_forecasts: list[object],
    commander: dict[str, object],
    safe_zones: list[object],
    memory: dict[str, object],
) -> list[str]:
    priorities: list[str] = []

    for blocked_zone in blocked_zones[:2]:
        priorities.append(f"Protect {blocked_zone.zone} civilians")

    if spread_forecasts:
        priorities.append(f"Contain {spread_forecasts[0].source_zone} fire")

    if commander["strategic_objectives"]:
        priorities.extend(commander["strategic_objectives"][:2])

    if memory["trusted_safe_zones"]:
        priorities.append(f"Preserve access to {memory['trusted_safe_zones'][0].zone}")
    elif safe_zones:
        priorities.append(f"Preserve access to {safe_zones[0].zone}")

    deduped: list[str] = []

    for item in priorities:
        if item not in deduped:
            deduped.append(item)

    return deduped[:4]


def _coordinated_actions(
    evacuation: dict[str, object],
    resources: dict[str, object],
    communications: dict[str, object],
    commander: dict[str, object],
    memory: dict[str, object],
    learning: dict[str, object],
    global_mode: str,
    conflicts: list[CoordinatorConflictItem],
) -> list[CoordinatedActionItem]:
    actions: list[CoordinatedActionItem] = []
    preferred_safe_zone = (
        memory["trusted_safe_zones"][0].zone
        if memory["trusted_safe_zones"]
        else None
    )

    if resources["deployments"]:
        actions.append(
            CoordinatedActionItem(
                agent="resources",
                action=f"redirect fire teams to {resources['deployments'][0].zone}",
            )
        )

    if evacuation["routes"]:
        route = evacuation["routes"][0]
        actions.append(
            CoordinatedActionItem(
                agent="communications",
                action=f"update occupants to reroute via {preferred_safe_zone or route.to_zone}",
            )
        )

    if commander["resource_orders"]:
        actions.append(
            CoordinatedActionItem(
                agent="commander",
                action=commander["resource_orders"][0],
            )
        )

    if conflicts:
        actions.append(
            CoordinatedActionItem(
                agent="evacuation",
                action="override compromised safe-zone guidance immediately",
            )
        )

    if global_mode == "lockdown":
        actions.append(
            CoordinatedActionItem(
                agent="communications",
                action="broadcast full lockdown instruction to all zones",
            )
        )

    if any(value == 0 for value in resources["available_units"].model_dump().values()):
        actions.append(
            CoordinatedActionItem(
                agent="resources",
                action="request external mutual aid support",
            )
        )

    if learning["adaptive_actions"]:
        for action in learning["adaptive_actions"][:2]:
            agent = "memory"
            if action.startswith("Prefer evacuation"):
                agent = "evacuation"
            elif action.startswith("Pre-stage fire teams"):
                agent = "resources"
            elif action.startswith("Avoid"):
                agent = "communications"

            actions.append(CoordinatedActionItem(agent=agent, action=action))

    if memory["resource_effectiveness"]:
        best_effect = memory["resource_effectiveness"][0]
        if best_effect.best_unit == "fire_team":
            actions.append(
                CoordinatedActionItem(
                    agent="resources",
                    action=f"pre-stage fire teams near {best_effect.zone}",
                )
            )

    deduped: list[CoordinatedActionItem] = []
    seen = set()

    for item in actions:
        key = (item.agent, item.action)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)

    return deduped[:5]


def _cross_agent_score(
    conflicts: list[CoordinatorConflictItem],
    communications: dict[str, object],
    commander: dict[str, object],
    resources: dict[str, object],
    learning: dict[str, object],
    health: str,
) -> int:
    score = 100
    score -= len(conflicts) * 18
    score -= len(communications["escalations"]) * 6
    score -= len(resources["shortages"]) * 5

    if commander["incident_mode"] in {"lockdown", "mass-casualty"}:
        score -= 8

    if health == "critical":
        score -= 10
    elif health == "elevated":
        score -= 4

    score += round((learning["confidence"] - 50) * 0.12)

    return max(0, min(100, score))


def _recommended_next_phase(global_mode: str, health: str, score: int) -> str:
    if global_mode == "lockdown":
        return "lockdown enforcement"

    if global_mode == "evacuation":
        return "stabilization"

    if global_mode == "containment":
        return "containment push"

    if health == "critical" or score < 60:
        return "reassessment"

    return "stabilization"


def generate_coordination_intelligence(incidents: list[Incident]) -> dict[str, object]:
    predictions = generate_predictions(incidents)
    spread_forecasts = forecastFireSpread(incidents)
    evacuation = generate_evacuation_recommendations(incidents)
    resources = generate_resource_deployments(incidents)
    communications = generate_communications_intelligence(incidents)
    commander = generate_commander_decisions(incidents)
    memory = generate_memory_snapshot(incidents)
    learning = generate_learning_decisions(incidents)

    critical_prediction_count = len(
        [prediction for prediction in predictions if prediction.risk_score >= 80]
    )
    critical_spread_count = len(
        [forecast for forecast in spread_forecasts if forecast.probability > 0.85]
    )
    blocked_zone_count = len(evacuation["blocked_zones"])
    max_spread_probability = max(
        (forecast.probability for forecast in spread_forecasts),
        default=0,
    )

    health = _system_health(
        critical_prediction_count,
        critical_spread_count,
        blocked_zone_count,
    )
    global_mode = _global_mode(
        len(evacuation["recommended_safe_zones"]),
        len(evacuation["routes"]),
        max_spread_probability,
    )
    conflicts = _conflicts(evacuation, spread_forecasts, memory)
    priority_stack = _priority_stack(
        evacuation["blocked_zones"],
        spread_forecasts,
        commander,
        evacuation["recommended_safe_zones"],
        memory,
    )
    coordinated_actions = _coordinated_actions(
        evacuation,
        resources,
        communications,
        commander,
        memory,
        learning,
        global_mode,
        conflicts,
    )
    cross_agent_score = _cross_agent_score(
        conflicts,
        communications,
        commander,
        resources,
        learning,
        health,
    )

    return {
        "global_mode": global_mode,
        "system_health": health,
        "conflicts_detected": conflicts,
        "priority_stack": priority_stack,
        "coordinated_actions": coordinated_actions,
        "cross_agent_score": cross_agent_score,
        "recommended_next_phase": _recommended_next_phase(
            global_mode,
            health,
            cross_agent_score,
        ),
    }

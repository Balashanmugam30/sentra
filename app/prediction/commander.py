from __future__ import annotations

from app.models.incident import Incident
from app.prediction.communications import generate_communications_intelligence
from app.prediction.decision_rules import (
    classify_incident_mode,
    executive_status,
)
from app.prediction.evacuation import generate_evacuation_recommendations
from app.prediction.fire_spread import forecastFireSpread
from app.prediction.resources import generate_resource_deployments
from app.prediction.schemas import CommanderActionItem
from app.prediction.service import generate_predictions


def _severity_index(
    max_risk: float,
    blocked_zone_count: int,
    critical_spread_count: int,
    global_load: str,
    threat_level: str,
) -> int:
    load_bonus = 0

    if global_load == "overloaded":
        load_bonus = 18
    elif global_load == "elevated":
        load_bonus = 9

    threat_bonus = 0

    if threat_level == "critical":
        threat_bonus = 12
    elif threat_level == "elevated":
        threat_bonus = 6

    score = round(
        (max_risk * 0.52)
        + (blocked_zone_count * 11)
        + (critical_spread_count * 7)
        + load_bonus
        + threat_bonus
    )

    return max(0, min(100, score))


def _top_actions(
    evacuation: dict[str, object],
    resources: dict[str, object],
    communications: dict[str, object],
) -> list[CommanderActionItem]:
    actions: list[str] = []

    for route in evacuation["routes"][:2]:
        actions.append(f"Evacuate {route.from_zone} immediately toward {route.to_zone}")

    for deployment in resources["deployments"][:2]:
        if deployment.priority in {"critical", "high"}:
            actions.append(f"Concentrate responders on {deployment.zone}")

    for escalation in communications["escalations"]:
        actions.append(escalation)

    deduped_actions: list[str] = []

    for action in actions:
        if action not in deduped_actions:
            deduped_actions.append(action)

    return [
        CommanderActionItem(priority=index + 1, title=title)
        for index, title in enumerate(deduped_actions[:4])
    ]


def _resource_orders(
    resources: dict[str, object],
    evacuation: dict[str, object],
) -> list[str]:
    deployments = resources["deployments"]

    if not deployments:
        return ["Maintain current standby posture"]

    critical_deployments = [
        deployment
        for deployment in deployments
        if deployment.priority == "critical"
    ]
    support_deployments = [
        deployment
        for deployment in deployments
        if deployment.priority in {"medium", "high"}
    ]

    orders: list[str] = []

    if resources["shortages"] and critical_deployments and support_deployments:
        source_zone = support_deployments[-1].zone
        target_zone = critical_deployments[0].zone
        orders.append(f"Reassign 1 fire team from {source_zone} to {target_zone}")

    for shortage in resources["shortages"][:2]:
        if "Medical" in shortage and critical_deployments:
            orders.append(f"Shift medical support toward {critical_deployments[0].zone}")
        elif "Security" in shortage and evacuation["blocked_zones"]:
            orders.append(f"Hold security cordon at {evacuation['blocked_zones'][0].zone}")
        elif "Drone" in shortage and critical_deployments:
            orders.append(f"Reserve drone overwatch for {critical_deployments[0].zone}")

    if not orders and critical_deployments:
        orders.append(f"Keep primary response package on {critical_deployments[0].zone}")

    deduped_orders: list[str] = []

    for order in orders:
        if order not in deduped_orders:
            deduped_orders.append(order)

    return deduped_orders[:3]


def _strategic_objectives(
    evacuation: dict[str, object],
    spread_forecasts: list[object],
    resources: dict[str, object],
) -> list[str]:
    objectives: list[str] = []

    if spread_forecasts:
        highest_forecast = spread_forecasts[0]
        objectives.append(f"Prevent spread to {highest_forecast.target_zone}")

    if evacuation["recommended_safe_zones"]:
        objectives.append(
            f"Protect safe zone {evacuation['recommended_safe_zones'][0].zone}"
        )

    if evacuation["routes"]:
        objectives.append("Preserve evacuation corridors")

    if any(deployment.medical_teams > 0 for deployment in resources["deployments"]):
        objectives.append("Maintain medical readiness")

    deduped_objectives: list[str] = []

    for objective in objectives:
        if objective not in deduped_objectives:
            deduped_objectives.append(objective)

    return deduped_objectives[:4]


def _next_15_min_plan(
    incident_mode: str,
    evacuation: dict[str, object],
    resources: dict[str, object],
) -> list[str]:
    phase_one = "0-5 min: confirm situational picture"
    phase_two = "5-10 min: maintain responder coordination"
    phase_three = "10-15 min: reassess stabilization status"

    if incident_mode in {"evacuation", "lockdown", "mass-casualty"}:
        phase_one = "0-5 min: full evacuation push"
    elif incident_mode == "response":
        phase_one = "0-5 min: targeted response activation"

    if resources["deployments"]:
        lead_zone = resources["deployments"][0].zone
        phase_two = f"5-10 min: suppression and perimeter control at {lead_zone}"

    if evacuation["blocked_zones"]:
        phase_three = "10-15 min: casualty sweep and corridor validation"

    return [phase_one, phase_two, phase_three]


def generate_commander_decisions(incidents: list[Incident]) -> dict[str, object]:
    predictions = generate_predictions(incidents)
    spread_forecasts = forecastFireSpread(incidents)
    evacuation = generate_evacuation_recommendations(incidents)
    resources = generate_resource_deployments(incidents)
    communications = generate_communications_intelligence(incidents)

    impacted_zone_count = len(
        {
            incident.location
            for incident in incidents
            if incident.status == "active"
        }
    )
    blocked_zone_count = len(evacuation["blocked_zones"])
    restricted_zone_count = len(
        {
            blocked.zone for blocked in evacuation["blocked_zones"]
        }
        | {forecast.target_zone for forecast in spread_forecasts}
    )
    critical_spread_count = len(
        [forecast for forecast in spread_forecasts if forecast.status == "critical"]
    )
    max_risk = max((prediction.risk_score for prediction in predictions), default=0)

    severity_index = _severity_index(
        max_risk,
        blocked_zone_count,
        critical_spread_count,
        resources["global_load"],
        communications["threat_level"],
    )
    incident_mode = classify_incident_mode(
        severity_index,
        blocked_zone_count,
        restricted_zone_count,
        impacted_zone_count,
        resources["global_load"],
    )

    return {
        "incident_mode": incident_mode,
        "severity_index": severity_index,
        "top_actions": _top_actions(evacuation, resources, communications),
        "resource_orders": _resource_orders(resources, evacuation),
        "strategic_objectives": _strategic_objectives(
            evacuation,
            spread_forecasts,
            resources,
        ),
        "next_15_min_plan": _next_15_min_plan(
            incident_mode,
            evacuation,
            resources,
        ),
        "executive_status": executive_status(severity_index),
    }

from __future__ import annotations

from app.models.incident import Incident
from app.prediction.commander import generate_commander_decisions
from app.prediction.communications import generate_communications_intelligence
from app.prediction.coordinator import generate_coordination_intelligence
from app.prediction.evacuation import generate_evacuation_recommendations
from app.prediction.fire_spread import forecastFireSpread
from app.prediction.memory import generate_memory_snapshot
from app.prediction.resources import generate_resource_deployments
from app.prediction.service import generate_predictions
from app.simulation.schemas import (
    CorridorTwinState,
    ResponderTwinState,
    ZoneTwinState,
)

ALL_ZONES = [f"Zone {index}" for index in range(1, 6)]


def _occupancy(zone: str) -> int:
    seed = sum(ord(character) for character in zone)
    return 40 + (seed % 61)


def _safe_score(
    zone: str,
    risk_score: int,
    blocked_zones: set[str],
    safe_zone_map: dict[str, int],
    trusted_safe_map: dict[str, int],
) -> int:
    base_score = safe_zone_map.get(zone, max(8, 100 - risk_score))
    trusted_bonus = round(trusted_safe_map.get(zone, 0) * 0.18)

    if zone in blocked_zones:
        return max(0, min(100, base_score - 45))

    return max(0, min(100, base_score + trusted_bonus))


def _zone_status(zone: str, risk_score: int, blocked_zones: set[str]) -> str:
    if risk_score >= 80:
        return "evacuating"

    if zone in blocked_zones:
        return "restricted"

    return "stable"


def _corridor_load(priority: str) -> int:
    if priority == "high":
        return 81

    if priority == "medium":
        return 58

    return 34


def _corridor_status(load: int) -> str:
    if load >= 70:
        return "busy"

    if load >= 40:
        return "moderate"

    return "clear"


def _system_health(level: str) -> str:
    if level == "critical":
        return "critical"

    if level == "elevated":
        return "stressed"

    return "healthy"


def _global_mode(
    coordinator_mode: str,
    coordinator_health: str,
    high_risk_zone_count: int,
    route_count: int,
) -> str:
    if coordinator_mode == "lockdown":
        return "lockdown"

    if coordinator_mode == "evacuation":
        return "evacuation"

    if coordinator_mode == "containment" or coordinator_health == "critical" or high_risk_zone_count >= 3:
        return "critical"

    if route_count > 0 or high_risk_zone_count > 0:
        return "caution"

    return "normal"


def _responders(resources: dict[str, object]) -> list[ResponderTwinState]:
    responders: list[ResponderTwinState] = []

    for deployment in resources["deployments"]:
        if deployment.fire_teams > 0:
            responders.append(
                ResponderTwinState(
                    team="fire",
                    target_zone=deployment.zone,
                    eta_minutes=deployment.eta_minutes,
                    status="enroute",
                )
            )

        if deployment.medical_teams > 0:
            responders.append(
                ResponderTwinState(
                    team="medical",
                    target_zone=deployment.zone,
                    eta_minutes=max(1, deployment.eta_minutes + 1),
                    status="staged",
                )
            )

        if deployment.security_teams > 0:
            responders.append(
                ResponderTwinState(
                    team="security",
                    target_zone=deployment.zone,
                    eta_minutes=max(1, deployment.eta_minutes + 1),
                    status="active",
                )
            )

        if deployment.drone_support:
            responders.append(
                ResponderTwinState(
                    team="drone",
                    target_zone=deployment.zone,
                    eta_minutes=max(1, deployment.eta_minutes - 1),
                    status="enroute",
                )
            )

    return responders


def generate_live_twin_state(incidents: list[Incident]) -> dict[str, object]:
    predictions = generate_predictions(incidents)
    spread_forecasts = forecastFireSpread(incidents)
    evacuation = generate_evacuation_recommendations(incidents)
    resources = generate_resource_deployments(incidents)
    communications = generate_communications_intelligence(incidents)
    commander = generate_commander_decisions(incidents)
    coordinator = generate_coordination_intelligence(incidents)
    memory = generate_memory_snapshot(incidents)

    prediction_map = {
        prediction.zone: round(prediction.risk_score)
        for prediction in predictions
    }
    blocked_zones = {zone.zone for zone in evacuation["blocked_zones"]}
    safe_zone_map = {
        zone.zone: zone.safety_score
        for zone in evacuation["recommended_safe_zones"]
    }
    trusted_safe_map = {
        zone.zone: zone.reliability
        for zone in memory["trusted_safe_zones"]
    }
    fire_threat_zones = {
        forecast.target_zone
        for forecast in spread_forecasts
    } | {
        forecast.source_zone
        for forecast in spread_forecasts
        if forecast.status == "critical"
    }

    zones = [
        ZoneTwinState(
            zone=zone,
            risk_score=prediction_map.get(zone, 0),
            occupancy=_occupancy(zone),
            status=_zone_status(zone, prediction_map.get(zone, 0), blocked_zones),
            safe_score=_safe_score(
                zone,
                prediction_map.get(zone, 0),
                blocked_zones,
                safe_zone_map,
                trusted_safe_map,
            ),
            fire_threat=zone in fire_threat_zones,
        )
        for zone in ALL_ZONES
    ]

    corridors = [
        CorridorTwinState(
            from_zone=route.from_zone,
            to_zone=route.to_zone,
            traffic_load=_corridor_load(route.priority),
            status=_corridor_status(_corridor_load(route.priority)),
        )
        for route in evacuation["routes"]
    ]

    responders = _responders(resources)
    high_risk_zone_count = len([zone for zone in zones if zone.risk_score >= 80])
    busy_corridor_count = len([corridor for corridor in corridors if corridor.status == "busy"])

    summary = [
        f"{high_risk_zone_count} zones under elevated threat",
        f"{busy_corridor_count} corridors congested",
        f"{len(responders)} responder teams active",
    ]

    if communications["occupant_alerts"]:
        summary.append(f"{len(communications['occupant_alerts'])} occupant alerts active")

    if commander["incident_mode"] in {"evacuation", "lockdown", "mass-casualty"}:
        summary.append(f"Commander mode {commander['incident_mode']}")

    return {
        "global_mode": _global_mode(
            coordinator["global_mode"],
            coordinator["system_health"],
            high_risk_zone_count,
            len(evacuation["routes"]),
        ),
        "system_health": _system_health(coordinator["system_health"]),
        "zones": zones,
        "corridors": corridors,
        "responders": responders,
        "summary": summary[:4],
    }

from __future__ import annotations

from app.models.incident import Incident
from app.prediction.evacuation import generate_evacuation_recommendations
from app.prediction.fire_spread import forecastFireSpread
from app.prediction.message_templates import (
    occupant_evacuation_message,
    occupant_prepare_message,
    occupant_safe_message,
    responder_fire_message,
    responder_medical_message,
    responder_security_message,
)
from app.prediction.resources import generate_resource_deployments
from app.prediction.schemas import (
    OccupantAlertItem,
    ResponderMessageItem,
)
from app.prediction.service import generate_predictions


def _threat_level(active_zone_count: int) -> str:
    if active_zone_count <= 1:
        return "normal"

    if active_zone_count <= 3:
        return "elevated"

    return "critical"


def _route_map(routes: list[object]) -> dict[str, str]:
    return {
        route.from_zone: route.to_zone
        for route in routes
    }


def _occupant_alerts(incidents: list[Incident]) -> list[OccupantAlertItem]:
    predictions = generate_predictions(incidents)
    evacuation = generate_evacuation_recommendations(incidents)
    spread_forecasts = forecastFireSpread(incidents)
    route_destinations = _route_map(evacuation["routes"])
    safe_zone_names = {zone.zone for zone in evacuation["recommended_safe_zones"]}
    danger_targets = {
        forecast.target_zone
        for forecast in spread_forecasts
        if forecast.status in {"watch", "danger"}
    }

    alerts_by_zone: dict[str, OccupantAlertItem] = {}

    for blocked_zone in evacuation["blocked_zones"]:
        alerts_by_zone[blocked_zone.zone] = OccupantAlertItem(
            zone=blocked_zone.zone,
            priority="critical",
            message=occupant_evacuation_message(
                blocked_zone.zone,
                route_destinations.get(blocked_zone.zone),
            ),
        )

    for zone in sorted(danger_targets):
        if zone in alerts_by_zone:
            continue

        alerts_by_zone[zone] = OccupantAlertItem(
            zone=zone,
            priority="elevated",
            message=occupant_prepare_message(zone),
        )

    prediction_map = {prediction.zone: prediction for prediction in predictions}

    for zone in sorted(safe_zone_names):
        if zone in alerts_by_zone:
            continue

        prediction = prediction_map.get(zone)

        if prediction is None or prediction.risk_score > 45:
            continue

        alerts_by_zone[zone] = OccupantAlertItem(
            zone=zone,
            priority="normal",
            message=occupant_safe_message(zone),
        )

    return sorted(
        alerts_by_zone.values(),
        key=lambda alert: (
            {"critical": 0, "elevated": 1, "normal": 2}[alert.priority],
            alert.zone,
        ),
    )


def _responder_messages(incidents: list[Incident]) -> list[ResponderMessageItem]:
    intelligence = generate_resource_deployments(incidents)
    messages: list[ResponderMessageItem] = []

    for deployment in intelligence["deployments"]:
        if deployment.priority not in {"critical", "high"}:
            continue

        if deployment.fire_teams > 0:
            messages.append(
                ResponderMessageItem(
                    team="fire",
                    zone=deployment.zone,
                    message=responder_fire_message(deployment.zone),
                )
            )

        if deployment.medical_teams > 0:
            messages.append(
                ResponderMessageItem(
                    team="medical",
                    zone=deployment.zone,
                    message=responder_medical_message(deployment.zone),
                )
            )

        if deployment.security_teams > 0:
            messages.append(
                ResponderMessageItem(
                    team="security",
                    zone=deployment.zone,
                    message=responder_security_message(deployment.zone),
                )
            )

    return messages


def _executive_summary(
    active_zone_count: int,
    blocked_zone_count: int,
    global_load: str,
    threat_level: str,
) -> list[str]:
    summary = [f"{active_zone_count} zones impacted", f"{blocked_zone_count} zones restricted"]

    if global_load != "normal":
        summary.append(f"Resource load {global_load}")

    if threat_level == "critical":
        summary.append("Executive oversight required")

    return summary


def _escalations(blocked_zone_count: int, global_load: str, threat_level: str) -> list[str]:
    notices: list[str] = []

    if global_load == "overloaded" or blocked_zone_count >= 3:
        notices.append("Request mutual aid support")

    if threat_level == "critical":
        notices.append("Activate executive crisis briefing")

    return notices


def generate_communications_intelligence(incidents: list[Incident]) -> dict[str, object]:
    active_zone_names = {
        incident.location
        for incident in incidents
        if incident.status == "active"
    }
    evacuation = generate_evacuation_recommendations(incidents)
    intelligence = generate_resource_deployments(incidents)
    blocked_zone_count = len(evacuation["blocked_zones"])
    threat_level = _threat_level(len(active_zone_names))

    return {
        "threat_level": threat_level,
        "occupant_alerts": _occupant_alerts(incidents),
        "responder_messages": _responder_messages(incidents),
        "executive_summary": _executive_summary(
            len(active_zone_names),
            blocked_zone_count,
            intelligence["global_load"],
            threat_level,
        ),
        "escalations": _escalations(
            blocked_zone_count,
            intelligence["global_load"],
            threat_level,
        ),
    }

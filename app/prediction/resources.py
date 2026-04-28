from __future__ import annotations

from collections import defaultdict
from copy import deepcopy

from app.models.incident import Incident
from app.prediction.evacuation import generate_evacuation_recommendations
from app.prediction.fire_spread import forecastFireSpread
from app.prediction.resource_rules import (
    DEFAULT_RESOURCE_POOL,
    classify_priority,
    containment_eta,
    default_eta,
)
from app.prediction.schemas import (
    AvailableUnits,
    FireSpreadForecastItem,
    PredictionItem,
    ResourceDeploymentItem,
)
from app.prediction.service import generate_predictions


def _score_zones(
    incidents: list[Incident],
    predictions: list[PredictionItem],
    spread_forecasts: list[FireSpreadForecastItem],
    blocked_zone_names: set[str],
) -> dict[str, int]:
    scores: dict[str, int] = defaultdict(int)

    for prediction in predictions:
        if prediction.risk_score >= 85:
            scores[prediction.zone] += 50

    for forecast in spread_forecasts:
        if forecast.status == "critical":
            scores[forecast.target_zone] += 40
            scores[forecast.source_zone] += 20

    for blocked_zone in blocked_zone_names:
        scores[blocked_zone] += 30

    for incident in incidents:
        if incident.status == "active":
            scores[incident.location] += incident.severity * 10

    return scores


def _build_deployment(
    zone: str,
    priority: str,
    remaining_units: dict[str, int],
) -> ResourceDeploymentItem:
    fire_teams = 0
    medical_teams = 0
    security_teams = 0
    drone_support = False

    if priority == "critical":
        fire_teams = min(2, remaining_units["fire_teams"])
        medical_teams = min(1, remaining_units["medical_teams"])
        security_teams = min(1, remaining_units["security_teams"])
        drone_support = remaining_units["drones"] > 0
    elif priority == "high":
        fire_teams = min(1, remaining_units["fire_teams"])
        medical_teams = min(1, remaining_units["medical_teams"])
        security_teams = min(1, remaining_units["security_teams"])
    elif priority == "medium":
        if remaining_units["fire_teams"] >= remaining_units["security_teams"] and remaining_units["fire_teams"] > 0:
            fire_teams = 1
        elif remaining_units["security_teams"] > 0:
            security_teams = 1

    remaining_units["fire_teams"] -= fire_teams
    remaining_units["medical_teams"] -= medical_teams
    remaining_units["security_teams"] -= security_teams

    if drone_support:
        remaining_units["drones"] -= 1

    return ResourceDeploymentItem(
        zone=zone,
        priority=priority,
        fire_teams=fire_teams,
        medical_teams=medical_teams,
        security_teams=security_teams,
        drone_support=drone_support,
        eta_minutes=default_eta(priority),
        containment_eta_minutes=containment_eta(priority),
    )


def _shortage_warnings(remaining_units: dict[str, int]) -> list[str]:
    warnings: list[str] = []

    if remaining_units["fire_teams"] <= 1:
        warnings.append("Fire teams nearing capacity")

    if remaining_units["medical_teams"] <= 1:
        warnings.append("Medical teams nearing capacity")

    if remaining_units["security_teams"] <= 1:
        warnings.append("Security teams nearing capacity")

    if remaining_units["drones"] == 0:
        warnings.append("Drone support fully allocated")

    return warnings


def _recommendations(deployments: list[ResourceDeploymentItem]) -> list[str]:
    recommendations: list[str] = []

    for deployment in deployments[:3]:
        if deployment.drone_support:
            recommendations.append(f"Dispatch drone to {deployment.zone}")
        elif deployment.security_teams > 0:
            recommendations.append(f"Reinforce {deployment.zone} perimeter")
        elif deployment.fire_teams > 0:
            recommendations.append(f"Dispatch fire team to {deployment.zone}")

    return recommendations


def _global_load(deployments: list[ResourceDeploymentItem]) -> str:
    count = len(deployments)

    if count <= 2:
        return "normal"

    if count <= 4:
        return "elevated"

    return "overloaded"


def generate_resource_deployments(incidents: list[Incident]) -> dict[str, object]:
    predictions = generate_predictions(incidents)
    spread_forecasts = forecastFireSpread(incidents)
    evacuation = generate_evacuation_recommendations(incidents)
    blocked_zone_names = {item.zone for item in evacuation["blocked_zones"]}
    zone_scores = _score_zones(incidents, predictions, spread_forecasts, blocked_zone_names)

    remaining_units = deepcopy(DEFAULT_RESOURCE_POOL)
    deployments: list[ResourceDeploymentItem] = []

    for zone, score in sorted(zone_scores.items(), key=lambda item: (-item[1], item[0])):
        priority = classify_priority(score)

        if priority == "low":
            continue

        deployment = _build_deployment(zone, priority, remaining_units)

        if (
            deployment.fire_teams == 0
            and deployment.medical_teams == 0
            and deployment.security_teams == 0
            and not deployment.drone_support
        ):
            continue

        deployments.append(deployment)

    return {
        "global_load": _global_load(deployments),
        "available_units": AvailableUnits(**remaining_units),
        "deployments": deployments,
        "shortages": _shortage_warnings(remaining_units),
        "recommendations": _recommendations(deployments),
    }

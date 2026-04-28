from __future__ import annotations

from collections import defaultdict

from app.models.incident import Incident
from app.prediction.schemas import FireSpreadForecastItem
from app.prediction.zone_graph import getAdjacentZones


def _base_probability(severity: int) -> float:
    if severity <= 2:
        return 0.45

    if severity == 3:
        return 0.72

    return 0.85


def _stable_variance(source_zone: str, target_zone: str, severity: int) -> float:
    seed = sum(ord(character) for character in f"{source_zone}:{target_zone}:{severity}")
    return (seed % 6) / 100


def _eta_minutes(source_zone: str, target_zone: str, severity: int) -> int:
    seed = sum(ord(character) for character in f"{source_zone}:{target_zone}")

    if severity <= 2:
        return 8 + (seed % 5)

    if severity == 3:
        return 4 + (seed % 4)

    return 2 + (seed % 3)


def _status_for_probability(probability: float) -> str:
    if probability < 0.5:
        return "watch"

    if probability < 0.75:
        return "danger"

    return "critical"


def forecastFireSpread(incidents: list[Incident]) -> list[FireSpreadForecastItem]:
    active_sources = [
        incident
        for incident in incidents
        if incident.status == "active" and incident.severity >= 2
    ]

    if not active_sources:
        return []

    incidents_by_zone: dict[str, list[Incident]] = defaultdict(list)

    for incident in active_sources:
        incidents_by_zone[incident.location].append(incident)

    forecasts_by_target: dict[str, FireSpreadForecastItem] = {}

    for incident in active_sources:
        repeated_zone_incidents = len(incidents_by_zone[incident.location])
        probability = _base_probability(incident.severity)

        if repeated_zone_incidents > 1:
            probability += 0.10

        probability += _stable_variance(
            incident.location,
            incident.location,
            incident.severity,
        )
        clamped_probability = round(min(0.98, probability), 2)
        heat_index = min(100, incident.severity * 25)

        for target_zone in getAdjacentZones(incident.location):
            target_probability = round(
                min(
                    0.98,
                    clamped_probability
                    + _stable_variance(incident.location, target_zone, incident.severity),
                ),
                2,
            )

            forecast = FireSpreadForecastItem(
                source_zone=incident.location,
                target_zone=target_zone,
                probability=target_probability,
                eta_minutes=_eta_minutes(
                    incident.location,
                    target_zone,
                    incident.severity,
                ),
                heat_index=heat_index,
                status=_status_for_probability(target_probability),
            )

            existing_forecast = forecasts_by_target.get(target_zone)

            if (
                existing_forecast is None
                or forecast.probability > existing_forecast.probability
                or (
                    forecast.probability == existing_forecast.probability
                    and forecast.eta_minutes < existing_forecast.eta_minutes
                )
            ):
                forecasts_by_target[target_zone] = forecast

    return sorted(
        forecasts_by_target.values(),
        key=lambda forecast: (
            -forecast.probability,
            forecast.eta_minutes,
            forecast.target_zone,
        ),
    )

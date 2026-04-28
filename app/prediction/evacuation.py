from __future__ import annotations

from collections import defaultdict

from app.models.incident import Incident
from app.prediction.evacuation_graph import find_shortest_path
from app.prediction.fire_spread import forecastFireSpread
from app.prediction.schemas import (
    BlockedZoneItem,
    EvacuationResponse,
    EvacuationRouteItem,
    FireSpreadForecastItem,
    PredictionItem,
    SafeZoneRecommendation,
)
from app.prediction.service import generate_predictions

ALL_ZONES = [f"Zone {index}" for index in range(1, 6)]


def _priority_for_route(path_length: int, global_status: str) -> str:
    if global_status == "critical" or path_length >= 3:
        return "high"

    if path_length == 2:
        return "medium"

    return "low"


def _global_status(unsafe_zone_count: int) -> str:
    if unsafe_zone_count <= 1:
        return "stable"

    if unsafe_zone_count <= 3:
        return "caution"

    return "critical"


def _blocked_zone_map(
    spread_forecasts: list[FireSpreadForecastItem],
    predictions: list[PredictionItem],
) -> dict[str, str]:
    blocked_reasons: dict[str, str] = {}

    for forecast in spread_forecasts:
        if forecast.status == "critical":
            blocked_reasons[forecast.target_zone] = "fire spread risk"

    for prediction in predictions:
        if prediction.risk_score >= 80 and prediction.zone not in blocked_reasons:
            blocked_reasons[prediction.zone] = "zone risk forecast"

    return blocked_reasons


def _safe_zone_recommendations(
    incidents: list[Incident],
    predictions: list[PredictionItem],
    blocked_reasons: dict[str, str],
) -> list[SafeZoneRecommendation]:
    active_incident_counts: dict[str, int] = defaultdict(int)

    for incident in incidents:
        if incident.status == "active":
            active_incident_counts[incident.location] += 1

    prediction_map = {prediction.zone: prediction for prediction in predictions}
    safe_zone_candidates: list[SafeZoneRecommendation] = []

    for zone in ALL_ZONES:
        if zone in blocked_reasons:
            continue

        prediction = prediction_map.get(zone)
        risk_score = prediction.risk_score if prediction else 0
        incident_penalty = active_incident_counts.get(zone, 0) * 8
        zone_bias = (sum(ord(character) for character in zone) % 9) - 4

        safety_score = max(0, min(100, round(100 - risk_score - incident_penalty + zone_bias)))
        capacity_score = max(0, min(100, round(96 - incident_penalty - (risk_score * 0.25) + zone_bias)))

        safe_zone_candidates.append(
            SafeZoneRecommendation(
                zone=zone,
                capacity_score=capacity_score,
                safety_score=safety_score,
            )
        )

    return sorted(
        safe_zone_candidates,
        key=lambda zone: (-zone.safety_score, -zone.capacity_score, zone.zone),
    )


def _evacuation_routes(
    unsafe_zones: list[str],
    safe_zones: list[SafeZoneRecommendation],
    global_status: str,
) -> list[EvacuationRouteItem]:
    if not safe_zones:
        return []

    routes: list[EvacuationRouteItem] = []

    for unsafe_zone in unsafe_zones:
        best_path: list[str] = []
        best_destination: str | None = None

        for safe_zone in safe_zones:
            path = find_shortest_path(unsafe_zone, safe_zone.zone)

            if not path:
                continue

            if not best_path or len(path) < len(best_path):
                best_path = path
                best_destination = safe_zone.zone

        if not best_path or best_destination is None:
            continue

        eta_minutes = max(1, (len(best_path) - 1) * 2)

        routes.append(
            EvacuationRouteItem(
                from_zone=unsafe_zone,
                to_zone=best_destination,
                eta_minutes=eta_minutes,
                priority=_priority_for_route(len(best_path), global_status),
            )
        )

    return routes


def _alerts(
    blocked_zones: list[BlockedZoneItem],
    routes: list[EvacuationRouteItem],
) -> list[str]:
    messages: list[str] = []

    for route in routes[:3]:
        messages.append(f"Evacuate {route.from_zone} toward {route.to_zone}")

    for blocked_zone in blocked_zones[:2]:
        messages.append(f"Avoid {blocked_zone.zone} corridor")

    return messages


def generate_evacuation_recommendations(incidents: list[Incident]) -> dict[str, object]:
    predictions = generate_predictions(incidents)
    spread_forecasts = forecastFireSpread(incidents)
    blocked_reasons = _blocked_zone_map(spread_forecasts, predictions)

    blocked_zones = [
        BlockedZoneItem(zone=zone, reason=reason)
        for zone, reason in sorted(blocked_reasons.items())
    ]

    safe_zones = _safe_zone_recommendations(incidents, predictions, blocked_reasons)
    unsafe_zones = [blocked_zone.zone for blocked_zone in blocked_zones]
    global_status = _global_status(len(unsafe_zones))
    routes = _evacuation_routes(unsafe_zones, safe_zones, global_status)
    alerts = _alerts(blocked_zones, routes)

    return {
        "global_status": global_status,
        "recommended_safe_zones": safe_zones[:3],
        "blocked_zones": blocked_zones,
        "routes": routes,
        "alerts": alerts,
    }

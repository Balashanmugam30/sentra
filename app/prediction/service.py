from __future__ import annotations

from collections import defaultdict

from app.models.incident import Incident
from app.prediction.schemas import PredictionItem


def _severity_base(severity: int) -> int:
    if severity <= 1:
        return 30

    if severity == 2:
        return 60

    return 85


def _trend_for_score(score: float) -> str:
    if score < 40:
        return "low"

    if score < 75:
        return "rising"

    return "critical"


def _eta_for_zone(zone: str, severity: int, repeated_incidents: int) -> int:
    base_eta = 300 if severity <= 1 else 180 if severity == 2 else 90
    zone_seed = sum(ord(character) for character in zone) % 31
    deterministic_offset = zone_seed - 15
    repeated_offset = max(0, repeated_incidents - 1) * 10

    return max(30, base_eta + deterministic_offset - repeated_offset)


def _confidence_for_zone(severity: int, repeated_incidents: int) -> float:
    base_confidence = 0.7 if severity <= 1 else 0.82 if severity == 2 else 0.95
    repeated_bonus = min(0.05, max(0, repeated_incidents - 1) * 0.02)

    return round(min(0.95, base_confidence + repeated_bonus), 2)


def generate_predictions(incidents: list[Incident]) -> list[PredictionItem]:
    active_incidents = [incident for incident in incidents if incident.status == "active"]

    if not active_incidents:
        return []

    grouped_by_zone: dict[str, list[Incident]] = defaultdict(list)

    for incident in active_incidents:
        grouped_by_zone[incident.location].append(incident)

    predictions: list[PredictionItem] = []

    for zone, zone_incidents in grouped_by_zone.items():
        highest_severity = max(incident.severity for incident in zone_incidents)
        repeated_zone_incidents = len(zone_incidents)

        risk_score = _severity_base(highest_severity) + max(0, repeated_zone_incidents - 1) * 5
        clamped_risk_score = float(min(100, risk_score))

        predictions.append(
            PredictionItem(
                zone=zone,
                risk_score=clamped_risk_score,
                trend=_trend_for_score(clamped_risk_score),
                eta_seconds=_eta_for_zone(zone, highest_severity, repeated_zone_incidents),
                confidence=_confidence_for_zone(highest_severity, repeated_zone_incidents),
            )
        )

    return sorted(
        predictions,
        key=lambda prediction: (
            -prediction.risk_score,
            prediction.eta_seconds,
            prediction.zone,
        ),
    )

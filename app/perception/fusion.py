from __future__ import annotations

from app.models.incident import Incident
from app.hardware.ingest import build_perception_sensor_snapshot
from app.perception.detector import build_detection_snapshot
from app.perception.schemas import FusionZoneItem, SensorZoneState
from app.perception.sensors import ZONE_NAMES
from app.prediction.fire_spread import forecastFireSpread
from app.prediction.memory import generate_memory_snapshot
from app.prediction.service import generate_predictions


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def _sensor_score(zone: SensorZoneState) -> int:
    temperature_score = _clamp(round(((zone.temperature - 20) / 75) * 100), 0, 100)
    smoke_score = zone.smoke_index
    gas_score = zone.gas_ppm
    crowd_score = _clamp(round(zone.crowd_density * 0.85), 0, 100)
    noise_score = _clamp(round(zone.noise_level * 0.7), 0, 100)

    return _clamp(
        round(
            (temperature_score * 0.28)
            + (smoke_score * 0.24)
            + (gas_score * 0.2)
            + (crowd_score * 0.16)
            + (noise_score * 0.12)
        ),
        0,
        100,
    )


def _incident_score(zone: str, incidents: list[Incident]) -> int:
    active_zone_incidents = [
        incident
        for incident in incidents
        if incident.status == "active" and incident.location == zone
    ]

    if not active_zone_incidents:
        return 0

    score_map = {
        "anomaly": 60,
        "crowd_panic": 75,
        "hazardous_gas": 85,
        "fire": 95,
    }

    return max(score_map.get(incident.type, 60) for incident in active_zone_incidents)


def _prediction_score(zone: str, incidents: list[Incident]) -> int:
    predictions = {item.zone: int(round(item.risk_score)) for item in generate_predictions(incidents)}
    return predictions.get(zone, 0)


def _memory_scores(incidents: list[Incident]) -> dict[str, int]:
    memory = generate_memory_snapshot(incidents)
    hotspot_scores = {
        item.zone: item.score
        for item in memory["hotspot_zones"]
    }

    return {zone: hotspot_scores.get(zone, 25) for zone in ZONE_NAMES}


def _fire_forecasts(incidents: list[Incident]) -> dict[str, object]:
    forecasts = forecastFireSpread(incidents)
    return {
        item.target_zone: item
        for item in forecasts
    }


def _state_for_score(score: int) -> str:
    if score < 30:
        return "stable"
    if score < 60:
        return "watch"
    if score < 80:
        return "elevated"
    return "critical"


def _drivers_for(
    zone: SensorZoneState,
    incident_score: int,
    prediction_score: int,
    memory_score: int,
    detection_by_zone: dict[str, object],
    fire_by_zone: dict[str, object],
) -> list[str]:
    drivers: list[str] = []
    detection = detection_by_zone.get(zone.zone)
    fire_forecast = fire_by_zone.get(zone.zone)

    if incident_score >= 95:
        drivers.append("active fire incident")
    elif incident_score >= 85:
        drivers.append("active hazardous gas incident")
    elif incident_score >= 75:
        drivers.append("active crowd panic incident")
    elif incident_score >= 60:
        drivers.append("active anomaly incident")

    if detection is not None:
        reasons = getattr(detection, "reasons", [])
        if any("smoke" in reason for reason in reasons):
            drivers.append("sensor smoke trend")
        elif any("gas" in reason for reason in reasons):
            drivers.append("gas leak signal")
        elif any("crowd" in reason for reason in reasons):
            drivers.append("crowd pressure signal")
        else:
            drivers.append("sensor anomaly cluster")

    if prediction_score >= 80:
        drivers.append("prediction spike")
    elif prediction_score >= 60:
        drivers.append("elevated prediction risk")

    if fire_forecast is not None and getattr(fire_forecast, "probability", 0) >= 0.75:
        drivers.append("incoming fire spread")

    if memory_score >= 60:
        drivers.append("historical hotspot")

    deduped: list[str] = []
    seen: set[str] = set()
    for driver in drivers:
        if driver in seen:
            continue
        seen.add(driver)
        deduped.append(driver)

    return deduped[:3]


def _confidence_for(
    sensor_score: int,
    incident_score: int,
    prediction_score: int,
    memory_score: int,
    fire_probability: float,
) -> int:
    aligned_sources = sum(
        1
        for value in (
            sensor_score >= 55,
            incident_score >= 60,
            prediction_score >= 60,
            memory_score >= 55,
            fire_probability >= 0.75,
        )
        if value
    )
    strong_sources = sum(
        1
        for value in (
            sensor_score >= 70,
            incident_score >= 85,
            prediction_score >= 80,
            fire_probability >= 0.85,
        )
        if value
    )
    conflicting = (
        (sensor_score < 35 and prediction_score >= 80)
        or (incident_score == 0 and sensor_score < 35 and fire_probability >= 0.75)
    )

    confidence = 45 + (aligned_sources * 11) + (strong_sources * 4)
    if conflicting:
        confidence -= 12

    return _clamp(confidence, 45, 95)


def _recommended_focus(zones: list[FusionZoneItem], incidents: list[Incident]) -> list[str]:
    if not zones:
        return ["Maintain standard monitoring posture"]

    incident_types_by_zone: dict[str, set[str]] = {}
    for incident in incidents:
        if incident.status != "active":
            continue
        incident_types_by_zone.setdefault(incident.location, set()).add(incident.type)

    focus: list[str] = []
    for zone in zones[:3]:
        focus.append(f"Prioritize {zone.zone}")
        zone_types = incident_types_by_zone.get(zone.zone, set())
        if "fire" in zone_types:
            focus.append(f"Dispatch fire team to {zone.zone}")
        elif "hazardous_gas" in zone_types:
            focus.append(f"Deploy hazmat support to {zone.zone}")
        elif zone.state in {"critical", "elevated"}:
            focus.append(f"Increase command oversight for {zone.zone}")

    deduped: list[str] = []
    seen: set[str] = set()
    for item in focus:
        if item in seen:
            continue
        seen.add(item)
        deduped.append(item)

    return deduped[:4]


def generate_fusion_snapshot(incidents: list[Incident]) -> dict[str, object]:
    sensor_zones = build_perception_sensor_snapshot()
    detections = build_detection_snapshot(sensor_zones)["detections"]
    detection_by_zone = {item.zone: item for item in detections}
    predictions = {item.zone: int(round(item.risk_score)) for item in generate_predictions(incidents)}
    memory_scores = _memory_scores(incidents)
    fire_by_zone = _fire_forecasts(incidents)

    fused_zones: list[FusionZoneItem] = []

    for zone in sensor_zones:
        sensor_score = _sensor_score(zone)
        incident_score = _incident_score(zone.zone, incidents)
        prediction_score = predictions.get(zone.zone, 0)
        memory_score = memory_scores.get(zone.zone, 25)
        fire_probability = getattr(fire_by_zone.get(zone.zone), "probability", 0.0)

        fused_score = _clamp(
            round(
                (sensor_score * 0.30)
                + (incident_score * 0.30)
                + (prediction_score * 0.25)
                + (memory_score * 0.15)
            ),
            0,
            100,
        )
        state = _state_for_score(fused_score)

        fused_zones.append(
            FusionZoneItem(
                zone=zone.zone,
                sensor_score=sensor_score,
                incident_score=incident_score,
                prediction_score=prediction_score,
                memory_score=memory_score,
                fused_score=fused_score,
                confidence=_confidence_for(
                    sensor_score,
                    incident_score,
                    prediction_score,
                    memory_score,
                    fire_probability,
                ),
                state=state,
                drivers=_drivers_for(
                    zone,
                    incident_score,
                    prediction_score,
                    memory_score,
                    detection_by_zone,
                    fire_by_zone,
                ),
            )
        )

    ranked_zones = sorted(
        fused_zones,
        key=lambda item: (-item.fused_score, -item.confidence, item.zone),
    )
    global_status = ranked_zones[0].state if ranked_zones else "stable"

    return {
        "global_status": global_status,
        "zones": ranked_zones,
        "recommended_focus": _recommended_focus(ranked_zones, incidents),
    }

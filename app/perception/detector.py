from __future__ import annotations

from collections import OrderedDict

from app.perception.schemas import DetectionItem, SensorZoneState


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def _fire_detection(zone: SensorZoneState) -> DetectionItem | None:
    if zone.temperature <= 70 or zone.smoke_index <= 55:
        return None

    confidence = _clamp(
        74 + ((zone.temperature - 70) * 2) + ((zone.smoke_index - 55) // 2),
        0,
        100,
    )

    return DetectionItem(
        zone=zone.zone,
        incident_type="fire_risk",
        confidence=confidence,
        reasons=["temperature spike", "smoke above threshold"],
    )


def _gas_detection(zone: SensorZoneState) -> DetectionItem | None:
    if zone.gas_ppm <= 65:
        return None

    confidence = _clamp(70 + ((zone.gas_ppm - 65) * 2), 0, 100)

    return DetectionItem(
        zone=zone.zone,
        incident_type="gas_leak",
        confidence=confidence,
        reasons=["gas concentration above threshold"],
    )


def _panic_detection(zone: SensorZoneState) -> DetectionItem | None:
    if zone.crowd_density <= 80 or zone.noise_level <= 70:
        return None

    confidence = _clamp(
        72 + ((zone.crowd_density - 80) // 2) + ((zone.noise_level - 70) // 2),
        0,
        100,
    )

    return DetectionItem(
        zone=zone.zone,
        incident_type="panic_risk",
        confidence=confidence,
        reasons=["crowd density above threshold", "noise surge detected"],
    )


def _anomaly_detection(zone: SensorZoneState) -> DetectionItem | None:
    moderate_signals = 0
    reasons: list[str] = []

    if zone.temperature > 55:
        moderate_signals += 1
        reasons.append("temperature trending high")
    if zone.smoke_index > 40:
        moderate_signals += 1
        reasons.append("smoke rising")
    if zone.gas_ppm > 45:
        moderate_signals += 1
        reasons.append("gas reading elevated")
    if zone.crowd_density > 65:
        moderate_signals += 1
        reasons.append("crowd density elevated")
    if zone.noise_level > 55:
        moderate_signals += 1
        reasons.append("noise level elevated")

    if moderate_signals < 2:
        return None

    confidence = _clamp(58 + (moderate_signals * 8), 0, 100)

    return DetectionItem(
        zone=zone.zone,
        incident_type="anomaly_watch",
        confidence=confidence,
        reasons=reasons[:3],
    )


def generate_detections(zones: list[SensorZoneState]) -> list[DetectionItem]:
    detections: "OrderedDict[str, DetectionItem]" = OrderedDict()

    for zone in zones:
        for detector in (_fire_detection, _gas_detection, _panic_detection, _anomaly_detection):
            detection = detector(zone)

            if detection is None:
                continue

            existing = detections.get(zone.zone)

            if existing is None or detection.confidence > existing.confidence:
                detections[zone.zone] = detection

    return sorted(
        detections.values(),
        key=lambda item: (-item.confidence, item.zone),
    )


def build_detection_snapshot(zones: list[SensorZoneState]) -> dict[str, object]:
    detections = generate_detections(zones)

    return {
        "threat_level": threat_level_for(detections),
        "detections": detections,
        "recommended_actions": recommended_actions_for(detections),
    }


def threat_level_for(detections: list[DetectionItem]) -> str:
    if len(detections) >= 2:
        return "critical"
    if len(detections) == 1:
        return "elevated"
    return "normal"


def recommended_actions_for(detections: list[DetectionItem]) -> list[str]:
    actions: list[str] = []

    for detection in detections:
        if detection.incident_type == "fire_risk":
            actions.append(f"Inspect {detection.zone} immediately")
            actions.append("Prepare fire response standby")
        elif detection.incident_type == "gas_leak":
            actions.append(f"Isolate utilities near {detection.zone}")
            actions.append("Dispatch hazmat-capable inspection team")
        elif detection.incident_type == "panic_risk":
            actions.append(f"Stabilize crowd flow around {detection.zone}")
            actions.append("Prepare security and medical standby")
        else:
            actions.append(f"Increase monitoring cadence in {detection.zone}")

    deduped: list[str] = []
    seen: set[str] = set()

    for action in actions:
        if action in seen:
            continue
        seen.add(action)
        deduped.append(action)

    return deduped[:4]

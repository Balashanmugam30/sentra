from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Literal

from app.hardware.ingest import build_perception_sensor_snapshot
from app.perception.detector import build_detection_snapshot
from app.perception.schemas import (
    DetectionItem,
    InjectedIncidentItem,
    ScanAndInjectResponse,
    SkippedIncidentItem,
)
from app.schemas.incident_schema import IncidentCreate
from app.services.incident_service import create_incident, get_all_incidents

AUTO_SCAN_INTERVAL_SECONDS = 15

MappedIncidentType = Literal["fire", "hazardous_gas", "crowd_panic", "anomaly"]


def _mapped_incident_type(detection: DetectionItem) -> MappedIncidentType:
    if detection.incident_type == "fire_risk":
        return "fire"
    if detection.incident_type == "gas_leak":
        return "hazardous_gas"
    if detection.incident_type == "panic_risk":
        return "crowd_panic"
    return "anomaly"


def _severity_for(confidence: int) -> int:
    if confidence >= 90:
        return 4
    if confidence >= 75:
        return 3
    if confidence >= 55:
        return 2
    return 1


def _priority_for(severity: int) -> str:
    if severity >= 4:
        return "critical"
    if severity == 3:
        return "high"
    if severity == 2:
        return "medium"
    return "low"


def _recommended_action_for(detection: DetectionItem) -> str:
    if detection.incident_type == "fire_risk":
        return f"Dispatch suppression team to {detection.zone}"
    if detection.incident_type == "gas_leak":
        return f"Secure ventilation and hazmat response in {detection.zone}"
    if detection.incident_type == "panic_risk":
        return f"Stabilize crowd flow and medical standby near {detection.zone}"
    return f"Increase anomaly monitoring cadence in {detection.zone}"


def _reason_summary(detection: DetectionItem) -> str:
    return " + ".join(detection.reasons)


def _has_recent_duplicate(zone: str, incident_type: str, now: datetime) -> bool:
    threshold = now - timedelta(minutes=10)

    for incident in get_all_incidents():
        if incident.status != "active":
            continue
        if incident.location != zone:
            continue
        if incident.type != incident_type:
            continue
        if incident.created_at < threshold:
            continue
        return True

    return False


async def scan_and_inject() -> ScanAndInjectResponse:
    now = datetime.now(timezone.utc)
    zones = build_perception_sensor_snapshot(now)
    snapshot = build_detection_snapshot(zones)
    detections = snapshot["detections"]

    created: list[InjectedIncidentItem] = []
    skipped: list[SkippedIncidentItem] = []

    for detection in detections:
        mapped_type = _mapped_incident_type(detection)
        severity = _severity_for(detection.confidence)
        reason = _reason_summary(detection)

        if _has_recent_duplicate(detection.zone, mapped_type, now):
            skipped.append(
                SkippedIncidentItem(
                    zone=detection.zone,
                    reason="duplicate active incident already exists",
                )
            )
            continue

        await create_incident(
            IncidentCreate(
                type=mapped_type,
                severity=severity,
                location=detection.zone,
                incident_type=detection.incident_type,
                confidence=round(detection.confidence / 100, 2),
                detected_by="sensor_fusion_engine",
                recommended_action=_recommended_action_for(detection),
                priority=_priority_for(severity),
            )
        )

        created.append(
            InjectedIncidentItem(
                zone=detection.zone,
                incident_type=mapped_type,
                severity=severity,
                reason=reason,
            )
        )

    return ScanAndInjectResponse(
        generated_at=now,
        threat_level=snapshot["threat_level"],
        detections_found=len(detections),
        incidents_created=len(created),
        incidents_skipped=len(skipped),
        created=created,
        skipped=skipped,
    )


async def auto_scan_loop() -> None:
    try:
        while True:
            await asyncio.sleep(AUTO_SCAN_INTERVAL_SECONDS)
            try:
                await scan_and_inject()
            except Exception:
                pass
    except asyncio.CancelledError:
        raise

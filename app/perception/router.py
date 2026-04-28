from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.hardware.ingest import build_perception_sensor_snapshot
from app.perception.detector import build_detection_snapshot
from app.perception.fusion import generate_fusion_snapshot
from app.perception.injector import scan_and_inject
from app.perception.override import generate_override_intelligence
from app.perception.schemas import (
    FusionResponse,
    OverrideResponse,
    PerceptionDetectionResponse,
    PerceptionLiveResponse,
    ScanAndInjectResponse,
)
from app.services.incident_service import get_all_incidents

router = APIRouter(prefix="/perception", tags=["Perception"])


@router.get("/live", response_model=PerceptionLiveResponse)
def get_live_perception() -> PerceptionLiveResponse:
    zones = build_perception_sensor_snapshot()

    return PerceptionLiveResponse(
        generated_at=datetime.now(timezone.utc),
        zones=zones,
    )


@router.get("/detections", response_model=PerceptionDetectionResponse)
def get_detection_perception() -> PerceptionDetectionResponse:
    zones = build_perception_sensor_snapshot()
    snapshot = build_detection_snapshot(zones)

    return PerceptionDetectionResponse(
        generated_at=datetime.now(timezone.utc),
        threat_level=snapshot["threat_level"],
        detections=snapshot["detections"],
        recommended_actions=snapshot["recommended_actions"],
    )


@router.post("/scan-and-inject", response_model=ScanAndInjectResponse)
async def post_scan_and_inject() -> ScanAndInjectResponse:
    return await scan_and_inject()


@router.get("/fusion", response_model=FusionResponse)
def get_perception_fusion() -> FusionResponse:
    incidents = get_all_incidents()
    snapshot = generate_fusion_snapshot(incidents)

    return FusionResponse(
        generated_at=datetime.now(timezone.utc),
        global_status=snapshot["global_status"],
        zones=snapshot["zones"],
        recommended_focus=snapshot["recommended_focus"],
    )


@router.get("/overrides", response_model=OverrideResponse)
def get_perception_overrides() -> OverrideResponse:
    incidents = get_all_incidents()
    snapshot = generate_override_intelligence(incidents)

    return OverrideResponse(
        generated_at=datetime.now(timezone.utc),
        global_mode=snapshot["global_mode"],
        override_count=snapshot["override_count"],
        zones_reviewed=snapshot["zones_reviewed"],
        overrides=snapshot["overrides"],
        approved_decisions=snapshot["approved_decisions"],
        recommended_focus=snapshot["recommended_focus"],
    )

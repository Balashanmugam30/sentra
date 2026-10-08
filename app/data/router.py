# app/data/router.py
"""
Sentra Phase 5 - Data Plane API Router.
Provides public and internal endpoints for multi-sensor data ingestion,
data stream health diagnostics, normalized observation retrieval, and real-time streaming.
"""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse

from app.data.canonical_schemas import DataQualityReport, ObservationEnvelope
from app.data.ingestion import ingestion_pipeline
from app.data.quality_engine import quality_engine
from app.data.storage import data_storage

router = APIRouter(prefix="/data", tags=["Data Plane"])


@router.post("/ingest", status_code=status.HTTP_201_CREATED)
def ingest_telemetry(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ingests single sensor reading or a batch of readings.
    Supports FLIR thermal, AirIQ IoT, CCTV optical flow, and human radio reports.
    Enforces idempotency, range limits, timestamp normalization, and tenant isolation.
    """
    if "readings" in payload and isinstance(payload["readings"], list):
        # Batch ingestion
        result = ingestion_pipeline.ingest_batch(payload["readings"])
        return {
            "status": "success",
            "mode": "batch",
            "ingested_count": result["ingested_count"],
            "duplicate_count": result["duplicate_count"],
            "error_count": result["error_count"],
            "ingested_ids": result["ingested_ids"],
            "errors": result["errors"],
        }
    else:
        # Single reading ingestion
        try:
            envelope, is_new = ingestion_pipeline.ingest_reading(payload)
            return {
                "status": "success" if is_new else "duplicate_ignored",
                "reading_id": envelope.reading_id,
                "modality": envelope.modality.value,
                "processing_status": getattr(envelope, "status", None).value if getattr(envelope, "status", None) else "validated",
                "is_new": is_new,
                "ingested_at": envelope.ingestion_timestamp.isoformat(),
            }
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Ingestion rejected: {str(exc)}",
            )


@router.get("/health")
def get_data_plane_health(incident_id: str = "INC-LIVE") -> Dict[str, Any]:
    """Retrieves composite data stream health, storage state, and data quality metrics."""
    storage_health = data_storage.get_storage_health()
    quality = quality_engine.evaluate_incident_data(incident_id)

    return {
        "status": "healthy" if quality.quality_score >= 0.70 else "degraded",
        "data_quality_score": quality.quality_score,
        "coverage_score": quality.coverage_score,
        "freshness_seconds": quality.freshness_seconds,
        "conflicting_sensors_count": quality.conflicting_sensors_count,
        "stale_sensors_count": quality.stale_sensors_count,
        "storage": storage_health,
        "evaluated_at": quality.evaluated_at.isoformat(),
    }


@router.get("/incidents/{incident_id}/observations")
def get_incident_observations(
    incident_id: str,
    limit: int = Query(50, ge=1, le=200),
    tenant_id: Optional[str] = Query(None),
) -> Dict[str, Any]:
    """Retrieves persisted, normalized observations for an incident."""
    obs = data_storage.get_observations(incident_id, limit=limit, tenant_id=tenant_id)
    return {
        "incident_id": incident_id,
        "count": len(obs),
        "observations": obs,
    }


@router.get("/incidents/{incident_id}/quality", response_model=DataQualityReport)
def get_incident_quality_report(incident_id: str) -> DataQualityReport:
    """Evaluates and returns data quality report for an incident."""
    return quality_engine.evaluate_incident_data(incident_id)


@router.get("/stream/{incident_id}")
async def stream_incident_telemetry(incident_id: str, request: Request) -> StreamingResponse:
    """
    Server-Sent Events (SSE) real-time event stream.
    Emits continuous sensor updates, data quality updates, and prediction refreshes.
    """
    async def event_generator():
        for i in range(10):
            if await request.is_disconnected():
                break

            quality = quality_engine.evaluate_incident_data(incident_id)
            payload = {
                "incident_id": incident_id,
                "tick": i,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "quality_score": quality.quality_score,
                "freshness_seconds": quality.freshness_seconds,
                "conflicting_sensors": quality.conflicting_sensors_count,
            }
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(2.0)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.offline.engine import (
    activate_offline_mode,
    deactivate_offline_mode,
    get_offline_cache_status_snapshot,
    get_offline_live_snapshot,
    store_offline_event,
    test_outage_mode,
)
from app.offline.schemas import (
    OfflineActivateResponse,
    OfflineCacheStatusResponse,
    OfflineLiveResponse,
    OfflineStoreEventRequest,
    OfflineStoreEventResponse,
    OfflineSyncNowResponse,
    OfflineTestOutageRequest,
    OfflineTestOutageResponse,
)
from app.offline.sync import replay_offline_queue
from app.services.incident_service import get_all_incidents

router = APIRouter(prefix="/offline", tags=["Offline"])


@router.get("/live", response_model=OfflineLiveResponse)
def get_offline_live_route() -> OfflineLiveResponse:
    incidents = get_all_incidents()
    snapshot = get_offline_live_snapshot(incidents)
    return OfflineLiveResponse(generated_at=datetime.now(timezone.utc), **snapshot)


@router.get("/cache-status", response_model=OfflineCacheStatusResponse)
def get_offline_cache_status_route() -> OfflineCacheStatusResponse:
    incidents = get_all_incidents()
    snapshot = get_offline_cache_status_snapshot(incidents)
    return OfflineCacheStatusResponse(
        generated_at=datetime.now(timezone.utc),
        **snapshot,
    )


@router.post("/activate", response_model=OfflineActivateResponse)
def post_offline_activate_route() -> OfflineActivateResponse:
    incidents = get_all_incidents()
    result = activate_offline_mode(incidents)
    return OfflineActivateResponse(**result)


@router.post("/deactivate", response_model=OfflineActivateResponse)
def post_offline_deactivate_route() -> OfflineActivateResponse:
    incidents = get_all_incidents()
    result = deactivate_offline_mode(incidents)
    return OfflineActivateResponse(**result)


@router.post("/store-event", response_model=OfflineStoreEventResponse)
def post_offline_store_event_route(payload: OfflineStoreEventRequest) -> OfflineStoreEventResponse:
    event = store_offline_event(
        source=payload.source,
        event_type=payload.type,
        payload=payload.payload,
        applied_locally=False,
    )
    return OfflineStoreEventResponse(
        status="stored",
        event_id=str(event["event_id"]),
        queue_count=len(get_offline_cache_status_snapshot(get_all_incidents())["queued_events"]),
    )


@router.post("/sync-now", response_model=OfflineSyncNowResponse)
async def post_offline_sync_now_route() -> OfflineSyncNowResponse:
    incidents = get_all_incidents()
    result = await replay_offline_queue(incidents)
    return OfflineSyncNowResponse(status="completed", **result)


@router.post("/test-outage", response_model=OfflineTestOutageResponse)
def post_offline_test_outage_route(payload: OfflineTestOutageRequest) -> OfflineTestOutageResponse:
    incidents = get_all_incidents()
    result = test_outage_mode(payload.scenario, incidents)
    return OfflineTestOutageResponse(**result)

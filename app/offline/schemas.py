from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


OfflineMode = Literal["online", "degraded", "offline_local", "recovery_sync"]
InternetStatus = Literal["up", "down"]
BackendStatus = Literal["healthy", "degraded", "offline"]
OfflineLocalAlertChannel = Literal["sms_local", "wifi_lan", "device_siren"]
OfflineQueueState = Literal["queued", "synced", "failed"]
OfflineOutageScenario = Literal[
    "internet_loss",
    "cloud_loss",
    "backend_partial",
    "mobile_network_loss",
    "power_failure_gateway",
]


class OfflineQueueEventItem(BaseModel):
    event_id: str
    source: str
    type: str
    payload: dict[str, object]
    created_at: datetime
    sync_state: OfflineQueueState
    last_error: str | None = None


class OfflineLiveResponse(BaseModel):
    generated_at: datetime
    mode: OfflineMode
    internet_status: InternetStatus
    backend_status: BackendStatus
    cached_assets_ready: bool
    offline_queue_count: int = Field(..., ge=0)
    pending_sync_count: int = Field(..., ge=0)
    local_alert_channels: list[OfflineLocalAlertChannel]
    estimated_autonomy_minutes: int = Field(..., ge=0)
    recommended_actions: list[str]
    summary: str


class OfflineCacheStatusResponse(BaseModel):
    generated_at: datetime
    maps_cached: bool
    zones_cached: bool
    tasks_cached: bool
    devices_cached: bool
    last_snapshot_at: datetime | None = None
    cache_health_score: int = Field(..., ge=0, le=100)
    queued_events: list[OfflineQueueEventItem]


class OfflineActivateResponse(BaseModel):
    status: Literal["activated", "deactivated"]
    mode: OfflineMode


class OfflineStoreEventRequest(BaseModel):
    source: str
    type: str
    payload: dict[str, object]


class OfflineStoreEventResponse(BaseModel):
    status: Literal["stored"]
    event_id: str
    queue_count: int = Field(..., ge=0)


class OfflineSyncNowResponse(BaseModel):
    status: Literal["completed"]
    synced_count: int = Field(..., ge=0)
    failed_count: int = Field(..., ge=0)
    remaining: int = Field(..., ge=0)


class OfflineTestOutageRequest(BaseModel):
    scenario: OfflineOutageScenario


class OfflineTestOutageResponse(BaseModel):
    status: Literal["completed"]
    scenario: OfflineOutageScenario
    mode: OfflineMode


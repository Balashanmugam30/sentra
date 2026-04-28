from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ResponderRole = Literal[
    "firefighter",
    "medical",
    "security",
    "facility_staff",
    "commander",
    "supervisor",
    "volunteer",
]
ResponderDevice = Literal["android", "ios", "web", "rugged_tablet", "radio_terminal"]
ResponderStatus = Literal[
    "available",
    "assigned",
    "enroute",
    "active",
    "blocked",
    "offline",
    "sync_pending",
]
ResponderSignal = Literal["weak", "fair", "strong"]
FieldPriority = Literal["low", "medium", "high", "critical"]
FieldTaskStatus = Literal[
    "pending",
    "acknowledged",
    "enroute",
    "arrived",
    "active",
    "blocked",
    "completed",
]
FieldGlobalState = Literal["normal", "mobilizing", "active_response", "overloaded", "critical"]
SyncEventType = Literal["acknowledge", "status", "backup_request", "checkpoint"]


class FieldResponderItem(BaseModel):
    responder_id: str
    name: str
    role: ResponderRole
    status: ResponderStatus
    current_zone: str
    battery: int = Field(..., ge=0, le=100)
    signal: ResponderSignal
    last_seen: datetime
    active_task_id: str | None = None
    call_sign: str
    mode: Literal["demo", "real"]


class FieldRespondersResponse(BaseModel):
    generated_at: datetime
    responders: list[FieldResponderItem]


class FieldTaskItem(BaseModel):
    task_id: str
    priority: FieldPriority
    assigned_to: str | None = None
    role: ResponderRole
    zone: str
    title: str
    instructions: str
    eta_minutes: int = Field(..., ge=0)
    route_hint: str
    status: FieldTaskStatus
    created_at: datetime
    note: str | None = None
    source_system: str


class FieldTasksResponse(BaseModel):
    generated_at: datetime
    tasks: list[FieldTaskItem]


class FieldLiveResponse(BaseModel):
    generated_at: datetime
    global_field_state: FieldGlobalState
    online_responders: int = Field(..., ge=0)
    offline_responders: int = Field(..., ge=0)
    tasks_pending: int = Field(..., ge=0)
    tasks_active: int = Field(..., ge=0)
    backup_requests_open: int = Field(..., ge=0)
    zones_covered: int = Field(..., ge=0)
    recommended_actions: list[str]
    summary: str


class FieldRegisterRequest(BaseModel):
    responder_id: str
    name: str
    role: ResponderRole
    device: ResponderDevice
    zone: str


class FieldRegisterResponse(BaseModel):
    registered: bool
    session_token: str
    call_sign: str
    sync_interval_seconds: int = Field(..., ge=1)


class FieldAcknowledgeRequest(BaseModel):
    task_id: str
    responder_id: str


class FieldAcknowledgeResponse(BaseModel):
    status: Literal["acknowledged"]
    task: FieldTaskItem


class FieldStatusUpdateRequest(BaseModel):
    task_id: str
    responder_id: str
    status: Literal["acknowledged", "enroute", "arrived", "active", "blocked", "completed"]
    note: str | None = None


class FieldStatusUpdateResponse(BaseModel):
    status: Literal["updated"]
    task: FieldTaskItem


class FieldBackupRequest(BaseModel):
    responder_id: str
    zone: str
    reason: str


class FieldBackupResponse(BaseModel):
    status: Literal["open"]
    request_id: str
    open_requests: int = Field(..., ge=0)


class FieldCheckpointRequest(BaseModel):
    responder_id: str
    zone: str
    checkpoint: str


class FieldCheckpointResponse(BaseModel):
    status: Literal["verified"]
    checkpoint: str
    task_updated: bool


class FieldSyncEvent(BaseModel):
    event_type: SyncEventType
    task_id: str | None = None
    status: Literal["acknowledged", "enroute", "arrived", "active", "blocked", "completed"] | None = None
    note: str | None = None
    zone: str | None = None
    checkpoint: str | None = None
    reason: str | None = None


class FieldSyncRequest(BaseModel):
    responder_id: str
    queued_events: list[FieldSyncEvent]


class FieldSyncResponse(BaseModel):
    status: Literal["synced"]
    processed_events: int = Field(..., ge=0)
    queued_remaining: int = Field(..., ge=0)


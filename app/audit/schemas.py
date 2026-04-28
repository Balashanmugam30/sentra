from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class AuditEventResponse(BaseModel):
    event_id: str
    timestamp_utc: datetime
    category: str
    action: str
    severity: str
    actor_user_id: str | None = None
    actor_email: str | None = None
    actor_role: str | None = None
    source_ip: str | None = None
    user_agent: str | None = None
    target_module: str
    target_id: str | None = None
    status: Literal["success", "denied", "error"]
    reason: str | None = None
    before_state: dict[str, Any] | None = None
    after_state: dict[str, Any] | None = None
    risk_score: int = Field(..., ge=0, le=100)
    correlation_id: str
    session_id: str | None = None
    tenant_id: str | None = None
    previous_hash: str
    record_hash: str


class AuditAnomalyResponse(BaseModel):
    anomaly_id: str
    title: str
    severity: Literal["low", "medium", "high", "critical"]
    description: str
    related_event_ids: list[str] = Field(default_factory=list)


class AuditIntegrityResponse(BaseModel):
    chain_valid: bool
    broken_records: list[str] = Field(default_factory=list)
    total_records: int = Field(..., ge=0)


class AuditTotalsResponse(BaseModel):
    total_events_today: int = Field(..., ge=0)
    failed_logins: int = Field(..., ge=0)
    denied_requests: int = Field(..., ge=0)
    critical_actions: int = Field(..., ge=0)


class AuditLiveResponse(BaseModel):
    generated_at: datetime
    totals: AuditTotalsResponse
    recent_events: list[AuditEventResponse]
    anomalies: list[AuditAnomalyResponse]
    integrity_status: AuditIntegrityResponse
    summary_only: bool = False


class AuditEventsPageResponse(BaseModel):
    generated_at: datetime
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=200)
    total_records: int = Field(..., ge=0)
    events: list[AuditEventResponse]


class AuditSearchRequest(BaseModel):
    user: str | None = None
    role: str | None = None
    module: str | None = None
    severity: str | None = None
    status: str | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=200)


class AuditExportFormatResponse(BaseModel):
    format: Literal["json", "csv"]
    content: str
    exported_count: int = Field(..., ge=0)


class AuditTestEventRequest(BaseModel):
    category: str = "system"
    action: str = "demo_event"
    target_module: str = "audit"
    reason: str = "Manual audit test event"


class AuditTestEventResponse(BaseModel):
    created: bool
    event: AuditEventResponse


class AuditRetentionPruneResponse(BaseModel):
    pruned_count: int = Field(..., ge=0)
    archived_count: int = Field(..., ge=0)
    remaining_records: int = Field(..., ge=0)

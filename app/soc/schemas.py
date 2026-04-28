from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ThreatLevel = Literal["low", "medium", "high", "critical"]
ModuleStatus = Literal["healthy", "watch", "degraded", "critical", "offline"]
IncidentStatus = Literal["open", "investigating", "contained", "resolved"]


class SocLiveResponse(BaseModel):
    generated_at: datetime
    threat_level: ThreatLevel
    open_incidents: int = Field(..., ge=0)
    detections_today: int = Field(..., ge=0)
    blocked_actions: int = Field(..., ge=0)
    health_score: int = Field(..., ge=0, le=100)
    requests_per_minute: int = Field(..., ge=0)
    top_alerts: list[str]
    summary_only: bool = False


class SocHealthModule(BaseModel):
    module: str
    request_count: int = Field(..., ge=0)
    error_count: int = Field(..., ge=0)
    avg_latency_ms: int = Field(..., ge=0)
    p95_latency_ms: int = Field(..., ge=0)
    last_seen: datetime | None = None
    uptime_status: str
    module_state: str
    status: ModuleStatus


class SocHealthResponse(BaseModel):
    generated_at: datetime
    health_score: int = Field(..., ge=0, le=100)
    modules: list[SocHealthModule]


class SocDetection(BaseModel):
    detection_id: str
    title: str
    severity: str
    source_rule: str
    description: str
    related_event_ids: list[str] = []
    affected_user: str | None = None
    affected_module: str | None = None


class SocDetectionsResponse(BaseModel):
    generated_at: datetime
    detections: list[SocDetection]


class SocIncident(BaseModel):
    incident_id: str
    created_at: datetime
    last_seen: datetime
    title: str
    severity: str
    source_rule: str
    affected_user: str | None = None
    affected_module: str | None = None
    recommended_actions: list[str]
    status: IncidentStatus
    resolved_at: datetime | None = None


class SocIncidentsResponse(BaseModel):
    generated_at: datetime
    incidents: list[SocIncident]


class SocResolveIncidentRequest(BaseModel):
    incident_id: str


class SocResolveIncidentResponse(BaseModel):
    resolved: bool
    incident: SocIncident


class SocRunScanResponse(BaseModel):
    scanned: bool
    detection_count: int = Field(..., ge=0)
    incident_count: int = Field(..., ge=0)
    health_score: int = Field(..., ge=0, le=100)


class SocTestAttackRequest(BaseModel):
    scenario: Literal["brute_force", "privilege_abuse", "latency_spike", "facility_command_storm", "token_abuse"]


class SocTestAttackResponse(BaseModel):
    status: str
    scenario: str
    threat_level: ThreatLevel
    detections: list[SocDetection]
    incidents: list[SocIncident]

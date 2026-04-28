from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SensorZoneState(BaseModel):
    zone: str
    temperature: int = Field(..., ge=20, le=95)
    smoke_index: int = Field(..., ge=0, le=100)
    gas_ppm: int = Field(..., ge=0, le=100)
    crowd_density: int = Field(..., ge=0, le=100)
    noise_level: int = Field(..., ge=0, le=100)


class PerceptionLiveResponse(BaseModel):
    generated_at: datetime
    zones: list[SensorZoneState]


class DetectionItem(BaseModel):
    zone: str
    incident_type: Literal["fire_risk", "gas_leak", "panic_risk", "anomaly_watch"]
    confidence: int = Field(..., ge=0, le=100)
    reasons: list[str]


class PerceptionDetectionResponse(BaseModel):
    generated_at: datetime
    threat_level: Literal["normal", "elevated", "critical"]
    detections: list[DetectionItem]
    recommended_actions: list[str]


class InjectedIncidentItem(BaseModel):
    zone: str
    incident_type: str
    severity: int = Field(..., ge=1, le=4)
    reason: str


class SkippedIncidentItem(BaseModel):
    zone: str
    reason: str


class ScanAndInjectResponse(BaseModel):
    generated_at: datetime
    threat_level: Literal["normal", "elevated", "critical"]
    detections_found: int = Field(..., ge=0)
    incidents_created: int = Field(..., ge=0)
    incidents_skipped: int = Field(..., ge=0)
    created: list[InjectedIncidentItem]
    skipped: list[SkippedIncidentItem]


class FusionZoneItem(BaseModel):
    zone: str
    sensor_score: int = Field(..., ge=0, le=100)
    incident_score: int = Field(..., ge=0, le=100)
    prediction_score: int = Field(..., ge=0, le=100)
    memory_score: int = Field(..., ge=0, le=100)
    fused_score: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)
    state: Literal["stable", "watch", "elevated", "critical"]
    drivers: list[str]


class FusionResponse(BaseModel):
    generated_at: datetime
    global_status: Literal["stable", "watch", "elevated", "critical"]
    zones: list[FusionZoneItem]
    recommended_focus: list[str]


class OverrideDecisionItem(BaseModel):
    type: Literal[
        "safe_zone_override",
        "route_override",
        "resource_override",
        "alert_override",
        "commander_override",
    ]
    zone: str
    old_value: str
    new_value: str
    reason: str


class OverrideResponse(BaseModel):
    generated_at: datetime
    global_mode: Literal["aligned", "adaptive-control", "emergency-correction"]
    override_count: int = Field(..., ge=0)
    zones_reviewed: int = Field(..., ge=0)
    overrides: list[OverrideDecisionItem]
    approved_decisions: list[str]
    recommended_focus: list[str]

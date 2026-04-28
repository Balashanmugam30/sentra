from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    trace_id: str | None = Field(default=None, max_length=100)
    type: str = Field(..., min_length=1, max_length=100)
    title: str | None = Field(default=None, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    category: str | None = Field(default=None, max_length=100)
    severity: int = Field(..., ge=1, le=5)
    location: str = Field(..., min_length=1, max_length=255)
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)
    assigned_to: str | None = Field(default=None, max_length=120)
    images: list[str] = Field(default_factory=list)
    videos: list[str] = Field(default_factory=list)
    ai_summary: str | None = Field(default=None, max_length=2000)
    source: str | None = Field(default="manual", max_length=100)
    risk_level: str | None = Field(default=None, max_length=50)
    incident_type: str | None = Field(default=None, max_length=100)
    confidence: float | None = Field(default=None, ge=0, le=1)
    detected_by: str | None = Field(default=None, max_length=100)
    recommended_action: str | None = Field(default=None, max_length=255)
    priority: str | None = Field(default=None, max_length=50)
    decision_confidence: float | None = Field(default=None, ge=0, le=1)
    decided_by: str | None = Field(default=None, max_length=100)


class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1, max_length=50)


class IncidentResponse(BaseModel):
    id: str
    type: str
    status: str
    severity: int
    location: str
    created_at: datetime
    title: str | None = None
    description: str | None = None
    category: str | None = None
    lat: float | None = None
    lng: float | None = None
    created_by: str | None = None
    assigned_to: str | None = None
    updated_at: datetime | None = None
    images: list[str] = Field(default_factory=list)
    videos: list[str] = Field(default_factory=list)
    ai_summary: str | None = None
    source: str | None = None
    risk_level: str | None = None
    incident_type: str | None = None
    confidence: float | None = None
    detected_by: str | None = None
    recommended_action: str | None = None
    priority: str | None = None
    decision_confidence: float | None = None
    decided_by: str | None = None


class ApiResponse(BaseModel):
    success: bool = True
    data: IncidentResponse | list[IncidentResponse] | dict[str, str]

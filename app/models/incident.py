from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Incident:
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
    images: list[str] | None = None
    videos: list[str] | None = None
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

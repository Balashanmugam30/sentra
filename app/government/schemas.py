from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class GovernmentLiveResponse(BaseModel):
    generated_at: str
    national_readiness: int
    cyber_defense: int
    medical_surge_capacity: int
    grid_stability: int
    airports_protected: int
    ports_protected: int
    states_connected: int
    active_agencies: int
    threat_level: str
    recovery_confidence: int
    border_integrity: int
    continuity_readiness: int


class GovernmentResponse(BaseModel):
    data: dict[str, Any]


class GovernmentMutationRequest(BaseModel):
    scenario: str | None = None
    region: str | None = None
    units: int | None = None
    agency: str | None = None
    note: str | None = None


class GovernmentMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any]

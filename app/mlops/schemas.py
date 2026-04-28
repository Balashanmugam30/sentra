from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class MLOpsMetricResponse(BaseModel):
    data: dict[str, Any]


class MLOpsListResponse(BaseModel):
    items: list[dict[str, Any]]


class MLOpsMutationRequest(BaseModel):
    model_id: str | None = None
    deployment_id: str | None = None
    scenario: str | None = None
    canary_percent: int | None = None
    reason: str | None = None
    zone: str | None = None
    occupancy: int | None = None
    smoke: int | None = None
    motion: int | None = None
    weather: str | None = None
    incident_history: int | None = None
    operator_load: int | None = None
    domain: str | None = None


class MLOpsMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)


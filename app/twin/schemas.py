from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class TwinResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class TwinListResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    items: list[dict[str, Any]]


class TwinMutationRequest(BaseModel):
    facility_id: str | None = None
    floor_id: str | None = None
    replay_id: str | None = None
    scenario_id: str | None = None
    timestamp: str | None = None
    speed: float | None = None
    actor: str | None = None
    reason: str | None = None
    payload: dict[str, Any] | None = None


class TwinMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


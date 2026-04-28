from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class MasterResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class MasterListResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    items: list[dict[str, Any]]


class MasterMutationRequest(BaseModel):
    action_id: str | None = None
    tenant_id: str | None = None
    scenario_id: str | None = None
    objective: str | None = None
    reason: str | None = None
    actor: str | None = None
    mode: str | None = None
    payload: dict[str, Any] | None = None


class MasterMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


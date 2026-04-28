from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class SecurityDefenseResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class SecurityDefenseListResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    items: list[dict[str, Any]]


class SecurityDefenseMutationRequest(BaseModel):
    user_id: str | None = None
    session_id: str | None = None
    api_key_id: str | None = None
    incident_id: str | None = None
    actor: str | None = None
    reason: str | None = None
    payload: dict[str, Any] | None = None


class SecurityDefenseMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class SecurityTrustResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class SecurityTrustListResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    items: list[dict[str, Any]]


class SecurityTrustMutationRequest(BaseModel):
    policy_id: str | None = None
    actor: str | None = None
    reason: str | None = None
    decision: str | None = None
    payload: dict[str, Any] | None = None


class SecurityTrustMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]

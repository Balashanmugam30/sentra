from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class LaunchResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class LaunchMutationRequest(BaseModel):
    target: str | None = None
    mode: str | None = None
    reason: str | None = None
    payload: dict[str, Any] | None = None


class LaunchMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]

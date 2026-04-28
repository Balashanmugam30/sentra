from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class PlatformResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class PlatformMutationRequest(BaseModel):
    key_id: str | None = None
    app_id: str | None = None
    webhook_id: str | None = None
    name: str | None = None
    environment: str | None = None
    scopes: list[str] | None = None
    redirect_urls: list[str] | None = None
    events: list[str] | None = None
    endpoint_url: str | None = None
    reason: str | None = None
    payload: dict[str, Any] | None = None


class PlatformMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


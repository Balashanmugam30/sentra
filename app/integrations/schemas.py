from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class IntegrationHubResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class IntegrationHubMutationRequest(BaseModel):
    connector_id: str | None = None
    provider: str | None = None
    message: str | None = None
    reason: str | None = None
    payload: dict[str, Any] | None = None


class IntegrationHubMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


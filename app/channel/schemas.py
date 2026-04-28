from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class ChannelResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class ChannelMutationRequest(BaseModel):
    partner_id: str | None = None
    reseller_id: str | None = None
    brand_id: str | None = None
    oem_id: str | None = None
    country_id: str | None = None
    commission_id: str | None = None
    pricing_id: str | None = None
    pipeline_id: str | None = None
    name: str | None = None
    country: str | None = None
    region: str | None = None
    tier: str | None = None
    status: str | None = None
    reason: str | None = None
    payload: dict[str, Any] | None = None


class ChannelMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


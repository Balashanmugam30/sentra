from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class PrestigeResponse(BaseModel):
    generated_at: str = Field(default_factory=_now)
    data: dict[str, Any]


class PrestigeLeadRequest(BaseModel):
    inquiry_type: str = "enterprise"
    name: str = "Demo Lead"
    organization: str = "Sentra Prospect"
    email: str = "lead@example.com"
    sector: str = "enterprise"
    urgency: str = "high"
    source: str = "site"
    message: str | None = None


class PrestigeMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=_now)
    data: dict[str, Any]

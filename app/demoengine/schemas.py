from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class DemoResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class DemoMutationRequest(BaseModel):
    mode: str | None = None
    scenario: str | None = None
    scene_id: str | None = None
    speed: int | None = None
    presenter_mode: bool | None = None
    reason: str | None = None


class DemoMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


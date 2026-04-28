from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.ml.store import utc_now_iso


class AnalyticsHubResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


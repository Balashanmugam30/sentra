from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class MLMetricResponse(BaseModel):
    data: dict[str, Any]


class MLListResponse(BaseModel):
    items: list[dict[str, Any]]


class MLMutationRequest(BaseModel):
    dataset_id: str | None = None
    model_id: str | None = None
    name: str | None = None
    domain: str | None = None
    rows: int | None = None
    columns: int | None = None
    missing_percent: float | None = None
    label_coverage: int | None = None
    quality_score: int | None = None
    model_domain: str | None = None
    algorithm: str | None = None
    dataset: str | None = None


class MLMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)

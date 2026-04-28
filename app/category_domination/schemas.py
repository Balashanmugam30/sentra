from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class CategoryLiveResponse(BaseModel):
    generated_at: str
    tam: int
    sam: int
    som_capture_target: int
    enterprise_wins: int
    gov_shortlists: int
    brand_mentions_month: int
    positive_sentiment: int
    analyst_rank: str
    competitive_win_rate: int
    nps: int
    renewal_confidence: int
    avg_roi_delivered: float
    ai_accuracy_advantage: int
    operational_speed_gain: int
    category_score: int
    leadership_label: str
    why_sentra_wins: str


class CategoryResponse(BaseModel):
    generated_at: str
    data: dict[str, Any]


class CategoryMutationRequest(BaseModel):
    scenario: str | None = None
    campaign: str | None = None


class CategoryMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any]


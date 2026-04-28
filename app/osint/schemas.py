from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class OsintNewsItem(BaseModel):
    headline: str
    source: str
    published_at: datetime
    category: str
    location_relevance: int = Field(..., ge=0, le=100)
    severity: Literal["low", "medium", "high", "critical"]
    summary: str
    url: str | None = None


class OsintSentimentSummary(BaseModel):
    positive: int = Field(..., ge=0, le=100)
    neutral: int = Field(..., ge=0, le=100)
    negative: int = Field(..., ge=0, le=100)
    fear: int = Field(..., ge=0, le=100)
    anger: int = Field(..., ge=0, le=100)
    urgency: int = Field(..., ge=0, le=100)


class OsintSignalSpike(BaseModel):
    signal_id: str
    keyword: str
    mention_volume: int = Field(..., ge=0)
    baseline: int = Field(..., ge=0)
    spike_score: int = Field(..., ge=0, le=100)
    trend: Literal["rising", "stable", "falling"]


class OsintRumorItem(BaseModel):
    rumor_id: str
    claim: str
    confidence: Literal["low", "medium", "high"]
    risk_level: Literal["low", "medium", "high", "critical"]
    related_keyword: str
    recommended_response: str


class OsintHistoryItem(BaseModel):
    event_id: str
    timestamp: datetime
    severity: Literal["low", "medium", "high", "critical"]
    title: str
    detail: str


class OsintExternalAlert(BaseModel):
    alert_id: str
    severity: Literal["low", "medium", "high", "critical"]
    action: str
    audience: Literal["executive", "public", "operations", "communications"]
    rationale: str


class OsintHotspot(BaseModel):
    hotspot_id: str
    label: str
    lat: float
    lng: float
    severity: Literal["low", "medium", "high", "critical"]
    source: str


class OsintLiveResponse(BaseModel):
    summary_only: bool = False
    partial: bool = False
    stale_data: bool = False
    provider: str
    updated_at: datetime
    threat_level: Literal["low", "medium", "high", "critical"]
    reputation_risk: int = Field(..., ge=0, le=100)
    mention_volume: int = Field(..., ge=0)
    sentiment_summary: OsintSentimentSummary
    signal_spikes: list[OsintSignalSpike]
    top_keywords: list[str]
    external_alerts: list[OsintExternalAlert]
    environment_cross_check: bool = False
    public_safety_cross_check: bool = False


class OsintNewsResponse(BaseModel):
    summary_only: bool = False
    provider: str
    updated_at: datetime
    items: list[OsintNewsItem]


class OsintRumorResponse(BaseModel):
    summary_only: bool = False
    provider: str
    updated_at: datetime
    items: list[OsintRumorItem]


class OsintHistoryResponse(BaseModel):
    summary_only: bool = False
    provider: str
    updated_at: datetime
    events: list[OsintHistoryItem]


class OsintFocusRequest(BaseModel):
    keyword: str


class OsintTestScenarioRequest(BaseModel):
    scenario: Literal[
        "viral_fire_video",
        "fake_lockdown_rumor",
        "protest_near_gate",
        "toxic_cloud_posts",
        "media_attention_spike",
        "competitor_incident",
        "calm_day",
    ]


class OsintTestScenarioResponse(BaseModel):
    status: str
    scenario: str
    live: OsintLiveResponse

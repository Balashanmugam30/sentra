from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class DataSource(BaseModel):
    source_id: str
    tenant_id: str
    name: str
    category: str
    signals_day: int
    freshness_seconds: int
    quality_score: int
    status: str
    last_ingested_at: datetime


class PipelineHealth(BaseModel):
    pipeline_id: str
    tenant_id: str
    name: str
    clean_rate: int
    enrichment_rate: int
    link_success: int
    latency_ms: int
    status: str


class SignalScore(BaseModel):
    signal_id: str
    tenant_id: str
    source: str
    category: str
    importance_score: int
    rarity_score: int
    prediction_value: int
    monetization_value: int
    trust_score: int
    decision_impact: int
    volume_day: int


class EntityNode(BaseModel):
    entity_type: str
    tenant_id: str
    label: str
    count: int
    centrality: int


class EntityRelationship(BaseModel):
    from_entity: str
    to_entity: str
    relationship: str
    strength: int


class EntityGraphResponse(BaseModel):
    tenant_id: str
    linked_entities: int
    nodes: list[EntityNode]
    relationships: list[EntityRelationship]
    graph_density: int
    identity_resolution_score: int


class ProprietaryInsight(BaseModel):
    insight_id: str
    tenant_id: str
    title: str
    category: str
    confidence: int
    estimated_value: int
    action: str


class ForecastPoint(BaseModel):
    forecast_id: str
    tenant_id: str
    horizon: str
    domain: str
    confidence: int
    risk_pressure: int
    upside_index: int
    recommended_action: str


class Anomaly(BaseModel):
    anomaly_id: str
    tenant_id: str
    title: str
    severity: str
    probability: int
    value: str


class DataProduct(BaseModel):
    product_id: str
    tenant_id: str
    name: str
    annual_revenue: int
    buyer_segment: str
    status: str
    gross_margin: int


class PredictiveDataset(BaseModel):
    dataset_id: str
    tenant_id: str
    name: str
    records: int
    accuracy_lift: int
    commercial_value: int


class DataEmpireLiveResponse(BaseModel):
    generated_at: datetime
    signals_day: int
    linked_entities: int
    unique_datasets: int
    prediction_accuracy: int
    insights_generated_day: int
    anomalies_found_week: int
    data_product_arr: int
    knowledge_growth_rate: int
    competitive_moat_score: int
    switching_cost_index: str


class SignalsResponse(BaseModel):
    sources: list[DataSource]
    pipelines: list[PipelineHealth]
    signals: list[SignalScore]
    summary: dict[str, Any]


class InsightsResponse(BaseModel):
    insights: list[ProprietaryInsight]


class ForecastResponse(BaseModel):
    forecasts: list[ForecastPoint]


class ValueResponse(BaseModel):
    products: list[DataProduct]
    datasets: list[PredictiveDataset]
    value: dict[str, Any]
    knowledge: dict[str, Any]
    anomalies: list[Anomaly]


class MoatResponse(BaseModel):
    moat: dict[str, Any]


class PrivacyResponse(BaseModel):
    privacy: dict[str, Any]


class DataEmpireMutationRequest(BaseModel):
    product_id: str | None = None
    scenario: str | None = None


class DataEmpireMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)

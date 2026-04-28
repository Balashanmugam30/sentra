from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class EcosystemApp(BaseModel):
    app_id: str
    tenant_id: str
    name: str
    category: str
    status: str
    rating: float
    installs: int
    marketplace_arr: int
    retention_lift: int
    security_verified: bool
    featured: bool
    install_id: str | None = None
    sync_health: int | None = None
    installed_by: str | None = None


class IntegrationHealth(BaseModel):
    integration_id: str
    tenant_id: str
    name: str
    category: str
    sync_health: int
    failed_syncs: int
    latency_ms: int
    token_expires_in_days: int
    critical: bool


class DeveloperMetrics(BaseModel):
    tenant_id: str
    api_keys: int
    oauth_apps: int
    sandbox_tenants: int
    developers_active: int
    sdk_downloads: int
    docs_score: int


class ApiUsage(BaseModel):
    tenant_id: str
    requests_day: int
    webhook_events_day: int
    avg_latency_ms: int
    p95_latency_ms: int
    rate_limit_blocks: int
    top_api_customers: list[str]
    usage_revenue_mrr: int


class WebhookHealth(BaseModel):
    tenant_id: str
    deliveries: int
    retries: int
    failures: int
    dead_letters: int
    success_rate: float
    top_event_types: list[str]


class EcosystemPartner(BaseModel):
    partner_id: str
    tenant_id: str
    name: str
    partner_type: str
    active_partners: int
    pipeline: int
    sourced_arr: int
    close_rate: int
    top_country: str
    status: str


class CertificationTrack(BaseModel):
    certification_id: str
    tenant_id: str
    name: str
    certified_count: int
    training_revenue: int
    completion_rate: int
    badge: str


class NetworkEffects(BaseModel):
    invites_caused_by_customers: int
    apps_causing_retention: int
    partners_causing_deals: int
    usage_causing_expansion: int
    community_referrals: int
    moat_score: int
    expansion_score: int
    flywheel: list[str]


class EcosystemRecommendation(BaseModel):
    recommendation_id: str
    title: str
    reason: str
    priority: str
    estimated_impact: str
    confidence: int
    cta: str


class WhiteLabelSdk(BaseModel):
    tenant_id: str
    branding_kits: int
    embedded_widgets: int
    tenant_oem_mode: bool
    sdk_access: list[str]
    private_deployment_kits: int
    partner_revenue_share_percent: int


class EcosystemLiveResponse(BaseModel):
    generated_at: datetime
    installed_apps: int
    active_integrations: int
    marketplace_arr: int
    api_requests_day: int
    webhook_events_day: int
    usage_revenue_mrr: int
    active_developers: int
    sdk_downloads: int
    partners_active: int
    partner_pipeline: int
    partner_arr: int
    certified_experts: int
    training_revenue: int
    moat_score: int
    expansion_score: int
    top_app_category: str


class MarketplaceResponse(BaseModel):
    apps: list[EcosystemApp]
    summary: dict[str, Any]


class IntegrationsResponse(BaseModel):
    integrations: list[IntegrationHealth]


class DevelopersResponse(BaseModel):
    developers: DeveloperMetrics
    white_label_sdk: WhiteLabelSdk


class ApiUsageResponse(BaseModel):
    usage: ApiUsage


class WebhooksResponse(BaseModel):
    webhooks: WebhookHealth


class PartnersResponse(BaseModel):
    partners: list[EcosystemPartner]


class CertificationsResponse(BaseModel):
    certifications: list[CertificationTrack]


class NetworkEffectsResponse(BaseModel):
    network_effects: NetworkEffects


class ExpansionAiResponse(BaseModel):
    recommendations: list[EcosystemRecommendation]


class EcosystemMutationRequest(BaseModel):
    app_id: str | None = None
    label: str | None = None
    partner_type: str | None = None
    track: str | None = None
    scenario: str | None = None


class EcosystemMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)

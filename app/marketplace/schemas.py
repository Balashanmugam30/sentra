from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


InstallStatus = Literal[
    "not_installed",
    "installing",
    "connected",
    "needs_config",
    "error",
    "disabled",
    "update_available",
]


class MarketplaceApp(BaseModel):
    app_id: str
    name: str
    slug: str
    vendor: str
    category: str
    description: str
    logo_key: str
    pricing_model: str
    rating: float
    review_count: int
    security_verified: bool
    enterprise_ready: bool
    region_support: list[str]
    install_complexity: str
    tags: list[str]
    version: str
    monthly_price: int = Field(ge=0)
    trial_available: bool
    featured: bool
    status: str


class MarketplaceInstallation(BaseModel):
    installation_id: str
    tenant_id: str
    app_id: str
    app_name: str
    category: str
    installed_at: datetime
    installed_by: str
    status: InstallStatus
    version: str
    config_masked: dict[str, Any]
    last_health_check: datetime
    usage_count: int = Field(ge=0)
    billing_addon_value: int = Field(ge=0)
    enabled: bool
    updated_at: datetime


class MarketplaceAppsResponse(BaseModel):
    apps: list[MarketplaceApp]
    total: int


class MarketplaceCategoriesResponse(BaseModel):
    categories: list[dict[str, str]]


class InstalledIntegrationsResponse(BaseModel):
    installations: list[MarketplaceInstallation]
    active_integrations: int
    monthly_addon_value: int


class MarketplaceRecommendation(BaseModel):
    recommendation_id: str
    app_id: str
    title: str
    reason: str
    estimated_impact: str
    priority: Literal["low", "medium", "high", "critical"]
    cta: str


class MarketplaceRecommendationsResponse(BaseModel):
    recommendations: list[MarketplaceRecommendation]


class MarketplaceMetricsResponse(BaseModel):
    marketplace_mrr: int
    addon_arr: int
    avg_apps_per_tenant: float
    top_paid_apps: list[dict[str, Any]]
    conversion_rate: int
    trial_to_paid_rate: int
    partner_revenue: int
    install_count: int
    active_integrations: int
    expansion_revenue: int


class MarketplaceMutationRequest(BaseModel):
    app_id: str | None = None
    config: dict[str, Any] = Field(default_factory=dict)
    rating: int | None = None
    title: str | None = None
    body: str | None = None
    vendor_name: str | None = None
    reason: str | None = None


class MarketplaceConfigRequest(BaseModel):
    config: dict[str, Any] = Field(default_factory=dict)


class MarketplaceMutationResponse(BaseModel):
    ok: bool
    message: str
    installation: MarketplaceInstallation | None = None
    data: dict[str, Any] = Field(default_factory=dict)


class MarketplaceEcosystemResponse(BaseModel):
    data: dict[str, Any]

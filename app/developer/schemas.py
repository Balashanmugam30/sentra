from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ApiKeyRecord(BaseModel):
    key_id: str
    tenant_id: str
    label: str
    masked_key: str
    created_at: datetime
    last_used: datetime | None = None
    scopes: list[str]
    rate_limit: int
    status: str


class WebhookRecord(BaseModel):
    webhook_id: str
    tenant_id: str
    endpoint: str
    events: list[str]
    status: str
    last_delivery: datetime | None = None
    failure_count: int
    secret_masked: str
    created_at: datetime


class OAuthAppRecord(BaseModel):
    client_id: str
    tenant_id: str
    name: str
    redirect_uri: str
    owner: str
    status: str
    created_at: datetime


class EmbedWidget(BaseModel):
    widget_id: str
    tenant_id: str
    widget_type: str
    name: str
    theme: str
    allowed_domains: list[str]
    refresh_interval: int
    public_token: str
    created_at: datetime


class ApiKeysResponse(BaseModel):
    keys: list[ApiKeyRecord]


class WebhooksResponse(BaseModel):
    webhooks: list[WebhookRecord]
    supported_events: list[str]


class OAuthAppsResponse(BaseModel):
    apps: list[OAuthAppRecord]


class DeveloperUsageResponse(BaseModel):
    api_calls_month: int
    webhook_deliveries: int
    failed_deliveries: int
    active_keys: int
    active_webhooks: int
    rate_limit_remaining: int
    top_events: list[dict[str, Any]]


class DeveloperDocsResponse(BaseModel):
    base_url: str
    auth: str
    resources: list[dict[str, Any]]
    webhook_events: list[str]


class DeveloperSdkResponse(BaseModel):
    sdks: list[dict[str, Any]]
    quickstart: list[str]


class ApiKeyCreateRequest(BaseModel):
    label: str = "Sentra API Key"
    scopes: list[str] = Field(default_factory=lambda: ["read:incidents", "read:alerts"])
    rate_limit: int = 60_000


class ApiKeyRevokeRequest(BaseModel):
    key_id: str


class WebhookCreateRequest(BaseModel):
    endpoint: str
    events: list[str] = Field(default_factory=lambda: ["incident.created", "alert.critical"])


class WebhookTestRequest(BaseModel):
    webhook_id: str | None = None
    event: str = "alert.critical"


class OAuthAppCreateRequest(BaseModel):
    name: str
    redirect_uri: str


class EmbedWidgetCreateRequest(BaseModel):
    widget_type: str = "readiness_meter"
    name: str = "Sentra Widget"
    theme: str = "dark"
    allowed_domains: list[str] = Field(default_factory=lambda: ["localhost"])
    refresh_interval: int = 30


class EmbedWidgetsResponse(BaseModel):
    widgets: list[EmbedWidget]


class DeveloperMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)

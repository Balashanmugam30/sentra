from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.integrations.delivery import (
    configure_runtime_webhook,
    get_integrations_live_snapshot,
    retry_failed_integrations,
    send_integration_test,
)
from app.integrations.schemas import IntegrationHubMutationRequest, IntegrationHubMutationResponse, IntegrationHubResponse
from app.integrations.service import integration_hub_service
from app.integrations.store import integration_hub_store
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.rbac.guard import require_any_permission
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/integrations", tags=["Integrations"])


class IntegrationProviderItem(BaseModel):
    name: str
    status: str
    mode: str
    success_rate: int = Field(..., ge=0, le=100)
    last_delivery_at: datetime | None = None
    pending_count: int = Field(..., ge=0)
    failed_count: int = Field(..., ge=0)


class IntegrationQueueMetrics(BaseModel):
    pending: int = Field(..., ge=0)
    sent: int = Field(..., ge=0)
    failed: int = Field(..., ge=0)
    retried: int = Field(..., ge=0)


class IntegrationsLiveResponse(BaseModel):
    generated_at: datetime
    n8n_enabled: bool
    webhook_configured: bool
    global_status: str
    providers: list[IntegrationProviderItem]
    queue_metrics: IntegrationQueueMetrics
    recent_events: list[str]


class IntegrationTestRequest(BaseModel):
    provider: str = "slack"
    message: str = "Sentra integration health test"
    connector_id: str | None = None


class IntegrationTestResponse(BaseModel):
    status: str
    provider: str
    mode: str
    receipt_id: str
    latency_ms: int = Field(..., ge=0)
    n8n_triggered: bool


class RetryFailedResponse(BaseModel):
    retried_count: int = Field(..., ge=0)
    remaining_failed: int = Field(..., ge=0)
    status: str


class WebhookConfigRequest(BaseModel):
    url: str


class WebhookConfigResponse(BaseModel):
    status: str
    webhook_configured: bool
    n8n_enabled: bool


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin", "executive"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 10):
    return cached_call(identity_tenant_cache_key(identity, f"integrations:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "integrations:"))


@router.get("/summary", response_model=IntegrationHubResponse)
def get_integrations_summary_route(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> IntegrationHubResponse:
    return IntegrationHubResponse(
        data=_cache(identity, "summary", lambda: integration_hub_service.summary(_scope(identity, tenant)), 10)
    )


@router.post("/connect", response_model=IntegrationHubMutationResponse)
def post_integrations_connect_route(
    payload: IntegrationHubMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(require_any_permission("operations.manage", "governance.approve")),
) -> IntegrationHubMutationResponse:
    provider = payload.provider or (payload.payload or {}).get("provider") or "Custom Enterprise Connector"
    result = integration_hub_store.connect(str(tenant["tenant_id"]), str(provider))
    _clear(identity)
    append_audit_event(
        category="integrations",
        action="connector_connected",
        severity="medium",
        target_module="integrations",
        status="success",
        reason=payload.reason or f"Connected {provider}",
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        target_id=str(provider),
        risk_score=36,
    )
    return IntegrationHubMutationResponse(ok=True, message=f"{provider} connected", data=result)


@router.get("/logs", response_model=IntegrationHubResponse)
def get_integrations_logs_route(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> IntegrationHubResponse:
    return IntegrationHubResponse(
        data=_cache(identity, "logs", lambda: integration_hub_service.logs(_scope(identity, tenant)), 6)
    )


@router.get("/live", response_model=IntegrationsLiveResponse)
def get_integrations_live_route() -> IntegrationsLiveResponse:
    snapshot = get_integrations_live_snapshot()
    return IntegrationsLiveResponse(
        generated_at=datetime.now(timezone.utc),
        n8n_enabled=snapshot["n8n_enabled"],
        webhook_configured=snapshot["webhook_configured"],
        global_status=snapshot["global_status"],
        providers=snapshot["providers"],
        queue_metrics=snapshot["queue_metrics"],
        recent_events=snapshot["recent_events"],
    )


@router.post("/test", response_model=IntegrationTestResponse)
def post_integrations_test_route(
    request: Request,
    payload: IntegrationTestRequest,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(require_any_permission("operations.manage", "governance.approve")),
) -> IntegrationTestResponse:
    if payload.connector_id:
        result = integration_hub_store.test(_scope(identity, tenant), payload.connector_id)
        if result is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found for tenant scope")
        connector = result["connector"]
        log = result["log"]
        _clear(identity)
        append_audit_event(
            category="integrations",
            action="connector_tested",
            severity="medium",
            target_module="integrations",
            status="success",
            reason=f"Integration hub test for {connector['name']}",
            request=request,
            identity=identity,
            tenant_id=str(tenant["tenant_id"]),
            target_id=payload.connector_id,
            risk_score=24,
        )
        return IntegrationTestResponse(
            status="delivered",
            provider=str(connector["name"]),
            mode="hub",
            receipt_id=str(log["log_id"]),
            latency_ms=int(log["latency_ms"]),
            n8n_triggered=False,
        )

    result = send_integration_test(payload.provider, payload.message)
    append_audit_event(
        category="integrations",
        action="delivery_test",
        severity="medium",
        target_module="integrations",
        status="success",
        reason=f"Integration test for {payload.provider}",
        request=request,
        identity=identity,
        target_id=payload.provider,
        risk_score=28,
    )
    return IntegrationTestResponse(**result)


@router.post("/retry-failed", response_model=RetryFailedResponse)
def post_integrations_retry_failed_route() -> RetryFailedResponse:
    return RetryFailedResponse(**retry_failed_integrations())


@router.post("/webhook-config", response_model=WebhookConfigResponse)
def post_integrations_webhook_config_route(
    payload: WebhookConfigRequest,
) -> WebhookConfigResponse:
    return WebhookConfigResponse(**configure_runtime_webhook(payload.url))

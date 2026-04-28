from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.developer.models import WEBHOOK_EVENTS
from app.developer.schemas import (
    ApiKeyCreateRequest,
    ApiKeyRevokeRequest,
    ApiKeysResponse,
    DeveloperDocsResponse,
    DeveloperMutationResponse,
    DeveloperSdkResponse,
    DeveloperUsageResponse,
    EmbedWidgetCreateRequest,
    EmbedWidgetsResponse,
    OAuthAppCreateRequest,
    OAuthAppsResponse,
    WebhookCreateRequest,
    WebhookTestRequest,
    WebhooksResponse,
)
from app.developer.service import developer_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/dev", tags=["Developer Platform"])
embed_router = APIRouter(prefix="/embed", tags=["Embeds"])

DEV_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander"}
DEV_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in DEV_APP_ROLES or str(tenant.get("org_role") or "") in DEV_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Developer platform access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "developer:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="developer",
        action=action,
        severity="medium",
        target_module="developer",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=34,
    )


@router.get("/keys", response_model=ApiKeysResponse)
def get_dev_keys(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ApiKeysResponse:
    _require_access(identity, tenant)
    return ApiKeysResponse(keys=cached_call(identity_tenant_cache_key(identity, "developer:keys"), 10, lambda: developer_store.api_keys(_scope(identity, tenant))))


@router.post("/keys/create", response_model=DeveloperMutationResponse)
def post_dev_key_create(payload: ApiKeyCreateRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperMutationResponse:
    _require_access(identity, tenant)
    key = developer_store.create_key(str(tenant["tenant_id"]), payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "api_key_created", f"API key created: {key['label']}", key["key_id"])
    return DeveloperMutationResponse(ok=True, message="API key created", data={"key": key})


@router.post("/keys/revoke", response_model=DeveloperMutationResponse)
def post_dev_key_revoke(payload: ApiKeyRevokeRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperMutationResponse:
    _require_access(identity, tenant)
    key = developer_store.revoke_key(_scope(identity, tenant), payload.key_id)
    if key is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    _clear(identity)
    _log(request, identity, tenant, "api_key_revoked", f"API key revoked: {payload.key_id}", payload.key_id)
    return DeveloperMutationResponse(ok=True, message="API key revoked", data={"key": key})


@router.get("/webhooks", response_model=WebhooksResponse)
def get_dev_webhooks(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> WebhooksResponse:
    _require_access(identity, tenant)
    return WebhooksResponse(webhooks=cached_call(identity_tenant_cache_key(identity, "developer:webhooks"), 10, lambda: developer_store.webhooks(_scope(identity, tenant))), supported_events=list(WEBHOOK_EVENTS))


@router.post("/webhooks/create", response_model=DeveloperMutationResponse)
def post_dev_webhook_create(payload: WebhookCreateRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperMutationResponse:
    _require_access(identity, tenant)
    webhook = developer_store.create_webhook(str(tenant["tenant_id"]), payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "webhook_created", f"Webhook created: {webhook['endpoint']}", webhook["webhook_id"])
    return DeveloperMutationResponse(ok=True, message="Webhook created", data={"webhook": webhook})


@router.post("/webhooks/test", response_model=DeveloperMutationResponse)
def post_dev_webhook_test(payload: WebhookTestRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperMutationResponse:
    _require_access(identity, tenant)
    result = developer_store.test_webhook(_scope(identity, tenant), payload.webhook_id, payload.event)
    if not result["ok"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found")
    _clear(identity)
    _log(request, identity, tenant, "webhook_tested", "Webhook test delivered", payload.webhook_id)
    return DeveloperMutationResponse(ok=True, message="Webhook test delivered", data=result)


@router.delete("/webhooks/{webhook_id}", response_model=DeveloperMutationResponse)
def delete_dev_webhook(webhook_id: str, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperMutationResponse:
    _require_access(identity, tenant)
    deleted = developer_store.delete_webhook(_scope(identity, tenant), webhook_id)
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found")
    _clear(identity)
    _log(request, identity, tenant, "webhook_deleted", "Webhook deleted", webhook_id)
    return DeveloperMutationResponse(ok=True, message="Webhook deleted", data={"webhook": deleted})


@router.get("/apps", response_model=OAuthAppsResponse)
def get_dev_apps(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OAuthAppsResponse:
    _require_access(identity, tenant)
    return OAuthAppsResponse(apps=developer_store.oauth_apps(_scope(identity, tenant)))


@router.post("/apps/register", response_model=DeveloperMutationResponse)
def post_dev_app_register(payload: OAuthAppCreateRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperMutationResponse:
    _require_access(identity, tenant)
    app = developer_store.register_app(str(tenant["tenant_id"]), str(identity.get("email") or "owner"), payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "oauth_app_registered", f"OAuth app registered: {app['name']}", app["client_id"])
    return DeveloperMutationResponse(ok=True, message="OAuth app registered", data={"app": app})


@router.get("/usage", response_model=DeveloperUsageResponse)
def get_dev_usage(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperUsageResponse:
    _require_access(identity, tenant)
    return DeveloperUsageResponse(**cached_call(identity_tenant_cache_key(identity, "developer:usage"), 10, lambda: developer_store.usage(_scope(identity, tenant))))


@router.get("/docs", response_model=DeveloperDocsResponse)
def get_dev_docs(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperDocsResponse:
    _require_access(identity, tenant)
    return DeveloperDocsResponse(**developer_store.docs())


@router.get("/sdk", response_model=DeveloperSdkResponse)
def get_dev_sdk(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperSdkResponse:
    _require_access(identity, tenant)
    return DeveloperSdkResponse(**developer_store.sdk())


@embed_router.get("/widgets", response_model=EmbedWidgetsResponse)
def get_embed_widgets(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> EmbedWidgetsResponse:
    _require_access(identity, tenant)
    return EmbedWidgetsResponse(widgets=developer_store.widgets(_scope(identity, tenant)))


@embed_router.post("/widgets/create", response_model=DeveloperMutationResponse)
def post_embed_widget_create(payload: EmbedWidgetCreateRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperMutationResponse:
    _require_access(identity, tenant)
    widget = developer_store.create_widget(str(tenant["tenant_id"]), payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "embed_widget_created", f"Embed widget created: {widget['name']}", widget["widget_id"])
    return DeveloperMutationResponse(ok=True, message="Embed widget created", data={"widget": widget})


@embed_router.get("/widget/{widget_id}")
def get_embed_widget(widget_id: str) -> dict[str, object]:
    widget = developer_store.public_widget(widget_id)
    if widget is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Widget not found")
    return widget

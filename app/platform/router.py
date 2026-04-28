from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.platform.schemas import PlatformMutationRequest, PlatformMutationResponse, PlatformResponse
from app.platform.service import platform_service
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/platform", tags=["Developer Platform Public APIs OS"])

PLATFORM_READ_ROLES = {"super_admin", "admin"}
PLATFORM_MUTATION_ROLES = {"super_admin", "admin"}
PLATFORM_ORG_ROLES = {"owner", "org_admin", "developer_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in PLATFORM_READ_ROLES or str(tenant.get("org_role") or "") in PLATFORM_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Developer platform access required")


def _require_mutation(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in PLATFORM_MUTATION_ROLES or str(tenant.get("org_role") or "") in PLATFORM_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Developer platform admin access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 10):
    return cached_call(identity_tenant_cache_key(identity, f"platform:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "platform:"))


def _log(
    request: Request,
    identity: dict[str, object],
    tenant: dict[str, object],
    action: str,
    reason: str,
    risk_score: int = 44,
) -> None:
    append_audit_event(
        category="developer_platform",
        action=action,
        severity="high" if risk_score >= 70 else "medium",
        target_module="platform",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/summary", response_model=PlatformResponse)
def get_platform_summary(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "summary", lambda: platform_service.summary(_scope(identity, tenant)), 10))


@router.get("/apikeys", response_model=PlatformResponse)
def get_api_keys(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "apikeys", lambda: platform_service.api_keys(_scope(identity, tenant)), 10))


@router.post("/apikey/create", response_model=PlatformMutationResponse)
def create_api_key(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    result = platform_service.create_api_key(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "api_key_create", payload.reason or "Developer API key created", 55)
    return PlatformMutationResponse(ok=True, message="API key created with masked secret and audit evidence", data=result)


@router.post("/apikey/revoke", response_model=PlatformMutationResponse)
def revoke_api_key(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.key_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="key_id is required")
    result = platform_service.update_api_key(_scope(identity, tenant), payload.key_id, "revoke")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "api_key_revoke", payload.reason or "Developer API key revoked", 72)
    return PlatformMutationResponse(ok=True, message="API key revoked immediately", data=result)


@router.post("/apikey/rotate", response_model=PlatformMutationResponse)
def rotate_api_key(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.key_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="key_id is required")
    result = platform_service.update_api_key(_scope(identity, tenant), payload.key_id, "rotate")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "api_key_rotate", payload.reason or "Developer API key rotated", 62)
    return PlatformMutationResponse(ok=True, message="API key rotated and old secret invalidated", data=result)


@router.get("/apps", response_model=PlatformResponse)
def get_apps(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "apps", lambda: platform_service.apps(_scope(identity, tenant)), 10))


@router.post("/apps/create", response_model=PlatformMutationResponse)
def create_app(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    result = platform_service.create_app(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "oauth_app_create", payload.reason or "OAuth app created", 56)
    return PlatformMutationResponse(ok=True, message="OAuth app created with tenant-scoped credentials", data=result)


@router.post("/apps/update", response_model=PlatformMutationResponse)
def update_app(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.app_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="app_id is required")
    result = platform_service.update_app(_scope(identity, tenant), payload.app_id, payload.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OAuth app not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "oauth_app_scope_change", payload.reason or "OAuth app settings updated", 64)
    return PlatformMutationResponse(ok=True, message="OAuth app updated and scope change audited", data=result)


@router.post("/apps/revoke", response_model=PlatformMutationResponse)
def revoke_app(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.app_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="app_id is required")
    result = platform_service.update_app(_scope(identity, tenant), payload.app_id, payload.model_dump(exclude_none=True), "revoke")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OAuth app not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "oauth_app_revoke", payload.reason or "OAuth app revoked", 74)
    return PlatformMutationResponse(ok=True, message="OAuth app revoked and tokens invalidated", data=result)


@router.get("/webhooks", response_model=PlatformResponse)
def get_webhooks(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "webhooks", lambda: platform_service.webhooks(_scope(identity, tenant)), 10))


@router.post("/webhook/create", response_model=PlatformMutationResponse)
def create_webhook(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    result = platform_service.create_webhook(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "webhook_create", payload.reason or "Webhook created", 54)
    return PlatformMutationResponse(ok=True, message="Webhook created with verified signature profile", data=result)


@router.post("/webhook/test", response_model=PlatformMutationResponse)
def test_webhook(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.webhook_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="webhook_id is required")
    result = platform_service.update_webhook(_scope(identity, tenant), payload.webhook_id, "test")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "webhook_test", payload.reason or "Webhook test delivered", 44)
    return PlatformMutationResponse(ok=True, message="Webhook test delivered", data=result)


@router.post("/webhook/retry", response_model=PlatformMutationResponse)
def retry_webhook(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.webhook_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="webhook_id is required")
    result = platform_service.update_webhook(_scope(identity, tenant), payload.webhook_id, "retry")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "webhook_retry", payload.reason or "Webhook delivery replayed", 58)
    return PlatformMutationResponse(ok=True, message="Webhook delivery replayed with retry evidence", data=result)


@router.post("/webhook/disable", response_model=PlatformMutationResponse)
def disable_webhook(
    payload: PlatformMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.webhook_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="webhook_id is required")
    result = platform_service.update_webhook(_scope(identity, tenant), payload.webhook_id, "disable")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "webhook_disable", payload.reason or "Webhook disabled", 70)
    return PlatformMutationResponse(ok=True, message="Webhook disabled and delivery queue paused", data=result)


@router.get("/usage", response_model=PlatformResponse)
def get_usage(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "usage", lambda: platform_service.usage(_scope(identity, tenant)), 10))


@router.get("/ratelimits", response_model=PlatformResponse)
def get_rate_limits(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "ratelimits", lambda: platform_service.rate_limits(_scope(identity, tenant)), 10))


@router.get("/logs", response_model=PlatformResponse)
def get_logs(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "logs", lambda: platform_service.logs(_scope(identity, tenant)), 10))


@router.get("/sdks", response_model=PlatformResponse)
def get_sdks(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "sdks", lambda: platform_service.sdks(_scope(identity, tenant)), 30))


@router.get("/docs", response_model=PlatformResponse)
def get_docs(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "docs", lambda: platform_service.docs(_scope(identity, tenant)), 30))


@router.get("/sandbox", response_model=PlatformResponse)
def get_sandbox(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PlatformResponse:
    _require_access(identity, tenant)
    return PlatformResponse(data=_cache(identity, "sandbox", lambda: platform_service.sandbox(_scope(identity, tenant)), 15))


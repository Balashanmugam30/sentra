from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.launchcore.schemas import LaunchMutationRequest, LaunchMutationResponse, LaunchResponse
from app.launchcore.service import launch_service
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/launch", tags=["Phase 29.A Launch Excellence"])


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin", "executive"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 10):
    return cached_call(identity_tenant_cache_key(identity, f"launch:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "launch:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, risk_score: int = 22) -> None:
    append_audit_event(
        category="launch_excellence",
        action=action,
        severity="medium",
        target_module="launchcore",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/summary", response_model=LaunchResponse)
def get_launch_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LaunchResponse:
    return LaunchResponse(data=_cache(identity, "summary", lambda: launch_service.summary(_scope(identity, tenant)), 12))


@router.get("/performance", response_model=LaunchResponse)
def get_launch_performance(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LaunchResponse:
    return LaunchResponse(data=_cache(identity, "performance", lambda: launch_service.performance(_scope(identity, tenant)), 10))


@router.get("/quality", response_model=LaunchResponse)
def get_launch_quality(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LaunchResponse:
    return LaunchResponse(data=_cache(identity, "quality", lambda: launch_service.quality(_scope(identity, tenant)), 10))


@router.get("/readiness", response_model=LaunchResponse)
def get_launch_readiness(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LaunchResponse:
    return LaunchResponse(data=_cache(identity, "readiness", lambda: launch_service.readiness(_scope(identity, tenant)), 15))


@router.get("/executive", response_model=LaunchResponse)
def get_launch_executive(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LaunchResponse:
    return LaunchResponse(data=_cache(identity, "executive", lambda: launch_service.executive(_scope(identity, tenant)), 15))


@router.get("/ops", response_model=LaunchResponse)
def get_launch_ops(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LaunchResponse:
    return LaunchResponse(data=_cache(identity, "ops", lambda: launch_service.ops(_scope(identity, tenant)), 8))


@router.post("/scan", response_model=LaunchMutationResponse)
def post_launch_scan(payload: LaunchMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LaunchMutationResponse:
    result = launch_service.scan(str(tenant["tenant_id"]), payload.target or "all")
    _clear(identity)
    _log(request, identity, tenant, "launch_scan", payload.reason or "Launch quality scan executed", 26)
    return LaunchMutationResponse(ok=True, message="Launch quality scan completed", data=result)


@router.post("/optimize", response_model=LaunchMutationResponse)
def post_launch_optimize(payload: LaunchMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LaunchMutationResponse:
    result = launch_service.optimize(str(tenant["tenant_id"]), payload.target or "performance")
    _clear(identity)
    _log(request, identity, tenant, "launch_optimize", payload.reason or "Launch optimization queued", 24)
    return LaunchMutationResponse(ok=True, message="Launch optimization queued", data=result)

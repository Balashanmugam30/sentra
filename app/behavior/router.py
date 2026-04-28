from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.behavior.decision_service import decision_service
from app.behavior.schemas import (
    BehaviorMetricResponse,
    BehaviorRecommendationsResponse,
    BehaviorRunRequest,
    BehaviorRunResponse,
    BehaviorSummaryResponse,
    BehaviorZonesResponse,
)
from app.behavior.service import behavior_service
from app.behavior.store import tenant_scope
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/behavior", tags=["Human Behavior Intelligence"])

BEHAVIOR_APP_ROLES = {"super_admin", "admin", "security_manager", "security_lead", "operations_commander", "executive", "analyst", "responder"}
BEHAVIOR_ORG_ROLES = {"owner", "org_admin", "operator", "executive"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in BEHAVIOR_APP_ROLES or str(tenant.get("org_role") or "") in BEHAVIOR_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Human behavior intelligence access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "behavior:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str) -> None:
    append_audit_event(
        category="behavior",
        action=action,
        severity="medium",
        target_module="behavior",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=38,
    )


@router.get("/summary", response_model=BehaviorSummaryResponse)
def get_behavior_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BehaviorSummaryResponse:
    _require_access(identity, tenant)
    return BehaviorSummaryResponse(summary=cached_call(identity_tenant_cache_key(identity, "behavior:summary"), 10, lambda: behavior_service.summary(_scope(identity, tenant))))


@router.get("/zones", response_model=BehaviorZonesResponse)
def get_behavior_zones(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BehaviorZonesResponse:
    _require_access(identity, tenant)
    return BehaviorZonesResponse(zones=cached_call(identity_tenant_cache_key(identity, "behavior:zones"), 10, lambda: behavior_service.zones(_scope(identity, tenant))))


@router.get("/panic", response_model=BehaviorMetricResponse)
def get_behavior_panic(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BehaviorMetricResponse:
    _require_access(identity, tenant)
    return BehaviorMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:panic"), 10, lambda: behavior_service.panic(_scope(identity, tenant))))


@router.get("/freeze", response_model=BehaviorMetricResponse)
def get_behavior_freeze(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BehaviorMetricResponse:
    _require_access(identity, tenant)
    return BehaviorMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:freeze"), 10, lambda: behavior_service.freeze(_scope(identity, tenant))))


@router.get("/compliance", response_model=BehaviorMetricResponse)
def get_behavior_compliance(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BehaviorMetricResponse:
    _require_access(identity, tenant)
    return BehaviorMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:compliance"), 12, lambda: behavior_service.compliance(_scope(identity, tenant))))


@router.get("/vulnerable", response_model=BehaviorMetricResponse)
def get_behavior_vulnerable(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BehaviorMetricResponse:
    _require_access(identity, tenant)
    return BehaviorMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:vulnerable"), 12, lambda: behavior_service.vulnerable(_scope(identity, tenant))))


@router.get("/recommendations", response_model=BehaviorRecommendationsResponse)
def get_behavior_recommendations(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BehaviorRecommendationsResponse:
    _require_access(identity, tenant)
    return BehaviorRecommendationsResponse(recommendations=cached_call(identity_tenant_cache_key(identity, "behavior:recommendations"), 10, lambda: behavior_service.recommendations(_scope(identity, tenant))))


@router.get("/executive", response_model=BehaviorMetricResponse)
def get_behavior_executive(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BehaviorMetricResponse:
    _require_access(identity, tenant)
    return BehaviorMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:executive"), 12, lambda: behavior_service.executive(_scope(identity, tenant))))


@router.post("/run", response_model=BehaviorRunResponse)
def post_behavior_run(payload: BehaviorRunRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> BehaviorRunResponse:
    _require_access(identity, tenant)
    scoped_tenants = _scope(identity, tenant)
    result = {
        "behavior_model": behavior_service.run(scoped_tenants, payload.scenario),
        "autonomous_decision": decision_service.run(scoped_tenants, payload.scenario).get("decision"),
    }
    _clear(identity)
    _log(request, identity, tenant, "behavior_decision_run", f"Human behavior and autonomous decision model run: {payload.scenario or 'active_evacuation'}")
    return BehaviorRunResponse(ok=True, message="Human behavior and autonomous response model refreshed", data=result)

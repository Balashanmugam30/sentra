from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.behavior.crowd_service import crowd_service
from app.behavior.decision_service import decision_service
from app.behavior.schemas import CrowdMetricResponse, CrowdMutationRequest, CrowdMutationResponse
from app.behavior.store import tenant_scope
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/behavior", tags=["Crowd Dynamics Intelligence"])

CROWD_APP_ROLES = {"super_admin", "admin", "security_manager", "security_lead", "operations_commander", "executive", "analyst", "responder"}
CROWD_ORG_ROLES = {"owner", "org_admin", "operator", "executive"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in CROWD_APP_ROLES or str(tenant.get("org_role") or "") in CROWD_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Crowd dynamics intelligence access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "behavior:crowd:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "behavior:evacuation:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str) -> None:
    append_audit_event(
        category="behavior",
        action=action,
        severity="medium",
        target_module="behavior_crowd",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=43,
    )


@router.get("/crowd", response_model=CrowdMetricResponse)
def get_crowd_command(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CrowdMetricResponse:
    _require_access(identity, tenant)
    return CrowdMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:crowd:command"), 8, lambda: crowd_service.crowd(_scope(identity, tenant))))


@router.get("/occupancy", response_model=CrowdMetricResponse)
def get_crowd_occupancy(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CrowdMetricResponse:
    _require_access(identity, tenant)
    return CrowdMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:crowd:occupancy"), 8, lambda: crowd_service.occupancy(_scope(identity, tenant))))


@router.get("/routes", response_model=CrowdMetricResponse)
def get_crowd_routes(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CrowdMetricResponse:
    _require_access(identity, tenant)
    return CrowdMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:crowd:routes"), 8, lambda: crowd_service.routes(_scope(identity, tenant))))


@router.get("/exits", response_model=CrowdMetricResponse)
def get_crowd_exits(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CrowdMetricResponse:
    _require_access(identity, tenant)
    return CrowdMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:crowd:exits"), 8, lambda: crowd_service.exits(_scope(identity, tenant))))


@router.get("/evacuation", response_model=CrowdMetricResponse)
def get_evacuation_center(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CrowdMetricResponse:
    _require_access(identity, tenant)
    return CrowdMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:evacuation:center"), 10, lambda: crowd_service.evacuation(_scope(identity, tenant))))


@router.post("/simulate", response_model=CrowdMutationResponse)
def post_crowd_simulation(payload: CrowdMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CrowdMutationResponse:
    _require_access(identity, tenant)
    scoped_tenants = _scope(identity, tenant)
    result = {
        "crowd": crowd_service.simulate(scoped_tenants, payload.scenario, payload.environment_id),
        "autonomous_decision": decision_service.simulate(scoped_tenants, payload.scenario),
    }
    _clear(identity)
    _log(request, identity, tenant, "crowd_simulation_run", f"Crowd movement simulation run: {payload.scenario or 'multi_floor_hotel_fire'}")
    return CrowdMutationResponse(ok=True, message="Crowd dynamics and autonomous decision simulation complete", data=result)


@router.post("/route/recompute", response_model=CrowdMutationResponse)
def post_route_recompute(payload: CrowdMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CrowdMutationResponse:
    _require_access(identity, tenant)
    result = crowd_service.recompute_route(_scope(identity, tenant), payload.environment_id, payload.avoid_zone)
    _clear(identity)
    _log(request, identity, tenant, "crowd_route_recomputed", f"Crowd-safe route recomputed with avoid_zone={payload.avoid_zone or 'none'}")
    return CrowdMutationResponse(ok=True, message="Crowd-safe routes recomputed", data=result)

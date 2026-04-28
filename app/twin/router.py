from __future__ import annotations

from fastapi import APIRouter, Body, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key
from app.twin.schemas import TwinListResponse, TwinMutationRequest, TwinMutationResponse, TwinResponse
from app.twin.ai_service import twin_ai_service
from app.twin.service import twin_service

router = APIRouter(prefix="/twin", tags=["Digital Twin Supremacy Core"])

TWIN_APP_ROLES = {"super_admin", "admin", "executive", "security_manager", "operations_commander", "analyst"}
TWIN_ORG_ROLES = {"owner", "org_admin", "executive", "ops_admin", "security_admin", "operator"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in TWIN_APP_ROLES or str(tenant.get("org_role") or "") in TWIN_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Digital twin access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin", "executive"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 8):
    return cached_call(identity_tenant_cache_key(identity, f"twin:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "twin:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, risk_score: int = 44) -> None:
    append_audit_event(
        category="digital_twin",
        action=action,
        severity="high" if risk_score >= 70 else "medium",
        target_module="twin",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/summary", response_model=TwinResponse)
def get_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "summary", lambda: twin_service.summary(_scope(identity, tenant)), 8))


@router.get("/live", response_model=TwinResponse)
def get_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "live", lambda: twin_service.live(_scope(identity, tenant)), 5))


@router.get("/facility", response_model=TwinResponse)
def get_facility(facility_id: str | None = None, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, f"facility:{facility_id or 'default'}", lambda: twin_service.facility(_scope(identity, tenant), facility_id), 10))


@router.get("/floor/{floor_id}", response_model=TwinResponse)
def get_floor(floor_id: str, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, f"floor:{floor_id}", lambda: twin_service.floor(_scope(identity, tenant), floor_id), 8))


@router.get("/replay", response_model=TwinResponse)
def get_replay(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "replay", lambda: twin_service.replay(_scope(identity, tenant)), 12))


@router.post("/replay/load", response_model=TwinMutationResponse)
def load_replay(payload: TwinMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinMutationResponse:
    _require_access(identity, tenant)
    result = twin_service.load_replay(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "twin_replay_loaded", payload.reason or "Incident replay loaded", 38)
    return TwinMutationResponse(ok=True, message="Incident replay loaded", data=result)


@router.post("/simulate", response_model=TwinMutationResponse)
def simulate(payload: TwinMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinMutationResponse:
    _require_access(identity, tenant)
    result = twin_service.simulate(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "twin_simulation_executed", payload.reason or "Digital twin scenario simulation executed", 62)
    return TwinMutationResponse(ok=True, message="Digital twin simulation executed", data=result)


@router.get("/routes", response_model=TwinListResponse)
def get_routes(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinListResponse:
    _require_access(identity, tenant)
    return TwinListResponse(items=_cache(identity, "routes", lambda: twin_service.routes(_scope(identity, tenant)), 8))


@router.get("/telemetry", response_model=TwinResponse)
def get_telemetry(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "telemetry", lambda: twin_service.telemetry(_scope(identity, tenant)), 5))


@router.get("/scenarios", response_model=TwinListResponse)
def get_scenarios(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinListResponse:
    _require_access(identity, tenant)
    return TwinListResponse(items=_cache(identity, "scenarios", lambda: twin_ai_service.scenarios(_scope(identity, tenant)), 20))


@router.get("/predict", response_model=TwinResponse)
def get_predict(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "predict", lambda: twin_ai_service.predict(_scope(identity, tenant)), 6))


@router.get("/forecast", response_model=TwinResponse)
def get_forecast(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "forecast", lambda: twin_ai_service.forecast(_scope(identity, tenant)), 8))


@router.get("/risk-map", response_model=TwinResponse)
def get_risk_map(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "risk_map", lambda: twin_ai_service.risk_map(_scope(identity, tenant)), 6))


@router.post("/route/compute", response_model=TwinMutationResponse)
def compute_route(payload: TwinMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinMutationResponse:
    _require_access(identity, tenant)
    result = twin_ai_service.compute_route(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "twin_route_computed", payload.reason or "Autonomous route optimization computed", 42)
    return TwinMutationResponse(ok=True, message="Autonomous route computed", data=result)


@router.get("/routes/live", response_model=TwinResponse)
def get_live_routes(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "routes_live", lambda: twin_ai_service.live_routes(_scope(identity, tenant)), 6))


@router.get("/resources", response_model=TwinResponse)
def get_resources(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "resources", lambda: twin_ai_service.resources(_scope(identity, tenant)), 8))


@router.post("/resources/rebalance", response_model=TwinMutationResponse)
def rebalance_resources(payload: TwinMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinMutationResponse:
    _require_access(identity, tenant)
    result = twin_ai_service.rebalance(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "twin_resources_rebalanced", payload.reason or "Swarm resources rebalanced", 45)
    return TwinMutationResponse(ok=True, message="Swarm resources rebalanced", data=result)


@router.get("/campus", response_model=TwinResponse)
def get_campus(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "campus", lambda: twin_ai_service.campus(_scope(identity, tenant)), 10))


@router.get("/network", response_model=TwinResponse)
def get_network(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "network", lambda: twin_ai_service.network(_scope(identity, tenant)), 10))


@router.post("/compare", response_model=TwinMutationResponse)
def compare_strategies(request: Request, payload: TwinMutationRequest | None = Body(default=None), tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinMutationResponse:
    _require_access(identity, tenant)
    payload_data = payload.model_dump(exclude_none=True) if payload else {}
    result = twin_ai_service.compare(_scope(identity, tenant), payload_data)
    _clear(identity)
    _log(request, identity, tenant, "twin_executive_decision_compared", payload.reason if payload and payload.reason else "Executive twin strategies compared", 52)
    return TwinMutationResponse(ok=True, message="Executive strategies compared", data=result)


@router.get("/replay/intelligence", response_model=TwinResponse)
def get_replay_intelligence(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TwinResponse:
    _require_access(identity, tenant)
    return TwinResponse(data=_cache(identity, "replay_intelligence", lambda: twin_ai_service.replay_intelligence(_scope(identity, tenant)), 12))

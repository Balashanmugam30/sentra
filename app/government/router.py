from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.government.schemas import GovernmentLiveResponse, GovernmentMutationRequest, GovernmentMutationResponse, GovernmentResponse
from app.government.service import government_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/government", tags=["Government Command OS"])

GOVERNMENT_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
GOVERNMENT_ORG_ROLES = {"owner", "org_admin", "executive", "ops_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in GOVERNMENT_APP_ROLES or str(tenant.get("org_role") or "") in GOVERNMENT_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Government command access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _cache_key(identity: dict[str, object], key: str) -> str:
    return identity_tenant_cache_key(identity, f"government:{key}")


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "government:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="government",
        action=action,
        severity="medium",
        target_module="government",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=41,
    )


@router.get("/live", response_model=GovernmentLiveResponse)
def get_government_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentLiveResponse:
    _require_access(identity, tenant)
    return GovernmentLiveResponse(**cached_call(_cache_key(identity, "live"), 8, lambda: government_store.live(_scope(identity, tenant))))


def _response(name: str, builder, tenant: dict[str, object], identity: dict[str, object], ttl: int = 14) -> GovernmentResponse:
    _require_access(identity, tenant)
    return GovernmentResponse(data=cached_call(_cache_key(identity, name), ttl, lambda: builder(_scope(identity, tenant))))


@router.get("/readiness", response_model=GovernmentResponse)
def get_readiness(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentResponse:
    return _response("readiness", government_store.readiness, tenant, identity)


@router.get("/disaster", response_model=GovernmentResponse)
def get_disaster(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentResponse:
    return _response("disaster", government_store.disaster, tenant, identity)


@router.get("/defense", response_model=GovernmentResponse)
def get_defense(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentResponse:
    return _response("defense", government_store.defense, tenant, identity)


@router.get("/borders", response_model=GovernmentResponse)
def get_borders(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentResponse:
    return _response("borders", government_store.borders, tenant, identity)


@router.get("/infrastructure", response_model=GovernmentResponse)
def get_infrastructure(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentResponse:
    return _response("infrastructure", government_store.infrastructure, tenant, identity)


@router.get("/continuity", response_model=GovernmentResponse)
def get_continuity(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentResponse:
    return _response("continuity", government_store.continuity, tenant, identity)


@router.get("/wargame", response_model=GovernmentResponse)
def get_wargame(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentResponse:
    return _response("wargame", government_store.wargame, tenant, identity)


@router.get("/copilot", response_model=GovernmentResponse)
def get_copilot(request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentResponse:
    response = _response("copilot", government_store.copilot, tenant, identity)
    _log(request, identity, tenant, "copilot_generated", "Sovereign AI copilot opened")
    return response


@router.post("/run-simulation", response_model=GovernmentMutationResponse)
def post_run_simulation(payload: GovernmentMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentMutationResponse:
    _require_access(identity, tenant)
    result = government_store.action(_scope(identity, tenant), "simulation_run", payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "simulation_run", "Government disaster simulation run", str(result["action_id"]))
    _log(request, identity, tenant, "war_game_executed", "War game executed", str(result["action_id"]))
    return GovernmentMutationResponse(ok=True, message="Simulation completed", data=result)


@router.post("/activate-emergency", response_model=GovernmentMutationResponse)
def post_activate_emergency(payload: GovernmentMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentMutationResponse:
    _require_access(identity, tenant)
    result = government_store.action(_scope(identity, tenant), "emergency_activated", payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "emergency_activated", "Government emergency activated", str(result["action_id"]))
    return GovernmentMutationResponse(ok=True, message="Emergency command activated", data=result)


@router.post("/deploy-units", response_model=GovernmentMutationResponse)
def post_deploy_units(payload: GovernmentMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentMutationResponse:
    _require_access(identity, tenant)
    result = government_store.action(_scope(identity, tenant), "unit_deployed", payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "unit_deployed", "Multi-agency units deployed", str(result["action_id"]))
    return GovernmentMutationResponse(ok=True, message="Units deployed", data=result)


@router.post("/generate-report", response_model=GovernmentMutationResponse)
def post_generate_report(payload: GovernmentMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GovernmentMutationResponse:
    _require_access(identity, tenant)
    result = government_store.action(_scope(identity, tenant), "report_exported", payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "report_exported", "Government readiness report exported", str(result["action_id"]))
    _log(request, identity, tenant, "readiness_reviewed", "National readiness reviewed", str(result["action_id"]))
    return GovernmentMutationResponse(ok=True, message="Government report generated", data=result)

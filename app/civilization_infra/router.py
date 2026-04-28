from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.civilization_infra.schemas import CivilizationLiveResponse, CivilizationMutationRequest, CivilizationMutationResponse, CivilizationResponse
from app.civilization_infra.service import civilization_infra_store, tenant_scope
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/civilization", tags=["Civilization Infrastructure"])

CIVILIZATION_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
CIVILIZATION_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "ops_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in CIVILIZATION_APP_ROLES or str(tenant.get("org_role") or "") in CIVILIZATION_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Civilization Infrastructure access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _tenant_id(tenant: dict[str, object]) -> str:
    return str(tenant["tenant_id"])


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "civilization:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="civilization_infra",
        action=action,
        severity="medium",
        target_module="civilization_infra",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=_tenant_id(tenant),
        risk_score=36,
    )


def _response(name: str, ttl: int, builder, tenant: dict[str, object], identity: dict[str, object]) -> CivilizationResponse:
    _require_access(identity, tenant)
    data = cached_call(identity_tenant_cache_key(identity, f"civilization:{name}"), ttl, lambda: builder(_scope(identity, tenant)))
    return CivilizationResponse(generated_at=civilization_infra_store.live(_scope(identity, tenant))["generated_at"], data=data)


@router.get("/live", response_model=CivilizationLiveResponse)
def get_civilization_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationLiveResponse:
    _require_access(identity, tenant)
    return CivilizationLiveResponse(**cached_call(identity_tenant_cache_key(identity, "civilization:live"), 10, lambda: civilization_infra_store.live(_scope(identity, tenant))))


@router.get("/grid", response_model=CivilizationResponse)
def get_grid(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationResponse:
    return _response("grid", 20, civilization_infra_store.grid, tenant, identity)


@router.get("/cities", response_model=CivilizationResponse)
def get_cities(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationResponse:
    return _response("cities", 20, civilization_infra_store.cities, tenant, identity)


@router.get("/utilities", response_model=CivilizationResponse)
def get_utilities(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationResponse:
    return _response("utilities", 20, civilization_infra_store.utilities, tenant, identity)


@router.get("/transport", response_model=CivilizationResponse)
def get_transport(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationResponse:
    return _response("transport", 20, civilization_infra_store.transport, tenant, identity)


@router.get("/healthcare", response_model=CivilizationResponse)
def get_healthcare(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationResponse:
    return _response("healthcare", 20, civilization_infra_store.healthcare, tenant, identity)


@router.get("/disasters", response_model=CivilizationResponse)
def get_disasters(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationResponse:
    return _response("disasters", 20, civilization_infra_store.disasters, tenant, identity)


@router.get("/score", response_model=CivilizationResponse)
def get_score(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationResponse:
    return _response("score", 20, civilization_infra_store.score, tenant, identity)


@router.post("/run-continuity-sim", response_model=CivilizationMutationResponse)
def post_continuity_sim(payload: CivilizationMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationMutationResponse:
    _require_access(identity, tenant)
    result = civilization_infra_store.run_continuity_sim(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "continuity_sim_executed", "Continuity simulation executed", str(result["simulation_id"]))
    return CivilizationMutationResponse(ok=True, message="Continuity simulation complete", data=result)


@router.post("/run-disaster-model", response_model=CivilizationMutationResponse)
def post_disaster_model(payload: CivilizationMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationMutationResponse:
    _require_access(identity, tenant)
    result = civilization_infra_store.run_disaster_model(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "disaster_model_run", "Disaster model run", str(result["model_id"]))
    return CivilizationMutationResponse(ok=True, message="Disaster model complete", data=result)


@router.post("/generate-national-brief", response_model=CivilizationMutationResponse)
def post_national_brief(payload: CivilizationMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CivilizationMutationResponse:
    _require_access(identity, tenant)
    result = civilization_infra_store.generate_national_brief(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "national_brief_generated", "National brief generated", str(result["brief_id"]))
    return CivilizationMutationResponse(ok=True, message="National brief generated", data=result)

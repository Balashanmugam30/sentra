"""Omega OS API router."""

from __future__ import annotations

from typing import Callable

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.omega.models import utc_now
from app.omega.schemas import OmegaLiveResponse, OmegaMutationRequest, OmegaMutationResponse, OmegaResponse
from app.omega.service import omega_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/omega", tags=["Omega OS"])

OMEGA_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
OMEGA_ORG_ROLES = {"owner", "org_admin", "executive", "ops_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in OMEGA_APP_ROLES or str(tenant.get("org_role") or "") in OMEGA_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Omega OS access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _tenant_id(identity: dict[str, object], tenant: dict[str, object]) -> str:
    scope = _scope(identity, tenant)
    return scope[0] if scope else str(tenant["tenant_id"])


def _is_super_admin(identity: dict[str, object]) -> bool:
    return str(identity.get("role")) == "super_admin"


def _cache_key(identity: dict[str, object], key: str) -> str:
    return identity_tenant_cache_key(identity, f"omega:{key}")


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "omega:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="omega",
        action=action,
        severity="medium",
        target_module="omega",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=42,
    )


def _response(
    name: str,
    builder: Callable[[str, bool], dict[str, object]],
    tenant: dict[str, object],
    identity: dict[str, object],
    ttl: int = 12,
) -> OmegaResponse:
    _require_access(identity, tenant)
    tenant_id = _tenant_id(identity, tenant)
    data = cached_call(_cache_key(identity, name), ttl, lambda: builder(tenant_id, _is_super_admin(identity)))
    return OmegaResponse(generated_at=utc_now(), data=data)


@router.get("/live", response_model=OmegaLiveResponse)
def get_omega_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaLiveResponse:
    _require_access(identity, tenant)
    tenant_id = _tenant_id(identity, tenant)
    payload = cached_call(_cache_key(identity, "live"), 8, lambda: omega_store.live(tenant_id, _is_super_admin(identity)))
    return OmegaLiveResponse(**payload)


@router.get("/planetary", response_model=OmegaResponse)
def get_planetary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("planetary", omega_store.planetary, tenant, identity)


@router.get("/threats", response_model=OmegaResponse)
def get_threats(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("threats", omega_store.threats, tenant, identity)


@router.get("/climate", response_model=OmegaResponse)
def get_climate(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("climate", omega_store.climate, tenant, identity)


@router.get("/pandemic", response_model=OmegaResponse)
def get_pandemic(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("pandemic", omega_store.pandemic, tenant, identity)


@router.get("/economy", response_model=OmegaResponse)
def get_economy(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("economy", omega_store.economy, tenant, identity)


@router.get("/logistics", response_model=OmegaResponse)
def get_logistics(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("logistics", omega_store.logistics, tenant, identity)


@router.get("/energy", response_model=OmegaResponse)
def get_energy(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("energy", omega_store.energy, tenant, identity)


@router.get("/water", response_model=OmegaResponse)
def get_water(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("water", omega_store.water, tenant, identity)


@router.get("/migration", response_model=OmegaResponse)
def get_migration(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("migration", omega_store.migration, tenant, identity)


@router.get("/future", response_model=OmegaResponse)
def get_future(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("future", omega_store.future, tenant, identity)


@router.get("/civilization", response_model=OmegaResponse)
def get_civilization(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("civilization", omega_store.civilization, tenant, identity)


@router.get("/satellite", response_model=OmegaResponse)
def get_satellite(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("satellite", omega_store.satellite, tenant, identity)


@router.get("/ai/live", response_model=OmegaResponse)
def get_ai_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("ai-live", omega_store.ai_live, tenant, identity)


@router.get("/ai/objectives", response_model=OmegaResponse)
def get_ai_objectives(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("ai-objectives", omega_store.objectives, tenant, identity)


@router.get("/ai/memory", response_model=OmegaResponse)
def get_ai_memory(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("ai-memory", omega_store.memory, tenant, identity, 18)


@router.get("/ai/trust", response_model=OmegaResponse)
def get_ai_trust(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("ai-trust", omega_store.trust, tenant, identity)


@router.get("/ai/explain", response_model=OmegaResponse)
def get_ai_explain(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("ai-explain", omega_store.explain, tenant, identity, 18)


@router.get("/ai/evolution", response_model=OmegaResponse)
def get_ai_evolution(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("ai-evolution", omega_store.evolution, tenant, identity)


@router.get("/ai/governance", response_model=OmegaResponse)
def get_ai_governance(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaResponse:
    return _response("ai-governance", omega_store.governance, tenant, identity)


@router.post("/run-simulation", response_model=OmegaMutationResponse)
def run_simulation(payload: OmegaMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaMutationResponse:
    _require_access(identity, tenant)
    event, data = omega_store.run_simulation(_tenant_id(identity, tenant), payload.actor or str(identity.get("email", "operator")), payload.scenario, _is_super_admin(identity))
    _clear(identity)
    _log(request, identity, tenant, "omega_simulation_run", event.summary, event.event_id)
    return OmegaMutationResponse(ok=True, message="Omega simulation complete", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/run-improvement-cycle", response_model=OmegaMutationResponse)
def run_improvement_cycle(payload: OmegaMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaMutationResponse:
    _require_access(identity, tenant)
    event, data = omega_store.run_improvement_cycle(_tenant_id(identity, tenant), payload.actor or str(identity.get("email", "operator")), _is_super_admin(identity))
    _clear(identity)
    _log(request, identity, tenant, "omega_improvement_cycle_run", event.summary, event.event_id)
    return OmegaMutationResponse(ok=True, message="Recursive improvement cycle complete", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/run-self-heal", response_model=OmegaMutationResponse)
def run_self_heal_endpoint(payload: OmegaMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaMutationResponse:
    _require_access(identity, tenant)
    event, data = omega_store.run_self_heal(_tenant_id(identity, tenant), payload.actor or str(identity.get("email", "operator")), _is_super_admin(identity))
    _clear(identity)
    _log(request, identity, tenant, "omega_self_heal_run", event.summary, event.event_id)
    return OmegaMutationResponse(ok=True, message="Omega self-heal complete", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/set-objective", response_model=OmegaMutationResponse)
def set_objective(payload: OmegaMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaMutationResponse:
    _require_access(identity, tenant)
    if not payload.objective:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="objective is required")
    event, data = omega_store.set_objective(_tenant_id(identity, tenant), payload.actor or str(identity.get("email", "operator")), payload.objective, payload.reason, _is_super_admin(identity))
    _clear(identity)
    _log(request, identity, tenant, "omega_objective_changed", event.summary, event.event_id)
    return OmegaMutationResponse(ok=True, message="Omega objective updated", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/change-mode", response_model=OmegaMutationResponse)
def change_mode(payload: OmegaMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaMutationResponse:
    _require_access(identity, tenant)
    if not payload.mode:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="mode is required")
    event, data = omega_store.change_mode(_tenant_id(identity, tenant), payload.actor or str(identity.get("email", "operator")), payload.mode, payload.reason, _is_super_admin(identity))
    _clear(identity)
    _log(request, identity, tenant, "omega_mode_changed", event.summary, event.event_id)
    return OmegaMutationResponse(ok=True, message="Omega mode updated", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/run-planetary-demo", response_model=OmegaMutationResponse)
def run_planetary_demo(payload: OmegaMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> OmegaMutationResponse:
    _require_access(identity, tenant)
    event, data = omega_store.run_planetary_demo(_tenant_id(identity, tenant), payload.actor or str(identity.get("email", "operator")), _is_super_admin(identity))
    _clear(identity)
    _log(request, identity, tenant, "omega_planetary_demo_run", event.summary, event.event_id)
    return OmegaMutationResponse(ok=True, message="Omega planetary demo launched", generated_at=utc_now(), event=event.as_dict(), data=data)

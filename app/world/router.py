"""World Command Grid API router."""

from __future__ import annotations

from typing import Callable

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key
from app.world.models import utc_now
from app.world.schemas import WorldLiveResponse, WorldMutationRequest, WorldMutationResponse, WorldResponse
from app.world.service import tenant_scope, world_store

router = APIRouter(prefix="/world", tags=["Global Sentience Engine"])

WORLD_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
WORLD_ORG_ROLES = {"owner", "org_admin", "executive", "ops_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in WORLD_APP_ROLES or str(tenant.get("org_role") or "") in WORLD_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="World command access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _tenant_id(identity: dict[str, object], tenant: dict[str, object]) -> str:
    scope = _scope(identity, tenant)
    return scope[0] if scope else str(tenant["tenant_id"])


def _is_super_admin(identity: dict[str, object]) -> bool:
    return str(identity.get("role")) == "super_admin"


def _cache_key(identity: dict[str, object], key: str) -> str:
    return identity_tenant_cache_key(identity, f"world:{key}")


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "world:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="world",
        action=action,
        severity="medium",
        target_module="world",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=38,
    )


def _response(
    name: str,
    builder: Callable[[str, bool], dict[str, object]],
    tenant: dict[str, object],
    identity: dict[str, object],
    ttl: int = 14,
) -> WorldResponse:
    _require_access(identity, tenant)
    tenant_id = _tenant_id(identity, tenant)
    data = cached_call(_cache_key(identity, name), ttl, lambda: builder(tenant_id, _is_super_admin(identity)))
    return WorldResponse(generated_at=utc_now(), data=data)


@router.get("/live", response_model=WorldLiveResponse)
def get_world_live(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldLiveResponse:
    _require_access(identity, tenant)
    tenant_id = _tenant_id(identity, tenant)
    payload = cached_call(_cache_key(identity, "live"), 8, lambda: world_store.live(tenant_id, _is_super_admin(identity)))
    return WorldLiveResponse(**payload)


@router.get("/threats", response_model=WorldResponse)
def get_world_threats(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("threats", world_store.threats, tenant, identity)


@router.get("/countries", response_model=WorldResponse)
def get_world_countries(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("countries", world_store.countries, tenant, identity, 30)


@router.get("/economy", response_model=WorldResponse)
def get_world_economy(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("economy", world_store.economy, tenant, identity)


@router.get("/supply-chain", response_model=WorldResponse)
def get_world_supply_chain(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("supply-chain", world_store.supply_chain, tenant, identity)


@router.get("/climate", response_model=WorldResponse)
def get_world_climate(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("climate", world_store.climate, tenant, identity)


@router.get("/pandemic", response_model=WorldResponse)
def get_world_pandemic(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("pandemic", world_store.pandemic, tenant, identity)


@router.get("/space", response_model=WorldResponse)
def get_world_space(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("space", world_store.space, tenant, identity)


@router.get("/diplomacy", response_model=WorldResponse)
def get_world_diplomacy(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("diplomacy", world_store.diplomacy, tenant, identity)


@router.get("/continuity", response_model=WorldResponse)
def get_world_continuity(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("continuity", world_store.continuity, tenant, identity)


@router.get("/supremacy", response_model=WorldResponse)
def get_world_supremacy(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldResponse:
    return _response("supremacy", world_store.supremacy, tenant, identity)


@router.post("/run-global-simulation", response_model=WorldMutationResponse)
def run_global_simulation(
    payload: WorldMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldMutationResponse:
    _require_access(identity, tenant)
    event, data = world_store.run_global_simulation(
        _tenant_id(identity, tenant),
        payload.actor or str(identity.get("email", "operator")),
        payload.scenario,
        _is_super_admin(identity),
    )
    _clear(identity)
    _log(request, identity, tenant, "world_simulation_run", event.summary, event.event_id)
    return WorldMutationResponse(ok=True, message="Global simulation completed", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/run-demo", response_model=WorldMutationResponse)
def run_world_demo(
    payload: WorldMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldMutationResponse:
    _require_access(identity, tenant)
    event, data = world_store.run_demo(
        _tenant_id(identity, tenant),
        payload.actor or str(identity.get("email", "operator")),
        _is_super_admin(identity),
    )
    _clear(identity)
    _log(request, identity, tenant, "global_demo_started", event.summary, event.event_id)
    return WorldMutationResponse(ok=True, message="Prestige demo started", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/reset", response_model=WorldMutationResponse)
def reset_world_grid(
    payload: WorldMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WorldMutationResponse:
    _require_access(identity, tenant)
    event, data = world_store.reset(
        _tenant_id(identity, tenant),
        payload.actor or str(identity.get("email", "operator")),
        _is_super_admin(identity),
    )
    _clear(identity)
    _log(request, identity, tenant, "world_grid_reset", event.summary, event.event_id)
    return WorldMutationResponse(ok=True, message="World grid reset", generated_at=utc_now(), event=event.as_dict(), data=data)

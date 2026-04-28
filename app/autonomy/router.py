"""Autonomy OS API router."""

from __future__ import annotations

from typing import Callable

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.autonomy.models import utc_now
from app.autonomy.schemas import AutonomyLiveResponse, AutonomyMutationRequest, AutonomyMutationResponse, AutonomyResponse
from app.autonomy.service import autonomy_store, tenant_scope
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/autonomy", tags=["Autonomy OS"])

AUTONOMY_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
AUTONOMY_ORG_ROLES = {"owner", "org_admin", "executive", "ops_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in AUTONOMY_APP_ROLES or str(tenant.get("org_role") or "") in AUTONOMY_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Autonomy OS access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _tenant_id(identity: dict[str, object], tenant: dict[str, object]) -> str:
    scope = _scope(identity, tenant)
    return scope[0] if scope else str(tenant["tenant_id"])


def _is_super_admin(identity: dict[str, object]) -> bool:
    return str(identity.get("role")) == "super_admin"


def _cache_key(identity: dict[str, object], key: str) -> str:
    return identity_tenant_cache_key(identity, f"autonomy:{key}")


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "autonomy:"))


def _log(
    request: Request,
    identity: dict[str, object],
    tenant: dict[str, object],
    action: str,
    reason: str,
    target_id: str | None = None,
) -> None:
    append_audit_event(
        category="autonomy",
        action=action,
        severity="medium",
        target_module="autonomy",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=34,
    )


def _response(
    name: str,
    builder: Callable[[str, bool], dict[str, object]],
    tenant: dict[str, object],
    identity: dict[str, object],
    ttl: int = 10,
) -> AutonomyResponse:
    _require_access(identity, tenant)
    tenant_id = _tenant_id(identity, tenant)
    data = cached_call(_cache_key(identity, name), ttl, lambda: builder(tenant_id, _is_super_admin(identity)))
    return AutonomyResponse(generated_at=utc_now(), data=data)


@router.get("/live", response_model=AutonomyLiveResponse)
def get_autonomy_live(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyLiveResponse:
    _require_access(identity, tenant)
    tenant_id = _tenant_id(identity, tenant)
    payload = cached_call(
        _cache_key(identity, "live"),
        6,
        lambda: autonomy_store.live(tenant_id, _is_super_admin(identity)),
    )
    return AutonomyLiveResponse(**payload)


@router.get("/memory", response_model=AutonomyResponse)
def get_autonomy_memory(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("memory", autonomy_store.memory, tenant, identity, 18)


@router.get("/objectives", response_model=AutonomyResponse)
def get_autonomy_objectives(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("objectives", autonomy_store.objectives, tenant, identity, 12)


@router.get("/plan", response_model=AutonomyResponse)
def get_autonomy_plan(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("plan", autonomy_store.plan, tenant, identity)


@router.get("/predict", response_model=AutonomyResponse)
def get_autonomy_predict(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("predict", autonomy_store.predict, tenant, identity)


@router.get("/learning", response_model=AutonomyResponse)
def get_autonomy_learning(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("learning", autonomy_store.learning, tenant, identity, 14)


@router.get("/trust", response_model=AutonomyResponse)
def get_autonomy_trust(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("trust", autonomy_store.trust, tenant, identity, 14)


@router.get("/health", response_model=AutonomyResponse)
def get_autonomy_health(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("health", autonomy_store.health, tenant, identity, 8)


@router.get("/governance", response_model=AutonomyResponse)
def get_autonomy_governance(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("governance", autonomy_store.governance, tenant, identity, 14)


@router.get("/explain", response_model=AutonomyResponse)
def get_autonomy_explain(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("explain", autonomy_store.explain, tenant, identity, 18)


@router.get("/branches", response_model=AutonomyResponse)
def get_autonomy_branches(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyResponse:
    return _response("branches", autonomy_store.branches, tenant, identity, 16)


@router.post("/set-objective", response_model=AutonomyMutationResponse)
def set_autonomy_objective(
    payload: AutonomyMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyMutationResponse:
    _require_access(identity, tenant)
    if not payload.objective:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="objective is required")
    event, data = autonomy_store.set_objective(
        _tenant_id(identity, tenant),
        payload.objective,
        payload.actor or str(identity.get("email", "operator")),
        payload.reason,
        _is_super_admin(identity),
    )
    _clear(identity)
    _log(request, identity, tenant, "objective_set", event.summary, event.event_id)
    return AutonomyMutationResponse(status="objective_updated", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/run-learning-cycle", response_model=AutonomyMutationResponse)
def run_learning_cycle_endpoint(
    payload: AutonomyMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyMutationResponse:
    _require_access(identity, tenant)
    event, data = autonomy_store.run_learning(
        _tenant_id(identity, tenant),
        payload.actor or str(identity.get("email", "operator")),
        _is_super_admin(identity),
    )
    _clear(identity)
    _log(request, identity, tenant, "learning_cycle_run", event.summary, event.event_id)
    return AutonomyMutationResponse(status="learning_cycle_complete", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/run-heal", response_model=AutonomyMutationResponse)
def run_heal_endpoint(
    payload: AutonomyMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyMutationResponse:
    _require_access(identity, tenant)
    event, data = autonomy_store.run_heal(
        _tenant_id(identity, tenant),
        payload.actor or str(identity.get("email", "operator")),
        _is_super_admin(identity),
    )
    _clear(identity)
    _log(request, identity, tenant, "self_heal_run", event.summary, event.event_id)
    return AutonomyMutationResponse(status="self_heal_complete", generated_at=utc_now(), event=event.as_dict(), data=data)


@router.post("/set-mode", response_model=AutonomyMutationResponse)
def set_autonomy_mode(
    payload: AutonomyMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomyMutationResponse:
    _require_access(identity, tenant)
    if not payload.mode:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="mode is required")
    event, data = autonomy_store.set_mode(
        _tenant_id(identity, tenant),
        payload.mode,
        payload.actor or str(identity.get("email", "operator")),
        payload.reason,
        _is_super_admin(identity),
    )
    _clear(identity)
    _log(request, identity, tenant, "autonomy_mode_set", event.summary, event.event_id)
    return AutonomyMutationResponse(status="mode_updated", generated_at=utc_now(), event=event.as_dict(), data=data)

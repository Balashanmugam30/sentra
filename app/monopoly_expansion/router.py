from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.monopoly_expansion.schemas import MonopolyLiveResponse, MonopolyMutationRequest, MonopolyMutationResponse, MonopolyResponse
from app.monopoly_expansion.service import monopoly_expansion_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/monopoly", tags=["Monopoly Expansion"])

MONOPOLY_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
MONOPOLY_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "ops_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in MONOPOLY_APP_ROLES or str(tenant.get("org_role") or "") in MONOPOLY_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Monopoly Expansion access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _tenant_id(tenant: dict[str, object]) -> str:
    return str(tenant["tenant_id"])


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "monopoly:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="monopoly_expansion",
        action=action,
        severity="medium",
        target_module="monopoly_expansion",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=_tenant_id(tenant),
        risk_score=34,
    )


def _response(name: str, ttl: int, builder, tenant: dict[str, object], identity: dict[str, object]) -> MonopolyResponse:
    _require_access(identity, tenant)
    data = cached_call(identity_tenant_cache_key(identity, f"monopoly:{name}"), ttl, lambda: builder(_scope(identity, tenant)))
    return MonopolyResponse(generated_at=monopoly_expansion_store.live(_scope(identity, tenant))["generated_at"], data=data)


@router.get("/live", response_model=MonopolyLiveResponse)
def get_monopoly_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyLiveResponse:
    _require_access(identity, tenant)
    return MonopolyLiveResponse(**cached_call(identity_tenant_cache_key(identity, "monopoly:live"), 10, lambda: monopoly_expansion_store.live(_scope(identity, tenant))))


@router.get("/acquisitions", response_model=MonopolyResponse)
def get_acquisitions(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyResponse:
    return _response("acquisitions", 20, monopoly_expansion_store.acquisitions, tenant, identity)


@router.get("/partnerships", response_model=MonopolyResponse)
def get_partnerships(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyResponse:
    return _response("partnerships", 20, monopoly_expansion_store.partnerships, tenant, identity)


@router.get("/conquest", response_model=MonopolyResponse)
def get_conquest(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyResponse:
    return _response("conquest", 20, monopoly_expansion_store.conquest, tenant, identity)


@router.get("/lockin", response_model=MonopolyResponse)
def get_lockin(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyResponse:
    return _response("lockin", 20, monopoly_expansion_store.lockin, tenant, identity)


@router.get("/network", response_model=MonopolyResponse)
def get_network(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyResponse:
    return _response("network", 20, monopoly_expansion_store.network, tenant, identity)


@router.get("/regulatory", response_model=MonopolyResponse)
def get_regulatory(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyResponse:
    return _response("regulatory", 20, monopoly_expansion_store.regulatory, tenant, identity)


@router.get("/score", response_model=MonopolyResponse)
def get_score(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyResponse:
    return _response("score", 20, monopoly_expansion_store.score, tenant, identity)


@router.post("/run-acquisition-model", response_model=MonopolyMutationResponse)
def post_acquisition_model(payload: MonopolyMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyMutationResponse:
    _require_access(identity, tenant)
    result = monopoly_expansion_store.run_acquisition_model(_tenant_id(tenant), payload.target)
    _clear(identity)
    _log(request, identity, tenant, "acquisition_model_run", "Acquisition model run", str(result["model_id"]))
    return MonopolyMutationResponse(ok=True, message="Acquisition model complete", data=result)


@router.post("/launch-bundle", response_model=MonopolyMutationResponse)
def post_launch_bundle(payload: MonopolyMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyMutationResponse:
    _require_access(identity, tenant)
    result = monopoly_expansion_store.launch_bundle(_tenant_id(tenant), payload.bundle)
    _clear(identity)
    _log(request, identity, tenant, "bundle_launched", "Expansion bundle launched", str(result["bundle_id"]))
    return MonopolyMutationResponse(ok=True, message="Bundle launched", data=result)


@router.post("/run-expansion-sim", response_model=MonopolyMutationResponse)
def post_expansion_sim(payload: MonopolyMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyMutationResponse:
    _require_access(identity, tenant)
    result = monopoly_expansion_store.run_expansion_sim(_tenant_id(tenant), payload.scenario)
    _clear(identity)
    _log(request, identity, tenant, "expansion_simulation_executed", "Expansion simulation executed", str(result["simulation_id"]))
    return MonopolyMutationResponse(ok=True, message="Expansion simulation complete", data=result)


@router.post("/generate-board-strategy", response_model=MonopolyMutationResponse)
def post_board_strategy(payload: MonopolyMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MonopolyMutationResponse:
    _require_access(identity, tenant)
    result = monopoly_expansion_store.generate_board_strategy(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "board_strategy_generated", "Board expansion strategy generated", str(result["strategy_id"]))
    return MonopolyMutationResponse(ok=True, message="Board strategy generated", data=result)

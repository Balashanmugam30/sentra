from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.execution.schemas import ExecutionLiveResponse, ExecutionMutationRequest, ExecutionMutationResponse, ExecutionResponse
from app.execution.service import execution_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/execution", tags=["Enterprise Execution OS"])

EXECUTION_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander"}
EXECUTION_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "ops_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in EXECUTION_APP_ROLES or str(tenant.get("org_role") or "") in EXECUTION_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enterprise execution access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _cache_key(identity: dict[str, object], key: str) -> str:
    return identity_tenant_cache_key(identity, f"execution:{key}")


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "execution:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="execution",
        action=action,
        severity="medium",
        target_module="execution",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=36,
    )


@router.get("/live", response_model=ExecutionLiveResponse)
def get_execution_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionLiveResponse:
    _require_access(identity, tenant)
    return ExecutionLiveResponse(**cached_call(_cache_key(identity, "live"), 8, lambda: execution_store.live(_scope(identity, tenant))))


def _response(name: str, builder, tenant: dict[str, object], identity: dict[str, object], ttl: int = 12) -> ExecutionResponse:
    _require_access(identity, tenant)
    return ExecutionResponse(data=cached_call(_cache_key(identity, name), ttl, lambda: builder(_scope(identity, tenant))))


@router.get("/ceo", response_model=ExecutionResponse)
def get_ceo(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("ceo", execution_store.ceo, tenant, identity)


@router.get("/coo", response_model=ExecutionResponse)
def get_coo(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("coo", execution_store.coo, tenant, identity)


@router.get("/cfo", response_model=ExecutionResponse)
def get_cfo(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("cfo", execution_store.cfo, tenant, identity)


@router.get("/cro", response_model=ExecutionResponse)
def get_cro(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("cro", execution_store.cro, tenant, identity)


@router.get("/chro", response_model=ExecutionResponse)
def get_chro(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("chro", execution_store.chro, tenant, identity)


@router.get("/ciso", response_model=ExecutionResponse)
def get_ciso(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("ciso", execution_store.ciso, tenant, identity)


@router.get("/council", response_model=ExecutionResponse)
def get_council(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("council", execution_store.council, tenant, identity)


@router.get("/board", response_model=ExecutionResponse)
def get_board(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("board", execution_store.board, tenant, identity)


@router.get("/scenarios", response_model=ExecutionResponse)
def get_scenarios(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("scenarios", execution_store.scenarios, tenant, identity, ttl=20)


@router.get("/productivity", response_model=ExecutionResponse)
def get_productivity(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("productivity", execution_store.productivity, tenant, identity)


@router.get("/workflows", response_model=ExecutionResponse)
def get_workflows(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("workflows", execution_store.workflows, tenant, identity)


@router.get("/simulate", response_model=ExecutionResponse)
def get_simulate(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("simulate", execution_store.scenarios, tenant, identity, ttl=20)


@router.get("/efficiency", response_model=ExecutionResponse)
def get_efficiency(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionResponse:
    return _response("efficiency", execution_store.efficiency, tenant, identity)


@router.post("/run-review", response_model=ExecutionMutationResponse)
def post_run_review(payload: ExecutionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionMutationResponse:
    _require_access(identity, tenant)
    result = execution_store.action(_scope(identity, tenant), "run_review", payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "executive_council_recommendation", "Executive review completed", str(result["action_id"]))
    return ExecutionMutationResponse(ok=True, message="CEO review completed", data=result)


@router.post("/growth-mode", response_model=ExecutionMutationResponse)
def post_growth_mode(payload: ExecutionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionMutationResponse:
    _require_access(identity, tenant)
    result = execution_store.action(_scope(identity, tenant), "growth_mode", payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "growth_mode_activated", "Aggressive growth mode activated", str(result["action_id"]))
    return ExecutionMutationResponse(ok=True, message="Growth mode activated", data=result)


@router.post("/cost-mode", response_model=ExecutionMutationResponse)
def post_cost_mode(payload: ExecutionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionMutationResponse:
    _require_access(identity, tenant)
    result = execution_store.action(_scope(identity, tenant), "cost_mode", payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "cost_mode_activated", "Cost defense mode activated", str(result["action_id"]))
    return ExecutionMutationResponse(ok=True, message="Cost mode activated", data=result)


@router.post("/raise-plan", response_model=ExecutionMutationResponse)
def post_raise_plan(payload: ExecutionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionMutationResponse:
    _require_access(identity, tenant)
    result = execution_store.action(_scope(identity, tenant), "raise_plan", payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "raise_planned", "Raise plan generated", str(result["action_id"]))
    return ExecutionMutationResponse(ok=True, message="Raise plan generated", data=result)


@router.post("/hire-plan", response_model=ExecutionMutationResponse)
def post_hire_plan(payload: ExecutionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionMutationResponse:
    _require_access(identity, tenant)
    result = execution_store.action(_scope(identity, tenant), "hire_plan", payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "budget_shifted", "Hiring plan modeled", str(result["action_id"]))
    return ExecutionMutationResponse(ok=True, message="Hiring plan modeled", data=result)


@router.post("/run-simulation", response_model=ExecutionMutationResponse)
def post_run_simulation(payload: ExecutionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExecutionMutationResponse:
    _require_access(identity, tenant)
    result = execution_store.simulate(_scope(identity, tenant), payload.scenario)
    stored = execution_store.action(_scope(identity, tenant), "simulation_run", {"scenario": payload.scenario})
    _clear(identity)
    _log(request, identity, tenant, "simulation_run", "Enterprise execution simulation run", str(stored["action_id"]))
    return ExecutionMutationResponse(ok=True, message="Simulation completed", data={"simulation": result, "event": stored})

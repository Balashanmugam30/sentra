from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.behavior.learning_service import learning_service
from app.behavior.schemas import LearningMetricResponse, LearningMutationRequest, LearningMutationResponse
from app.behavior.store import tenant_scope
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/behavior", tags=["Self-Learning Human Behavior Intelligence"])

LEARNING_APP_ROLES = {"super_admin", "admin", "security_manager", "security_lead", "operations_commander", "executive", "analyst", "responder"}
LEARNING_ORG_ROLES = {"owner", "org_admin", "operator", "executive"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in LEARNING_APP_ROLES or str(tenant.get("org_role") or "") in LEARNING_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Self-learning behavior intelligence access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "behavior:learning:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "behavior:council:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str) -> None:
    append_audit_event(
        category="behavior",
        action=action,
        severity="medium",
        target_module="behavior_learning",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=44,
    )


@router.get("/learning", response_model=LearningMetricResponse)
def get_learning(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LearningMetricResponse:
    _require_access(identity, tenant)
    return LearningMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:learning:center"), 10, lambda: learning_service.learning(_scope(identity, tenant))))


@router.get("/memory", response_model=LearningMetricResponse)
def get_memory(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LearningMetricResponse:
    _require_access(identity, tenant)
    return LearningMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:learning:memory"), 12, lambda: learning_service.memory(_scope(identity, tenant))))


@router.get("/council", response_model=LearningMetricResponse)
def get_council(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LearningMetricResponse:
    _require_access(identity, tenant)
    return LearningMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:council:room"), 10, lambda: learning_service.council(_scope(identity, tenant))))


@router.get("/agents", response_model=LearningMetricResponse)
def get_agents(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LearningMetricResponse:
    _require_access(identity, tenant)
    return LearningMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:council:agents"), 12, lambda: {"agents": learning_service.agents(_scope(identity, tenant))}))


@router.post("/learn", response_model=LearningMutationResponse)
def post_learn(payload: LearningMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LearningMutationResponse:
    _require_access(identity, tenant)
    result = learning_service.learn(_scope(identity, tenant), payload.scenario)
    _clear(identity)
    _log(request, identity, tenant, "behavior_learning_cycle_run", f"Human behavior learning cycle run: {payload.scenario or 'latest_human_outcome'}")
    return LearningMutationResponse(ok=True, message="Behavior learning cycle completed", data=result)


@router.post("/council/run", response_model=LearningMutationResponse)
def post_council_run(payload: LearningMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LearningMutationResponse:
    _require_access(identity, tenant)
    result = learning_service.run_council(_scope(identity, tenant), payload.scenario)
    _clear(identity)
    _log(request, identity, tenant, "behavior_council_run", f"Behavior AI council run: {payload.scenario or 'active_crisis'}")
    return LearningMutationResponse(ok=True, message="Behavior AI council completed", data=result)


@router.post("/policy/approve", response_model=LearningMutationResponse)
def post_policy_approve(payload: LearningMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LearningMutationResponse:
    _require_access(identity, tenant)
    result = learning_service.approve_policy(_scope(identity, tenant), payload.policy_id)
    _clear(identity)
    _log(request, identity, tenant, "behavior_policy_approved", f"Behavior policy approved: {payload.policy_id or 'POLICY-MSG-CLARITY-001'}")
    return LearningMutationResponse(ok=True, message="Behavior policy approved", data=result)


@router.post("/reset", response_model=LearningMutationResponse)
def post_learning_reset(request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LearningMutationResponse:
    _require_access(identity, tenant)
    result = learning_service.reset(_scope(identity, tenant))
    _clear(identity)
    _log(request, identity, tenant, "behavior_learning_reset", "Behavior learning transient events reset")
    return LearningMutationResponse(ok=True, message="Behavior learning transient events reset", data=result)

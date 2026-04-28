from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.aicouncil.schemas import AICouncilListResponse, AICouncilMetricResponse, AICouncilMutationRequest, AICouncilMutationResponse
from app.aicouncil.service import ai_council_service
from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ml.store import tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/aicouncil", tags=["AI Decision Council"])

AI_COUNCIL_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "analyst"}
AI_COUNCIL_ORG_ROLES = {"owner", "org_admin", "operator", "executive", "billing_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in AI_COUNCIL_APP_ROLES or str(tenant.get("org_role") or "") in AI_COUNCIL_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="AI decision council access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "aicouncil:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None, risk_score: int = 48) -> None:
    append_audit_event(
        category="aicouncil",
        action=action,
        severity="high" if risk_score >= 70 else "medium",
        target_module="aicouncil",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/summary", response_model=AICouncilMetricResponse)
def get_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> AICouncilMetricResponse:
    _require_access(identity, tenant)
    return AICouncilMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "aicouncil:summary"), 6, lambda: ai_council_service.summary(_scope(identity, tenant))))


@router.get("/agents", response_model=AICouncilListResponse)
def get_agents(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> AICouncilListResponse:
    _require_access(identity, tenant)
    return AICouncilListResponse(items=cached_call(identity_tenant_cache_key(identity, "aicouncil:agents"), 8, lambda: ai_council_service.agents(_scope(identity, tenant))))


@router.post("/debate", response_model=AICouncilMetricResponse)
def post_debate(payload: AICouncilMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> AICouncilMetricResponse:
    _require_access(identity, tenant)
    result = ai_council_service.debate(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "strategy_debate_executed", f"AI council debated {result['scenario']['scenario_id']} for {result['objective']}", str(result["scenario"]["scenario_id"]), int(result["consensus"]["consensus_score"]))
    return AICouncilMetricResponse(data=result)


@router.post("/objective", response_model=AICouncilMutationResponse)
def post_objective(payload: AICouncilMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> AICouncilMutationResponse:
    _require_access(identity, tenant)
    result = ai_council_service.set_objective(_scope(identity, tenant), payload.objective)
    _clear(identity)
    _log(request, identity, tenant, "objective_changed", f"Executive objective set to {result['state']['objective']}", str(result["state"]["objective"]), 54)
    return AICouncilMutationResponse(ok=True, message="Objective updated", data=result)


@router.get("/plan", response_model=AICouncilMetricResponse)
def get_plan(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> AICouncilMetricResponse:
    _require_access(identity, tenant)
    return AICouncilMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "aicouncil:plan"), 6, lambda: ai_council_service.plan(_scope(identity, tenant))))


@router.post("/approve", response_model=AICouncilMutationResponse)
def post_approve(payload: AICouncilMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> AICouncilMutationResponse:
    _require_access(identity, tenant)
    result = ai_council_service.approve(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "plan_approved", payload.reason or "AI council plan approved", payload.plan_id, 72)
    return AICouncilMutationResponse(ok=True, message="AI council plan approved", data=result)


@router.post("/override", response_model=AICouncilMutationResponse)
def post_override(payload: AICouncilMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> AICouncilMutationResponse:
    _require_access(identity, tenant)
    result = ai_council_service.override(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "human_override", payload.reason or "Human override applied to AI council", payload.action_id, 68)
    return AICouncilMutationResponse(ok=True, message="Human override recorded", data=result)


@router.get("/learning", response_model=AICouncilMetricResponse)
def get_learning(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> AICouncilMetricResponse:
    _require_access(identity, tenant)
    return AICouncilMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "aicouncil:learning"), 10, lambda: ai_council_service.learning(_scope(identity, tenant))))


@router.post("/retrain", response_model=AICouncilMutationResponse)
def post_retrain(payload: AICouncilMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> AICouncilMutationResponse:
    _require_access(identity, tenant)
    result = ai_council_service.retrain(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "strategic_weights_retrained", f"Council strategic weights retrained for {payload.domain or 'strategic weights'}", payload.domain, 52)
    return AICouncilMutationResponse(ok=True, message="Strategic weights retrain queued", data=result)


from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.behavior.decision_service import decision_service
from app.behavior.schemas import DecisionMetricResponse, DecisionMutationRequest, DecisionMutationResponse
from app.behavior.store import tenant_scope
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/behavior", tags=["Autonomous Human Response Decision Engine"])

DECISION_APP_ROLES = {"super_admin", "admin", "security_manager", "security_lead", "operations_commander", "executive", "analyst", "responder"}
DECISION_ORG_ROLES = {"owner", "org_admin", "operator", "executive"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in DECISION_APP_ROLES or str(tenant.get("org_role") or "") in DECISION_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Autonomous human response access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "behavior:decision:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "behavior:strategy:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str) -> None:
    append_audit_event(
        category="behavior",
        action=action,
        severity="medium",
        target_module="behavior_decision",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=48,
    )


@router.get("/decision", response_model=DecisionMetricResponse)
def get_decision(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DecisionMetricResponse:
    _require_access(identity, tenant)
    return DecisionMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:decision:live"), 8, lambda: decision_service.decision(_scope(identity, tenant))))


@router.get("/strategy", response_model=DecisionMetricResponse)
def get_strategy(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DecisionMetricResponse:
    _require_access(identity, tenant)
    return DecisionMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:strategy:compare"), 10, lambda: decision_service.strategies(_scope(identity, tenant))))


@router.get("/messages", response_model=DecisionMetricResponse)
def get_messages(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DecisionMetricResponse:
    _require_access(identity, tenant)
    return DecisionMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:decision:messages"), 10, lambda: decision_service.messages(_scope(identity, tenant))))


@router.get("/approval", response_model=DecisionMetricResponse)
def get_approval_queue(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DecisionMetricResponse:
    _require_access(identity, tenant)
    return DecisionMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "behavior:decision:approval"), 8, lambda: decision_service.approval(_scope(identity, tenant))))


@router.post("/approve", response_model=DecisionMutationResponse)
def post_approve(payload: DecisionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DecisionMutationResponse:
    _require_access(identity, tenant)
    result = decision_service.approve(_scope(identity, tenant), payload.approval_id)
    _clear(identity)
    _log(request, identity, tenant, "human_response_approved", f"Approved autonomous human response action: {payload.approval_id or 'default'}")
    return DecisionMutationResponse(ok=True, message="Autonomous human response action approved", data=result)


@router.post("/override", response_model=DecisionMutationResponse)
def post_override(payload: DecisionMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DecisionMutationResponse:
    _require_access(identity, tenant)
    result = decision_service.override(_scope(identity, tenant), payload.reason)
    _clear(identity)
    _log(request, identity, tenant, "human_response_override", f"Human response override recorded: {payload.reason or 'manual override'}")
    return DecisionMutationResponse(ok=True, message="Human response override recorded", data=result)

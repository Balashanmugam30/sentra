from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.audit.engine import append_audit_event
from app.ops.governance_service import (
    approve,
    build_governance_snapshot,
    delegate,
    escalate,
    get_analytics,
    get_approvals,
    get_automation_snapshot,
    reject,
    run_automation,
)
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ops", tags=["Automation Approval Governance"])


class ApprovalActionRequest(BaseModel):
    approval_id: str = Field(..., max_length=120)
    reason: str | None = Field(default=None, max_length=240)
    delegate_to: str | None = Field(default=None, max_length=120)


class AutomationRunRequest(BaseModel):
    action_id: str = Field(..., max_length=120)
    reason: str | None = Field(default=None, max_length=240)


@router.get("/governance")
def get_ops_governance_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return build_governance_snapshot()


@router.get("/approvals")
def get_ops_approvals_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_approvals()


@router.post("/approval/approve")
def post_ops_approval_approve_route(
    request: Request,
    payload: ApprovalActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = approve(payload.approval_id)
    append_audit_event(
        category="operations",
        action="governance_approval_approved",
        severity="medium",
        target_module="ops-governance",
        target_id=payload.approval_id,
        status="success",
        reason=payload.reason or "Governance approval granted",
        request=request,
        identity=identity,
        risk_score=44,
    )
    return result


@router.post("/approval/reject")
def post_ops_approval_reject_route(
    request: Request,
    payload: ApprovalActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = reject(payload.approval_id)
    append_audit_event(
        category="operations",
        action="governance_approval_rejected",
        severity="high",
        target_module="ops-governance",
        target_id=payload.approval_id,
        status="blocked",
        reason=payload.reason or "Governance approval rejected",
        request=request,
        identity=identity,
        risk_score=58,
    )
    return result


@router.post("/approval/delegate")
def post_ops_approval_delegate_route(
    request: Request,
    payload: ApprovalActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    delegate_to = payload.delegate_to or "Ops Alpha"
    result = delegate(payload.approval_id, delegate_to)
    append_audit_event(
        category="operations",
        action="governance_approval_delegated",
        severity="medium",
        target_module="ops-governance",
        target_id=payload.approval_id,
        status="success",
        reason=payload.reason or f"Approval delegated to {delegate_to}",
        request=request,
        identity=identity,
        risk_score=46,
    )
    return result


@router.post("/approval/escalate")
def post_ops_approval_escalate_route(
    request: Request,
    payload: ApprovalActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = escalate(payload.approval_id)
    append_audit_event(
        category="operations",
        action="governance_approval_escalated",
        severity="high",
        target_module="ops-governance",
        target_id=payload.approval_id,
        status="success",
        reason=payload.reason or "Approval escalated due SLA pressure",
        request=request,
        identity=identity,
        risk_score=72,
    )
    return result


@router.get("/automation")
def get_ops_automation_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_automation_snapshot()


@router.post("/automation/run")
def post_ops_automation_run_route(
    request: Request,
    payload: AutomationRunRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = run_automation(payload.action_id)
    append_audit_event(
        category="operations",
        action="governance_automation_run",
        severity="medium",
        target_module="ops-automation",
        target_id=payload.action_id,
        status="success",
        reason=payload.reason or "n8n-ready automation action executed",
        request=request,
        identity=identity,
        risk_score=50,
        is_demo=True,
    )
    return result


@router.get("/governance/analytics")
def get_ops_governance_analytics_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_analytics()

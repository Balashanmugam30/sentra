from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.governance.engine import (
    approve_governance_request,
    get_governance_audit_snapshot,
    get_governance_live_snapshot,
    override_governed_workflow,
    pause_governed_workflow,
    reassign_governance_request,
    reject_governance_request,
    resume_governed_workflow,
)
from app.governance.schemas import (
    ApproveGovernanceRequest,
    GovernanceActionResponse,
    GovernanceAuditResponse,
    GovernanceLiveResponse,
    OverrideWorkflowRequest,
    PauseWorkflowRequest,
    ReassignApprovalRequest,
    RejectGovernanceRequest,
    ResumeWorkflowRequest,
)
from app.rbac.guard import require_permission
from app.services.incident_service import get_all_incidents
from app.tenancy.context import identity_tenant_cache_key

router = APIRouter(prefix="/governance", tags=["Governance"])


@router.get("/live", response_model=GovernanceLiveResponse)
def get_governance_live_route(
    identity: dict[str, object] = Depends(require_permission("governance.approve")),
) -> GovernanceLiveResponse:
    def build() -> GovernanceLiveResponse:
        incidents = get_all_incidents()
        snapshot = get_governance_live_snapshot(incidents)
        return GovernanceLiveResponse(
            generated_at=datetime.now(timezone.utc),
            global_status=snapshot["global_status"],
            pending_approvals_count=snapshot["pending_approvals_count"],
            paused_workflows_count=snapshot["paused_workflows_count"],
            overrides_today=snapshot["overrides_today"],
            recent_requests=snapshot["recent_requests"],
            role_loads=snapshot["role_loads"],
        )

    return cached_call(identity_tenant_cache_key(identity, "governance:live"), 5, build)


@router.get("/audit", response_model=GovernanceAuditResponse)
def get_governance_audit_route(
    identity: dict[str, object] = Depends(require_permission("governance.approve")),
) -> GovernanceAuditResponse:
    def build() -> GovernanceAuditResponse:
        incidents = get_all_incidents()
        snapshot = get_governance_audit_snapshot(incidents)
        return GovernanceAuditResponse(
            generated_at=datetime.now(timezone.utc),
            audit_events=snapshot["audit_events"],
        )

    return cached_call(identity_tenant_cache_key(identity, "governance:audit"), 10, build)


@router.post("/approve", response_model=GovernanceActionResponse)
def post_governance_approve_route(
    request: Request,
    payload: ApproveGovernanceRequest,
    identity: dict[str, object] = Depends(require_permission("governance.approve")),
) -> GovernanceActionResponse:
    incidents = get_all_incidents()
    try:
        result = approve_governance_request(payload.approval_id, payload.actor, payload.notes, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("governance:")
    clear_runtime_cache("operations:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    append_audit_event(
        category="governance",
        action="approval_granted",
        severity="medium",
        target_module="governance",
        status="success",
        reason=payload.notes or "Governance approval granted",
        request=request,
        identity=identity,
        target_id=payload.approval_id,
        risk_score=38,
    )
    return GovernanceActionResponse(
        status=result["status"],
        approval=result["approval"],
        workflow=result["workflow"],
    )


@router.post("/reject", response_model=GovernanceActionResponse)
def post_governance_reject_route(
    request: Request,
    payload: RejectGovernanceRequest,
    identity: dict[str, object] = Depends(require_permission("governance.approve")),
) -> GovernanceActionResponse:
    incidents = get_all_incidents()
    try:
        result = reject_governance_request(payload.approval_id, payload.actor, payload.notes, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("governance:")
    clear_runtime_cache("operations:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    append_audit_event(
        category="governance",
        action="approval_rejected",
        severity="high",
        target_module="governance",
        status="success",
        reason=payload.notes or "Governance approval rejected",
        request=request,
        identity=identity,
        target_id=payload.approval_id,
        risk_score=55,
    )
    return GovernanceActionResponse(
        status=result["status"],
        approval=result["approval"],
        workflow=result["workflow"],
    )


@router.post("/pause", response_model=GovernanceActionResponse)
def post_governance_pause_route(
    request: Request,
    payload: PauseWorkflowRequest,
    identity: dict[str, object] = Depends(require_permission("governance.approve")),
) -> GovernanceActionResponse:
    incidents = get_all_incidents()
    try:
        result = pause_governed_workflow(payload.workflow_id, payload.actor, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("governance:")
    clear_runtime_cache("operations:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    append_audit_event(
        category="governance",
        action="workflow_paused",
        severity="medium",
        target_module="governance",
        status="success",
        reason="Workflow paused",
        request=request,
        identity=identity,
        target_id=payload.workflow_id,
        risk_score=41,
    )
    return GovernanceActionResponse(status=result["status"], workflow=result["workflow"])


@router.post("/resume", response_model=GovernanceActionResponse)
def post_governance_resume_route(
    request: Request,
    payload: ResumeWorkflowRequest,
    identity: dict[str, object] = Depends(require_permission("governance.approve")),
) -> GovernanceActionResponse:
    incidents = get_all_incidents()
    try:
        result = resume_governed_workflow(payload.workflow_id, payload.actor, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("governance:")
    clear_runtime_cache("operations:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    append_audit_event(
        category="governance",
        action="workflow_resumed",
        severity="medium",
        target_module="governance",
        status="success",
        reason="Workflow resumed",
        request=request,
        identity=identity,
        target_id=payload.workflow_id,
        risk_score=36,
    )
    return GovernanceActionResponse(status=result["status"], workflow=result["workflow"])


@router.post("/override", response_model=GovernanceActionResponse)
def post_governance_override_route(
    request: Request,
    payload: OverrideWorkflowRequest,
    identity: dict[str, object] = Depends(require_permission("governance.approve")),
) -> GovernanceActionResponse:
    incidents = get_all_incidents()
    try:
        result = override_governed_workflow(payload.workflow_id, payload.actor, payload.reason, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("governance:")
    clear_runtime_cache("operations:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    append_audit_event(
        category="governance",
        action="override",
        severity="critical",
        target_module="governance",
        status="success",
        reason=payload.reason,
        request=request,
        identity=identity,
        target_id=payload.workflow_id,
        risk_score=84,
    )
    return GovernanceActionResponse(
        status=result["status"],
        approval=result.get("approval"),
        workflow=result["workflow"],
    )


@router.post("/reassign", response_model=GovernanceActionResponse)
def post_governance_reassign_route(
    request: Request,
    payload: ReassignApprovalRequest,
    identity: dict[str, object] = Depends(require_permission("governance.approve")),
) -> GovernanceActionResponse:
    incidents = get_all_incidents()
    try:
        result = reassign_governance_request(payload.approval_id, payload.new_role, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("governance:")
    clear_runtime_cache("operations:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    append_audit_event(
        category="governance",
        action="approval_reassigned",
        severity="medium",
        target_module="governance",
        status="success",
        reason=f"Approval reassigned to {payload.new_role}",
        request=request,
        identity=identity,
        target_id=payload.approval_id,
        risk_score=46,
    )
    return GovernanceActionResponse(
        status=result["status"],
        approval=result["approval"],
        workflow=result["workflow"],
    )

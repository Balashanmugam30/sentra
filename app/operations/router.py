from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.operations.engine import (
    approve_workflow_step,
    cancel_workflow,
    get_live_operations_snapshot,
    get_operations_history_snapshot,
    run_test_workflow,
)
from app.operations.schemas import (
    ApproveRequest,
    ApproveResponse,
    CancelRequest,
    CancelResponse,
    OperationsHistoryResponse,
    OperationsLiveResponse,
    RunTestRequest,
    RunTestResponse,
)
from app.rbac.guard import require_permission
from app.services.incident_service import get_all_incidents
from app.tenancy.context import identity_tenant_cache_key

router = APIRouter(prefix="/operations", tags=["Operations"])


@router.get("/live", response_model=OperationsLiveResponse)
def get_live_operations_route(
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> OperationsLiveResponse:
    def build() -> OperationsLiveResponse:
        incidents = get_all_incidents()
        snapshot = get_live_operations_snapshot(incidents)
        return OperationsLiveResponse(
            generated_at=datetime.now(timezone.utc),
            global_state=snapshot["global_state"],
            active_workflows_count=snapshot["active_workflows_count"],
            awaiting_approvals_count=snapshot["awaiting_approvals_count"],
            completed_today=snapshot["completed_today"],
            failed_today=snapshot["failed_today"],
            workflows=snapshot["workflows"],
        )

    return cached_call(identity_tenant_cache_key(identity, "operations:live"), 5, build)


@router.get("/history", response_model=OperationsHistoryResponse)
def get_operations_history_route(
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> OperationsHistoryResponse:
    def build() -> OperationsHistoryResponse:
        incidents = get_all_incidents()
        snapshot = get_operations_history_snapshot(incidents)
        return OperationsHistoryResponse(
            generated_at=datetime.now(timezone.utc),
            workflows=snapshot["workflows"],
        )

    return cached_call(identity_tenant_cache_key(identity, "operations:history"), 10, build)


@router.post("/run-test", response_model=RunTestResponse)
def post_run_test_route(
    request: Request,
    payload: RunTestRequest,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> RunTestResponse:
    incidents = get_all_incidents()
    result = run_test_workflow(payload.scenario, incidents)
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))
    clear_runtime_cache("operations:")
    clear_runtime_cache("governance:")
    append_audit_event(
        category="operations",
        action="workflow_run",
        severity="high",
        target_module="operations",
        status="success",
        reason=f"Workflow scenario {payload.scenario} launched",
        request=request,
        identity=identity,
        target_id=result["workflow"].workflow_id,
        risk_score=62,
    )
    return RunTestResponse(
        status=result["status"],
        workflow=result["workflow"],
    )


@router.post("/approve", response_model=ApproveResponse)
def post_approve_route(
    request: Request,
    payload: ApproveRequest,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> ApproveResponse:
    incidents = get_all_incidents()
    try:
        result = approve_workflow_step(payload.workflow_id, payload.step_id, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("operations:")
    clear_runtime_cache("governance:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))

    append_audit_event(
        category="operations",
        action="approval",
        severity="medium",
        target_module="operations",
        status="success",
        reason=f"Approved workflow step {payload.step_id}",
        request=request,
        identity=identity,
        target_id=payload.workflow_id,
        risk_score=42,
    )
    return ApproveResponse(
        status=result["status"],
        workflow=result["workflow"],
    )


@router.post("/cancel", response_model=CancelResponse)
def post_cancel_route(
    request: Request,
    payload: CancelRequest,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> CancelResponse:
    incidents = get_all_incidents()
    try:
        result = cancel_workflow(payload.workflow_id, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("operations:")
    clear_runtime_cache("governance:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))

    append_audit_event(
        category="operations",
        action="cancel",
        severity="high",
        target_module="operations",
        status="success",
        reason="Workflow cancelled",
        request=request,
        identity=identity,
        target_id=payload.workflow_id,
        risk_score=58,
    )
    return CancelResponse(
        status=result["status"],
        workflow=result["workflow"],
    )

from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.audit.engine import append_audit_event
from app.ops.recovery_service import (
    approve_recovery,
    build_recovery_snapshot,
    get_recovery_kpis,
    get_recovery_tasks,
    run_recovery,
)
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ops", tags=["Recovery Continuity Command"])


class RecoveryRunRequest(BaseModel):
    scenario_id: str | None = Field(default="hotel_fire_recovery", max_length=120)
    reason: str | None = Field(default=None, max_length=240)


class RecoveryApprovalRequest(BaseModel):
    gate_id: str = Field(default="REOPEN-ZONE", max_length=120)
    reason: str | None = Field(default=None, max_length=240)


@router.get("/recovery")
def get_ops_recovery_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return build_recovery_snapshot()


@router.post("/recovery/run")
def post_ops_recovery_run_route(
    request: Request,
    payload: RecoveryRunRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = run_recovery(payload.scenario_id)
    append_audit_event(
        category="operations",
        action="recovery_workflow_run",
        severity="high",
        target_module="ops-recovery",
        target_id=payload.scenario_id,
        status="success",
        reason=payload.reason or "Recovery continuity workflow launched",
        request=request,
        identity=identity,
        risk_score=66,
        is_demo=True,
    )
    return result


@router.post("/recovery/approve")
def post_ops_recovery_approve_route(
    request: Request,
    payload: RecoveryApprovalRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = approve_recovery(payload.gate_id)
    append_audit_event(
        category="operations",
        action="reopen_gate_approved",
        severity="high",
        target_module="ops-recovery",
        target_id=payload.gate_id,
        status="success",
        reason=payload.reason or "Recovery reopen gate approved",
        request=request,
        identity=identity,
        risk_score=70,
    )
    return result


@router.get("/recovery/tasks")
def get_ops_recovery_tasks_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_recovery_tasks()


@router.get("/recovery/kpis")
def get_ops_recovery_kpis_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_recovery_kpis()

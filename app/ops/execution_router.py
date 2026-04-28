from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.audit.engine import append_audit_event
from app.ops.execution_service import (
    approve_task,
    build_execution_snapshot,
    close_incident,
    pause_task,
    reassign_task,
    run_execution_workflow,
)
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ops", tags=["Autonomous Operations Execution"])


class RunExecutionRequest(BaseModel):
    scenario_id: str | None = Field(default=None, max_length=80)


class TaskActionRequest(BaseModel):
    task_id: str = Field(..., max_length=120)
    owner: str | None = Field(default=None, max_length=120)
    reason: str | None = Field(default=None, max_length=240)


class IncidentCloseRequest(BaseModel):
    incident_id: str = Field(..., max_length=120)
    reason: str | None = Field(default=None, max_length=240)


@router.get("/execution")
def get_ops_execution_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return build_execution_snapshot()


@router.post("/execution/run")
def post_ops_execution_run_route(
    request: Request,
    payload: RunExecutionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = run_execution_workflow(payload.scenario_id)
    append_audit_event(
        category="operations",
        action="execution_workflow_run",
        severity="high",
        target_module="ops",
        target_id=payload.scenario_id,
        status="success",
        reason=f"Autonomous operations workflow launched for {payload.scenario_id or 'default scenario'}",
        request=request,
        identity=identity,
        risk_score=72,
        is_demo=True,
    )
    return result


@router.get("/tasks")
def get_ops_tasks_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    snapshot = build_execution_snapshot()
    return {"generated_at": snapshot["generated_at"], "tasks": snapshot["tasks"], "task_board": snapshot["task_board"]}


@router.post("/task/approve")
def post_ops_task_approve_route(
    request: Request,
    payload: TaskActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = approve_task(payload.task_id)
    append_audit_event(
        category="operations",
        action="execution_task_approved",
        severity="medium",
        target_module="ops",
        target_id=payload.task_id,
        status="success",
        reason=payload.reason or "Execution task approved",
        request=request,
        identity=identity,
        risk_score=48,
    )
    return result


@router.post("/task/reassign")
def post_ops_task_reassign_route(
    request: Request,
    payload: TaskActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = reassign_task(payload.task_id, payload.owner or "Ops Alpha")
    append_audit_event(
        category="operations",
        action="execution_task_reassigned",
        severity="medium",
        target_module="ops",
        target_id=payload.task_id,
        status="success",
        reason=payload.reason or f"Task reassigned to {payload.owner or 'Ops Alpha'}",
        request=request,
        identity=identity,
        risk_score=46,
    )
    return result


@router.post("/task/pause")
def post_ops_task_pause_route(
    request: Request,
    payload: TaskActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = pause_task(payload.task_id)
    append_audit_event(
        category="operations",
        action="execution_task_paused",
        severity="medium",
        target_module="ops",
        target_id=payload.task_id,
        status="success",
        reason=payload.reason or "Task paused for human override",
        request=request,
        identity=identity,
        risk_score=42,
    )
    return result


@router.get("/slas")
def get_ops_slas_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    snapshot = build_execution_snapshot()
    return {"generated_at": snapshot["generated_at"], "sla_timers": snapshot["sla_timers"]}


@router.get("/teams")
def get_ops_teams_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    snapshot = build_execution_snapshot()
    return {"generated_at": snapshot["generated_at"], "teams": snapshot["teams"]}


@router.post("/incident/close")
def post_ops_incident_close_route(
    request: Request,
    payload: IncidentCloseRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = close_incident(payload.incident_id)
    close_result = result.get("close_result", {})
    append_audit_event(
        category="operations",
        action="execution_incident_close_attempt",
        severity="high" if close_result.get("closed") else "medium",
        target_module="ops",
        target_id=payload.incident_id,
        status="success" if close_result.get("closed") else "blocked",
        reason=payload.reason or "Incident close gate evaluated",
        request=request,
        identity=identity,
        risk_score=64,
    )
    return result

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.analytics.engine import generate_live_analytics
from app.communications.engine import generate_live_communications
from app.integrations.delivery import dispatch_operation_event
from app.models.incident import Incident
from app.operations.workflows import (
    build_test_workflow_definition,
    build_workflow_definition,
)
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.coordinator import generate_coordination_intelligence
from app.prediction.resources import generate_resource_deployments
from app.simulation.twin import generate_live_twin_state


TERMINAL_STATUSES = {"completed", "cancelled", "failed"}


@dataclass
class OperationStepRecord:
    step_id: str
    title: str
    type: str
    status: str
    requires_approval: bool
    assigned_system: str
    eta_seconds: int
    action_name: str | None = None
    required_role: str | None = None
    approval_id: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    approved_at: datetime | None = None


@dataclass
class OperationWorkflowRecord:
    workflow_id: str
    workflow_kind: str
    title: str
    trigger_source: str
    status: str
    priority: str
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None
    affected_target: str
    steps: list[OperationStepRecord] = field(default_factory=list)


_workflow_counter = 100
_step_counter = 1000
_workflow_store: list[OperationWorkflowRecord] = []
_operation_events: list[dict[str, object]] = []


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _next_workflow_id() -> str:
    global _workflow_counter
    _workflow_counter += 1
    return f"WF-{_workflow_counter}"


def _next_step_id() -> str:
    global _step_counter
    _step_counter += 1
    return f"STEP-{_step_counter}"


def emit_operation_event(event_name: str, payload: dict[str, object]) -> None:
    _operation_events.append(
        {
            "event": event_name,
            "payload": payload,
            "generated_at": _now().isoformat(),
        }
    )
    del _operation_events[:-25]
    dispatch_operation_event(event_name, payload)


def record_external_operation_signal(signal_name: str, payload: dict[str, object]) -> None:
    emit_operation_event(signal_name, payload)


def _make_step(definition: dict[str, object]) -> OperationStepRecord:
    return OperationStepRecord(
        step_id=_next_step_id(),
        title=str(definition["title"]),
        type=str(definition["type"]),
        status="queued",
        requires_approval=bool(definition["requires_approval"]),
        assigned_system=str(definition["assigned_system"]),
        eta_seconds=int(definition["eta_seconds"]),
        action_name=str(definition["action_name"]) if definition.get("action_name") else None,
        required_role=str(definition["required_role"]) if definition.get("required_role") else None,
    )


def _workflow_to_dict(workflow: OperationWorkflowRecord) -> dict[str, object]:
    completed_steps = sum(1 for step in workflow.steps if step.status == "completed")
    progress_percent = 100 if not workflow.steps else round((completed_steps / len(workflow.steps)) * 100)
    current_step = next(
        (step.title for step in workflow.steps if step.status not in TERMINAL_STATUSES and step.status != "completed"),
        None,
    )

    return {
        "workflow_id": workflow.workflow_id,
        "title": workflow.title,
        "trigger_source": workflow.trigger_source,
        "status": workflow.status,
        "priority": workflow.priority,
        "created_at": workflow.created_at,
        "started_at": workflow.started_at,
        "completed_at": workflow.completed_at,
        "affected_target": workflow.affected_target,
        "progress_percent": progress_percent,
        "current_step": current_step,
        "steps": [
            {
                "step_id": step.step_id,
                "title": step.title,
                "type": step.type,
                "status": step.status,
                "requires_approval": step.requires_approval,
                "assigned_system": step.assigned_system,
                "eta_seconds": step.eta_seconds,
                "action_name": step.action_name,
                "required_role": step.required_role,
                "approval_id": step.approval_id,
            }
            for step in workflow.steps
        ],
    }


def get_workflow_record(workflow_id: str) -> OperationWorkflowRecord | None:
    return next((item for item in _workflow_store if item.workflow_id == workflow_id), None)


def list_workflow_records() -> list[OperationWorkflowRecord]:
    return list(_workflow_store)


def _active_workflow_by_kind(workflow_kind: str) -> OperationWorkflowRecord | None:
    return next(
        (
            workflow
            for workflow in _workflow_store
            if workflow.workflow_kind == workflow_kind and workflow.status not in TERMINAL_STATUSES
        ),
        None,
    )


def _create_workflow(definition: dict[str, object]) -> OperationWorkflowRecord:
    workflow = OperationWorkflowRecord(
        workflow_id=_next_workflow_id(),
        workflow_kind=str(definition["kind"]),
        title=str(definition["title"]),
        trigger_source=str(definition["trigger_source"]),
        status="queued",
        priority=str(definition["priority"]),
        created_at=_now(),
        started_at=None,
        completed_at=None,
        affected_target=str(definition["affected_target"]),
        steps=[_make_step(step) for step in definition["steps"]],
    )
    _workflow_store.append(workflow)
    emit_operation_event(
        "workflow.created",
        {
            "workflow_id": workflow.workflow_id,
            "workflow_kind": workflow.workflow_kind,
            "priority": workflow.priority,
            "title": workflow.title,
            "affected_target": workflow.affected_target,
            "trigger_source": workflow.trigger_source,
        },
    )
    return workflow


def _upsert_workflow(definition: dict[str, object]) -> tuple[OperationWorkflowRecord, str]:
    existing = _active_workflow_by_kind(str(definition["kind"]))
    if existing is not None:
        existing.title = str(definition["title"])
        existing.trigger_source = str(definition["trigger_source"])
        existing.priority = str(definition["priority"])
        existing.affected_target = str(definition["affected_target"])
        emit_operation_event(
            "workflow.updated",
            {
                "workflow_id": existing.workflow_id,
                "workflow_kind": existing.workflow_kind,
                "priority": existing.priority,
                "title": existing.title,
                "affected_target": existing.affected_target,
                "trigger_source": existing.trigger_source,
            },
        )
        return existing, "updated"

    return _create_workflow(definition), "created"


def _approval_step_for(workflow: OperationWorkflowRecord) -> OperationStepRecord | None:
    return next(
        (
            step
            for step in workflow.steps
            if step.status == "awaiting_approval"
            or (step.requires_approval and step.approved_at is None and step.status not in TERMINAL_STATUSES)
        ),
        None,
    )


def _ensure_governance_request(workflow: OperationWorkflowRecord, step: OperationStepRecord) -> None:
    from app.governance.engine import ensure_approval_request_for_step

    approval = ensure_approval_request_for_step(
        workflow_id=workflow.workflow_id,
        step_id=step.step_id,
        action_name=step.action_name or step.title.lower().replace(" ", "_"),
        required_role=step.required_role or "commander",
        requested_by="sentra_autonomy",
    )
    step.approval_id = str(approval["approval_id"])


def _complete_step(
    workflow: OperationWorkflowRecord,
    step: OperationStepRecord,
    *,
    event_name: str = "workflow.step_completed",
) -> None:
    from app.resilience.recovery import clear_workflow_stall

    now = _now()
    step.status = "completed"
    step.completed_at = now
    step.started_at = step.started_at or now
    clear_workflow_stall(workflow.workflow_id)
    emit_operation_event(
        event_name,
        {
            "workflow_id": workflow.workflow_id,
            "workflow_kind": workflow.workflow_kind,
            "priority": workflow.priority,
            "step_id": step.step_id,
            "step_type": step.type,
            "title": workflow.title,
            "affected_target": workflow.affected_target,
        },
    )


def _advance_workflow(workflow: OperationWorkflowRecord) -> None:
    now = _now()

    if workflow.status in TERMINAL_STATUSES or workflow.status == "paused":
        return

    if workflow.status == "queued":
        workflow.status = "running"
        workflow.started_at = workflow.started_at or now
        emit_operation_event(
            "workflow.started",
            {
                "workflow_id": workflow.workflow_id,
                "workflow_kind": workflow.workflow_kind,
                "priority": workflow.priority,
                "title": workflow.title,
                "affected_target": workflow.affected_target,
            },
        )

    while True:
        current_step = next(
            (step for step in workflow.steps if step.status not in {"completed", "cancelled", "failed"}),
            None,
        )

        if current_step is None:
            workflow.status = "completed"
            workflow.completed_at = workflow.completed_at or now
            emit_operation_event(
                "workflow.completed",
                {
                    "workflow_id": workflow.workflow_id,
                    "workflow_kind": workflow.workflow_kind,
                    "priority": workflow.priority,
                    "title": workflow.title,
                    "affected_target": workflow.affected_target,
                },
            )
            return

        if current_step.requires_approval and current_step.approved_at is None:
            current_step.status = "awaiting_approval"
            workflow.status = "awaiting_approval"
            _ensure_governance_request(workflow, current_step)
            return

        workflow.status = "running"

        if current_step.status == "queued":
            current_step.status = "running"
            current_step.started_at = now
            emit_operation_event(
                "workflow.step_started",
                {
                    "workflow_id": workflow.workflow_id,
                    "workflow_kind": workflow.workflow_kind,
                    "priority": workflow.priority,
                    "step_id": current_step.step_id,
                    "step_type": current_step.type,
                    "title": workflow.title,
                    "affected_target": workflow.affected_target,
                },
            )

        started_at = current_step.started_at or now
        if (now - started_at).total_seconds() < current_step.eta_seconds:
            return

        _complete_step(workflow, current_step)


def _fast_forward_to_approval(workflow: OperationWorkflowRecord) -> None:
    now = _now()
    workflow.status = "running"
    workflow.started_at = workflow.started_at or now

    for step in workflow.steps:
        if step.requires_approval and step.approved_at is None:
            step.status = "awaiting_approval"
            workflow.status = "awaiting_approval"
            _ensure_governance_request(workflow, step)
            return

        if step.status == "queued":
            step.status = "running"
            step.started_at = now
            emit_operation_event(
                "workflow.step_started",
                {
                    "workflow_id": workflow.workflow_id,
                    "workflow_kind": workflow.workflow_kind,
                    "priority": workflow.priority,
                    "step_id": step.step_id,
                    "step_type": step.type,
                    "title": workflow.title,
                    "affected_target": workflow.affected_target,
                },
            )
            _complete_step(workflow, step)


def _sync_triggered_workflows(incidents: list[Incident]) -> None:
    fusion = generate_fusion_snapshot(incidents)
    coordinator = generate_coordination_intelligence(incidents)
    communications = generate_live_communications(incidents)
    simulation = generate_live_twin_state(incidents)
    analytics = generate_live_analytics(incidents)
    resources = generate_resource_deployments(incidents)

    top_zone = fusion["zones"][0] if fusion["zones"] else None

    if fusion["global_status"] == "critical":
        _upsert_workflow(
            build_workflow_definition(
                "CRISIS_LOCKDOWN",
                target=top_zone.zone if top_zone else "Zone 1",
                trigger_source="fusion:critical",
                priority="critical",
            )
        )

    if top_zone is not None and top_zone.fused_score >= 80:
        _upsert_workflow(
            build_workflow_definition(
                "RAPID_RESPONSE",
                target=top_zone.zone,
                trigger_source="fusion:top_zone",
                priority="high" if top_zone.fused_score < 90 else "critical",
            )
        )

    if communications["delivery_status"].queued >= 2:
        _upsert_workflow(
            build_workflow_definition(
                "COMMS_RECOVERY",
                target="Communications Grid",
                trigger_source="communications:queued",
                priority="high" if communications["delivery_status"].queued >= 4 else "medium",
            )
        )

    if resources["global_load"] == "overloaded" or analytics["kpis"].resource_utilization >= 100:
        _upsert_workflow(
            build_workflow_definition(
                "MUTUAL_AID",
                target=top_zone.zone if top_zone else "Command Grid",
                trigger_source="resources:overloaded",
                priority="critical",
            )
        )

    if coordinator["global_mode"] == "lockdown" and simulation["global_mode"] in {"lockdown", "critical"}:
        _upsert_workflow(
            build_workflow_definition(
                "CRISIS_LOCKDOWN",
                target=top_zone.zone if top_zone else "Zone 1",
                trigger_source="coordinator:lockdown",
                priority="critical",
            )
        )


def _global_state(workflows: list[OperationWorkflowRecord]) -> str:
    if any(workflow.priority == "critical" for workflow in workflows):
        return "critical"
    if any(workflow.priority == "high" or workflow.status in {"awaiting_approval", "paused"} for workflow in workflows):
        return "elevated"
    return "stable"


def get_live_operations_snapshot(incidents: list[Incident]) -> dict[str, object]:
    from app.resilience.recovery import sync_workflow_health

    _sync_triggered_workflows(incidents)

    for workflow in _workflow_store:
        _advance_workflow(workflow)

    sync_workflow_health(_workflow_store)

    active = [workflow for workflow in _workflow_store if workflow.status not in TERMINAL_STATUSES]
    today = _now().date()
    completed_today = sum(
        1
        for workflow in _workflow_store
        if workflow.status == "completed"
        and workflow.completed_at is not None
        and workflow.completed_at.date() == today
    )
    failed_today = sum(
        1
        for workflow in _workflow_store
        if workflow.status == "failed" and workflow.completed_at is not None and workflow.completed_at.date() == today
    )

    return {
        "global_state": _global_state(active),
        "active_workflows_count": len(active),
        "awaiting_approvals_count": sum(1 for workflow in active if workflow.status == "awaiting_approval"),
        "completed_today": completed_today,
        "failed_today": failed_today,
        "workflows": [_workflow_to_dict(workflow) for workflow in active],
    }


def get_operations_history_snapshot(incidents: list[Incident]) -> dict[str, object]:
    get_live_operations_snapshot(incidents)
    history = [
        _workflow_to_dict(workflow)
        for workflow in _workflow_store
        if workflow.status in {"completed", "cancelled", "failed"}
    ]
    history.sort(
        key=lambda workflow: (
            workflow["completed_at"] or workflow["created_at"],
            workflow["workflow_id"],
        ),
        reverse=True,
    )
    return {"workflows": history[:12]}


def run_test_workflow(scenario: str, incidents: list[Incident]) -> dict[str, object]:
    get_live_operations_snapshot(incidents)
    workflow, status = _upsert_workflow(build_test_workflow_definition(scenario))
    _fast_forward_to_approval(workflow)
    _advance_workflow(workflow)
    return {
        "status": status,
        "workflow": _workflow_to_dict(workflow),
    }


def approve_workflow_step(
    workflow_id: str,
    step_id: str,
    incidents: list[Incident],
    *,
    actor: str = "system",
    notes: str | None = None,
) -> dict[str, object]:
    get_live_operations_snapshot(incidents)
    workflow = get_workflow_record(workflow_id)
    if workflow is None:
        raise ValueError(f"Workflow '{workflow_id}' not found")

    step = next((item for item in workflow.steps if item.step_id == step_id), None)
    if step is None:
        raise ValueError(f"Step '{step_id}' not found")

    if not step.requires_approval:
        raise ValueError(f"Step '{step_id}' does not require approval")

    step.approved_at = _now()
    step.status = "completed"
    step.completed_at = step.approved_at
    workflow.status = "running"
    emit_operation_event(
        "workflow.step_approved",
        {
            "workflow_id": workflow.workflow_id,
            "workflow_kind": workflow.workflow_kind,
            "priority": workflow.priority,
            "step_id": step.step_id,
            "title": workflow.title,
            "affected_target": workflow.affected_target,
            "actor": actor,
            "notes": notes or "",
        },
    )
    _advance_workflow(workflow)

    return {
        "status": "completed" if workflow.status == "completed" else "approved",
        "workflow": _workflow_to_dict(workflow),
    }


def reject_workflow_step(
    workflow_id: str,
    step_id: str,
    incidents: list[Incident],
    *,
    actor: str = "system",
    notes: str | None = None,
) -> dict[str, object]:
    get_live_operations_snapshot(incidents)
    workflow = get_workflow_record(workflow_id)
    if workflow is None:
        raise ValueError(f"Workflow '{workflow_id}' not found")

    step = next((item for item in workflow.steps if item.step_id == step_id), None)
    if step is None:
        raise ValueError(f"Step '{step_id}' not found")

    step.status = "cancelled"
    step.completed_at = _now()
    workflow.status = "cancelled"
    workflow.completed_at = step.completed_at
    for item in workflow.steps:
        if item.step_id != step.step_id and item.status not in {"completed", "cancelled"}:
            item.status = "cancelled"
    emit_operation_event(
        "workflow.step_rejected",
        {
            "workflow_id": workflow.workflow_id,
            "workflow_kind": workflow.workflow_kind,
            "priority": workflow.priority,
            "step_id": step.step_id,
            "title": workflow.title,
            "affected_target": workflow.affected_target,
            "actor": actor,
            "notes": notes or "",
        },
    )
    emit_operation_event(
        "workflow.cancelled",
        {
            "workflow_id": workflow.workflow_id,
            "workflow_kind": workflow.workflow_kind,
            "priority": workflow.priority,
            "title": workflow.title,
            "affected_target": workflow.affected_target,
        },
    )
    return {
        "status": "cancelled",
        "workflow": _workflow_to_dict(workflow),
    }


def pause_workflow(workflow_id: str, incidents: list[Incident], *, actor: str = "operator") -> dict[str, object]:
    get_live_operations_snapshot(incidents)
    workflow = get_workflow_record(workflow_id)
    if workflow is None:
        raise ValueError(f"Workflow '{workflow_id}' not found")
    if workflow.status in TERMINAL_STATUSES:
        raise ValueError(f"Workflow '{workflow_id}' is already finalized")

    workflow.status = "paused"
    emit_operation_event(
        "workflow.paused",
        {
            "workflow_id": workflow.workflow_id,
            "workflow_kind": workflow.workflow_kind,
            "priority": workflow.priority,
            "title": workflow.title,
            "affected_target": workflow.affected_target,
            "actor": actor,
        },
    )
    return {"status": "paused", "workflow": _workflow_to_dict(workflow)}


def resume_workflow(workflow_id: str, incidents: list[Incident], *, actor: str = "operator") -> dict[str, object]:
    get_live_operations_snapshot(incidents)
    workflow = get_workflow_record(workflow_id)
    if workflow is None:
        raise ValueError(f"Workflow '{workflow_id}' not found")

    approval_step = _approval_step_for(workflow)
    workflow.status = (
        "awaiting_approval" if approval_step is not None and approval_step.approved_at is None else "running"
    )
    emit_operation_event(
        "workflow.resumed",
        {
            "workflow_id": workflow.workflow_id,
            "workflow_kind": workflow.workflow_kind,
            "priority": workflow.priority,
            "title": workflow.title,
            "affected_target": workflow.affected_target,
            "actor": actor,
        },
    )
    _advance_workflow(workflow)
    return {"status": workflow.status, "workflow": _workflow_to_dict(workflow)}


def override_workflow(
    workflow_id: str,
    incidents: list[Incident],
    *,
    actor: str = "executive",
    reason: str | None = None,
) -> dict[str, object]:
    get_live_operations_snapshot(incidents)
    workflow = get_workflow_record(workflow_id)
    if workflow is None:
        raise ValueError(f"Workflow '{workflow_id}' not found")

    step = _approval_step_for(workflow)
    if step is None:
        raise ValueError(f"Workflow '{workflow_id}' has no approval step to override")

    now = _now()
    step.approved_at = now
    step.status = "completed"
    step.completed_at = now
    workflow.status = "running"
    emit_operation_event(
        "workflow.step_overridden",
        {
            "workflow_id": workflow.workflow_id,
            "workflow_kind": workflow.workflow_kind,
            "priority": workflow.priority,
            "step_id": step.step_id,
            "title": workflow.title,
            "affected_target": workflow.affected_target,
            "actor": actor,
            "reason": reason or "",
        },
    )
    _advance_workflow(workflow)
    return {"status": "overridden", "workflow": _workflow_to_dict(workflow)}


def reassign_workflow_step_role(
    workflow_id: str,
    step_id: str,
    new_role: str,
    incidents: list[Incident],
) -> dict[str, object]:
    get_live_operations_snapshot(incidents)
    workflow = get_workflow_record(workflow_id)
    if workflow is None:
        raise ValueError(f"Workflow '{workflow_id}' not found")
    step = next((item for item in workflow.steps if item.step_id == step_id), None)
    if step is None:
        raise ValueError(f"Step '{step_id}' not found")

    step.required_role = new_role
    if step.status == "awaiting_approval":
        _ensure_governance_request(workflow, step)
    return {"status": "reassigned", "workflow": _workflow_to_dict(workflow)}


def cancel_workflow(workflow_id: str, incidents: list[Incident]) -> dict[str, object]:
    get_live_operations_snapshot(incidents)
    workflow = get_workflow_record(workflow_id)
    if workflow is None:
        raise ValueError(f"Workflow '{workflow_id}' not found")

    workflow.status = "cancelled"
    workflow.completed_at = _now()
    for step in workflow.steps:
        if step.status not in {"completed", "cancelled"}:
            step.status = "cancelled"
    emit_operation_event(
        "workflow.cancelled",
        {
            "workflow_id": workflow.workflow_id,
            "workflow_kind": workflow.workflow_kind,
            "priority": workflow.priority,
            "title": workflow.title,
            "affected_target": workflow.affected_target,
        },
    )
    return {
        "status": "cancelled",
        "workflow": _workflow_to_dict(workflow),
    }

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.governance.roles import actor_matches_role, required_role_for_action
from app.models.incident import Incident


@dataclass
class ApprovalRequestRecord:
    approval_id: str
    workflow_id: str
    step_id: str
    action_name: str
    required_role: str
    status: str
    requested_at: datetime
    resolved_at: datetime | None
    requested_by: str
    resolved_by: str | None
    notes: str | None


@dataclass
class AuditEventRecord:
    timestamp: datetime
    actor: str
    action: str
    workflow_id: str | None
    approval_id: str | None
    result: str
    notes: str | None


_approval_counter = 100
_approval_store: list[ApprovalRequestRecord] = []
_audit_store: list[AuditEventRecord] = []


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _next_approval_id() -> str:
    global _approval_counter
    _approval_counter += 1
    return f"APR-{_approval_counter}"


def _approval_to_dict(record: ApprovalRequestRecord) -> dict[str, object]:
    return {
        "approval_id": record.approval_id,
        "workflow_id": record.workflow_id,
        "step_id": record.step_id,
        "action_name": record.action_name,
        "required_role": record.required_role,
        "status": record.status,
        "requested_at": record.requested_at,
        "resolved_at": record.resolved_at,
        "requested_by": record.requested_by,
        "resolved_by": record.resolved_by,
        "notes": record.notes,
    }


def _audit_to_dict(record: AuditEventRecord) -> dict[str, object]:
    return {
        "timestamp": record.timestamp,
        "actor": record.actor,
        "action": record.action,
        "workflow_id": record.workflow_id,
        "approval_id": record.approval_id,
        "result": record.result,
        "notes": record.notes,
    }


def _log_audit(
    *,
    actor: str,
    action: str,
    workflow_id: str | None = None,
    approval_id: str | None = None,
    result: str,
    notes: str | None = None,
) -> None:
    _audit_store.append(
        AuditEventRecord(
            timestamp=_now(),
            actor=actor,
            action=action,
            workflow_id=workflow_id,
            approval_id=approval_id,
            result=result,
            notes=notes,
        )
    )
    del _audit_store[:-120]


def _find_approval(approval_id: str) -> ApprovalRequestRecord | None:
    return next((record for record in _approval_store if record.approval_id == approval_id), None)


def ensure_approval_request_for_step(
    *,
    workflow_id: str,
    step_id: str,
    action_name: str,
    required_role: str,
    requested_by: str,
) -> dict[str, object]:
    existing = next(
        (
            record
            for record in _approval_store
            if record.workflow_id == workflow_id
            and record.step_id == step_id
            and record.status in {"pending", "approved", "overridden"}
        ),
        None,
    )
    if existing is not None:
        existing.required_role = required_role_for_action(action_name, required_role)
        return _approval_to_dict(existing)

    record = ApprovalRequestRecord(
        approval_id=_next_approval_id(),
        workflow_id=workflow_id,
        step_id=step_id,
        action_name=action_name,
        required_role=required_role_for_action(action_name, required_role),
        status="pending",
        requested_at=_now(),
        resolved_at=None,
        requested_by=requested_by,
        resolved_by=None,
        notes=None,
    )
    _approval_store.append(record)
    _log_audit(
        actor=requested_by,
        action="approval_requested",
        workflow_id=workflow_id,
        approval_id=record.approval_id,
        result="pending",
        notes=f"{record.action_name} requires {record.required_role}",
    )
    return _approval_to_dict(record)


def list_approval_requests() -> list[ApprovalRequestRecord]:
    return list(_approval_store)


def backdate_latest_pending_approval(*, minutes: int) -> bool:
    pending = [record for record in _approval_store if record.status == "pending"]
    if not pending:
        return False
    latest = max(pending, key=lambda record: (record.requested_at, record.approval_id))
    latest.requested_at = latest.requested_at - timedelta(minutes=minutes)
    return True


def escalate_timeouts_if_needed(incidents: list[Incident]) -> list[dict[str, object]]:
    from app.governance.roles import next_role
    from app.operations.engine import reassign_workflow_step_role

    timeout_threshold = _now() - timedelta(minutes=3)
    escalations: list[dict[str, object]] = []

    for record in _approval_store:
        if record.status != "pending" or record.requested_at > timeout_threshold:
            continue

        previous_role = record.required_role
        if previous_role == "executive":
            _log_audit(
                actor="resilience",
                action="approval_reassigned",
                workflow_id=record.workflow_id,
                approval_id=record.approval_id,
                result="override_advisory",
                notes="Executive approval timeout reached override advisory state",
            )
            escalations.append(
                {
                    "approval_id": record.approval_id,
                    "from_role": previous_role,
                    "to_role": None,
                }
            )
            record.requested_at = _now()
            continue

        new_role = next_role(previous_role)
        record.required_role = new_role
        record.notes = f"Escalated from {previous_role} to {new_role}"
        reassign_workflow_step_role(record.workflow_id, record.step_id, new_role, incidents)
        _log_audit(
            actor="resilience",
            action="approval_reassigned",
            workflow_id=record.workflow_id,
            approval_id=record.approval_id,
            result="escalated",
            notes=record.notes,
        )
        record.requested_at = _now()
        escalations.append(
            {
                "approval_id": record.approval_id,
                "from_role": previous_role,
                "to_role": new_role,
            }
        )

    return escalations


def get_governance_live_snapshot(incidents: list[Incident]) -> dict[str, object]:
    from app.operations.engine import get_live_operations_snapshot, list_workflow_records
    from app.resilience.recovery import process_governance_timeouts

    get_live_operations_snapshot(incidents)
    process_governance_timeouts(incidents)
    workflows = list_workflow_records()
    pending = [record for record in _approval_store if record.status == "pending"]
    recent_requests = sorted(
        _approval_store,
        key=lambda record: (record.requested_at, record.approval_id),
        reverse=True,
    )[:8]
    paused_workflows = [workflow for workflow in workflows if workflow.status == "paused"]
    today = _now().date()
    overrides_today = sum(
        1
        for record in _audit_store
        if record.action == "emergency_override" and record.timestamp.date() == today
    )
    role_totals: dict[str, int] = {}
    for record in pending:
        role_totals[record.required_role] = role_totals.get(record.required_role, 0) + 1

    if len(pending) >= 3 or overrides_today > 0:
        global_status = "critical"
    elif pending or paused_workflows:
        global_status = "elevated"
    else:
        global_status = "stable"

    return {
        "global_status": global_status,
        "pending_approvals_count": len(pending),
        "paused_workflows_count": len(paused_workflows),
        "overrides_today": overrides_today,
        "recent_requests": [_approval_to_dict(record) for record in recent_requests],
        "role_loads": [
            {"role": role, "pending_count": count}
            for role, count in sorted(role_totals.items(), key=lambda item: (-item[1], item[0]))
        ],
    }


def get_governance_audit_snapshot(incidents: list[Incident]) -> dict[str, object]:
    from app.resilience.recovery import process_governance_timeouts

    process_governance_timeouts(incidents)
    get_governance_live_snapshot(incidents)
    ordered = sorted(
        _audit_store,
        key=lambda record: (record.timestamp, record.approval_id or "", record.workflow_id or ""),
        reverse=True,
    )
    return {"audit_events": [_audit_to_dict(record) for record in ordered[:30]]}


def approve_governance_request(
    approval_id: str,
    actor: str,
    notes: str | None,
    incidents: list[Incident],
) -> dict[str, object]:
    from app.operations.engine import approve_workflow_step

    record = _find_approval(approval_id)
    if record is None:
        raise ValueError(f"Approval '{approval_id}' not found")
    if record.status != "pending":
        raise ValueError(f"Approval '{approval_id}' is already {record.status}")
    if not actor_matches_role(actor, record.required_role):
        raise ValueError(f"Actor '{actor}' cannot approve role '{record.required_role}'")

    record.status = "approved"
    record.resolved_at = _now()
    record.resolved_by = actor
    record.notes = notes
    workflow = approve_workflow_step(
        record.workflow_id,
        record.step_id,
        incidents,
        actor=actor,
        notes=notes,
    )["workflow"]
    _log_audit(
        actor=actor,
        action="approval_granted",
        workflow_id=record.workflow_id,
        approval_id=approval_id,
        result="approved",
        notes=notes,
    )
    return {"status": "approved", "approval": _approval_to_dict(record), "workflow": workflow}


def reject_governance_request(
    approval_id: str,
    actor: str,
    notes: str | None,
    incidents: list[Incident],
) -> dict[str, object]:
    from app.operations.engine import reject_workflow_step

    record = _find_approval(approval_id)
    if record is None:
        raise ValueError(f"Approval '{approval_id}' not found")
    if record.status != "pending":
        raise ValueError(f"Approval '{approval_id}' is already {record.status}")
    if not actor_matches_role(actor, record.required_role):
        raise ValueError(f"Actor '{actor}' cannot reject role '{record.required_role}'")

    record.status = "rejected"
    record.resolved_at = _now()
    record.resolved_by = actor
    record.notes = notes
    workflow = reject_workflow_step(
        record.workflow_id,
        record.step_id,
        incidents,
        actor=actor,
        notes=notes,
    )["workflow"]
    _log_audit(
        actor=actor,
        action="approval_rejected",
        workflow_id=record.workflow_id,
        approval_id=approval_id,
        result="rejected",
        notes=notes,
    )
    return {"status": "rejected", "approval": _approval_to_dict(record), "workflow": workflow}


def pause_governed_workflow(workflow_id: str, actor: str, incidents: list[Incident]) -> dict[str, object]:
    from app.operations.engine import pause_workflow

    workflow = pause_workflow(workflow_id, incidents, actor=actor)["workflow"]
    _log_audit(
        actor=actor,
        action="workflow_paused",
        workflow_id=workflow_id,
        result="paused",
        notes=None,
    )
    return {"status": "paused", "workflow": workflow}


def resume_governed_workflow(workflow_id: str, actor: str, incidents: list[Incident]) -> dict[str, object]:
    from app.operations.engine import resume_workflow

    workflow = resume_workflow(workflow_id, incidents, actor=actor)["workflow"]
    _log_audit(
        actor=actor,
        action="workflow_resumed",
        workflow_id=workflow_id,
        result="running",
        notes=None,
    )
    return {"status": "resumed", "workflow": workflow}


def override_governed_workflow(
    workflow_id: str,
    actor: str,
    reason: str,
    incidents: list[Incident],
) -> dict[str, object]:
    from app.operations.engine import get_workflow_record, override_workflow

    workflow_record = get_workflow_record(workflow_id)
    if workflow_record is None:
        raise ValueError(f"Workflow '{workflow_id}' not found")
    pending = next(
        (
            record
            for record in _approval_store
            if record.workflow_id == workflow_id and record.status == "pending"
        ),
        None,
    )
    if pending is not None:
        pending.status = "overridden"
        pending.resolved_at = _now()
        pending.resolved_by = actor
        pending.notes = reason
    workflow = override_workflow(workflow_id, incidents, actor=actor, reason=reason)["workflow"]
    _log_audit(
        actor=actor,
        action="emergency_override",
        workflow_id=workflow_id,
        approval_id=pending.approval_id if pending else None,
        result="overridden",
        notes=reason,
    )
    return {
        "status": "overridden",
        "approval": _approval_to_dict(pending) if pending else None,
        "workflow": workflow,
    }


def reassign_governance_request(
    approval_id: str,
    new_role: str,
    incidents: list[Incident],
) -> dict[str, object]:
    from app.operations.engine import reassign_workflow_step_role

    record = _find_approval(approval_id)
    if record is None:
        raise ValueError(f"Approval '{approval_id}' not found")

    record.required_role = new_role
    workflow = reassign_workflow_step_role(
        record.workflow_id,
        record.step_id,
        new_role,
        incidents,
    )["workflow"]
    _log_audit(
        actor="system",
        action="approval_reassigned",
        workflow_id=record.workflow_id,
        approval_id=approval_id,
        result="reassigned",
        notes=f"Reassigned to {new_role}",
    )
    return {"status": "reassigned", "approval": _approval_to_dict(record), "workflow": workflow}


def governance_gate_for_facility(scope: str, reason: str) -> dict[str, object]:
    if scope == "campus":
        return {
            "approval_required": True,
            "required_role": "commander_or_executive",
            "reason": reason,
        }
    if reason in {"critical_fire", "security_intrusion"}:
        return {
            "approval_required": False,
            "required_role": "commander",
            "reason": reason,
        }
    return {
        "approval_required": False,
        "required_role": None,
        "reason": reason,
    }

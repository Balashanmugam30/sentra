from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.integrations.connectors import PROVIDER_NAMES
from app.models.incident import Incident
from app.resilience.circuit import (
    can_attempt_provider,
    get_provider_record,
    list_provider_records,
    mark_provider_failure,
    mark_provider_success,
    reset_provider_circuit,
)


@dataclass
class ResilienceEventRecord:
    timestamp: datetime
    message: str


_events: list[ResilienceEventRecord] = []
_retries_attempted = 0
_fallbacks_used = 0
_recoveries_completed = 0
_timeouts_today = 0
_stalled_workflows: dict[str, str] = {}
_forced_failures: set[str] = set()

_FALLBACKS: dict[str, list[str]] = {
    "slack": ["teams", "email"],
    "teams": ["email"],
    "whatsapp": ["sms", "voice"],
    "sms": ["voice"],
    "facility_webhook": ["operator_local"],
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _log_event(message: str) -> None:
    _events.append(ResilienceEventRecord(timestamp=_now(), message=message))
    del _events[:-60]


def provider_fallback_chain(provider: str) -> list[str]:
    return _FALLBACKS.get(provider, [])


def should_force_provider_failure(provider: str) -> bool:
    return provider in _forced_failures


def can_send_provider(provider: str) -> bool:
    return can_attempt_provider(provider)


def record_retry_attempt(provider: str, attempt: int) -> None:
    global _retries_attempted
    _retries_attempted += 1
    if attempt == 2:
        _log_event(f"{provider.title()} retry scheduled after short delay")
    elif attempt >= 3:
        _log_event(f"{provider.title()} retry scheduled after longer delay")


def record_fallback_use(provider: str, fallback_provider: str, reason: str) -> None:
    global _fallbacks_used
    _fallbacks_used += 1
    _log_event(f"{provider.title()} {reason} -> fallback {fallback_provider.replace('_', ' ')}")


def record_provider_success(provider: str) -> None:
    mark_provider_success(provider)


def record_provider_failure(provider: str, response_text: str) -> None:
    record = mark_provider_failure(provider)
    if record.circuit_state == "open":
        _log_event(f"Circuit opened for {provider.title()} connector")
    else:
        _log_event(f"{provider.title()} failure -> {response_text}")


def register_workflow_stall(workflow_id: str, reason: str) -> None:
    if workflow_id not in _stalled_workflows:
        _stalled_workflows[workflow_id] = reason
        _log_event(f"Workflow {workflow_id} stalled -> {reason}")


def clear_workflow_stall(workflow_id: str, note: str | None = None) -> None:
    if workflow_id in _stalled_workflows:
        del _stalled_workflows[workflow_id]
    if note:
        _log_event(note)


def record_recovery_completed(workflow_id: str, note: str) -> None:
    global _recoveries_completed
    _recoveries_completed += 1
    clear_workflow_stall(workflow_id)
    _log_event(note)


def record_approval_timeout(approval_id: str, from_role: str, to_role: str | None) -> None:
    global _timeouts_today
    _timeouts_today += 1
    if to_role:
        _log_event(f"Approval {approval_id} expired -> escalated {to_role}")
    else:
        _log_event(f"Approval {approval_id} expired -> override advisory only")


def sync_workflow_health(workflows: list[object]) -> None:
    now = _now()
    for workflow in workflows:
        status = getattr(workflow, "status", "")
        if status in {"completed", "cancelled", "failed"}:
            clear_workflow_stall(getattr(workflow, "workflow_id", ""))
            continue
        steps = getattr(workflow, "steps", [])
        running_step = next((step for step in steps if getattr(step, "status", "") == "running"), None)
        if running_step is None:
            continue
        started_at = getattr(running_step, "started_at", None)
        eta_seconds = max(int(getattr(running_step, "eta_seconds", 0)), 1)
        if started_at is not None and (now - started_at).total_seconds() > max(eta_seconds * 4, 120):
            register_workflow_stall(getattr(workflow, "workflow_id", ""), "step exceeded expected ETA")


def process_governance_timeouts(incidents: list[Incident]) -> None:
    from app.governance.engine import escalate_timeouts_if_needed

    for event in escalate_timeouts_if_needed(incidents):
        record_approval_timeout(
            approval_id=str(event["approval_id"]),
            from_role=str(event["from_role"]),
            to_role=str(event["to_role"]) if event.get("to_role") else None,
        )


def _provider_status(provider: str) -> str:
    record = get_provider_record(provider)
    if record.circuit_state == "open":
        return "offline"
    if record.circuit_state == "half_open":
        return "degraded"
    if record.failures > 0 and record.last_success_at is None:
        return "standby"
    return "ready"


def get_resilience_live_snapshot(incidents: list[Incident]) -> dict[str, object]:
    from app.operations.engine import get_live_operations_snapshot, list_workflow_records

    get_live_operations_snapshot(incidents)
    process_governance_timeouts(incidents)
    sync_workflow_health(list_workflow_records())

    providers = [
        {
            "name": record.name,
            "status": _provider_status(record.name),
            "circuit_state": record.circuit_state,
            "failures": record.failures,
            "last_success_at": record.last_success_at,
        }
        for record in list_provider_records()
        if record.name in PROVIDER_NAMES
    ]

    circuits_open = sum(1 for item in providers if item["circuit_state"] == "open")
    stalled_workflows = len(_stalled_workflows)
    if circuits_open >= 2 or stalled_workflows >= 2:
        global_state = "critical"
    elif _recoveries_completed > 0 or _timeouts_today > 0:
        global_state = "recovering"
    elif circuits_open > 0 or _fallbacks_used > 0:
        global_state = "degraded"
    elif _retries_attempted > 0:
        global_state = "watch"
    else:
        global_state = "healthy"

    active_incidents = [
        f"{incident.location} {incident.type}"
        for incident in incidents[:6]
    ]
    recommended_actions: list[str] = []
    if circuits_open:
        recommended_actions.append("Reset open provider circuits or allow cooldown to expire")
    if stalled_workflows:
        recommended_actions.append("Recover stalled workflows through reroute or resume")
    if _timeouts_today:
        recommended_actions.append("Review approval escalations and confirm backup approvers")
    if not recommended_actions:
        recommended_actions.append("Maintain healthy operating posture and monitor delivery health")

    return {
        "global_state": global_state,
        "metrics": {
            "retries_attempted": _retries_attempted,
            "fallbacks_used": _fallbacks_used,
            "circuits_open": circuits_open,
            "stalled_workflows": stalled_workflows,
            "timeouts_today": _timeouts_today,
            "recoveries_completed": _recoveries_completed,
        },
        "providers": providers,
        "active_incidents": active_incidents,
        "recommended_actions": recommended_actions,
    }


def get_resilience_history_snapshot(incidents: list[Incident]) -> dict[str, object]:
    get_resilience_live_snapshot(incidents)
    return {
        "events": [
            {"timestamp": event.timestamp, "message": event.message}
            for event in sorted(_events, key=lambda item: item.timestamp, reverse=True)[:20]
        ]
    }


def run_resilience_test(scenario: str, incidents: list[Incident]) -> dict[str, object]:
    from app.governance.engine import backdate_latest_pending_approval
    from app.integrations.delivery import send_integration_test
    from app.operations.engine import get_workflow_record, run_test_workflow

    if scenario == "provider_failure":
        _forced_failures.add("slack")
        send_integration_test("slack", "Sentra forced provider failure")
    elif scenario == "workflow_stall":
        result = run_test_workflow("critical_fire", incidents)
        workflow_id = str(result["workflow"]["workflow_id"])
        workflow = get_workflow_record(workflow_id)
        if workflow is not None:
            workflow.status = "running"
            first_step = next((step for step in workflow.steps if step.status == "completed"), None)
            current = next((step for step in workflow.steps if step.status in {"queued", "running", "awaiting_approval"}), None)
            if current is not None:
                current.status = "running"
                current.started_at = _now() - timedelta(seconds=max(current.eta_seconds * 6, 180))
            register_workflow_stall(workflow_id, "test scenario workflow stall")
    elif scenario == "approval_timeout":
        run_test_workflow("critical_fire", incidents)
        if backdate_latest_pending_approval(minutes=10):
            process_governance_timeouts(incidents)
    elif scenario == "network_partition":
        _forced_failures.update({"slack", "teams", "email"})
        send_integration_test("slack", "Sentra network partition test")
    elif scenario == "multi_failure":
        _forced_failures.update({"slack", "teams"})
        send_integration_test("slack", "Sentra multi failure test")
        run_test_workflow("critical_fire", incidents)
        if backdate_latest_pending_approval(minutes=10):
            process_governance_timeouts(incidents)
        result = run_test_workflow("mass_panic", incidents)
        workflow_id = str(result["workflow"]["workflow_id"])
        register_workflow_stall(workflow_id, "multi failure stall path")

    snapshot = get_resilience_live_snapshot(incidents)
    return {
        "status": "completed",
        "scenario": scenario,
        "global_state": snapshot["global_state"],
    }


def reset_resilience_circuit(provider: str) -> dict[str, object]:
    if provider in _forced_failures:
        _forced_failures.remove(provider)
    record = reset_provider_circuit(provider)
    mark_provider_success(provider)
    _log_event(f"Recovery completed for {provider.title()} connector")
    return {
        "status": "completed",
        "provider": provider,
        "circuit_state": record.circuit_state,
    }


def recover_stalled_workflow(workflow_id: str, incidents: list[Incident]) -> dict[str, object]:
    from app.governance.engine import override_governed_workflow
    from app.operations.engine import get_workflow_record, resume_workflow

    workflow = get_workflow_record(workflow_id)
    if workflow is None:
        raise ValueError(f"Workflow '{workflow_id}' not found")

    if workflow.status == "paused":
        result = resume_workflow(workflow_id, incidents, actor="resilience")
        record_recovery_completed(workflow_id, f"Workflow {workflow_id} resumed and recovered")
        return {"status": "resumed", "workflow": result["workflow"]}

    if workflow.status == "awaiting_approval":
        result = override_governed_workflow(
            workflow_id,
            "executive",
            "Resilience recovery path",
            incidents,
        )
        record_recovery_completed(workflow_id, f"Workflow {workflow_id} rerouted after approval delay")
        return {"status": "rerouted", "workflow": result["workflow"]}

    record_recovery_completed(workflow_id, f"Workflow {workflow_id} marked recovered after restart")
    return {"status": "recovered", "workflow": {
        "workflow_id": workflow.workflow_id,
        "title": workflow.title,
        "trigger_source": workflow.trigger_source,
        "status": workflow.status,
        "priority": workflow.priority,
        "created_at": workflow.created_at,
        "started_at": workflow.started_at,
        "completed_at": workflow.completed_at,
        "affected_target": workflow.affected_target,
        "progress_percent": round((sum(1 for step in workflow.steps if step.status == 'completed') / len(workflow.steps)) * 100) if workflow.steps else 100,
        "current_step": next((step.title for step in workflow.steps if step.status not in {'completed','cancelled','failed'}), None),
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
    }}

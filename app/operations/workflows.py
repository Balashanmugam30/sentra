from __future__ import annotations

from app.operations.schemas import WorkflowPriority, WorkflowStepType


WorkflowStepDefinition = dict[str, object]
WorkflowDefinition = dict[str, object]


def _step(
    title: str,
    step_type: WorkflowStepType,
    assigned_system: str,
    eta_seconds: int,
    requires_approval: bool = False,
    action_name: str | None = None,
    required_role: str | None = None,
) -> WorkflowStepDefinition:
    return {
        "title": title,
        "type": step_type,
        "assigned_system": assigned_system,
        "eta_seconds": eta_seconds,
        "requires_approval": requires_approval,
        "action_name": action_name,
        "required_role": required_role,
    }


def build_workflow_definition(
    workflow_kind: str,
    *,
    target: str = "Command Grid",
    trigger_source: str,
    priority: WorkflowPriority,
) -> WorkflowDefinition:
    if workflow_kind == "CRISIS_LOCKDOWN":
        return {
            "kind": workflow_kind,
            "title": "Crisis Lockdown Workflow",
            "trigger_source": trigger_source,
            "priority": priority,
            "affected_target": target,
            "steps": [
                _step("Trigger occupant alerts", "notification", "communications_ai", 25),
                _step("Dispatch rapid fire response", "dispatch", "resource_ai", 35),
                _step("Notify executive leadership", "notification", "boardroom_ai", 20),
                _step(
                    "Authorize full lockdown",
                    "approval",
                    "incident_command",
                    0,
                    True,
                    action_name="full_lockdown",
                    required_role="commander",
                ),
                _step("Lock affected access doors", "lockdown", "facility_control", 30),
                _step(
                    "Approve mutual aid escalation",
                    "approval",
                    "executive_control",
                    0,
                    True,
                    action_name="mutual_aid",
                    required_role="executive",
                ),
                _step("Start crisis audit log", "audit", "ops_audit", 15),
            ],
        }

    if workflow_kind == "RAPID_RESPONSE":
        return {
            "kind": workflow_kind,
            "title": "Rapid Response Workflow",
            "trigger_source": trigger_source,
            "priority": priority,
            "affected_target": target,
            "steps": [
                _step("Send zone-specific alert", "notification", "communications_ai", 20),
                _step("Dispatch response package", "dispatch", "resource_ai", 30),
                _step("Restrict adjacent corridor", "lockdown", "security_control", 30),
                _step("Begin tactical monitoring", "monitoring", "fusion_core", 25),
                _step("Record operational handoff", "handoff", "incident_command", 15),
            ],
        }

    if workflow_kind == "COMMS_RECOVERY":
        return {
            "kind": workflow_kind,
            "title": "Communications Recovery Workflow",
            "trigger_source": trigger_source,
            "priority": priority,
            "affected_target": target,
            "steps": [
                _step("Audit queued alerts", "audit", "communications_hub", 20),
                _step("Re-route high priority notifications", "notification", "communications_hub", 30),
                _step(
                    "Approve alternate delivery escalation",
                    "approval",
                    "communications_lead",
                    0,
                    True,
                    action_name="mass_alert_all",
                    required_role="commander_or_executive",
                ),
                _step("Notify executives of delivery risk", "notification", "executive_comms", 20),
                _step("Start queue recovery monitoring", "monitoring", "delivery_queue", 25),
            ],
        }

    if workflow_kind == "MUTUAL_AID":
        return {
            "kind": workflow_kind,
            "title": "Mutual Aid Escalation Workflow",
            "trigger_source": trigger_source,
            "priority": priority,
            "affected_target": target,
            "steps": [
                _step("Notify command leadership", "notification", "commander_ai", 20),
                _step(
                    "Approve mutual aid request",
                    "approval",
                    "executive_control",
                    0,
                    True,
                    action_name="mutual_aid",
                    required_role="executive",
                ),
                _step("Dispatch external support request", "escalation", "resource_ai", 25),
                _step("Coordinate staging handoff", "handoff", "logistics_control", 35),
                _step("Track mutual aid arrival", "monitoring", "operations_core", 20),
            ],
        }

    if workflow_kind == "GAS_LEAK_RESPONSE":
        return {
            "kind": workflow_kind,
            "title": "Gas Leak Containment Workflow",
            "trigger_source": trigger_source,
            "priority": priority,
            "affected_target": target,
            "steps": [
                _step("Evacuate affected zone", "notification", "communications_ai", 20),
                _step(
                    "Approve HVAC shutdown",
                    "approval",
                    "facility_control",
                    0,
                    True,
                    action_name="hvac_shutdown",
                    required_role="facility_admin",
                ),
                _step("Disable HVAC in affected sector", "handoff", "facility_control", 30),
                _step("Notify medical standby", "dispatch", "medical_control", 20),
                _step("Restrict corridor access", "lockdown", "security_control", 25),
                _step("Start air quality monitoring", "monitoring", "sensor_grid", 25),
            ],
        }

    if workflow_kind == "MASS_PANIC_RESPONSE":
        return {
            "kind": workflow_kind,
            "title": "Mass Panic Stabilization Workflow",
            "trigger_source": trigger_source,
            "priority": priority,
            "affected_target": target,
            "steps": [
                _step("Send crowd calming guidance", "notification", "communications_ai", 15),
                _step("Dispatch security teams", "dispatch", "resource_ai", 25),
                _step(
                    "Approve responder surge lane",
                    "approval",
                    "security_command",
                    0,
                    True,
                    action_name="door_unlock_global",
                    required_role="security_lead",
                ),
                _step("Create protected exit corridor", "lockdown", "security_control", 25),
                _step("Monitor crowd pressure", "monitoring", "sensor_grid", 20),
            ],
        }

    return {
        "kind": workflow_kind,
        "title": "Workflow Recovery Operation",
        "trigger_source": trigger_source,
        "priority": priority,
        "affected_target": target,
        "steps": [
            _step("Assess impacted systems", "audit", "operations_core", 20),
            _step("Restore degraded channels", "handoff", "platform_ops", 25),
            _step("Monitor recovery state", "monitoring", "operations_core", 20),
        ],
    }


def build_test_workflow_definition(scenario: str) -> WorkflowDefinition:
    mapping = {
        "critical_fire": ("CRISIS_LOCKDOWN", "Zone 3", "test:critical_fire", "critical"),
        "gas_leak": ("GAS_LEAK_RESPONSE", "Zone 2", "test:gas_leak", "high"),
        "mass_panic": ("MASS_PANIC_RESPONSE", "Zone 4", "test:mass_panic", "high"),
        "comms_failure": ("COMMS_RECOVERY", "Communications Grid", "test:comms_failure", "medium"),
    }
    workflow_kind, target, trigger_source, priority = mapping.get(
        scenario,
        ("RAPID_RESPONSE", "Zone 1", "test:rapid_response", "high"),
    )
    return build_workflow_definition(
        workflow_kind,
        target=target,
        trigger_source=trigger_source,
        priority=priority,
    )

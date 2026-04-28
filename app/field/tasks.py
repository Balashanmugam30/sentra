from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from app.agents.debate import get_live_debate_snapshot
from app.agents.optimizer import get_live_optimization_snapshot
from app.communications.roles import generate_role_communications
from app.field.responders import (
    get_responder_record,
    list_responder_records,
    set_responder_task,
    touch_responder,
)
from app.field.schemas import FieldTaskStatus, ResponderRole
from app.hardware.devices import build_live_hardware_snapshot
from app.models.incident import Incident
from app.operations.engine import emit_operation_event, get_live_operations_snapshot
from app.perception.fusion import generate_fusion_snapshot


@dataclass
class FieldTaskRecord:
    task_id: str
    source_key: str
    priority: str
    assigned_to: str | None
    role: ResponderRole
    zone: str
    title: str
    instructions: str
    eta_minutes: int
    route_hint: str
    status: FieldTaskStatus
    created_at: datetime
    note: str | None
    source_system: str


@dataclass
class BackupRequestRecord:
    request_id: str
    responder_id: str
    zone: str
    reason: str
    status: str
    created_at: datetime


@dataclass
class CheckpointRecord:
    responder_id: str
    zone: str
    checkpoint: str
    created_at: datetime


_task_counter = 100
_backup_counter = 100
_task_store: dict[str, FieldTaskRecord] = {}
_backup_requests: list[BackupRequestRecord] = []
_checkpoint_events: list[CheckpointRecord] = []


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _next_task_id() -> str:
    global _task_counter
    _task_counter += 1
    return f"TASK-{_task_counter}"


def _next_backup_id() -> str:
    global _backup_counter
    _backup_counter += 1
    return f"BCK-{_backup_counter}"


def _priority_rank(priority: str) -> int:
    return {"low": 0, "medium": 1, "high": 2, "critical": 3}.get(priority, 0)


def _route_hint(zone: str) -> str:
    return {
        "Zone 1": "North perimeter route",
        "Zone 2": "East suppression corridor",
        "Zone 3": "Central triage lane",
        "Zone 4": "South service stair",
        "Zone 5": "West containment loop",
    }.get(zone, "Primary command corridor")


def _role_for_resource(resource_type: str) -> ResponderRole:
    mapping = {
        "fire_teams": "firefighter",
        "medical_teams": "medical",
        "security_teams": "security",
        "ambulances": "medical",
        "drones": "supervisor",
        "logistics_units": "facility_staff",
    }
    return mapping.get(resource_type, "supervisor")


def _best_responder_for(role: ResponderRole, zone: str) -> str | None:
    responders = list_responder_records()
    exact = [
        responder
        for responder in responders
        if responder.role == role and responder.status in {"available", "assigned"}
    ]
    same_zone = [responder for responder in exact if responder.zone == zone]
    if same_zone:
        return sorted(same_zone, key=lambda item: item.responder_id)[0].responder_id
    if exact:
        return sorted(exact, key=lambda item: item.responder_id)[0].responder_id

    leaders = [
        responder
        for responder in responders
        if responder.role in {"supervisor", "commander"} and responder.status != "offline"
    ]
    if leaders:
        return sorted(leaders, key=lambda item: item.responder_id)[0].responder_id
    return None


def _open_tasks() -> list[FieldTaskRecord]:
    return [
        task
        for task in _task_store.values()
        if task.status != "completed"
    ]


def _make_task(
    *,
    source_key: str,
    priority: str,
    role: ResponderRole,
    zone: str,
    title: str,
    instructions: str,
    eta_minutes: int,
    route_hint: str,
    source_system: str,
) -> FieldTaskRecord:
    assigned_to = _best_responder_for(role, zone)
    task = FieldTaskRecord(
        task_id=_next_task_id(),
        source_key=source_key,
        priority=priority,
        assigned_to=assigned_to,
        role=role,
        zone=zone,
        title=title,
        instructions=instructions,
        eta_minutes=eta_minutes,
        route_hint=route_hint,
        status="pending",
        created_at=_now(),
        note=None,
        source_system=source_system,
    )
    if assigned_to is not None:
        responder = get_responder_record(assigned_to)
        if responder is not None and responder.active_task_id is None:
            set_responder_task(assigned_to, task_id=task.task_id, status="assigned", zone=zone)
    return task


def _upsert_generated_task(definition: dict[str, object]) -> None:
    source_key = str(definition["source_key"])
    existing = _task_store.get(source_key)
    if existing is not None:
        existing.priority = str(definition["priority"])
        existing.zone = str(definition["zone"])
        existing.title = str(definition["title"])
        existing.instructions = str(definition["instructions"])
        existing.eta_minutes = int(definition["eta_minutes"])
        existing.route_hint = str(definition["route_hint"])
        existing.source_system = str(definition["source_system"])
        if existing.assigned_to is None:
            existing.assigned_to = _best_responder_for(existing.role, existing.zone)
            if existing.assigned_to is not None:
                responder = get_responder_record(existing.assigned_to)
                if responder is not None and responder.active_task_id is None:
                    set_responder_task(
                        existing.assigned_to,
                        task_id=existing.task_id,
                        status="assigned",
                        zone=existing.zone,
                    )
        return

    _task_store[source_key] = _make_task(
        source_key=source_key,
        priority=str(definition["priority"]),
        role=definition["role"],
        zone=str(definition["zone"]),
        title=str(definition["title"]),
        instructions=str(definition["instructions"]),
        eta_minutes=int(definition["eta_minutes"]),
        route_hint=str(definition["route_hint"]),
        source_system=str(definition["source_system"]),
    )


def sync_field_tasks(incidents: list[Incident]) -> None:
    fusion = generate_fusion_snapshot(incidents)
    operations = get_live_operations_snapshot(incidents)
    optimization = get_live_optimization_snapshot(incidents)
    debate = get_live_debate_snapshot(incidents)
    role_messages = generate_role_communications(incidents)
    hardware = build_live_hardware_snapshot()

    generated: list[dict[str, object]] = []

    for incident in incidents:
        if incident.status != "active":
            continue

        if incident.type == "fire":
            generated.append(
                {
                    "source_key": f"incident:{incident.id}:firefighter",
                    "priority": "critical",
                    "role": "firefighter",
                    "zone": incident.location,
                    "title": f"{incident.location} fire suppression",
                    "instructions": f"Advance suppression line, confirm fire edge, and protect evacuation corridor near {incident.location}.",
                    "eta_minutes": 3,
                    "route_hint": _route_hint(incident.location),
                    "source_system": "perception_incident",
                }
            )
            generated.append(
                {
                    "source_key": f"incident:{incident.id}:medical",
                    "priority": "high",
                    "role": "medical",
                    "zone": incident.location,
                    "title": f"{incident.location} medical standby",
                    "instructions": f"Stage triage support and smoke exposure treatment outside {incident.location}.",
                    "eta_minutes": 4,
                    "route_hint": _route_hint(incident.location),
                    "source_system": "perception_incident",
                }
            )
        elif incident.type == "hazardous_gas":
            generated.append(
                {
                    "source_key": f"incident:{incident.id}:facility",
                    "priority": "critical",
                    "role": "facility_staff",
                    "zone": incident.location,
                    "title": f"{incident.location} HVAC isolation",
                    "instructions": f"Disable HVAC intake, verify gas sector isolation, and maintain safe venting around {incident.location}.",
                    "eta_minutes": 4,
                    "route_hint": _route_hint(incident.location),
                    "source_system": "perception_incident",
                }
            )
            generated.append(
                {
                    "source_key": f"incident:{incident.id}:medical",
                    "priority": "high",
                    "role": "medical",
                    "zone": incident.location,
                    "title": f"{incident.location} inhalation standby",
                    "instructions": f"Prepare oxygen support and casualty screening for gas exposure near {incident.location}.",
                    "eta_minutes": 5,
                    "route_hint": _route_hint(incident.location),
                    "source_system": "perception_incident",
                }
            )
        elif incident.type == "crowd_panic":
            generated.append(
                {
                    "source_key": f"incident:{incident.id}:security",
                    "priority": "high",
                    "role": "security",
                    "zone": incident.location,
                    "title": f"{incident.location} perimeter stabilization",
                    "instructions": f"Hold perimeter, keep evac corridor open, and reduce crowd compression in {incident.location}.",
                    "eta_minutes": 3,
                    "route_hint": _route_hint(incident.location),
                    "source_system": "perception_incident",
                }
            )

    for workflow in operations["workflows"]:
        if workflow["status"] in {"completed", "cancelled", "failed"}:
            continue
        zone = str(workflow["affected_target"])
        if workflow["title"].lower().startswith("rapid response"):
            generated.append(
                {
                    "source_key": f"workflow:{workflow['workflow_id']}:firefighter",
                    "priority": workflow["priority"],
                    "role": "firefighter",
                    "zone": zone,
                    "title": f"{zone} rapid response dispatch",
                    "instructions": f"Execute workflow-linked suppression dispatch and confirm scene stabilization for {zone}.",
                    "eta_minutes": 4,
                    "route_hint": _route_hint(zone),
                    "source_system": "operations",
                }
            )
        if "lockdown" in workflow["title"].lower():
            generated.append(
                {
                    "source_key": f"workflow:{workflow['workflow_id']}:security",
                    "priority": workflow["priority"],
                    "role": "security",
                    "zone": zone,
                    "title": f"{zone} lockdown control",
                    "instructions": f"Secure corridor access, protect med route, and enforce controlled movement in {zone}.",
                    "eta_minutes": 5,
                    "route_hint": _route_hint(zone),
                    "source_system": "operations",
                }
            )
        if "mutual aid" in workflow["title"].lower():
            generated.append(
                {
                    "source_key": f"workflow:{workflow['workflow_id']}:supervisor",
                    "priority": "critical",
                    "role": "supervisor",
                    "zone": zone,
                    "title": f"{zone} mutual aid staging",
                    "instructions": f"Prepare incoming aid handoff point and preserve reserve lanes near {zone}.",
                    "eta_minutes": 6,
                    "route_hint": _route_hint(zone),
                    "source_system": "operations",
                }
            )

    for allocation in optimization["allocations"][:6]:
        resource_type = str(allocation["resource_type"])
        role = _role_for_resource(resource_type)
        generated.append(
            {
                "source_key": f"allocation:{optimization['plan_id']}:{allocation['zone']}:{resource_type}",
                "priority": "critical" if int(allocation["impact_score"]) >= 85 else "high",
                "role": role,
                "zone": str(allocation["zone"]),
                "title": f"{allocation['zone']} {resource_type.replace('_', ' ')} deployment",
                "instructions": str(allocation["rationale"]),
                "eta_minutes": int(allocation["eta_minutes"]),
                "route_hint": _route_hint(str(allocation["zone"])),
                "source_system": "optimizer",
            }
        )

    for message in role_messages["messages"]:
        if message.role not in {"responders", "medical", "security", "facility_staff"}:
            continue
        role = {
            "responders": "firefighter",
            "medical": "medical",
            "security": "security",
            "facility_staff": "facility_staff",
        }[message.role]
        generated.append(
            {
                "source_key": f"role:{message.role}:{message.zone}:{message.title}",
                "priority": message.priority,
                "role": role,
                "zone": message.zone,
                "title": message.title,
                "instructions": message.message,
                "eta_minutes": 5 if message.priority in {"critical", "high"} else 8,
                "route_hint": _route_hint(message.zone),
                "source_system": "communications",
            }
        )

    for device in hardware["top_devices"]:
        if not device["latest_alert"]:
            continue
        generated.append(
            {
                "source_key": f"hardware:{device['device_id']}:{device['latest_alert']}",
                "priority": "high" if "fire" not in str(device["latest_alert"]).lower() else "critical",
                "role": "facility_staff",
                "zone": device["zone"],
                "title": f"{device['zone']} hardware verification",
                "instructions": f"Inspect {device['device_id']} and confirm sensor alert: {device['latest_alert']}.",
                "eta_minutes": 6,
                "route_hint": _route_hint(str(device["zone"])),
                "source_system": "hardware",
            }
        )

    if debate["final_plan"]:
        top_zone = fusion["zones"][0].zone if fusion["zones"] else "Zone 1"
        generated.append(
            {
                "source_key": f"debate:{top_zone}:{debate['consensus_score']}",
                "priority": "high" if debate["consensus_score"] >= 60 else "critical",
                "role": "commander",
                "zone": top_zone,
                "title": f"{top_zone} consensus execution",
                "instructions": str(debate["final_plan"][0]),
                "eta_minutes": 5,
                "route_hint": _route_hint(top_zone),
                "source_system": "debate",
            }
        )

    for definition in generated:
        _upsert_generated_task(definition)


def build_tasks_snapshot(incidents: list[Incident]) -> list[dict[str, object]]:
    sync_field_tasks(incidents)
    tasks = sorted(
        _open_tasks(),
        key=lambda item: (-_priority_rank(item.priority), item.eta_minutes, item.created_at, item.task_id),
    )
    return [
        {
            "task_id": task.task_id,
            "priority": task.priority,
            "assigned_to": task.assigned_to,
            "role": task.role,
            "zone": task.zone,
            "title": task.title,
            "instructions": task.instructions,
            "eta_minutes": task.eta_minutes,
            "route_hint": task.route_hint,
            "status": task.status,
            "created_at": task.created_at,
            "note": task.note,
            "source_system": task.source_system,
        }
        for task in tasks
    ]


def _find_task(task_id: str) -> FieldTaskRecord | None:
    return next((item for item in _task_store.values() if item.task_id == task_id), None)


def acknowledge_field_task(task_id: str, responder_id: str, incidents: list[Incident]) -> dict[str, object]:
    sync_field_tasks(incidents)
    task = _find_task(task_id)
    if task is None:
        raise ValueError(f"Task '{task_id}' not found")
    responder = touch_responder(responder_id, zone=task.zone)
    task.assigned_to = responder.responder_id
    task.status = "acknowledged"
    set_responder_task(responder.responder_id, task_id=task.task_id, status="assigned", zone=task.zone)
    return _task_dict(task)


def update_field_task_status(
    task_id: str,
    responder_id: str,
    status: FieldTaskStatus,
    note: str | None,
    incidents: list[Incident],
) -> dict[str, object]:
    sync_field_tasks(incidents)
    task = _find_task(task_id)
    if task is None:
        raise ValueError(f"Task '{task_id}' not found")
    responder = touch_responder(responder_id, zone=task.zone)
    task.assigned_to = responder.responder_id
    task.status = status
    task.note = note
    responder_status = {
        "acknowledged": "assigned",
        "enroute": "enroute",
        "arrived": "active",
        "active": "active",
        "blocked": "blocked",
        "completed": "available",
    }[status]
    set_responder_task(
        responder.responder_id,
        task_id=None if status == "completed" else task.task_id,
        status=responder_status,
        zone=task.zone,
    )
    return _task_dict(task)


def open_backup_request(
    responder_id: str,
    zone: str,
    reason: str,
    incidents: list[Incident],
) -> dict[str, object]:
    touch_responder(responder_id, zone=zone)
    record = BackupRequestRecord(
        request_id=_next_backup_id(),
        responder_id=responder_id,
        zone=zone,
        reason=reason,
        status="open",
        created_at=_now(),
    )
    _backup_requests.insert(0, record)
    del _backup_requests[20:]
    emit_operation_event(
        "field.backup_requested",
        {
            "request_id": record.request_id,
            "responder_id": responder_id,
            "zone": zone,
            "reason": reason,
        },
    )
    _upsert_generated_task(
        {
            "source_key": f"backup:{record.request_id}",
            "priority": "critical",
            "role": "supervisor",
            "zone": zone,
            "title": f"{zone} backup coordination",
            "instructions": f"Respond to backup request from {responder_id}: {reason}",
            "eta_minutes": 4,
            "route_hint": _route_hint(zone),
            "source_system": "field_backup",
        }
    )
    sync_field_tasks(incidents)
    return {
        "request_id": record.request_id,
        "open_requests": len([item for item in _backup_requests if item.status == "open"]),
    }


def record_field_checkpoint(
    responder_id: str,
    zone: str,
    checkpoint: str,
    incidents: list[Incident],
) -> dict[str, object]:
    responder = touch_responder(responder_id, zone=zone)
    _checkpoint_events.insert(
        0,
        CheckpointRecord(
            responder_id=responder.responder_id,
            zone=zone,
            checkpoint=checkpoint,
            created_at=_now(),
        ),
    )
    del _checkpoint_events[30:]
    updated = False
    if responder.active_task_id is not None:
        task = _find_task(responder.active_task_id)
        if task is not None and task.zone == zone and task.status in {"pending", "acknowledged", "enroute"}:
            task.status = "arrived"
            task.note = f"Checkpoint verified at {checkpoint}"
            set_responder_task(responder.responder_id, task_id=task.task_id, status="active", zone=zone)
            updated = True

    sync_field_tasks(incidents)
    return {"checkpoint": checkpoint, "task_updated": updated}


def list_open_backup_requests() -> list[BackupRequestRecord]:
    return [item for item in _backup_requests if item.status == "open"]


def _task_dict(task: FieldTaskRecord) -> dict[str, object]:
    return {
        "task_id": task.task_id,
        "priority": task.priority,
        "assigned_to": task.assigned_to,
        "role": task.role,
        "zone": task.zone,
        "title": task.title,
        "instructions": task.instructions,
        "eta_minutes": task.eta_minutes,
        "route_hint": task.route_hint,
        "status": task.status,
        "created_at": task.created_at,
        "note": task.note,
        "source_system": task.source_system,
    }


def build_field_live_snapshot(incidents: list[Incident]) -> dict[str, object]:
    responders = list_responder_records()
    real_responders = list_responder_records(include_demo_fallback=False)
    tasks = build_tasks_snapshot(incidents)
    backup_requests = list_open_backup_requests()
    online_responders = sum(1 for responder in responders if responder.status != "offline")
    offline_responders = len(responders) - online_responders
    tasks_pending = sum(1 for task in tasks if task["status"] in {"pending", "acknowledged"})
    tasks_active = sum(1 for task in tasks if task["status"] in {"enroute", "arrived", "active", "blocked"})
    zones_covered = len(
        {
            responder.zone
            for responder in responders
            if responder.status != "offline"
        }
    )

    if any(task["priority"] == "critical" and task["status"] in {"pending", "blocked"} for task in tasks) or len(backup_requests) >= 2:
        global_state = "critical"
    elif tasks_active >= 4 or len(backup_requests) >= 1:
        global_state = "overloaded"
    elif tasks_active > 0:
        global_state = "active_response"
    elif tasks_pending > 0:
        global_state = "mobilizing"
    else:
        global_state = "normal"

    recommended_actions: list[str] = []
    if not real_responders:
        recommended_actions.append("Register at least one field responder to convert demo dispatch into live execution")
    if any(task["assigned_to"] is None and task["priority"] in {"high", "critical"} for task in tasks):
        recommended_actions.append("Assign critical unclaimed missions to active responders immediately")
    if backup_requests:
        recommended_actions.append(f"Escalate {backup_requests[0].zone} backup request through supervisor channel")
    if not recommended_actions:
        recommended_actions.append("Field network stable; continue mobile task tracking and checkpoint sweeps")

    summary = (
        f"{online_responders} responders online, {tasks_pending + tasks_active} live missions, "
        f"and {len(backup_requests)} backup requests open across {zones_covered} covered zones."
    )
    return {
        "global_field_state": global_state,
        "online_responders": online_responders,
        "offline_responders": offline_responders,
        "tasks_pending": tasks_pending,
        "tasks_active": tasks_active,
        "backup_requests_open": len(backup_requests),
        "zones_covered": zones_covered,
        "recommended_actions": recommended_actions[:4],
        "summary": summary,
    }

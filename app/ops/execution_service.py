from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ops.execution_store import ops_execution_store


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso() -> str:
    return _now().isoformat()


SCENARIOS: dict[str, dict[str, Any]] = {
    "hotel_kitchen_fire": {
        "incident_id": "INC-OPS-001",
        "title": "Hotel kitchen fire",
        "building": "Grand Meridian Hotel",
        "zone": "Kitchen Zone B",
        "severity": "critical",
        "workflow": "fire",
        "recovery_eta": "22 min",
    },
    "basement_leak": {
        "incident_id": "INC-OPS-002",
        "title": "Basement gas leak",
        "building": "Grand Meridian Hotel",
        "zone": "Basement generator bay",
        "severity": "high",
        "workflow": "gas_leak",
        "recovery_eta": "31 min",
    },
    "crowd_panic": {
        "incident_id": "INC-OPS-003",
        "title": "Crowd panic at atrium",
        "building": "Metro Mall",
        "zone": "Main atrium",
        "severity": "high",
        "workflow": "crowd_panic",
        "recovery_eta": "18 min",
    },
    "icu_oxygen_issue": {
        "incident_id": "INC-OPS-004",
        "title": "ICU oxygen issue",
        "building": "Bala Hospital",
        "zone": "ICU oxygen manifold",
        "severity": "critical",
        "workflow": "medical_emergency",
        "recovery_eta": "26 min",
    },
    "dual_incident_chain": {
        "incident_id": "INC-OPS-005",
        "title": "Dual incident chain",
        "building": "Bala University",
        "zone": "Engineering block + command network",
        "severity": "critical",
        "workflow": "cyber_physical",
        "recovery_eta": "42 min",
    },
}


WORKFLOW_TASKS: dict[str, list[dict[str, Any]]] = {
    "fire": [
        {"title": "Verify source", "role": "Security", "owner": "Security Bravo", "sla": 4, "eta": "2 min", "status": "completed", "confidence": 95, "dependencies": []},
        {"title": "Dispatch responders", "role": "Security", "owner": "Ops Alpha", "sla": 3, "eta": "1 min", "status": "running", "confidence": 93, "dependencies": ["verify source"]},
        {"title": "Unlock exits", "role": "Facilities", "owner": "Facilities Lead", "sla": 5, "eta": "3 min", "status": "running", "confidence": 91, "dependencies": []},
        {"title": "Start evacuation", "role": "Comms", "owner": "Comms Desk", "sla": 6, "eta": "4 min", "status": "awaiting_approval", "confidence": 88, "dependencies": ["unlock exits"]},
        {"title": "Notify leadership", "role": "Executive", "owner": "Executive Liaison", "sla": 8, "eta": "5 min", "status": "queued", "confidence": 86, "dependencies": []},
        {"title": "Containment verify", "role": "External", "owner": "Fire Unit 4", "sla": 15, "eta": "12 min", "status": "blocked", "confidence": 79, "dependencies": ["dispatch responders"]},
        {"title": "Close after audit", "role": "Executive", "owner": "Ops Commander", "sla": 30, "eta": "22 min", "status": "queued", "confidence": 82, "dependencies": ["containment verify"]},
    ],
    "gas_leak": [
        {"title": "Isolate zone", "role": "Security", "owner": "Security Bravo", "sla": 4, "eta": "2 min", "status": "running", "confidence": 91, "dependencies": []},
        {"title": "Shut HVAC", "role": "Facilities", "owner": "Facilities Lead", "sla": 5, "eta": "3 min", "status": "running", "confidence": 89, "dependencies": ["isolate zone"]},
        {"title": "Evacuate sector", "role": "Comms", "owner": "Comms Desk", "sla": 7, "eta": "5 min", "status": "awaiting_approval", "confidence": 86, "dependencies": ["shut HVAC"]},
        {"title": "Dispatch hazmat", "role": "External", "owner": "Hazmat Unit 1", "sla": 12, "eta": "9 min", "status": "queued", "confidence": 82, "dependencies": []},
        {"title": "Air quality verify", "role": "Facilities", "owner": "Sensor Ops", "sla": 20, "eta": "17 min", "status": "queued", "confidence": 88, "dependencies": ["dispatch hazmat"]},
    ],
    "medical_emergency": [
        {"title": "Dispatch medic", "role": "Medical", "owner": "Medical Unit 2", "sla": 3, "eta": "1 min", "status": "running", "confidence": 96, "dependencies": []},
        {"title": "Clear corridor", "role": "Security", "owner": "Security Bravo", "sla": 5, "eta": "3 min", "status": "running", "confidence": 90, "dependencies": []},
        {"title": "Elevator priority", "role": "Facilities", "owner": "Facilities Lead", "sla": 4, "eta": "2 min", "status": "awaiting_approval", "confidence": 87, "dependencies": []},
        {"title": "Notify hospital admin", "role": "Executive", "owner": "Executive Liaison", "sla": 8, "eta": "5 min", "status": "queued", "confidence": 88, "dependencies": ["dispatch medic"]},
    ],
    "crowd_panic": [
        {"title": "Open guided exit lanes", "role": "Security", "owner": "Security Bravo", "sla": 4, "eta": "2 min", "status": "running", "confidence": 92, "dependencies": []},
        {"title": "Slow inflow", "role": "Security", "owner": "Ops Alpha", "sla": 5, "eta": "3 min", "status": "running", "confidence": 89, "dependencies": []},
        {"title": "Public calm message", "role": "Comms", "owner": "Comms Desk", "sla": 5, "eta": "3 min", "status": "awaiting_approval", "confidence": 86, "dependencies": []},
        {"title": "Medical standby lane", "role": "Medical", "owner": "Medical Unit 2", "sla": 8, "eta": "6 min", "status": "queued", "confidence": 84, "dependencies": ["open guided exit lanes"]},
    ],
    "cyber_physical": [
        {"title": "Lock systems", "role": "Facilities", "owner": "Facilities Lead", "sla": 4, "eta": "2 min", "status": "running", "confidence": 88, "dependencies": []},
        {"title": "Isolate network", "role": "Security", "owner": "Cyber Desk", "sla": 5, "eta": "3 min", "status": "running", "confidence": 91, "dependencies": []},
        {"title": "Security dispatch", "role": "Security", "owner": "Security Bravo", "sla": 6, "eta": "4 min", "status": "blocked", "confidence": 79, "dependencies": ["isolate network"]},
        {"title": "Executive escalation", "role": "Executive", "owner": "Executive Liaison", "sla": 8, "eta": "5 min", "status": "awaiting_approval", "confidence": 86, "dependencies": []},
    ],
}


TEAMS: list[dict[str, Any]] = [
    {"department": "Security", "capacity": 14, "load": 9, "readiness": 91, "lead": "Security Bravo", "status": "active"},
    {"department": "Medical", "capacity": 8, "load": 5, "readiness": 88, "lead": "Medical Unit 2", "status": "active"},
    {"department": "Facilities", "capacity": 10, "load": 7, "readiness": 86, "lead": "Facilities Lead", "status": "active"},
    {"department": "Comms", "capacity": 6, "load": 3, "readiness": 93, "lead": "Comms Desk", "status": "ready"},
    {"department": "Executive", "capacity": 4, "load": 2, "readiness": 89, "lead": "Executive Liaison", "status": "ready"},
    {"department": "External Responders", "capacity": 12, "load": 6, "readiness": 84, "lead": "Fire Unit 4", "status": "en route"},
]


def list_scenarios() -> list[dict[str, str]]:
    return [{"scenario_id": key, "label": value["title"]} for key, value in SCENARIOS.items()]


def _task_id(scenario: str, index: int) -> str:
    return f"TASK-{scenario.upper().replace('_', '-')}-{index + 1:02d}"


def _build_tasks(scenario: str, state: dict[str, Any]) -> list[dict[str, Any]]:
    incident = SCENARIOS.get(scenario, SCENARIOS["hotel_kitchen_fire"])
    templates = WORKFLOW_TASKS[str(incident["workflow"])]
    tasks: list[dict[str, Any]] = []
    for index, template in enumerate(templates):
        task_id = _task_id(scenario, index)
        status = str(template["status"])
        if task_id in state["paused_tasks"]:
            status = "blocked"
        if task_id in state["approved_tasks"] and status == "awaiting_approval":
            status = "running"
        if task_id in state["approved_tasks"] and template["title"] in {"Close after audit", "Air quality verify"}:
            status = "completed"
        owner = state["reassigned_tasks"].get(task_id, template["owner"])
        sla_minutes = int(template["sla"])
        elapsed = min(sla_minutes + 3, index * 2 + 2)
        breached = elapsed > sla_minutes and status not in {"completed", "queued"}
        tasks.append(
            {
                "task_id": task_id,
                "title": template["title"],
                "role": template["role"],
                "owner": owner,
                "eta": template["eta"],
                "sla_minutes": sla_minutes,
                "elapsed_minutes": elapsed,
                "sla_status": "breached" if breached else "watch" if elapsed >= sla_minutes - 1 else "healthy",
                "status": status,
                "dependencies": template["dependencies"],
                "confidence": template["confidence"],
                "notes": f"Auto-assigned by role, location, workload, and {incident['severity']} urgency.",
            }
        )
    return tasks


def _workflow_queue(scenario: str, tasks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    incident = SCENARIOS.get(scenario, SCENARIOS["hotel_kitchen_fire"])
    complete = len([task for task in tasks if task["status"] == "completed"])
    return [
        {
            "workflow_id": f"WF-{scenario.upper().replace('_', '-')}",
            "name": str(incident["workflow"]).replace("_", " ").title(),
            "incident_id": incident["incident_id"],
            "scenario": scenario,
            "status": "active",
            "progress": round(complete / max(1, len(tasks)) * 100),
            "tasks_total": len(tasks),
            "tasks_completed": complete,
            "owner": "Ops Alpha",
            "started_at": _iso(),
        }
    ]


def _sla_timers(tasks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "task_id": task["task_id"],
            "title": task["title"],
            "owner": task["owner"],
            "remaining_minutes": max(0, int(task["sla_minutes"]) - int(task["elapsed_minutes"])),
            "sla_status": task["sla_status"],
            "escalation_level": 1 if task["sla_status"] == "breached" else 0,
        }
        for task in tasks
    ]


def _blockers(tasks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "blocker_id": f"BLK-{task['task_id']}",
            "task_id": task["task_id"],
            "title": f"{task['title']} blocked",
            "risk": "SLA breach may delay incident resolution",
            "owner": task["owner"],
            "recommended_action": "Reassign backup team and notify leadership",
        }
        for task in tasks
        if task["status"] == "blocked"
    ]


def _escalations(tasks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "escalation_id": f"ESC-{task['task_id']}",
            "level": 1 if task["sla_status"] == "breached" else 0,
            "task_id": task["task_id"],
            "title": task["title"],
            "action": "Notify leadership and trigger backup team" if task["sla_status"] == "breached" else "Monitor",
            "owner": task["owner"],
        }
        for task in tasks
        if task["sla_status"] in {"breached", "watch"}
    ]


def _approvals(tasks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "approval_id": f"APR-{task['task_id']}",
            "task_id": task["task_id"],
            "title": task["title"],
            "owner": task["owner"],
            "risk_score": 72 if task["status"] == "awaiting_approval" else 44,
            "recommendation": "Approve to continue governed workflow",
        }
        for task in tasks
        if task["status"] == "awaiting_approval"
    ]


def _active_incidents(scenario: str, state: dict[str, Any]) -> list[dict[str, Any]]:
    incident = dict(SCENARIOS.get(scenario, SCENARIOS["hotel_kitchen_fire"]))
    incident["status"] = "closed" if incident["incident_id"] in state["closed_incidents"] else "active"
    incident["confidence"] = 91
    return [incident]


def _resolution_ledger(state: dict[str, Any]) -> list[dict[str, Any]]:
    base = [
        {
            "timestamp": _iso(),
            "event": "Incident verification gates active",
            "detail": "Closure requires hazards cleared, tasks complete, human approval, audit trail, and confidence >= 85.",
            "status": "pending",
        }
    ]
    return [*state["ledger"], *base][-12:]


def build_execution_snapshot() -> dict[str, Any]:
    state = ops_execution_store.get_state()
    scenario = str(state["scenario"])
    tasks = _build_tasks(scenario, state)
    incidents = _active_incidents(scenario, state)
    completed = len([task for task in tasks if task["status"] == "completed"])
    running = len([task for task in tasks if task["status"] == "running"])
    breached = len([task for task in tasks if task["sla_status"] == "breached"])
    approvals = _approvals(tasks)
    progress = round(completed / max(1, len(tasks)) * 100)
    return {
        "generated_at": _now(),
        "mode": "demo",
        "scenarios": list_scenarios(),
        "active_incidents": incidents,
        "workflow_queue": _workflow_queue(scenario, tasks),
        "tasks": tasks,
        "task_board": {
            "queued": [task for task in tasks if task["status"] == "queued"],
            "running": [task for task in tasks if task["status"] == "running"],
            "blocked": [task for task in tasks if task["status"] == "blocked"],
            "awaiting_approval": [task for task in tasks if task["status"] == "awaiting_approval"],
            "completed": [task for task in tasks if task["status"] == "completed"],
        },
        "sla_timers": _sla_timers(tasks),
        "teams": TEAMS,
        "blockers": _blockers(tasks),
        "escalation_queue": _escalations(tasks),
        "approval_center": approvals,
        "completion": {
            "progress": progress,
            "tasks_completed": completed,
            "tasks_total": len(tasks),
            "resolution_confidence": 86 + min(9, completed * 2),
        },
        "governance": {
            "mode": state["governance_mode"],
            "available_modes": ["advisory", "approval_required", "semi_auto", "full_auto"],
            "actions": ["approve_workflow", "pause_workflow", "reject_task", "manual_override", "reassign_owner"],
        },
        "resolution_ledger": _resolution_ledger(state),
        "executive_summary": {
            "incidents_active": len([incident for incident in incidents if incident["status"] == "active"]),
            "avg_response_time": "6m 40s",
            "tasks_completed": completed,
            "sla_success": f"{round((len(tasks) - breached) / max(1, len(tasks)) * 100)}%",
            "estimated_losses_avoided": "$480K",
            "recovery_eta": incidents[0]["recovery_eta"],
            "running_tasks": running,
        },
    }


def run_execution_workflow(scenario: str | None = None) -> dict[str, Any]:
    selected = scenario if scenario in SCENARIOS else "hotel_kitchen_fire"
    ops_execution_store.set_scenario(selected)
    return build_execution_snapshot()


def approve_task(task_id: str) -> dict[str, Any]:
    ops_execution_store.approve_task(task_id)
    return build_execution_snapshot()


def reassign_task(task_id: str, owner: str) -> dict[str, Any]:
    ops_execution_store.reassign_task(task_id, owner)
    return build_execution_snapshot()


def pause_task(task_id: str) -> dict[str, Any]:
    ops_execution_store.pause_task(task_id)
    return build_execution_snapshot()


def close_incident(incident_id: str) -> dict[str, Any]:
    snapshot = build_execution_snapshot()
    tasks = snapshot["tasks"]
    hazards_cleared = not snapshot["blockers"]
    tasks_ready = all(task["status"] in {"completed", "running"} for task in tasks if task["title"] != "Close after audit")
    confidence_ok = int(snapshot["completion"]["resolution_confidence"]) >= 85
    approved = not snapshot["approval_center"]
    eligible = hazards_cleared and tasks_ready and confidence_ok and approved
    if eligible:
        ops_execution_store.close_incident(incident_id)
        snapshot = build_execution_snapshot()
    snapshot["close_result"] = {
        "incident_id": incident_id,
        "closed": eligible,
        "gates": {
            "hazards_cleared": hazards_cleared,
            "tasks_complete_or_running": tasks_ready,
            "human_approved": approved,
            "audit_trail_stored": True,
            "confidence_acceptable": confidence_ok,
        },
    }
    return snapshot

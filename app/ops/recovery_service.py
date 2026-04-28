from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ops.recovery_store import ops_recovery_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


SCENARIOS: list[dict[str, str]] = [
    {"scenario_id": "hotel_fire_recovery", "label": "Hotel fire recovery"},
    {"scenario_id": "hospital_incident", "label": "Hospital incident"},
    {"scenario_id": "mall_surge", "label": "Mall surge recovery"},
]


WORKFLOWS: dict[str, list[dict[str, Any]]] = {
    "hotel_fire_recovery": [
      {"task_id": "REC-FLOOR-CLEAR", "title": "Clear floor", "owner": "Security Bravo", "stage": "hazard_clearance", "status": "running", "progress": 74, "approval_required": False},
      {"task_id": "REC-HVAC", "title": "HVAC inspect", "owner": "Facilities Rapid Team", "stage": "utilities_restore", "status": "running", "progress": 61, "approval_required": False},
      {"task_id": "REC-WATER", "title": "Water cleanup", "owner": "Vendor RestorePro", "stage": "vendor_coordination", "status": "queued", "progress": 24, "approval_required": False},
      {"task_id": "REC-ROOM-WAVE", "title": "Room reopen waves", "owner": "Executive Liaison", "stage": "reopen_checklist", "status": "awaiting_approval", "progress": 35, "approval_required": True},
      {"task_id": "REC-GUEST", "title": "Guest relocation", "owner": "Guest Services", "stage": "occupancy_return", "status": "running", "progress": 82, "approval_required": False},
      {"task_id": "REC-REFUND", "title": "Refund ops", "owner": "Finance Desk", "stage": "insurance_tasks", "status": "queued", "progress": 18, "approval_required": False},
      {"task_id": "REC-PR", "title": "PR brief", "owner": "Comms Desk", "stage": "compliance_checks", "status": "awaiting_approval", "progress": 45, "approval_required": True},
    ],
    "hospital_incident": [
      {"task_id": "REC-STERILE", "title": "Sterile reset", "owner": "Hospital Ops", "stage": "hazard_clearance", "status": "running", "progress": 68, "approval_required": False},
      {"task_id": "REC-OXYGEN", "title": "Oxygen audit", "owner": "Facilities Rapid Team", "stage": "utilities_restore", "status": "running", "progress": 59, "approval_required": False},
      {"task_id": "REC-WARD", "title": "Ward reopen sequence", "owner": "Hospital Admin", "stage": "reopen_checklist", "status": "awaiting_approval", "progress": 41, "approval_required": True},
    ],
    "mall_surge": [
      {"task_id": "REC-STOREFRONT", "title": "Storefront restore", "owner": "Tenant Ops", "stage": "damage_assessment", "status": "running", "progress": 71, "approval_required": False},
      {"task_id": "REC-BARRIERS", "title": "Crowd barriers reset", "owner": "Security Bravo", "stage": "hazard_clearance", "status": "running", "progress": 78, "approval_required": False},
      {"task_id": "REC-TENANT", "title": "Tenant reopen staging", "owner": "Mall GM", "stage": "occupancy_return", "status": "awaiting_approval", "progress": 49, "approval_required": True},
    ],
}


VENDORS: list[dict[str, Any]] = [
    {"vendor_id": "vendor_restorepro", "name": "RestorePro Water Cleanup", "scope": "water cleanup", "eta": "42 min", "status": "mobilized", "confidence": 91},
    {"vendor_id": "vendor_airsafe", "name": "AirSafe HVAC", "scope": "HVAC inspection", "eta": "25 min", "status": "on site", "confidence": 94},
    {"vendor_id": "vendor_claimsure", "name": "ClaimSure Adjusters", "scope": "insurance evidence", "eta": "2h 10m", "status": "scheduled", "confidence": 87},
]


def _tasks(state: dict[str, Any]) -> list[dict[str, Any]]:
    scenario = str(state["scenario"])
    approved = state["approved_gates"]
    tasks = []
    for task in WORKFLOWS.get(scenario, WORKFLOWS["hotel_fire_recovery"]):
        item = dict(task)
        if item["task_id"] in approved and item["status"] == "awaiting_approval":
            item["status"] = "running"
            item["progress"] = max(int(item["progress"]), 67)
        tasks.append(item)
    return tasks


def _checklist(tasks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    gates = [
        {"gate_id": "REOPEN-ZONE", "title": "Zone reopen", "required_for": "Affected floor", "risk": "medium"},
        {"gate_id": "REOPEN-BUILDING", "title": "Full building reopen", "required_for": "Executive reopening", "risk": "high"},
        {"gate_id": "REOPEN-OCCUPANCY", "title": "Occupancy threshold", "required_for": "Guest return waves", "risk": "high"},
        {"gate_id": "REOPEN-STATEMENT", "title": "Public statement release", "required_for": "External communications", "risk": "medium"},
    ]
    awaiting = {task["task_id"] for task in tasks if task["status"] == "awaiting_approval"}
    return [
        {
            **gate,
            "status": "blocked" if gate["gate_id"] == "REOPEN-BUILDING" and awaiting else "ready",
            "evidence": "Hazard, utility, compliance, and executive approval evidence attached.",
        }
        for gate in gates
    ]


def build_recovery_snapshot() -> dict[str, Any]:
    state = ops_recovery_store.get_state()
    tasks = _tasks(state)
    checklist = _checklist(tasks)
    progress = round(sum(int(task["progress"]) for task in tasks) / max(1, len(tasks)))
    return {
        "generated_at": _now_iso(),
        "mode": "demo",
        "scenario": state["scenario"],
        "scenarios": SCENARIOS,
        "damage_assessment": [
            {"area": "Kitchen Zone B", "damage": "smoke + suppression water", "severity": "high", "estimated_loss": "$180K", "clearance_eta": "4h"},
            {"area": "Floor 3 East corridor", "damage": "light smoke exposure", "severity": "medium", "estimated_loss": "$42K", "clearance_eta": "90m"},
            {"area": "Lobby", "damage": "none", "severity": "low", "estimated_loss": "$0", "clearance_eta": "open"},
        ],
        "tasks": tasks,
        "hazard_clearance": [task for task in tasks if task["stage"] == "hazard_clearance"],
        "utilities_restore": [task for task in tasks if task["stage"] == "utilities_restore"],
        "compliance_checks": [task for task in tasks if task["stage"] == "compliance_checks"],
        "reopen_checklist": checklist,
        "insurance_tasks": [task for task in tasks if task["stage"] == "insurance_tasks"],
        "vendor_coordination": VENDORS,
        "occupancy_return_plan": [
            {"wave": "Wave 1", "scope": "Lobby and unaffected public zones", "capacity": 380, "eta": "45 min", "status": "ready"},
            {"wave": "Wave 2", "scope": "Floor 1-2 guest rooms", "capacity": 620, "eta": "2h", "status": "pending utilities"},
            {"wave": "Wave 3", "scope": "Floor 3 partial reopen", "capacity": 220, "eta": "6h", "status": "governance required"},
        ],
        "ledger": state["ledger"],
        "kpis": {
            "time_to_contain": "18 min",
            "time_to_reopen": "6h 20m",
            "losses_reduced": "$1.2M",
            "continuity_score": 94,
            "readiness_score": 92,
            "recovery_progress": progress,
            "rooms_reopenable": 1420,
            "vendors_active": len(VENDORS),
        },
        "summary": {
            "active_tasks": len([task for task in tasks if task["status"] != "completed"]),
            "awaiting_approval": len([task for task in tasks if task["status"] == "awaiting_approval"]),
            "reopen_gates_ready": len([item for item in checklist if item["status"] == "ready"]),
            "progress": progress,
        },
    }


def run_recovery(scenario: str | None = None) -> dict[str, Any]:
    selected = scenario if scenario in WORKFLOWS else "hotel_fire_recovery"
    ops_recovery_store.run(selected)
    return build_recovery_snapshot()


def approve_recovery(gate_id: str) -> dict[str, Any]:
    ops_recovery_store.approve(gate_id)
    return build_recovery_snapshot()


def get_recovery_tasks() -> dict[str, Any]:
    snapshot = build_recovery_snapshot()
    return {"generated_at": snapshot["generated_at"], "tasks": snapshot["tasks"], "reopen_checklist": snapshot["reopen_checklist"]}


def get_recovery_kpis() -> dict[str, Any]:
    snapshot = build_recovery_snapshot()
    return {"generated_at": snapshot["generated_at"], "kpis": snapshot["kpis"], "summary": snapshot["summary"]}

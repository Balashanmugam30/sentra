from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ops.resources_store import ops_resources_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


INCIDENTS: list[dict[str, Any]] = [
    {"incident_id": "INC-RES-001", "title": "Kitchen Zone B fire", "building": "Grand Meridian Hotel", "zone": "Kitchen Zone B", "severity": "critical", "required_skill": "fire", "urgency": 96},
    {"incident_id": "INC-RES-002", "title": "Floor 3 trapped cluster", "building": "Grand Meridian Hotel", "zone": "Floor 3 West", "severity": "high", "required_skill": "rescue", "urgency": 89},
    {"incident_id": "INC-RES-003", "title": "Basement gas leak", "building": "Grand Meridian Hotel", "zone": "Basement generator bay", "severity": "critical", "required_skill": "hazmat", "urgency": 94},
]


TEAMS: list[dict[str, Any]] = [
    {"unit_id": "fire_alpha", "name": "Fire Team Alpha", "skills": ["fire", "rescue"], "location": "Service corridor east", "availability": "available", "workload": 54, "fatigue_score": 31, "zone_familiarity": 94, "eta_minutes": 3},
    {"unit_id": "security_bravo", "name": "Security Bravo", "skills": ["security", "crowd", "rescue"], "location": "Lobby command post", "availability": "deployed", "workload": 71, "fatigue_score": 42, "zone_familiarity": 88, "eta_minutes": 4},
    {"unit_id": "medic_2", "name": "Medic Unit 2", "skills": ["medical", "triage"], "location": "South gate", "availability": "available", "workload": 46, "fatigue_score": 27, "zone_familiarity": 82, "eta_minutes": 5},
    {"unit_id": "facilities_rapid", "name": "Facilities Rapid Team", "skills": ["utilities", "hvac", "hazmat"], "location": "Engineering bay", "availability": "available", "workload": 63, "fatigue_score": 38, "zone_familiarity": 91, "eta_minutes": 6},
    {"unit_id": "mutual_aid", "name": "External Mutual Aid", "skills": ["fire", "hazmat", "rescue"], "location": "Station 4", "availability": "reserve", "workload": 22, "fatigue_score": 18, "zone_familiarity": 61, "eta_minutes": 12},
]


INVENTORY: list[dict[str, Any]] = [
    {"item_id": "eq_extinguishers", "name": "Extinguishers", "category": "fire", "ready": 88, "deployed": 12, "maintenance": 4, "missing": 1, "low_stock": False, "state": "ready"},
    {"item_id": "eq_oxygen", "name": "Oxygen kits", "category": "medical", "ready": 18, "deployed": 5, "maintenance": 1, "missing": 0, "low_stock": True, "state": "low stock"},
    {"item_id": "eq_medkits", "name": "Med kits", "category": "medical", "ready": 23, "deployed": 9, "maintenance": 2, "missing": 1, "low_stock": True, "state": "low stock"},
    {"item_id": "eq_barricades", "name": "Barricades", "category": "security", "ready": 64, "deployed": 22, "maintenance": 0, "missing": 0, "low_stock": False, "state": "deployed"},
    {"item_id": "eq_drones", "name": "Drones mock", "category": "recon", "ready": 3, "deployed": 1, "maintenance": 1, "missing": 0, "low_stock": False, "state": "ready"},
    {"item_id": "eq_radios", "name": "Radios", "category": "comms", "ready": 42, "deployed": 31, "maintenance": 3, "missing": 2, "low_stock": False, "state": "ready"},
    {"item_id": "eq_generators", "name": "Generators", "category": "power", "ready": 5, "deployed": 2, "maintenance": 1, "missing": 0, "low_stock": False, "state": "ready"},
    {"item_id": "eq_ppe", "name": "PPE stock", "category": "safety", "ready": 210, "deployed": 74, "maintenance": 0, "missing": 0, "low_stock": False, "state": "ready"},
]


VEHICLES: list[dict[str, Any]] = [
    {"vehicle_id": "amb_02", "name": "Ambulance 02", "type": "ambulance", "status": "en route", "eta_minutes": 7, "route": "South Gate medical lane", "blocked_route": False, "reroute": "none"},
    {"vehicle_id": "fire_04", "name": "Fire Truck 04", "type": "fire truck", "status": "staged", "eta_minutes": 11, "route": "Service Road East", "blocked_route": False, "reroute": "none"},
    {"vehicle_id": "patrol_cart_3", "name": "Patrol Cart 3", "type": "patrol cart", "status": "rerouting", "eta_minutes": 4, "route": "Atrium corridor", "blocked_route": True, "reroute": "Switch to loading dock path"},
    {"vehicle_id": "utility_van_1", "name": "Utility Van 1", "type": "utility van", "status": "available", "eta_minutes": 6, "route": "Engineering bay", "blocked_route": False, "reroute": "none"},
]


RESERVES: list[dict[str, Any]] = [
    {"reserve_id": "reserve_security", "name": "Reserve Security Pool", "available": 8, "activation_eta": "6 min", "recommended": True},
    {"reserve_id": "reserve_medical", "name": "Medical Reserve Pool", "available": 3, "activation_eta": "9 min", "recommended": False},
    {"reserve_id": "reserve_facilities", "name": "Facilities On-call", "available": 5, "activation_eta": "12 min", "recommended": True},
]


def _dispatch_score(unit: dict[str, Any], incident: dict[str, Any]) -> int:
    skill_fit = 35 if incident["required_skill"] in unit["skills"] else 12
    availability = 25 if unit["availability"] in {"available", "reserve"} else 10
    eta_score = max(0, 20 - int(unit["eta_minutes"]))
    workload_score = max(0, 15 - round(int(unit["workload"]) / 10))
    familiarity = round(int(unit["zone_familiarity"]) / 10)
    return skill_fit + availability + eta_score + workload_score + familiarity


def _assignments(state: dict[str, Any]) -> list[dict[str, Any]]:
    assignments: list[dict[str, Any]] = []
    for incident in INCIDENTS:
        preferred = state["assigned_units"].get(incident["incident_id"])
        ranked = sorted(TEAMS, key=lambda unit: _dispatch_score(unit, incident), reverse=True)
        selected = next((unit for unit in TEAMS if unit["unit_id"] == preferred), ranked[0])
        assignments.append(
            {
                "assignment_id": f"ASN-{incident['incident_id']}",
                "incident_id": incident["incident_id"],
                "incident": incident["title"],
                "unit_id": selected["unit_id"],
                "unit": selected["name"],
                "eta_minutes": selected["eta_minutes"],
                "confidence": min(98, _dispatch_score(selected, incident)),
                "rationale": "Selected by nearest unit, skill fit, workload, urgency, ETA, and zone familiarity.",
                "status": "dispatched" if preferred else "recommended",
            }
        )
    return assignments


def _alerts() -> list[dict[str, Any]]:
    return [
        {"alert_id": "SHORT-MEDKIT", "title": "Med kits low", "severity": "high", "owner": "Medical Unit 2", "recommendation": "Release reserve med kits from lobby cache."},
        {"alert_id": "FATIGUE-SEC", "title": "Security fatigue high", "severity": "medium", "owner": "Security Bravo", "recommendation": "Swap in reserve security pool within 20 minutes."},
        {"alert_id": "FUEL-GEN", "title": "Generator fuel below continuity buffer", "severity": "medium", "owner": "Facilities Rapid Team", "recommendation": "Dispatch utility van with fuel reserve."},
        {"alert_id": "RESERVE-GAP", "title": "No reserve security after next wave", "severity": "high", "owner": "Ops Alpha", "recommendation": "Activate external mutual aid roster."},
    ]


def build_resources_snapshot() -> dict[str, Any]:
    state = ops_resources_store.get_state()
    assignments = _assignments(state)
    avg_eta = round(sum(int(item["eta_minutes"]) for item in assignments) / max(1, len(assignments)))
    return {
        "generated_at": _now_iso(),
        "mode": "demo",
        "live_incidents": INCIDENTS,
        "deployment_map": assignments,
        "teams": TEAMS,
        "inventory": INVENTORY,
        "vehicles": VEHICLES,
        "reserves": RESERVES,
        "eta_board": sorted(assignments, key=lambda item: int(item["eta_minutes"])),
        "shortage_alerts": _alerts(),
        "fatigue": [
            {"unit": unit["name"], "active_hours": round(4 + int(unit["fatigue_score"]) / 10, 1), "fatigue_score": unit["fatigue_score"], "overload_risk": "high" if int(unit["fatigue_score"]) >= 40 else "normal", "recommended_swap": int(unit["fatigue_score"]) >= 40}
            for unit in TEAMS
        ],
        "mission_assignments": assignments,
        "ledger": state["dispatches"],
        "summary": {
            "active_incidents": len(INCIDENTS),
            "units_available": len([unit for unit in TEAMS if unit["availability"] in {"available", "reserve"}]),
            "equipment_ready": sum(int(item["ready"]) for item in INVENTORY),
            "vehicles_active": len([vehicle for vehicle in VEHICLES if vehicle["status"] != "available"]),
            "reserve_units": sum(int(item["available"]) for item in RESERVES),
            "avg_eta_minutes": avg_eta,
            "shortages": len(_alerts()),
            "readiness_score": 92,
        },
    }


def dispatch_resource(incident_id: str, unit_id: str | None = None) -> dict[str, Any]:
    incident = next((item for item in INCIDENTS if item["incident_id"] == incident_id), INCIDENTS[0])
    if unit_id is None:
        selected = sorted(TEAMS, key=lambda unit: _dispatch_score(unit, incident), reverse=True)[0]
        unit_id = str(selected["unit_id"])
    ops_resources_store.dispatch(incident_id, unit_id)
    return build_resources_snapshot()


def get_resource_teams() -> dict[str, Any]:
    snapshot = build_resources_snapshot()
    return {"generated_at": snapshot["generated_at"], "teams": snapshot["teams"], "reserves": snapshot["reserves"]}


def get_resource_inventory() -> dict[str, Any]:
    snapshot = build_resources_snapshot()
    return {"generated_at": snapshot["generated_at"], "inventory": snapshot["inventory"]}


def get_resource_vehicles() -> dict[str, Any]:
    snapshot = build_resources_snapshot()
    return {"generated_at": snapshot["generated_at"], "vehicles": snapshot["vehicles"], "eta_board": snapshot["eta_board"]}


def get_resource_alerts() -> dict[str, Any]:
    snapshot = build_resources_snapshot()
    return {"generated_at": snapshot["generated_at"], "shortage_alerts": snapshot["shortage_alerts"], "fatigue": snapshot["fatigue"]}

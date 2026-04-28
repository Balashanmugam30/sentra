from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.behavior.store import DEMO_TENANTS, utc_now_iso
from app.core.config import settings


SEED_ENVIRONMENTS: tuple[dict[str, Any], ...] = (
    {
        "environment_id": "CROWD-UNI-CAMPUS",
        "name": "University Campus",
        "building_type": "education",
        "floors": 8,
        "zones": [
            {"zone_id": "UNI-LIBRARY", "name": "Library Atrium", "floor": 1, "occupancy": 820, "capacity": 1100, "density": 74, "smoke": 8, "visibility": 86, "panic": 38, "compliance": 72, "exit_width_m": 4.2, "flow_speed_mps": 0.86, "stair_load": 41, "corridor_pressure": 52, "blocked": False, "assistance_queue": 18, "primary_exit": "UNI-NORTH-GATE"},
            {"zone_id": "UNI-BLOCK-C", "name": "Campus Block C", "floor": 4, "occupancy": 540, "capacity": 700, "density": 77, "smoke": 19, "visibility": 72, "panic": 46, "compliance": 67, "exit_width_m": 2.8, "flow_speed_mps": 0.72, "stair_load": 69, "corridor_pressure": 68, "blocked": False, "assistance_queue": 26, "primary_exit": "UNI-EAST-STAIR"},
            {"zone_id": "UNI-AUDITORIUM", "name": "Main Auditorium", "floor": 1, "occupancy": 1400, "capacity": 1600, "density": 88, "smoke": 5, "visibility": 79, "panic": 52, "compliance": 61, "exit_width_m": 6.0, "flow_speed_mps": 0.78, "stair_load": 18, "corridor_pressure": 73, "blocked": False, "assistance_queue": 34, "primary_exit": "UNI-SOUTH-PLAZA"},
        ],
        "exits": [
            {"exit_id": "UNI-NORTH-GATE", "name": "North Gate", "capacity_per_min": 410, "current_load": 248, "pressure": 60, "blocked": False, "smoke": 4, "distance_m": 140, "assembly_point": "Cricket Field"},
            {"exit_id": "UNI-EAST-STAIR", "name": "East Stairwell", "capacity_per_min": 190, "current_load": 168, "pressure": 82, "blocked": False, "smoke": 11, "distance_m": 80, "assembly_point": "Science Lawn"},
            {"exit_id": "UNI-SOUTH-PLAZA", "name": "South Plaza", "capacity_per_min": 520, "current_load": 412, "pressure": 79, "blocked": False, "smoke": 2, "distance_m": 165, "assembly_point": "South Plaza"},
        ],
        "stairs": [
            {"stair_id": "UNI-EAST-STAIR", "name": "East Stairwell", "floors_served": "1-8", "load_percent": 72, "reverse_flow_risk": 31, "status": "high load"},
            {"stair_id": "UNI-WEST-STAIR", "name": "West Stairwell", "floors_served": "1-8", "load_percent": 44, "reverse_flow_risk": 16, "status": "available"},
        ],
        "elevators": [
            {"elevator_id": "UNI-ELEV-A", "name": "Academic Lift A", "available": False, "priority": "fire lockout", "load_percent": 0, "fire_service_mode": True},
            {"elevator_id": "UNI-ELEV-MED", "name": "Medical Access Lift", "available": True, "priority": "mobility assistance only", "load_percent": 28, "fire_service_mode": False},
        ],
        "safe_zones": [
            {"safezone_id": "UNI-FIELD", "name": "Cricket Field", "capacity": 2600, "assigned": 1240, "readiness": 94},
            {"safezone_id": "UNI-LAWN", "name": "Science Lawn", "capacity": 1450, "assigned": 710, "readiness": 88},
        ],
    },
    {
        "environment_id": "CROWD-HOTEL-12",
        "name": "12 Floor Hotel",
        "building_type": "hospitality",
        "floors": 12,
        "zones": [
            {"zone_id": "HOTEL-F8-EAST", "name": "Floor 8 East Wing", "floor": 8, "occupancy": 186, "capacity": 260, "density": 72, "smoke": 16, "visibility": 74, "panic": 42, "compliance": 70, "exit_width_m": 1.9, "flow_speed_mps": 0.68, "stair_load": 64, "corridor_pressure": 59, "blocked": False, "assistance_queue": 12, "primary_exit": "HOTEL-STAIR-B"},
            {"zone_id": "HOTEL-LOBBY", "name": "Main Lobby", "floor": 1, "occupancy": 520, "capacity": 640, "density": 81, "smoke": 4, "visibility": 91, "panic": 39, "compliance": 76, "exit_width_m": 5.4, "flow_speed_mps": 0.92, "stair_load": 22, "corridor_pressure": 57, "blocked": False, "assistance_queue": 21, "primary_exit": "HOTEL-SOUTH-EXIT"},
            {"zone_id": "HOTEL-KITCHEN-B", "name": "Kitchen Zone B", "floor": 3, "occupancy": 74, "capacity": 110, "density": 67, "smoke": 69, "visibility": 42, "panic": 67, "compliance": 64, "exit_width_m": 1.4, "flow_speed_mps": 0.44, "stair_load": 83, "corridor_pressure": 78, "blocked": True, "assistance_queue": 9, "primary_exit": "HOTEL-STAIR-C"},
            {"zone_id": "HOTEL-BALLROOM", "name": "Grand Ballroom", "floor": 2, "occupancy": 960, "capacity": 1150, "density": 84, "smoke": 12, "visibility": 78, "panic": 55, "compliance": 66, "exit_width_m": 6.2, "flow_speed_mps": 0.76, "stair_load": 36, "corridor_pressure": 71, "blocked": False, "assistance_queue": 45, "primary_exit": "HOTEL-EVENT-EXIT"},
        ],
        "exits": [
            {"exit_id": "HOTEL-STAIR-B", "name": "Stairwell B", "capacity_per_min": 132, "current_load": 108, "pressure": 82, "blocked": False, "smoke": 14, "distance_m": 48, "assembly_point": "North Assembly"},
            {"exit_id": "HOTEL-STAIR-C", "name": "Stairwell C", "capacity_per_min": 104, "current_load": 122, "pressure": 94, "blocked": False, "smoke": 38, "distance_m": 55, "assembly_point": "Service Yard"},
            {"exit_id": "HOTEL-SOUTH-EXIT", "name": "South Lobby Exit", "capacity_per_min": 430, "current_load": 264, "pressure": 61, "blocked": False, "smoke": 3, "distance_m": 35, "assembly_point": "South Forecourt"},
            {"exit_id": "HOTEL-EVENT-EXIT", "name": "Event Wing Exit", "capacity_per_min": 510, "current_load": 438, "pressure": 86, "blocked": False, "smoke": 9, "distance_m": 62, "assembly_point": "Garden Court"},
        ],
        "stairs": [
            {"stair_id": "HOTEL-STAIR-B", "name": "Stairwell B", "floors_served": "1-12", "load_percent": 76, "reverse_flow_risk": 28, "status": "controlled descent"},
            {"stair_id": "HOTEL-STAIR-C", "name": "Stairwell C", "floors_served": "1-12", "load_percent": 91, "reverse_flow_risk": 43, "status": "overloaded"},
            {"stair_id": "HOTEL-SERVICE", "name": "Service Stairwell", "floors_served": "B2-12", "load_percent": 37, "reverse_flow_risk": 12, "status": "reserve route"},
        ],
        "elevators": [
            {"elevator_id": "HOTEL-GUEST-LIFT", "name": "Guest Lift Bank", "available": False, "priority": "locked during fire posture", "load_percent": 0, "fire_service_mode": True},
            {"elevator_id": "HOTEL-FIRE-LIFT", "name": "Fire Service Lift", "available": True, "priority": "responders and assisted evacuation", "load_percent": 44, "fire_service_mode": True},
        ],
        "safe_zones": [
            {"safezone_id": "HOTEL-FORECOURT", "name": "South Forecourt", "capacity": 1800, "assigned": 960, "readiness": 96},
            {"safezone_id": "HOTEL-GARDEN", "name": "Garden Court", "capacity": 1200, "assigned": 790, "readiness": 90},
            {"safezone_id": "HOTEL-SERVICE-YARD", "name": "Service Yard", "capacity": 520, "assigned": 232, "readiness": 82},
        ],
    },
    {
        "environment_id": "CROWD-HOSPITAL-TOWER",
        "name": "Hospital Tower",
        "building_type": "healthcare",
        "floors": 18,
        "zones": [
            {"zone_id": "HOSP-ICU", "name": "ICU Wing", "floor": 7, "occupancy": 92, "capacity": 130, "density": 62, "smoke": 7, "visibility": 88, "panic": 31, "compliance": 86, "exit_width_m": 2.2, "flow_speed_mps": 0.42, "stair_load": 51, "corridor_pressure": 49, "blocked": False, "assistance_queue": 54, "primary_exit": "HOSP-STAIR-MED"},
            {"zone_id": "HOSP-ER", "name": "Emergency Department", "floor": 1, "occupancy": 310, "capacity": 420, "density": 74, "smoke": 3, "visibility": 82, "panic": 44, "compliance": 78, "exit_width_m": 3.8, "flow_speed_mps": 0.74, "stair_load": 19, "corridor_pressure": 64, "blocked": False, "assistance_queue": 62, "primary_exit": "HOSP-AMBULANCE-BAY"},
            {"zone_id": "HOSP-OXYGEN", "name": "Oxygen Manifold", "floor": 2, "occupancy": 38, "capacity": 60, "density": 63, "smoke": 0, "visibility": 92, "panic": 51, "compliance": 82, "exit_width_m": 1.6, "flow_speed_mps": 0.52, "stair_load": 32, "corridor_pressure": 46, "blocked": False, "assistance_queue": 6, "primary_exit": "HOSP-SERVICE-EXIT"},
        ],
        "exits": [
            {"exit_id": "HOSP-STAIR-MED", "name": "Medical Stairwell", "capacity_per_min": 118, "current_load": 82, "pressure": 69, "blocked": False, "smoke": 4, "distance_m": 70, "assembly_point": "Triage Lawn"},
            {"exit_id": "HOSP-AMBULANCE-BAY", "name": "Ambulance Bay", "capacity_per_min": 280, "current_load": 194, "pressure": 68, "blocked": False, "smoke": 2, "distance_m": 44, "assembly_point": "Ambulance Triage"},
            {"exit_id": "HOSP-SERVICE-EXIT", "name": "Service Exit", "capacity_per_min": 150, "current_load": 61, "pressure": 41, "blocked": False, "smoke": 0, "distance_m": 58, "assembly_point": "Service Triage"},
        ],
        "stairs": [
            {"stair_id": "HOSP-STAIR-MED", "name": "Medical Stairwell", "floors_served": "1-18", "load_percent": 58, "reverse_flow_risk": 18, "status": "patient escort lane"},
            {"stair_id": "HOSP-STAIR-SOUTH", "name": "South Stairwell", "floors_served": "1-18", "load_percent": 42, "reverse_flow_risk": 13, "status": "staff support lane"},
        ],
        "elevators": [
            {"elevator_id": "HOSP-BED-LIFT", "name": "Bed Lift", "available": True, "priority": "ICU and mobility patients", "load_percent": 61, "fire_service_mode": False},
            {"elevator_id": "HOSP-PUBLIC-LIFT", "name": "Public Lift", "available": False, "priority": "locked to reduce conflict", "load_percent": 0, "fire_service_mode": True},
        ],
        "safe_zones": [
            {"safezone_id": "HOSP-TRIAGE", "name": "Triage Lawn", "capacity": 720, "assigned": 318, "readiness": 93},
            {"safezone_id": "HOSP-AMBULANCE", "name": "Ambulance Triage", "capacity": 410, "assigned": 226, "readiness": 89},
        ],
    },
    {
        "environment_id": "CROWD-SHOPPING-MALL",
        "name": "Shopping Mall",
        "building_type": "retail",
        "floors": 5,
        "zones": [
            {"zone_id": "MALL-FOOD-COURT", "name": "Food Court", "floor": 3, "occupancy": 680, "capacity": 760, "density": 89, "smoke": 24, "visibility": 64, "panic": 58, "compliance": 59, "exit_width_m": 3.4, "flow_speed_mps": 0.63, "stair_load": 68, "corridor_pressure": 82, "blocked": False, "assistance_queue": 38, "primary_exit": "MALL-ATRIUM-STAIR"},
            {"zone_id": "MALL-CINEMA", "name": "Cinema Concourse", "floor": 4, "occupancy": 1120, "capacity": 1300, "density": 86, "smoke": 11, "visibility": 72, "panic": 54, "compliance": 62, "exit_width_m": 4.8, "flow_speed_mps": 0.69, "stair_load": 74, "corridor_pressure": 79, "blocked": False, "assistance_queue": 48, "primary_exit": "MALL-CINEMA-EXIT"},
            {"zone_id": "MALL-ANCHOR", "name": "Anchor Store", "floor": 2, "occupancy": 410, "capacity": 560, "density": 73, "smoke": 5, "visibility": 82, "panic": 39, "compliance": 74, "exit_width_m": 3.6, "flow_speed_mps": 0.81, "stair_load": 36, "corridor_pressure": 45, "blocked": False, "assistance_queue": 20, "primary_exit": "MALL-WEST-EXIT"},
        ],
        "exits": [
            {"exit_id": "MALL-ATRIUM-STAIR", "name": "Atrium Stair", "capacity_per_min": 210, "current_load": 236, "pressure": 91, "blocked": False, "smoke": 19, "distance_m": 88, "assembly_point": "North Parking"},
            {"exit_id": "MALL-CINEMA-EXIT", "name": "Cinema Fire Exit", "capacity_per_min": 360, "current_load": 312, "pressure": 86, "blocked": False, "smoke": 7, "distance_m": 112, "assembly_point": "Cinema Lot"},
            {"exit_id": "MALL-WEST-EXIT", "name": "West Exit", "capacity_per_min": 420, "current_load": 205, "pressure": 49, "blocked": False, "smoke": 2, "distance_m": 60, "assembly_point": "West Plaza"},
        ],
        "stairs": [
            {"stair_id": "MALL-ATRIUM-STAIR", "name": "Atrium Stair", "floors_served": "1-5", "load_percent": 88, "reverse_flow_risk": 39, "status": "throttle needed"},
            {"stair_id": "MALL-WEST-STAIR", "name": "West Stair", "floors_served": "1-5", "load_percent": 48, "reverse_flow_risk": 14, "status": "available"},
        ],
        "elevators": [
            {"elevator_id": "MALL-PUBLIC-LIFT", "name": "Public Lift Bank", "available": False, "priority": "fire posture lockout", "load_percent": 0, "fire_service_mode": True},
            {"elevator_id": "MALL-FREIGHT", "name": "Freight Lift", "available": True, "priority": "responder equipment", "load_percent": 17, "fire_service_mode": True},
        ],
        "safe_zones": [
            {"safezone_id": "MALL-NORTH", "name": "North Parking", "capacity": 2100, "assigned": 1120, "readiness": 91},
            {"safezone_id": "MALL-WEST", "name": "West Plaza", "capacity": 1600, "assigned": 760, "readiness": 95},
        ],
    },
    {
        "environment_id": "CROWD-STADIUM-GATE",
        "name": "Stadium Gate Event",
        "building_type": "event",
        "floors": 3,
        "zones": [
            {"zone_id": "STAD-GATE-A", "name": "Stadium Gate A", "floor": 1, "occupancy": 3400, "capacity": 3900, "density": 94, "smoke": 0, "visibility": 74, "panic": 62, "compliance": 54, "exit_width_m": 8.4, "flow_speed_mps": 0.64, "stair_load": 24, "corridor_pressure": 92, "blocked": False, "assistance_queue": 66, "primary_exit": "STAD-EAST-FLOW"},
            {"zone_id": "STAD-CONCOURSE", "name": "Upper Concourse", "floor": 2, "occupancy": 2200, "capacity": 2800, "density": 79, "smoke": 0, "visibility": 81, "panic": 47, "compliance": 60, "exit_width_m": 6.6, "flow_speed_mps": 0.71, "stair_load": 67, "corridor_pressure": 76, "blocked": False, "assistance_queue": 52, "primary_exit": "STAD-RAMP-NORTH"},
            {"zone_id": "STAD-FAMILY", "name": "Family Stand", "floor": 2, "occupancy": 1250, "capacity": 1600, "density": 78, "smoke": 0, "visibility": 83, "panic": 41, "compliance": 67, "exit_width_m": 5.8, "flow_speed_mps": 0.76, "stair_load": 58, "corridor_pressure": 64, "blocked": False, "assistance_queue": 79, "primary_exit": "STAD-RAMP-SOUTH"},
        ],
        "exits": [
            {"exit_id": "STAD-EAST-FLOW", "name": "East Flow Gate", "capacity_per_min": 1120, "current_load": 1084, "pressure": 97, "blocked": False, "smoke": 0, "distance_m": 120, "assembly_point": "East Fan Zone"},
            {"exit_id": "STAD-RAMP-NORTH", "name": "North Ramp", "capacity_per_min": 740, "current_load": 612, "pressure": 83, "blocked": False, "smoke": 0, "distance_m": 170, "assembly_point": "North Transport Hub"},
            {"exit_id": "STAD-RAMP-SOUTH", "name": "South Ramp", "capacity_per_min": 680, "current_load": 426, "pressure": 63, "blocked": False, "smoke": 0, "distance_m": 150, "assembly_point": "South Fan Zone"},
        ],
        "stairs": [
            {"stair_id": "STAD-NORTH-RAMP", "name": "North Ramp Stack", "floors_served": "1-3", "load_percent": 71, "reverse_flow_risk": 24, "status": "metered flow"},
            {"stair_id": "STAD-SOUTH-RAMP", "name": "South Ramp Stack", "floors_served": "1-3", "load_percent": 52, "reverse_flow_risk": 15, "status": "available"},
        ],
        "elevators": [
            {"elevator_id": "STAD-ACCESS-LIFT", "name": "Accessible Lift", "available": True, "priority": "mobility escort", "load_percent": 36, "fire_service_mode": False},
        ],
        "safe_zones": [
            {"safezone_id": "STAD-EAST-FAN", "name": "East Fan Zone", "capacity": 4200, "assigned": 2920, "readiness": 87},
            {"safezone_id": "STAD-TRANSIT", "name": "North Transport Hub", "capacity": 3600, "assigned": 2190, "readiness": 84},
            {"safezone_id": "STAD-SOUTH-FAN", "name": "South Fan Zone", "capacity": 3000, "assigned": 1740, "readiness": 91},
        ],
    },
)


class CrowdStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"environments": [], "events": []}

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        with self._lock:
            payload = self._read()
            existing = {(row["tenant_id"], row["environment_id"]) for row in payload["environments"]}
            for tenant_id in DEMO_TENANTS:
                for environment in SEED_ENVIRONMENTS:
                    if (tenant_id, environment["environment_id"]) in existing:
                        continue
                    payload["environments"].append({**environment, "tenant_id": tenant_id, "updated_at": utc_now_iso()})
                    created += 1
            self._write(payload)
        return {"created": created}

    def environments(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(environment) for environment in self._read()["environments"] if environment["tenant_id"] in tenant_ids]
        return sorted(rows, key=lambda environment: (environment["name"] != "12 Floor Hotel", environment["name"]))

    def active_environment(self, tenant_ids: list[str], environment_id: str | None = None) -> dict[str, Any]:
        rows = self.environments(tenant_ids)
        if environment_id:
            selected = next((row for row in rows if row["environment_id"] == environment_id), None)
            if selected is not None:
                return selected
        selected = next((row for row in rows if row["environment_id"] == "CROWD-HOTEL-12"), None)
        return selected or rows[0]

    def record_event(self, tenant_ids: list[str], action: str, payload_data: dict[str, Any] | None = None) -> dict[str, Any]:
        event = {
            "event_id": "",
            "tenant_id": tenant_ids[0],
            "action": action,
            "payload": payload_data or {},
            "created_at": utc_now_iso(),
        }
        with self._lock:
            payload = self._read()
            event["event_id"] = f"CROWD-EVT-{len(payload['events']) + 1:05d}"
            payload["events"].append(event)
            self._write(payload)
        return event


crowd_store = CrowdStore(
    getattr(
        settings,
        "sentra_behavior_crowd_store_path",
        str(Path(__file__).resolve().parents[2] / "data" / "behavior_crowd_store.json"),
    )
)

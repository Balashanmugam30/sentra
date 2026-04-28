from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS, utc_now_iso


FACILITIES: tuple[dict[str, Any], ...] = (
    {"facility_id": "FAC-GRAND-MERIDIAN", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Grand Meridian Hotel", "type": "hotel", "floors": 12, "rooms": 612, "zones": 84, "twin_health": 97, "live_occupancy": 428, "risk_score": 82, "readiness": 91, "location": "New York", "active_incident": "Hotel kitchen fire"},
    {"facility_id": "FAC-METROCARE", "tenant_id": "TEN-BALA-HOSP", "name": "MetroCare Hospital", "type": "hospital", "floors": 9, "rooms": 420, "zones": 68, "twin_health": 96, "live_occupancy": 920, "risk_score": 64, "readiness": 94, "location": "Coimbatore", "active_incident": "Hospital oxygen leak"},
    {"facility_id": "FAC-NOVA-MALL", "tenant_id": "TEN-BALA-MFG", "name": "Nova Mall Center", "type": "mall", "floors": 5, "rooms": 220, "zones": 52, "twin_health": 93, "live_occupancy": 1840, "risk_score": 77, "readiness": 86, "location": "Dubai", "active_incident": "Mall panic surge"},
    {"facility_id": "FAC-SKYLINE-TOWER", "tenant_id": "TEN-BALA-UNI", "name": "Skyline Campus Tower", "type": "campus", "floors": 18, "rooms": 780, "zones": 96, "twin_health": 95, "live_occupancy": 1260, "risk_score": 58, "readiness": 89, "location": "London", "active_incident": "Campus lab gas alert"},
    {"facility_id": "FAC-SMARTCITY-HUB", "tenant_id": "TEN-GOVSECURE", "name": "SmartCity Metro Hub", "type": "transport", "floors": 4, "rooms": 160, "zones": 48, "twin_health": 98, "live_occupancy": 3120, "risk_score": 71, "readiness": 92, "location": "Singapore", "active_incident": "Cyber outage during evacuation"},
)

FLOORS: tuple[dict[str, Any], ...] = (
    {"floor_id": "GM-F03", "facility_id": "FAC-GRAND-MERIDIAN", "tenant_id": "TEN-GRAND-MERIDIAN", "label": "Floor 3 - Kitchen + Guest Wing", "level": 3, "occupancy": 428, "capacity": 720, "risk": 86, "readiness": 78, "smoke": 72, "heat": 68, "gas": 18, "flow_rate": 118, "evacuation_progress": 54, "status": "critical", "active_zone": "Kitchen Zone B"},
    {"floor_id": "GM-F04", "facility_id": "FAC-GRAND-MERIDIAN", "tenant_id": "TEN-GRAND-MERIDIAN", "label": "Floor 4 - Guest Rooms", "level": 4, "occupancy": 312, "capacity": 680, "risk": 64, "readiness": 84, "smoke": 36, "heat": 31, "gas": 8, "flow_rate": 96, "evacuation_progress": 42, "status": "watch", "active_zone": "East Corridor"},
    {"floor_id": "MC-ICU", "facility_id": "FAC-METROCARE", "tenant_id": "TEN-BALA-HOSP", "label": "ICU Wing", "level": 6, "occupancy": 220, "capacity": 310, "risk": 62, "readiness": 92, "smoke": 8, "heat": 17, "gas": 48, "flow_rate": 54, "evacuation_progress": 18, "status": "clinical_control", "active_zone": "Oxygen Manifold"},
    {"floor_id": "NM-L02", "facility_id": "FAC-NOVA-MALL", "tenant_id": "TEN-BALA-MFG", "label": "Level 2 - Food Court", "level": 2, "occupancy": 1840, "capacity": 2400, "risk": 77, "readiness": 72, "smoke": 18, "heat": 24, "gas": 6, "flow_rate": 420, "evacuation_progress": 37, "status": "crowd_pressure", "active_zone": "North Atrium"},
    {"floor_id": "SC-LAB", "facility_id": "FAC-SKYLINE-TOWER", "tenant_id": "TEN-BALA-UNI", "label": "Lab Block C", "level": 8, "occupancy": 146, "capacity": 260, "risk": 69, "readiness": 81, "smoke": 14, "heat": 29, "gas": 61, "flow_rate": 44, "evacuation_progress": 26, "status": "gas_alert", "active_zone": "Chemistry Lab 8C"},
    {"floor_id": "SM-HUB", "facility_id": "FAC-SMARTCITY-HUB", "tenant_id": "TEN-GOVSECURE", "label": "Concourse + Platform", "level": 1, "occupancy": 3120, "capacity": 5200, "risk": 71, "readiness": 88, "smoke": 6, "heat": 18, "gas": 4, "flow_rate": 720, "evacuation_progress": 48, "status": "fallback_active", "active_zone": "Platform Gate A"},
)

ZONES: tuple[dict[str, Any], ...] = (
    {"zone_id": "GM-KITCHEN-B", "floor_id": "GM-F03", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Kitchen Zone B", "status": "hazard", "occupancy": 46, "density": 68, "risk": 92, "x": 18, "y": 46, "width": 26, "height": 22, "flow": "east stairwell"},
    {"zone_id": "GM-EAST-CORRIDOR", "floor_id": "GM-F03", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "East Corridor", "status": "route", "occupancy": 118, "density": 54, "risk": 58, "x": 50, "y": 42, "width": 32, "height": 16, "flow": "stairwell B"},
    {"zone_id": "GM-STAIR-B", "floor_id": "GM-F03", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Stairwell B", "status": "safe", "occupancy": 82, "density": 48, "risk": 28, "x": 84, "y": 38, "width": 12, "height": 30, "flow": "down"},
    {"zone_id": "NM-FOOD-COURT", "floor_id": "NM-L02", "tenant_id": "TEN-BALA-MFG", "name": "Food Court", "status": "crowded", "occupancy": 940, "density": 87, "risk": 80, "x": 24, "y": 28, "width": 42, "height": 34, "flow": "north + east exits"},
    {"zone_id": "MC-OXYGEN", "floor_id": "MC-ICU", "tenant_id": "TEN-BALA-HOSP", "name": "Oxygen Manifold", "status": "controlled", "occupancy": 18, "density": 22, "risk": 76, "x": 62, "y": 36, "width": 18, "height": 18, "flow": "clinical escort"},
)

SENSORS: tuple[dict[str, Any], ...] = (
    {"sensor_id": "IOT-GM-GAS-01", "tenant_id": "TEN-GRAND-MERIDIAN", "facility_id": "FAC-GRAND-MERIDIAN", "floor_id": "GM-F03", "zone_id": "GM-KITCHEN-B", "type": "gas", "value": 642, "unit": "ppm", "state": "warning", "latency_ms": 38, "battery": 94},
    {"sensor_id": "IOT-GM-FLAME-02", "tenant_id": "TEN-GRAND-MERIDIAN", "facility_id": "FAC-GRAND-MERIDIAN", "floor_id": "GM-F03", "zone_id": "GM-KITCHEN-B", "type": "flame", "value": 1, "unit": "bool", "state": "critical", "latency_ms": 31, "battery": 91},
    {"sensor_id": "CAM-GM-COR-01", "tenant_id": "TEN-GRAND-MERIDIAN", "facility_id": "FAC-GRAND-MERIDIAN", "floor_id": "GM-F03", "zone_id": "GM-EAST-CORRIDOR", "type": "camera", "value": 78, "unit": "visibility", "state": "online", "latency_ms": 52, "battery": 100},
    {"sensor_id": "IOT-NM-DENSITY-04", "tenant_id": "TEN-BALA-MFG", "facility_id": "FAC-NOVA-MALL", "floor_id": "NM-L02", "zone_id": "NM-FOOD-COURT", "type": "crowd", "value": 87, "unit": "density", "state": "warning", "latency_ms": 47, "battery": 88},
    {"sensor_id": "IOT-MC-OXY-02", "tenant_id": "TEN-BALA-HOSP", "facility_id": "FAC-METROCARE", "floor_id": "MC-ICU", "zone_id": "MC-OXYGEN", "type": "oxygen", "value": 42, "unit": "pressure_delta", "state": "watch", "latency_ms": 43, "battery": 96},
)

HAZARDS: tuple[dict[str, Any], ...] = (
    {"hazard_id": "HZ-GM-SMOKE", "tenant_id": "TEN-GRAND-MERIDIAN", "facility_id": "FAC-GRAND-MERIDIAN", "floor_id": "GM-F03", "type": "smoke", "severity": 86, "spread_rate": 14, "affected_zones": ["GM-KITCHEN-B", "GM-EAST-CORRIDOR"], "projection_10m": "Smoke reaches service corridor unless HVAC damper holds.", "color": "rose"},
    {"hazard_id": "HZ-GM-HEAT", "tenant_id": "TEN-GRAND-MERIDIAN", "facility_id": "FAC-GRAND-MERIDIAN", "floor_id": "GM-F03", "type": "heat", "severity": 72, "spread_rate": 9, "affected_zones": ["GM-KITCHEN-B"], "projection_10m": "Suppression likely contains heat inside kitchen envelope.", "color": "amber"},
    {"hazard_id": "HZ-NM-CROWD", "tenant_id": "TEN-BALA-MFG", "facility_id": "FAC-NOVA-MALL", "floor_id": "NM-L02", "type": "crowd_pressure", "severity": 81, "spread_rate": 18, "affected_zones": ["NM-FOOD-COURT"], "projection_10m": "North atrium congestion crosses stampede threshold without split routing.", "color": "violet"},
    {"hazard_id": "HZ-MC-OXY", "tenant_id": "TEN-BALA-HOSP", "facility_id": "FAC-METROCARE", "floor_id": "MC-ICU", "type": "oxygen", "severity": 66, "spread_rate": 6, "affected_zones": ["MC-OXYGEN"], "projection_10m": "Clinical escort required before isolation valve test.", "color": "cyan"},
)

RESPONDERS: tuple[dict[str, Any], ...] = (
    {"responder_id": "RESP-FIRE-A", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Fire Team Alpha", "role": "fire", "facility_id": "FAC-GRAND-MERIDIAN", "floor_id": "GM-F03", "x": 78, "y": 60, "status": "moving", "eta_minutes": 2, "mission": "Kitchen containment"},
    {"responder_id": "RESP-MED-2", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Medic Unit 2", "role": "medical", "facility_id": "FAC-GRAND-MERIDIAN", "floor_id": "GM-F03", "x": 72, "y": 28, "status": "staged", "eta_minutes": 4, "mission": "Triage east corridor"},
    {"responder_id": "RESP-SEC-B", "tenant_id": "TEN-BALA-MFG", "name": "Security Bravo", "role": "security", "facility_id": "FAC-NOVA-MALL", "floor_id": "NM-L02", "x": 66, "y": 52, "status": "rerouting", "eta_minutes": 3, "mission": "Split food court flow"},
    {"responder_id": "RESP-CLIN-ICU", "tenant_id": "TEN-BALA-HOSP", "name": "Clinical Rapid Unit", "role": "clinical", "facility_id": "FAC-METROCARE", "floor_id": "MC-ICU", "x": 54, "y": 38, "status": "escorting", "eta_minutes": 5, "mission": "Patient continuity lane"},
)

ROUTES: tuple[dict[str, Any], ...] = (
    {"route_id": "ROUTE-GM-EAST", "tenant_id": "TEN-GRAND-MERIDIAN", "facility_id": "FAC-GRAND-MERIDIAN", "floor_id": "GM-F03", "name": "East Stairwell B evacuation", "status": "recommended", "confidence": 94, "eta_minutes": 5, "distance_m": 118, "steps": ["Exit Kitchen B via east service door", "Follow illuminated corridor markers", "Descend Stairwell B", "Assemble at South Gate"], "path": [[18, 55], [44, 52], [74, 48], [90, 56]]},
    {"route_id": "ROUTE-GM-WEST", "tenant_id": "TEN-GRAND-MERIDIAN", "facility_id": "FAC-GRAND-MERIDIAN", "floor_id": "GM-F03", "name": "West service fallback", "status": "backup", "confidence": 77, "eta_minutes": 7, "distance_m": 154, "steps": ["Hold until smoke door verified", "Move west service corridor", "Exit to loading ramp"], "path": [[18, 55], [34, 70], [20, 82], [8, 92]]},
    {"route_id": "ROUTE-NM-SPLIT", "tenant_id": "TEN-BALA-MFG", "facility_id": "FAC-NOVA-MALL", "floor_id": "NM-L02", "name": "North and east crowd split", "status": "recommended", "confidence": 91, "eta_minutes": 9, "distance_m": 240, "steps": ["Split food court into two lanes", "Send families north", "Route staff east", "Hold escalator entry"], "path": [[38, 48], [52, 38], [74, 28], [88, 20]]},
)

REPLAYS: tuple[dict[str, Any], ...] = (
    {"replay_id": "RPL-HOTEL-KITCHEN", "tenant_id": "TEN-GRAND-MERIDIAN", "title": "Hotel kitchen fire", "facility_id": "FAC-GRAND-MERIDIAN", "duration_seconds": 780, "outcome": "Contained with partial evacuation", "score": 94, "casualties_avoided": 43, "loss_reduced": 820000},
    {"replay_id": "RPL-MALL-PANIC", "tenant_id": "TEN-BALA-MFG", "title": "Mall panic surge", "facility_id": "FAC-NOVA-MALL", "duration_seconds": 960, "outcome": "Crowd split prevented atrium crush", "score": 91, "casualties_avoided": 118, "loss_reduced": 540000},
    {"replay_id": "RPL-HOSP-OXY", "tenant_id": "TEN-BALA-HOSP", "title": "Hospital oxygen leak", "facility_id": "FAC-METROCARE", "duration_seconds": 1100, "outcome": "ICU continuity preserved", "score": 89, "casualties_avoided": 31, "loss_reduced": 1200000},
    {"replay_id": "RPL-CAMPUS-GAS", "tenant_id": "TEN-BALA-UNI", "title": "Campus lab gas alert", "facility_id": "FAC-SKYLINE-TOWER", "duration_seconds": 640, "outcome": "Lab isolated and students rerouted", "score": 88, "casualties_avoided": 26, "loss_reduced": 260000},
    {"replay_id": "RPL-CYBER-EVAC", "tenant_id": "TEN-GOVSECURE", "title": "Cyber outage during evacuation", "facility_id": "FAC-SMARTCITY-HUB", "duration_seconds": 1320, "outcome": "Fallback command kept platform stable", "score": 92, "casualties_avoided": 84, "loss_reduced": 2100000},
)

REPLAY_EVENTS: tuple[dict[str, Any], ...] = (
    {"event_id": "RPL-EVT-001", "replay_id": "RPL-HOTEL-KITCHEN", "tenant_id": "TEN-GRAND-MERIDIAN", "second": 0, "type": "sensor", "title": "Flame sensor triggered", "detail": "Kitchen Zone B flame verification at 94 percent confidence."},
    {"event_id": "RPL-EVT-002", "replay_id": "RPL-HOTEL-KITCHEN", "tenant_id": "TEN-GRAND-MERIDIAN", "second": 90, "type": "ai_decision", "title": "Partial evacuation selected", "detail": "AI council selected east stairwell phased route over full evacuation."},
    {"event_id": "RPL-EVT-003", "replay_id": "RPL-HOTEL-KITCHEN", "tenant_id": "TEN-GRAND-MERIDIAN", "second": 210, "type": "message", "title": "Guided voice broadcast sent", "detail": "Calm authoritative tone reduced hesitation by 18 percent."},
    {"event_id": "RPL-EVT-004", "replay_id": "RPL-HOTEL-KITCHEN", "tenant_id": "TEN-GRAND-MERIDIAN", "second": 420, "type": "responder", "title": "Fire Team Alpha arrived", "detail": "Responder route confirmed via east service corridor."},
    {"event_id": "RPL-EVT-005", "replay_id": "RPL-HOTEL-KITCHEN", "tenant_id": "TEN-GRAND-MERIDIAN", "second": 720, "type": "outcome", "title": "Hazard contained", "detail": "Suppression confirmed; recovery workflow started."},
)

SCENARIOS: tuple[dict[str, Any], ...] = (
    {"scenario_id": "SCN-FIRE-ROOM-X", "name": "Fire in Room X", "facility_id": "FAC-GRAND-MERIDIAN", "difficulty": "critical", "estimated_duration_min": 14, "objective": "Contain smoke and evacuate adjacent zones."},
    {"scenario_id": "SCN-GAS-ZONE-Y", "name": "Gas Leak in Zone Y", "facility_id": "FAC-SKYLINE-TOWER", "difficulty": "high", "estimated_duration_min": 18, "objective": "Isolate lab, shut HVAC, route students away."},
    {"scenario_id": "SCN-EXIT-BLOCKED", "name": "Exit Blocked", "facility_id": "FAC-NOVA-MALL", "difficulty": "high", "estimated_duration_min": 11, "objective": "Split crowd before pressure spikes."},
    {"scenario_id": "SCN-PANIC-SURGE", "name": "Panic Surge", "facility_id": "FAC-NOVA-MALL", "difficulty": "critical", "estimated_duration_min": 16, "objective": "Stabilize crowd and prevent reverse flow."},
    {"scenario_id": "SCN-POWER-FAILURE", "name": "Power Failure", "facility_id": "FAC-SMARTCITY-HUB", "difficulty": "medium", "estimated_duration_min": 21, "objective": "Activate fallback power and maintain wayfinding."},
    {"scenario_id": "SCN-CYBER-FIRE", "name": "Cyber + Fire Combo", "facility_id": "FAC-SMARTCITY-HUB", "difficulty": "extreme", "estimated_duration_min": 28, "objective": "Use degraded local command and protected evacuation."},
    {"scenario_id": "SCN-MULTI-FLOOR", "name": "Multi-Floor Incident", "facility_id": "FAC-GRAND-MERIDIAN", "difficulty": "extreme", "estimated_duration_min": 32, "objective": "Coordinate floor-by-floor evacuation and recovery."},
)


class TwinStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "facilities": [],
            "floors": [],
            "zones": [],
            "sensors": [],
            "hazards": [],
            "responders": [],
            "routes": [],
            "replays": [],
            "replay_events": [],
            "scenarios": [],
            "events": [],
        }

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
        seed_groups = {
            "facilities": (FACILITIES, "facility_id"),
            "floors": (FLOORS, "floor_id"),
            "zones": (ZONES, "zone_id"),
            "sensors": (SENSORS, "sensor_id"),
            "hazards": (HAZARDS, "hazard_id"),
            "responders": (RESPONDERS, "responder_id"),
            "routes": (ROUTES, "route_id"),
            "replays": (REPLAYS, "replay_id"),
            "replay_events": (REPLAY_EVENTS, "event_id"),
            "scenarios": (SCENARIOS, "scenario_id"),
        }
        with self._lock:
            payload = self._read()
            for table, (rows, key) in seed_groups.items():
                existing = {row[key] for row in payload[table] if key in row}
                for row in rows:
                    if row[key] in existing:
                        continue
                    payload[table].append({**row, "updated_at": utc_now_iso()})
                    created += 1
            self._write(payload)
        return {"created": created}

    def rows(self, table: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(row) for row in self._read()[table]]
        if set(tenant_ids) == set(DEMO_TENANTS):
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids or "tenant_id" not in row]

    def row_by_id(self, table: str, key: str, value: str, tenant_ids: list[str]) -> dict[str, Any] | None:
        for row in self.rows(table, tenant_ids):
            if str(row.get(key)) == value:
                return row
        return None

    def record_event(self, tenant_ids: list[str], action: str, payload_data: dict[str, Any] | None = None) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            event = {
                "event_id": f"TWIN-EVT-{len(payload['events']) + 1:05d}",
                "tenant_id": tenant_ids[0],
                "action": action,
                "payload": payload_data or {},
                "created_at": utc_now_iso(),
            }
            payload["events"].append(event)
            self._write(payload)
        return event


twin_store = TwinStore(settings.sentra_twin_store_path)


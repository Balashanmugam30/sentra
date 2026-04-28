from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS, utc_now_iso


PREDICTIONS: tuple[dict[str, Any], ...] = (
    {"prediction_id": "PRED-FIRE-GM-001", "tenant_id": "TEN-GRAND-MERIDIAN", "facility": "Grand Meridian Hotel", "domain": "fire_spread", "risk": 88, "horizon_5": "Smoke reaches service corridor edge.", "horizon_15": "Kitchen heat remains contained if suppression holds.", "horizon_30": "Guest wing re-entry possible after HVAC clearance.", "confidence": 94, "recommended_action": "Contain corridor-first and keep Stairwell B open."},
    {"prediction_id": "PRED-GAS-BU-001", "tenant_id": "TEN-BALA-UNI", "facility": "Bala University", "domain": "gas_propagation", "risk": 76, "horizon_5": "Lab concentration rises near storage wall.", "horizon_15": "Ventilation isolation prevents hallway spread.", "horizon_30": "Hazmat verification clears adjacent classrooms.", "confidence": 90, "recommended_action": "Shut lab HVAC and route students to west courtyard."},
    {"prediction_id": "PRED-CROWD-NM-001", "tenant_id": "TEN-BALA-MFG", "facility": "Nova Mall Group", "domain": "crowd_congestion", "risk": 84, "horizon_5": "Food court density exceeds comfort threshold.", "horizon_15": "North atrium bottleneck forms without split routing.", "horizon_30": "Crowd stabilizes if east exit is made primary.", "confidence": 91, "recommended_action": "Split flow between north and east exits now."},
    {"prediction_id": "PRED-PANIC-MC-001", "tenant_id": "TEN-BALA-HOSP", "facility": "MetroCare Campus", "domain": "panic_spread", "risk": 63, "horizon_5": "Family waiting area confusion rises.", "horizon_15": "Clinical escorts reduce non-compliance.", "horizon_30": "Panic remains localized if messaging stays calm.", "confidence": 88, "recommended_action": "Use clinical authority voice and escort high-risk patients."},
    {"prediction_id": "PRED-CYBER-SC-001", "tenant_id": "TEN-GOVSECURE", "facility": "SmartCity District", "domain": "utility_failure_chain", "risk": 79, "horizon_5": "Primary notification queue degrades.", "horizon_15": "Fallback provider preserves command traffic.", "horizon_30": "Manual wayfinding remains available if edge cache holds.", "confidence": 92, "recommended_action": "Switch to sovereign notification fallback and reduce noncritical polling."},
)

RISK_MAP: tuple[dict[str, Any], ...] = (
    {"risk_id": "RM-GM-KITCHEN", "tenant_id": "TEN-GRAND-MERIDIAN", "facility": "Grand Meridian Hotel", "zone": "Kitchen Zone B", "x": 18, "y": 46, "risk": 92, "type": "fire", "exposure": 820000, "reputation": 74},
    {"risk_id": "RM-GM-CORRIDOR", "tenant_id": "TEN-GRAND-MERIDIAN", "facility": "Grand Meridian Hotel", "zone": "East Corridor", "x": 52, "y": 44, "risk": 58, "type": "smoke", "exposure": 240000, "reputation": 52},
    {"risk_id": "RM-NM-FOOD", "tenant_id": "TEN-BALA-MFG", "facility": "Nova Mall Group", "zone": "Food Court", "x": 34, "y": 38, "risk": 84, "type": "crowd", "exposure": 540000, "reputation": 81},
    {"risk_id": "RM-BU-LAB", "tenant_id": "TEN-BALA-UNI", "facility": "Bala University", "zone": "Chemistry Lab 8C", "x": 68, "y": 40, "risk": 76, "type": "gas", "exposure": 260000, "reputation": 64},
    {"risk_id": "RM-MC-ICU", "tenant_id": "TEN-BALA-HOSP", "facility": "MetroCare Campus", "zone": "ICU Oxygen Manifold", "x": 61, "y": 35, "risk": 69, "type": "clinical", "exposure": 1200000, "reputation": 88},
)

ROUTE_PLANS: tuple[dict[str, Any], ...] = (
    {"route_id": "RT-AI-RESP-FIRE", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Fire team east service path", "use_case": "fire_team_pathing", "owner": "Fire Team Alpha", "from": "Lobby command point", "to": "Kitchen Zone B", "eta_minutes": 3, "safety": 94, "congestion": 22, "hazard_avoidance": 91, "reserve_capacity": 78, "score": 94, "steps": ["Use east service elevator override", "Stage at Stairwell B landing", "Enter Kitchen B via service door", "Hold suppression boundary"]},
    {"route_id": "RT-AI-EVAC-SPLIT", "tenant_id": "TEN-BALA-MFG", "name": "Mall crowd split route", "use_case": "evacuation_flows", "owner": "Security Bravo", "from": "Food Court", "to": "North and East exits", "eta_minutes": 9, "safety": 88, "congestion": 36, "hazard_avoidance": 86, "reserve_capacity": 74, "score": 91, "steps": ["Divide families north", "Send staff east", "Hold escalator entry", "Open exterior assembly lane"]},
    {"route_id": "RT-AI-AMB-ICU", "tenant_id": "TEN-BALA-HOSP", "name": "Ambulance clinical corridor", "use_case": "ambulance_corridor", "owner": "Clinical Rapid Unit", "from": "South ambulance bay", "to": "ICU Wing", "eta_minutes": 5, "safety": 96, "congestion": 18, "hazard_avoidance": 89, "reserve_capacity": 82, "score": 93, "steps": ["Clear south bay", "Hold visitor corridor", "Assign two escorts", "Keep elevator C for clinical use"]},
    {"route_id": "RT-AI-EXEC-GM", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Executive safe extraction", "use_case": "executive_safe_extraction", "owner": "Executive Liaison", "from": "Board suite", "to": "South service gate", "eta_minutes": 6, "safety": 92, "congestion": 28, "hazard_avoidance": 95, "reserve_capacity": 80, "score": 90, "steps": ["Hold public elevator", "Use service corridor", "Meet security at South Gate", "Move to offsite command"]},
)

RESOURCES: tuple[dict[str, Any], ...] = (
    {"resource_id": "RES-GUARDS-01", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Security Guards", "type": "guards", "deployed": 14, "idle": 4, "overload": 22, "reserve_health": 86, "best_move": "Move 2 guards from lobby to Stairwell B."},
    {"resource_id": "RES-MEDICS-02", "tenant_id": "TEN-BALA-HOSP", "name": "Medics", "type": "medics", "deployed": 8, "idle": 2, "overload": 31, "reserve_health": 78, "best_move": "Stage Medic Unit 2 near ICU corridor."},
    {"resource_id": "RES-DRONES-03", "tenant_id": "TEN-GOVSECURE", "name": "Drones", "type": "drones", "deployed": 3, "idle": 5, "overload": 9, "reserve_health": 92, "best_move": "Send drone 2 to platform crowd scan."},
    {"resource_id": "RES-HAZMAT-04", "tenant_id": "TEN-BALA-UNI", "name": "Hazmat Team", "type": "hazmat", "deployed": 2, "idle": 1, "overload": 44, "reserve_health": 70, "best_move": "Request mutual-aid hazmat standby."},
    {"resource_id": "RES-VEHICLES-05", "tenant_id": "TEN-BALA-MFG", "name": "Vehicles", "type": "vehicles", "deployed": 6, "idle": 3, "overload": 18, "reserve_health": 88, "best_move": "Stage utility cart at East exit."},
)

CAMPUS_BUILDINGS: tuple[dict[str, Any], ...] = (
    {"building_id": "BLD-BALA-LIB", "tenant_id": "TEN-BALA-UNI", "campus": "Bala University", "name": "Library Tower", "health": 94, "occupancy": 840, "pressure": 48, "incident": "none", "shared_resource": "Campus Security Pod 1"},
    {"building_id": "BLD-BALA-LAB", "tenant_id": "TEN-BALA-UNI", "campus": "Bala University", "name": "Lab Block C", "health": 76, "occupancy": 146, "pressure": 63, "incident": "gas alert", "shared_resource": "Hazmat Team"},
    {"building_id": "BLD-MC-ICU", "tenant_id": "TEN-BALA-HOSP", "campus": "Bala Hospital Demo", "name": "ICU Tower", "health": 88, "occupancy": 220, "pressure": 52, "incident": "oxygen watch", "shared_resource": "Clinical Rapid Unit"},
    {"building_id": "BLD-GM-HOTEL", "tenant_id": "TEN-GRAND-MERIDIAN", "campus": "Grand Meridian Hotel", "name": "Main Hotel", "health": 82, "occupancy": 428, "pressure": 66, "incident": "kitchen fire", "shared_resource": "Fire Team Alpha"},
    {"building_id": "BLD-NOVA-FOOD", "tenant_id": "TEN-BALA-MFG", "campus": "Nova Mall Group", "name": "Food Court Wing", "health": 79, "occupancy": 1840, "pressure": 84, "incident": "panic surge", "shared_resource": "Security Bravo"},
    {"building_id": "BLD-METROCARE", "tenant_id": "TEN-BALA-HOSP", "campus": "MetroCare Campus", "name": "Care Continuity Center", "health": 91, "occupancy": 520, "pressure": 44, "incident": "none", "shared_resource": "Ambulance Corridor"},
)

NETWORK_LINKS: tuple[dict[str, Any], ...] = (
    {"link_id": "LINK-BALA-LAB-LIB", "tenant_id": "TEN-BALA-UNI", "from": "Lab Block C", "to": "Library Tower", "route_health": 84, "travel_minutes": 6, "cascading_risk": 42},
    {"link_id": "LINK-GM-HOTEL-SOUTH", "tenant_id": "TEN-GRAND-MERIDIAN", "from": "Main Hotel", "to": "South Assembly", "route_health": 91, "travel_minutes": 4, "cascading_risk": 33},
    {"link_id": "LINK-NOVA-FOOD-EAST", "tenant_id": "TEN-BALA-MFG", "from": "Food Court Wing", "to": "East Parking", "route_health": 73, "travel_minutes": 8, "cascading_risk": 61},
    {"link_id": "LINK-MC-ICU-AMB", "tenant_id": "TEN-BALA-HOSP", "from": "ICU Tower", "to": "South Ambulance Bay", "route_health": 89, "travel_minutes": 5, "cascading_risk": 37},
)

STRATEGIES: tuple[dict[str, Any], ...] = (
    {"strategy_id": "STR-CORRIDOR-FIRST", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "corridor-first containment", "casualty_risk": 8, "recovery_eta": 42, "downtime_hours": 4, "financial_loss": 280000, "reputation_risk": 28, "confidence": 94, "winner": True, "why": "Contains smoke while keeping evacuation load below stairwell pressure threshold."},
    {"strategy_id": "STR-FULL-LOCKDOWN", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "full lockdown", "casualty_risk": 18, "recovery_eta": 64, "downtime_hours": 9, "financial_loss": 910000, "reputation_risk": 58, "confidence": 77, "winner": False, "why": "Overconstrains movement and delays suppression team."},
    {"strategy_id": "STR-PHASED-EVAC", "tenant_id": "TEN-BALA-MFG", "name": "phased evacuation", "casualty_risk": 11, "recovery_eta": 55, "downtime_hours": 6, "financial_loss": 540000, "reputation_risk": 36, "confidence": 91, "winner": True, "why": "Reduces panic and keeps exits below crush pressure."},
    {"strategy_id": "STR-MUTUAL-AID", "tenant_id": "TEN-BALA-HOSP", "name": "mutual-aid surge", "casualty_risk": 7, "recovery_eta": 48, "downtime_hours": 5, "financial_loss": 780000, "reputation_risk": 24, "confidence": 89, "winner": False, "why": "Excellent safety outcome but higher operational disruption than clinical corridor first."},
    {"strategy_id": "STR-SILENT-CONTAIN", "tenant_id": "TEN-GOVSECURE", "name": "silent containment", "casualty_risk": 21, "recovery_eta": 70, "downtime_hours": 8, "financial_loss": 620000, "reputation_risk": 46, "confidence": 72, "winner": False, "why": "Reputation risk stays lower initially but panic rebound increases later."},
)

REPLAY_INTELLIGENCE: tuple[dict[str, Any], ...] = (
    {"lesson_id": "LESSON-GM-001", "tenant_id": "TEN-GRAND-MERIDIAN", "replay_id": "RPL-HOTEL-KITCHEN", "mistake": "Approval delayed by 72 seconds for corridor closure.", "better_alternative": "Pre-approve smoke-door closure when flame + camera confidence exceed 90 percent.", "audit_evidence": "AI council confidence 94, responder ETA 2m, east stairwell pressure below 55 percent.", "impact": "Would reduce smoke exposure by 18 percent.", "confidence": 93},
    {"lesson_id": "LESSON-NM-001", "tenant_id": "TEN-BALA-MFG", "replay_id": "RPL-MALL-PANIC", "mistake": "Initial announcement sent to all zones instead of food court only.", "better_alternative": "Target calm directional message to food court and silent signage to adjacent stores.", "audit_evidence": "Crowd density localized to food court; adjacent stores stable.", "impact": "Would reduce confusion by 22 percent.", "confidence": 91},
    {"lesson_id": "LESSON-MC-001", "tenant_id": "TEN-BALA-HOSP", "replay_id": "RPL-HOSP-OXY", "mistake": "Clinical escort route opened after public corridor update.", "better_alternative": "Reserve elevator C for clinical use before public message.", "audit_evidence": "ICU patient dependency score high; visitor pressure moderate.", "impact": "Would improve patient continuity ETA by 6 minutes.", "confidence": 89},
)


class TwinAIStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "predictions": [],
            "risk_map": [],
            "route_plans": [],
            "resources": [],
            "campus_buildings": [],
            "network_links": [],
            "strategies": [],
            "replay_intelligence": [],
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
            "predictions": (PREDICTIONS, "prediction_id"),
            "risk_map": (RISK_MAP, "risk_id"),
            "route_plans": (ROUTE_PLANS, "route_id"),
            "resources": (RESOURCES, "resource_id"),
            "campus_buildings": (CAMPUS_BUILDINGS, "building_id"),
            "network_links": (NETWORK_LINKS, "link_id"),
            "strategies": (STRATEGIES, "strategy_id"),
            "replay_intelligence": (REPLAY_INTELLIGENCE, "lesson_id"),
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
        return [row for row in rows if row.get("tenant_id") in tenant_ids]

    def record_event(self, tenant_ids: list[str], action: str, payload_data: dict[str, Any] | None = None) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            event = {
                "event_id": f"TWIN-AI-EVT-{len(payload['events']) + 1:05d}",
                "tenant_id": tenant_ids[0],
                "action": action,
                "payload": payload_data or {},
                "created_at": utc_now_iso(),
            }
            payload["events"].append(event)
            self._write(payload)
        return event


twin_ai_store = TwinAIStore(settings.sentra_twin_ai_store_path)


from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.behavior.store import DEMO_TENANTS, utc_now_iso
from app.core.config import settings


SEED_SCENARIOS: tuple[dict[str, Any], ...] = (
    {
        "scenario_id": "DEC-MALL-FIRE",
        "name": "Mall Fire Panic",
        "environment_id": "CROWD-SHOPPING-MALL",
        "primary_zone": "Food Court",
        "hazard": "fire_smoke",
        "panic_level": 78,
        "crowd_density": 89,
        "fire_smoke_gas_risk": 82,
        "blocked_exits": 1,
        "vulnerable_people": 118,
        "responder_availability": 72,
        "compliance_score": 58,
        "time_pressure": 86,
        "financial_exposure": 740000,
        "reputation_exposure": 81,
    },
    {
        "scenario_id": "DEC-HOTEL-SMOKE-F8",
        "name": "Hotel Smoke Floor 8",
        "environment_id": "CROWD-HOTEL-12",
        "primary_zone": "Floor 8 East Wing",
        "hazard": "smoke_spread",
        "panic_level": 61,
        "crowd_density": 72,
        "fire_smoke_gas_risk": 68,
        "blocked_exits": 0,
        "vulnerable_people": 43,
        "responder_availability": 84,
        "compliance_score": 70,
        "time_pressure": 74,
        "financial_exposure": 420000,
        "reputation_exposure": 63,
    },
    {
        "scenario_id": "DEC-STADIUM-RUSH",
        "name": "Stadium Exit Rush",
        "environment_id": "CROWD-STADIUM-GATE",
        "primary_zone": "Stadium Gate A",
        "hazard": "crowd_surge",
        "panic_level": 84,
        "crowd_density": 94,
        "fire_smoke_gas_risk": 28,
        "blocked_exits": 0,
        "vulnerable_people": 220,
        "responder_availability": 65,
        "compliance_score": 54,
        "time_pressure": 91,
        "financial_exposure": 980000,
        "reputation_exposure": 88,
    },
    {
        "scenario_id": "DEC-HOSP-OXYGEN",
        "name": "Hospital Oxygen Leak",
        "environment_id": "CROWD-HOSPITAL-TOWER",
        "primary_zone": "Oxygen Manifold",
        "hazard": "gas_leak",
        "panic_level": 66,
        "crowd_density": 63,
        "fire_smoke_gas_risk": 88,
        "blocked_exits": 0,
        "vulnerable_people": 126,
        "responder_availability": 78,
        "compliance_score": 82,
        "time_pressure": 90,
        "financial_exposure": 1250000,
        "reputation_exposure": 86,
    },
    {
        "scenario_id": "DEC-UNI-RUMOR",
        "name": "University Bomb Rumor",
        "environment_id": "CROWD-UNI-CAMPUS",
        "primary_zone": "Main Auditorium",
        "hazard": "security_rumor",
        "panic_level": 73,
        "crowd_density": 88,
        "fire_smoke_gas_risk": 22,
        "blocked_exits": 0,
        "vulnerable_people": 96,
        "responder_availability": 68,
        "compliance_score": 61,
        "time_pressure": 79,
        "financial_exposure": 360000,
        "reputation_exposure": 79,
    },
    {
        "scenario_id": "DEC-METRO-SURGE",
        "name": "Metro Crowd Surge",
        "environment_id": "CROWD-STADIUM-GATE",
        "primary_zone": "Transit Gate Stack",
        "hazard": "transit_surge",
        "panic_level": 80,
        "crowd_density": 96,
        "fire_smoke_gas_risk": 18,
        "blocked_exits": 1,
        "vulnerable_people": 184,
        "responder_availability": 59,
        "compliance_score": 57,
        "time_pressure": 88,
        "financial_exposure": 620000,
        "reputation_exposure": 83,
    },
)


class DecisionStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"scenarios": [], "approvals": [], "events": []}

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
            existing = {(scenario["tenant_id"], scenario["scenario_id"]) for scenario in payload["scenarios"]}
            for tenant_id in DEMO_TENANTS:
                for scenario in SEED_SCENARIOS:
                    if (tenant_id, scenario["scenario_id"]) in existing:
                        continue
                    payload["scenarios"].append({**scenario, "tenant_id": tenant_id, "updated_at": utc_now_iso()})
                    created += 1
            self._write(payload)
        return {"created": created}

    def scenarios(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(scenario) for scenario in self._read()["scenarios"] if scenario["tenant_id"] in tenant_ids]
        return sorted(rows, key=lambda scenario: int(scenario["time_pressure"]), reverse=True)

    def active_scenario(self, tenant_ids: list[str], scenario_id: str | None = None) -> dict[str, Any]:
        scenarios = self.scenarios(tenant_ids)
        if scenario_id:
            selected = next((scenario for scenario in scenarios if scenario["scenario_id"] == scenario_id), None)
            if selected is not None:
                return selected
        selected = next((scenario for scenario in scenarios if scenario["scenario_id"] == "DEC-STADIUM-RUSH"), None)
        return selected or scenarios[0]

    def approval_queue(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        scenario = self.active_scenario(tenant_ids)
        return [
            {
                "approval_id": "APPROVE-HUMAN-001",
                "tenant_id": tenant_ids[0],
                "action": "Split crowd between East Flow Gate and South Ramp",
                "risk": "high",
                "approver": "Operations Commander",
                "sla_minutes": 2,
                "status": "pending",
                "scenario": scenario["name"],
            },
            {
                "approval_id": "APPROVE-HUMAN-002",
                "tenant_id": tenant_ids[0],
                "action": "Broadcast authoritative multilingual reroute order",
                "risk": "medium",
                "approver": "Security Manager",
                "sla_minutes": 1,
                "status": "pending",
                "scenario": scenario["name"],
            },
        ]

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
            event["event_id"] = f"DEC-EVT-{len(payload['events']) + 1:05d}"
            payload["events"].append(event)
            self._write(payload)
        return event

    def approve(self, tenant_ids: list[str], approval_id: str | None = None) -> dict[str, Any]:
        event = self.record_event(tenant_ids, "human_response_approved", {"approval_id": approval_id or "APPROVE-HUMAN-001"})
        return {"event": event, "status": "approved", "approval_id": approval_id or "APPROVE-HUMAN-001"}

    def override(self, tenant_ids: list[str], reason: str | None = None) -> dict[str, Any]:
        event = self.record_event(tenant_ids, "human_response_override", {"reason": reason or "manual commander override"})
        return {"event": event, "status": "override_recorded", "reason": reason or "manual commander override"}


decision_store = DecisionStore(
    getattr(
        settings,
        "sentra_behavior_decision_store_path",
        str(Path(__file__).resolve().parents[2] / "data" / "behavior_decision_store.json"),
    )
)

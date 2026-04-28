from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.behavior.store import DEMO_TENANTS, utc_now_iso
from app.core.config import settings


SEED_INCIDENTS: tuple[dict[str, Any], ...] = (
    {
        "incident_id": "LEARN-MALL-PANIC",
        "name": "Mall Panic Reduced by Calm Messaging",
        "scenario": "Mall Fire Panic",
        "population_type": "families and retail visitors",
        "action_chosen": "calm authority announcement with exit marshals",
        "crowd_outcome": "panic pockets stabilized and food court flow split cleanly",
        "evacuation_time_minutes": 19,
        "baseline_time_minutes": 27,
        "injuries_prevented": 14,
        "compliance_percent": 78,
        "panic_reduction_percent": 31,
        "trust_delta": 9,
        "success_score": 91,
        "failed_actions": ["single-exit signage", "generic alarm repetition"],
        "improved_weight": "increase message clarity weight by 8%",
        "future_recommendation": "launch calm authority message before full siren escalation",
        "best_next_move": "split high-density food court flow before stairwell pressure crosses 80",
        "roi_saved": 480000,
    },
    {
        "incident_id": "LEARN-HOTEL-SPLIT",
        "name": "Hotel Floor Congestion Solved by Exit Split",
        "scenario": "Hotel Smoke Floor 8",
        "population_type": "hotel guests and staff",
        "action_chosen": "split Floor 8 between Stairwell B and service stair",
        "crowd_outcome": "corridor pressure dropped and assisted guests moved first",
        "evacuation_time_minutes": 16,
        "baseline_time_minutes": 24,
        "injuries_prevented": 8,
        "compliance_percent": 83,
        "panic_reduction_percent": 24,
        "trust_delta": 11,
        "success_score": 94,
        "failed_actions": ["elevator reassurance", "delayed staff dispatch"],
        "improved_weight": "raise stairwell load penalty by 6%",
        "future_recommendation": "reserve service stair earlier for mobility support",
        "best_next_move": "send visible floor captain before smoke visibility falls below 60",
        "roi_saved": 340000,
    },
    {
        "incident_id": "LEARN-STADIUM-RUMOR",
        "name": "Stadium Rumor Stopped by Targeted Alerts",
        "scenario": "Stadium Exit Rush",
        "population_type": "event crowd and multilingual visitors",
        "action_chosen": "targeted rumor correction plus controlled gate release",
        "crowd_outcome": "rumor spread slowed and gate pressure normalized",
        "evacuation_time_minutes": 22,
        "baseline_time_minutes": 35,
        "injuries_prevented": 22,
        "compliance_percent": 71,
        "panic_reduction_percent": 38,
        "trust_delta": 7,
        "success_score": 89,
        "failed_actions": ["silent security movement", "non-localized public address"],
        "improved_weight": "increase rumor signal sensitivity by 10%",
        "future_recommendation": "publish verified localized message within 60 seconds",
        "best_next_move": "activate multilingual gate stewards and route confidence boards",
        "roi_saved": 760000,
    },
    {
        "incident_id": "LEARN-HOSP-ESCORT",
        "name": "Hospital Evac Delay Improved by Escort Teams",
        "scenario": "Hospital Oxygen Leak",
        "population_type": "patients, clinicians, elderly occupants",
        "action_chosen": "clinical escort teams and bed-lift prioritization",
        "crowd_outcome": "assisted evacuation queue cleared without public corridor surge",
        "evacuation_time_minutes": 28,
        "baseline_time_minutes": 42,
        "injuries_prevented": 17,
        "compliance_percent": 88,
        "panic_reduction_percent": 29,
        "trust_delta": 13,
        "success_score": 95,
        "failed_actions": ["general evacuation order", "public lift release"],
        "improved_weight": "increase vulnerability lane priority by 12%",
        "future_recommendation": "trigger clinical quiet-alert before public instructions",
        "best_next_move": "protect patient corridor and assign two escort teams first",
        "roi_saved": 920000,
    },
    {
        "incident_id": "LEARN-CAMPUS-PHASED",
        "name": "Campus Surge Controlled by Phased Release",
        "scenario": "University Bomb Rumor",
        "population_type": "students and staff",
        "action_chosen": "phased auditorium release with rumor suppression",
        "crowd_outcome": "auditorium surge avoided and north gate remained below overload",
        "evacuation_time_minutes": 21,
        "baseline_time_minutes": 30,
        "injuries_prevented": 11,
        "compliance_percent": 76,
        "panic_reduction_percent": 34,
        "trust_delta": 8,
        "success_score": 90,
        "failed_actions": ["all-clear ambiguity", "social silence"],
        "improved_weight": "raise social rumor pressure by 7%",
        "future_recommendation": "use authoritative campus voice plus app confirmation",
        "best_next_move": "release upper rows only after gate A pressure drops below 65",
        "roi_saved": 410000,
    },
)


class LearningStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"incidents": [], "events": [], "policies": []}

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
            existing = {(incident["tenant_id"], incident["incident_id"]) for incident in payload["incidents"]}
            for tenant_id in DEMO_TENANTS:
                for incident in SEED_INCIDENTS:
                    if (tenant_id, incident["incident_id"]) in existing:
                        continue
                    payload["incidents"].append({**incident, "tenant_id": tenant_id, "learned_at": utc_now_iso()})
                    created += 1
            self._write(payload)
        return {"created": created}

    def incidents(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(incident) for incident in self._read()["incidents"] if incident["tenant_id"] in tenant_ids]
        return sorted(rows, key=lambda incident: int(incident["success_score"]), reverse=True)

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
            event["event_id"] = f"LEARN-EVT-{len(payload['events']) + 1:05d}"
            payload["events"].append(event)
            self._write(payload)
        return event

    def approve_policy(self, tenant_ids: list[str], policy_id: str | None = None) -> dict[str, Any]:
        policy = {
            "policy_id": policy_id or "POLICY-MSG-CLARITY-001",
            "tenant_id": tenant_ids[0],
            "status": "approved",
            "approved_at": utc_now_iso(),
        }
        with self._lock:
            payload = self._read()
            payload["policies"].append(policy)
            self._write(payload)
        return policy

    def reset_events(self, tenant_ids: list[str]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            payload["events"] = [event for event in payload["events"] if event["tenant_id"] not in tenant_ids]
            payload["policies"] = [policy for policy in payload["policies"] if policy["tenant_id"] not in tenant_ids]
            self._write(payload)
        return {"status": "reset_complete", "tenant_ids": tenant_ids}


learning_store = LearningStore(
    getattr(
        settings,
        "sentra_behavior_learning_store_path",
        str(Path(__file__).resolve().parents[2] / "data" / "behavior_learning_store.json"),
    )
)

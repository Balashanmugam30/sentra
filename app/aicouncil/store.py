from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS, utc_now_iso


AGENTS: tuple[dict[str, Any], ...] = (
    {"agent_id": "commander_agent", "name": "Commander Agent", "role": "speed + containment", "avatar": "CMD", "priority": "fastest stabilized outcome", "trust_score": 94, "accepted_recommendations": 82, "override_rate": 9, "false_positive_rate": 4, "success_rate": 91, "confidence_calibration": 93, "color": "cyan"},
    {"agent_id": "safety_agent", "name": "Safety Agent", "role": "life protection", "avatar": "SAFE", "priority": "minimize casualties", "trust_score": 96, "accepted_recommendations": 88, "override_rate": 6, "false_positive_rate": 3, "success_rate": 94, "confidence_calibration": 95, "color": "emerald"},
    {"agent_id": "logistics_agent", "name": "Logistics Agent", "role": "resources + routing", "avatar": "LOG", "priority": "move people and teams efficiently", "trust_score": 92, "accepted_recommendations": 79, "override_rate": 11, "false_positive_rate": 5, "success_rate": 90, "confidence_calibration": 91, "color": "blue"},
    {"agent_id": "finance_agent", "name": "Finance Agent", "role": "loss minimization", "avatar": "FIN", "priority": "protect revenue without slowing safety", "trust_score": 88, "accepted_recommendations": 71, "override_rate": 15, "false_positive_rate": 7, "success_rate": 86, "confidence_calibration": 89, "color": "amber"},
    {"agent_id": "reputation_agent", "name": "Reputation Agent", "role": "brand + public trust", "avatar": "PR", "priority": "clear public narrative", "trust_score": 90, "accepted_recommendations": 74, "override_rate": 13, "false_positive_rate": 6, "success_rate": 87, "confidence_calibration": 90, "color": "violet"},
    {"agent_id": "cyber_agent", "name": "Cyber Agent", "role": "digital threats", "avatar": "CYB", "priority": "protect command systems", "trust_score": 91, "accepted_recommendations": 76, "override_rate": 12, "false_positive_rate": 5, "success_rate": 89, "confidence_calibration": 92, "color": "indigo"},
    {"agent_id": "human_behavior_agent", "name": "Human Behavior Agent", "role": "panic + compliance", "avatar": "HUM", "priority": "stabilize people", "trust_score": 95, "accepted_recommendations": 86, "override_rate": 7, "false_positive_rate": 4, "success_rate": 93, "confidence_calibration": 94, "color": "rose"},
    {"agent_id": "governance_agent", "name": "Governance Agent", "role": "policy + legal guardrails", "avatar": "GOV", "priority": "safe autonomy", "trust_score": 93, "accepted_recommendations": 81, "override_rate": 10, "false_positive_rate": 3, "success_rate": 92, "confidence_calibration": 93, "color": "slate"},
)

SCENARIOS: tuple[dict[str, Any], ...] = (
    {"scenario_id": "hotel_fire_dual_incident", "label": "Hotel fire dual incident", "objective": "minimize casualties", "threat_stack": ["floor 3 kitchen fire", "corridor smoke", "guest panic cluster", "west stairwell blocked"], "mlops_signal": 91, "soc_signal": 23, "route_health": 84, "resource_load": 62, "finance_exposure": 72, "public_pressure": 68, "cyber_pressure": 18, "human_risk": 87, "eta_to_stability": "11 min"},
    {"scenario_id": "gas_leak_with_panic", "label": "Gas leak with panic", "objective": "minimize casualties", "threat_stack": ["gas spike", "panic on floor 8", "mixed alarm compliance", "HVAC isolation pending"], "mlops_signal": 86, "soc_signal": 14, "route_health": 79, "resource_load": 58, "finance_exposure": 61, "public_pressure": 55, "cyber_pressure": 12, "human_risk": 82, "eta_to_stability": "14 min"},
    {"scenario_id": "cyber_attack_during_evac", "label": "Cyber attack during evacuation", "objective": "maintain continuity", "threat_stack": ["access control anomaly", "camera dropout", "evacuation active", "webhook retries failing"], "mlops_signal": 78, "soc_signal": 88, "route_health": 67, "resource_load": 71, "finance_exposure": 79, "public_pressure": 64, "cyber_pressure": 92, "human_risk": 74, "eta_to_stability": "18 min"},
    {"scenario_id": "stadium_rush_behavior", "label": "Stadium rush behavior", "objective": "minimize casualties", "threat_stack": ["gate A compression", "rumor spread", "medical lane blocked", "security perimeter strain"], "mlops_signal": 83, "soc_signal": 18, "route_health": 61, "resource_load": 76, "finance_exposure": 66, "public_pressure": 81, "cyber_pressure": 20, "human_risk": 93, "eta_to_stability": "16 min"},
    {"scenario_id": "hospital_system_outage", "label": "Hospital system outage", "objective": "maintain continuity", "threat_stack": ["oxygen telemetry degraded", "backup generator watch", "ICU routing constrained", "communications fallback active"], "mlops_signal": 80, "soc_signal": 31, "route_health": 73, "resource_load": 69, "finance_exposure": 74, "public_pressure": 59, "cyber_pressure": 42, "human_risk": 71, "eta_to_stability": "22 min"},
    {"scenario_id": "enterprise_pr_crisis", "label": "Enterprise PR crisis", "objective": "protect reputation", "threat_stack": ["viral misinformation", "board inquiry", "customer churn risk", "incident footage requested"], "mlops_signal": 62, "soc_signal": 47, "route_health": 91, "resource_load": 38, "finance_exposure": 84, "public_pressure": 94, "cyber_pressure": 56, "human_risk": 48, "eta_to_stability": "28 min"},
)

STRATEGY_OPTIONS: tuple[dict[str, Any], ...] = (
    {"option_id": "corridor_first", "label": "Corridor first", "base_score": 89, "speed": 92, "safety": 88, "continuity": 82, "reputation": 84, "cost_control": 78},
    {"option_id": "targeted_lockdown", "label": "Targeted lockdown", "base_score": 83, "speed": 76, "safety": 91, "continuity": 86, "reputation": 80, "cost_control": 84},
    {"option_id": "full_lockdown", "label": "Full lockdown", "base_score": 72, "speed": 62, "safety": 82, "continuity": 58, "reputation": 69, "cost_control": 63},
    {"option_id": "surge_response", "label": "Surge response", "base_score": 91, "speed": 94, "safety": 93, "continuity": 78, "reputation": 86, "cost_control": 66},
    {"option_id": "silent_monitor", "label": "Silent monitor", "base_score": 61, "speed": 54, "safety": 55, "continuity": 91, "reputation": 74, "cost_control": 92},
)

LEARNING_EPISODES: tuple[dict[str, Any], ...] = (
    {"episode_id": "EP-AC-001", "scenario": "hotel_fire_dual_incident", "decision": "corridor_first plus surge response", "outcome": "stabilized in 12 minutes", "accepted": True, "override_reason": "none", "delay_cost": "$42k avoided", "strategy_win_rate": 94, "confidence_before": 87, "confidence_after": 92, "lesson": "Medical lane protection improves evacuation speed without raising panic."},
    {"episode_id": "EP-AC-002", "scenario": "cyber_attack_during_evac", "decision": "targeted lockdown with cyber isolation", "outcome": "camera command recovered", "accepted": True, "override_reason": "executive required cyber proof", "delay_cost": "$18k delay cost", "strategy_win_rate": 88, "confidence_before": 80, "confidence_after": 86, "lesson": "Cyber isolation should start before evacuation webhook retries saturate."},
    {"episode_id": "EP-AC-003", "scenario": "stadium_rush_behavior", "decision": "surge response and calm multilingual messaging", "outcome": "gate density reduced 31 percent", "accepted": True, "override_reason": "communications tone softened", "delay_cost": "$63k avoided", "strategy_win_rate": 91, "confidence_before": 84, "confidence_after": 90, "lesson": "Calm authority messaging beats strict commands during rumor-driven surges."},
    {"episode_id": "EP-AC-004", "scenario": "enterprise_pr_crisis", "decision": "public holding statement plus customer sponsor calls", "outcome": "churn risk contained", "accepted": False, "override_reason": "legal asked to delay statement", "delay_cost": "$210k exposure", "strategy_win_rate": 79, "confidence_before": 82, "confidence_after": 78, "lesson": "Legal review delay needs pre-approved holding templates."},
)


class AICouncilStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "agents": [],
            "scenarios": [],
            "strategy_options": [],
            "learning": [],
            "state": [],
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
        with self._lock:
            payload = self._read()
            seed_groups = {
                "agents": (AGENTS, "agent_id"),
                "scenarios": (SCENARIOS, "scenario_id"),
                "strategy_options": (STRATEGY_OPTIONS, "option_id"),
                "learning": (LEARNING_EPISODES, "episode_id"),
            }
            for table, (rows, key) in seed_groups.items():
                existing = {(row["tenant_id"], row[key]) for row in payload[table] if "tenant_id" in row}
                for tenant_id in DEMO_TENANTS:
                    for row in rows:
                        if (tenant_id, row[key]) in existing:
                            continue
                        payload[table].append({**row, "tenant_id": tenant_id, "updated_at": utc_now_iso()})
                        created += 1
            existing_state = {row["tenant_id"] for row in payload["state"] if "tenant_id" in row}
            for tenant_id in DEMO_TENANTS:
                if tenant_id not in existing_state:
                    payload["state"].append(
                        {
                            "tenant_id": tenant_id,
                            "scenario_id": "hotel_fire_dual_incident",
                            "objective": "minimize casualties",
                            "governance_mode": "approval_required",
                            "plan_status": "awaiting_approval",
                            "updated_at": utc_now_iso(),
                        }
                    )
                    created += 1
            self._write(payload)
        return {"created": created}

    def rows(self, table: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [dict(row) for row in self._read()[table] if row.get("tenant_id") in tenant_ids]

    def state(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            for row in payload["state"]:
                if row.get("tenant_id") in tenant_ids:
                    return dict(row)
        return {"tenant_id": tenant_ids[0], "scenario_id": "hotel_fire_dual_incident", "objective": "minimize casualties", "governance_mode": "approval_required", "plan_status": "awaiting_approval"}

    def set_state(self, tenant_ids: list[str], updates: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            selected: dict[str, Any] | None = None
            for row in payload["state"]:
                if row.get("tenant_id") in tenant_ids:
                    row.update(updates)
                    row["updated_at"] = utc_now_iso()
                    selected = dict(row)
            if selected is None:
                selected = {"tenant_id": tenant_ids[0], "scenario_id": "hotel_fire_dual_incident", "objective": "minimize casualties", "governance_mode": "approval_required", "plan_status": "awaiting_approval", **updates, "updated_at": utc_now_iso()}
                payload["state"].append(selected)
            self._write(payload)
        return selected

    def record_event(self, tenant_ids: list[str], action: str, payload_data: dict[str, Any] | None = None) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            event = {"event_id": f"AIC-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_ids[0], "action": action, "payload": payload_data or {}, "created_at": utc_now_iso()}
            payload["events"].append(event)
            self._write(payload)
        return event


ai_council_store = AICouncilStore(settings.sentra_ai_council_store_path)


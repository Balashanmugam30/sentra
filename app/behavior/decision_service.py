from __future__ import annotations

from typing import Any

from app.behavior.crowd_service import crowd_service
from app.behavior.decision_store import decision_store
from app.behavior.store import utc_now_iso


def _clamp(value: float, low: int = 0, high: int = 100) -> int:
    return max(low, min(high, round(value)))


def _urgency(score: int) -> str:
    if score >= 86:
        return "critical"
    if score >= 72:
        return "high"
    if score >= 54:
        return "elevated"
    return "controlled"


class DecisionService:
    def _scenario(self, tenant_ids: list[str], scenario_id: str | None = None) -> dict[str, Any]:
        return decision_store.active_scenario(tenant_ids, scenario_id)

    def _risk_score(self, scenario: dict[str, Any]) -> int:
        return _clamp(
            int(scenario["panic_level"]) * 0.22
            + int(scenario["crowd_density"]) * 0.18
            + int(scenario["fire_smoke_gas_risk"]) * 0.2
            + int(scenario["blocked_exits"]) * 7
            + int(scenario["time_pressure"]) * 0.18
            + int(scenario["vulnerable_people"]) * 0.035
            + (100 - int(scenario["compliance_score"])) * 0.12
        )

    def actions(self, scenario: dict[str, Any]) -> list[dict[str, Any]]:
        risk = self._risk_score(scenario)
        actions = [
            {
                "action_id": "ACT-PANIC-CONTAIN",
                "title": "Contain panic with authoritative calm instructions",
                "rank": 1,
                "urgency": _urgency(risk),
                "confidence": _clamp(92 - int(scenario["panic_level"]) * 0.08 + int(scenario["compliance_score"]) * 0.06),
                "expected_outcome": "panic probability reduced within 90 seconds",
                "owner": "Communications Lead",
            },
            {
                "action_id": "ACT-SPLIT-FLOW",
                "title": "Split crowd flow across secondary exits",
                "rank": 2,
                "urgency": "high" if int(scenario["crowd_density"]) >= 78 else "elevated",
                "confidence": _clamp(86 - int(scenario["blocked_exits"]) * 5 + int(scenario["responder_availability"]) * 0.08),
                "expected_outcome": "corridor pressure reduced by 18-27%",
                "owner": "Floor Marshals",
            },
            {
                "action_id": "ACT-RESPONDER-FIRST",
                "title": f"Send responders first to {scenario['primary_zone']}",
                "rank": 3,
                "urgency": "critical" if int(scenario["fire_smoke_gas_risk"]) >= 80 else "high",
                "confidence": _clamp(78 + int(scenario["responder_availability"]) * 0.15 - int(scenario["time_pressure"]) * 0.04),
                "expected_outcome": "visible leadership raises compliance and protects vulnerable occupants",
                "owner": "Responder Team",
            },
            {
                "action_id": "ACT-ASSISTANCE-LANE",
                "title": "Reserve assisted evacuation lane",
                "rank": 4,
                "urgency": "high" if int(scenario["vulnerable_people"]) >= 100 else "elevated",
                "confidence": _clamp(81 + int(scenario["compliance_score"]) * 0.08),
                "expected_outcome": "special assistance queue stabilizes before bottleneck creation",
                "owner": "Medical and Security",
            },
        ]
        return sorted(actions, key=lambda action: int(action["rank"]))

    def messages(self, tenant_ids: list[str], scenario_id: str | None = None) -> dict[str, Any]:
        scenario = self._scenario(tenant_ids, scenario_id)
        tone = "authority tone" if int(scenario["panic_level"]) >= 72 else "calm tone"
        if scenario["hazard"] in {"security_rumor", "crowd_surge", "transit_surge"}:
            optimized = f"Please move calmly. Follow Sentra staff to the marked alternate route. Do not push. {scenario['primary_zone']} is being opened in controlled waves."
        elif scenario["hazard"] == "gas_leak":
            optimized = f"Leave {scenario['primary_zone']} now by the green route. Do not use open flames or elevators. Staff will guide assisted patients first."
        else:
            optimized = f"Proceed calmly to the assigned exit. Avoid {scenario['primary_zone']} smoke corridor. Follow staff hand signals and mobile route arrows."
        return {
            "generated_at": utc_now_iso(),
            "scenario": scenario["name"],
            "recommended_tone": tone,
            "announcement": optimized,
            "strict_tone": optimized.replace("Please move calmly.", "Move now in controlled lines."),
            "urgency_tone": optimized.replace("Proceed calmly", "Proceed now, calmly"),
            "multilingual": ["English", "Hindi", "Tamil", "Arabic"],
            "why": "Message selected from panic, compliance, hazard type, and crowd-density pressure.",
        }

    def strategies(self, tenant_ids: list[str], scenario_id: str | None = None) -> dict[str, Any]:
        scenario = self._scenario(tenant_ids, scenario_id)
        base_risk = self._risk_score(scenario)
        strategy_rows = [
            ("Full evacuation", 100 - base_risk * 0.18, 24, _clamp(base_risk + 6), 74, int(scenario["financial_exposure"]) * 1.0, int(scenario["reputation_exposure"]) + 4),
            ("Partial corridor evacuation", 92 - base_risk * 0.12, 18, _clamp(base_risk - 9), 82, int(scenario["financial_exposure"]) * 0.64, int(scenario["reputation_exposure"]) - 7),
            ("Shelter in place", 86 - int(scenario["fire_smoke_gas_risk"]) * 0.28, 38, _clamp(base_risk - 3), 70, int(scenario["financial_exposure"]) * 0.42, int(scenario["reputation_exposure"]) + 2),
            ("Zone lockdown", 78 - int(scenario["panic_level"]) * 0.18, 31, _clamp(base_risk + 4), 66, int(scenario["financial_exposure"]) * 0.58, int(scenario["reputation_exposure"]) + 8),
            ("Guided phased evacuation", 95 - base_risk * 0.1, 16, _clamp(base_risk - 16), 90, int(scenario["financial_exposure"]) * 0.5, int(scenario["reputation_exposure"]) - 12),
        ]
        strategies = []
        for name, casualty_safety, evac_time, panic_probability, trust_impact, financial_damage, reputation_impact in strategy_rows:
            score = _clamp(casualty_safety * 0.28 + (100 - evac_time * 2) * 0.18 + (100 - panic_probability) * 0.22 + trust_impact * 0.2 + (100 - reputation_impact) * 0.12)
            strategies.append(
                {
                    "strategy": name,
                    "casualty_risk": _clamp(100 - casualty_safety),
                    "evac_time_minutes": max(8, round(evac_time)),
                    "panic_probability": panic_probability,
                    "trust_impact": _clamp(trust_impact),
                    "financial_damage": round(financial_damage),
                    "reputation_impact": _clamp(reputation_impact),
                    "score": score,
                }
            )
        winner = max(strategies, key=lambda row: int(row["score"]))
        return {
            "generated_at": utc_now_iso(),
            "scenario": scenario["name"],
            "strategies": strategies,
            "winner": winner,
            "why_winner_selected": "Selected by minimizing panic and casualty risk while preserving route trust and evacuation speed.",
        }

    def decision(self, tenant_ids: list[str], scenario_id: str | None = None) -> dict[str, Any]:
        scenario = self._scenario(tenant_ids, scenario_id)
        crowd = crowd_service.crowd(tenant_ids, scenario.get("environment_id"))
        risk = self._risk_score(scenario)
        strategies = self.strategies(tenant_ids, scenario["scenario_id"])
        message = self.messages(tenant_ids, scenario["scenario_id"])
        trust = self.trust(tenant_ids, scenario["scenario_id"])
        return {
            "generated_at": utc_now_iso(),
            "scenario": scenario,
            "live_human_risk_score": risk,
            "urgency": _urgency(risk),
            "recommended_actions": self.actions(scenario),
            "panic_containment_plan": [
                "Switch all displays to one route instruction per zone",
                "Deploy visible staff marshals at convergence points",
                "Repeat calm authority message every 45 seconds",
                "Suppress conflicting local announcements",
            ],
            "crowd_split_strategy": {
                "split_required": int(scenario["crowd_density"]) >= 76,
                "primary_flow": crowd["routes"][0]["target_exit"],
                "secondary_flow": crowd["routes"][1]["target_exit"] if len(crowd["routes"]) > 1 else "secondary managed exit",
                "ratio": "60/40" if int(scenario["blocked_exits"]) == 0 else "45/55 toward alternate exit",
                "reason": "Density and corridor pressure exceed safe single-exit flow thresholds.",
            },
            "zone_messaging_orders": [
                {"zone": scenario["primary_zone"], "tone": message["recommended_tone"], "message": message["announcement"], "confidence": 91},
                {"zone": "Secondary exits", "tone": "directional authority", "message": "Follow green arrows. Keep moving in two lines. Do not return for belongings.", "confidence": 88},
            ],
            "exit_control_decisions": [
                {"exit": exit_row["name"], "decision": "open and meter" if not exit_row["blocked"] else "close and reroute", "pressure": exit_row["pressure"], "why": exit_row["control_action"]}
                for exit_row in crowd["exit_pressure"][:4]
            ],
            "response_timeline": [
                {"minute": "0-1", "decision": "broadcast optimized message and freeze conflicting audio", "confidence": 93},
                {"minute": "1-3", "decision": "split crowd and deploy responders to visible leadership points", "confidence": 89},
                {"minute": "3-8", "decision": "meter stairwell load and prioritize vulnerable occupants", "confidence": 86},
                {"minute": "8-20", "decision": "verify exit pressure and update re-entry posture", "confidence": 82},
            ],
            "confidence_meter": {
                "overall": trust["overall_trust"],
                "sensor_quality": 92,
                "crowd_model": crowd["summary"]["safe_route_confidence"],
                "human_compliance": scenario["compliance_score"],
                "commander_review_required": risk >= 76,
            },
            "approval_queue": decision_store.approval_queue(tenant_ids),
            "override_options": [
                "switch to full evacuation",
                "lockdown high-risk zone",
                "shelter vulnerable occupants",
                "pause autonomous messages",
            ],
            "expected_outcome": {
                "panic_reduction_percent": _clamp(18 + int(scenario["compliance_score"]) * 0.12),
                "stampede_risk_reduction_percent": _clamp(24 + int(scenario["responder_availability"]) * 0.1),
                "compliance_gain_percent": _clamp(12 + (100 - int(scenario["compliance_score"])) * 0.1),
                "evacuation_time_saved_minutes": 7 if strategies["winner"]["strategy"] == "Guided phased evacuation" else 4,
            },
        }

    def trust(self, tenant_ids: list[str], scenario_id: str | None = None) -> dict[str, Any]:
        scenario = self._scenario(tenant_ids, scenario_id)
        trust_score = _clamp(int(scenario["compliance_score"]) * 0.34 + int(scenario["responder_availability"]) * 0.22 + (100 - int(scenario["panic_level"])) * 0.16 + 38)
        return {
            "generated_at": utc_now_iso(),
            "scenario": scenario["name"],
            "overall_trust": trust_score,
            "obey_probability": _clamp(trust_score + 5),
            "delay_probability": _clamp(100 - trust_score + int(scenario["panic_level"]) * 0.08),
            "override_risk": _clamp(100 - trust_score + int(scenario["crowd_density"]) * 0.07),
            "trust_drivers": ["visible responders", "message clarity", "route confidence", "reduced crowd pressure"],
        }

    def approval(self, tenant_ids: list[str]) -> dict[str, Any]:
        queue = decision_store.approval_queue(tenant_ids)
        return {
            "generated_at": utc_now_iso(),
            "pending": queue,
            "total_pending": len(queue),
            "highest_priority": queue[0]["action"] if queue else "none",
            "governance_mode": "approval_required",
        }

    def run(self, tenant_ids: list[str], scenario_id: str | None = None) -> dict[str, Any]:
        scenario = self._scenario(tenant_ids, scenario_id)
        event = decision_store.record_event(tenant_ids, "human_decision_engine_run", {"scenario_id": scenario["scenario_id"]})
        return {"event": event, "decision": self.decision(tenant_ids, scenario["scenario_id"])}

    def simulate(self, tenant_ids: list[str], scenario_id: str | None = None) -> dict[str, Any]:
        scenario = self._scenario(tenant_ids, scenario_id)
        event = decision_store.record_event(tenant_ids, "human_response_simulation_run", {"scenario_id": scenario["scenario_id"]})
        return {"event": event, "scenario": scenario["name"], "decision": self.decision(tenant_ids, scenario["scenario_id"]), "strategy": self.strategies(tenant_ids, scenario["scenario_id"])}

    def approve(self, tenant_ids: list[str], approval_id: str | None = None) -> dict[str, Any]:
        result = decision_store.approve(tenant_ids, approval_id)
        return {**result, "decision": self.decision(tenant_ids)}

    def override(self, tenant_ids: list[str], reason: str | None = None) -> dict[str, Any]:
        result = decision_store.override(tenant_ids, reason)
        return {**result, "decision": self.decision(tenant_ids)}


decision_service = DecisionService()

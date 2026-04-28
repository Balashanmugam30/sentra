from __future__ import annotations

from statistics import mean
from typing import Any

from app.behavior.decision_service import decision_service
from app.behavior.learning_store import learning_store
from app.behavior.store import utc_now_iso


def _clamp(value: float, low: int = 0, high: int = 100) -> int:
    return max(low, min(high, round(value)))


class LearningService:
    def incidents(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return learning_store.incidents(tenant_ids)

    def memory(self, tenant_ids: list[str]) -> dict[str, Any]:
        incidents = self.incidents(tenant_ids)
        nodes = []
        edges = []
        for incident in incidents:
            scenario_node = f"scenario:{incident['scenario']}"
            action_node = f"action:{incident['action_chosen']}"
            outcome_node = f"outcome:{incident['crowd_outcome']}"
            trust_node = f"trust:+{incident['trust_delta']}"
            move_node = f"next:{incident['best_next_move']}"
            nodes.extend(
                [
                    {"id": scenario_node, "label": incident["scenario"], "type": "scenario"},
                    {"id": action_node, "label": incident["action_chosen"], "type": "action"},
                    {"id": outcome_node, "label": incident["crowd_outcome"], "type": "outcome"},
                    {"id": trust_node, "label": f"Trust +{incident['trust_delta']}", "type": "trust"},
                    {"id": move_node, "label": incident["best_next_move"], "type": "best_next_move"},
                ]
            )
            edges.extend(
                [
                    {"from": scenario_node, "to": action_node, "strength": incident["success_score"]},
                    {"from": action_node, "to": outcome_node, "strength": incident["panic_reduction_percent"]},
                    {"from": outcome_node, "to": trust_node, "strength": incident["trust_delta"]},
                    {"from": trust_node, "to": move_node, "strength": incident["compliance_percent"]},
                ]
            )
        return {"generated_at": utc_now_iso(), "nodes": nodes[:40], "edges": edges[:40], "memory_depth": len(incidents) * 5}

    def learning(self, tenant_ids: list[str]) -> dict[str, Any]:
        incidents = self.incidents(tenant_ids)
        avg_success = mean(int(incident["success_score"]) for incident in incidents)
        avg_panic_reduction = mean(int(incident["panic_reduction_percent"]) for incident in incidents)
        avg_compliance = mean(int(incident["compliance_percent"]) for incident in incidents)
        time_saved = sum(int(incident["baseline_time_minutes"]) - int(incident["evacuation_time_minutes"]) for incident in incidents)
        roi_saved = sum(int(incident["roi_saved"]) for incident in incidents)
        failed_actions = [failure for incident in incidents for failure in incident["failed_actions"]]
        playbooks = [
            {
                "playbook_id": f"PLAYBOOK-{index + 1:03d}",
                "title": incident["future_recommendation"],
                "improvement": incident["improved_weight"],
                "population_type": incident["population_type"],
                "confidence": _clamp(int(incident["success_score"]) + int(incident["trust_delta"]) * 0.4),
            }
            for index, incident in enumerate(incidents)
        ]
        return {
            "generated_at": utc_now_iso(),
            "model_improvement_score": _clamp(avg_success * 0.55 + avg_panic_reduction * 0.25 + avg_compliance * 0.2),
            "episodes_learned": len(incidents),
            "avg_panic_reduction": round(avg_panic_reduction),
            "avg_compliance": round(avg_compliance),
            "evacuation_minutes_saved": time_saved,
            "injuries_prevented": sum(int(incident["injuries_prevented"]) for incident in incidents),
            "roi_saved_estimate": roi_saved,
            "incident_memory_ledger": incidents,
            "successful_actions": [incident["action_chosen"] for incident in incidents],
            "failed_actions": failed_actions[:8],
            "population_pattern_insights": [
                "Hotel guests comply faster when staff are visible before smoke becomes visible.",
                "Students need rumor correction and app confirmation before phased release.",
                "Patients require quiet clinical instructions and escort teams before public routing.",
                "Event crowds respond best to localized gate messages and visible flow stewards.",
            ],
            "updated_playbooks": playbooks,
            "future_risk_signals": self.future_signals(tenant_ids)["signals"],
            "learning_timeline": [
                {"phase": "Incident captured", "gain": "+6%", "detail": "Action, crowd outcome, panic reduction, and compliance stored"},
                {"phase": "Weights improved", "gain": "+9%", "detail": "Message clarity and stairwell pressure weights adjusted"},
                {"phase": "Playbook evolved", "gain": "+12%", "detail": "Population-specific intervention plans generated"},
                {"phase": "Council trust updated", "gain": "+8%", "detail": "Agent reliability adjusted by outcome evidence"},
            ],
            "trust_drift": self.trust_drift(tenant_ids),
            "executive_summary": "Sentra learned that early visible leadership, population-specific messaging, and split-flow routing produce the strongest reduction in panic and evacuation delay.",
        }

    def future_signals(self, tenant_ids: list[str]) -> dict[str, Any]:
        _ = tenant_ids
        return {
            "generated_at": utc_now_iso(),
            "signals": [
                {"signal": "panic rebound", "probability": 34, "trigger": "announcement gap exceeds 90 seconds", "countermeasure": "repeat calm authority message"},
                {"signal": "re-entry rush", "probability": 41, "trigger": "all-clear ambiguity", "countermeasure": "stage re-entry by zone readiness"},
                {"signal": "rumor spread", "probability": 52, "trigger": "social chatter rises before official update", "countermeasure": "publish localized verified update"},
                {"signal": "crowd reversal", "probability": 29, "trigger": "blocked exit discovered late", "countermeasure": "pre-position alternate route signage"},
                {"signal": "rescue clustering", "probability": 38, "trigger": "multiple help requests in same corridor", "countermeasure": "split responder teams and preserve assistance lane"},
            ],
        }

    def trust_drift(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        incidents = self.incidents(tenant_ids)
        avg_trust = mean(int(incident["trust_delta"]) for incident in incidents)
        return [
            {"source": "Safety Agent", "trust": _clamp(88 + avg_trust), "drift": "+7"},
            {"source": "Crowd Dynamics Agent", "trust": _clamp(86 + avg_trust), "drift": "+9"},
            {"source": "Medical Agent", "trust": _clamp(84 + avg_trust), "drift": "+8"},
            {"source": "Communications Agent", "trust": _clamp(87 + avg_trust), "drift": "+11"},
            {"source": "Security Agent", "trust": _clamp(81 + avg_trust), "drift": "+5"},
            {"source": "Ethics Agent", "trust": _clamp(90 + avg_trust), "drift": "+4"},
        ]

    def agents(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        decision = decision_service.decision(tenant_ids)
        risk = int(decision["live_human_risk_score"])
        return [
            {"agent_id": "AGENT-SAFETY", "name": "Safety Agent", "priority": "reduce harm first", "plan": "meter exits and prevent pushing at convergence points", "confidence": _clamp(92 - risk * 0.04), "constraint": "do not overload stairwells", "reasoning": "Safety improves fastest when flow is controlled before panic peaks."},
            {"agent_id": "AGENT-CROWD", "name": "Crowd Dynamics Agent", "priority": "stabilize movement", "plan": "split high-density zones into two exit streams", "confidence": 91, "constraint": "keep corridor pressure under 80", "reasoning": "Split flow reduces stampede risk and preserves route trust."},
            {"agent_id": "AGENT-MED", "name": "Medical Agent", "priority": "protect vulnerable occupants", "plan": "reserve assisted evacuation lane and escort queue", "confidence": 89, "constraint": "avoid mixing stretcher and crowd flow", "reasoning": "Medical outcomes degrade when assistance queues enter public surge flow."},
            {"agent_id": "AGENT-COMMS", "name": "Communications Agent", "priority": "increase compliance", "plan": "broadcast localized calm authority message every 45 seconds", "confidence": 94, "constraint": "avoid conflicting instructions", "reasoning": "Repeated clear messages prevent rumor rebound and freeze behavior."},
            {"agent_id": "AGENT-SECURITY", "name": "Security Agent", "priority": "protect perimeter and access", "plan": "lock reverse-flow corridors and route responders first", "confidence": 86, "constraint": "do not block assisted path", "reasoning": "Security should prevent reversal without reducing safe egress."},
            {"agent_id": "AGENT-ETHICS", "name": "Ethics Agent", "priority": "protect human autonomy and vulnerable groups", "plan": "require human approval for lockdown and prioritize accessible routing", "confidence": 96, "constraint": "no coercive messaging beyond safety need", "reasoning": "Autonomy is acceptable only with proportional, explainable interventions."},
        ]

    def council(self, tenant_ids: list[str]) -> dict[str, Any]:
        agents = self.agents(tenant_ids)
        consensus = _clamp(mean(int(agent["confidence"]) for agent in agents) - 4)
        return {
            "generated_at": utc_now_iso(),
            "agents": agents,
            "debate_feed": [
                {"round": 1, "speaker": "Crowd Dynamics Agent", "message": "Split flow now; single-gate pressure is the highest stampede driver."},
                {"round": 1, "speaker": "Medical Agent", "message": "Approve split only if assisted lane remains isolated from public flow."},
                {"round": 2, "speaker": "Communications Agent", "message": "Message must name the alternate route and repeat every 45 seconds."},
                {"round": 2, "speaker": "Security Agent", "message": "Reverse-flow corridors need soft closure, not hard lockdown."},
                {"round": 3, "speaker": "Ethics Agent", "message": "Human approval gate required for lockdown; flow control can proceed semi-autonomously."},
                {"round": 3, "speaker": "Safety Agent", "message": "Consensus: split flow, preserve assisted lane, and issue localized calm authority instructions."},
            ],
            "consensus": {
                "score": consensus,
                "alignment": "strong",
                "dissent": "Ethics Agent requires approval for hard lockdown only",
                "confidence": _clamp(consensus + 3),
            },
            "final_unified_plan": [
                "Broadcast population-specific calm authority message immediately",
                "Split crowd between primary and secondary exits using 60/40 flow",
                "Reserve assisted evacuation lane with medical escort team",
                "Soft-close reverse-flow corridors and keep exits visible",
                "Monitor panic rebound and rumor spread every 90 seconds",
                "Require human approval before lockdown or coercive intervention",
            ],
            "human_approval_gate": {
                "required": True,
                "pending_action": "hard lockdown and high-coercion broadcast remain approval-gated",
                "safe_autonomous_scope": "messages, responder staging, exit metering, and assistance lane preservation",
                "sla_minutes": 2,
            },
            "secondary_reactions": self.future_signals(tenant_ids)["signals"],
            "adaptive_messages": [
                {"population": "students", "style": "authoritative campus voice plus app confirmation"},
                {"population": "hotel guests", "style": "staff-led calm instructions with room/floor specificity"},
                {"population": "patients", "style": "quiet clinical escort instructions"},
                {"population": "elderly", "style": "slow-paced reassurance and visible escort"},
                {"population": "staff", "style": "direct tasking and zone ownership"},
                {"population": "multilingual visitors", "style": "short translated commands plus arrows"},
            ],
        }

    def learn(self, tenant_ids: list[str], scenario: str | None = None) -> dict[str, Any]:
        event = learning_store.record_event(tenant_ids, "behavior_learning_cycle_run", {"scenario": scenario or "latest_human_outcome"})
        return {"event": event, "learning": self.learning(tenant_ids)}

    def run_council(self, tenant_ids: list[str], scenario: str | None = None) -> dict[str, Any]:
        event = learning_store.record_event(tenant_ids, "behavior_council_run", {"scenario": scenario or "active_crisis"})
        return {"event": event, "council": self.council(tenant_ids)}

    def approve_policy(self, tenant_ids: list[str], policy_id: str | None = None) -> dict[str, Any]:
        policy = learning_store.approve_policy(tenant_ids, policy_id)
        event = learning_store.record_event(tenant_ids, "behavior_policy_approved", {"policy_id": policy["policy_id"]})
        return {"event": event, "policy": policy, "learning": self.learning(tenant_ids)}

    def reset(self, tenant_ids: list[str]) -> dict[str, Any]:
        return learning_store.reset_events(tenant_ids)


learning_service = LearningService()

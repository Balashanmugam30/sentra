from __future__ import annotations

from statistics import mean
from typing import Any

from app.aicouncil.store import ai_council_store, utc_now_iso


OBJECTIVE_WEIGHTS: dict[str, dict[str, float]] = {
    "minimize casualties": {"safety": 0.42, "speed": 0.24, "reputation": 0.12, "continuity": 0.14, "cost_control": 0.08},
    "fastest recovery": {"speed": 0.34, "continuity": 0.25, "safety": 0.22, "reputation": 0.1, "cost_control": 0.09},
    "preserve revenue": {"cost_control": 0.3, "continuity": 0.28, "reputation": 0.18, "speed": 0.14, "safety": 0.1},
    "protect reputation": {"reputation": 0.36, "safety": 0.25, "continuity": 0.17, "speed": 0.13, "cost_control": 0.09},
    "maintain continuity": {"continuity": 0.34, "safety": 0.22, "speed": 0.18, "reputation": 0.15, "cost_control": 0.11},
}


class AICouncilService:
    def agents(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        state = ai_council_store.state(tenant_ids)
        scenario = self._scenario(tenant_ids, state["scenario_id"])
        options = self._scored_options(tenant_ids, state["objective"], scenario)
        top_option = options[0]
        agents: list[dict[str, Any]] = []
        for agent in ai_council_store.rows("agents", tenant_ids):
            pressure = self._agent_pressure(agent["agent_id"], scenario)
            option_scores = self._agent_option_scores(agent["agent_id"], options, scenario)
            preferred = max(option_scores, key=lambda item: int(item["score"]))
            agents.append(
                {
                    **agent,
                    "current_focus": self._agent_focus(agent["agent_id"], scenario),
                    "recommended_option": preferred["option_id"],
                    "recommended_option_label": preferred["label"],
                    "alignment_with_plan": max(72, min(99, 100 - abs(int(preferred["score"]) - int(top_option["score"])))),
                    "urgency": min(99, pressure),
                    "confidence": min(98, round(int(agent["confidence_calibration"]) * 0.62 + int(agent["trust_score"]) * 0.38 - max(0, scenario["human_risk"] - 85) * 0.1)),
                    "option_scores": option_scores,
                    "reasoning": self._agent_reasoning(agent["agent_id"], scenario, preferred),
                }
            )
        return agents

    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        state = ai_council_store.state(tenant_ids)
        scenario = self._scenario(tenant_ids, state["scenario_id"])
        agents = self.agents(tenant_ids)
        debate = self.debate(tenant_ids)
        plan = self.plan(tenant_ids)
        learning = self.learning(tenant_ids)
        trust_score = self._trust_score(agents, learning["episodes"])
        return {
            "generated_at": utc_now_iso(),
            "scenario": scenario,
            "objective": state["objective"],
            "governance_mode": state["governance_mode"],
            "plan_status": state["plan_status"],
            "alignment_score": debate["consensus"]["alignment_score"],
            "consensus_score": debate["consensus"]["consensus_score"],
            "trust_score": trust_score,
            "active_agents": len(agents),
            "current_debate": debate["rounds"],
            "conflicts": debate["conflicts"],
            "recommended_plan": plan,
            "ranked_actions": plan["ranked_actions"],
            "confidence_trail": self._confidence_trail(scenario, agents, plan),
            "learning_summary": learning["summary"],
            "executive_copilot": {
                "recommended_objective": state["objective"],
                "one_click_actions": ["Reduce Losses Now", "Fastest Recovery", "Protect Reputation", "Preserve Revenue", "Safety First"],
                "summary": f"Best governed plan is {plan['winner']['label']} with {debate['consensus']['consensus_score']}% consensus and {trust_score}/100 trust.",
            },
        }

    def debate(self, tenant_ids: list[str], payload: dict[str, Any] | None = None) -> dict[str, Any]:
        state = ai_council_store.state(tenant_ids)
        scenario_id = (payload or {}).get("scenario_id") or state["scenario_id"]
        objective = (payload or {}).get("objective") or state["objective"]
        if scenario_id != state["scenario_id"] or objective != state["objective"]:
            ai_council_store.set_state(tenant_ids, {"scenario_id": scenario_id, "objective": objective, "plan_status": "awaiting_approval"})
        scenario = self._scenario(tenant_ids, scenario_id)
        options = self._scored_options(tenant_ids, objective, scenario)
        agents = self.agents(tenant_ids)
        winner = options[0]
        conflicts = self._conflicts(scenario, winner)
        rounds = [
            {"round": 1, "theme": "Objective interpretation", "speaker": "Commander Agent", "position": f"Objective is {objective}; stabilize {scenario['label']} with {winner['label']}.", "challenge": "Governance Agent requires approval before public-impact actions."},
            {"round": 2, "theme": "Safety versus continuity", "speaker": "Safety Agent", "position": "Life safety weighting dominates while preserving responder lanes.", "challenge": "Finance Agent accepts higher cost if ETA to stability improves."},
            {"round": 3, "theme": "Cross-module orchestration", "speaker": "Logistics Agent", "position": "Use MLOps risk, route health, communications, and resources to sequence actions.", "challenge": "Cyber Agent demands fallback channels if SOC pressure rises."},
            {"round": 4, "theme": "Final merge", "speaker": "Governance Agent", "position": f"Approve {winner['label']} with human checkpoint and audit evidence.", "challenge": "All agents accept policy guardrails and rollback path."},
        ]
        consensus = {
            "consensus_score": round(mean(int(agent["alignment_with_plan"]) for agent in agents)),
            "alignment_score": min(99, round(mean(int(agent["confidence"]) for agent in agents) * 0.5 + winner["score"] * 0.5)),
            "dissenting_agents": [agent["name"] for agent in agents if int(agent["alignment_with_plan"]) < 82],
            "merged_plan": f"{winner['label']} governed by {objective}, with cross-module execution and human approval checkpoints.",
            "winner": winner,
        }
        result = {"generated_at": utc_now_iso(), "scenario": scenario, "objective": objective, "options": options, "rounds": rounds, "conflicts": conflicts, "consensus": consensus}
        ai_council_store.record_event(tenant_ids, "debate_executed", {"scenario_id": scenario_id, "objective": objective, "winner": winner["option_id"]})
        return result

    def set_objective(self, tenant_ids: list[str], objective: str | None) -> dict[str, Any]:
        selected = objective if objective in OBJECTIVE_WEIGHTS else "minimize casualties"
        state = ai_council_store.set_state(tenant_ids, {"objective": selected, "plan_status": "objective_changed"})
        ai_council_store.record_event(tenant_ids, "objective_changed", {"objective": selected})
        return {"generated_at": utc_now_iso(), "state": state, "summary": self.summary(tenant_ids)}

    def plan(self, tenant_ids: list[str]) -> dict[str, Any]:
        state = ai_council_store.state(tenant_ids)
        scenario = self._scenario(tenant_ids, state["scenario_id"])
        options = self._scored_options(tenant_ids, state["objective"], scenario)
        winner = options[0]
        ranked_actions = self._ranked_actions(scenario, winner)
        return {
            "generated_at": utc_now_iso(),
            "plan_id": f"PLAN-{scenario['scenario_id'].upper()}-{winner['option_id'].upper()}",
            "objective": state["objective"],
            "winner": winner,
            "ranked_actions": ranked_actions,
            "resource_orders": [
                {"resource": "Ops Alpha", "order": "Move to primary incident zone", "eta": "3 min"},
                {"resource": "Security Bravo", "order": "Hold perimeter while keeping safe exits open", "eta": "4 min"},
                {"resource": "Comms Desk", "order": "Send role and zone targeted message", "eta": "90 sec"},
            ],
            "eta_to_stability": scenario["eta_to_stability"],
            "approval_required": True,
            "explainability": [
                f"MLOps risk signal {scenario['mlops_signal']} and human risk {scenario['human_risk']} increased urgency.",
                f"Objective '{state['objective']}' shifted weights toward {winner['label']}.",
                "Cyber, communications, workflow, resources, and finance signals were included before ranking actions.",
            ],
        }

    def approve(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        state = ai_council_store.set_state(tenant_ids, {"plan_status": "approved"})
        event = ai_council_store.record_event(tenant_ids, "plan_approved", {"reason": payload.get("reason") or "Executive approved recommended plan", "plan_id": payload.get("plan_id")})
        return {"generated_at": utc_now_iso(), "state": state, "event": event, "plan": self.plan(tenant_ids)}

    def override(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        mode = payload.get("mode") or "manual_override"
        state = ai_council_store.set_state(tenant_ids, {"plan_status": "overridden", "governance_mode": mode})
        event = ai_council_store.record_event(tenant_ids, "human_override", {"reason": payload.get("reason") or "Human override applied", "mode": mode, "action_id": payload.get("action_id")})
        return {"generated_at": utc_now_iso(), "state": state, "event": event, "summary": self.summary(tenant_ids)}

    def learning(self, tenant_ids: list[str]) -> dict[str, Any]:
        episodes = sorted(ai_council_store.rows("learning", tenant_ids), key=lambda row: row["episode_id"])
        accepted = [episode for episode in episodes if bool(episode["accepted"])]
        rejected = [episode for episode in episodes if not bool(episode["accepted"])]
        win_rates = [
            {"strategy": episode["decision"], "scenario": episode["scenario"], "win_rate": episode["strategy_win_rate"], "lesson": episode["lesson"]}
            for episode in episodes
        ]
        return {
            "generated_at": utc_now_iso(),
            "episodes": episodes,
            "accepted_decisions": len(accepted),
            "rejected_decisions": len(rejected),
            "override_reasons": [
                {"reason": "legal asked to delay statement", "count": 1, "policy_update": "pre-approve holding statements"},
                {"reason": "communications tone softened", "count": 1, "policy_update": "prefer calm authority during rumor-driven surges"},
                {"reason": "executive required cyber proof", "count": 1, "policy_update": "include SOC evidence in hybrid-crisis plans"},
            ],
            "strategy_win_rates": win_rates,
            "confidence_drift": [
                {"domain": "human behavior", "before": 84, "after": 90, "driver": "crowd response outcomes"},
                {"domain": "cyber orchestration", "before": 80, "after": 86, "driver": "access-control failure recovery"},
                {"domain": "public reputation", "before": 82, "after": 78, "driver": "legal delay on public statement"},
            ],
            "policy_updates": [
                {"policy_id": "POL-COMMS-HOLDING", "title": "Pre-approved holding statement library", "status": "pending_approval", "impact": "reduces PR delay cost"},
                {"policy_id": "POL-CYBER-EVIDENCE", "title": "Hybrid crisis SOC evidence packet", "status": "approved", "impact": "raises executive trust"},
                {"policy_id": "POL-MEDICAL-LANE", "title": "Protect medical lane in every high-density evacuation", "status": "approved", "impact": "improves evacuation speed"},
            ],
            "best_playbooks": ["corridor_first plus surge response", "targeted lockdown with cyber isolation", "surge response and calm multilingual messaging"],
            "summary": "The council is learning strongest gains from human behavior outcomes, hybrid cyber evidence, and pre-approved communications playbooks.",
        }

    def retrain(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        domain = payload.get("domain") or "strategic weights"
        event = ai_council_store.record_event(tenant_ids, "strategic_weights_retrained", {"domain": domain, "reason": payload.get("reason") or "learning drift and override feedback"})
        return {"generated_at": utc_now_iso(), "event": event, "learning": self.learning(tenant_ids)}

    def _scenario(self, tenant_ids: list[str], scenario_id: str) -> dict[str, Any]:
        scenarios = ai_council_store.rows("scenarios", tenant_ids)
        for scenario in scenarios:
            if scenario["scenario_id"] == scenario_id:
                return scenario
        return scenarios[0]

    def _scored_options(self, tenant_ids: list[str], objective: str, scenario: dict[str, Any]) -> list[dict[str, Any]]:
        weights = OBJECTIVE_WEIGHTS.get(objective, OBJECTIVE_WEIGHTS["minimize casualties"])
        options = []
        pressure = (int(scenario["mlops_signal"]) + int(scenario["human_risk"]) + int(scenario["cyber_pressure"])) / 3
        for option in ai_council_store.rows("strategy_options", tenant_ids):
            weighted = sum(float(option[key]) * weight for key, weight in weights.items())
            score = round(weighted * 0.78 + float(option["base_score"]) * 0.12 + pressure * 0.1)
            options.append({**option, "score": min(99, score), "objective_fit": round(weighted), "pressure_adjustment": round(pressure)})
        return sorted(options, key=lambda row: int(row["score"]), reverse=True)

    def _agent_pressure(self, agent_id: str, scenario: dict[str, Any]) -> int:
        mapping = {
            "commander_agent": max(scenario["mlops_signal"], scenario["resource_load"]),
            "safety_agent": max(scenario["human_risk"], scenario["mlops_signal"]),
            "logistics_agent": max(100 - scenario["route_health"], scenario["resource_load"]),
            "finance_agent": scenario["finance_exposure"],
            "reputation_agent": scenario["public_pressure"],
            "cyber_agent": scenario["cyber_pressure"],
            "human_behavior_agent": scenario["human_risk"],
            "governance_agent": max(scenario["public_pressure"], scenario["finance_exposure"]),
        }
        return int(mapping[agent_id])

    def _agent_option_scores(self, agent_id: str, options: list[dict[str, Any]], scenario: dict[str, Any]) -> list[dict[str, Any]]:
        bias_key = {
            "commander_agent": "speed",
            "safety_agent": "safety",
            "logistics_agent": "continuity",
            "finance_agent": "cost_control",
            "reputation_agent": "reputation",
            "cyber_agent": "continuity",
            "human_behavior_agent": "safety",
            "governance_agent": "reputation",
        }[agent_id]
        return [
            {"option_id": option["option_id"], "label": option["label"], "score": min(99, round(option["score"] * 0.68 + option[bias_key] * 0.32))}
            for option in options
        ]

    def _agent_focus(self, agent_id: str, scenario: dict[str, Any]) -> str:
        focus = {
            "commander_agent": f"Drive stability in {scenario['eta_to_stability']}",
            "safety_agent": f"Reduce human risk {scenario['human_risk']}/100",
            "logistics_agent": f"Protect route health {scenario['route_health']}/100",
            "finance_agent": f"Limit exposure {scenario['finance_exposure']}/100",
            "reputation_agent": f"Manage public pressure {scenario['public_pressure']}/100",
            "cyber_agent": f"Contain cyber pressure {scenario['cyber_pressure']}/100",
            "human_behavior_agent": "Increase compliance and prevent panic rebound",
            "governance_agent": "Keep autonomy inside approval guardrails",
        }
        return focus[agent_id]

    def _agent_reasoning(self, agent_id: str, scenario: dict[str, Any], option: dict[str, Any]) -> str:
        return f"{option['label']} is favored because {self._agent_focus(agent_id, scenario).lower()} while preserving cross-module auditability."

    def _conflicts(self, scenario: dict[str, Any], winner: dict[str, Any]) -> list[dict[str, Any]]:
        return [
            {"conflict": "Speed vs safety", "agents": ["Commander Agent", "Safety Agent"], "resolution": f"{winner['label']} keeps intervention fast while preserving life-safety checkpoints.", "severity": "high"},
            {"conflict": "Public clarity vs legal exposure", "agents": ["Reputation Agent", "Governance Agent"], "resolution": "Use pre-approved holding statement and board-visible audit trail.", "severity": "medium"},
            {"conflict": "Cyber isolation vs evacuation continuity", "agents": ["Cyber Agent", "Logistics Agent"], "resolution": "Shift to fallback channels while route orchestration remains live.", "severity": "medium" if scenario["cyber_pressure"] >= 50 else "low"},
        ]

    def _ranked_actions(self, scenario: dict[str, Any], winner: dict[str, Any]) -> list[dict[str, Any]]:
        return [
            {"action_id": "ACT-001", "rank": 1, "title": f"Execute {winner['label']} response", "owner": "Commander Agent", "system": "Workflow automations", "decision": "approve", "confidence": winner["score"], "approval_required": True},
            {"action_id": "ACT-002", "rank": 2, "title": "Dispatch resources to highest-risk zone", "owner": "Logistics Agent", "system": "Resource systems", "decision": "queue", "confidence": 92, "approval_required": False},
            {"action_id": "ACT-003", "rank": 3, "title": "Send targeted human-stabilizing communications", "owner": "Human Behavior Agent", "system": "Communications", "decision": "execute", "confidence": 91, "approval_required": False},
            {"action_id": "ACT-004", "rank": 4, "title": "Isolate digital fallback channels if SOC pressure increases", "owner": "Cyber Agent", "system": "SOC alerts", "decision": "queue", "confidence": 88 if scenario["cyber_pressure"] >= 50 else 80, "approval_required": False},
            {"action_id": "ACT-005", "rank": 5, "title": "Open executive continuity brief", "owner": "Finance Agent", "system": "Finance impact models", "decision": "approve", "confidence": 86, "approval_required": True},
        ]

    def _trust_score(self, agents: list[dict[str, Any]], episodes: list[dict[str, Any]]) -> int:
        accepted_rate = 100 * len([episode for episode in episodes if bool(episode["accepted"])]) / max(1, len(episodes))
        agent_trust = mean(int(agent["trust_score"]) for agent in agents)
        override_penalty = mean(int(agent["override_rate"]) for agent in agents) * 0.34
        return min(99, round(agent_trust * 0.62 + accepted_rate * 0.32 - override_penalty))

    def _confidence_trail(self, scenario: dict[str, Any], agents: list[dict[str, Any]], plan: dict[str, Any]) -> list[dict[str, Any]]:
        return [
            {"signal": "MLOps predictions", "score": scenario["mlops_signal"], "effect": "raised urgency and selected earlier intervention"},
            {"signal": "Human behavior model", "score": scenario["human_risk"], "effect": "increased communications and crowd-control priority"},
            {"signal": "Route health", "score": scenario["route_health"], "effect": "validated route-aware action sequencing"},
            {"signal": "Agent calibration", "score": round(mean(int(agent["confidence"]) for agent in agents)), "effect": "kept recommendation above approval threshold"},
            {"signal": "Strategy winner", "score": plan["winner"]["score"], "effect": f"ranked {plan['winner']['label']} as best governed option"},
        ]


ai_council_service = AICouncilService()


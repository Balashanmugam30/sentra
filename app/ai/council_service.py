from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ai.council_store import council_store
from app.ai.service import SCENARIOS, run_decision


AgentSpec = dict[str, Any]


def _now() -> datetime:
    return datetime.now(timezone.utc)


SCENARIO_LABELS: dict[str, str] = {
    "hotel_kitchen_fire": "Hotel kitchen fire",
    "basement_gas_leak": "Basement gas leak",
    "hospital_icu_fire": "Hospital ICU fire",
    "mall_stampede_risk": "Mall stampede risk",
    "cyber_physical_attack": "Cyber + physical attack",
    "multi_zone_crisis": "Multi-zone crisis",
}


COUNCIL_SCENARIOS: dict[str, dict[str, Any]] = {
    "hospital_icu_fire": {
        **SCENARIOS["hospital_oxygen_leak"],
        "label": "Hospital ICU fire",
        "incident_type": "fire_medical",
        "signals": ["flame_detected", "icu_smoke_alert", "oxygen_pressure_drop", "patient_evacuation_constraint"],
        "blocked_exits": ["Service lift bank", "West ICU corridor"],
        "occupancy": 612,
        "responders_eta_minutes": 3,
    },
    "mall_stampede_risk": {
        **SCENARIOS["mall_crowd_surge"],
        "label": "Mall stampede risk",
        "signals": ["crowd_density_91", "panic_cluster", "blocked_exit", "security_perimeter_gap"],
        "responders_eta_minutes": 5,
    },
    "cyber_physical_attack": {
        **SCENARIOS["power_outage_blockage"],
        "label": "Cyber + physical attack",
        "incident_type": "hybrid_attack",
        "signals": ["access_control_failure", "camera_dropout", "power_failure", "coordinated_intrusion"],
        "zone": "Command wing",
        "blocked_exits": ["Elevator bank", "North security gate"],
        "responders_eta_minutes": 4,
    },
    "multi_zone_crisis": {
        **SCENARIOS["hotel_kitchen_fire"],
        "label": "Multi-zone crisis",
        "signals": ["flame_detected", "gas_elevated", "panic_cluster", "corridor_blockage", "camera_validation_requested"],
        "blocked_exits": ["West service corridor", "Stairwell C"],
        "occupancy": 780,
        "responders_eta_minutes": 5,
        "prior_incidents": 4,
    },
}


AGENT_BASE: list[AgentSpec] = [
    {
        "agent_id": "fire_agent",
        "name": "Fire Agent",
        "domain": "Fire containment",
        "avatar": "F",
        "priority": "containment",
        "color": "red",
        "historical_accuracy": 94,
        "trust_score": 91,
        "override_rate": 8,
        "speed_score": 96,
        "confidence_drift": "+4%",
    },
    {
        "agent_id": "medical_agent",
        "name": "Medical Agent",
        "domain": "Triage and casualty reduction",
        "avatar": "M",
        "priority": "human safety",
        "color": "emerald",
        "historical_accuracy": 92,
        "trust_score": 89,
        "override_rate": 11,
        "speed_score": 88,
        "confidence_drift": "+3%",
    },
    {
        "agent_id": "security_agent",
        "name": "Security Agent",
        "domain": "Perimeter and crowd control",
        "avatar": "S",
        "priority": "access control",
        "color": "cyan",
        "historical_accuracy": 90,
        "trust_score": 87,
        "override_rate": 13,
        "speed_score": 91,
        "confidence_drift": "+2%",
    },
    {
        "agent_id": "logistics_agent",
        "name": "Logistics Agent",
        "domain": "Routes and resource allocation",
        "avatar": "L",
        "priority": "movement efficiency",
        "color": "blue",
        "historical_accuracy": 93,
        "trust_score": 90,
        "override_rate": 9,
        "speed_score": 94,
        "confidence_drift": "+5%",
    },
    {
        "agent_id": "communications_agent",
        "name": "Communications Agent",
        "domain": "Public and responder messaging",
        "avatar": "C",
        "priority": "message clarity",
        "color": "amber",
        "historical_accuracy": 88,
        "trust_score": 86,
        "override_rate": 15,
        "speed_score": 93,
        "confidence_drift": "+1%",
    },
    {
        "agent_id": "executive_risk_agent",
        "name": "Executive Risk Agent",
        "domain": "Continuity and liability",
        "avatar": "E",
        "priority": "business continuity",
        "color": "violet",
        "historical_accuracy": 91,
        "trust_score": 88,
        "override_rate": 12,
        "speed_score": 84,
        "confidence_drift": "+3%",
    },
]


def list_council_scenarios() -> list[dict[str, str]]:
    return [{"scenario_id": key, "label": label} for key, label in SCENARIO_LABELS.items()]


def _decision_for_scenario(scenario_id: str) -> dict[str, Any]:
    if scenario_id in COUNCIL_SCENARIOS:
        original = SCENARIOS.get(scenario_id)
        SCENARIOS[scenario_id] = COUNCIL_SCENARIOS[scenario_id]
        try:
            return run_decision(scenario_id)
        finally:
            if original is None:
                SCENARIOS.pop(scenario_id, None)
            else:
                SCENARIOS[scenario_id] = original
    if scenario_id not in SCENARIOS:
        scenario_id = "hotel_kitchen_fire"
    return run_decision(scenario_id)


def _agent_actions(agent_id: str, incident: dict[str, Any]) -> list[str]:
    zone = str(incident["zone"])
    floor = str(incident["floor"])
    action_map = {
        "fire_agent": [
            f"Isolate ignition source in {zone}",
            f"Start suppression timing for floor {floor}",
            "Prevent smoke migration through service corridor",
        ],
        "medical_agent": [
            "Open triage lane at east stairwell landing",
            "Deploy medic pair to mobility-impaired occupants",
            "Keep casualty extraction route clear of responders",
        ],
        "security_agent": [
            "Lock service elevators and hold unauthorized access",
            "Create perimeter around affected floor",
            "Prevent crowd backflow into hazard zone",
        ],
        "logistics_agent": [
            "Route occupants through east stairwell first",
            "Stage reserve responders two floors below incident",
            "Balance traffic away from blocked exits",
        ],
        "communications_agent": [
            "Send concise floor-specific evacuation instructions",
            "Prepare public statement but hold external broadcast",
            "Push responder channel update every 90 seconds",
        ],
        "executive_risk_agent": [
            "Preserve incident evidence and decision audit trail",
            "Prepare executive continuity summary",
            "Minimize disruption outside affected zones",
        ],
    }
    return action_map[agent_id]


def _build_agents(decision: dict[str, Any]) -> list[dict[str, Any]]:
    incident = decision["active_incident"]
    scores = decision["scores"]
    severity = int(scores["severity_score"])
    escalation = int(scores["escalation_risk"])
    agents: list[dict[str, Any]] = []
    for index, spec in enumerate(AGENT_BASE):
        urgency = min(100, severity + (index % 3) * 3 + (8 if spec["agent_id"] in {"fire_agent", "medical_agent"} else 0))
        confidence = min(98, int(spec["historical_accuracy"]) - len(incident["blocked_exits"]) + (2 if escalation < 85 else -2))
        actions = _agent_actions(str(spec["agent_id"]), incident)
        agents.append(
            {
                **spec,
                "urgency_score": urgency,
                "confidence": confidence,
                "top_actions": actions,
                "constraints": _constraints_for_agent(str(spec["agent_id"]), incident),
                "reasoning": _reasoning_for_agent(str(spec["agent_id"]), incident, scores),
                "stance": "support" if confidence >= 88 else "conditional",
            }
        )
    return agents


def _constraints_for_agent(agent_id: str, incident: dict[str, Any]) -> list[str]:
    blocked = ", ".join(incident["blocked_exits"]) or "no blocked exits reported"
    constraints = {
        "fire_agent": [f"Blocked path status: {blocked}", "Suppression must not trap occupants"],
        "medical_agent": ["Avoid stairwell overload for vulnerable occupants", "Keep medics out of active smoke until ingress is clear"],
        "security_agent": ["Do not lock exits needed for evacuation", "Prevent unauthorized entry without slowing responders"],
        "logistics_agent": [f"Responder ETA is {incident['responders_eta_minutes']} minutes", "Maintain reserve capacity if second zone triggers"],
        "communications_agent": ["Avoid panic language", "External statement waits for verified scope"],
        "executive_risk_agent": ["Preserve safety-first posture", "Continuity decisions cannot override life safety"],
    }
    return constraints[agent_id]


def _reasoning_for_agent(agent_id: str, incident: dict[str, Any], scores: dict[str, Any]) -> str:
    reason = {
        "fire_agent": f"{incident['incident_type']} signals and severity {scores['severity_score']}/100 require containment-first action.",
        "medical_agent": f"Occupancy {incident['occupancy']} and evacuation congestion create triage risk.",
        "security_agent": f"Blocked exits and crowd movement require perimeter control without blocking safe egress.",
        "logistics_agent": f"Route choices must account for {len(incident['blocked_exits'])} blocked exits and responder ETA.",
        "communications_agent": "Message sequencing can reduce panic while keeping responders synchronized.",
        "executive_risk_agent": f"Business impact {scores['business_impact_score']}/100 requires continuity updates after life-safety actions.",
    }
    return reason[agent_id]


def _build_debate_rounds(agents: list[dict[str, Any]], decision: dict[str, Any]) -> list[dict[str, Any]]:
    zone = decision["active_incident"]["zone"]
    return [
        {
            "round": 1,
            "theme": "Immediate posture",
            "exchanges": [
                {
                    "agent": "Fire Agent",
                    "position": f"Begin evacuation and isolate {zone} before smoke migration accelerates.",
                    "challenge": "Medical Agent warns stairwell congestion can create secondary injuries.",
                },
                {
                    "agent": "Security Agent",
                    "position": "Perimeter must form before evacuee flow crosses responder ingress.",
                    "challenge": "Logistics Agent requires east stairwell to remain open for occupants first.",
                },
            ],
        },
        {
            "round": 2,
            "theme": "Tradeoff negotiation",
            "exchanges": [
                {
                    "agent": "Medical Agent",
                    "position": "Use phased movement for vulnerable occupants and reserve medics at landing.",
                    "challenge": "Fire Agent accepts phased lane only if suppression starts immediately.",
                },
                {
                    "agent": "Communications Agent",
                    "position": "Issue floor-specific instructions now; hold public statement until scope is verified.",
                    "challenge": "Executive Risk Agent agrees if audit timeline records every delay rationale.",
                },
            ],
        },
        {
            "round": 3,
            "theme": "Unified plan merge",
            "exchanges": [
                {
                    "agent": "Logistics Agent",
                    "position": "Open east stairwell, reserve west corridor for responders, rebalance traffic every 90 seconds.",
                    "challenge": "All agents accept if Security keeps exits open and Communications avoids panic language.",
                },
                {
                    "agent": "Executive Risk Agent",
                    "position": "Life safety dominates; continuity plan starts only after resource dispatch.",
                    "challenge": "Consensus reached with medical lane protection and containment timing.",
                },
            ],
        },
    ]


def _build_conflicts(decision: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {
            "conflict": "Evacuate now vs phased evacuation",
            "agents": ["Fire Agent", "Medical Agent"],
            "risk": "Full evacuation is fastest but may overload stairwell flow.",
            "resolution": "Immediate partial evacuation with protected medical lane.",
            "score": 92,
        },
        {
            "conflict": "Lockdown vs open exits",
            "agents": ["Security Agent", "Logistics Agent"],
            "risk": "Perimeter control can slow safe egress if applied too broadly.",
            "resolution": "Lock service elevators only; keep east stairwell open.",
            "score": 89,
        },
        {
            "conflict": "Public alert now vs internal only",
            "agents": ["Communications Agent", "Executive Risk Agent"],
            "risk": "Premature public message may cause panic outside affected zones.",
            "resolution": "Internal floor alert now; public statement on standby.",
            "score": 86,
        },
        {
            "conflict": "Asset protection vs response speed",
            "agents": ["Executive Risk Agent", "Fire Agent"],
            "risk": "Continuity actions cannot delay suppression.",
            "resolution": "Safety-first dispatch, then continuity brief within 10 minutes.",
            "score": 94,
        },
    ]


def _build_unified_plan(decision: dict[str, Any]) -> list[dict[str, Any]]:
    incident = decision["active_incident"]
    return [
        {"step": 1, "title": f"Immediate partial evacuation of floor {incident['floor']}", "owner": "Fire Agent", "eta": "0-2 min"},
        {"step": 2, "title": "Open east stairwell and protect medical lane", "owner": "Logistics Agent", "eta": "1-3 min"},
        {"step": 3, "title": f"Dispatch fire team and medic unit to {incident['zone']}", "owner": "Medical Agent", "eta": "2-4 min"},
        {"step": 4, "title": "Lock service elevators while keeping safe exits open", "owner": "Security Agent", "eta": "2-5 min"},
        {"step": 5, "title": "Send floor-specific instructions; keep public statement standby", "owner": "Communications Agent", "eta": "3-6 min"},
        {"step": 6, "title": "Start executive continuity and evidence capture", "owner": "Executive Risk Agent", "eta": "6-10 min"},
    ]


def _consensus(agents: list[dict[str, Any]], conflicts: list[dict[str, Any]]) -> dict[str, Any]:
    avg_confidence = round(sum(int(agent["confidence"]) for agent in agents) / len(agents))
    conflict_quality = round(sum(int(conflict["score"]) for conflict in conflicts) / len(conflicts))
    consensus_score = round(avg_confidence * 0.56 + conflict_quality * 0.44)
    dissenting = [agent["name"] for agent in agents if int(agent["confidence"]) < 88]
    return {
        "consensus_score": consensus_score,
        "alignment_percent": min(98, consensus_score + 3),
        "dissenting_agents": dissenting,
        "final_merged_strategy": "Life-safety-first partial evacuation with protected medical lane, controlled perimeter, and staged communications.",
        "confidence": avg_confidence,
    }


def build_council_snapshot(scenario_id: str | None = None, *, force: bool = False) -> dict[str, Any]:
    state = council_store.get_state()
    selected = scenario_id or state.scenario_id
    if not force and state.last_snapshot and state.last_snapshot.get("scenario_id") == selected:
        snapshot = dict(state.last_snapshot)
        snapshot["governance"] = {**snapshot["governance"], "mode": state.governance_mode, "status": state.council_status}
        snapshot["council_timeline"] = state.timeline or snapshot["council_timeline"]
        return snapshot

    decision = _decision_for_scenario(selected)
    agents = _build_agents(decision)
    debate_rounds = _build_debate_rounds(agents, decision)
    conflicts = _build_conflicts(decision)
    consensus = _consensus(agents, conflicts)
    unified_plan = _build_unified_plan(decision)
    timeline = state.timeline or [
        {"timestamp": _now().isoformat(), "event": "Council activated", "detail": "Specialist agents loaded incident context.", "severity": "low"},
        {"timestamp": _now().isoformat(), "event": "Debate completed", "detail": "Three negotiation rounds produced unified strategy.", "severity": "medium"},
        {"timestamp": _now().isoformat(), "event": "Plan awaiting approval", "detail": "Governance mode requires human command approval.", "severity": "medium"},
    ]

    snapshot = {
        "generated_at": _now(),
        "scenario_id": selected,
        "incident": decision["active_incident"],
        "agreement_percent": consensus["alignment_percent"],
        "final_merged_strategy": consensus["final_merged_strategy"],
        "disagreements": [item["conflict"] for item in conflicts],
        "minority_concerns": [
            "Medical Agent requests monitored stairwell density before broad movement.",
            "Communications Agent recommends no external broadcast until scope is verified.",
        ],
        "fallback_strategy": "If stairwell congestion exceeds threshold, switch to shelter-in-place for low-risk zones and deploy additional route marshals.",
        "agents": [
            {
                "agent_id": agent["agent_id"],
                "name": agent["name"],
                "domain": agent["domain"],
                "proposed_action": agent["top_actions"][0],
                "confidence": agent["confidence"],
                "urgency": agent["urgency_score"],
                "rationale": agent["reasoning"],
                "stance": agent["stance"],
            }
            for agent in agents
        ],
        "specialist_agents": agents,
        "agent_recommendations": [
            {"agent_id": agent["agent_id"], "agent": agent["name"], "actions": agent["top_actions"], "confidence": agent["confidence"]}
            for agent in agents
        ],
        "debate_rounds": debate_rounds,
        "conflict_matrix": conflicts,
        "consensus": consensus,
        "final_unified_plan": unified_plan,
        "governance": {
            "mode": state.governance_mode,
            "status": state.council_status,
            "available_modes": ["advisory", "approval_required", "semi_auto", "full_auto"],
            "override_options": ["approve", "reject", "modify", "pause_agents"],
        },
        "trust_by_agent": [
            {
                "agent_id": agent["agent_id"],
                "name": agent["name"],
                "historical_accuracy": agent["historical_accuracy"],
                "trust_score": agent["trust_score"],
                "override_rate": agent["override_rate"],
                "speed_score": agent["speed_score"],
                "confidence_drift": agent["confidence_drift"],
            }
            for agent in agents
        ],
        "council_timeline": timeline,
        "human_override_options": ["Approve Plan", "Reject Plan", "Modify Plan", "Pause Agents"],
        "executive_summary": (
            f"Council reached {consensus['consensus_score']}% consensus for {decision['active_incident']['label']}. "
            f"Final strategy: {consensus['final_merged_strategy']}"
        ),
    }
    council_store.set_snapshot(snapshot)
    return snapshot


def run_council(scenario_id: str | None = None) -> dict[str, Any]:
    selected = scenario_id or council_store.get_state().scenario_id
    council_store.set_scenario(selected)
    council_store.set_status("debated")
    council_store.record_event("Council run completed", f"Six specialist agents debated {selected}.", "medium")
    return build_council_snapshot(selected, force=True)


def get_agents() -> dict[str, Any]:
    snapshot = build_council_snapshot()
    return {"generated_at": _now(), "scenario_id": snapshot["scenario_id"], "agents": snapshot["specialist_agents"]}


def get_debate() -> dict[str, Any]:
    snapshot = build_council_snapshot()
    return {"generated_at": _now(), "scenario_id": snapshot["scenario_id"], "debate_rounds": snapshot["debate_rounds"]}


def get_consensus() -> dict[str, Any]:
    snapshot = build_council_snapshot()
    return {
        "generated_at": _now(),
        "scenario_id": snapshot["scenario_id"],
        "consensus": snapshot["consensus"],
        "final_unified_plan": snapshot["final_unified_plan"],
    }


def approve_plan(reason: str | None = None) -> dict[str, Any]:
    council_store.set_status("approved")
    council_store.record_event("Plan approved", reason or "Human command approved the unified council plan.", "high")
    return build_council_snapshot(force=True)


def reject_plan(reason: str | None = None) -> dict[str, Any]:
    council_store.set_status("rejected")
    council_store.record_event("Plan rejected", reason or "Human command rejected the unified council plan.", "high")
    return build_council_snapshot(force=True)


def pause_agents(reason: str | None = None) -> dict[str, Any]:
    council_store.set_status("paused")
    council_store.record_event("Agents paused", reason or "Council agents paused for manual command review.", "medium")
    return build_council_snapshot(force=True)

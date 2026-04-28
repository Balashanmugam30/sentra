from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ai.learning_store import learning_store


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clamp(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, round(value)))


MEMORY_EPISODES: list[dict[str, Any]] = [
    {
        "memory_id": "LEARN-001",
        "incident_type": "hotel_fire",
        "severity": 84,
        "chosen_plan": "Full evacuation",
        "final_outcome": "Contained with stairwell congestion",
        "response_time_minutes": 14,
        "casualties_avoided": 41,
        "overrides": ["Medical lane added after congestion observed"],
        "confidence_at_time": 81,
        "environmental_conditions": "Dinner rush, west corridor smoke, 428 occupants",
        "strategy_score": 78,
    },
    {
        "memory_id": "LEARN-002",
        "incident_type": "gas_leak",
        "severity": 79,
        "chosen_plan": "HVAC shutdown plus targeted evacuation",
        "final_outcome": "Gas isolated before public panic",
        "response_time_minutes": 11,
        "casualties_avoided": 27,
        "overrides": [],
        "confidence_at_time": 86,
        "environmental_conditions": "Basement generator bay, humid night, low occupancy",
        "strategy_score": 89,
    },
    {
        "memory_id": "LEARN-003",
        "incident_type": "hospital_oxygen",
        "severity": 88,
        "chosen_plan": "Responder-first containment",
        "final_outcome": "ICU route preserved, medics staged late",
        "response_time_minutes": 18,
        "casualties_avoided": 64,
        "overrides": ["Medical weighting increased by command"],
        "confidence_at_time": 78,
        "environmental_conditions": "ICU oxygen manifold, vulnerable patients, service lift blocked",
        "strategy_score": 74,
    },
    {
        "memory_id": "LEARN-004",
        "incident_type": "crowd_surge",
        "severity": 82,
        "chosen_plan": "Perimeter plus guided exit lanes",
        "final_outcome": "Crowd pressure reduced without stampede",
        "response_time_minutes": 9,
        "casualties_avoided": 112,
        "overrides": [],
        "confidence_at_time": 90,
        "environmental_conditions": "Rain outside, weekend peak, escalator blockage",
        "strategy_score": 93,
    },
    {
        "memory_id": "LEARN-005",
        "incident_type": "false_alarm",
        "severity": 42,
        "chosen_plan": "Validate before broad evacuation",
        "final_outcome": "False alarm suppressed; no business disruption",
        "response_time_minutes": 5,
        "casualties_avoided": 0,
        "overrides": ["Operator requested manual camera confirmation"],
        "confidence_at_time": 72,
        "environmental_conditions": "Laundry utility steam, camera clear, single smoke sensor",
        "strategy_score": 91,
    },
]


def _strategy_rollups() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    strategies = [
        {
            "strategy": "Phased evacuation + medical corridor",
            "win_rate": 94,
            "avg_response_gain": "+32%",
            "best_for": "fire, hospital, high occupancy",
            "evidence": "Reduced stairwell congestion across hotel and ICU simulations.",
            "score": 96,
        },
        {
            "strategy": "HVAC shutdown before broad gas evacuation",
            "win_rate": 91,
            "avg_response_gain": "+24%",
            "best_for": "gas leak, basement utility rooms",
            "evidence": "Lower false panic and faster source isolation.",
            "score": 92,
        },
        {
            "strategy": "Perimeter plus guided exit lanes",
            "win_rate": 89,
            "avg_response_gain": "+27%",
            "best_for": "crowd surge, mall, stadium",
            "evidence": "Reduced backflow and protected responder ingress.",
            "score": 90,
        },
    ]
    worst = [
        {
            "strategy": "Immediate full evacuation without lane control",
            "failure_mode": "Stairwell congestion and medical access delay",
            "correction": "Use phased movement and protected triage lane.",
            "score": 61,
        },
        {
            "strategy": "Public broadcast before verification",
            "failure_mode": "Panic amplification and rumor acceleration",
            "correction": "Send internal zone instructions first; hold public statement.",
            "score": 58,
        },
    ]
    return strategies, worst


def _weak_signals() -> list[dict[str, Any]]:
    return [
        {
            "signal_id": "WS-101",
            "signal": "Kitchen Zone B temperature rising 1.8x faster than baseline",
            "source": "IoT telemetry",
            "probability": 76,
            "time_to_risk": "18 min",
            "recommended_action": "Pre-stage responder and inspect ventilation hood.",
        },
        {
            "signal_id": "WS-102",
            "signal": "Repeated panic-button tests clustered around Floor 8",
            "source": "Mobile operations",
            "probability": 64,
            "time_to_risk": "42 min",
            "recommended_action": "Dispatch staff wellness check and verify device status.",
        },
        {
            "signal_id": "WS-103",
            "signal": "Route congestion increasing near east stairwell during peak movement",
            "source": "Routing engine",
            "probability": 71,
            "time_to_risk": "25 min",
            "recommended_action": "Open auxiliary marshal lane before alarm state.",
        },
        {
            "signal_id": "WS-104",
            "signal": "Social rumor spike mentions smoke before sensor confirmation",
            "source": "OSINT",
            "probability": 58,
            "time_to_risk": "1h",
            "recommended_action": "Prepare verified internal statement and monitor for escalation.",
        },
    ]


def _future_forecast() -> list[dict[str, Any]]:
    return [
        {
            "window": "Next 5 min",
            "branch": "Fire contained if suppression starts within two minutes",
            "probability": 82,
            "impact": "Low spread, moderate disruption",
        },
        {
            "window": "Next 15 min",
            "branch": "Smoke spreads west wing if corridor remains blocked",
            "probability": 63,
            "impact": "Higher evacuation pressure and responder congestion",
        },
        {
            "window": "Next 1 hour",
            "branch": "External media pressure rises if guest-facing alert leaks early",
            "probability": 47,
            "impact": "Reputation risk; executive comms needed",
        },
        {
            "window": "Next 6 hours",
            "branch": "Re-entry readiness depends on ventilation reset and audit timeline",
            "probability": 74,
            "impact": "Business continuity and insurance evidence",
        },
    ]


def _trust_drift() -> list[dict[str, Any]]:
    return [
        {"subject": "Fire Agent", "trust_score": 93, "drift": "+5%", "driver": "Correctly preferred partial evacuation after corridor signal."},
        {"subject": "Medical Agent", "trust_score": 91, "drift": "+7%", "driver": "Protected triage lane reduced congestion in simulations."},
        {"subject": "Security Agent", "trust_score": 88, "drift": "+2%", "driver": "Perimeter policy succeeded when exit locks stayed scoped."},
        {"subject": "Sensors", "trust_score": 84, "drift": "-3%", "driver": "Noisy smoke sensor produced one false alarm."},
        {"subject": "Camera Vision", "trust_score": 89, "drift": "+4%", "driver": "Public corridor validation reduced false evacuation risk."},
        {"subject": "Human Operators", "trust_score": 94, "drift": "+6%", "driver": "Overrides improved medical lane timing."},
    ]


def _policy_recommendations(revision: int, approved: list[str]) -> list[dict[str, Any]]:
    policies = [
        {
            "policy_id": "POL-17C-01",
            "title": "Evacuate gas-adjacent zones earlier when fluctuations persist",
            "current_weight": 72,
            "recommended_weight": 81,
            "reason": "Gas leak simulations stabilized faster when HVAC isolation began before broad evacuation.",
            "status": "approved" if "POL-17C-01" in approved else "pending_approval",
            "revision": revision,
        },
        {
            "policy_id": "POL-17C-02",
            "title": "Prefer corridor-first routing for hospital incidents",
            "current_weight": 68,
            "recommended_weight": 84,
            "reason": "Hospital scenarios improved when medical lanes were protected before general movement.",
            "status": "approved" if "POL-17C-02" in approved else "pending_approval",
            "revision": revision,
        },
        {
            "policy_id": "POL-17C-03",
            "title": "Reduce trust in single-source smoke alarms without camera confirmation",
            "current_weight": 76,
            "recommended_weight": 66,
            "reason": "False alarm memory shows better outcomes when second-signal confirmation is required.",
            "status": "approved" if "POL-17C-03" in approved else "pending_approval",
            "revision": revision,
        },
    ]
    return policies


def _simulation_lab() -> list[dict[str, Any]]:
    return [
        {"scenario_id": "hotel_fire_night_shift", "label": "Hotel fire night shift", "runs": 420, "improvement": "+29%", "best_plan": "Phased evacuation + fire containment"},
        {"scenario_id": "stadium_panic", "label": "Stadium panic", "runs": 260, "improvement": "+22%", "best_plan": "Guided exit lanes + perimeter"},
        {"scenario_id": "oxygen_leak", "label": "Oxygen leak", "runs": 310, "improvement": "+34%", "best_plan": "Medical-first corridor preservation"},
        {"scenario_id": "flood_outage", "label": "Flood + outage", "runs": 185, "improvement": "+18%", "best_plan": "Shelter route plus generator protection"},
        {"scenario_id": "mall_surge", "label": "Mall surge", "runs": 295, "improvement": "+27%", "best_plan": "Crowd flow metering"},
    ]


def _decision_evolution() -> dict[str, Any]:
    return {
        "past_recommendation": "Full evacuation",
        "current_recommendation": "Phased evacuation + medical corridor",
        "benefit": "32% faster movement with lower stairwell congestion",
        "confidence_before": 78,
        "confidence_after": 91,
        "why_changed": [
            "Medical overrides repeatedly improved outcomes.",
            "Corridor congestion was the dominant failure mode.",
            "Camera validation reduced false-positive evacuation pressure.",
        ],
    }


def _executive_value(cycles: int) -> dict[str, Any]:
    return {
        "response_time_improvement": f"+{31 + min(cycles, 6)}%",
        "false_alarm_reduction": "+24%",
        "trust_increase": "+18%",
        "prevented_losses_estimate": "$1.9M",
        "learning_maturity_score": _clamp(88 + cycles * 2),
        "summary": "Sentra is converting incident outcomes and human overrides into safer, faster response policy.",
    }


def build_learning_snapshot() -> dict[str, Any]:
    state = learning_store.get_state()
    best, worst = _strategy_rollups()
    episodes = MEMORY_EPISODES
    learning_score = _clamp(86 + state.learning_cycles * 2 + len(state.approved_policies))
    trend = [
        {"label": "Baseline", "score": 72},
        {"label": "After memory replay", "score": 81},
        {"label": "After council overrides", "score": 88},
        {"label": "Current", "score": learning_score},
    ]
    return {
        "generated_at": _now(),
        "learning_score": learning_score,
        "learning_maturity": "adaptive" if learning_score < 94 else "self-improving",
        "episodes_learned": len(episodes) + state.learning_cycles,
        "memory": episodes,
        "similar_incidents": episodes[:3],
        "best_strategies": best,
        "worst_strategies": worst,
        "improvement_trend": trend,
        "override_reasons": [
            {"reason": "Need protected medical corridor", "count": 8, "policy_effect": "Medical weighting increased"},
            {"reason": "Single sensor not trusted", "count": 5, "policy_effect": "Require second signal for broad evacuation"},
            {"reason": "Public alert too early", "count": 4, "policy_effect": "Comms gating tightened"},
        ],
        "trust_drift": _trust_drift(),
        "policy_recommendations": _policy_recommendations(state.policy_revision, state.approved_policies),
        "weak_signals": _weak_signals(),
        "future_forecast": _future_forecast(),
        "decision_evolution": _decision_evolution(),
        "simulation_lab": _simulation_lab(),
        "governance": {
            "mode": state.governance_mode,
            "available_modes": ["observe_only", "recommend_only", "learn_with_approval", "learn_automatically_safe_scope"],
            "policy_revision": state.policy_revision,
            "approved_policies": state.approved_policies,
        },
        "executive_value": _executive_value(state.learning_cycles),
        "learning_timeline": state.timeline,
    }


def run_learning_cycle(scenario_id: str | None = None) -> dict[str, Any]:
    scenario = scenario_id or learning_store.get_state().last_simulation
    learning_store.record_cycle(scenario)
    return build_learning_snapshot()


def get_memory() -> dict[str, Any]:
    snapshot = build_learning_snapshot()
    return {
        "generated_at": snapshot["generated_at"],
        "memory": snapshot["memory"],
        "similar_incidents": snapshot["similar_incidents"],
        "decision_evolution": snapshot["decision_evolution"],
    }


def get_forecast() -> dict[str, Any]:
    snapshot = build_learning_snapshot()
    return {
        "generated_at": snapshot["generated_at"],
        "weak_signals": snapshot["weak_signals"],
        "future_forecast": snapshot["future_forecast"],
    }


def get_trust() -> dict[str, Any]:
    snapshot = build_learning_snapshot()
    return {
        "generated_at": snapshot["generated_at"],
        "trust_drift": snapshot["trust_drift"],
        "learning_score": snapshot["learning_score"],
    }


def get_policies() -> dict[str, Any]:
    snapshot = build_learning_snapshot()
    return {
        "generated_at": snapshot["generated_at"],
        "policy_recommendations": snapshot["policy_recommendations"],
        "governance": snapshot["governance"],
    }


def simulate_learning(scenario_id: str | None = None) -> dict[str, Any]:
    return run_learning_cycle(scenario_id or "hotel_fire_night_shift")


def approve_policy(policy_id: str) -> dict[str, Any]:
    learning_store.approve_policy(policy_id)
    return build_learning_snapshot()

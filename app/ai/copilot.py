from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Any

from app.ai.cascade import build_cascade_snapshot, test_cascade_scenario
from app.ai.decision_engine import build_autonomous_snapshot
from app.ai.negotiation import build_negotiation_snapshot
from app.ai.orchestration import build_orchestration_snapshot, build_predictive_forecast, execute_plan
from app.ai.strategic_learning import build_campaign_plan, build_confidence_drift, build_trust_dashboard, simulate_campaign
from app.ai.swarm import build_swarm_snapshot


_lock = Lock()
_executed_copilot_plans: list[dict[str, Any]] = []
_demo_sequence = 0


INTENT_PROFILES: dict[str, dict[str, Any]] = {
    "stabilize_operations_now": {
        "label": "Stabilize operations now",
        "priority": "balanced_containment",
        "risk": "Medium",
        "departments": ["Operations", "Security", "Facility", "Communications"],
    },
    "minimize_casualties": {
        "label": "Minimize casualties",
        "priority": "life_safety",
        "risk": "Low tolerance",
        "departments": ["Medical", "Operations", "Communications"],
    },
    "protect_reputation": {
        "label": "Protect reputation",
        "priority": "verified_narrative",
        "risk": "Medium",
        "departments": ["Executive", "Communications", "OSINT"],
    },
    "preserve_revenue": {
        "label": "Preserve revenue",
        "priority": "continuity",
        "risk": "Medium-high",
        "departments": ["Executive", "Operations", "Facility"],
    },
    "fastest_recovery": {
        "label": "Fastest recovery",
        "priority": "time_to_stability",
        "risk": "Managed",
        "departments": ["Operations", "Field", "Public Safety"],
    },
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clamp(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, round(value)))


def _build_plan(intent: str) -> dict[str, Any]:
    profile = INTENT_PROFILES.get(intent, INTENT_PROFILES["stabilize_operations_now"])
    live = build_autonomous_snapshot()
    campaign = build_campaign_plan()
    cascade = build_cascade_snapshot()
    confidence = build_confidence_drift()
    eta = str(live["recovery_eta"])
    approval_count = 2 if intent in {"preserve_revenue", "protect_reputation"} else 1
    return {
        "intent": intent,
        "label": profile["label"],
        "priority": profile["priority"],
        "plan_steps": [
            f"Activate {campaign['phases'][0]['objective'].lower()} for {live['affected_zones'][0]}.",
            f"Interrupt cascade at: {cascade['best_interruption_node']}.",
            f"Use campaign phase owner {campaign['phases'][1]['owner']} for people-flow stabilization.",
            f"Publish executive checkpoint after confidence reaches {confidence['confidence_after']}%.",
        ],
        "approvals_needed": approval_count,
        "eta": eta,
        "risks": [profile["risk"], f"Cascade risk {cascade['cascade_risk_score']}%", f"Current urgency {live['urgency_score']}%"],
        "departments_impacted": profile["departments"],
        "expected_outcome": f"{profile['label']} converts top AI decision into a governed multi-step command plan.",
    }


def build_copilot_snapshot() -> dict[str, Any]:
    plans = [_build_plan(intent) for intent in INTENT_PROFILES]
    live = build_autonomous_snapshot()
    return {
        "generated_at": _now(),
        "copilot_state": "ready",
        "recommended_intent": "minimize_casualties" if int(live["urgency_score"]) >= 74 else "stabilize_operations_now",
        "intent_plans": plans,
        "executed_plans": list(_executed_copilot_plans)[:6],
        "summary": f"Executive copilot can convert {len(plans)} strategic intents into governed command plans.",
    }


def execute_copilot_intent(intent: str) -> dict[str, Any]:
    plan = _build_plan(intent)
    orchestration = execute_plan()
    executed = {
        "execution_id": f"COP-{len(_executed_copilot_plans) + 101}",
        "timestamp": _now(),
        "intent": plan["intent"],
        "label": plan["label"],
        "status": "queued_for_approval" if int(plan["approvals_needed"]) > 0 else "executed",
        "next_action": orchestration["next_action"],
    }
    with _lock:
        _executed_copilot_plans.insert(0, executed)
        del _executed_copilot_plans[20:]
    return build_copilot_snapshot()


def build_supremacy_score() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    forecast = build_predictive_forecast()["forecasts"][0]
    swarm = build_swarm_snapshot()
    trust = build_trust_dashboard()
    orchestration = build_orchestration_snapshot()
    readiness = int(swarm["global_efficiency"])
    confidence = int(live["confidence_score"])
    containment = int(forecast["containment_probability"])
    trust_score = int(trust["avg_human_trust_score"])
    speed = _clamp(100 - int(str(live["recovery_eta"]).split(" ", 1)[0]) * 1.25)
    health = 84 if orchestration["orchestration_state"] != "advisory_watch" else 72
    score = _clamp(readiness * 0.2 + confidence * 0.22 + containment * 0.2 + trust_score * 0.14 + speed * 0.14 + health * 0.1)
    label = "dominant" if score >= 81 else "strong" if score >= 61 else "pressured" if score >= 31 else "fragile"
    return {
        "generated_at": _now(),
        "score": score,
        "label": label,
        "components": {
            "readiness": readiness,
            "ai_confidence": confidence,
            "trust": trust_score,
            "containment_probability": containment,
            "response_speed": speed,
            "system_health": health,
        },
        "summary": f"Decision Supremacy is {label} at {score}/100 across readiness, confidence, trust, containment, speed, and health.",
    }


def run_cinematic_demo() -> dict[str, Any]:
    global _demo_sequence
    with _lock:
        _demo_sequence += 1
    test_cascade_scenario("fire_corridor_blocked")
    simulate_campaign("fire_corridor_blocked")
    swarm = build_swarm_snapshot()
    cascade = build_cascade_snapshot()
    copilot = build_copilot_snapshot()
    supremacy = build_supremacy_score()
    return {
        "generated_at": _now(),
        "demo_id": f"DEMO-{_demo_sequence:03d}",
        "state": "running",
        "chapters": [
            "Calm campus baseline",
            "Crisis detected by weak signals",
            "AI forecasts cascade reaction",
            "Swarm response launches",
            "Executive copilot selects strategy",
            "Crisis stabilized and recovery metrics shown",
        ],
        "active_chapter": "Swarm response launches",
        "swarm_efficiency": swarm["global_efficiency"],
        "cascade_risk": cascade["cascade_risk_score"],
        "copilot_intent": copilot["recommended_intent"],
        "supremacy_score": supremacy["score"],
    }

from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Any

from app.ai.decision_engine import build_autonomous_snapshot, run_cycle, set_autonomy_mode, set_test_scenario
from app.ai.memory import append_decision_memory


_lock = Lock()
_timeline: list[dict[str, Any]] = []
_executed_actions: list[dict[str, Any]] = []
_sequence = 300
_autonomy_mode = "approval_required"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _next_id(prefix: str) -> str:
    global _sequence
    with _lock:
        _sequence += 1
        return f"{prefix}-{_sequence}"


def _record_timeline(title: str, detail: str, event_type: str = "adaptation") -> dict[str, Any]:
    event = {
        "event_id": _next_id("AITL"),
        "timestamp": _now(),
        "event_type": event_type,
        "title": title,
        "detail": detail,
    }
    with _lock:
        _timeline.insert(0, event)
        del _timeline[40:]
    return event


def set_response_autonomy_mode(mode: str) -> dict[str, Any]:
    global _autonomy_mode
    _autonomy_mode = mode
    legacy_mode = {
        "advisory": "advisory",
        "approval_required": "approval_required",
        "semi_auto": "semi_auto",
        "full_auto": "full_auto",
        "lockdown_emergency": "lockdown_emergency",
    }.get(mode, mode)
    set_autonomy_mode(legacy_mode)
    _record_timeline("Autonomy mode changed", f"Operator set response orchestration to {mode}.", "governance")
    return build_orchestration_snapshot()


def _money(value: int) -> str:
    if value >= 1_000_000:
        return f"${round(value / 1_000_000, 1)}M"
    return f"${round(value / 1_000)}K"


def build_predictive_forecast() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    urgency = int(live["urgency_score"])
    confidence = int(live["confidence_score"])
    threat = str(live["top_threat"])
    horizons = [
        ("next 5 min", 5, 0.72),
        ("next 15 min", 15, 0.86),
        ("next 30 min", 30, 1.0),
        ("next 60 min", 60, 1.18),
        ("next 6 hr", 360, 1.62),
    ]
    forecasts: list[dict[str, Any]] = []
    for label, minutes, multiplier in horizons:
        escalation = max(5, min(96, round((urgency * multiplier) - confidence * 0.28)))
        containment = max(4, min(98, round(confidence * 0.92 - (minutes / 12) + (100 - urgency) * 0.18)))
        casualties = max(1, min(100, round(urgency * multiplier * 0.42 + escalation * 0.2)))
        downtime = max(8, round(minutes * 0.34 + urgency * multiplier * 0.58))
        loss = round((urgency * 8_500 + downtime * 3_200) * multiplier)
        forecasts.append(
            {
                "horizon": label,
                "top_risks": [
                    f"{threat.title()} escalation pressure",
                    "Responder delay from corridor and traffic constraints",
                    "Reputation or continuity impact if communication lags",
                ][: 2 if label == "next 5 min" else 3],
                "containment_probability": containment,
                "escalation_probability": escalation,
                "casualties_risk": casualties,
                "downtime_minutes": downtime,
                "projected_loss": _money(loss),
                "recovery_eta": f"{max(12, downtime + 8)} min",
                "confidence": max(45, min(96, round(confidence - minutes / 30))),
            }
        )
    return {"generated_at": _now(), "forecasts": forecasts}


def build_scenario_branches() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    urgency = int(live["urgency_score"])
    confidence = int(live["confidence_score"])
    branches_seed = [
        ("A", "Evacuate immediately", 0.72, 1.08, 0.92, 0.88),
        ("B", "Corridor isolation first", 0.62, 0.82, 0.72, 0.78),
        ("C", "Full lockdown", 0.86, 1.18, 0.64, 1.08),
        ("D", "Mutual aid surge", 0.58, 1.02, 0.84, 0.72),
    ]
    branches: list[dict[str, Any]] = []
    for option, name, casualty_factor, cost_factor, reputation_factor, speed_factor in branches_seed:
        casualty = max(3, min(100, round(urgency * casualty_factor)))
        downtime = max(8, min(240, round(urgency * speed_factor + 12)))
        financial = round((urgency * 9_000 + downtime * 2_400) * cost_factor)
        reputation = max(4, min(100, round((urgency + (100 - confidence)) * 0.52 * reputation_factor)))
        containment = max(8, min(98, round(confidence - casualty * 0.18 + (100 - downtime / 3) * 0.16)))
        score = round(containment * 1.4 - casualty * 1.1 - reputation * 0.55 - downtime * 0.08)
        branches.append(
            {
                "option": option,
                "strategy": name,
                "casualty_risk": casualty,
                "downtime_minutes": downtime,
                "financial_cost": _money(financial),
                "reputation_impact": reputation,
                "containment_chance": containment,
                "recovery_speed": max(1, min(100, 100 - downtime // 2)),
                "score": score,
                "rationale": f"{name} balances {live['top_threat']} pressure against recovery and reputation risk.",
            }
        )
    winner = max(branches, key=lambda item: int(item["score"]))
    return {"generated_at": _now(), "branches": branches, "winning_strategy": winner}


def build_orchestration_snapshot() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    threshold_met = int(live["confidence_score"]) >= 74 and int(live["urgency_score"]) >= 68
    approval_required = _autonomy_mode in {"advisory", "approval_required"} or live["top_decision"]["approval_required"]
    mode_state = "holding_for_approval" if approval_required else "ready_to_execute" if threshold_met else "advisory_watch"
    actions = list(_executed_actions)
    if not actions:
        actions = [
            {
                "action_id": "AIACT-SEED-1",
                "timestamp": _now(),
                "title": "Prepared response playbook",
                "target": live["affected_zones"][0],
                "status": "queued" if approval_required else "ready",
                "system": "ai",
                "approval_required": approval_required,
            }
        ]
    return {
        "generated_at": _now(),
        "autonomy_mode": _autonomy_mode,
        "orchestration_state": mode_state,
        "confidence_threshold_met": threshold_met,
        "executed_actions": actions[:8],
        "pending_approvals": len([item for item in actions if item["status"] == "queued"]) + (1 if approval_required else 0),
        "next_action": live["top_decision"]["title"],
    }


def execute_plan() -> dict[str, Any]:
    live = build_autonomous_snapshot(force=True)
    approval_required = _autonomy_mode in {"advisory", "approval_required"} or live["top_decision"]["approval_required"]
    status = "queued" if approval_required else "executed"
    action = {
        "action_id": _next_id("AIACT"),
        "timestamp": _now(),
        "title": live["top_decision"]["title"],
        "target": live["affected_zones"][0],
        "status": status,
        "system": live["top_decision"]["action_type"],
        "approval_required": approval_required,
    }
    with _lock:
        _executed_actions.insert(0, action)
        del _executed_actions[30:]
    append_decision_memory(
        decision=action["title"],
        status="pending" if approval_required else "approved",
        scenario=str(live["top_threat"]).replace(" ", "_"),
        outcome_quality=live["confidence_score"],
        response_speed=live["urgency_score"],
        false_alarm=False,
        time_to_stabilize_minutes=max(8, int(str(live["recovery_eta"]).split(" ", 1)[0])),
        lesson=f"Orchestrator {status} {action['title']} under {_autonomy_mode} mode.",
    )
    _record_timeline("Response plan advanced", f"{action['title']} was {status} for {action['target']}.", "orchestration")
    return build_orchestration_snapshot()


def build_resource_rebalancer() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    urgency = int(live["urgency_score"])
    zone = live["affected_zones"][0]
    reserve = max(12, min(72, 82 - urgency // 2))
    allocations = [
        {"resource": "fire_teams", "zone": zone, "assigned": 2 if urgency >= 70 else 1, "reserve": reserve, "eta_minutes": 4, "rationale": "Suppress primary hazard while preserving reserve."},
        {"resource": "medical_teams", "zone": zone, "assigned": 1, "reserve": reserve + 6, "eta_minutes": 5, "rationale": "Protect casualty corridor and triage capacity."},
        {"resource": "security_teams", "zone": "Perimeter", "assigned": 2 if live["top_threat"] in {"intrusion", "panic"} else 1, "reserve": reserve, "eta_minutes": 3, "rationale": "Control gates and prevent unsafe re-entry."},
        {"resource": "drones", "zone": zone, "assigned": 1, "reserve": reserve + 10, "eta_minutes": 2, "rationale": "Validate spread and route conditions."},
    ]
    return {
        "generated_at": _now(),
        "reserve_readiness": reserve,
        "rebalancing_state": "active" if urgency >= 70 else "watch",
        "allocations": allocations,
        "recommended_shift": f"Move one flexible response unit toward {zone} while preserving {reserve}% reserve.",
    }


def build_facility_brain() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    threat = str(live["top_threat"])
    zone = live["affected_zones"][0]
    automations = [
        {"control": "unlock_exits", "zone": zone, "state": "prepared", "safe_rule": "Never unlock into hazard plume."},
        {"control": "hvac_isolation", "zone": zone, "state": "recommended" if threat in {"fire", "gas", "storm"} else "watch", "safe_rule": "Requires life-safety confirmation before execution."},
        {"control": "elevator_recall", "zone": "Tower A", "state": "recommended" if "Tower" in zone or threat == "fire" else "standby", "safe_rule": "Recall only to verified safe floor."},
        {"control": "pa_announcement", "zone": zone, "state": "queued", "safe_rule": "Use verified template only."},
    ]
    return {"generated_at": _now(), "facility_posture": "automation_ready", "automations": automations}


def build_comms_brain() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    zone = live["affected_zones"][0]
    messages = [
        {"audience": "occupants", "channel": "in_app", "urgency": live["urgency_score"], "message": f"Follow verified instructions for {zone}. Use marked safe corridor only.", "status": "queued"},
        {"audience": "responders", "channel": "radio", "urgency": live["urgency_score"], "message": f"Deploy to {zone}; preserve medical corridor and report arrival.", "status": "ready"},
        {"audience": "executives", "channel": "email", "urgency": max(40, live["urgency_score"] - 12), "message": f"Containment confidence {live['confidence_score']}%; top threat {live['top_threat']}.", "status": "drafted"},
        {"audience": "public", "channel": "sms", "urgency": max(20, live["urgency_score"] - 28), "message": "Verified advisory only. Avoid speculation and follow official updates.", "status": "approval_required"},
    ]
    return {"generated_at": _now(), "communications_state": "ready", "messages": messages}


def build_strategy_timeline() -> dict[str, Any]:
    if not _timeline:
        _record_timeline("Decision loop initialized", "Observe -> predict -> compare -> act -> learn loop is active.", "cycle")
        _record_timeline("Predictive branches compared", "Corridor-first response is currently favored by weighted strategy scoring.", "simulation")
    return {"generated_at": _now(), "events": list(_timeline)}


def run_forecast_cycle(scenario: str | None = None) -> dict[str, Any]:
    if scenario:
        set_test_scenario(scenario)
    run_cycle(scenario)
    _record_timeline("Forecast cycle completed", f"Predictive engine recomputed horizons for {scenario or 'live state'}.", "prediction")
    return build_predictive_forecast()


def compare_strategies() -> dict[str, Any]:
    result = build_scenario_branches()
    winner = result.get("winning_strategy") or {
        "strategy": "corridor-first containment",
        "score": 88,
        "rationale": "Fallback strategy preserves life safety while reducing congestion and recovery risk.",
    }
    result["winning_strategy"] = winner
    result.setdefault("branches", [])
    _record_timeline("Strategy branches compared", f"Winning strategy: {winner.get('strategy', 'corridor-first containment')}.", "simulation")
    return result

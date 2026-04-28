from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Any

from app.ai.decision_engine import build_autonomous_snapshot, run_cycle, set_test_scenario
from app.ai.memory import append_decision_memory, list_decision_memory, memory_summary
from app.ai.orchestration import build_predictive_forecast, build_scenario_branches
from app.environment.engine import build_environment_live_snapshot
from app.geospatial.engine import build_geo_live_snapshot
from app.osint.engine import build_osint_live_snapshot
from app.public_safety.engine import build_public_safety_live_snapshot
from app.services.incident_service import get_all_incidents
from app.soc.engine import build_soc_detections_snapshot


_lock = Lock()
_state: dict[str, Any] = {
    "scenario": "fire_corridor_blocked",
    "policy_revision": 1,
    "learning_cycles": 0,
}


STRATEGIC_SCENARIOS: dict[str, dict[str, Any]] = {
    "fire_corridor_blocked": {
        "mapped": "zone_fire_escalation",
        "type": "fire",
        "zone": "Zone 2",
        "weak_signal": "rising smoke and heat trend near a constrained evacuation corridor",
    },
    "cyber_intrusion_lateral_move": {
        "mapped": "cyber_ransomware_attack",
        "type": "cyber",
        "zone": "Command Network",
        "weak_signal": "privileged session drift with lateral access attempts",
    },
    "stadium_crowd_crush_risk": {
        "mapped": "crowd_panic_gate_a",
        "type": "crowd",
        "zone": "Gate A",
        "weak_signal": "crowd density and inflow pressure rising faster than exit flow",
    },
    "toxic_air_false_rumor": {
        "mapped": "misinformation_viral_wave",
        "type": "misinformation",
        "zone": "Public Channels",
        "weak_signal": "toxic-cloud rumor spike without matching sensor confirmation",
    },
    "city_blackout_chain": {
        "mapped": "city_grid_failure",
        "type": "power",
        "zone": "Campus",
        "weak_signal": "utility instability and generator dependency increasing together",
    },
    "executive_targeted_threat": {
        "mapped": "coordinated_intrusion",
        "type": "intrusion",
        "zone": "Executive Wing",
        "weak_signal": "access anomalies clustering near executive movement routes",
    },
    "dual_zone_fire": {
        "mapped": "tower_fire_spread",
        "type": "fire",
        "zone": "Zone 2 / Zone 4",
        "weak_signal": "parallel smoke signatures forming across two operational zones",
    },
    "responder_capacity_collapse": {
        "mapped": "panic_gate_a",
        "type": "operations",
        "zone": "Campus",
        "weak_signal": "responder queue depth and travel-time penalties exceed reserve policy",
    },
}


AGENT_PRIORITIES: list[dict[str, str]] = [
    {
        "agent_id": "security_agent",
        "name": "Security Agent",
        "domain": "access_integrity",
        "mission": "Stop threats fast while preserving access integrity.",
    },
    {
        "agent_id": "operations_agent",
        "name": "Operations Agent",
        "domain": "containment_efficiency",
        "mission": "Minimize time to containment and keep responders moving.",
    },
    {
        "agent_id": "medical_safety_agent",
        "name": "Medical / Safety Agent",
        "domain": "life_safety",
        "mission": "Minimize casualties and preserve evacuation priority.",
    },
    {
        "agent_id": "infrastructure_agent",
        "name": "Infrastructure Agent",
        "domain": "facility_resilience",
        "mission": "Keep utilities online and protect facility control surfaces.",
    },
    {
        "agent_id": "communications_agent",
        "name": "Communications Agent",
        "domain": "public_trust",
        "mission": "Reduce panic, misinformation, and reputation damage.",
    },
    {
        "agent_id": "executive_strategy_agent",
        "name": "Executive Strategy Agent",
        "domain": "continuity_finance",
        "mission": "Protect continuity, reputation, and financial exposure.",
    },
]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clamp(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, round(value)))


def _safe_snapshot(builder, fallback: dict[str, Any]) -> dict[str, Any]:
    try:
        return builder()
    except Exception:
        return fallback


def _current_profile(scenario: str | None = None) -> dict[str, Any]:
    key = scenario or str(_state.get("scenario", "fire_corridor_blocked"))
    return STRATEGIC_SCENARIOS.get(key, STRATEGIC_SCENARIOS["fire_corridor_blocked"])


def _apply_scenario(scenario: str | None) -> str:
    if not scenario:
        return str(_state.get("scenario", "fire_corridor_blocked"))
    profile = _current_profile(scenario)
    with _lock:
        _state["scenario"] = scenario
    set_test_scenario(str(profile["mapped"]))
    return scenario


def _strategy_for_decision(decision: str) -> str:
    text = decision.lower()
    if "corridor" in text or "evacuate" in text:
        return "corridor_first"
    if "hvac" in text or "isolation" in text:
        return "facility_isolation"
    if "lockdown" in text or "lock" in text:
        return "targeted_lockdown"
    if "mutual" in text or "surge" in text:
        return "mutual_aid_surge"
    if "statement" in text or "broadcast" in text or "public" in text:
        return "verified_public_comms"
    if "backup" in text or "offline" in text or "power" in text:
        return "resilience_first"
    return "adaptive_response"


def _money_to_number(value: str) -> int:
    cleaned = value.replace("$", "").replace(",", "").strip().upper()
    try:
        if cleaned.endswith("M"):
            return round(float(cleaned[:-1]) * 1_000_000)
        if cleaned.endswith("K"):
            return round(float(cleaned[:-1]) * 1_000)
        return round(float(cleaned))
    except ValueError:
        return 0


def _episode_score(episode: dict[str, Any]) -> int:
    quality = int(episode.get("outcome_quality", 0))
    speed = int(episode.get("response_speed", 0))
    stabilize = int(episode.get("time_to_stabilize_minutes", 30))
    false_alarm_penalty = 12 if episode.get("false_alarm") else 0
    rejection_penalty = 10 if episode.get("status") == "rejected" else 0
    return _clamp(quality * 0.52 + speed * 0.34 + (100 - min(stabilize, 100)) * 0.14 - false_alarm_penalty - rejection_penalty)


def _episodes() -> list[dict[str, Any]]:
    return list_decision_memory()


def _signals() -> dict[str, Any]:
    incidents = get_all_incidents()
    return {
        "incidents": incidents,
        "geo": _safe_snapshot(lambda: build_geo_live_snapshot(summary_only=True), {"incidents": [], "hotspots": []}),
        "environment": _safe_snapshot(
            lambda: build_environment_live_snapshot(summary_only=True),
            {"global_hazard_score": 20, "hazards": {}, "operational_impacts": {}},
        ),
        "public_safety": _safe_snapshot(
            lambda: build_public_safety_live_snapshot(summary_only=True, incidents=incidents),
            {"global_pressure": 18, "traffic": [], "mobility": {}},
        ),
        "osint": _safe_snapshot(
            lambda: build_osint_live_snapshot(summary_only=True),
            {"reputation_risk": 18, "mention_volume": 0, "external_alerts": [], "top_keywords": []},
        ),
        "soc": _safe_snapshot(lambda: build_soc_detections_snapshot(), {"detections": []}),
    }


def _strategy_rollup() -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for episode in _episodes():
        grouped.setdefault(_strategy_for_decision(str(episode.get("decision", ""))), []).append(episode)

    rollup: list[dict[str, Any]] = []
    for strategy, items in grouped.items():
        scores = [_episode_score(item) for item in items]
        avg_score = round(sum(scores) / max(1, len(scores)))
        accepted = len([item for item in items if item.get("status") in {"approved", "observed", "modified"}])
        stabilize = round(sum(int(item.get("time_to_stabilize_minutes", 30)) for item in items) / max(1, len(items)))
        rollup.append(
            {
                "strategy": strategy,
                "scenario_type": str(items[0].get("scenario", "live")).replace("_", " "),
                "score": avg_score,
                "success_rate": _clamp((accepted / max(1, len(items))) * 100),
                "avg_stabilization_minutes": stabilize,
                "confidence_delta": _clamp((avg_score - 72) / 2, -20, 20),
                "reason": str(max(items, key=_episode_score).get("lesson", "Strategy retained from observed outcome.")),
            }
        )
    rollup.sort(key=lambda item: int(item["score"]), reverse=True)
    return rollup


def build_memory_advanced() -> dict[str, Any]:
    episodes = _episodes()
    rollup = _strategy_rollup()
    failure_candidates = [item for item in episodes if item.get("status") == "rejected" or _episode_score(item) < 70]
    if not failure_candidates:
        failure_candidates = [min(episodes, key=_episode_score)]
    override_count = len([item for item in episodes if item.get("status") in {"modified", "rejected"}])
    summary = memory_summary()
    return {
        "generated_at": _now(),
        "episodes_tracked": len(episodes),
        "learning_state": "mature" if len(episodes) >= 12 else "learning" if len(episodes) >= 3 else "calibrating",
        "best_performing_strategies": rollup[:5],
        "failure_patterns": [
            {
                "pattern": _strategy_for_decision(str(item.get("decision", ""))),
                "scenario_type": str(item.get("scenario", "live")).replace("_", " "),
                "failure_signal": "operator override" if item.get("status") in {"modified", "rejected"} else "slow stabilization",
                "recommended_fix": "Lower automatic ranking and require explicit rationale before reuse.",
                "evidence_count": len([candidate for candidate in failure_candidates if _strategy_for_decision(str(candidate.get("decision", ""))) == _strategy_for_decision(str(item.get("decision", "")))]),
            }
            for item in failure_candidates[:4]
        ],
        "common_override_reasons": [
            {
                "reason": "Operators prefer protected evacuation before hard containment.",
                "count": max(1, override_count),
                "policy_implication": "Boost corridor-first plans when casualty or crowd pressure is elevated.",
            },
            {
                "reason": "High-risk facility controls need visible approval checkpoints.",
                "count": max(1, len([item for item in episodes if "hvac" in str(item.get("decision", "")).lower()])),
                "policy_implication": "Keep HVAC, door, and elevator actions in approval-required mode unless emergency threshold is met.",
            },
        ],
        "trusted_playbooks": [item["strategy"] for item in rollup[:3]],
        "operator_preference_tendencies": [
            f"Accepted or observed decisions: {summary['accepted_or_observed']} of {summary['episodes_tracked']}.",
            "Human operators favor reversible actions before irreversible lockdown steps.",
            "Decision memory gives higher trust to strategies that preserve medical corridors.",
        ],
        "zone_behavior_patterns": [
            {
                "zone": _current_profile()["zone"],
                "pattern": "risk compounds when routing, public pressure, and environmental signals rise together",
                "recommended_watch": "Keep weak-signal monitoring active for 15-minute trend shifts.",
                "confidence": _clamp(64 + int(summary["average_outcome_quality"]) * 0.22),
            }
        ],
        "learning_summary": f"Best lesson: {summary['best_lesson']}",
    }


def build_specialist_agents() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    branches = build_scenario_branches()["branches"]
    memory = build_memory_advanced()
    best_strategy = memory["best_performing_strategies"][0]["strategy"] if memory["best_performing_strategies"] else "corridor_first"
    agents: list[dict[str, Any]] = []
    for index, agent in enumerate(AGENT_PRIORITIES):
        scored: list[tuple[float, dict[str, Any]]] = []
        for branch in branches:
            containment = int(branch["containment_chance"])
            casualty = int(branch["casualty_risk"])
            reputation = int(branch["reputation_impact"])
            downtime = int(branch["downtime_minutes"])
            cost = _money_to_number(str(branch["financial_cost"])) / 100_000
            if agent["agent_id"] == "security_agent":
                score = containment * 1.25 - reputation * 0.22 + (10 if "lockdown" in branch["strategy"].lower() else 0)
            elif agent["agent_id"] == "operations_agent":
                score = containment + int(branch["recovery_speed"]) * 0.88 - downtime * 0.16
            elif agent["agent_id"] == "medical_safety_agent":
                score = 100 - casualty + containment * 0.42 + (12 if "evacuate" in branch["strategy"].lower() else 0)
            elif agent["agent_id"] == "infrastructure_agent":
                score = 100 - downtime * 0.24 - cost * 0.18 + containment * 0.42
            elif agent["agent_id"] == "communications_agent":
                score = 100 - reputation + containment * 0.32 + (8 if "mutual" in branch["strategy"].lower() else 0)
            else:
                score = int(branch["score"]) + (100 - reputation) * 0.28 - cost * 0.12
            if best_strategy.replace("_", " ") in branch["strategy"].lower():
                score += 8
            scored.append((score, branch))
        preferred = max(scored, key=lambda item: item[0])[1]
        agents.append(
            {
                **agent,
                "preferred_strategy": str(preferred["strategy"]),
                "option": str(preferred["option"]),
                "strategy_score": _clamp(max(scored, key=lambda item: item[0])[0]),
                "confidence": _clamp(int(live["confidence_score"]) - index * 3 + memory["best_performing_strategies"][0]["confidence_delta"]),
                "risk_tolerance": ["low", "medium", "low", "medium", "low", "medium"][index],
                "current_position": f"{agent['name']} favors {preferred['strategy']} for {live['affected_zones'][0]}.",
                "tradeoff": str(preferred["rationale"]),
            }
        )
    return {
        "generated_at": _now(),
        "scenario": str(_state.get("scenario", "fire_corridor_blocked")),
        "agents": agents,
        "network_summary": f"{len(agents)} specialist agents scored branches against {live['top_threat']} pressure.",
    }


def build_debate_v2() -> dict[str, Any]:
    network = build_specialist_agents()
    agents = network["agents"]
    strategy_counts: dict[str, int] = {}
    for agent in agents:
        strategy_counts[str(agent["preferred_strategy"])] = strategy_counts.get(str(agent["preferred_strategy"]), 0) + 1
    final_strategy = max(strategy_counts, key=strategy_counts.get)
    consensus = _clamp((strategy_counts[final_strategy] / max(1, len(agents))) * 100 + 28, 0, 96)
    minority = [
        f"{agent['name']} prefers {agent['preferred_strategy']} because {agent['mission']}"
        for agent in agents
        if agent["preferred_strategy"] != final_strategy
    ]
    live = build_autonomous_snapshot()
    return {
        "generated_at": _now(),
        "scenario": str(network["scenario"]),
        "positions": [
            {
                "agent": agent["name"],
                "position": str(agent["current_position"]),
                "preferred_strategy": str(agent["preferred_strategy"]),
                "score": int(agent["strategy_score"]),
                "non_negotiable": "Preserve evacuation corridor"
                if agent["agent_id"] == "medical_safety_agent"
                else "Maintain executive approval for irreversible controls"
                if agent["agent_id"] == "executive_strategy_agent"
                else "Avoid unverified automation",
            }
            for agent in agents
        ],
        "conflicts": [
            "Security containment conflicts with Medical/Safety evacuation priority.",
            "Executive continuity pressure conflicts with Operations speed when lockdown is expensive.",
        ][: max(1, len(minority))],
        "negotiations": [
            "Security accepted selective corridor sealing instead of full lockdown.",
            "Operations agreed to stage reserves before mutual-aid escalation.",
            "Communications requested verified public language before broad alerts.",
        ],
        "consensus_percent": consensus,
        "final_merged_plan": f"{final_strategy} with protected evacuation, reversible facility controls, and executive-readable risk checkpoints.",
        "minority_concerns": minority[:3],
        "fallback_plan": f"If {final_strategy} is rejected, hold advisory-only mode and execute {live['top_decision']['title']} manually.",
    }


def build_weak_signals() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    profile = _current_profile()
    signals = _signals()
    env_score = int(signals["environment"].get("global_hazard_score", 20))
    public_pressure = int(signals["public_safety"].get("global_pressure", 18))
    reputation = int(signals["osint"].get("reputation_risk", 18))
    detections = len(signals["soc"].get("detections", []))
    mention_volume = int(signals["osint"].get("mention_volume", 0))
    forecast = build_predictive_forecast()["forecasts"][1]
    base_probability = _clamp(int(live["urgency_score"]) * 0.48 + env_score * 0.18 + public_pressure * 0.16 + reputation * 0.12)
    weak_signals = [
        {
            "signal_id": "WS-101",
            "weak_signal": str(profile["weak_signal"]),
            "source": "strategic_scenario",
            "probability_of_incident": _clamp(base_probability + 12),
            "time_to_risk": "5-15 min",
            "suggested_preventive_action": "Pre-stage responders and protect reversible evacuation corridors.",
            "confidence": _clamp(int(live["confidence_score"]) + 4),
            "affected_zones": live["affected_zones"],
            "evidence": [
                f"Top threat {live['top_threat']}",
                f"Forecast escalation {forecast['escalation_probability']}%",
                f"Environment hazard {env_score}",
            ],
        },
        {
            "signal_id": "WS-102",
            "weak_signal": "crowd or route pressure may become an evacuation bottleneck",
            "source": "public_safety",
            "probability_of_incident": _clamp(public_pressure + int(live["urgency_score"]) * 0.34),
            "time_to_risk": "10-20 min",
            "suggested_preventive_action": "Reserve priority routes and activate flow-control messaging.",
            "confidence": _clamp(58 + public_pressure * 0.28),
            "affected_zones": live["affected_zones"][:2],
            "evidence": [f"Public pressure {public_pressure}", "Route penalty included in current response plan"],
        },
        {
            "signal_id": "WS-103",
            "weak_signal": "external narrative risk could amplify operator pressure",
            "source": "osint",
            "probability_of_incident": _clamp(reputation + mention_volume * 0.38 + 18),
            "time_to_risk": "15-30 min",
            "suggested_preventive_action": "Prepare verified executive and occupant statements before rumor velocity rises.",
            "confidence": _clamp(56 + reputation * 0.32),
            "affected_zones": ["Public Channels"],
            "evidence": [f"Reputation risk {reputation}", f"Mention volume {mention_volume}"],
        },
        {
            "signal_id": "WS-104",
            "weak_signal": "security telemetry shows abuse conditions that could degrade command trust",
            "source": "soc",
            "probability_of_incident": _clamp(34 + detections * 12),
            "time_to_risk": "0-10 min" if detections >= 2 else "30-60 min",
            "suggested_preventive_action": "Keep sensitive controls in approval-required mode and watch privileged sessions.",
            "confidence": _clamp(52 + detections * 10),
            "affected_zones": ["Command Network"],
            "evidence": [f"SOC detections {detections}", "Audit-derived abuse rules active"],
        },
    ]
    weak_signals.sort(key=lambda item: int(item["probability_of_incident"]), reverse=True)
    return {
        "generated_at": _now(),
        "highest_probability": weak_signals[0],
        "weak_signals": weak_signals,
        "preventive_summary": f"{weak_signals[0]['weak_signal']} is the strongest pre-incident indicator.",
    }


def build_policy_evolution() -> dict[str, Any]:
    rollup = _strategy_rollup()
    scores_by_strategy = {item["strategy"]: item for item in rollup}
    revision = int(_state.get("policy_revision", 1))
    policy_names = [
        ("POL-101", "corridor_first", 72),
        ("POL-102", "targeted_lockdown", 58),
        ("POL-103", "facility_isolation", 66),
        ("POL-104", "mutual_aid_surge", 62),
        ("POL-105", "verified_public_comms", 64),
        ("POL-106", "resilience_first", 68),
    ]
    policies: list[dict[str, Any]] = []
    for policy_id, name, baseline in policy_names:
        learned = scores_by_strategy.get(name)
        learned_delta = int(learned["confidence_delta"]) if learned else 0
        current = _clamp(baseline + learned_delta + revision)
        previous = _clamp(baseline + learned_delta - 2)
        trend = "up" if current > previous else "down" if current < previous else "stable"
        policies.append(
            {
                "policy_id": policy_id,
                "policy_name": name,
                "previous_weight": previous,
                "current_weight": current,
                "trend": trend,
                "reason": learned["reason"] if learned else "No negative evidence found; policy remains calibrated by baseline doctrine.",
            }
        )
    return {
        "generated_at": _now(),
        "revision": revision,
        "strategy_weights": policies,
        "recommended_policy_updates": [
            "Increase corridor-first ranking when medical corridors and smoke spread signals both appear.",
            "Require extra approval explanation when targeted lockdown conflicts with evacuation speed.",
            "Use verified public communications sooner during rumor or reputation spikes.",
        ],
    }


def build_confidence_drift() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    summary = memory_summary()
    policies = build_policy_evolution()["strategy_weights"]
    policy_boost = round(sum(int(item["current_weight"]) - int(item["previous_weight"]) for item in policies) / max(1, len(policies)))
    memory_boost = round((int(summary["average_outcome_quality"]) - 72) / 2)
    after = _clamp(int(live["confidence_score"]) + max(-8, min(10, memory_boost + policy_boost)))
    before = _clamp(after - max(4, min(18, abs(memory_boost) + 6)))
    delta = after - before
    return {
        "generated_at": _now(),
        "decision_id": str(live["top_decision"]["recommendation_id"]),
        "confidence_before": before,
        "confidence_after": after,
        "delta": delta,
        "direction": "up" if delta > 0 else "down" if delta < 0 else "stable",
        "changed_because": [
            f"Similar past events average {summary['average_outcome_quality']}% outcome quality.",
            f"Policy revision contributed {policy_boost:+d} points from learned strategy weights.",
            f"Live confidence baseline is {live['confidence_score']}% for {live['top_threat']}.",
            "Human acceptance history favors reversible, corridor-preserving actions.",
        ],
        "confidence_trace": [
            {"factor": "live signal fusion", "impact": int(live["confidence_score"]) - 60},
            {"factor": "decision memory", "impact": memory_boost},
            {"factor": "policy evolution", "impact": policy_boost},
            {"factor": "governance trust", "impact": 5},
        ],
    }


def build_campaign_plan() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    debate = build_debate_v2()
    weak_signal = build_weak_signals()["highest_probability"]
    zone = str(live["affected_zones"][0])
    phases = [
        {
            "phase_id": "CMP-001",
            "window": "0-5 min",
            "objective": "Stabilize first hazard boundary",
            "actions": [live["top_decision"]["title"], "Confirm protected route status", "Freeze unsafe irreversible controls"],
            "owner": "Operations Agent",
            "success_metric": "Primary hazard has an assigned responder and no blocked egress.",
        },
        {
            "phase_id": "CMP-002",
            "window": "5-10 min",
            "objective": "Protect people and information flow",
            "actions": ["Open guided corridor", "Send verified occupant message", "Stage medical triage outside hazard edge"],
            "owner": "Medical / Safety Agent",
            "success_metric": "Evacuation flow improves while panic signals remain controlled.",
        },
        {
            "phase_id": "CMP-003",
            "window": "10-20 min",
            "objective": "Rebalance resources and city constraints",
            "actions": ["Reserve priority route", "Shift flexible team toward affected zone", "Prepare mutual-aid trigger"],
            "owner": "Operations Agent",
            "success_metric": "Reserve readiness stays above 45% and ETA does not degrade.",
        },
        {
            "phase_id": "CMP-004",
            "window": "20-45 min",
            "objective": "Contain secondary effects",
            "actions": ["Review weak-signal radar", "Issue executive stability brief", "Validate facility automation state"],
            "owner": "Executive Strategy Agent",
            "success_metric": "Escalation probability decreases and public narrative stays verified.",
        },
        {
            "phase_id": "CMP-005",
            "window": "45-60 min",
            "objective": "Transition to recovery posture",
            "actions": ["Document decisions", "Capture outcome metrics", "Update learned policy weights"],
            "owner": "Strategic Memory Engine",
            "success_metric": "Decision memory records outcome and operator trust feedback.",
        },
    ]
    return {
        "generated_at": _now(),
        "campaign_id": "AICMP-60M-01",
        "scenario": str(_state.get("scenario", "fire_corridor_blocked")),
        "mission": f"60-minute strategic campaign for {live['top_threat']} affecting {zone}.",
        "final_strategy": debate["final_merged_plan"],
        "triggering_weak_signal": weak_signal,
        "phases": phases,
        "success_probability": _clamp(int(live["confidence_score"]) + int(debate["consensus_percent"]) * 0.12),
    }


def build_trust_dashboard() -> dict[str, Any]:
    episodes = _episodes()
    accepted = len([item for item in episodes if item.get("status") in {"approved", "observed", "modified"}])
    rejected = len([item for item in episodes if item.get("status") == "rejected"])
    modified = len([item for item in episodes if item.get("status") == "modified"])
    accepted_rate = _clamp((accepted / max(1, len(episodes))) * 100)
    rejected_rate = _clamp((rejected / max(1, len(episodes))) * 100)
    override_rate = _clamp(((rejected + modified) / max(1, len(episodes))) * 100)
    avg_score = round(sum(_episode_score(item) for item in episodes) / max(1, len(episodes)))
    return {
        "generated_at": _now(),
        "accepted_decisions_percent": accepted_rate,
        "rejected_decisions_percent": rejected_rate,
        "override_rate_percent": override_rate,
        "avg_human_trust_score": _clamp(avg_score * 0.72 + accepted_rate * 0.28),
        "departments_trusting_ai_most": [
            {"department": "Operations", "trust_score": _clamp(avg_score + 6), "reason": "Fast containment recommendations match field execution needs."},
            {"department": "Medical / Safety", "trust_score": _clamp(avg_score + 3), "reason": "AI preserves evacuation and triage corridors."},
            {"department": "Executive", "trust_score": _clamp(avg_score - 4), "reason": "Trust increases when financial and reputation impacts are explicit."},
        ],
        "top_rejection_reasons": [
            "Action required irreversible facility control without enough context.",
            "Operators preferred corridor-first containment before full lockdown.",
            "Recommendation needed clearer executive-facing risk explanation.",
        ],
        "governance_summary": f"AI trust is {_clamp(avg_score * 0.72 + accepted_rate * 0.28)}%; override rate is {override_rate}%.",
    }


def run_learning_cycle(scenario: str | None = None) -> dict[str, Any]:
    chosen = _apply_scenario(scenario)
    profile = _current_profile(chosen)
    live = run_cycle(str(profile["mapped"]))
    append_decision_memory(
        decision=f"Strategic learning cycle for {profile['type']} response",
        status="observed",
        scenario=chosen,
        outcome_quality=_clamp(int(live["confidence_score"]) + 4),
        response_speed=_clamp(int(live["urgency_score"]) - 4),
        false_alarm=False,
        time_to_stabilize_minutes=max(8, int(str(live["recovery_eta"]).split(" ", 1)[0])),
        lesson=f"{profile['type']} policy updated from learned campaign and weak-signal evidence.",
    )
    with _lock:
        _state["learning_cycles"] = int(_state.get("learning_cycles", 0)) + 1
        _state["policy_revision"] = int(_state.get("policy_revision", 1)) + 1
    return build_memory_advanced()


def run_debate(scenario: str | None = None) -> dict[str, Any]:
    _apply_scenario(scenario)
    return build_debate_v2()


def test_weak_signal(scenario: str) -> dict[str, Any]:
    _apply_scenario(scenario)
    return build_weak_signals()


def retrain_policies() -> dict[str, Any]:
    with _lock:
        _state["policy_revision"] = int(_state.get("policy_revision", 1)) + 1
    return build_policy_evolution()


def simulate_campaign(scenario: str | None = None) -> dict[str, Any]:
    _apply_scenario(scenario)
    return build_campaign_plan()

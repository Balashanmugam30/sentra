from __future__ import annotations

from datetime import datetime


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def infer_strategy_label(
    scenario: str,
    winning_strategy: str,
    final_plan: list[str],
    plan_summary: str,
) -> str:
    text = " ".join([scenario, winning_strategy, plan_summary, *final_plan]).lower()
    if "corridor" in text:
        return "corridor_first"
    if "full lockdown" in text:
        return "full_lockdown"
    if "lockdown" in text:
        return "targeted_lockdown"
    if "mutual aid" in text:
        return "mutual_aid_early"
    if "reserve" in text:
        return "reserve_preserve"
    if "split" in text or scenario == "dual_incident":
        return "split_response"
    if "evac" in text:
        return "staged_evacuation"
    return "surge_response"


def build_learning_episode(
    *,
    episode_id: str,
    recorded_at: datetime,
    scenario: str,
    council: dict[str, object],
    debate: dict[str, object],
    optimization: dict[str, object],
) -> dict[str, object]:
    strategy = infer_strategy_label(
        scenario,
        str(debate["active_debate"]["winning_strategy"]),
        list(debate["final_plan"]),
        str(optimization["summary"]),
    )
    allocations = list(optimization["allocations"])
    top_zones = {item["zone"] for item in allocations[:2]}
    avg_eta = round(
        sum(int(item["eta_minutes"]) for item in allocations[:3]) / max(min(len(allocations), 3), 1)
    )
    casualty_risk = _clamp(
        round(
            (100 - int(optimization["estimated_evacuation_support"])) * 0.52
            + max(0, 80 - int(debate["consensus_score"])) * 0.18
            + max(0, 50 - int(optimization["reserve_readiness"])) * 0.24
        ),
        8,
        92,
    )
    recovery_time = _clamp(
        round(
            int(optimization["estimated_containment_minutes"]) * 1.55
            + int(optimization["cost_index"]) * 0.6
            - int(optimization["reserve_readiness"]) * 0.25
        ),
        20,
        260,
    )
    resources_used = [
        f"{item['resource_type']} x{item['units_assigned']}"
        for item in allocations
    ]

    agent_accuracy_scores: dict[str, int] = {}
    for agent in council["agents"]:
        score = round(55 + int(agent["confidence"]) * 0.22)
        if agent.get("priority_zone") in top_zones:
            score += 8
        if agent["agent_id"] == "fire_commander" and strategy in {"corridor_first", "surge_response", "targeted_lockdown"}:
            score += 8
        if agent["agent_id"] == "medical_commander" and strategy in {"corridor_first", "staged_evacuation"}:
            score += 8
        if agent["agent_id"] == "security_commander" and strategy in {"corridor_first", "targeted_lockdown", "split_response"}:
            score += 7
        if agent["agent_id"] == "logistics_commander" and strategy in {"reserve_preserve", "split_response", "mutual_aid_early"}:
            score += 7
        if agent["agent_id"] == "executive_strategy" and strategy in {"mutual_aid_early", "targeted_lockdown"}:
            score += 6
        if agent["agent_id"] == "communications_commander" and strategy in {"staged_evacuation", "corridor_first"}:
            score += 6
        if strategy == "full_lockdown" and agent["agent_id"] == "executive_strategy" and int(optimization["cost_index"]) >= 55:
            score -= 7

        agent_accuracy_scores[agent["agent_id"]] = _clamp(score, 44, 95)

    performance_score = _clamp(
        round(
            max(0, 100 - int(optimization["estimated_containment_minutes"])) * 0.28
            + int(optimization["estimated_evacuation_support"]) * 0.24
            + int(optimization["reserve_readiness"]) * 0.2
            + max(0, 100 - casualty_risk) * 0.2
            - int(optimization["cost_index"]) * 0.08
            - avg_eta * 1.4
        ),
        0,
        100,
    )

    return {
        "episode_id": episode_id,
        "recorded_at": recorded_at,
        "incident_type": scenario,
        "decision_strategy": strategy,
        "resources_used": resources_used[:6],
        "debate_outcome": debate["active_debate"]["winning_strategy"],
        "consensus_score": int(debate["consensus_score"]),
        "response_time": avg_eta,
        "containment_minutes": int(optimization["estimated_containment_minutes"]),
        "evacuation_success": int(optimization["estimated_evacuation_support"]),
        "cost_index": int(optimization["cost_index"]),
        "casualty_risk": casualty_risk,
        "recovery_time": recovery_time,
        "agent_accuracy_scores": agent_accuracy_scores,
        "performance_score": performance_score,
    }

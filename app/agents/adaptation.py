from __future__ import annotations

from statistics import mean

STRATEGY_CATEGORIES = [
    "full_lockdown",
    "targeted_lockdown",
    "corridor_first",
    "mutual_aid_early",
    "reserve_preserve",
    "surge_response",
    "split_response",
    "staged_evacuation",
]

AGENT_LABELS = {
    "fire_commander": "Fire Commander AI",
    "medical_commander": "Medical Commander AI",
    "security_commander": "Security Commander AI",
    "logistics_commander": "Logistics Commander AI",
    "executive_strategy": "Executive Strategy AI",
    "communications_commander": "Communications AI",
}


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def build_learning_summary(episodes: list[dict[str, object]]) -> dict[str, object]:
    strategy_scores: dict[str, list[int]] = {strategy: [] for strategy in STRATEGY_CATEGORIES}
    for episode in episodes:
        strategy = str(episode.get("decision_strategy", ""))
        if strategy in strategy_scores:
            strategy_scores[strategy].append(int(episode.get("performance_score", 0)))

    averaged_strategy_scores = {
        strategy: round(mean(scores))
        for strategy, scores in strategy_scores.items()
        if scores
    }
    best_strategy = (
        max(averaged_strategy_scores.items(), key=lambda item: (item[1], item[0]))[0]
        if averaged_strategy_scores
        else "none yet"
    )
    best_strategy_score = averaged_strategy_scores.get(best_strategy, 0)
    worst_strategy = (
        min(averaged_strategy_scores.items(), key=lambda item: (item[1], item[0]))[0]
        if averaged_strategy_scores
        else "none yet"
    )

    if not episodes:
        improvement_index = 0
    else:
        recent_window = episodes[: min(5, len(episodes))]
        early_window = episodes[-min(5, len(episodes)) :]
        recent_avg = round(mean(int(item.get("performance_score", 0)) for item in recent_window))
        early_avg = round(mean(int(item.get("performance_score", 0)) for item in early_window))
        improvement_index = _clamp(
            round((recent_avg * 0.72) + max(recent_avg - early_avg, 0) * 2.8),
            0,
            100,
        )

    if not episodes:
        global_learning_state = "cold"
    elif len(episodes) < 5:
        global_learning_state = "learning"
    elif len(episodes) < 12 or improvement_index < 68:
        global_learning_state = "mature"
    else:
        global_learning_state = "adaptive"

    strategy_weights: dict[str, int] = {}
    for strategy in STRATEGY_CATEGORIES:
        average = averaged_strategy_scores.get(strategy, 58)
        strategy_weights[strategy] = _clamp(round(50 + (average - 60) * 0.95), 30, 85)

    calibration: list[dict[str, object]] = []
    agent_confidence_adjustments: dict[str, int] = {}
    for agent_id, label in AGENT_LABELS.items():
        scores = [
            int(episode.get("agent_accuracy_scores", {}).get(agent_id, 0))
            for episode in episodes
            if agent_id in episode.get("agent_accuracy_scores", {})
        ]
        if not scores:
            current_accuracy = 70
            trend = "stable"
        else:
            current_accuracy = round(mean(scores[: min(5, len(scores))]))
            baseline = round(mean(scores[-5:]))
            if current_accuracy >= baseline + 3:
                trend = "up"
            elif current_accuracy <= baseline - 3:
                trend = "down"
            else:
                trend = "stable"

        calibration.append(
            {
                "agent": label,
                "current_accuracy": current_accuracy,
                "confidence_trend": trend,
            }
        )
        agent_confidence_adjustments[agent_id] = _clamp(round((current_accuracy - 70) / 3), -8, 8)

    learned_patterns: list[str] = []
    if (
        averaged_strategy_scores.get("corridor_first", 0)
        >= averaged_strategy_scores.get("full_lockdown", 0) + 6
    ):
        learned_patterns.append("corridor-first improves evacuation success under severe fire pressure")
    if (
        averaged_strategy_scores.get("mutual_aid_early", 0)
        >= averaged_strategy_scores.get("reserve_preserve", 0) + 4
    ):
        learned_patterns.append("early mutual aid reduces recovery time during resource overload")
    dual_split_scores = [
        int(episode.get("performance_score", 0))
        for episode in episodes
        if episode.get("incident_type") == "dual_incident"
        and episode.get("decision_strategy") == "split_response"
    ]
    if dual_split_scores and round(mean(dual_split_scores)) <= 58:
        learned_patterns.append("split response weakens containment under dual critical zones")
    gas_overload_scores = [
        int(episode.get("performance_score", 0))
        for episode in episodes
        if episode.get("incident_type") == "gas_leak"
        and int(episode.get("cost_index", 0)) >= 55
    ]
    if gas_overload_scores and round(mean(gas_overload_scores)) <= 56:
        learned_patterns.append("gas leaks escalate faster during overloaded operating states")

    recommended_policy_updates: list[str] = []
    if strategy_weights["corridor_first"] >= 60:
        recommended_policy_updates.append("Boost protected corridor playbooks for fire, medical, and security coordination")
    if strategy_weights["full_lockdown"] <= 46:
        recommended_policy_updates.append("Challenge blanket lockdown earlier when selective containment can preserve throughput")
    if strategy_weights["mutual_aid_early"] >= 60:
        recommended_policy_updates.append("Escalate mutual aid earlier when reserves drop below safe threshold")
    if strategy_weights["reserve_preserve"] >= 60:
        recommended_policy_updates.append("Preserve tactical reserve capacity before committing final responder wave")
    if not recommended_policy_updates:
        recommended_policy_updates.append("Continue gathering episodes before changing operating policy")

    executive_summary = (
        f"Learning state {global_learning_state} favors {best_strategy.replace('_', ' ')} "
        f"at score {best_strategy_score} with improvement index {improvement_index}."
    )

    return {
        "global_learning_state": global_learning_state,
        "episodes_tracked": len(episodes),
        "best_strategy": best_strategy,
        "best_strategy_score": best_strategy_score,
        "worst_strategy": worst_strategy,
        "improvement_index": improvement_index,
        "agent_calibration": calibration,
        "agent_confidence_adjustments": agent_confidence_adjustments,
        "strategy_weights": strategy_weights,
        "learned_patterns": learned_patterns[:4],
        "recommended_policy_updates": recommended_policy_updates[:4],
        "executive_summary": executive_summary,
        "averaged_strategy_scores": averaged_strategy_scores,
    }

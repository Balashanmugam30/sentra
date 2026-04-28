from __future__ import annotations

from datetime import datetime, timezone

from app.agents.adaptation import build_learning_summary
from app.agents.experience import build_learning_episode
from app.models.incident import Incident

_episode_counter = 100
_episode_store: list[dict[str, object]] = []
_history_store: list[dict[str, object]] = []


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _next_episode_id() -> str:
    global _episode_counter
    _episode_counter += 1
    return f"EXP-{_episode_counter}"


def _log_event(message: str, timestamp: datetime | None = None) -> None:
    _history_store.insert(
        0,
        {
            "recorded_at": timestamp or _now(),
            "message": message,
        },
    )
    del _history_store[50:]


def get_learning_adjustments() -> dict[str, object]:
    return build_learning_summary(_episode_store)


def get_learning_live_snapshot(incidents: list[Incident] | None = None) -> dict[str, object]:
    summary = build_learning_summary(_episode_store)
    return {
        "generated_at": _now(),
        "global_learning_state": summary["global_learning_state"],
        "episodes_tracked": summary["episodes_tracked"],
        "best_strategy": summary["best_strategy"],
        "best_strategy_score": summary["best_strategy_score"],
        "worst_strategy": summary["worst_strategy"],
        "improvement_index": summary["improvement_index"],
        "agent_calibration": summary["agent_calibration"],
        "learned_patterns": summary["learned_patterns"],
        "recommended_policy_updates": summary["recommended_policy_updates"],
        "executive_summary": summary["executive_summary"],
    }


def get_learning_history_snapshot() -> dict[str, object]:
    return {
        "generated_at": _now(),
        "events": list(_history_store[:30]),
    }


def run_learning_cycle(incidents: list[Incident], scenario: str) -> dict[str, object]:
    from app.agents.council import apply_optimization_scenario, generate_council_snapshot
    from app.agents.debate import run_debate_scenario
    from app.agents.optimizer import run_optimization_scenario

    previous = build_learning_summary(_episode_store)
    apply_optimization_scenario(incidents, scenario)
    council = generate_council_snapshot(incidents)
    debate = run_debate_scenario(
        incidents,
        "dual_incident" if scenario == "dual_incident" else "resource_shortage" if scenario == "citywide_pressure" else scenario,
    )
    optimization = run_optimization_scenario(incidents, scenario)
    recorded_at = _now()
    episode = build_learning_episode(
        episode_id=_next_episode_id(),
        recorded_at=recorded_at,
        scenario=scenario,
        council=council,
        debate=debate,
        optimization=optimization,
    )
    _episode_store.insert(0, episode)
    del _episode_store[50:]

    current = build_learning_summary(_episode_store)
    strategy_name = str(episode["decision_strategy"]).replace("_", " ")
    _log_event(f"{strategy_name} completed with performance {episode['performance_score']}", recorded_at)
    if current["best_strategy"] != previous["best_strategy"]:
        _log_event(
            f"{str(current['best_strategy']).replace('_', ' ')} now leads learning memory at {current['best_strategy_score']}",
            recorded_at,
        )
    strongest_agent = max(
        current["agent_calibration"],
        key=lambda item: (item["current_accuracy"], item["agent"]),
        default=None,
    )
    if strongest_agent is not None and strongest_agent["confidence_trend"] != "stable":
        _log_event(
            f"{strongest_agent['agent'].replace(' AI', '')} accuracy {strongest_agent['confidence_trend']} to {strongest_agent['current_accuracy']}",
            recorded_at,
        )
    if current["recommended_policy_updates"]:
        _log_event(current["recommended_policy_updates"][0], recorded_at)

    live = get_learning_live_snapshot(incidents)
    return {
        "generated_at": recorded_at,
        "status": "recorded",
        "scenario": scenario,
        "episode": episode,
        "learning": live,
    }


def reset_learning_state() -> dict[str, object]:
    cleared = len(_episode_store)
    _episode_store.clear()
    _history_store.clear()
    return {
        "status": "reset",
        "episodes_cleared": cleared,
    }

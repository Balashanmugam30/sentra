from __future__ import annotations

from datetime import datetime, timezone

from app.agents.conflicts import detect_agent_conflicts
from app.agents.consensus import build_consensus_result
from app.agents.council import apply_test_scenario, generate_council_snapshot
from app.agents.experience import infer_strategy_label
from app.agents.learning import get_learning_adjustments
from app.agents.memory import get_test_scenario, set_test_scenario
from app.models.incident import Incident


_debate_counter = 100
_active_debate: dict[str, object] | None = None
_debate_history: list[dict[str, object]] = []


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _next_debate_id() -> str:
    global _debate_counter
    _debate_counter += 1
    return f"DEB-{_debate_counter}"


def _infer_scenario(council: dict[str, object]) -> str:
    top_priorities = " ".join(council["top_priorities"]).lower()
    if "gas" in top_priorities:
        return "gas_leak"
    if "corridor" in top_priorities or "crowd" in top_priorities:
        return "mass_panic"
    if "mutual aid" in top_priorities:
        return "resource_shortage"
    if "cadence" in top_priorities or "communication" in top_priorities:
        return "comms_breakdown"
    return get_test_scenario() or "critical_fire"


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def _apply_learning_consensus(
    payload: dict[str, object],
    consensus: dict[str, object],
    scenario: str,
) -> dict[str, object]:
    learning = get_learning_adjustments()
    strategy = infer_strategy_label(
        scenario,
        str(payload["active_debate"]["winning_strategy"]),
        list(payload["final_plan"]),
        " ".join(payload["final_plan"]),
    )
    strategy_weight = int(learning["strategy_weights"].get(strategy, 50))
    consensus_delta = round((strategy_weight - 50) * 0.35)
    adjusted_score = _clamp(int(payload["consensus_score"]) + consensus_delta, 0, 100)
    payload["consensus_score"] = adjusted_score
    payload["active_debate"]["consensus_score"] = adjusted_score
    payload["active_debate"]["status"] = (
        "resolved"
        if adjusted_score >= 58 and str(payload["recommended_next_action"]) != "escalate to governance override recommendation"
        else "active"
    )

    confidence_adjustments = learning["agent_confidence_adjustments"]
    adjusted_participants: list[dict[str, object]] = []
    support_count = 0
    for participant in payload["participants"]:
        delta = round(int(confidence_adjustments.get(participant["agent_id"], 0)) * 0.5)
        confidence_after = _clamp(int(participant["confidence_after"]) + delta, 0, 100)
        updated = {**participant, "confidence_after": confidence_after}
        if updated["final_vote"] == "support":
            support_count += 1
        adjusted_participants.append(updated)

    payload["participants"] = adjusted_participants
    payload["active_debate"]["participants"] = adjusted_participants
    if strategy_weight >= 60:
        payload["executive_note"] = f"{payload['executive_note']} Learning memory supports this strategy."
    elif strategy_weight <= 45:
        payload["executive_note"] = f"{payload['executive_note']} Learning memory flags this approach as relatively costly."
        if support_count < 4:
            payload["recommended_next_action"] = "conditional consensus"

    return payload


def _build_live_payload(council: dict[str, object], scenario: str, *, persist: bool) -> dict[str, object]:
    conflicts = detect_agent_conflicts(council, scenario)
    consensus = build_consensus_result(council, conflicts, scenario)
    debate_id = _next_debate_id() if persist else "DEB-LIVE"
    session = {
        "debate_id": debate_id,
        "started_at": _now(),
        "scenario": scenario,
        "status": consensus["status"] if persist else "idle",
        "rounds": 3,
        "conflict_count": len(conflicts),
        "consensus_score": consensus["consensus_score"],
        "winning_strategy": consensus["winning_strategy"],
        "participants": consensus["participants"],
    }

    payload = {
        "global_state": council["global_state"],
        "active_debate": session,
        "consensus_score": consensus["consensus_score"],
        "conflicts": conflicts,
        "participants": consensus["participants"],
        "final_plan": consensus["final_plan"],
        "executive_note": consensus["executive_note"],
        "recommended_next_action": consensus["recommended_next_action"],
    }
    payload = _apply_learning_consensus(payload, consensus, scenario)

    if persist:
        global _active_debate
        _active_debate = payload
        _debate_history.insert(
            0,
            {
                "debate_id": debate_id,
                "started_at": session["started_at"],
                "scenario": scenario,
                "status": session["status"],
                "consensus_score": session["consensus_score"],
                "winning_strategy": session["winning_strategy"],
                "outcome_summary": consensus["winning_strategy"],
            },
        )
        del _debate_history[12:]

    return payload


def get_live_debate_snapshot(incidents: list[Incident]) -> dict[str, object]:
    if _active_debate is not None:
        return _active_debate
    council = generate_council_snapshot(incidents)
    scenario = _infer_scenario(council)
    return _build_live_payload(council, scenario, persist=False)


def get_debate_history_snapshot() -> dict[str, object]:
    return {"sessions": _debate_history[:10]}


def run_debate_scenario(incidents: list[Incident], scenario: str) -> dict[str, object]:
    if scenario != "dual_incident":
        council = apply_test_scenario(incidents, scenario)
    else:
        set_test_scenario("critical_fire")
        council = generate_council_snapshot(incidents)
    return _build_live_payload(council, scenario, persist=True)


def reset_debate_state() -> dict[str, object]:
    global _active_debate
    cleared = len(_debate_history)
    _debate_history.clear()
    _active_debate = None
    return {"status": "reset", "debates_cleared": cleared}

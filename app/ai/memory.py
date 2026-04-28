from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Any


_lock = Lock()
_memory: list[dict[str, Any]] = []
_sequence = 100


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def append_decision_memory(
    *,
    decision: str,
    status: str,
    scenario: str,
    outcome_quality: int,
    response_speed: int,
    false_alarm: bool,
    time_to_stabilize_minutes: int,
    lesson: str,
) -> dict[str, Any]:
    global _sequence
    with _lock:
        _sequence += 1
        episode = {
            "memory_id": f"AIMEM-{_sequence}",
            "timestamp": utc_now(),
            "decision": decision,
            "status": status,
            "scenario": scenario,
            "outcome_quality": max(0, min(100, outcome_quality)),
            "response_speed": max(0, min(100, response_speed)),
            "false_alarm": false_alarm,
            "time_to_stabilize_minutes": max(1, time_to_stabilize_minutes),
            "lesson": lesson,
        }
        _memory.insert(0, episode)
        del _memory[50:]
        return dict(episode)


def list_decision_memory() -> list[dict[str, Any]]:
    with _lock:
        if not _memory:
            return [
                {
                    "memory_id": "AIMEM-SEED-1",
                    "timestamp": utc_now(),
                    "decision": "Protected corridor with selective lockdown",
                    "status": "observed",
                    "scenario": "zone_fire_escalation",
                    "outcome_quality": 86,
                    "response_speed": 82,
                    "false_alarm": False,
                    "time_to_stabilize_minutes": 22,
                    "lesson": "Corridor-first containment preserved evacuation speed while reducing exposure.",
                },
                {
                    "memory_id": "AIMEM-SEED-2",
                    "timestamp": utc_now(),
                    "decision": "HVAC shutdown plus isolation ring",
                    "status": "observed",
                    "scenario": "gas_leak_north",
                    "outcome_quality": 81,
                    "response_speed": 76,
                    "false_alarm": False,
                    "time_to_stabilize_minutes": 28,
                    "lesson": "Gas events stabilized faster when facility control acted before full evacuation.",
                },
            ]
        return [dict(item) for item in _memory]


def memory_summary() -> dict[str, Any]:
    episodes = list_decision_memory()
    accepted = [item for item in episodes if item["status"] in {"approved", "observed", "modified"}]
    avg_quality = round(sum(int(item["outcome_quality"]) for item in accepted) / max(1, len(accepted)))
    return {
        "episodes_tracked": len(episodes),
        "accepted_or_observed": len(accepted),
        "average_outcome_quality": avg_quality,
        "best_lesson": max(episodes, key=lambda item: int(item["outcome_quality"]))["lesson"],
    }

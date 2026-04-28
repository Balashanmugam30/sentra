from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class LearningState:
    learning_cycles: int = 0
    policy_revision: int = 4
    governance_mode: str = "learn_with_approval"
    last_simulation: str = "hotel_fire_night_shift"
    approved_policies: list[str] = field(default_factory=list)
    timeline: list[dict[str, Any]] = field(default_factory=list)


class LearningStore:
    def __init__(self) -> None:
        self._state = LearningState()
        self._lock = Lock()

    def get_state(self) -> LearningState:
        with self._lock:
            return LearningState(
                learning_cycles=self._state.learning_cycles,
                policy_revision=self._state.policy_revision,
                governance_mode=self._state.governance_mode,
                last_simulation=self._state.last_simulation,
                approved_policies=list(self._state.approved_policies),
                timeline=list(self._state.timeline),
            )

    def record_cycle(self, scenario: str) -> LearningState:
        with self._lock:
            self._state.learning_cycles += 1
            self._state.last_simulation = scenario
            self._state.timeline.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Learning cycle completed",
                    "detail": f"Simulation outcomes recalibrated strategy weights for {scenario}.",
                    "severity": "medium",
                }
            )
            self._state.timeline = self._state.timeline[-16:]
            return LearningState(
                learning_cycles=self._state.learning_cycles,
                policy_revision=self._state.policy_revision,
                governance_mode=self._state.governance_mode,
                last_simulation=self._state.last_simulation,
                approved_policies=list(self._state.approved_policies),
                timeline=list(self._state.timeline),
            )

    def approve_policy(self, policy_id: str) -> LearningState:
        with self._lock:
            if policy_id not in self._state.approved_policies:
                self._state.approved_policies.append(policy_id)
                self._state.policy_revision += 1
            self._state.timeline.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Policy update approved",
                    "detail": f"Human governance approved policy update {policy_id}.",
                    "severity": "high",
                }
            )
            self._state.timeline = self._state.timeline[-16:]
            return LearningState(
                learning_cycles=self._state.learning_cycles,
                policy_revision=self._state.policy_revision,
                governance_mode=self._state.governance_mode,
                last_simulation=self._state.last_simulation,
                approved_policies=list(self._state.approved_policies),
                timeline=list(self._state.timeline),
            )


learning_store = LearningStore()

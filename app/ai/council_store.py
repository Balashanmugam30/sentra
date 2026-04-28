from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class CouncilState:
    scenario_id: str = "hotel_kitchen_fire"
    governance_mode: str = "approval_required"
    council_status: str = "monitoring"
    last_snapshot: dict[str, Any] | None = None
    timeline: list[dict[str, Any]] = field(default_factory=list)


class CouncilStore:
    def __init__(self) -> None:
        self._state = CouncilState()
        self._lock = Lock()

    def get_state(self) -> CouncilState:
        with self._lock:
            return CouncilState(
                scenario_id=self._state.scenario_id,
                governance_mode=self._state.governance_mode,
                council_status=self._state.council_status,
                last_snapshot=dict(self._state.last_snapshot) if self._state.last_snapshot else None,
                timeline=list(self._state.timeline),
            )

    def set_snapshot(self, snapshot: dict[str, Any]) -> None:
        with self._lock:
            self._state.last_snapshot = snapshot
            self._state.scenario_id = str(snapshot["scenario_id"])

    def set_scenario(self, scenario_id: str) -> None:
        with self._lock:
            self._state.scenario_id = scenario_id

    def set_governance_mode(self, mode: str) -> None:
        with self._lock:
            self._state.governance_mode = mode
            self._state.timeline.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Governance mode changed",
                    "detail": f"Council governance set to {mode}.",
                    "severity": "medium",
                }
            )

    def record_event(self, event: str, detail: str, severity: str = "low") -> None:
        with self._lock:
            self._state.timeline.append(
                {
                    "timestamp": _now_iso(),
                    "event": event,
                    "detail": detail,
                    "severity": severity,
                }
            )
            self._state.timeline = self._state.timeline[-18:]

    def set_status(self, status: str) -> None:
        with self._lock:
            self._state.council_status = status


council_store = CouncilStore()

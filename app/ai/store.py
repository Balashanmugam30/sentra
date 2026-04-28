from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now() -> datetime:
    return datetime.now(timezone.utc)


class AIDecisionStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._scenario = "hotel_kitchen_fire"
        self._last_decision: dict[str, Any] | None = None
        self._scenario_loaded_at = _now()

    def get_scenario(self) -> str:
        with self._lock:
            return self._scenario

    def set_scenario(self, scenario: str) -> None:
        with self._lock:
            self._scenario = scenario
            self._scenario_loaded_at = _now()

    def get_loaded_at(self) -> datetime:
        with self._lock:
            return self._scenario_loaded_at

    def set_decision(self, decision: dict[str, Any]) -> None:
        with self._lock:
            self._last_decision = dict(decision)

    def get_decision(self) -> dict[str, Any] | None:
        with self._lock:
            return dict(self._last_decision) if self._last_decision else None


ai_decision_store = AIDecisionStore()

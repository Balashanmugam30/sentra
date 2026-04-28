from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class OpsResilienceStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._healed_actions: set[str] = set()
        self._events: list[dict[str, Any]] = [
            {
                "timestamp": _now_iso(),
                "event": "Resilience engine online",
                "detail": "Self-healing command layer initialized with demo-safe telemetry.",
                "status": "verified",
            }
        ]

    def get_state(self) -> dict[str, Any]:
        with self._lock:
            return {"healed_actions": set(self._healed_actions), "events": deepcopy(self._events)}

    def heal(self, action_id: str) -> None:
        with self._lock:
            self._healed_actions.add(action_id)
            self._events.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Auto-heal action executed",
                    "detail": f"{action_id} executed with governed self-healing controls.",
                    "status": "healed",
                }
            )
            self._events = self._events[-40:]


ops_resilience_store = OpsResilienceStore()

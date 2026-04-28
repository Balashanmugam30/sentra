from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class OpsExecutiveStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._selected_action = "safety_first"
        self._simulation = "partial_shutdown"
        self._ledger: list[dict[str, Any]] = [
            {
                "timestamp": _now_iso(),
                "event": "Executive command online",
                "detail": "Boardroom operations supremacy layer initialized.",
                "status": "verified",
            }
        ]

    def get_state(self) -> dict[str, Any]:
        with self._lock:
            return {
                "selected_action": self._selected_action,
                "simulation": self._simulation,
                "ledger": deepcopy(self._ledger),
            }

    def run_action(self, action_id: str) -> None:
        with self._lock:
            self._selected_action = action_id
            self._ledger.append(
                {
                    "timestamp": _now_iso(),
                    "event": "CEO action launched",
                    "detail": f"{action_id} converted into governed operational plan.",
                    "status": "approved",
                }
            )
            self._ledger = self._ledger[-40:]

    def simulate(self, option_id: str) -> None:
        with self._lock:
            self._simulation = option_id
            self._ledger.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Board strategy simulation run",
                    "detail": f"{option_id} compared against shutdown, continuity, cost, and reputation impact.",
                    "status": "simulated",
                }
            )
            self._ledger = self._ledger[-40:]


ops_executive_store = OpsExecutiveStore()

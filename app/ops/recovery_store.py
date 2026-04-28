from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class OpsRecoveryStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._scenario = "hotel_fire_recovery"
        self._approved_gates: set[str] = set()
        self._ledger: list[dict[str, Any]] = [
            {
                "timestamp": _now_iso(),
                "event": "Recovery continuity online",
                "detail": "Recovery and reopening command initialized in demo-safe mode.",
                "status": "verified",
            }
        ]

    def get_state(self) -> dict[str, Any]:
        with self._lock:
            return {
                "scenario": self._scenario,
                "approved_gates": set(self._approved_gates),
                "ledger": deepcopy(self._ledger),
            }

    def run(self, scenario: str) -> None:
        with self._lock:
            self._scenario = scenario
            self._ledger.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Recovery workflow run",
                    "detail": f"Continuity workflow launched for {scenario}.",
                    "status": "active",
                }
            )
            self._ledger = self._ledger[-40:]

    def approve(self, gate_id: str) -> None:
        with self._lock:
            self._approved_gates.add(gate_id)
            self._ledger.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Reopen gate approved",
                    "detail": f"{gate_id} approved with governance evidence.",
                    "status": "approved",
                }
            )
            self._ledger = self._ledger[-40:]


ops_recovery_store = OpsRecoveryStore()

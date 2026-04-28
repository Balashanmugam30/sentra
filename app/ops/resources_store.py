from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class OpsResourcesStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._dispatches: list[dict[str, Any]] = [
            {
                "timestamp": _now_iso(),
                "event": "Resource command online",
                "detail": "Resource deployment engine initialized with demo-safe field state.",
                "status": "verified",
            }
        ]
        self._assigned_units: dict[str, str] = {}

    def get_state(self) -> dict[str, Any]:
        with self._lock:
            return {
                "dispatches": deepcopy(self._dispatches),
                "assigned_units": dict(self._assigned_units),
            }

    def dispatch(self, incident_id: str, unit_id: str) -> None:
        with self._lock:
            self._assigned_units[incident_id] = unit_id
            self._dispatches.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Unit dispatched",
                    "detail": f"{unit_id} dispatched to {incident_id} using nearest-skill-fit routing.",
                    "status": "active",
                }
            )
            self._dispatches = self._dispatches[-40:]


ops_resources_store = OpsResourcesStore()

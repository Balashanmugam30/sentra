from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class OpsExecutionStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._scenario = "hotel_kitchen_fire"
        self._governance_mode = "approval_required"
        self._paused_tasks: set[str] = set()
        self._approved_tasks: set[str] = set()
        self._reassigned_tasks: dict[str, str] = {}
        self._closed_incidents: set[str] = set()
        self._ledger: list[dict[str, Any]] = [
            {
                "timestamp": _now_iso(),
                "event": "Execution engine online",
                "detail": "Autonomous operations engine initialized in demo-safe mode.",
                "status": "verified",
            }
        ]

    def get_state(self) -> dict[str, Any]:
        with self._lock:
            return {
                "scenario": self._scenario,
                "governance_mode": self._governance_mode,
                "paused_tasks": set(self._paused_tasks),
                "approved_tasks": set(self._approved_tasks),
                "reassigned_tasks": dict(self._reassigned_tasks),
                "closed_incidents": set(self._closed_incidents),
                "ledger": deepcopy(self._ledger),
            }

    def set_scenario(self, scenario: str) -> None:
        with self._lock:
            self._scenario = scenario
            self._paused_tasks.clear()
            self._approved_tasks.clear()
            self._reassigned_tasks.clear()
            self._closed_incidents.clear()
            self._ledger.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Workflow launched",
                    "detail": f"Execution workflow launched for {scenario}.",
                    "status": "active",
                }
            )
            self._ledger = self._ledger[-24:]

    def approve_task(self, task_id: str) -> None:
        with self._lock:
            self._approved_tasks.add(task_id)
            self._paused_tasks.discard(task_id)
            self._ledger.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Task approved",
                    "detail": f"Human command approved task {task_id}.",
                    "status": "approved",
                }
            )
            self._ledger = self._ledger[-24:]

    def reassign_task(self, task_id: str, owner: str) -> None:
        with self._lock:
            self._reassigned_tasks[task_id] = owner
            self._ledger.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Task reassigned",
                    "detail": f"Task {task_id} reassigned to {owner}.",
                    "status": "active",
                }
            )
            self._ledger = self._ledger[-24:]

    def pause_task(self, task_id: str) -> None:
        with self._lock:
            self._paused_tasks.add(task_id)
            self._ledger.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Task paused",
                    "detail": f"Task {task_id} paused for manual override.",
                    "status": "paused",
                }
            )
            self._ledger = self._ledger[-24:]

    def close_incident(self, incident_id: str) -> None:
        with self._lock:
            self._closed_incidents.add(incident_id)
            self._ledger.append(
                {
                    "timestamp": _now_iso(),
                    "event": "Incident closed",
                    "detail": f"Incident {incident_id} closed after verification gates.",
                    "status": "closed",
                }
            )
            self._ledger = self._ledger[-24:]


ops_execution_store = OpsExecutionStore()

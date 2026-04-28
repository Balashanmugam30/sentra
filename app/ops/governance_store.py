from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class OpsGovernanceStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._approved: set[str] = {"APR-LOW-COMMS-001"}
        self._rejected: set[str] = set()
        self._delegated: dict[str, str] = {}
        self._escalated: set[str] = {"APR-POWER-003"}
        self._automation_runs: list[dict[str, Any]] = [
            {
                "timestamp": _now_iso(),
                "event": "Governance OS online",
                "detail": "Smart approval router and automation control plane initialized.",
                "status": "verified",
            }
        ]

    def get_state(self) -> dict[str, Any]:
        with self._lock:
            return {
                "approved": set(self._approved),
                "rejected": set(self._rejected),
                "delegated": dict(self._delegated),
                "escalated": set(self._escalated),
                "automation_runs": deepcopy(self._automation_runs),
            }

    def approve(self, approval_id: str) -> None:
        with self._lock:
            self._approved.add(approval_id)
            self._rejected.discard(approval_id)
            self._append_event("Approval granted", f"{approval_id} approved by governed command.", "approved")

    def reject(self, approval_id: str) -> None:
        with self._lock:
            self._rejected.add(approval_id)
            self._approved.discard(approval_id)
            self._append_event("Approval rejected", f"{approval_id} rejected pending revised action plan.", "rejected")

    def delegate(self, approval_id: str, delegate_to: str) -> None:
        with self._lock:
            self._delegated[approval_id] = delegate_to
            self._append_event("Approval delegated", f"{approval_id} delegated to {delegate_to}.", "delegated")

    def escalate(self, approval_id: str) -> None:
        with self._lock:
            self._escalated.add(approval_id)
            self._append_event("Approval escalated", f"{approval_id} escalated to executive backup chain.", "escalated")

    def run_automation(self, action_id: str) -> None:
        with self._lock:
            self._append_event("Automation run", f"{action_id} executed through n8n-ready connector.", "executed")

    def _append_event(self, event: str, detail: str, status: str) -> None:
        self._automation_runs.append(
            {
                "timestamp": _now_iso(),
                "event": event,
                "detail": detail,
                "status": status,
            }
        )
        self._automation_runs = self._automation_runs[-30:]


ops_governance_store = OpsGovernanceStore()

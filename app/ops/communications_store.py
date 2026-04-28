from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class OpsCommunicationsStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._scenario = "zone_3_fire"
        self._sent_messages: list[dict[str, Any]] = [
            {
                "timestamp": _now_iso(),
                "event": "Communications OS online",
                "detail": "Mass notification command layer initialized in demo-safe mode.",
                "status": "verified",
            }
        ]
        self._responses: list[dict[str, Any]] = []

    def get_state(self) -> dict[str, Any]:
        with self._lock:
            return {
                "scenario": self._scenario,
                "sent_messages": deepcopy(self._sent_messages),
                "responses": deepcopy(self._responses),
            }

    def set_scenario(self, scenario: str) -> None:
        with self._lock:
            self._scenario = scenario
            self._append_event("Scenario loaded", f"Communications scenario {scenario} activated.", "active")

    def send_message(self, template_id: str, audience_id: str, channels: list[str]) -> None:
        with self._lock:
            channel_list = ", ".join(channels) if channels else "default channels"
            self._append_event(
                "Alert broadcast sent",
                f"{template_id} delivered to {audience_id} through {channel_list}.",
                "sent",
            )

    def record_response(self, person_id: str, response: str) -> None:
        with self._lock:
            self._responses.append(
                {
                    "timestamp": _now_iso(),
                    "person_id": person_id,
                    "response": response,
                }
            )
            self._responses = self._responses[-50:]
            self._append_event("Two-way response received", f"{person_id} responded {response}.", "acked")

    def _append_event(self, event: str, detail: str, status: str) -> None:
        self._sent_messages.append(
            {
                "timestamp": _now_iso(),
                "event": event,
                "detail": detail,
                "status": status,
            }
        )
        self._sent_messages = self._sent_messages[-40:]


ops_communications_store = OpsCommunicationsStore()

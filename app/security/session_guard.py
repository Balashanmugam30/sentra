"""Session anomaly detection helpers."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from threading import Lock
from typing import Any


@dataclass(slots=True)
class SessionObservation:
    session_id: str
    user_id: str | None
    source_ip: str | None
    user_agent: str | None
    observed_at: str


_lock = Lock()
_observations: dict[str, list[SessionObservation]] = defaultdict(list)


def observe_session(session_id: str | None, user_id: str | None, source_ip: str | None, user_agent: str | None) -> None:
    if not session_id:
        return
    with _lock:
        bucket = _observations[session_id]
        bucket.append(
            SessionObservation(
                session_id=session_id,
                user_id=user_id,
                source_ip=source_ip,
                user_agent=user_agent,
                observed_at=datetime.now(timezone.utc).isoformat(),
            )
        )
        del bucket[:-25]


def session_anomaly_snapshot() -> dict[str, Any]:
    with _lock:
        anomalies = []
        for session_id, records in _observations.items():
            ips = {record.source_ip for record in records if record.source_ip}
            agents = {record.user_agent for record in records if record.user_agent}
            if len(ips) > 2 or len(agents) > 3:
                anomalies.append(
                    {
                        "session_id": session_id,
                        "ips": sorted(ips),
                        "user_agents": len(agents),
                        "risk": "watch",
                    }
                )
        return {"observed_sessions": len(_observations), "anomalies": anomalies[:10]}


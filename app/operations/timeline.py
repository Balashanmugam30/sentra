"""Continuous Unified Incident Timeline: Chronological audit event logging and deduplication."""

from __future__ import annotations

from datetime import datetime, timezone
import logging
from threading import Lock
from typing import Any, Dict, List, Optional
from uuid import uuid4

from app.operations.domain import TimelineEventRecord

logger = logging.getLogger(__name__)


class TimelineStore:
    """Thread-safe, append-only timeline event store with deduplication."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._events: List[TimelineEventRecord] = []
        # Key -> timestamp of last identical event
        self._dedup_cache: Dict[str, float] = {}

    def append_event(
        self,
        incident_id: str,
        event_type: str,
        source: str,
        actor_id: str,
        actor_role: str,
        summary: str,
        details: Optional[Dict[str, Any]] = None,
        tenant_id: str = "TEN-BALA-UNI",
        is_simulation: bool = False,
    ) -> TimelineEventRecord:
        now = datetime.now(timezone.utc)
        now_ts = now.timestamp()

        # Deduplication key across incident, event_type, and summary
        dedup_key = f"{incident_id}:{event_type}:{summary}"

        with self._lock:
            last_ts = self._dedup_cache.get(dedup_key)
            if last_ts is not None and (now_ts - last_ts) < 2.0:
                # Deduplicated event within 2-second bounce window
                for ev in reversed(self._events):
                    if ev.incident_id == incident_id and ev.event_type == event_type and ev.summary == summary:
                        return ev

            event = TimelineEventRecord(
                event_id=f"TL-EV-{now.strftime('%Y%m%d%H%M%S')}-{uuid4().hex[:6]}",
                incident_id=incident_id,
                tenant_id=tenant_id,
                timestamp=now,
                event_type=event_type,
                source=source,
                actor_id=actor_id,
                actor_role=actor_role,
                summary=summary,
                details=details or {},
                is_simulation=is_simulation,
            )
            self._events.append(event)
            self._dedup_cache[dedup_key] = now_ts
            return event

    def get_events(
        self,
        incident_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        include_simulation: bool = True,
        limit: int = 100,
    ) -> List[TimelineEventRecord]:
        with self._lock:
            filtered = self._events
            if incident_id:
                filtered = [ev for ev in filtered if ev.incident_id == incident_id]
            if tenant_id:
                filtered = [ev for ev in filtered if ev.tenant_id == tenant_id]
            if not include_simulation:
                filtered = [ev for ev in filtered if not ev.is_simulation]

            # Return in reverse chronological order (newest first)
            return sorted(filtered, key=lambda ev: ev.timestamp, reverse=True)[:limit]

    def clear(self) -> None:
        with self._lock:
            self._events.clear()
            self._dedup_cache.clear()


timeline_store = TimelineStore()

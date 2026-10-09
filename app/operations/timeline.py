# app/operations/timeline.py
"""
Continuous Unified Incident Timeline: Chronological tamper-evident audit logging,
cryptographic SHA-256 hash chaining, and multi-tenant isolation (Phase 7).
"""

from __future__ import annotations

from datetime import datetime, timezone
import json
import logging
from threading import Lock
from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4

from app.operations.domain import TimelineEventRecord
from app.operations.persistence import persistence

logger = logging.getLogger(__name__)


class TimelineStore:
    """
    Durable, tamper-evident timeline event store with deduplication
    and cryptographic hash chaining backed by SQLite WAL.
    """

    def __init__(self) -> None:
        self._lock = Lock()
        self._persistence = persistence
        # Key -> timestamp of last identical event for in-flight debouncing
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
        tenant_id: str = "SYSTEM",
        is_simulation: bool = False,
    ) -> TimelineEventRecord:
        now = datetime.now(timezone.utc)
        now_ts = now.timestamp()
        safe_details = details or {}
        details_json = json.dumps(safe_details, sort_keys=True, default=str)

        # Deduplication key across tenant, incident, event_type, and summary
        dedup_key = f"{tenant_id}:{incident_id}:{event_type}:{summary}"

        with self._lock:
            last_ts = self._dedup_cache.get(dedup_key)
            if last_ts is not None and (now_ts - last_ts) < 2.0:
                # Deduplicated event within 2-second bounce window: return existing matching event
                existing = self._persistence.list_timeline_events(
                    tenant_id=tenant_id, incident_id=incident_id, limit=5
                )
                for ev in existing:
                    if ev["event_type"] == event_type and ev["summary"] == summary:
                        return TimelineEventRecord(
                            event_id=ev["event_id"],
                            incident_id=ev["incident_id"],
                            tenant_id=ev["tenant_id"],
                            timestamp=datetime.fromisoformat(ev["timestamp"]),
                            event_type=ev["event_type"],
                            source=ev["source"],
                            actor_id=ev["actor_id"],
                            actor_role=ev["actor_role"],
                            summary=ev["summary"],
                            details=ev["details"],
                            is_simulation=ev["is_simulation"],
                        )

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
                details=safe_details,
                is_simulation=is_simulation,
            )

            self._persistence.append_timeline_event(event, details_json)
            self._dedup_cache[dedup_key] = now_ts
            return event

    def list_events(
        self,
        tenant_id: Optional[str] = None,
        incident_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[TimelineEventRecord]:
        raw_events = self._persistence.list_timeline_events(
            tenant_id=tenant_id, incident_id=incident_id, limit=limit
        )
        return [
            TimelineEventRecord(
                event_id=e["event_id"],
                incident_id=e["incident_id"],
                tenant_id=e["tenant_id"],
                timestamp=datetime.fromisoformat(e["timestamp"]),
                event_type=e["event_type"],
                source=e["source"],
                actor_id=e["actor_id"],
                actor_role=e["actor_role"],
                summary=e["summary"],
                details=e["details"],
                is_simulation=e["is_simulation"],
            )
            for e in raw_events
        ]

    def get_events(
        self,
        incident_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[TimelineEventRecord]:
        """Alias for list_events supporting both incident_id and tenant_id filtering."""
        return self.list_events(tenant_id=tenant_id, incident_id=incident_id, limit=limit)

    def verify_integrity(self) -> Tuple[bool, int, Optional[str]]:
        """Verifies the complete cryptographic SHA-256 hash chain of the timeline log."""
        return self._persistence.verify_timeline_integrity()

    def clear(self) -> None:
        """Clears deduplication cache for test suites."""
        with self._lock:
            self._dedup_cache.clear()


timeline_store = TimelineStore()

from __future__ import annotations

from datetime import datetime, timezone


_events: list[dict[str, object]] = []


def _now() -> datetime:
    return datetime.now(timezone.utc)


def record_facility_event(
    *,
    source: str,
    message: str,
    severity: str = "normal",
) -> None:
    _events.append(
        {
            "timestamp": _now(),
            "source": source,
            "message": message,
            "severity": severity,
        }
    )
    del _events[:-80]


def get_facility_events_snapshot() -> list[dict[str, object]]:
    return sorted(
        _events,
        key=lambda item: (item["timestamp"], item["source"], item["message"]),
        reverse=True,
    )[:30]

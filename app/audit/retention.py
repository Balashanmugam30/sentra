from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


def _parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def apply_retention_policy(
    *,
    events: list[dict[str, Any]],
    archive: list[dict[str, Any]],
    now: datetime | None = None,
    hot_days: int = 30,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], int, int]:
    current_time = now or datetime.now(timezone.utc)
    hot_cutoff = current_time - timedelta(days=hot_days)

    next_events: list[dict[str, Any]] = []
    next_archive = list(archive)
    archived_count = 0
    pruned_count = 0

    for event in events:
        if event.get("is_demo") and event["category"] == "system" and event["action"] == "demo_event":
            pruned_count += 1
            continue

        if _parse_timestamp(event["timestamp_utc"]) < hot_cutoff:
            next_archive.append(event)
            archived_count += 1
            continue

        next_events.append(event)

    return next_events, next_archive, pruned_count, archived_count

"""Operational telemetry aggregation for internal admin surfaces."""

from __future__ import annotations

from collections import Counter
from typing import Any

from app.core.runtime_cache import get_runtime_cache_stats
from app.soc.telemetry import get_recent_telemetry, get_requests_last_minute


def route_latency_summary() -> dict[str, Any]:
    records = get_recent_telemetry()
    by_route: dict[str, list[int]] = {}
    for record in records:
        by_route.setdefault(f"{record.method} {record.path}", []).append(record.duration_ms)
    slowest = []
    for route, latencies in by_route.items():
        slowest.append(
            {
                "route": route,
                "count": len(latencies),
                "avg_latency_ms": round(sum(latencies) / max(1, len(latencies))),
                "max_latency_ms": max(latencies),
            }
        )
    return {
        "requests_last_min": get_requests_last_minute(records),
        "slowest_routes": sorted(slowest, key=lambda item: item["avg_latency_ms"], reverse=True)[:10],
        "status_codes": dict(Counter(record.status_code for record in records)),
        "modules": dict(Counter(record.module for record in records)),
        "cache": get_runtime_cache_stats(),
    }


def failed_route_summary() -> dict[str, Any]:
    records = get_recent_telemetry()
    failures = [record for record in records if record.status_code >= 400]
    return {
        "failed_requests": len(failures),
        "top_failing_routes": [
            {"route": route, "count": count}
            for route, count in Counter(f"{record.method} {record.path}" for record in failures).most_common(10)
        ],
        "auth_failures": sum(1 for record in failures if record.path.startswith("/auth")),
        "ai_route_errors": sum(1 for record in failures if record.path.startswith("/ai") or record.path.startswith("/autonomy")),
    }


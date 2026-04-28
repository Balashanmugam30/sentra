from __future__ import annotations

from datetime import datetime, timedelta, timezone
from statistics import mean

from app.hardware.devices import build_live_hardware_snapshot
from app.integrations.delivery import get_integrations_live_snapshot
from app.resilience.recovery import get_resilience_live_snapshot
from app.services.incident_service import get_all_incidents
from app.soc.telemetry import SOC_MODULES, TelemetryRecord, get_recent_records_by_module


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _percentile(values: list[int], percentile: float) -> int:
    if not values:
        return 0
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, round((len(ordered) - 1) * percentile)))
    return ordered[index]


def _module_health_from_records(module: str, records: list[TelemetryRecord]) -> dict[str, object]:
    now = _now()
    if not records:
        return {
            "module": module,
            "request_count": 0,
            "error_count": 0,
            "avg_latency_ms": 0,
            "p95_latency_ms": 0,
            "last_seen": None,
            "uptime_status": "offline",
            "module_state": "quiet",
            "status": "offline",
        }

    request_count = len(records)
    error_count = sum(1 for record in records if record.status_code >= 500)
    durations = [record.duration_ms for record in records]
    avg_latency_ms = round(mean(durations))
    p95_latency_ms = _percentile(durations, 0.95)
    last_seen = max(record.timestamp for record in records)
    age_seconds = (now - last_seen).total_seconds()
    error_rate = error_count / max(request_count, 1)

    status = "healthy"
    if age_seconds > 3600:
        status = "offline"
    elif error_rate >= 0.2 or p95_latency_ms >= 1800:
        status = "critical"
    elif error_rate >= 0.1 or p95_latency_ms >= 1000:
        status = "degraded"
    elif error_rate >= 0.03 or p95_latency_ms >= 600:
        status = "watch"

    module_state = "steady"
    if p95_latency_ms >= 1000:
        module_state = "hot"
    elif error_count > 0:
        module_state = "unstable"
    elif request_count < 4:
        module_state = "quiet"

    uptime_status = "up" if status in {"healthy", "watch"} else "degraded"
    if status == "offline":
        uptime_status = "offline"

    return {
        "module": module,
        "request_count": request_count,
        "error_count": error_count,
        "avg_latency_ms": avg_latency_ms,
        "p95_latency_ms": p95_latency_ms,
        "last_seen": last_seen,
        "uptime_status": uptime_status,
        "module_state": module_state,
        "status": status,
    }


def compute_module_health() -> list[dict[str, object]]:
    grouped = get_recent_records_by_module()
    modules = [_module_health_from_records(module, grouped.get(module, [])) for module in SOC_MODULES]

    hardware = build_live_hardware_snapshot()
    resilience = get_resilience_live_snapshot(get_all_incidents())
    integrations = get_integrations_live_snapshot()

    for item in modules:
        if item["module"] == "hardware" and hardware["global_hardware_state"] in {"warning", "degraded", "critical"}:
            item["status"] = "watch" if hardware["global_hardware_state"] == "warning" else hardware["global_hardware_state"]
            item["module_state"] = "sensor_pressure"
        if item["module"] == "integrations" and integrations["global_status"] in {"degraded", "critical"}:
            item["status"] = integrations["global_status"]
            item["module_state"] = "delivery_pressure"
        if item["module"] == "resilience" and resilience["global_state"] in {"watch", "degraded", "critical", "recovering"}:
            item["status"] = "watch" if resilience["global_state"] == "recovering" else resilience["global_state"]
            item["module_state"] = "recovery_active"

    return modules


def compute_health_score(modules: list[dict[str, object]]) -> int:
    weights = {"healthy": 100, "watch": 78, "degraded": 56, "critical": 24, "offline": 10}
    if not modules:
        return 100
    return round(sum(weights.get(str(module["status"]), 60) for module in modules) / len(modules))


def summarize_health(modules: list[dict[str, object]]) -> dict[str, object]:
    score = compute_health_score(modules)
    if score >= 85:
        global_state = "healthy"
    elif score >= 70:
        global_state = "watch"
    elif score >= 50:
        global_state = "degraded"
    elif score >= 30:
        global_state = "critical"
    else:
        global_state = "offline"

    return {
        "health_score": score,
        "global_state": global_state,
        "modules": modules,
    }

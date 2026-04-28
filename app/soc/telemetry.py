from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Any


def _now() -> datetime:
    return datetime.now(timezone.utc)


MODULE_PREFIXES: tuple[tuple[str, str], ...] = (
    ("/auth", "auth"),
    ("/rbac", "rbac"),
    ("/audit", "audit"),
    ("/analytics", "analytics"),
    ("/operations", "operations"),
    ("/governance", "governance"),
    ("/facility", "facility"),
    ("/hardware", "hardware"),
    ("/field", "field"),
    ("/resilience", "resilience"),
    ("/integrations", "integrations"),
    ("/agents", "agents"),
    ("/soc", "soc"),
)

SOC_MODULES: tuple[str, ...] = (
    "auth",
    "rbac",
    "audit",
    "analytics",
    "operations",
    "governance",
    "facility",
    "hardware",
    "field",
    "resilience",
    "integrations",
    "agents",
    "soc",
)


def infer_module_from_path(path: str) -> str:
    for prefix, module in MODULE_PREFIXES:
        if path.startswith(prefix):
            return module
    return "platform"


@dataclass
class TelemetryRecord:
    timestamp: datetime
    path: str
    method: str
    status_code: int
    duration_ms: int
    actor_email: str | None
    actor_role: str | None
    source_ip: str | None
    session_id: str | None
    module: str


class TelemetryStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._records: list[TelemetryRecord] = []

    def add(self, record: TelemetryRecord) -> None:
        with self._lock:
            self._records.append(record)
            del self._records[:-1200]

    def list(self) -> list[TelemetryRecord]:
        with self._lock:
            return list(self._records)

    def clear(self) -> None:
        with self._lock:
            self._records.clear()


telemetry_store = TelemetryStore()


def record_request_telemetry(
    *,
    path: str,
    method: str,
    status_code: int,
    duration_ms: int,
    actor_email: str | None = None,
    actor_role: str | None = None,
    source_ip: str | None = None,
    session_id: str | None = None,
    timestamp: datetime | None = None,
) -> None:
    if not path.startswith("/"):
        return
    telemetry_store.add(
        TelemetryRecord(
            timestamp=timestamp or _now(),
            path=path,
            method=method,
            status_code=status_code,
            duration_ms=max(0, duration_ms),
            actor_email=actor_email,
            actor_role=actor_role,
            source_ip=source_ip,
            session_id=session_id,
            module=infer_module_from_path(path),
        )
    )


def _seed_demo_telemetry() -> None:
    if telemetry_store.list():
        return

    now = _now() - timedelta(minutes=40)
    baselines: dict[str, tuple[int, int, int]] = {
        "auth": (28, 2, 160),
        "rbac": (14, 1, 90),
        "audit": (16, 0, 110),
        "analytics": (62, 1, 240),
        "operations": (31, 0, 180),
        "governance": (12, 0, 140),
        "facility": (18, 0, 150),
        "hardware": (21, 0, 320),
        "field": (17, 0, 135),
        "resilience": (9, 0, 125),
        "integrations": (6, 1, 410),
        "agents": (19, 0, 220),
        "soc": (7, 0, 95),
    }

    for module, (count, errors, base_latency) in baselines.items():
        prefix = f"/{module}"
        for index in range(count):
            status_code = 500 if index < errors else 200
            jitter = (index * 17) % 90
            record_request_telemetry(
                path=f"{prefix}/demo-{index % 3}",
                method="GET",
                status_code=status_code,
                duration_ms=base_latency + jitter,
                actor_email="soc-demo@sentra.local",
                actor_role="security_lead",
                source_ip="127.0.0.1",
                session_id="SES-SOC-DEMO",
                timestamp=now + timedelta(seconds=index * 9),
            )

    for index in range(240 - sum(item[0] for item in baselines.values())):
        record_request_telemetry(
            path="/analytics/live",
            method="GET",
            status_code=200,
            duration_ms=180 + ((index * 11) % 70),
            actor_email="soc-demo@sentra.local",
            actor_role="security_lead",
            source_ip="127.0.0.1",
            session_id="SES-SOC-DEMO",
            timestamp=now + timedelta(seconds=600 + index * 8),
        )


def get_recent_telemetry() -> list[TelemetryRecord]:
    _seed_demo_telemetry()
    return telemetry_store.list()


def get_requests_last_minute(records: list[TelemetryRecord] | None = None) -> int:
    current_records = records or get_recent_telemetry()
    cutoff = _now() - timedelta(minutes=1)
    return sum(1 for record in current_records if record.timestamp >= cutoff)


def get_recent_records_by_module(records: list[TelemetryRecord] | None = None) -> dict[str, list[TelemetryRecord]]:
    current_records = records or get_recent_telemetry()
    grouped: dict[str, list[TelemetryRecord]] = defaultdict(list)
    for record in current_records:
        grouped[record.module].append(record)
    return grouped

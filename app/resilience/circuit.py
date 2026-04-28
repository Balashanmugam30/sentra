from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.integrations.connectors import PROVIDER_NAMES


@dataclass
class ProviderCircuitRecord:
    name: str
    circuit_state: str = "closed"
    consecutive_failures: int = 0
    failures: int = 0
    last_success_at: datetime | None = None
    last_failure_at: datetime | None = None
    blocked_until: datetime | None = None


_provider_records: dict[str, ProviderCircuitRecord] = {
    provider: ProviderCircuitRecord(name=provider) for provider in PROVIDER_NAMES
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def get_provider_record(provider: str) -> ProviderCircuitRecord:
    if provider not in _provider_records:
        _provider_records[provider] = ProviderCircuitRecord(name=provider)
    return _provider_records[provider]


def list_provider_records() -> list[ProviderCircuitRecord]:
    return [get_provider_record(provider) for provider in sorted(_provider_records)]


def can_attempt_provider(provider: str) -> bool:
    record = get_provider_record(provider)
    now = _now()
    if record.circuit_state == "open":
      if record.blocked_until is not None and now >= record.blocked_until:
          record.circuit_state = "half_open"
          record.blocked_until = None
          return True
      return False
    return True


def mark_provider_success(provider: str) -> ProviderCircuitRecord:
    record = get_provider_record(provider)
    record.last_success_at = _now()
    record.consecutive_failures = 0
    record.circuit_state = "closed"
    record.blocked_until = None
    return record


def mark_provider_failure(provider: str) -> ProviderCircuitRecord:
    record = get_provider_record(provider)
    record.failures += 1
    record.consecutive_failures += 1
    record.last_failure_at = _now()
    if record.circuit_state == "half_open" or record.consecutive_failures >= 3:
        record.circuit_state = "open"
        record.blocked_until = _now() + timedelta(seconds=90)
    return record


def reset_provider_circuit(provider: str) -> ProviderCircuitRecord:
    record = get_provider_record(provider)
    record.circuit_state = "half_open"
    record.blocked_until = None
    record.consecutive_failures = 0
    record.circuit_state = "closed"
    return record

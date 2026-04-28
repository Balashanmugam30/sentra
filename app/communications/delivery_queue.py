from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass
class DeliveryRecord:
    receipt_id: str
    event: str
    channel: str
    payload: dict[str, object]
    provider: str
    status: str
    attempts: int
    created_at: datetime
    updated_at: datetime
    next_retry_at: datetime | None = None
    last_response: str | None = None


_delivery_records: list[DeliveryRecord] = []
_retried_count = 0
_recent_events: deque[str] = deque(maxlen=12)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _retry_delay_seconds(attempts: int) -> int | None:
    if attempts == 1:
        return 30
    if attempts == 2:
        return 60
    return None


def _queue_status_for_attempts(attempts: int) -> tuple[str, datetime | None]:
    delay = _retry_delay_seconds(attempts)
    if delay is None:
        return "failed", None

    return "pending", _now() + timedelta(seconds=delay)


def add_recent_event(event_name: str) -> None:
    _recent_events.appendleft(event_name)


def get_recent_events() -> list[str]:
    return list(_recent_events)


def get_delivery_records_snapshot() -> list[DeliveryRecord]:
    return list(_delivery_records)


def get_record_by_receipt(receipt_id: str) -> DeliveryRecord | None:
    return next((record for record in _delivery_records if record.receipt_id == receipt_id), None)


def record_sent(
    *,
    receipt_id: str,
    event: str,
    channel: str,
    payload: dict[str, object],
    provider: str,
    response: str,
) -> DeliveryRecord:
    existing = get_record_by_receipt(receipt_id)
    if existing is not None:
        existing.provider = provider
        existing.channel = channel
        existing.payload = payload
        existing.status = "sent"
        existing.updated_at = _now()
        existing.next_retry_at = None
        existing.last_response = response
        add_recent_event(event)
        return existing

    record = DeliveryRecord(
        receipt_id=receipt_id,
        event=event,
        channel=channel,
        payload=payload,
        provider=provider,
        status="sent",
        attempts=0,
        created_at=_now(),
        updated_at=_now(),
        last_response=response,
    )
    _delivery_records.append(record)
    add_recent_event(event)
    return record


def record_failure(
    *,
    receipt_id: str,
    event: str,
    channel: str,
    payload: dict[str, object],
    provider: str,
    attempts: int,
    response: str,
) -> DeliveryRecord:
    existing = get_record_by_receipt(receipt_id)
    status, next_retry_at = _queue_status_for_attempts(attempts)
    if existing is not None:
        existing.provider = provider
        existing.channel = channel
        existing.payload = payload
        existing.attempts = attempts
        existing.updated_at = _now()
        existing.last_response = response
        existing.status = status
        existing.next_retry_at = next_retry_at
        add_recent_event(event)
        return existing

    record = DeliveryRecord(
        receipt_id=receipt_id,
        event=event,
        channel=channel,
        payload=payload,
        provider=provider,
        status=status,
        attempts=attempts,
        created_at=_now(),
        updated_at=_now(),
        next_retry_at=next_retry_at,
        last_response=response,
    )
    _delivery_records.append(record)
    add_recent_event(event)
    return record


def update_failure(record: DeliveryRecord, response: str) -> DeliveryRecord:
    global _retried_count

    record.attempts += 1
    record.updated_at = _now()
    record.last_response = response
    record.status, record.next_retry_at = _queue_status_for_attempts(record.attempts)
    _retried_count += 1
    add_recent_event(record.event)
    return record


def mark_retry_success(record: DeliveryRecord, response: str) -> DeliveryRecord:
    global _retried_count

    record.status = "sent"
    record.updated_at = _now()
    record.next_retry_at = None
    record.last_response = response
    _retried_count += 1
    add_recent_event(record.event)
    return record


def pending_or_failed_records() -> list[DeliveryRecord]:
    return [record for record in _delivery_records if record.status in {"pending", "failed"}]


def get_queue_snapshot() -> dict[str, int]:
    return {
        "pending": sum(1 for record in _delivery_records if record.status == "pending"),
        "sent": sum(1 for record in _delivery_records if record.status == "sent"),
        "failed": sum(1 for record in _delivery_records if record.status == "failed"),
        "retried": _retried_count,
    }

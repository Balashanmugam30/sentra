from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from secrets import token_hex

from app.field.schemas import ResponderDevice, ResponderRole, ResponderSignal, ResponderStatus


@dataclass
class ResponderRecord:
    responder_id: str
    name: str
    role: ResponderRole
    device: ResponderDevice
    zone: str
    status: ResponderStatus
    battery: int
    signal: ResponderSignal
    last_seen: datetime
    active_task_id: str | None
    session_token: str
    call_sign: str
    sync_interval_seconds: int
    mode: str


_responder_store: dict[str, ResponderRecord] = {}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _stable_seed(*parts: object) -> int:
    return sum(ord(character) for character in "|".join(str(part) for part in parts))


def _call_sign(role: ResponderRole, responder_id: str) -> str:
    prefix = {
        "firefighter": "FIRE",
        "medical": "MED",
        "security": "SEC",
        "facility_staff": "FAC",
        "commander": "CMD",
        "supervisor": "SUP",
        "volunteer": "VOL",
    }[role]
    return f"{prefix}-{responder_id.split('-')[-1]}"


def _default_battery(responder_id: str) -> int:
    return 68 + (_stable_seed(responder_id) % 27)


def _default_signal(responder_id: str) -> ResponderSignal:
    value = _stable_seed("signal", responder_id) % 100
    if value < 18:
        return "weak"
    if value < 55:
        return "fair"
    return "strong"


def _demo_responders() -> list[ResponderRecord]:
    now = _now()
    return [
        ResponderRecord(
            responder_id="DEMO-FIRE-201",
            name="Team Alpha",
            role="firefighter",
            device="android",
            zone="Zone 2",
            status="available",
            battery=84,
            signal="strong",
            last_seen=now - timedelta(seconds=12),
            active_task_id=None,
            session_token="demo-fire-token",
            call_sign="FIRE-201",
            sync_interval_seconds=5,
            mode="demo",
        ),
        ResponderRecord(
            responder_id="DEMO-MED-301",
            name="Medic One",
            role="medical",
            device="android",
            zone="Zone 3",
            status="available",
            battery=79,
            signal="fair",
            last_seen=now - timedelta(seconds=18),
            active_task_id=None,
            session_token="demo-med-token",
            call_sign="MED-301",
            sync_interval_seconds=5,
            mode="demo",
        ),
        ResponderRecord(
            responder_id="DEMO-SEC-101",
            name="Security Delta",
            role="security",
            device="rugged_tablet",
            zone="Zone 1",
            status="offline",
            battery=63,
            signal="weak",
            last_seen=now - timedelta(minutes=8),
            active_task_id=None,
            session_token="demo-sec-token",
            call_sign="SEC-101",
            sync_interval_seconds=5,
            mode="demo",
        ),
    ]


def _is_online(record: ResponderRecord) -> bool:
    if record.status == "offline":
        return False
    return (_now() - record.last_seen).total_seconds() <= 240


def register_responder(
    *,
    responder_id: str,
    name: str,
    role: ResponderRole,
    device: ResponderDevice,
    zone: str,
    mode: str = "real",
) -> ResponderRecord:
    existing = _responder_store.get(responder_id)
    now = _now()
    if existing is not None:
        existing.name = name
        existing.role = role
        existing.device = device
        existing.zone = zone
        existing.status = "available" if existing.status == "offline" else existing.status
        existing.last_seen = now
        existing.mode = mode
        return existing

    record = ResponderRecord(
        responder_id=responder_id,
        name=name,
        role=role,
        device=device,
        zone=zone,
        status="available",
        battery=_default_battery(responder_id),
        signal=_default_signal(responder_id),
        last_seen=now,
        active_task_id=None,
        session_token=token_hex(16),
        call_sign=_call_sign(role, responder_id),
        sync_interval_seconds=5,
        mode=mode,
    )
    _responder_store[responder_id] = record
    return record


def get_responder_record(responder_id: str) -> ResponderRecord | None:
    existing = _responder_store.get(responder_id)
    if existing is not None:
        return existing
    if responder_id.startswith("DEMO-"):
        demo = next((item for item in _demo_responders() if item.responder_id == responder_id), None)
        if demo is not None:
            _responder_store[responder_id] = demo
            return demo
    return None


def list_responder_records(include_demo_fallback: bool = True) -> list[ResponderRecord]:
    records = sorted(_responder_store.values(), key=lambda item: (item.role, item.responder_id))
    if records or not include_demo_fallback:
        return records
    return _demo_responders()


def touch_responder(responder_id: str, *, zone: str | None = None) -> ResponderRecord:
    record = get_responder_record(responder_id)
    if record is None:
        raise ValueError(f"Responder '{responder_id}' not found")
    record.last_seen = _now()
    if zone:
        record.zone = zone
    return record


def set_responder_task(
    responder_id: str,
    *,
    task_id: str | None,
    status: ResponderStatus | None = None,
    zone: str | None = None,
) -> ResponderRecord:
    record = touch_responder(responder_id, zone=zone)
    record.active_task_id = task_id
    if status is not None:
        record.status = status
    return record


def build_responders_snapshot() -> list[dict[str, object]]:
    records = list_responder_records()
    return [
        {
            "responder_id": record.responder_id,
            "name": record.name,
            "role": record.role,
            "status": "offline" if not _is_online(record) else record.status,
            "current_zone": record.zone,
            "battery": record.battery,
            "signal": record.signal,
            "last_seen": record.last_seen,
            "active_task_id": record.active_task_id,
            "call_sign": record.call_sign,
            "mode": record.mode,
        }
        for record in records
    ]


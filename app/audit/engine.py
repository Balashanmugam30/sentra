from __future__ import annotations

import csv
import json
from datetime import datetime, timedelta, timezone
from io import StringIO
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4

from fastapi import Request

from app.audit.anomaly import detect_audit_anomalies
from app.audit.models import AuditRecord
from app.audit.retention import apply_retention_policy
from app.core.config import settings


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class AuditStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"events": [], "archive": []}

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            return json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def list_events(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._read()["events"])

    def list_archive(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._read()["archive"])

    def append(self, record: dict[str, Any]) -> None:
        with self._lock:
            payload = self._read()
            payload["events"].append(record)
            self._write(payload)

    def replace(self, *, events: list[dict[str, Any]], archive: list[dict[str, Any]]) -> None:
        with self._lock:
            self._write({"events": events, "archive": archive})

    def clear(self) -> None:
        with self._lock:
            self._write(self._default_payload())


audit_store = AuditStore(settings.audit_store_path)


def _serialize_timestamp(timestamp: datetime | None = None) -> str:
    return (timestamp or utc_now()).isoformat().replace("+00:00", "Z")


def _next_event_id(existing_events: list[dict[str, Any]]) -> str:
    return f"AUD-{len(existing_events) + 1:06d}"


def build_audit_context(
    request: Request | None,
    identity: dict[str, object] | None = None,
    *,
    actor_user_id: str | None = None,
    actor_email: str | None = None,
    actor_role: str | None = None,
    session_id: str | None = None,
    correlation_id: str | None = None,
) -> dict[str, Any]:
    source_ip = request.client.host if request and request.client else None
    user_agent = request.headers.get("user-agent") if request else None

    return {
        "actor_user_id": actor_user_id
        or (str(identity.get("id") or identity.get("user_id") or "") if identity else None),
        "actor_email": actor_email or (str(identity.get("email") or "") if identity else None),
        "actor_role": actor_role or (str(identity.get("role") or "") if identity else None),
        "tenant_id": (
            str(identity["tenant_id"])
            if identity and identity.get("tenant_id")
            else (
                str(getattr(request.state, "tenant_id", ""))
                if request and getattr(request.state, "tenant_id", None)
                else None
            )
        ),
        "source_ip": source_ip,
        "user_agent": user_agent,
        "session_id": session_id or (str(identity.get("session_id")) if identity else None),
        "correlation_id": correlation_id or str(uuid4()),
    }


def append_audit_event(
    *,
    category: str,
    action: str,
    severity: str,
    target_module: str,
    status: str,
    reason: str | None = None,
    target_id: str | None = None,
    before_state: dict[str, Any] | None = None,
    after_state: dict[str, Any] | None = None,
    risk_score: int = 0,
    request: Request | None = None,
    identity: dict[str, object] | None = None,
    actor_user_id: str | None = None,
    actor_email: str | None = None,
    actor_role: str | None = None,
    correlation_id: str | None = None,
    session_id: str | None = None,
    tenant_id: str | None = None,
    is_demo: bool = False,
) -> dict[str, Any]:
    existing = audit_store.list_events()
    previous_hash = existing[-1]["record_hash"] if existing else "GENESIS"
    context = build_audit_context(
        request,
        identity,
        actor_user_id=actor_user_id,
        actor_email=actor_email,
        actor_role=actor_role,
        session_id=session_id,
        correlation_id=correlation_id,
    )

    payload = {
        "event_id": _next_event_id(existing),
        "timestamp_utc": _serialize_timestamp(),
        "category": category,
        "action": action,
        "severity": severity,
        "actor_user_id": context["actor_user_id"],
        "actor_email": context["actor_email"],
        "actor_role": context["actor_role"],
        "source_ip": context["source_ip"],
        "user_agent": context["user_agent"],
        "target_module": target_module,
        "target_id": target_id,
        "status": status,
        "reason": reason,
        "before_state": before_state,
        "after_state": after_state,
        "risk_score": max(0, min(100, risk_score)),
        "correlation_id": context["correlation_id"],
        "session_id": context["session_id"],
        "tenant_id": tenant_id or context["tenant_id"],
        "is_demo": is_demo,
    }
    record = AuditRecord.from_payload(payload=payload, previous_hash=previous_hash).to_dict()
    audit_store.append(record)
    return record


def log_system_event(
    *,
    action: str,
    severity: str,
    reason: str,
    target_module: str = "system",
    status: str = "success",
    risk_score: int = 0,
) -> dict[str, Any]:
    return append_audit_event(
        category="system",
        action=action,
        severity=severity,
        target_module=target_module,
        status=status,
        reason=reason,
        risk_score=risk_score,
    )


def get_all_audit_events() -> list[dict[str, Any]]:
    return audit_store.list_events()


def get_audit_integrity_snapshot() -> dict[str, Any]:
    events = audit_store.list_events()
    previous_hash = "GENESIS"
    broken_records: list[str] = []

    for event in events:
        expected_hash = AuditRecord.compute_hash(
            payload={key: value for key, value in event.items() if key not in {"record_hash", "previous_hash"}},
            previous_hash=previous_hash,
        )
        if event["previous_hash"] != previous_hash or event["record_hash"] != expected_hash:
            broken_records.append(event["event_id"])
        previous_hash = event["record_hash"]

    return {
        "chain_valid": not broken_records,
        "broken_records": broken_records,
        "total_records": len(events),
    }


def _events_today(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cutoff = utc_now() - timedelta(days=1)
    return [
        event for event in events if datetime.fromisoformat(event["timestamp_utc"].replace("Z", "+00:00")) >= cutoff
    ]


def _tenant_events(events: list[dict[str, Any]], tenant_id: str | None) -> list[dict[str, Any]]:
    if not tenant_id:
        return events
    return [event for event in events if event.get("tenant_id") == tenant_id or bool(event.get("is_demo"))]


def build_audit_live_snapshot(*, include_full_details: bool, tenant_id: str | None = None) -> dict[str, Any]:
    ensure_demo_audit_seeded()
    events = _tenant_events(audit_store.list_events(), tenant_id)
    recent_events = list(reversed(events[-15:]))
    anomalies = detect_audit_anomalies(events)
    integrity = get_audit_integrity_snapshot()
    events_today = _events_today(events)

    return {
        "totals": {
            "total_events_today": len(events_today),
            "failed_logins": len(
                [event for event in events_today if event["category"] == "auth" and event["action"] == "login_failed"]
            ),
            "denied_requests": len([event for event in events_today if event["status"] == "denied"]),
            "critical_actions": len([event for event in events_today if event["severity"] in {"high", "critical"}]),
        },
        "recent_events": recent_events if include_full_details else recent_events[:5],
        "anomalies": anomalies if include_full_details else anomalies[:2],
        "integrity_status": integrity,
        "summary_only": not include_full_details,
    }


def get_audit_events_page(*, page: int, page_size: int, tenant_id: str | None = None) -> dict[str, Any]:
    ensure_demo_audit_seeded()
    events = list(reversed(_tenant_events(audit_store.list_events(), tenant_id)))
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "page": page,
        "page_size": page_size,
        "total_records": len(events),
        "events": events[start:end],
    }


def search_audit_events(filters: dict[str, Any], tenant_id: str | None = None) -> dict[str, Any]:
    ensure_demo_audit_seeded()
    events = list(reversed(_tenant_events(audit_store.list_events(), tenant_id)))

    def matches(event: dict[str, Any]) -> bool:
        if filters.get("user"):
            user_query = str(filters["user"]).lower()
            if user_query not in str(event.get("actor_email") or "").lower():
                return False
        if filters.get("role") and event.get("actor_role") != filters["role"]:
            return False
        if filters.get("module") and event.get("target_module") != filters["module"]:
            return False
        if filters.get("severity") and event.get("severity") != filters["severity"]:
            return False
        if filters.get("status") and event.get("status") != filters["status"]:
            return False
        if filters.get("date_from"):
            if datetime.fromisoformat(event["timestamp_utc"].replace("Z", "+00:00")) < filters["date_from"]:
                return False
        if filters.get("date_to"):
            if datetime.fromisoformat(event["timestamp_utc"].replace("Z", "+00:00")) > filters["date_to"]:
                return False
        return True

    matched = [event for event in events if matches(event)]
    page = int(filters.get("page", 1))
    page_size = int(filters.get("page_size", 25))
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "page": page,
        "page_size": page_size,
        "total_records": len(matched),
        "events": matched[start:end],
    }


def export_audit_events(*, export_format: str, tenant_id: str | None = None) -> dict[str, Any]:
    ensure_demo_audit_seeded()
    events = _tenant_events(audit_store.list_events(), tenant_id)
    if export_format == "json":
        return {
            "format": "json",
            "content": json.dumps(events, indent=2),
            "exported_count": len(events),
        }

    output = StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=[
            "event_id",
            "timestamp_utc",
            "category",
            "action",
            "severity",
            "actor_email",
            "actor_role",
            "source_ip",
            "target_module",
            "target_id",
            "status",
            "reason",
            "risk_score",
            "correlation_id",
            "session_id",
            "tenant_id",
            "previous_hash",
            "record_hash",
        ],
    )
    writer.writeheader()
    for event in events:
        writer.writerow({key: event.get(key) for key in writer.fieldnames})
    return {
        "format": "csv",
        "content": output.getvalue(),
        "exported_count": len(events),
    }


def log_test_event(*, identity: dict[str, object], request: Request, payload: dict[str, Any]) -> dict[str, Any]:
    return append_audit_event(
        category=payload.get("category", "system"),
        action=payload.get("action", "demo_event"),
        severity="medium",
        target_module=payload.get("target_module", "audit"),
        status="success",
        reason=payload.get("reason", "Manual audit test event"),
        risk_score=25,
        request=request,
        identity=identity,
        is_demo=True,
    )


def prune_retention() -> dict[str, Any]:
    events = audit_store.list_events()
    archive = audit_store.list_archive()
    next_events, next_archive, pruned_count, archived_count = apply_retention_policy(
        events=events,
        archive=archive,
    )
    audit_store.replace(events=next_events, archive=next_archive)
    return {
        "pruned_count": pruned_count,
        "archived_count": archived_count,
        "remaining_records": len(next_events),
    }


def ensure_demo_audit_seeded() -> None:
    if audit_store.list_events():
        return

    sample_events = [
        (
            "auth",
            "login_success",
            "low",
            "auth",
            "success",
            "Sentra Admin session established",
            "admin@sentra.local",
            "super_admin",
        ),
        ("auth", "login_failed", "medium", "auth", "error", "Invalid password supplied", "unknown@sentra.local", None),
        (
            "rbac",
            "role_assignment",
            "medium",
            "rbac",
            "success",
            "Assigned analyst role",
            "admin@sentra.local",
            "super_admin",
        ),
        (
            "facility",
            "lockdown",
            "critical",
            "facility",
            "success",
            "Zone 2 lockdown triggered",
            "admin@sentra.local",
            "super_admin",
        ),
        (
            "rbac",
            "permission_denied",
            "high",
            "facility",
            "denied",
            "Executive denied facility lockdown",
            "exec@sentra.local",
            "executive",
        ),
        (
            "operations",
            "workflow_run",
            "high",
            "operations",
            "success",
            "Critical fire workflow launched",
            "ops@sentra.local",
            "operations_commander",
        ),
        (
            "governance",
            "approval_granted",
            "medium",
            "governance",
            "success",
            "Commander approved action",
            "ops@sentra.local",
            "operations_commander",
        ),
        (
            "hardware",
            "device_command",
            "medium",
            "hardware",
            "success",
            "Siren command delivered",
            "security@sentra.local",
            "security_lead",
        ),
        (
            "field",
            "task_acknowledge",
            "low",
            "field",
            "success",
            "Responder acknowledged task",
            "responder@sentra.local",
            "responder",
        ),
        (
            "field",
            "backup_request",
            "medium",
            "field",
            "success",
            "Backup requested from Zone 2",
            "responder@sentra.local",
            "responder",
        ),
        (
            "integrations",
            "delivery_retry",
            "medium",
            "integrations",
            "success",
            "Retry queue drained",
            "admin@sentra.local",
            "super_admin",
        ),
        (
            "resilience",
            "recover_workflow",
            "medium",
            "resilience",
            "success",
            "Workflow recovered",
            "ops@sentra.local",
            "operations_commander",
        ),
        (
            "auth",
            "refresh_token",
            "low",
            "auth",
            "success",
            "Access token refreshed",
            "admin@sentra.local",
            "super_admin",
        ),
        ("auth", "logout", "low", "auth", "success", "Session closed", "admin@sentra.local", "super_admin"),
        (
            "facility",
            "hvac_command",
            "high",
            "facility",
            "success",
            "Zone 3 HVAC shutdown",
            "security@sentra.local",
            "security_lead",
        ),
        (
            "facility",
            "announcement",
            "medium",
            "facility",
            "success",
            "PA evacuation message sent",
            "security@sentra.local",
            "security_lead",
        ),
        (
            "facility",
            "elevator_recall",
            "high",
            "facility",
            "success",
            "Elevator recall initiated",
            "security@sentra.local",
            "security_lead",
        ),
        ("auth", "login_failed", "medium", "auth", "error", "Invalid password supplied", "unknown@sentra.local", None),
        ("auth", "login_failed", "medium", "auth", "error", "Invalid password supplied", "unknown@sentra.local", None),
        ("auth", "login_failed", "medium", "auth", "error", "Invalid password supplied", "unknown@sentra.local", None),
        ("auth", "login_failed", "medium", "auth", "error", "Invalid password supplied", "unknown@sentra.local", None),
        (
            "rbac",
            "permission_denied",
            "high",
            "operations",
            "denied",
            "Responder attempted operations route",
            "responder@sentra.local",
            "responder",
        ),
        (
            "hardware",
            "device_command",
            "medium",
            "hardware",
            "success",
            "Beacon flash queued",
            "security@sentra.local",
            "security_lead",
        ),
        ("system", "startup", "low", "system", "success", "System startup event", "system@sentra.local", "super_admin"),
        ("system", "demo_event", "low", "audit", "success", "Demo audit record", "admin@sentra.local", "super_admin"),
    ]

    audit_store.clear()
    now = utc_now() - timedelta(minutes=24)
    for index, item in enumerate(sample_events):
        category, action, severity, target_module, status, reason, actor_email, actor_role = item
        existing = audit_store.list_events()
        previous_hash = existing[-1]["record_hash"] if existing else "GENESIS"
        payload = {
            "event_id": _next_event_id(existing),
            "timestamp_utc": _serialize_timestamp(now + timedelta(minutes=index)),
            "category": category,
            "action": action,
            "severity": severity,
            "actor_user_id": None if actor_email == "unknown@sentra.local" else f"USR-DEMO-{index:03d}",
            "actor_email": actor_email,
            "actor_role": actor_role,
            "source_ip": "127.0.0.1",
            "user_agent": "Sentra Demo Seed",
            "target_module": target_module,
            "target_id": None,
            "status": status,
            "reason": reason,
            "before_state": None,
            "after_state": None,
            "risk_score": 70 if severity == "critical" else 45 if severity == "high" else 25,
            "correlation_id": f"CORR-DEMO-{index:03d}",
            "session_id": f"SES-DEMO-{index:03d}",
            "is_demo": True,
        }
        audit_store.append(AuditRecord.from_payload(payload=payload, previous_hash=previous_hash).to_dict())

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.audit.engine import append_audit_event
from app.soc.detections import compute_soc_detections
from app.soc.health import compute_health_score, compute_module_health
from app.soc.incidents import list_soc_incidents, resolve_soc_incident, sync_soc_incidents
from app.soc.telemetry import get_requests_last_minute, get_recent_telemetry, record_request_telemetry


def _now() -> datetime:
    return datetime.now(timezone.utc)


def ingest_soc_request(
    *,
    path: str,
    method: str,
    status_code: int,
    duration_ms: int,
    actor_email: str | None = None,
    actor_role: str | None = None,
    source_ip: str | None = None,
    session_id: str | None = None,
) -> None:
    record_request_telemetry(
        path=path,
        method=method,
        status_code=status_code,
        duration_ms=duration_ms,
        actor_email=actor_email,
        actor_role=actor_role,
        source_ip=source_ip,
        session_id=session_id,
    )


def run_soc_scan(*, identity: dict[str, object] | None = None, request=None) -> dict[str, Any]:
    detections = compute_soc_detections()
    incidents = sync_soc_incidents(detections)
    modules = compute_module_health()
    score = compute_health_score(modules)
    if identity is not None and request is not None:
        append_audit_event(
            category="system",
            action="soc_manual_scan",
            severity="low",
            target_module="soc",
            status="success",
            reason="Manual SOC scan executed",
            request=request,
            identity=identity,
            risk_score=18,
        )
    return {
        "detections": detections,
        "incidents": incidents,
        "health_score": score,
        "modules": modules,
    }


def build_soc_live_snapshot(*, include_full_details: bool) -> dict[str, Any]:
    scan = run_soc_scan()
    detections = scan["detections"]
    incidents = list_soc_incidents()
    health_score = scan["health_score"]
    blocked_actions = sum(1 for record in get_recent_telemetry() if record.status_code == 403)

    threat_level = "low"
    if any(item["severity"] == "critical" and item["status"] != "resolved" for item in incidents):
        threat_level = "critical"
    elif any(item["severity"] == "high" and item["status"] != "resolved" for item in incidents):
        threat_level = "high"
    elif detections:
        threat_level = "medium"

    top_alerts = [detection["title"] for detection in detections[:4]]
    return {
        "generated_at": _now(),
        "threat_level": threat_level,
        "open_incidents": len([incident for incident in incidents if incident["status"] != "resolved"]),
        "detections_today": len(detections),
        "blocked_actions": blocked_actions,
        "health_score": health_score,
        "requests_per_minute": get_requests_last_minute(),
        "top_alerts": top_alerts,
        "summary_only": not include_full_details,
    }


def build_soc_health_snapshot() -> dict[str, Any]:
    modules = compute_module_health()
    return {
        "generated_at": _now(),
        "health_score": compute_health_score(modules),
        "modules": modules,
    }


def build_soc_detections_snapshot() -> dict[str, Any]:
    detections = compute_soc_detections()
    sync_soc_incidents(detections)
    return {
        "generated_at": _now(),
        "detections": detections,
    }


def build_soc_incidents_snapshot() -> dict[str, Any]:
    sync_soc_incidents(compute_soc_detections())
    return {
        "generated_at": _now(),
        "incidents": list_soc_incidents(),
    }


def run_soc_test_attack(scenario: str) -> dict[str, Any]:
    from app.audit.engine import append_audit_event

    if scenario == "brute_force":
        for _ in range(5):
            append_audit_event(
                category="auth",
                action="login_failed",
                severity="medium",
                target_module="auth",
                status="error",
                reason="SOC brute force simulation",
                actor_email="attacker@sentra.local",
                risk_score=62,
            )
    elif scenario == "privilege_abuse":
        for _ in range(4):
            append_audit_event(
                category="rbac",
                action="permission_denied",
                severity="high",
                target_module="/facility/lockdown",
                status="denied",
                reason="Responder attempted privileged route",
                actor_email="responder@sentra.local",
                actor_role="responder",
                risk_score=76,
            )
            record_request_telemetry(
                path="/facility/lockdown",
                method="POST",
                status_code=403,
                duration_ms=140,
                actor_email="responder@sentra.local",
                actor_role="responder",
                source_ip="127.0.0.2",
                session_id="SES-RESP-ABUSE",
            )
    elif scenario == "latency_spike":
        for _ in range(8):
            record_request_telemetry(
                path="/analytics/executive",
                method="GET",
                status_code=200,
                duration_ms=1600,
                actor_email="exec@sentra.local",
                actor_role="executive",
                source_ip="127.0.0.1",
                session_id="SES-EXEC-LAT",
            )
    elif scenario == "facility_command_storm":
        for index in range(5):
            append_audit_event(
                category="facility",
                action="lockdown" if index % 2 == 0 else "hvac_command",
                severity="critical",
                target_module="facility",
                status="success",
                reason="SOC facility command storm simulation",
                actor_email="security@sentra.local",
                actor_role="security_lead",
                risk_score=88,
            )
            record_request_telemetry(
                path="/facility/lockdown",
                method="POST",
                status_code=200,
                duration_ms=180,
                actor_email="security@sentra.local",
                actor_role="security_lead",
                source_ip="127.0.0.3",
                session_id="SES-SEC-STORM",
            )
    elif scenario == "token_abuse":
        for _ in range(7):
            append_audit_event(
                category="auth",
                action="refresh_token",
                severity="medium",
                target_module="auth",
                status="success",
                reason="SOC token abuse simulation",
                actor_email="admin@sentra.local",
                actor_role="super_admin",
                session_id="SES-TOKEN-STORM",
                risk_score=64,
            )

    scan = run_soc_scan()
    return {
        "status": "completed",
        "scenario": scenario,
        "threat_level": build_soc_live_snapshot(include_full_details=True)["threat_level"],
        "detections": scan["detections"],
        "incidents": list_soc_incidents(),
    }


def resolve_soc_incident_by_id(incident_id: str, *, identity: dict[str, object], request) -> dict[str, Any] | None:
    incident = resolve_soc_incident(incident_id)
    if incident is None:
        return None
    append_audit_event(
        category="system",
        action="soc_incident_resolved",
        severity="medium",
        target_module="soc",
        status="success",
        reason=f"SOC incident {incident_id} resolved",
        request=request,
        identity=identity,
        target_id=incident_id,
        risk_score=34,
    )
    return incident

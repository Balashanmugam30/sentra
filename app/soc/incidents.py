from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Any


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SocIncidentStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._incidents: list[dict[str, Any]] = []

    def list(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._incidents)

    def upsert_from_detection(self, detection: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            for incident in self._incidents:
                if incident["source_rule"] == detection["source_rule"] and incident["status"] != "resolved":
                    incident["last_seen"] = _now()
                    incident["title"] = detection["title"]
                    incident["severity"] = detection["severity"]
                    incident["affected_user"] = detection.get("affected_user")
                    incident["affected_module"] = detection.get("affected_module")
                    incident["recommended_actions"] = _recommended_actions_for_detection(detection)
                    return dict(incident)

            incident = {
                "incident_id": f"SOC-{len(self._incidents) + 101}",
                "created_at": _now(),
                "last_seen": _now(),
                "title": detection["title"],
                "severity": detection["severity"],
                "source_rule": detection["source_rule"],
                "affected_user": detection.get("affected_user"),
                "affected_module": detection.get("affected_module"),
                "recommended_actions": _recommended_actions_for_detection(detection),
                "status": "open",
            }
            self._incidents.append(incident)
            return dict(incident)

    def resolve(self, incident_id: str) -> dict[str, Any] | None:
        with self._lock:
            for incident in self._incidents:
                if incident["incident_id"] == incident_id:
                    incident["status"] = "resolved"
                    incident["resolved_at"] = _now()
                    return dict(incident)
        return None


def _recommended_actions_for_detection(detection: dict[str, Any]) -> list[str]:
    rule = str(detection["source_rule"])
    if "brute" in rule or "auth" in rule:
        return ["Force password reset review", "Inspect source IP activity", "Monitor token issuance closely"]
    if "facility" in rule:
        return ["Review facility command trail", "Confirm command intent with security lead", "Lock high-risk controls behind approval"]
    if "latency" in rule or "error" in rule:
        return ["Inspect impacted module health", "Review recent deployment or queue pressure", "Escalate to resilience workflow if needed"]
    return ["Review audit chain for related actions", "Confirm actor legitimacy", "Escalate to security operations if activity continues"]


incident_store = SocIncidentStore()


def sync_soc_incidents(detections: list[dict[str, Any]]) -> list[dict[str, Any]]:
    incidents: list[dict[str, Any]] = []
    for detection in detections:
        if detection["severity"] not in {"high", "critical"}:
            continue
        incidents.append(incident_store.upsert_from_detection(detection))
    return incidents


def list_soc_incidents() -> list[dict[str, Any]]:
    return sorted(
        incident_store.list(),
        key=lambda item: (item["status"] == "resolved", -item["created_at"].timestamp()),
    )


def resolve_soc_incident(incident_id: str) -> dict[str, Any] | None:
    return incident_store.resolve(incident_id)

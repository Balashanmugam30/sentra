from __future__ import annotations

import logging
from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from time import monotonic
from uuid import uuid4

from fastapi import HTTPException, status

from app.core.config import settings
from app.core.firebase import firebase_available, get_firestore_client
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.db.fake_db import incidents_db
from app.models.incident import Incident
from app.schemas.incident_schema import IncidentCreate
from app.services.connection_manager import incident_connection_manager

logger = logging.getLogger(__name__)
_incident_snapshot_lock = Lock()
_last_incident_snapshot: list[Incident] = []
_last_firestore_quota_warning_at = 0.0
_FIRESTORE_QUOTA_WARNING_INTERVAL_SECONDS = 30.0


def reset_incidents() -> None:
    incidents_db.clear()
    _remember_incident_snapshot([])


def _clone_incidents(incidents: list[Incident]) -> list[Incident]:
    return deepcopy(incidents)


def _remember_incident_snapshot(incidents: list[Incident]) -> None:
    global _last_incident_snapshot
    with _incident_snapshot_lock:
        _last_incident_snapshot = _clone_incidents(incidents)


def _read_last_incident_snapshot() -> list[Incident]:
    with _incident_snapshot_lock:
        return _clone_incidents(_last_incident_snapshot)


def _upsert_incident_snapshot(incident: Incident) -> None:
    global _last_incident_snapshot
    with _incident_snapshot_lock:
        next_snapshot = _clone_incidents(_last_incident_snapshot)
        for index, existing in enumerate(next_snapshot):
            if existing.id == incident.id:
                next_snapshot[index] = deepcopy(incident)
                break
        else:
            next_snapshot.append(deepcopy(incident))
        _last_incident_snapshot = next_snapshot


def _is_firestore_quota_error(error: Exception) -> bool:
    error_name = error.__class__.__name__.lower()
    error_message = str(error).lower()
    return (
        "resourceexhausted" in error_name
        or "quota" in error_message
        or "429" in error_message
    )


def _warn_firestore_quota_once() -> None:
    global _last_firestore_quota_warning_at
    now = monotonic()
    if now - _last_firestore_quota_warning_at < _FIRESTORE_QUOTA_WARNING_INTERVAL_SECONDS:
        return
    _last_firestore_quota_warning_at = now
    logger.warning("[Firestore quota warning] using cached incidents snapshot")


def _incident_cache_ttl_seconds() -> float:
    return max(5.0, settings.incident_cache_ttl_seconds)


def serialize_incident(incident: Incident) -> dict[str, object]:
    return {
        "id": incident.id,
        "type": incident.type,
        "status": incident.status,
        "severity": incident.severity,
        "location": incident.location,
        "created_at": incident.created_at.isoformat(),
        "title": incident.title,
        "description": incident.description,
        "category": incident.category,
        "lat": incident.lat,
        "lng": incident.lng,
        "created_by": incident.created_by,
        "assigned_to": incident.assigned_to,
        "updated_at": incident.updated_at.isoformat() if incident.updated_at else None,
        "images": incident.images or [],
        "videos": incident.videos or [],
        "ai_summary": incident.ai_summary,
        "source": incident.source,
        "risk_level": incident.risk_level,
        "incident_type": incident.incident_type,
        "confidence": incident.confidence,
        "detected_by": incident.detected_by,
        "recommended_action": incident.recommended_action,
        "priority": incident.priority,
        "decision_confidence": incident.decision_confidence,
        "decided_by": incident.decided_by,
    }


def _incident_from_dict(data: dict[str, object], incident_id: str) -> Incident:
    created_at = data.get("created_at") or data.get("createdAt") or datetime.now(timezone.utc)
    updated_at = data.get("updated_at") or data.get("updatedAt")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    return Incident(
        id=incident_id,
        type=str(data.get("type") or data.get("title") or "incident"),
        status=str(data.get("status") or "active"),
        severity=int(data.get("severity") or 3),
        location=str(data.get("location") or "Unknown"),
        created_at=created_at if isinstance(created_at, datetime) else datetime.now(timezone.utc),
        title=str(data.get("title")) if data.get("title") is not None else None,
        description=str(data.get("description")) if data.get("description") is not None else None,
        category=str(data.get("category")) if data.get("category") is not None else None,
        lat=float(data["lat"]) if data.get("lat") is not None else None,
        lng=float(data["lng"]) if data.get("lng") is not None else None,
        created_by=str(data.get("createdBy") or data.get("created_by") or "") or None,
        assigned_to=str(data.get("assignedTo") or data.get("assigned_to") or "") or None,
        updated_at=updated_at if isinstance(updated_at, datetime) else None,
        images=list(data.get("images") or []),
        videos=list(data.get("videos") or []),
        ai_summary=str(data.get("aiSummary") or data.get("ai_summary") or "") or None,
        source=str(data.get("source") or "") or None,
        risk_level=str(data.get("risk_level")) if data.get("risk_level") is not None else None,
        incident_type=str(data.get("incident_type")) if data.get("incident_type") is not None else None,
        confidence=float(data["confidence"]) if data.get("confidence") is not None else None,
        detected_by=str(data.get("detected_by")) if data.get("detected_by") is not None else None,
        recommended_action=str(data.get("recommended_action")) if data.get("recommended_action") is not None else None,
        priority=str(data.get("priority")) if data.get("priority") is not None else None,
        decision_confidence=float(data["decision_confidence"]) if data.get("decision_confidence") is not None else None,
        decided_by=str(data.get("decided_by")) if data.get("decided_by") is not None else None,
    )


def _firestore_enabled() -> bool:
    return firebase_available()


async def create_incident(payload: IncidentCreate, created_by: str = "system") -> Incident:
    now = datetime.now(timezone.utc)
    incident_id = str(uuid4())
    incident = Incident(
        id=incident_id,
        type=payload.type.strip(),
        status="active",
        severity=payload.severity,
        location=payload.location.strip(),
        created_at=now,
        title=payload.title or payload.type.strip(),
        description=payload.description,
        category=payload.category or payload.incident_type or payload.type.strip(),
        lat=payload.lat,
        lng=payload.lng,
        created_by=created_by,
        assigned_to=payload.assigned_to,
        updated_at=now,
        images=payload.images,
        videos=payload.videos,
        ai_summary=payload.ai_summary,
        source=payload.source or "manual",
        risk_level=payload.risk_level,
        incident_type=payload.incident_type,
        confidence=payload.confidence,
        detected_by=payload.detected_by,
        recommended_action=payload.recommended_action,
        priority=payload.priority,
        decision_confidence=payload.decision_confidence,
        decided_by=payload.decided_by,
    )
    if _firestore_enabled():
        firestore_payload = {
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity,
            "category": incident.category,
            "type": incident.type,
            "location": incident.location,
            "lat": incident.lat,
            "lng": incident.lng,
            "status": incident.status,
            "createdBy": created_by,
            "assignedTo": incident.assigned_to,
            "createdAt": now.isoformat(),
            "created_at": now.isoformat(),
            "updatedAt": now.isoformat(),
            "images": incident.images or [],
            "videos": incident.videos or [],
            "aiSummary": incident.ai_summary,
            "source": incident.source,
            "risk_level": incident.risk_level,
            "incident_type": incident.incident_type,
            "confidence": incident.confidence,
            "detected_by": incident.detected_by,
            "recommended_action": incident.recommended_action,
            "priority": incident.priority,
            "decision_confidence": incident.decision_confidence,
            "decided_by": incident.decided_by,
        }
        get_firestore_client().collection("incidents").document(incident_id).set(firestore_payload)
        _upsert_incident_snapshot(incident)
        clear_runtime_cache("incidents:")
    else:
        incidents_db.append(incident)
        _upsert_incident_snapshot(incident)
        clear_runtime_cache("incidents:")
    await incident_connection_manager.broadcast(
        {
            "type": "incident_created",
            "data": serialize_incident(incident),
        }
    )
    return incident


def get_all_incidents() -> list[Incident]:
    if _firestore_enabled():
        def build() -> list[Incident]:
            try:
                docs = get_firestore_client().collection("incidents").stream()
                incidents = [_incident_from_dict(doc.to_dict() or {}, doc.id) for doc in docs]
                _remember_incident_snapshot(incidents)
                return incidents
            except Exception as error:
                if settings.enable_firestore_fallback_cache and _is_firestore_quota_error(error):
                    _warn_firestore_quota_once()
                    return _read_last_incident_snapshot()
                raise

        return cached_call("incidents:list", _incident_cache_ttl_seconds(), build)
    _remember_incident_snapshot(incidents_db)
    return _clone_incidents(incidents_db)


def get_incident_by_id(incident_id: str) -> Incident:
    if _firestore_enabled():
        def build() -> Incident:
            doc = get_firestore_client().collection("incidents").document(incident_id).get()
            if doc.exists:
                return _incident_from_dict(doc.to_dict() or {}, doc.id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident '{incident_id}' not found.",
            )

        return cached_call(f"incidents:item:{incident_id}", 5.0, build)

    for incident in incidents_db:
        if incident.id == incident_id:
            return incident

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Incident '{incident_id}' not found.",
    )


async def update_incident_status(incident_id: str, status_value: str, updated_by: str = "system") -> Incident:
    if _firestore_enabled():
        doc_ref = get_firestore_client().collection("incidents").document(incident_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident '{incident_id}' not found.",
            )
        now = datetime.now(timezone.utc)
        doc_ref.set({"status": status_value.strip(), "updatedAt": now.isoformat(), "updatedBy": updated_by}, merge=True)
        incident = _incident_from_dict((doc_ref.get().to_dict() or {}), incident_id)
        _upsert_incident_snapshot(incident)
        clear_runtime_cache("incidents:")
        await incident_connection_manager.broadcast(
            {
                "type": "incident_updated",
                "data": serialize_incident(incident),
            }
        )
        return incident

    incident = get_incident_by_id(incident_id)
    incident.status = status_value.strip()
    incident.updated_at = datetime.now(timezone.utc)
    _upsert_incident_snapshot(incident)
    clear_runtime_cache("incidents:")
    await incident_connection_manager.broadcast(
        {
            "type": "incident_updated",
            "data": serialize_incident(incident),
        }
    )
    return incident

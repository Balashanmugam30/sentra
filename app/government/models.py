from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4


DEMO_TENANTS: tuple[str, ...] = ("TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP", "TEN-GOVSECURE")

BASE_GOVERNMENT_METRICS: dict[str, Any] = {
    "national_readiness": 89,
    "state_readiness": 87,
    "emergency_response_capability": 88,
    "cyber_defense": 92,
    "medical_surge_capacity": 81,
    "infrastructure_risk": 24,
    "supply_reserve_days": 41,
    "communications_continuity": 90,
    "border_integrity": 86,
    "grid_stability": 86,
    "airports_protected": 14,
    "ports_protected": 7,
    "states_connected": 28,
    "active_agencies": 9,
    "threat_level": "Moderate",
    "recovery_confidence": 91,
    "continuity_readiness": 88,
}

AGENCIES: tuple[dict[str, Any], ...] = (
    {"agency": "Police", "active_units": 184, "response_speed": 88, "readiness": 91, "communication_health": 93},
    {"agency": "Fire", "active_units": 72, "response_speed": 86, "readiness": 89, "communication_health": 90},
    {"agency": "Military", "active_units": 44, "response_speed": 82, "readiness": 94, "communication_health": 88},
    {"agency": "Health", "active_units": 96, "response_speed": 79, "readiness": 84, "communication_health": 87},
    {"agency": "Transport", "active_units": 63, "response_speed": 81, "readiness": 86, "communication_health": 85},
    {"agency": "Energy", "active_units": 51, "response_speed": 80, "readiness": 88, "communication_health": 86},
    {"agency": "Telecom", "active_units": 39, "response_speed": 87, "readiness": 90, "communication_health": 92},
    {"agency": "Education", "active_units": 34, "response_speed": 76, "readiness": 82, "communication_health": 84},
    {"agency": "Local Administration", "active_units": 118, "response_speed": 83, "readiness": 87, "communication_health": 89},
)

INFRASTRUCTURE_ASSETS: tuple[dict[str, Any], ...] = (
    {"asset_id": "AIR-001", "name": "Capital International Airport", "category": "Airport", "uptime": 99.2, "risk": 18, "redundancy": 91, "staffing": 88, "incidents": 1},
    {"asset_id": "SEA-007", "name": "South Maritime Port", "category": "Port", "uptime": 98.6, "risk": 24, "redundancy": 87, "staffing": 84, "incidents": 2},
    {"asset_id": "RAIL-014", "name": "National Rail Operations Spine", "category": "Railway", "uptime": 97.8, "risk": 29, "redundancy": 82, "staffing": 86, "incidents": 3},
    {"asset_id": "GRID-021", "name": "Western Grid Control Station", "category": "Grid Station", "uptime": 99.0, "risk": 21, "redundancy": 90, "staffing": 83, "incidents": 1},
    {"asset_id": "TEL-031", "name": "Metro Telecom Switching Core", "category": "Telecom Tower", "uptime": 99.4, "risk": 16, "redundancy": 93, "staffing": 91, "incidents": 0},
    {"asset_id": "HOSP-042", "name": "Regional Medical Surge Network", "category": "Hospital", "uptime": 98.1, "risk": 31, "redundancy": 80, "staffing": 79, "incidents": 4},
    {"asset_id": "UNI-053", "name": "University Mega Campus Grid", "category": "University", "uptime": 98.8, "risk": 22, "redundancy": 85, "staffing": 88, "incidents": 1},
    {"asset_id": "DAM-064", "name": "North Reservoir Dam", "category": "Dam", "uptime": 99.1, "risk": 19, "redundancy": 89, "staffing": 86, "incidents": 0},
    {"asset_id": "WATER-075", "name": "Metro Water Treatment System", "category": "Water System", "uptime": 98.9, "risk": 20, "redundancy": 88, "staffing": 85, "incidents": 1},
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def future_iso(hours: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


def government_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8].upper()}"

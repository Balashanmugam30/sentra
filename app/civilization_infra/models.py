from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

DEMO_TENANTS = ["TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP", "TEN-GOV-SOUTH"]

CIVILIZATION_METRICS = {
    "countries_connected": 31,
    "cities_active": 148,
    "population_supported": 412_000_000,
    "hospitals_connected": 2_480,
    "universities": 910,
    "power_grid_uptime": 99.2,
    "water_security_score": 91,
    "transport_nodes": 1_840,
    "food_reserve_days": 37,
    "disaster_forecast_accuracy": 94,
    "recovery_coordination_score": 96,
    "civilization_score": 98,
    "label": "ESSENTIAL GLOBAL BACKBONE",
}

COUNTRY_GRID = [
    {"country": "India", "ministries_active": 12, "emergency_mesh_health": 94, "readiness": 93, "population_supported": 148_000_000},
    {"country": "USA", "ministries_active": 9, "emergency_mesh_health": 91, "readiness": 90, "population_supported": 82_000_000},
    {"country": "UAE", "ministries_active": 7, "emergency_mesh_health": 95, "readiness": 92, "population_supported": 18_000_000},
    {"country": "Singapore", "ministries_active": 6, "emergency_mesh_health": 96, "readiness": 94, "population_supported": 7_000_000},
    {"country": "Germany", "ministries_active": 8, "emergency_mesh_health": 88, "readiness": 86, "population_supported": 36_000_000},
]

MEGA_CITIES = [
    {"city": "Mumbai", "traffic_intelligence": 92, "crowd_flow": 88, "emergency_corridors": 41, "public_safety": 90},
    {"city": "Dubai", "traffic_intelligence": 95, "crowd_flow": 91, "emergency_corridors": 28, "public_safety": 94},
    {"city": "Singapore", "traffic_intelligence": 96, "crowd_flow": 93, "emergency_corridors": 22, "public_safety": 95},
    {"city": "New York", "traffic_intelligence": 89, "crowd_flow": 84, "emergency_corridors": 37, "public_safety": 87},
    {"city": "Berlin", "traffic_intelligence": 86, "crowd_flow": 82, "emergency_corridors": 19, "public_safety": 85},
]


def civilization_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10].upper()}"


def utc_now_iso() -> str:
    return datetime.now(UTC).isoformat()


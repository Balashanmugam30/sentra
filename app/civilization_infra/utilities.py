from __future__ import annotations

from app.civilization_infra.models import CIVILIZATION_METRICS


def utility_resilience() -> dict[str, object]:
    return {
        "power_uptime": CIVILIZATION_METRICS["power_grid_uptime"],
        "water_pressure": 92,
        "telecom_health": 94,
        "fuel_reserves_days": 29,
        "backup_generators": 8_420,
        "utility_assets": [
            {"name": "North Grid Cluster", "type": "power", "uptime": 99.4, "risk": 18, "redundancy": 93},
            {"name": "Delta Water Spine", "type": "water", "uptime": 98.8, "risk": 21, "redundancy": 89},
            {"name": "Metro Telecom Ring", "type": "telecom", "uptime": 99.1, "risk": 16, "redundancy": 94},
            {"name": "Civic Fuel Reserve", "type": "fuel", "uptime": 97.7, "risk": 27, "redundancy": 82},
        ],
    }


def water_command() -> dict[str, object]:
    return {
        "water_security_score": CIVILIZATION_METRICS["water_security_score"],
        "reservoirs": 312,
        "purification_plants": 148,
        "leak_detection": 89,
        "drought_pressure": 31,
        "water_systems": [
            {"name": "Western Reservoir", "capacity": 82, "quality": 94, "risk": 18},
            {"name": "Central Purification Spine", "capacity": 76, "quality": 96, "risk": 14},
            {"name": "South Leak Net", "capacity": 68, "quality": 91, "risk": 27},
        ],
    }


def food_security() -> dict[str, object]:
    return {
        "warehouses": 1_260,
        "logistics_routes": 4_800,
        "cold_chain_health": 88,
        "shortage_risk": 24,
        "reserve_days": CIVILIZATION_METRICS["food_reserve_days"],
        "food_nodes": [
            {"name": "North Grain Reserve", "reserve_days": 42, "route_health": 91, "risk": 18},
            {"name": "Metro Cold Chain", "reserve_days": 31, "route_health": 86, "risk": 26},
            {"name": "Coastal Protein Hub", "reserve_days": 38, "route_health": 89, "risk": 21},
        ],
    }


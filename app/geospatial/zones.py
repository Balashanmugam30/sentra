from __future__ import annotations

from typing import Any


HQ_CENTER = {"lat": 11.0168, "lng": 76.9558}

ZONE_CENTERS: dict[str, dict[str, float]] = {
    "Zone 1": {"lat": 11.0186, "lng": 76.9534},
    "Zone 2": {"lat": 11.0181, "lng": 76.9576},
    "Zone 3": {"lat": 11.0168, "lng": 76.9558},
    "Zone 4": {"lat": 11.0154, "lng": 76.9582},
    "Zone 5": {"lat": 11.0149, "lng": 76.9538},
    "Campus": {"lat": 11.0168, "lng": 76.9558},
    "Tower A": {"lat": 11.0174, "lng": 76.9569},
    "Building": {"lat": 11.0168, "lng": 76.9558},
}

ZONE_POLYGONS: dict[str, list[list[float]]] = {
    "Zone 1": [[11.0194, 76.9525], [11.0191, 76.9542], [11.0179, 76.9540], [11.0181, 76.9522]],
    "Zone 2": [[11.0188, 76.9567], [11.0185, 76.9584], [11.0174, 76.9582], [11.0175, 76.9564]],
    "Zone 3": [[11.0175, 76.9549], [11.0173, 76.9566], [11.0161, 76.9566], [11.0162, 76.9549]],
    "Zone 4": [[11.0161, 76.9573], [11.0159, 76.9590], [11.0148, 76.9589], [11.0149, 76.9571]],
    "Zone 5": [[11.0156, 76.9528], [11.0153, 76.9546], [11.0142, 76.9545], [11.0144, 76.9526]],
}

SAFE_ZONES: list[dict[str, Any]] = [
    {
        "safe_zone_id": "SAFE-ALPHA",
        "zone": "Zone 1",
        "name": "North Assembly Lawn",
        "coordinate": {"lat": 11.0195, "lng": 76.9548},
        "capacity": 180,
        "status": "ready",
    },
    {
        "safe_zone_id": "SAFE-BRAVO",
        "zone": "Zone 3",
        "name": "Central Quad",
        "coordinate": {"lat": 11.0162, "lng": 76.9572},
        "capacity": 220,
        "status": "ready",
    },
    {
        "safe_zone_id": "SAFE-CHARLIE",
        "zone": "Zone 5",
        "name": "West Muster Court",
        "coordinate": {"lat": 11.0141, "lng": 76.9529},
        "capacity": 150,
        "status": "ready",
    },
]

FACILITY_TYPE_OFFSETS: dict[str, tuple[float, float]] = {
    "access_control": (0.00026, -0.00022),
    "hvac_bms": (-0.00014, 0.00018),
    "pa_system": (0.00008, 0.00006),
    "cctv_metadata": (0.00031, 0.0002),
    "elevator_controller": (-0.0001, 0.00033),
    "fire_panel": (0.00003, -0.00003),
    "lighting_controller": (0.00012, -0.00015),
    "campus_dispatch": (-0.00025, 0.00012),
}

CORRIDOR_GRAPH: dict[str, list[dict[str, Any]]] = {
    "Zone 1": [
        {"to": "Zone 2", "segment_id": "SEG-Z1-Z2", "minutes": 4, "risk_bias": 1},
        {"to": "Zone 3", "segment_id": "SEG-Z1-Z3", "minutes": 5, "risk_bias": 0},
    ],
    "Zone 2": [
        {"to": "Zone 1", "segment_id": "SEG-Z1-Z2", "minutes": 4, "risk_bias": 1},
        {"to": "Zone 3", "segment_id": "SEG-Z2-Z3", "minutes": 3, "risk_bias": 1},
        {"to": "Zone 4", "segment_id": "SEG-Z2-Z4", "minutes": 5, "risk_bias": 2},
    ],
    "Zone 3": [
        {"to": "Zone 1", "segment_id": "SEG-Z1-Z3", "minutes": 5, "risk_bias": 0},
        {"to": "Zone 2", "segment_id": "SEG-Z2-Z3", "minutes": 3, "risk_bias": 1},
        {"to": "Zone 4", "segment_id": "SEG-Z3-Z4", "minutes": 4, "risk_bias": 1},
        {"to": "Zone 5", "segment_id": "SEG-Z3-Z5", "minutes": 5, "risk_bias": 0},
    ],
    "Zone 4": [
        {"to": "Zone 2", "segment_id": "SEG-Z2-Z4", "minutes": 5, "risk_bias": 2},
        {"to": "Zone 3", "segment_id": "SEG-Z3-Z4", "minutes": 4, "risk_bias": 1},
        {"to": "Zone 5", "segment_id": "SEG-Z4-Z5", "minutes": 3, "risk_bias": 1},
    ],
    "Zone 5": [
        {"to": "Zone 3", "segment_id": "SEG-Z3-Z5", "minutes": 5, "risk_bias": 0},
        {"to": "Zone 4", "segment_id": "SEG-Z4-Z5", "minutes": 3, "risk_bias": 1},
    ],
}


def normalize_zone(zone: str | None) -> str:
    if not zone:
        return "Campus"
    return zone if zone in ZONE_CENTERS else "Campus"


def zone_coordinate(zone: str | None) -> dict[str, float]:
    return dict(ZONE_CENTERS[normalize_zone(zone)])


def zone_polygon(zone: str | None) -> list[list[float]]:
    return [list(item) for item in ZONE_POLYGONS.get(normalize_zone(zone), [])]


def facility_coordinate(zone: str | None, asset_type: str, asset_id: str) -> dict[str, float]:
    center = zone_coordinate(zone)
    offset = FACILITY_TYPE_OFFSETS.get(asset_type, (0.0, 0.0))
    jitter = ((sum(ord(character) for character in asset_id) % 7) - 3) * 0.00003
    return {
        "lat": round(center["lat"] + offset[0] + jitter, 6),
        "lng": round(center["lng"] + offset[1] - jitter, 6),
    }


def responder_coordinate(zone: str | None, responder_id: str) -> dict[str, float]:
    center = zone_coordinate(zone)
    seed = sum(ord(character) for character in responder_id)
    lat_offset = ((seed % 9) - 4) * 0.00006
    lng_offset = (((seed // 3) % 9) - 4) * 0.00006
    return {
        "lat": round(center["lat"] + lat_offset, 6),
        "lng": round(center["lng"] + lng_offset, 6),
    }


def sensor_coordinate(zone: str | None, device_id: str) -> dict[str, float]:
    center = zone_coordinate(zone)
    seed = sum(ord(character) for character in device_id)
    lat_offset = ((seed % 11) - 5) * 0.00005
    lng_offset = (((seed // 2) % 11) - 5) * 0.00005
    return {
        "lat": round(center["lat"] + lat_offset, 6),
        "lng": round(center["lng"] + lng_offset, 6),
    }


def zone_list() -> list[str]:
    return ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"]

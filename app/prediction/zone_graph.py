from __future__ import annotations

ZONE_GRAPH: dict[str, list[str]] = {
    "Zone 1": ["Zone 2", "Zone 3"],
    "Zone 2": ["Zone 1", "Zone 4"],
    "Zone 3": ["Zone 1", "Zone 5"],
    "Zone 4": ["Zone 2", "Zone 5"],
    "Zone 5": ["Zone 3", "Zone 4"],
}


def getAdjacentZones(zone: str) -> list[str]:
    return ZONE_GRAPH.get(zone, [])

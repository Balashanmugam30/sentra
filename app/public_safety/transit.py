from __future__ import annotations

from typing import Any


def build_transit_snapshot(scenario: str | None) -> list[dict[str, Any]]:
    lines = [
        {
            "line_id": "BUS-RING-A",
            "mode": "bus",
            "name": "Campus Ring Bus",
            "status": "running",
            "delay_minutes": 4,
            "crowding_level": 38,
            "affected_zones": ["Zone 1", "Zone 2", "Zone 3"],
        },
        {
            "line_id": "METRO-NORTH",
            "mode": "metro",
            "name": "Metro North Spur",
            "status": "running",
            "delay_minutes": 2,
            "crowding_level": 44,
            "affected_zones": ["Zone 3", "Zone 4", "Zone 5"],
        },
        {
            "line_id": "SHUTTLE-HQ",
            "mode": "shuttle",
            "name": "HQ Safety Shuttle",
            "status": "running",
            "delay_minutes": 1,
            "crowding_level": 28,
            "affected_zones": ["Zone 1", "Zone 5"],
        },
    ]

    for line in lines:
        if scenario == "metro_shutdown" and line["mode"] == "metro":
            line["status"] = "paused"
            line["delay_minutes"] = 18
            line["crowding_level"] = 88
        elif scenario == "crowd_surge_gate" and "Zone 1" in line["affected_zones"]:
            line["status"] = "delayed"
            line["delay_minutes"] += 7
            line["crowding_level"] = min(100, line["crowding_level"] + 30)
        elif scenario == "normal_day":
            line["delay_minutes"] = max(0, line["delay_minutes"] - 2)
            line["crowding_level"] = max(12, line["crowding_level"] - 14)

    return lines

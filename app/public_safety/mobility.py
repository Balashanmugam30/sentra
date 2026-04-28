from __future__ import annotations

from typing import Any


def build_mobility_snapshot(
    traffic: list[dict[str, Any]],
    transit: list[dict[str, Any]],
    scenario: str | None,
) -> dict[str, Any]:
    avg_congestion = round(sum(item["congestion_score"] for item in traffic) / max(len(traffic), 1))
    paused_transit = len([item for item in transit if item["status"] == "paused"])
    delayed_transit = len([item for item in transit if item["status"] == "delayed"])
    top_segment = max(traffic, key=lambda item: item["congestion_score"])

    mobility = {
        "zone_inflow": 118,
        "zone_outflow": 96,
        "pedestrian_pressure": min(100, avg_congestion + paused_transit * 12 + delayed_transit * 6),
        "queue_density": min(100, avg_congestion - 8 + paused_transit * 18),
        "evac_flow_score": max(12, 100 - avg_congestion - paused_transit * 16),
        "top_pressure_zone": top_segment["from_zone"],
    }

    if scenario == "crowd_surge_gate":
        mobility.update(
            {
                "zone_inflow": 184,
                "zone_outflow": 78,
                "pedestrian_pressure": 94,
                "queue_density": 91,
                "evac_flow_score": 34,
                "top_pressure_zone": "Zone 1",
            }
        )
    elif scenario == "normal_day":
        mobility.update(
            {
                "zone_inflow": 86,
                "zone_outflow": 81,
                "pedestrian_pressure": 28,
                "queue_density": 22,
                "evac_flow_score": 82,
            }
        )

    return mobility

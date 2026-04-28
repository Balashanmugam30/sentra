from __future__ import annotations

from typing import Any

from app.geospatial.zones import sensor_coordinate, zone_coordinate


def build_heat_cells(
    *,
    incidents: list[dict[str, Any]],
    hotspots: list[dict[str, Any]],
    sensors: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    cells: list[dict[str, Any]] = []

    for incident in incidents:
        coordinate = incident["coordinate"]
        cells.append(
            {
                "cell_id": f"HEAT-INC-{incident['incident_id']}",
                "center": coordinate,
                "intensity": min(100, 45 + (int(incident["severity"]) * 10)),
                "radius_m": 90 + (int(incident["severity"]) * 25),
                "source": "incident",
            }
        )

    for hotspot in hotspots:
        coordinate = hotspot["coordinate"]
        cells.append(
            {
                "cell_id": f"HEAT-HOT-{hotspot['zone']}",
                "center": coordinate,
                "intensity": int(hotspot["risk_score"]),
                "radius_m": int(hotspot["radius_m"]),
                "source": "hotspot",
            }
        )

    for sensor in sensors:
        if sensor["alert_level"] == "normal":
            continue
        coordinate = sensor["coordinate"]
        cells.append(
            {
                "cell_id": f"HEAT-SNS-{sensor['device_id']}",
                "center": coordinate,
                "intensity": 56 if sensor["alert_level"] == "watch" else 78,
                "radius_m": 65,
                "source": "sensor",
            }
        )

    return cells[:18]

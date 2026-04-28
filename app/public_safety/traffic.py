from __future__ import annotations

from typing import Any

from app.geospatial.zones import zone_coordinate
from app.models.incident import Incident

_SEGMENTS = [
    ("TRF-Z1-Z2", "Zone 1", "Zone 2", 34.0, 42),
    ("TRF-Z1-Z3", "Zone 1", "Zone 3", 31.0, 48),
    ("TRF-Z2-Z3", "Zone 2", "Zone 3", 29.0, 52),
    ("TRF-Z2-Z4", "Zone 2", "Zone 4", 27.0, 56),
    ("TRF-Z3-Z5", "Zone 3", "Zone 5", 26.0, 58),
]


def _polyline(from_zone: str, to_zone: str) -> list[list[float]]:
    start = zone_coordinate(from_zone)
    end = zone_coordinate(to_zone)
    return [[start["lat"], start["lng"]], [end["lat"], end["lng"]]]


def build_traffic_snapshot(incidents: list[Incident], scenario: str | None) -> list[dict[str, Any]]:
    active_incident_zones = {incident.location for incident in incidents if incident.status == "active"}
    segments: list[dict[str, Any]] = []

    for segment_id, from_zone, to_zone, speed, congestion in _SEGMENTS:
        blocked = False
        incident_related = from_zone in active_incident_zones or to_zone in active_incident_zones
        adjusted_congestion = congestion + (18 if incident_related else 0)
        adjusted_speed = speed - (7 if incident_related else 0)
        eta_penalty = max(1, round(adjusted_congestion / 18))

        if scenario == "traffic_jam_gate" and from_zone == "Zone 1":
            adjusted_congestion += 24
            adjusted_speed -= 10
            eta_penalty += 4
        elif scenario == "ambulance_priority" and segment_id in {"TRF-Z1-Z2", "TRF-Z2-Z4"}:
            adjusted_congestion = max(12, adjusted_congestion - 24)
            adjusted_speed += 12
            eta_penalty = max(0, eta_penalty - 3)
        elif scenario == "city_power_outage":
            adjusted_congestion += 12
            adjusted_speed -= 5
            eta_penalty += 2
        elif scenario == "crowd_surge_gate" and from_zone == "Zone 1":
            adjusted_congestion += 18
            adjusted_speed -= 8
            eta_penalty += 3
        elif scenario == "multi_corridor_block" and segment_id in {"TRF-Z2-Z4", "TRF-Z3-Z5"}:
            blocked = True
            adjusted_congestion = 100
            adjusted_speed = 0
            eta_penalty += 7
        elif scenario == "normal_day":
            adjusted_congestion = max(18, adjusted_congestion - 20)
            adjusted_speed += 6
            eta_penalty = max(0, eta_penalty - 2)

        segments.append(
            {
                "segment_id": segment_id,
                "from_zone": from_zone,
                "to_zone": to_zone,
                "speed_kph": max(0.0, round(adjusted_speed, 1)),
                "congestion_score": max(0, min(100, adjusted_congestion)),
                "blocked": blocked,
                "incident_related": incident_related,
                "eta_penalty_minutes": max(0, eta_penalty),
                "polyline": _polyline(from_zone, to_zone),
            }
        )

    return segments


def build_eta_penalty_map(segments: list[dict[str, Any]]) -> dict[str, int]:
    penalties: dict[str, int] = {}
    for segment in segments:
        penalties[segment["from_zone"]] = max(
            penalties.get(segment["from_zone"], 0),
            int(segment["eta_penalty_minutes"]),
        )
        penalties[segment["to_zone"]] = max(
            penalties.get(segment["to_zone"], 0),
            int(segment["eta_penalty_minutes"]),
        )
    return penalties

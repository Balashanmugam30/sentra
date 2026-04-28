from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.analytics.trends import generate_hotspot_snapshot
from app.environment.engine import build_environment_overlay
from app.facility.controls import build_facility_assets_snapshot
from app.field.responders import build_responders_snapshot
from app.geospatial.heatmap import build_heat_cells
from app.geospatial.layers import build_geo_layers
from app.geospatial.routing import compute_route_plan
from app.geospatial.zones import SAFE_ZONES, facility_coordinate, normalize_zone, responder_coordinate, sensor_coordinate, zone_coordinate, zone_list, zone_polygon
from app.hardware.devices import build_devices_snapshot
from app.models.incident import Incident
from app.osint.engine import build_osint_overlay
from app.public_safety.engine import get_public_safety_overlay
from app.services.incident_service import get_all_incidents


def _now() -> datetime:
    return datetime.now(timezone.utc)


_scenario_state: dict[str, Any] = {
    "name": None,
    "blocked_segments": ["SEG-Z2-Z4", "SEG-Z3-Z5"],
    "synthetic_incidents": [],
    "sensor_overrides": {},
    "zone_risk_overrides": {},
}


def _base_demo_incidents() -> list[dict[str, Any]]:
    return [
        {"incident_id": "GEO-DEMO-101", "zone": "Zone 2", "type": "fire", "severity": 5, "status": "active", "risk_level": "critical", "recommended_action": "Suppress active flame front", "source": "demo"},
        {"incident_id": "GEO-DEMO-102", "zone": "Zone 4", "type": "hazardous_gas", "severity": 4, "status": "active", "risk_level": "high", "recommended_action": "Shut down HVAC and isolate gas zone", "source": "demo"},
        {"incident_id": "GEO-DEMO-103", "zone": "Zone 1", "type": "crowd_panic", "severity": 3, "status": "active", "risk_level": "watch", "recommended_action": "Stabilize entry gate crowd flow", "source": "demo"},
    ]


def _scenario_payload(scenario: str) -> dict[str, Any]:
    if scenario == "fire_zone2":
        return {
            "blocked_segments": ["SEG-Z2-Z4", "SEG-Z2-Z3"],
            "synthetic_incidents": [{"incident_id": "GEO-SCN-201", "zone": "Zone 2", "type": "fire", "severity": 5, "status": "active", "risk_level": "critical", "recommended_action": "Advance fire suppression and protect evac corridor", "source": "scenario"}],
            "sensor_overrides": {"ESP32-ZONE2-01": "fire_risk"},
            "zone_risk_overrides": {"Zone 2": 92, "Zone 3": 71},
        }
    if scenario == "gas_zone4":
        return {
            "blocked_segments": ["SEG-Z4-Z5"],
            "synthetic_incidents": [{"incident_id": "GEO-SCN-202", "zone": "Zone 4", "type": "hazardous_gas", "severity": 5, "status": "active", "risk_level": "critical", "recommended_action": "Isolate gas leak and stage med support", "source": "scenario"}],
            "sensor_overrides": {"RPI-ZONE4-01": "gas_leak"},
            "zone_risk_overrides": {"Zone 4": 90},
        }
    if scenario == "mass_panic_gate":
        return {
            "blocked_segments": ["SEG-Z1-Z3"],
            "synthetic_incidents": [{"incident_id": "GEO-SCN-203", "zone": "Zone 1", "type": "crowd_panic", "severity": 4, "status": "active", "risk_level": "high", "recommended_action": "Hold perimeter and open guided exit lane", "source": "scenario"}],
            "sensor_overrides": {"GATEWAY-ZONE1-01": "panic_button"},
            "zone_risk_overrides": {"Zone 1": 84},
        }
    if scenario == "blocked_exit":
        return {
            "blocked_segments": ["SEG-Z3-Z5", "SEG-Z4-Z5"],
            "synthetic_incidents": [{"incident_id": "GEO-SCN-204", "zone": "Zone 5", "type": "blocked_exit", "severity": 4, "status": "active", "risk_level": "high", "recommended_action": "Clear alternate egress and redirect evac flow", "source": "scenario"}],
            "sensor_overrides": {"CAM-Z5-ENTRY": "blocked_exit"},
            "zone_risk_overrides": {"Zone 5": 82},
        }
    if scenario == "multi_zone_pressure":
        return {
            "blocked_segments": ["SEG-Z2-Z4", "SEG-Z3-Z5", "SEG-Z1-Z3"],
            "synthetic_incidents": [
                {"incident_id": "GEO-SCN-205", "zone": "Zone 2", "type": "fire", "severity": 5, "status": "active", "risk_level": "critical", "recommended_action": "Split suppression and route evac north", "source": "scenario"},
                {"incident_id": "GEO-SCN-206", "zone": "Zone 4", "type": "hazardous_gas", "severity": 4, "status": "active", "risk_level": "high", "recommended_action": "Preserve med corridor and isolate sector", "source": "scenario"},
            ],
            "sensor_overrides": {"ESP32-ZONE2-01": "fire_risk", "RPI-ZONE4-01": "gas_leak"},
            "zone_risk_overrides": {"Zone 2": 94, "Zone 4": 88, "Zone 3": 73},
        }
    return {
        "blocked_segments": ["SEG-Z2-Z4", "SEG-Z3-Z5"],
        "synthetic_incidents": [],
        "sensor_overrides": {},
        "zone_risk_overrides": {},
    }


def _risk_level_from_incident(incident: Incident) -> str:
    if incident.risk_level:
        return str(incident.risk_level)
    if incident.severity >= 5:
        return "critical"
    if incident.severity >= 4:
        return "high"
    if incident.severity >= 3:
        return "watch"
    return "normal"


def apply_geo_test_scenario(scenario: str) -> dict[str, Any]:
    payload = _scenario_payload(scenario)
    _scenario_state.update({"name": scenario, **payload})
    return build_geo_live_snapshot(summary_only=False)


def _runtime_incidents() -> list[dict[str, Any]]:
    incidents = [incident for incident in get_all_incidents() if incident.status == "active"]
    if not incidents:
        return list(_base_demo_incidents()) + list(_scenario_state["synthetic_incidents"])

    mapped: list[dict[str, Any]] = []
    for incident in incidents:
        mapped.append(
            {
                "incident_id": incident.id,
                "zone": normalize_zone(incident.location),
                "type": incident.type,
                "severity": incident.severity,
                "status": incident.status,
                "risk_level": _risk_level_from_incident(incident),
                "recommended_action": incident.recommended_action,
                "source": "runtime",
            }
        )
    mapped.extend(_scenario_state["synthetic_incidents"])
    return mapped


def _incident_items() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for incident in _runtime_incidents():
        coordinate = zone_coordinate(incident["zone"])
        items.append(
            {
                **incident,
                "coordinate": coordinate,
                "radius_m": 70 + (int(incident["severity"]) * 25),
            }
        )
    return items


def _hotspot_items(incidents: list[Incident]) -> list[dict[str, Any]]:
    snapshot = generate_hotspot_snapshot(incidents)
    items: list[dict[str, Any]] = []
    for zone in snapshot["zones"]:
        risk_score = max(int(zone["risk_score"]), int(_scenario_state["zone_risk_overrides"].get(zone["zone"], 0)))
        items.append(
            {
                "zone": zone["zone"],
                "risk_score": risk_score,
                "incident_count": zone["incident_count"],
                "movement": zone["movement"],
                "coordinate": zone_coordinate(zone["zone"]),
                "radius_m": 120 + ((risk_score // 10) * 10),
            }
        )

    if not items:
        for zone in zone_list():
            items.append(
                {
                    "zone": zone,
                    "risk_score": int(_scenario_state["zone_risk_overrides"].get(zone, 45)),
                    "incident_count": 0,
                    "movement": "stable",
                    "coordinate": zone_coordinate(zone),
                    "radius_m": 140,
                }
            )
    return items[:5]


def _risk_map(incidents: list[Incident]) -> dict[str, int]:
    hotspot_map = {item["zone"]: int(item["risk_score"]) for item in _hotspot_items(incidents)}
    for zone, score in _scenario_state["zone_risk_overrides"].items():
        hotspot_map[str(zone)] = int(score)
    return hotspot_map


def _responder_items(summary_only: bool) -> list[dict[str, Any]]:
    if summary_only:
        return []
    items: list[dict[str, Any]] = []
    for responder in build_responders_snapshot():
        items.append(
            {
                **responder,
                "coordinate": responder_coordinate(str(responder["current_zone"]), str(responder["responder_id"])),
            }
        )
    return items


def _sensor_items(summary_only: bool) -> list[dict[str, Any]]:
    if summary_only:
        return []
    items: list[dict[str, Any]] = []
    for device in build_devices_snapshot():
        override = _scenario_state["sensor_overrides"].get(device["device_id"])
        alert_level = "critical" if override in {"fire_risk", "gas_leak"} else "watch" if override or device.get("health_score", 100) < 70 else "normal"
        items.append(
            {
                "device_id": device["device_id"],
                "zone": device["zone"],
                "sensor_types": device["sensors"],
                "alert_level": alert_level,
                "latest_alert": override,
                "battery": device["battery"],
                "rssi": device["rssi"],
                "coordinate": sensor_coordinate(str(device["zone"]), str(device["device_id"])),
                "status": "online" if device["online"] else "offline",
            }
        )
    return items


def _facility_items(summary_only: bool) -> list[dict[str, Any]]:
    if summary_only:
        return []
    flattened: list[dict[str, Any]] = []
    for group in build_facility_assets_snapshot():
        for asset in group["assets"]:
            flattened.append(
                {
                    **asset,
                    "coordinate": facility_coordinate(str(asset["zone"]), str(asset["asset_type"]), str(asset["asset_id"])),
                }
            )
    return flattened


def _blocked_routes() -> list[dict[str, Any]]:
    blocked = []
    all_segments = {
        "SEG-Z1-Z2": ("Zone 1", "Zone 2"),
        "SEG-Z1-Z3": ("Zone 1", "Zone 3"),
        "SEG-Z2-Z3": ("Zone 2", "Zone 3"),
        "SEG-Z2-Z4": ("Zone 2", "Zone 4"),
        "SEG-Z3-Z4": ("Zone 3", "Zone 4"),
        "SEG-Z3-Z5": ("Zone 3", "Zone 5"),
        "SEG-Z4-Z5": ("Zone 4", "Zone 5"),
    }
    for segment_id in _scenario_state["blocked_segments"]:
        from_zone, to_zone = all_segments[segment_id]
        blocked.append(
            {
                "segment_id": segment_id,
                "from_zone": from_zone,
                "to_zone": to_zone,
                "reason": "scenario_block",
                "polyline": [
                    [zone_coordinate(from_zone)["lat"], zone_coordinate(from_zone)["lng"]],
                    [zone_coordinate(to_zone)["lat"], zone_coordinate(to_zone)["lng"]],
                ],
            }
        )
    return blocked


def _safe_zone_items() -> list[dict[str, Any]]:
    return [dict(item) for item in SAFE_ZONES]


def build_geo_live_snapshot(*, summary_only: bool) -> dict[str, Any]:
    incidents = get_all_incidents()
    incident_items = _incident_items()
    hotspot_items = _hotspot_items(incidents)
    responder_items = _responder_items(summary_only)
    sensor_items = _sensor_items(summary_only)
    facility_items = _facility_items(summary_only)
    blocked_routes = _blocked_routes()
    safe_zones = _safe_zone_items()
    heat_cells = build_heat_cells(incidents=incident_items, hotspots=hotspot_items, sensors=sensor_items)

    if summary_only:
        heat_cells = heat_cells[:6]
        blocked_routes = blocked_routes[:2]

    return {
        "generated_at": _now(),
        "summary_only": summary_only,
        "incidents": incident_items,
        "responders": responder_items,
        "sensors": sensor_items,
        "facilities": facility_items,
        "hotspots": hotspot_items,
        "blocked_routes": blocked_routes,
        "safe_zones": safe_zones,
        "heat_cells": heat_cells,
        "environment_overlay": build_environment_overlay(),
        "public_safety_overlay": get_public_safety_overlay(incidents),
        "osint_overlay": build_osint_overlay(),
    }


def build_geo_layers_snapshot(*, summary_only: bool) -> dict[str, Any]:
    live = build_geo_live_snapshot(summary_only=summary_only)
    counts = {
        "incidents": len(live["incidents"]),
        "responders": len(live["responders"]),
        "sensors": len(live["sensors"]),
        "routes": len(live["blocked_routes"]),
        "heatmap": len(live["heat_cells"]),
        "facilities": len(live["facilities"]),
        "safe_zones": len(live["safe_zones"]),
    }
    layers = build_geo_layers(summary_only=summary_only)
    for layer in layers:
        layer["count"] = counts.get(str(layer["layer_id"]), 0)
    return {"generated_at": _now(), "layers": layers}


def build_geo_route_snapshot(*, from_zone: str, to_zone: str, mode: str) -> dict[str, Any]:
    return compute_route_plan(
        from_zone=normalize_zone(from_zone),
        to_zone=normalize_zone(to_zone),
        mode=mode,
        blocked_segments=_blocked_routes(),
        risk_map=_risk_map(get_all_incidents()),
    )


def build_geo_focus_snapshot(*, zone: str, summary_only: bool) -> dict[str, Any]:
    normalized_zone = normalize_zone(zone)
    live = build_geo_live_snapshot(summary_only=summary_only)
    return {
        "generated_at": _now(),
        "zone": normalized_zone,
        "center": zone_coordinate(normalized_zone),
        "polygon": zone_polygon(normalized_zone),
        "incidents": [item for item in live["incidents"] if item["zone"] == normalized_zone],
        "responders": [item for item in live["responders"] if item["current_zone"] == normalized_zone],
        "sensors": [item for item in live["sensors"] if item["zone"] == normalized_zone],
        "facilities": [item for item in live["facilities"] if item["zone"] == normalized_zone],
        "hotspot": next((item for item in live["hotspots"] if item["zone"] == normalized_zone), None),
        "blocked_routes": [item for item in live["blocked_routes"] if item["from_zone"] == normalized_zone or item["to_zone"] == normalized_zone],
    }

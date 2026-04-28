from __future__ import annotations

from typing import Any

from app.geospatial.zones import zone_coordinate


def _polyline(path: list[str]) -> list[list[float]]:
    return [[zone_coordinate(zone)["lat"], zone_coordinate(zone)["lng"]] for zone in path]


def build_dispatch_snapshot(
    traffic: list[dict[str, Any]],
    scenario: str | None,
) -> list[dict[str, Any]]:
    blocked = {segment["segment_id"] for segment in traffic if segment["blocked"]}
    ambulance_path = ["Zone 1", "Zone 2", "Zone 4"]
    fire_path = ["Zone 2", "Zone 3", "Zone 5"]
    police_path = ["Zone 1", "Zone 3", "Zone 5"]

    dispatch = [
        {
            "route_id": "DSP-AMB-101",
            "vehicle_type": "ambulance",
            "from_zone": "Zone 1",
            "to_zone": "Zone 4",
            "status": "reserved" if scenario == "ambulance_priority" else "ready",
            "eta_minutes": 8 if scenario == "ambulance_priority" else 12,
            "green_signal_ready": scenario == "ambulance_priority",
            "recommended_use": "Primary ambulance corridor to medical staging.",
            "polyline": _polyline(ambulance_path),
        },
        {
            "route_id": "DSP-FIRE-201",
            "vehicle_type": "fire",
            "from_zone": "Zone 2",
            "to_zone": "Zone 5",
            "status": "constrained" if "TRF-Z3-Z5" in blocked else "ready",
            "eta_minutes": 16 if "TRF-Z3-Z5" in blocked else 11,
            "green_signal_ready": False,
            "recommended_use": "Fire access route into upper corridor sectors.",
            "polyline": _polyline(fire_path),
        },
        {
            "route_id": "DSP-POL-301",
            "vehicle_type": "police",
            "from_zone": "Zone 1",
            "to_zone": "Zone 5",
            "status": "ready",
            "eta_minutes": 13,
            "green_signal_ready": False,
            "recommended_use": "Police priority route for perimeter reinforcement.",
            "polyline": _polyline(police_path),
        },
    ]
    return dispatch


def build_priority_route(
    *,
    vehicle_type: str,
    from_zone: str,
    to_zone: str,
    traffic: list[dict[str, Any]],
) -> dict[str, Any]:
    closures = [
        f"{segment['from_zone']}->{segment['to_zone']}"
        for segment in traffic
        if segment["blocked"]
    ]
    preferred = [segment for segment in traffic if segment["from_zone"] == from_zone or segment["to_zone"] == to_zone]
    eta = max(5, 7 + sum(int(segment["eta_penalty_minutes"]) for segment in preferred[:2]))
    path = [from_zone]

    if from_zone == "Zone 1" and to_zone == "Zone 4":
        path.extend(["Zone 2", "Zone 4"])
    elif from_zone == "Zone 2" and to_zone == "Zone 5":
        path.extend(["Zone 3", "Zone 5"])
    else:
        if from_zone != "Zone 3" and to_zone != "Zone 3":
            path.append("Zone 3")
        path.append(to_zone)

    if path[-1] != to_zone:
        path.append(to_zone)

    recommended_actions = [
        f"Reserve {vehicle_type} priority signals along {' -> '.join(path)}",
        "Push commuter advisory if closures overlap public access corridors",
    ]
    if closures:
        recommended_actions.append("Reroute around blocked corridors and pre-stage alternate unit access")

    return {
        "vehicle_type": vehicle_type,
        "from_zone": from_zone,
        "to_zone": to_zone,
        "priority_route": path,
        "eta_minutes": eta,
        "closures": closures[:4],
        "recommended_actions": recommended_actions[:4],
        "green_signal_ready": vehicle_type == "ambulance",
    }

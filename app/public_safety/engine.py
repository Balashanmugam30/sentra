from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.models.incident import Incident
from app.public_safety.dispatch import build_dispatch_snapshot, build_priority_route
from app.public_safety.mobility import build_mobility_snapshot
from app.public_safety.providers import build_provider_snapshot
from app.public_safety.traffic import build_eta_penalty_map, build_traffic_snapshot
from app.public_safety.transit import build_transit_snapshot
from app.public_safety.utilities import build_utility_snapshot
from app.services.incident_service import get_all_incidents


def _now() -> datetime:
    return datetime.now(timezone.utc)


_public_safety_state: dict[str, Any] = {"scenario": None}


def _compute_live_state(incidents: list[Incident] | None = None) -> dict[str, Any]:
    runtime_incidents = incidents if incidents is not None else get_all_incidents()
    providers = build_provider_snapshot()
    scenario = _public_safety_state["scenario"]
    traffic = build_traffic_snapshot(runtime_incidents, scenario)
    transit = build_transit_snapshot(scenario)
    utilities = build_utility_snapshot(scenario)
    mobility = build_mobility_snapshot(traffic, transit, scenario)
    dispatch = build_dispatch_snapshot(traffic, scenario)

    utility_penalty = 18 if utilities["power_status"] == "outage" else 8 if utilities["power_status"] != "normal" else 0
    global_pressure = max(
        12,
        min(
            100,
            round(
                (sum(segment["congestion_score"] for segment in traffic) / max(len(traffic), 1)) * 0.34
                + mobility["pedestrian_pressure"] * 0.26
                + mobility["queue_density"] * 0.16
                + utility_penalty
                + len([line for line in transit if line["status"] != "running"]) * 8
            ),
        ),
    )

    alerts: list[str] = []
    if any(segment["blocked"] for segment in traffic):
        alerts.append("Road closures active on emergency corridors")
    if any(line["status"] == "paused" for line in transit):
        alerts.append("Transit shutdown raising commuter crowding")
    if utilities["power_status"] == "outage":
        alerts.append("City power outage affecting mobility signals and facility backup posture")
    if mobility["pedestrian_pressure"] >= 80:
        alerts.append("Crowd mobility pressure high near active ingress points")
    if not alerts:
        alerts.append("Public safety network stable with monitored commuter flow")

    return {
        "updated_at": _now(),
        **providers,
        "traffic": traffic,
        "transit": transit,
        "dispatch": dispatch,
        "utilities": utilities,
        "mobility": mobility,
        "global_pressure": global_pressure,
        "public_alerts": alerts[:4],
    }


def build_public_safety_live_snapshot(*, summary_only: bool, incidents: list[Incident] | None = None) -> dict[str, Any]:
    state = _compute_live_state(incidents)
    traffic = state["traffic"]
    transit = state["transit"]
    dispatch = state["dispatch"]

    if summary_only:
        traffic = traffic[:3]
        transit = transit[:2]
        dispatch = dispatch[:1]

    return {
        "summary_only": summary_only,
        **state,
        "traffic": traffic,
        "transit": transit,
        "dispatch": dispatch,
    }


def build_public_safety_traffic_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _compute_live_state()
    segments = state["traffic"][:3] if summary_only else state["traffic"]
    return {
        "summary_only": summary_only,
        "updated_at": state["updated_at"],
        "provider": state["traffic_provider"],
        "segments": segments,
    }


def build_public_safety_transit_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _compute_live_state()
    lines = state["transit"][:2] if summary_only else state["transit"]
    return {
        "summary_only": summary_only,
        "updated_at": state["updated_at"],
        "provider": state["transit_provider"],
        "lines": lines,
    }


def build_public_safety_utility_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _compute_live_state()
    return {
        "summary_only": summary_only,
        "updated_at": state["updated_at"],
        "provider": state["utility_provider"],
        "utilities": state["utilities"],
    }


def build_route_priority_snapshot(*, vehicle_type: str, from_zone: str, to_zone: str) -> dict[str, Any]:
    state = _compute_live_state()
    return build_priority_route(
        vehicle_type=vehicle_type,
        from_zone=from_zone,
        to_zone=to_zone,
        traffic=state["traffic"],
    )


def apply_public_safety_test_scenario(scenario: str) -> dict[str, Any]:
    _public_safety_state["scenario"] = scenario
    return build_public_safety_live_snapshot(summary_only=False)


def get_public_safety_overlay(incidents: list[Incident] | None = None) -> dict[str, Any]:
    state = _compute_live_state(incidents)
    return {
        "traffic_segments": state["traffic"],
        "dispatch_routes": state["dispatch"],
        "global_pressure": state["global_pressure"],
        "mobility": state["mobility"],
        "utilities": state["utilities"],
    }


def get_public_safety_eta_penalties(incidents: list[Incident] | None = None) -> dict[str, int]:
    state = _compute_live_state(incidents)
    return build_eta_penalty_map(state["traffic"])

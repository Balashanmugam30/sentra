from __future__ import annotations

from app.models.incident import Incident
from app.prediction.fire_spread import forecastFireSpread
from app.prediction.resources import generate_resource_deployments
from app.simulation.schemas import TimelineSnapshot, TimelineZoneState
from app.simulation.twin import generate_live_twin_state

TIMELINE_MINUTES = [0, 5, 10, 15]


def _risk_delta(minute: int, zone: str, baseline: dict[str, object], spread_sources: set[str], spread_targets: set[str]) -> int:
    if minute == 0:
        return 0

    delta = 0

    if zone in spread_targets:
        delta += minute

    if zone in spread_sources:
        delta += round(minute * 0.6)

    if baseline["status"] == "evacuating":
        delta += round(minute * 0.4)

    return delta


def _responder_relief(minute: int, zone: str, responder_targets: dict[str, int]) -> int:
    if minute < 10:
        return 0

    responders_assigned = responder_targets.get(zone, 0)
    if responders_assigned == 0:
        return 0

    return min(18, responders_assigned * (2 if minute == 10 else 4))


def _occupancy_shift(minute: int, zone: str, baseline: dict[str, object], trusted_safe_zones: set[str]) -> int:
    occupancy = baseline["occupancy"]

    if minute == 0:
        return occupancy

    if baseline["status"] == "evacuating":
        return max(8, occupancy - (minute * 2))

    if zone in trusted_safe_zones:
        return min(100, occupancy + round(minute * 0.8))

    if baseline["status"] == "restricted":
        return max(12, occupancy - minute)

    return occupancy


def _zone_status(risk_score: int, baseline_status: str) -> str:
    if risk_score >= 80:
        return "evacuating"

    if baseline_status == "restricted":
        return "restricted"

    return "stable"


def _global_mode(high_risk_count: int, congested_corridor_count: int, baseline_mode: str) -> str:
    if high_risk_count >= 4:
        return "critical"

    if baseline_mode == "lockdown":
        return "lockdown"

    if high_risk_count >= 2:
        return "evacuation"

    if congested_corridor_count > 0:
        return "caution"

    return "normal"


def _forecast_summary(snapshots: list[TimelineSnapshot]) -> list[str]:
    if not snapshots:
        return []

    minute_zero = snapshots[0]
    minute_five = snapshots[1]
    minute_ten = snapshots[2]
    minute_fifteen = snapshots[3]

    highest_risk_ten = max(minute_ten.zones, key=lambda zone: zone.risk_score)
    highest_corridor_snapshot = max(snapshots, key=lambda snapshot: snapshot.corridor_loads)
    responder_end_state = "normalizes" if minute_fifteen.active_responders <= minute_zero.active_responders else "stays elevated"

    return [
        f"{highest_risk_ten.zone} risk increases by minute 10",
        f"Corridor congestion peaks at minute {highest_corridor_snapshot.minute}",
        f"Responder pressure {responder_end_state} by minute 15",
    ]


def generate_timeline_forecast(incidents: list[Incident]) -> dict[str, object]:
    baseline = generate_live_twin_state(incidents)
    spread_forecasts = forecastFireSpread(incidents)
    resources = generate_resource_deployments(incidents)

    spread_sources = {forecast.source_zone for forecast in spread_forecasts}
    spread_targets = {forecast.target_zone for forecast in spread_forecasts}
    trusted_safe_zones = {
        zone.zone for zone in baseline["zones"] if zone.safe_score >= 60 and zone.status == "stable"
    }
    responder_targets: dict[str, int] = {}

    for responder in baseline["responders"]:
        responder_targets[responder.target_zone] = responder_targets.get(responder.target_zone, 0) + 1

    baseline_zones = {
        zone.zone: {
            "risk_score": zone.risk_score,
            "occupancy": zone.occupancy,
            "status": zone.status,
        }
        for zone in baseline["zones"]
    }

    base_busy_corridors = len([corridor for corridor in baseline["corridors"] if corridor.status == "busy"])
    snapshots: list[TimelineSnapshot] = []

    for minute in TIMELINE_MINUTES:
        zone_states: list[TimelineZoneState] = []

        for zone_name, zone_state in baseline_zones.items():
            risk_score = max(
                0,
                min(
                    100,
                    zone_state["risk_score"]
                    + _risk_delta(minute, zone_name, zone_state, spread_sources, spread_targets)
                    - _responder_relief(minute, zone_name, responder_targets),
                ),
            )

            occupancy = _occupancy_shift(minute, zone_name, zone_state, trusted_safe_zones)
            status = _zone_status(risk_score, zone_state["status"])

            zone_states.append(
                TimelineZoneState(
                    zone=zone_name,
                    risk_score=risk_score,
                    occupancy=occupancy,
                    status=status,
                )
            )

        high_risk_count = len([zone for zone in zone_states if zone.risk_score >= 80])
        corridor_loads = min(
            len(baseline["corridors"]),
            base_busy_corridors + (1 if minute == 5 and base_busy_corridors > 0 else 0),
        )
        if minute == 15 and resources["global_load"] != "overloaded":
            corridor_loads = max(0, corridor_loads - 1)

        active_responders = len(
            [
                responder
                for responder in baseline["responders"]
                if responder.eta_minutes <= max(1, minute if minute > 0 else 1)
                or responder.status in {"active", "staged"}
            ]
        )
        if minute == 0:
            active_responders = len(baseline["responders"])

        snapshots.append(
            TimelineSnapshot(
                minute=minute,
                global_mode=_global_mode(high_risk_count, corridor_loads, baseline["global_mode"]),
                zones=sorted(zone_states, key=lambda zone: zone.zone),
                corridor_loads=corridor_loads,
                active_responders=active_responders,
            )
        )

    return {
        "snapshots": snapshots,
        "forecast_summary": _forecast_summary(snapshots),
    }

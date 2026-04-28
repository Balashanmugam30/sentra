from __future__ import annotations


def _corridors_for_zone(zone: str, twin: dict[str, object]) -> list[object]:
    return [
        corridor
        for corridor in twin["corridors"]
        if getattr(corridor, "from_zone", "") == zone or getattr(corridor, "to_zone", "") == zone
    ]


def route_context_for_zone(
    zone: str,
    twin: dict[str, object],
    timeline: dict[str, object],
) -> dict[str, object]:
    corridors = _corridors_for_zone(zone, twin)
    peak_future_load = max(
        (getattr(snapshot, "corridor_loads", 0) for snapshot in timeline["snapshots"]),
        default=0,
    )

    if not corridors:
        return {
            "route_hint": "Direct command lane",
            "eta_adjustment": 1 if peak_future_load >= 2 else 0,
            "congestion_penalty": peak_future_load * 3,
        }

    best_corridor = min(corridors, key=lambda item: getattr(item, "traffic_load", 100))
    other_end = (
        getattr(best_corridor, "to_zone", zone)
        if getattr(best_corridor, "from_zone", "") == zone
        else getattr(best_corridor, "from_zone", zone)
    )
    status = getattr(best_corridor, "status", "clear")
    traffic_load = getattr(best_corridor, "traffic_load", 0)
    congestion_penalty = round(traffic_load * 0.12) + (peak_future_load * 4)

    if status == "busy":
        return {
            "route_hint": f"Protected reroute via {other_end}",
            "eta_adjustment": 3,
            "congestion_penalty": congestion_penalty + 10,
        }

    if status == "moderate":
        return {
            "route_hint": f"Managed corridor via {other_end}",
            "eta_adjustment": 2,
            "congestion_penalty": congestion_penalty + 4,
        }

    return {
        "route_hint": f"Primary corridor via {other_end}",
        "eta_adjustment": 1 if peak_future_load >= 3 else 0,
        "congestion_penalty": congestion_penalty,
    }

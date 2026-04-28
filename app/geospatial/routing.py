from __future__ import annotations

import heapq
from typing import Any

from app.geospatial.zones import CORRIDOR_GRAPH, zone_coordinate


def _edge_weight(mode: str, base_minutes: int, risk_bias: int, zone_risk: int, blocked: bool) -> int:
    if blocked:
        return 10_000
    if mode == "evacuation":
        return base_minutes + (risk_bias * 4) + (zone_risk // 20)
    if mode == "responder":
        return max(1, base_minutes - 1) + (risk_bias * 2)
    if mode == "safest":
        return base_minutes + (risk_bias * 5) + (zone_risk // 16)
    return base_minutes + (risk_bias * 3) + (zone_risk // 24)


def _dijkstra(
    from_zone: str,
    to_zone: str,
    *,
    mode: str,
    blocked_segments: set[str],
    risk_map: dict[str, int],
) -> dict[str, Any]:
    queue: list[tuple[int, str, list[str], list[str]]] = [(0, from_zone, [from_zone], [])]
    best: dict[str, int] = {from_zone: 0}

    while queue:
        cost, zone, path, segments = heapq.heappop(queue)
        if zone == to_zone:
            return {"cost": cost, "path": path, "segments": segments}

        for edge in CORRIDOR_GRAPH.get(zone, []):
            next_zone = str(edge["to"])
            segment_id = str(edge["segment_id"])
            next_cost = cost + _edge_weight(
                mode,
                int(edge["minutes"]),
                int(edge["risk_bias"]),
                risk_map.get(next_zone, 35),
                segment_id in blocked_segments,
            )
            if next_cost < best.get(next_zone, 1_000_000):
                best[next_zone] = next_cost
                heapq.heappush(queue, (next_cost, next_zone, [*path, next_zone], [*segments, segment_id]))

    return {"cost": 10_000, "path": [from_zone], "segments": []}


def _polyline_for_path(path: list[str]) -> list[list[float]]:
    return [[zone_coordinate(zone)["lat"], zone_coordinate(zone)["lng"]] for zone in path]


def compute_route_plan(
    *,
    from_zone: str,
    to_zone: str,
    mode: str,
    blocked_segments: list[dict[str, object]],
    risk_map: dict[str, int],
) -> dict[str, object]:
    blocked_ids = {str(item["segment_id"]) for item in blocked_segments}

    requested = _dijkstra(from_zone, to_zone, mode=mode, blocked_segments=blocked_ids, risk_map=risk_map)
    fastest = _dijkstra(from_zone, to_zone, mode="responder", blocked_segments=blocked_ids, risk_map=risk_map)
    safest = _dijkstra(from_zone, to_zone, mode="safest", blocked_segments=blocked_ids, risk_map=risk_map)
    evac = _dijkstra(from_zone, to_zone, mode="evacuation", blocked_segments=blocked_ids, risk_map=risk_map)

    selected_path = requested["path"]
    selected_segments = requested["segments"]
    average_risk = round(sum(risk_map.get(zone, 35) for zone in selected_path) / max(len(selected_path), 1))

    alternatives: list[dict[str, object]] = []
    for label, result in [
        ("fastest", fastest),
        ("safest", safest),
        ("evacuation", evac),
    ]:
        alternatives.append(
            {
                "mode": label,
                "path": result["path"],
                "polyline": _polyline_for_path(result["path"]),
                "eta_minutes": int(result["cost"]),
                "risk_score": round(sum(risk_map.get(zone, 35) for zone in result["path"]) / max(len(result["path"]), 1)),
            }
        )

    return {
        "from_zone": from_zone,
        "to_zone": to_zone,
        "mode": mode,
        "route_polyline": _polyline_for_path(selected_path),
        "eta_minutes": int(requested["cost"]),
        "risk_score": average_risk,
        "blocked_segments": [item for item in blocked_segments if str(item["segment_id"]) in selected_segments or str(item["segment_id"]) in blocked_ids],
        "alternatives": alternatives,
    }

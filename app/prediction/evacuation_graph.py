from __future__ import annotations

from collections import deque

from app.prediction.zone_graph import ZONE_GRAPH


def get_evacuation_adjacency() -> dict[str, list[str]]:
    return ZONE_GRAPH


def find_shortest_path(start_zone: str, target_zone: str) -> list[str]:
    if start_zone == target_zone:
      return [start_zone]

    graph = get_evacuation_adjacency()
    queue: deque[tuple[str, list[str]]] = deque([(start_zone, [start_zone])])
    visited = {start_zone}

    while queue:
        current_zone, path = queue.popleft()

        for adjacent_zone in graph.get(current_zone, []):
            if adjacent_zone in visited:
                continue

            next_path = [*path, adjacent_zone]

            if adjacent_zone == target_zone:
                return next_path

            visited.add(adjacent_zone)
            queue.append((adjacent_zone, next_path))

    return []

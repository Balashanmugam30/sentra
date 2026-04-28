"""Supply chain and logistics command."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_logistics(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "supply_chokepoints": metrics.supply_chokepoints,
        "ports_watch": 14,
        "semiconductor_risk": 36,
        "fuel_route_resilience": 83,
        "reroute_efficiency": 89,
        "chokepoints": [
            {"node": "Suez-Red Sea route", "pressure": 74, "reroute": "Cape contingency lane"},
            {"node": "Taiwan semiconductor lane", "pressure": 66, "reroute": "Japan-Korea buffer"},
            {"node": "Black Sea grain route", "pressure": 71, "reroute": "Danube rail-water mix"},
            {"node": "Panama drought lane", "pressure": 58, "reroute": "Pacific rail bridge"},
        ],
    }


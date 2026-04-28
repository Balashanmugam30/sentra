from __future__ import annotations

from typing import Any


def build_utility_snapshot(scenario: str | None) -> dict[str, Any]:
    state = {
        "power_status": "normal",
        "water_status": "normal",
        "network_status": "normal",
        "street_light_status": "normal",
        "generator_status": "ready",
        "recommendation": "Utility network stable; keep backup power and comms checks on standby.",
    }

    if scenario == "city_power_outage":
        state.update(
            {
                "power_status": "outage",
                "network_status": "degraded",
                "street_light_status": "outage",
                "generator_status": "active",
                "recommendation": "Activate facility backup generators and shift responders to illuminated corridors.",
            }
        )
    elif scenario == "multi_corridor_block":
        state.update(
            {
                "network_status": "watch",
                "street_light_status": "degraded",
                "recommendation": "Monitor corridor comms and stage portable lighting near blocked routes.",
            }
        )
    elif scenario == "normal_day":
        state["recommendation"] = "Utility services nominal; maintain standard resilience checks."

    return state

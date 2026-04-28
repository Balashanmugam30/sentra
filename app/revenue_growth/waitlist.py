from __future__ import annotations


def build_waitlist(tenant_id: str) -> dict[str, object]:
    return {
        "tenant_id": tenant_id,
        "people_waiting": 12_840,
        "invite_waves": 6,
        "top_regions": ["UAE", "Singapore", "India South", "Germany", "US Healthcare"],
        "launch_city_ranking": ["Dubai", "Singapore", "Bengaluru", "Berlin", "Austin"],
        "top_requested_feature": "AI crisis simulation autopilot",
        "expansion_heat": 91,
    }

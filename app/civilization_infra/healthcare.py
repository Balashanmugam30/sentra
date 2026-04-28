from __future__ import annotations

from app.civilization_infra.models import CIVILIZATION_METRICS


def healthcare_network() -> dict[str, object]:
    return {
        "hospitals_connected": CIVILIZATION_METRICS["hospitals_connected"],
        "icu_load": 63,
        "ambulance_routing": 92,
        "medicine_reserves_days": 34,
        "surge_readiness": 87,
        "hospital_regions": [
            {"region": "North", "hospitals": 620, "icu_load": 61, "surge": 89},
            {"region": "South", "hospitals": 710, "icu_load": 66, "surge": 86},
            {"region": "West", "hospitals": 540, "icu_load": 58, "surge": 91},
            {"region": "East", "hospitals": 610, "icu_load": 67, "surge": 84},
        ],
    }


"""Climate collapse watch engine."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_climate(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "climate_alerts": metrics.climate_alerts,
        "heat_stress_index": 61,
        "flood_risk": 43,
        "drought_risk": 39,
        "cyclone_risk": 27,
        "wildfire_risk": 34,
        "crop_failure_pressure": 29,
        "alerts": [
            {"zone": "South Asia heat belt", "risk": "heat stress", "severity": 78},
            {"zone": "North Atlantic", "risk": "storm pressure", "severity": 66},
            {"zone": "Mediterranean", "risk": "wildfire", "severity": 64},
            {"zone": "Horn of Africa", "risk": "drought", "severity": 71},
        ],
    }


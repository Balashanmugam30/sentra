"""Space and satellite awareness."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_satellite(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "gps_disruption_risk": 22,
        "satellite_congestion": 48,
        "orbital_incident_alerts": 5,
        "weather_coverage": 94,
        "communications_resilience": 89,
        "constellations": [
            {"name": "WeatherSat mesh", "coverage": 94, "risk": 12},
            {"name": "GNSS continuity ring", "coverage": 91, "risk": 22},
            {"name": "Crisis comms constellation", "coverage": 87, "risk": 19},
        ],
    }


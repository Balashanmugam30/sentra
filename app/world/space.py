"""Space and satellite awareness layer."""

from __future__ import annotations

from typing import Any

from .models import WorldMetrics


def build_space(metrics: WorldMetrics) -> dict[str, Any]:
    return {
        "satellite_resilience": metrics.satellite_resilience,
        "gps_disruption_risk": 24,
        "satellite_congestion": 43,
        "orbital_incident_alerts": [
            {"orbit": "LEO comms shell", "risk": 31, "confidence": 87},
            {"orbit": "weather observation band", "risk": 18, "confidence": 91},
        ],
        "weather_satellite_coverage": 94,
        "communications_resilience": 89,
        "recommended_response": "keep terrestrial failover active for high-risk command regions",
    }


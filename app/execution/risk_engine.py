from __future__ import annotations

from typing import Any


def build_risk_engine(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "risk_pressure": 34,
        "top_risks": [
            {"risk": "Government procurement cycle delays", "pressure": 64, "mitigation": "Use partner-led procurement access."},
            {"risk": "Security certification timing", "pressure": 58, "mitigation": "CISO evidence sprint and board visibility."},
            {"risk": "Founder-led sales bottleneck", "pressure": 53, "mitigation": "Hire regional enterprise AE leaders."},
            {"risk": "Engineering platform strain", "pressure": 49, "mitigation": "Roadmap triage and automation workflows."},
        ],
        "controls": ["runway above 30 months", "security readiness above 90", "pipeline coverage above 4x"],
    }

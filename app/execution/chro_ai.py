from __future__ import annotations

from typing import Any


def build_chro_ai(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "team_health": int(metrics["team_health"]),
        "attrition_risk": 18,
        "hiring_velocity": "8 critical hires/quarter",
        "leadership_gaps": ["Regional VP Middle East", "Enterprise Security Program Lead", "Partner Enablement Lead"],
        "high_performer_retention": 91,
        "department_morale": {
            "engineering": 78,
            "revenue": 83,
            "customer_success": 86,
            "security": 88,
            "operations": 81,
        },
        "skill_shortages": ["GovTech procurement", "enterprise solution engineering", "security compliance operations"],
    }

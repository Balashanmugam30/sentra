from __future__ import annotations

from typing import Any

from app.execution.models import DEPARTMENTS


def build_coo_ai(metrics: dict[str, Any]) -> dict[str, Any]:
    bottlenecks = [
        {"team": "Engineering", "issue": "AI platform and marketplace roadmap competing for senior architecture time", "severity": 72},
        {"team": "Revenue", "issue": "Founder-led enterprise deals need regional AE handoff", "severity": 66},
        {"team": "Security", "issue": "SOC2 evidence collection blocks government procurement", "severity": 61},
    ]
    return {
        "department_performance": list(DEPARTMENTS),
        "SLA_health": 94,
        "workflow_bottlenecks": bottlenecks,
        "productivity_score": int(metrics["productivity_score"]),
        "hiring_velocity": "selective",
        "delivery_execution": 89,
        "cross_team_friction_heatmap": [
            {"from": "Revenue", "to": "Product", "friction": 44},
            {"from": "Security", "to": "Engineering", "friction": 52},
            {"from": "Customer Success", "to": "Revenue", "friction": 31},
        ],
    }

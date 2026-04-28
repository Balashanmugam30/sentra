from __future__ import annotations

from typing import Any

from app.execution.models import WORKFLOWS


def build_workflows(metrics: dict[str, Any]) -> dict[str, Any]:
    active = [workflow for workflow in WORKFLOWS if workflow["status"] == "active"]
    return {
        "workflows": list(WORKFLOWS),
        "active_count": len(active),
        "average_automation_level": round(sum(int(item["automation_level"]) for item in WORKFLOWS) / len(WORKFLOWS)),
        "next_best_workflow": "Launch country",
        "workflow_health": 87,
    }

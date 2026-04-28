from __future__ import annotations

from typing import Any

from app.investor.models import DATAROOM_ITEMS


def build_dataroom() -> dict[str, Any]:
    items = [
        {"item_id": f"DDR-{index:03d}", "name": name, "status": status, "owner": "Finance" if "Financial" in name or "Tax" in name else "Operations"}
        for index, (name, status) in enumerate(DATAROOM_ITEMS, start=1)
    ]
    ready = len([item for item in items if item["status"] == "Ready"])
    return {
        "items": items,
        "ready_count": ready,
        "in_progress_count": len([item for item in items if item["status"] == "In Progress"]),
        "missing_count": len([item for item in items if item["status"] == "Missing"]),
        "readiness_percent": round(ready / max(1, len(items)) * 100),
    }


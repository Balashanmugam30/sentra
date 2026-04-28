from __future__ import annotations

from typing import Any


def pipeline_health(sources: list[dict[str, Any]]) -> list[dict[str, object]]:
    return [
        {
            "pipeline_id": f"PIPE-{source['source_id']}",
            "tenant_id": source["tenant_id"],
            "name": f"{source['name']} enrichment pipeline",
            "clean_rate": 98 - index % 4,
            "enrichment_rate": 91 - index % 5,
            "link_success": 88 + index % 6,
            "latency_ms": 140 + index * 11,
            "status": "healthy" if index % 7 else "watch",
        }
        for index, source in enumerate(sources)
    ]


def cleansing_summary(sources: list[dict[str, Any]]) -> dict[str, object]:
    total = sum(int(source["signals_day"]) for source in sources)
    return {
        "raw_signals_day": total,
        "cleaned_signals_day": round(total * 0.964),
        "enriched_signals_day": round(total * 0.873),
        "linked_signals_day": round(total * 0.812),
        "duplicate_signals_removed": round(total * 0.184),
    }

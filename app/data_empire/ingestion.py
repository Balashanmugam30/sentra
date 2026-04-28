from __future__ import annotations

from app.data_empire.models import DATA_SOURCES, data_empire_id, utc_now_iso


def seed_data_sources(tenant_id: str) -> list[dict[str, object]]:
    return [
        {
            "source_id": source_id,
            "tenant_id": tenant_id,
            "name": name,
            "category": category,
            "signals_day": signals_day,
            "freshness_seconds": 12 + index * 4,
            "quality_score": 96 - (index % 5),
            "status": "streaming",
            "last_ingested_at": utc_now_iso(),
        }
        for index, (source_id, name, signals_day, category) in enumerate(DATA_SOURCES)
    ]


def run_ingestion_job(tenant_id: str) -> dict[str, object]:
    return {
        "job_id": data_empire_id("ING"),
        "tenant_id": tenant_id,
        "sources_processed": len(DATA_SOURCES),
        "signals_ingested": 14_800_000,
        "quality_score": 96,
        "dedupe_rate": 18.4,
        "completed_at": utc_now_iso(),
    }

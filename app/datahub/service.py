from __future__ import annotations

from statistics import mean
from typing import Any

from app.datahub.store import datahub_store


def _avg(rows: list[dict[str, Any]], key: str) -> int:
    if not rows:
        return 0
    return round(mean(float(row.get(key, 0)) for row in rows))


def _pipeline_view(row: dict[str, Any]) -> dict[str, Any]:
    source = str(row["source"]).lower().replace(" ", "_")
    return {
        **row,
        "rows_today": 18000 + int(row.get("lineage_nodes", 0)) * 4200,
        "quality_score": int(row.get("quality", 0)),
        "freshness_minutes": int(row.get("freshness_min", 0)),
        "destination": f"sentra_lakehouse.{source}",
        "lineage": ["raw_ingest", "dedupe", "masking", "feature_store", "analytics_mart"],
    }


def _product_view(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "product_id": row["product_id"],
        "name": row["name"],
        "buyer": f"{row['buyers']} qualified buyers",
        "annual_value": row["arr_potential"],
        "privacy": row["privacy_mode"],
        "status": row["status"],
    }


def _entity_view(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "entity_id": row["entity_id"],
        "tenant_id": row["tenant_id"],
        "type": row["type"],
        "label": row["name"],
        "linked_to": row["links"],
        "risk_score": row["risk"],
        "insight": f"{row['name']} influences {len(row['links'])} downstream operational decisions.",
    }


class DataHubService:
    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        pipelines = [_pipeline_view(row) for row in datahub_store.rows("pipelines", tenant_ids)]
        graph = [_entity_view(row) for row in datahub_store.rows("graph_entities", tenant_ids)]
        monetization = [_product_view(row) for row in datahub_store.rows("monetization", tenant_ids)]
        return {
            "data_moat_score": 94,
            "pipelines": pipelines,
            "pipeline_count": len(pipelines),
            "avg_quality": _avg(pipelines, "quality_score"),
            "avg_freshness_minutes": _avg(pipelines, "freshness_minutes"),
            "dead_letters": sum(int(row["dead_letters"]) for row in pipelines),
            "tenant_isolation": "enforced",
            "privacy_tiers": {tier: len([row for row in pipelines if row["privacy_tier"] == tier]) for tier in sorted({str(row["privacy_tier"]) for row in pipelines})},
            "lineage_nodes": sum(int(row["lineage_nodes"]) for row in pipelines),
            "graph_entities": len(graph),
            "monetization_arr": sum(int(row["annual_value"]) for row in monetization),
            "intelligence_products": monetization,
        }

    def pipelines(self, tenant_ids: list[str]) -> dict[str, Any]:
        pipelines = [_pipeline_view(row) for row in datahub_store.rows("pipelines", tenant_ids)]
        return {
            "pipelines": pipelines,
            "runs": datahub_store.rows("runs", tenant_ids),
            "dead_letter_queues": [row for row in pipelines if int(row["dead_letters"]) > 0],
            "replay_ready": [row for row in pipelines if row["status"] in {"healthy", "watch"}],
            "masking_enabled": len([row for row in pipelines if int(row.get("masked_fields", 0)) > 0]),
        }

    def graph(self, tenant_ids: list[str]) -> dict[str, Any]:
        raw_entities = datahub_store.rows("graph_entities", tenant_ids)
        entities = [_entity_view(row) for row in raw_entities]
        return {
            "entities": entities,
            "relationships": [{"source": entity["entity_id"], "target": link, "type": "depends_on"} for entity in raw_entities for link in entity.get("links", [])],
            "hidden_dependencies": [entity for entity in entities if int(entity["risk_score"]) >= 60],
            "suspicious_patterns": [entity for entity in entities if "risk" in str(entity["type"]) or int(entity["risk_score"]) >= 78],
        }


datahub_service = DataHubService()

from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS


SEEDED_AT = "2026-04-26T00:00:00+00:00"
STORE_VERSION = "phase22x-datahub-2026-04-26"

PIPELINES: tuple[dict[str, Any], ...] = (
    {"pipeline_id": "PIPE-INCIDENTS", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Incident warehouse", "source": "incidents", "mode": "ELT", "freshness_min": 4, "quality": 97, "privacy_tier": "internal", "schema_valid": True, "dedupe_rate": 99, "masked_fields": 12, "lineage_nodes": 28, "dead_letters": 2, "status": "healthy"},
    {"pipeline_id": "PIPE-SENSORS", "tenant_id": "TEN-BALA-HOSP", "name": "Sensor telemetry lake", "source": "sensors", "mode": "stream", "freshness_min": 1, "quality": 96, "privacy_tier": "operational", "schema_valid": True, "dedupe_rate": 98, "masked_fields": 4, "lineage_nodes": 44, "dead_letters": 6, "status": "healthy"},
    {"pipeline_id": "PIPE-AI-DECISIONS", "tenant_id": "TEN-GOVSECURE", "name": "AI decision ledger", "source": "AI decisions", "mode": "append-only", "freshness_min": 3, "quality": 95, "privacy_tier": "sensitive", "schema_valid": True, "dedupe_rate": 100, "masked_fields": 18, "lineage_nodes": 36, "dead_letters": 0, "status": "healthy"},
    {"pipeline_id": "PIPE-BILLING", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Billing and usage signals", "source": "billing", "mode": "ELT", "freshness_min": 18, "quality": 94, "privacy_tier": "financial", "schema_valid": True, "dedupe_rate": 97, "masked_fields": 22, "lineage_nodes": 19, "dead_letters": 1, "status": "healthy"},
    {"pipeline_id": "PIPE-OSINT", "tenant_id": "TEN-GOVSECURE", "name": "Weather civic OSINT feed", "source": "external feeds", "mode": "ETL", "freshness_min": 12, "quality": 89, "privacy_tier": "public", "schema_valid": True, "dedupe_rate": 93, "masked_fields": 0, "lineage_nodes": 31, "dead_letters": 9, "status": "watch"},
)

GRAPH_ENTITIES: tuple[dict[str, Any], ...] = (
    {"entity_id": "ENT-ZONE-KITCHEN", "tenant_id": "TEN-GRAND-MERIDIAN", "type": "zone", "name": "Kitchen Zone B", "risk": 86, "links": ["ENT-DEVICE-FIREPANEL", "ENT-INC-FIRE", "ENT-TEAM-ALPHA"]},
    {"entity_id": "ENT-DEVICE-FIREPANEL", "tenant_id": "TEN-GRAND-MERIDIAN", "type": "device", "name": "Fire Panel 3B", "risk": 24, "links": ["ENT-ZONE-KITCHEN", "ENT-VENDOR-BMS"]},
    {"entity_id": "ENT-INC-FIRE", "tenant_id": "TEN-GRAND-MERIDIAN", "type": "incident", "name": "Kitchen fire chain", "risk": 92, "links": ["ENT-ZONE-KITCHEN", "ENT-TEAM-ALPHA", "ENT-RISK-SMOKE"]},
    {"entity_id": "ENT-VENDOR-BMS", "tenant_id": "TEN-BALA-MFG", "type": "vendor", "name": "BMS Gateway", "risk": 61, "links": ["ENT-DEVICE-FIREPANEL", "ENT-RISK-SMOKE"]},
    {"entity_id": "ENT-RISK-SMOKE", "tenant_id": "TEN-GOVSECURE", "type": "risk", "name": "Smoke corridor dependency", "risk": 78, "links": ["ENT-INC-FIRE"]},
)

MONETIZATION: tuple[dict[str, Any], ...] = (
    {"product_id": "DATA-BENCH-HOSP", "name": "Hospital safety benchmark", "arr_potential": 980000, "buyers": 42, "privacy_mode": "anonymized aggregate", "status": "ready"},
    {"product_id": "DATA-INSURER-RISK", "name": "Insurer risk intelligence feed", "arr_potential": 1800000, "buyers": 18, "privacy_mode": "tenant-safe benchmark", "status": "legal_review"},
    {"product_id": "DATA-CITY-PACK", "name": "City readiness intelligence pack", "arr_potential": 2400000, "buyers": 11, "privacy_mode": "public sector aggregate", "status": "ready"},
)


class DataHubStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"store_version": STORE_VERSION, "pipelines": [], "graph_entities": [], "monetization": [], "runs": [], "events": []}

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        if payload.get("store_version") != STORE_VERSION:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        seed_groups = {"pipelines": (PIPELINES, "pipeline_id"), "graph_entities": (GRAPH_ENTITIES, "entity_id"), "monetization": (MONETIZATION, "product_id")}
        with self._lock:
            payload = self._read()
            for table, (rows, key) in seed_groups.items():
                existing = {row[key] for row in payload[table] if key in row}
                for row in rows:
                    if row[key] in existing:
                        continue
                    payload[table].append({**row, "updated_at": SEEDED_AT})
                    created += 1
            self._write(payload)
        return {"created": created}

    def rows(self, table: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(row) for row in self._read()[table]]
        if set(tenant_ids) == set(DEMO_TENANTS) or table == "monetization":
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids]

    def run_pipeline(self, tenant_id: str, pipeline_id: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            pipeline = next((row for row in payload["pipelines"] if row["pipeline_id"] == pipeline_id), payload["pipelines"][0])
            run = {"run_id": f"DATA-RUN-{len(payload['runs']) + 1:04d}", "tenant_id": tenant_id, "pipeline_id": pipeline["pipeline_id"], "status": "completed", "rows_processed": 184200, "quality": pipeline["quality"], "created_at": SEEDED_AT}
            payload["runs"].append(run)
            payload["events"].append({"event_id": f"DATA-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_id, "action": "pipeline_run", "detail": run, "created_at": SEEDED_AT})
            self._write(payload)
            return {"run": run}


datahub_store = DataHubStore(settings.sentra_datahub_store_path)


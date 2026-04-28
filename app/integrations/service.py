from __future__ import annotations

from collections import Counter
from statistics import mean
from typing import Any

from app.integrations.store import integration_hub_store


def _avg(rows: list[dict[str, Any]], key: str) -> int:
    if not rows:
        return 0
    return round(mean(float(row.get(key, 0)) for row in rows))


class IntegrationHubService:
    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        connectors = integration_hub_store.rows("connectors", tenant_ids)
        logs = integration_hub_store.rows("sync_logs", tenant_ids)
        automations = integration_hub_store.rows("automations", tenant_ids)
        failed = [log for log in logs if log["status"] in {"failed", "retrying"}]
        return {
            "connectors": connectors,
            "categories": dict(Counter(str(row["category"]) for row in connectors)),
            "connected": len([row for row in connectors if row["status"] == "connected"]),
            "degraded": len([row for row in connectors if row["status"] in {"degraded", "watch"}]),
            "avg_health": _avg(connectors, "health"),
            "avg_latency_ms": _avg(connectors, "latency_ms"),
            "failed_integrations": failed,
            "permission_scopes": sorted({scope for row in connectors for scope in row.get("scopes", [])}),
            "data_mappings": [
                {"source": "ServiceNow incident", "target": "Sentra incident", "coverage": 96},
                {"source": "Fire panel alarm", "target": "hazard event", "coverage": 98},
                {"source": "Okta group", "target": "RBAC role", "coverage": 92},
            ],
            "automations": automations,
            "reliability": {"circuit_breakers": 4, "fallback_caches": 7, "retry_queues": 3, "idempotency_keys_today": 18420},
        }

    def logs(self, tenant_ids: list[str]) -> dict[str, Any]:
        logs = integration_hub_store.rows("sync_logs", tenant_ids)
        return {
            "logs": logs,
            "failed": [log for log in logs if log["status"] == "failed"],
            "retrying": [log for log in logs if log["status"] == "retrying"],
            "events": integration_hub_store.rows("events", tenant_ids),
        }


integration_hub_service = IntegrationHubService()


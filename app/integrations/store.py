from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS


SEEDED_AT = "2026-04-26T00:00:00+00:00"
STORE_VERSION = "phase22x-integrations-2026-04-26"

CONNECTORS: tuple[dict[str, Any], ...] = (
    {"connector_id": "CON-SLACK", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Slack", "category": "enterprise", "status": "connected", "health": 98, "auth_mode": "OAuth", "token_state": "healthy", "scopes": ["chat:write", "channels:read"], "last_sync": "2026-04-26T07:50:00+00:00", "latency_ms": 94, "mapped_entities": 48},
    {"connector_id": "CON-TEAMS", "tenant_id": "TEN-BALA-HOSP", "name": "Microsoft Teams", "category": "enterprise", "status": "connected", "health": 96, "auth_mode": "OAuth", "token_state": "healthy", "scopes": ["messages.send", "teams.read"], "last_sync": "2026-04-26T07:46:00+00:00", "latency_ms": 118, "mapped_entities": 62},
    {"connector_id": "CON-SERVICENOW", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "ServiceNow", "category": "enterprise", "status": "degraded", "health": 86, "auth_mode": "API key", "token_state": "rotating", "scopes": ["incidents.write", "tasks.read"], "last_sync": "2026-04-26T07:25:00+00:00", "latency_ms": 410, "mapped_entities": 39},
    {"connector_id": "CON-SALESFORCE", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Salesforce", "category": "enterprise", "status": "connected", "health": 94, "auth_mode": "OAuth", "token_state": "healthy", "scopes": ["accounts.read", "cases.write"], "last_sync": "2026-04-26T06:58:00+00:00", "latency_ms": 180, "mapped_entities": 33},
    {"connector_id": "CON-OKTA", "tenant_id": "TEN-GOVSECURE", "name": "Okta", "category": "security", "status": "connected", "health": 97, "auth_mode": "OIDC", "token_state": "healthy", "scopes": ["users.read", "groups.read"], "last_sync": "2026-04-26T07:48:00+00:00", "latency_ms": 126, "mapped_entities": 210},
    {"connector_id": "CON-SPLUNK", "tenant_id": "TEN-GOVSECURE", "name": "Splunk", "category": "security", "status": "connected", "health": 93, "auth_mode": "HEC token", "token_state": "healthy", "scopes": ["events.write"], "last_sync": "2026-04-26T07:40:00+00:00", "latency_ms": 202, "mapped_entities": 88},
    {"connector_id": "CON-DATADOG", "tenant_id": "TEN-BALA-UNI", "name": "Datadog", "category": "infra", "status": "connected", "health": 91, "auth_mode": "API key", "token_state": "healthy", "scopes": ["metrics.write", "logs.write"], "last_sync": "2026-04-26T07:35:00+00:00", "latency_ms": 176, "mapped_entities": 56},
    {"connector_id": "CON-FIRE-PANEL", "tenant_id": "TEN-BALA-HOSP", "name": "Fire Panels", "category": "iot", "status": "connected", "health": 95, "auth_mode": "mTLS", "token_state": "healthy", "scopes": ["alarms.read", "events.read"], "last_sync": "2026-04-26T07:51:00+00:00", "latency_ms": 84, "mapped_entities": 124},
    {"connector_id": "CON-HVAC", "tenant_id": "TEN-BALA-MFG", "name": "HVAC / BMS", "category": "iot", "status": "watch", "health": 82, "auth_mode": "gateway", "token_state": "watch", "scopes": ["zones.read", "controls.write"], "last_sync": "2026-04-26T07:12:00+00:00", "latency_ms": 520, "mapped_entities": 73},
    {"connector_id": "CON-TWILIO", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Twilio SMS + Voice", "category": "communication", "status": "connected", "health": 96, "auth_mode": "API key", "token_state": "healthy", "scopes": ["sms.send", "voice.call"], "last_sync": "2026-04-26T07:44:00+00:00", "latency_ms": 132, "mapped_entities": 41},
    {"connector_id": "CON-N8N", "tenant_id": "TEN-BALA-UNI", "name": "n8n Automation", "category": "automation", "status": "connected", "health": 94, "auth_mode": "webhook secret", "token_state": "healthy", "scopes": ["workflow.run"], "last_sync": "2026-04-26T07:31:00+00:00", "latency_ms": 166, "mapped_entities": 27},
)

SYNC_LOGS: tuple[dict[str, Any], ...] = (
    {"log_id": "SYNC-001", "tenant_id": "TEN-GRAND-MERIDIAN", "connector_id": "CON-SLACK", "status": "success", "message": "Incident channel mapped", "latency_ms": 94, "created_at": "2026-04-26T07:50:00+00:00"},
    {"log_id": "SYNC-002", "tenant_id": "TEN-GRAND-MERIDIAN", "connector_id": "CON-SERVICENOW", "status": "retrying", "message": "Task write delayed by remote rate limit", "latency_ms": 812, "created_at": "2026-04-26T07:25:00+00:00"},
    {"log_id": "SYNC-003", "tenant_id": "TEN-BALA-MFG", "connector_id": "CON-HVAC", "status": "failed", "message": "BMS gateway returned stale zone state", "latency_ms": 1200, "created_at": "2026-04-26T07:12:00+00:00"},
)

AUTOMATIONS: tuple[dict[str, Any], ...] = (
    {"automation_id": "AUTO-INCIDENT-SLACK", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Incident -> Slack -> ServiceNow", "trigger": "incident.created", "condition": "severity >= high", "actions": ["create war room", "open ServiceNow task", "notify exec"], "status": "active", "runs_today": 42, "success_rate": 99},
    {"automation_id": "AUTO-PANIC-SMS", "tenant_id": "TEN-BALA-HOSP", "name": "Panic -> SMS + Teams", "trigger": "behavior.panic_risk", "condition": "confidence >= 85", "actions": ["send SMS", "post Teams card", "escalate silence"], "status": "active", "runs_today": 18, "success_rate": 97},
    {"automation_id": "AUTO-BILLING-CS", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Usage spike -> CS playbook", "trigger": "billing.usage_spike", "condition": "usage > 85%", "actions": ["create CS task", "suggest upgrade", "notify finance"], "status": "draft", "runs_today": 0, "success_rate": 100},
)


class IntegrationHubStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"store_version": STORE_VERSION, "connectors": [], "sync_logs": [], "automations": [], "events": []}

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
        seed_groups = {"connectors": (CONNECTORS, "connector_id"), "sync_logs": (SYNC_LOGS, "log_id"), "automations": (AUTOMATIONS, "automation_id")}
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
        if set(tenant_ids) == set(DEMO_TENANTS):
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids]

    def connect(self, tenant_id: str, provider: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            connector = next((row for row in payload["connectors"] if row["tenant_id"] == tenant_id and row["name"].lower() == provider.lower()), None)
            if connector is None:
                connector = {
                    "connector_id": f"CON-CUSTOM-{len(payload['connectors']) + 1:03d}",
                    "tenant_id": tenant_id,
                    "name": provider,
                    "category": "custom",
                    "status": "connected",
                    "health": 90,
                    "auth_mode": "OAuth",
                    "token_state": "healthy",
                    "scopes": ["events.read", "actions.write"],
                    "last_sync": SEEDED_AT,
                    "latency_ms": 180,
                    "mapped_entities": 12,
                    "updated_at": SEEDED_AT,
                }
                payload["connectors"].append(connector)
            else:
                connector["status"] = "connected"
                connector["health"] = max(int(connector.get("health", 0)), 92)
                connector["token_state"] = "healthy"
                connector["updated_at"] = SEEDED_AT
            event = self._event(payload, tenant_id, "connector_connected", {"connector_id": connector["connector_id"], "provider": provider})
            self._write(payload)
            return {"connector": dict(connector), "event": event}

    def test(self, tenant_ids: list[str], connector_id: str) -> dict[str, Any] | None:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            connector = next((row for row in payload["connectors"] if row["connector_id"] == connector_id and row["tenant_id"] in tenant_ids), None)
            if connector is None:
                return None
            connector["last_test_at"] = SEEDED_AT
            connector["health"] = min(100, int(connector.get("health", 90)) + 1)
            log = {
                "log_id": f"SYNC-TEST-{len(payload['sync_logs']) + 1:03d}",
                "tenant_id": connector["tenant_id"],
                "connector_id": connector_id,
                "status": "success",
                "message": f"{connector['name']} connection verified",
                "latency_ms": connector["latency_ms"],
                "created_at": SEEDED_AT,
                "updated_at": SEEDED_AT,
            }
            payload["sync_logs"].append(log)
            event = self._event(payload, str(connector["tenant_id"]), "connector_tested", {"connector_id": connector_id})
            self._write(payload)
            return {"connector": dict(connector), "log": log, "event": event}

    def _event(self, payload: dict[str, Any], tenant_id: str, action: str, detail: dict[str, Any]) -> dict[str, Any]:
        event = {"event_id": f"INT-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_id, "action": action, "detail": detail, "created_at": SEEDED_AT}
        payload["events"].append(event)
        return event


integration_hub_store = IntegrationHubStore(settings.sentra_integration_hub_store_path)


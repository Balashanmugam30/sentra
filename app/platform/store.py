from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS, utc_now_iso

SEEDED_AT = "2026-04-26T00:00:00+00:00"

ORGANIZATIONS: tuple[dict[str, Any], ...] = (
    {"tenant_id": "TEN-GRAND-MERIDIAN", "name": "Grand Meridian Hotels", "plan": "Enterprise", "region": "APAC", "developer_tier": "Scale", "owner": "Bala CEO", "sandbox_enabled": True},
    {"tenant_id": "TEN-BALA-HOSP", "name": "Bala Hospital Demo", "plan": "Government", "region": "India South", "developer_tier": "Regulated", "owner": "Security Admin", "sandbox_enabled": True},
    {"tenant_id": "TEN-BALA-UNI", "name": "Bala University", "plan": "Growth", "region": "India West", "developer_tier": "Campus", "owner": "Ops Lead", "sandbox_enabled": True},
    {"tenant_id": "TEN-BALA-MFG", "name": "Bala Manufacturing", "plan": "Enterprise", "region": "APAC Industrial", "developer_tier": "Factory", "owner": "Facilities Lead", "sandbox_enabled": True},
    {"tenant_id": "TEN-GOVSECURE", "name": "SmartCity Authority", "plan": "Government", "region": "Gov Cloud", "developer_tier": "Sovereign", "owner": "Gov Program Lead", "sandbox_enabled": True},
)

API_KEYS: tuple[dict[str, Any], ...] = (
    {"key_id": "KEY-GM-PROD", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Grand Meridian production ingest", "masked_key": "sk_live_gm_********4A9F", "environment": "production", "scopes": ["incidents:read", "alerts:write", "webhooks:read"], "status": "active", "last_used": "2026-04-26T07:52:00+00:00", "expires_at": "2026-10-26T00:00:00+00:00", "created_by": "Security Admin", "requests_today": 18420, "rate_limit": "12k/min"},
    {"key_id": "KEY-HOSP-SBX", "tenant_id": "TEN-BALA-HOSP", "name": "Hospital sandbox automation", "masked_key": "sk_test_hosp_********91CD", "environment": "sandbox", "scopes": ["sandbox:write", "incidents:simulate", "webhooks:test"], "status": "active", "last_used": "2026-04-26T06:34:00+00:00", "expires_at": "2026-07-26T00:00:00+00:00", "created_by": "Ops Lead", "requests_today": 6420, "rate_limit": "5k/min"},
    {"key_id": "KEY-UNI-ANALYTICS", "tenant_id": "TEN-BALA-UNI", "name": "Campus analytics bridge", "masked_key": "sk_live_uni_********7FD2", "environment": "production", "scopes": ["analytics:read", "twin:read", "usage:read"], "status": "active", "last_used": "2026-04-26T08:02:00+00:00", "expires_at": "2026-12-31T00:00:00+00:00", "created_by": "Analyst 1", "requests_today": 9320, "rate_limit": "8k/min"},
    {"key_id": "KEY-GOV-OLD", "tenant_id": "TEN-GOVSECURE", "name": "Legacy public safety connector", "masked_key": "sk_live_gov_********1B20", "environment": "production", "scopes": ["alerts:read"], "status": "revoked", "last_used": "2026-04-21T12:15:00+00:00", "expires_at": "2026-04-24T00:00:00+00:00", "created_by": "Gov Program Lead", "requests_today": 0, "rate_limit": "disabled"},
)

OAUTH_APPS: tuple[dict[str, Any], ...] = (
    {"app_id": "APP-N8N-OPS", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "n8n Emergency Automation", "client_id": "sentra_app_n8n_ops", "environment": "production", "scopes": ["workflows:run", "alerts:send", "audit:read"], "redirect_urls": ["https://ops.grandmeridian.demo/oauth/callback"], "status": "active", "owner": "Grand Meridian Hotels", "connected_users": 18, "last_authorized": "2026-04-25T22:20:00+00:00"},
    {"app_id": "APP-HOSP-EMR", "tenant_id": "TEN-BALA-HOSP", "name": "Hospital EMR Safety Bridge", "client_id": "sentra_app_hosp_emr", "environment": "production", "scopes": ["communications:send", "incidents:read"], "redirect_urls": ["https://metrocare.demo/sentra/oauth"], "status": "security_review", "owner": "Bala Hospital Demo", "connected_users": 6, "last_authorized": "2026-04-24T10:10:00+00:00"},
    {"app_id": "APP-CAMPUS-SLACK", "tenant_id": "TEN-BALA-UNI", "name": "Campus Slack Broadcast", "client_id": "sentra_app_campus_slack", "environment": "sandbox", "scopes": ["alerts:send", "webhooks:test"], "redirect_urls": ["https://slack.com/oauth/v2/callback"], "status": "active", "owner": "Bala University", "connected_users": 42, "last_authorized": "2026-04-26T04:40:00+00:00"},
)

WEBHOOKS: tuple[dict[str, Any], ...] = (
    {"webhook_id": "WH-GM-INCIDENTS", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Incident lifecycle stream", "endpoint_url": "https://hooks.grandmeridian.demo/sentra/incidents", "events": ["incident.created", "workflow.completed", "audit.denied"], "status": "active", "signature_status": "verified", "latency_ms": 142, "success_rate": 99.2, "retry_count": 1, "failures_today": 0, "last_delivery": "2026-04-26T08:04:00+00:00"},
    {"webhook_id": "WH-HOSP-COMMS", "tenant_id": "TEN-BALA-HOSP", "name": "Clinical escalation webhook", "endpoint_url": "https://integrations.metrocaredemo.org/sentra/escalations", "events": ["communications.failed", "medical.assistance"], "status": "degraded", "signature_status": "verified", "latency_ms": 420, "success_rate": 94.6, "retry_count": 4, "failures_today": 3, "last_delivery": "2026-04-26T07:58:00+00:00"},
    {"webhook_id": "WH-GOV-AUDIT", "tenant_id": "TEN-GOVSECURE", "name": "Government audit mirror", "endpoint_url": "https://audit.smartcity.demo/events", "events": ["audit.created", "security.threat", "policy.changed"], "status": "active", "signature_status": "rotated", "latency_ms": 188, "success_rate": 98.4, "retry_count": 2, "failures_today": 1, "last_delivery": "2026-04-26T07:49:00+00:00"},
)

DELIVERIES: tuple[dict[str, Any], ...] = (
    {"delivery_id": "DLV-0001", "tenant_id": "TEN-GRAND-MERIDIAN", "webhook_id": "WH-GM-INCIDENTS", "event": "incident.created", "status": "delivered", "attempts": 1, "latency_ms": 118, "created_at": "2026-04-26T08:04:00+00:00"},
    {"delivery_id": "DLV-0002", "tenant_id": "TEN-BALA-HOSP", "webhook_id": "WH-HOSP-COMMS", "event": "communications.failed", "status": "retried", "attempts": 3, "latency_ms": 612, "created_at": "2026-04-26T07:58:00+00:00"},
    {"delivery_id": "DLV-0003", "tenant_id": "TEN-GOVSECURE", "webhook_id": "WH-GOV-AUDIT", "event": "security.threat", "status": "delivered", "attempts": 1, "latency_ms": 176, "created_at": "2026-04-26T07:49:00+00:00"},
)

USAGE_LOGS: tuple[dict[str, Any], ...] = (
    {"log_id": "USG-001", "tenant_id": "TEN-GRAND-MERIDIAN", "endpoint": "/v1/incidents", "method": "POST", "status": 202, "requests": 8240, "latency_ms": 118, "day": "2026-04-26", "environment": "production"},
    {"log_id": "USG-002", "tenant_id": "TEN-GRAND-MERIDIAN", "endpoint": "/v1/alerts", "method": "POST", "status": 202, "requests": 6120, "latency_ms": 136, "day": "2026-04-26", "environment": "production"},
    {"log_id": "USG-003", "tenant_id": "TEN-BALA-HOSP", "endpoint": "/v1/webhooks/test", "method": "POST", "status": 200, "requests": 2400, "latency_ms": 188, "day": "2026-04-26", "environment": "sandbox"},
    {"log_id": "USG-004", "tenant_id": "TEN-BALA-UNI", "endpoint": "/v1/twin/live", "method": "GET", "status": 200, "requests": 9280, "latency_ms": 96, "day": "2026-04-26", "environment": "production"},
    {"log_id": "USG-005", "tenant_id": "TEN-GOVSECURE", "endpoint": "/v1/audit/events", "method": "GET", "status": 200, "requests": 5120, "latency_ms": 204, "day": "2026-04-26", "environment": "production"},
)

RATE_LIMITS: tuple[dict[str, Any], ...] = (
    {"tenant_id": "TEN-GRAND-MERIDIAN", "plan": "Enterprise", "per_minute": 12000, "per_day": 2400000, "burst_mode": True, "blocked_requests": 0, "abuse_score": 8, "usage_percent": 72, "status": "healthy"},
    {"tenant_id": "TEN-BALA-HOSP", "plan": "Government", "per_minute": 10000, "per_day": 1800000, "burst_mode": True, "blocked_requests": 12, "abuse_score": 18, "usage_percent": 64, "status": "watch"},
    {"tenant_id": "TEN-BALA-UNI", "plan": "Growth", "per_minute": 6000, "per_day": 900000, "burst_mode": False, "blocked_requests": 0, "abuse_score": 6, "usage_percent": 81, "status": "near_cap"},
    {"tenant_id": "TEN-GOVSECURE", "plan": "Government", "per_minute": 15000, "per_day": 3000000, "burst_mode": True, "blocked_requests": 4, "abuse_score": 11, "usage_percent": 58, "status": "healthy"},
)

DEVELOPERS: tuple[dict[str, Any], ...] = (
    {"developer_id": "DEV-001", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Anika Rao", "email": "anika@grandmeridian.demo", "role": "developer_admin", "apps_owned": 3, "last_active": "2026-04-26T08:00:00+00:00", "docs_views": 82, "sandbox_runs": 18},
    {"developer_id": "DEV-002", "tenant_id": "TEN-BALA-HOSP", "name": "Dr. Meera Shah", "email": "meera@metrocaredemo.org", "role": "owner", "apps_owned": 2, "last_active": "2026-04-26T07:30:00+00:00", "docs_views": 41, "sandbox_runs": 11},
    {"developer_id": "DEV-003", "tenant_id": "TEN-BALA-UNI", "name": "Campus Integrations", "email": "integrations@balauniversity.demo", "role": "developer_admin", "apps_owned": 4, "last_active": "2026-04-26T06:45:00+00:00", "docs_views": 96, "sandbox_runs": 34},
)

ENVIRONMENTS: tuple[dict[str, Any], ...] = (
    {"environment_id": "ENV-PROD", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Production", "mode": "live", "keys": 4, "events_today": 31420, "health": 98},
    {"environment_id": "ENV-SBX", "tenant_id": "TEN-BALA-HOSP", "name": "Sandbox", "mode": "test", "keys": 2, "events_today": 8240, "health": 95},
    {"environment_id": "ENV-HYBRID", "tenant_id": "TEN-GOVSECURE", "name": "Gov Hybrid", "mode": "hybrid", "keys": 3, "events_today": 18440, "health": 97},
)

SDK_PACKAGES: tuple[dict[str, Any], ...] = (
    {"sdk_id": "SDK-JS", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Sentra JavaScript SDK", "language": "TypeScript", "version": "0.7.4", "downloads": 1840, "status": "ready", "example": "sentra.incidents.create(payload)"},
    {"sdk_id": "SDK-PY", "tenant_id": "TEN-BALA-HOSP", "name": "Sentra Python SDK", "language": "Python", "version": "0.6.8", "downloads": 1220, "status": "ready", "example": "client.incidents.create(payload)"},
    {"sdk_id": "SDK-REST", "tenant_id": "TEN-GOVSECURE", "name": "REST + OpenAPI Examples", "language": "OpenAPI", "version": "2026.04", "downloads": 940, "status": "docs_ready", "example": "POST /v1/incidents"},
    {"sdk_id": "SDK-CLI", "tenant_id": "TEN-BALA-UNI", "name": "Sentra CLI Manifest", "language": "CLI", "version": "0.3.2", "downloads": 620, "status": "sandbox_ready", "example": "sentra sandbox emit incident.created"},
)

ALERTS: tuple[dict[str, Any], ...] = (
    {"alert_id": "PLAT-ALT-001", "tenant_id": "TEN-BALA-UNI", "title": "Campus API usage at 81% of plan", "severity": "medium", "status": "open", "detail": "Recommend Growth API burst pack before admissions event."},
    {"alert_id": "PLAT-ALT-002", "tenant_id": "TEN-BALA-HOSP", "title": "Webhook retry pressure elevated", "severity": "medium", "status": "watch", "detail": "Clinical escalation webhook had three retried deliveries today."},
    {"alert_id": "PLAT-ALT-003", "tenant_id": "TEN-GOVSECURE", "title": "Government audit key rotated successfully", "severity": "low", "status": "closed", "detail": "Signature status rotated with no failed audit deliveries."},
)

DOCS: tuple[dict[str, Any], ...] = (
    {"doc_id": "DOC-AUTH", "tenant_id": "TEN-GRAND-MERIDIAN", "title": "Authentication and API keys", "section": "security", "views": 420, "status": "published"},
    {"doc_id": "DOC-WEBHOOKS", "tenant_id": "TEN-BALA-HOSP", "title": "Webhook signatures and retries", "section": "webhooks", "views": 316, "status": "published"},
    {"doc_id": "DOC-SANDBOX", "tenant_id": "TEN-BALA-UNI", "title": "Sandbox incident simulator", "section": "sandbox", "views": 288, "status": "published"},
)

SANDBOX_EVENTS: tuple[dict[str, Any], ...] = (
    {"event_id": "SBX-INCIDENT", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "mock incident.created", "payload": {"type": "fire", "severity": 82, "zone": "Kitchen B"}, "status": "ready"},
    {"event_id": "SBX-WEBHOOK", "tenant_id": "TEN-BALA-HOSP", "name": "mock webhook.delivery_failed", "payload": {"webhook_id": "WH-HOSP-COMMS", "attempts": 3}, "status": "ready"},
    {"event_id": "SBX-ALERT", "tenant_id": "TEN-BALA-UNI", "name": "mock alert.broadcast", "payload": {"channel": "in_app", "audience": "responders"}, "status": "ready"},
)


class PlatformStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "organizations": [],
            "api_keys": [],
            "oauth_apps": [],
            "webhooks": [],
            "deliveries": [],
            "usage_logs": [],
            "rate_limits": [],
            "developers": [],
            "environments": [],
            "sdk_packages": [],
            "alerts": [],
            "docs": [],
            "sandbox_events": [],
            "events": [],
        }

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        seed_groups = {
            "organizations": (ORGANIZATIONS, "tenant_id"),
            "api_keys": (API_KEYS, "key_id"),
            "oauth_apps": (OAUTH_APPS, "app_id"),
            "webhooks": (WEBHOOKS, "webhook_id"),
            "deliveries": (DELIVERIES, "delivery_id"),
            "usage_logs": (USAGE_LOGS, "log_id"),
            "rate_limits": (RATE_LIMITS, "tenant_id"),
            "developers": (DEVELOPERS, "developer_id"),
            "environments": (ENVIRONMENTS, "environment_id"),
            "sdk_packages": (SDK_PACKAGES, "sdk_id"),
            "alerts": (ALERTS, "alert_id"),
            "docs": (DOCS, "doc_id"),
            "sandbox_events": (SANDBOX_EVENTS, "event_id"),
        }
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

    def create_api_key(self, tenant_ids: list[str], payload_data: dict[str, Any]) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            tenant_id = tenant_ids[0]
            key_index = len(payload["api_keys"]) + 1
            key = {
                "key_id": f"KEY-CUSTOM-{key_index:03d}",
                "tenant_id": tenant_id,
                "name": payload_data.get("name") or "New production API key",
                "masked_key": f"sk_{payload_data.get('environment', 'live')}_sentra_********{key_index:04X}",
                "environment": payload_data.get("environment") or "production",
                "scopes": payload_data.get("scopes") or ["incidents:read", "alerts:write"],
                "status": "active",
                "last_used": "never",
                "expires_at": "2026-12-31T00:00:00+00:00",
                "created_by": payload_data.get("actor") or "Platform Admin",
                "requests_today": 0,
                "rate_limit": "5k/min",
                "created_at": utc_now_iso(),
                "updated_at": utc_now_iso(),
            }
            payload["api_keys"].append(key)
            event = self._event(payload, tenant_id, "api_key_created", {"key_id": key["key_id"], "scopes": key["scopes"]})
            self._write(payload)
            return {"api_key": key, "event": event}

    def update_api_key(self, tenant_ids: list[str], key_id: str, action: str) -> dict[str, Any] | None:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            for key in payload["api_keys"]:
                if key["key_id"] != key_id or key["tenant_id"] not in tenant_ids:
                    continue
                if action == "revoke":
                    key["status"] = "revoked"
                elif action == "rotate":
                    key["masked_key"] = f"{str(key['masked_key']).split('********', 1)[0]}********ROT{len(payload['events']) + 1:02d}"
                    key["rotated_at"] = utc_now_iso()
                    key["status"] = "active"
                key["updated_at"] = utc_now_iso()
                event = self._event(payload, key["tenant_id"], f"api_key_{action}", {"key_id": key_id})
                self._write(payload)
                return {"api_key": dict(key), "event": event}
        return None

    def create_app(self, tenant_ids: list[str], payload_data: dict[str, Any]) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            tenant_id = tenant_ids[0]
            app_index = len(payload["oauth_apps"]) + 1
            app = {
                "app_id": f"APP-CUSTOM-{app_index:03d}",
                "tenant_id": tenant_id,
                "name": payload_data.get("name") or "New OAuth integration",
                "client_id": f"sentra_app_custom_{app_index:03d}",
                "environment": payload_data.get("environment") or "sandbox",
                "scopes": payload_data.get("scopes") or ["incidents:read"],
                "redirect_urls": payload_data.get("redirect_urls") or ["https://example.demo/oauth/callback"],
                "status": "active",
                "owner": "Platform Admin",
                "connected_users": 0,
                "last_authorized": "pending",
                "created_at": utc_now_iso(),
                "updated_at": utc_now_iso(),
            }
            payload["oauth_apps"].append(app)
            event = self._event(payload, tenant_id, "oauth_app_created", {"app_id": app["app_id"], "scopes": app["scopes"]})
            self._write(payload)
            return {"app": app, "event": event}

    def update_app(self, tenant_ids: list[str], app_id: str, payload_data: dict[str, Any], action: str = "update") -> dict[str, Any] | None:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            for app in payload["oauth_apps"]:
                if app["app_id"] != app_id or app["tenant_id"] not in tenant_ids:
                    continue
                if action == "revoke":
                    app["status"] = "revoked"
                else:
                    if payload_data.get("name"):
                        app["name"] = payload_data["name"]
                    if payload_data.get("scopes"):
                        app["scopes"] = payload_data["scopes"]
                    if payload_data.get("redirect_urls"):
                        app["redirect_urls"] = payload_data["redirect_urls"]
                app["updated_at"] = utc_now_iso()
                event = self._event(payload, app["tenant_id"], f"oauth_app_{action}", {"app_id": app_id, "scopes": app.get("scopes", [])})
                self._write(payload)
                return {"app": dict(app), "event": event}
        return None

    def create_webhook(self, tenant_ids: list[str], payload_data: dict[str, Any]) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            tenant_id = tenant_ids[0]
            hook_index = len(payload["webhooks"]) + 1
            webhook = {
                "webhook_id": f"WH-CUSTOM-{hook_index:03d}",
                "tenant_id": tenant_id,
                "name": payload_data.get("name") or "New event webhook",
                "endpoint_url": payload_data.get("endpoint_url") or "https://example.demo/sentra/webhook",
                "events": payload_data.get("events") or ["incident.created", "alert.sent"],
                "status": "active",
                "signature_status": "verified",
                "latency_ms": 0,
                "success_rate": 100,
                "retry_count": 0,
                "failures_today": 0,
                "last_delivery": "pending",
                "created_at": utc_now_iso(),
                "updated_at": utc_now_iso(),
            }
            payload["webhooks"].append(webhook)
            event = self._event(payload, tenant_id, "webhook_created", {"webhook_id": webhook["webhook_id"], "events": webhook["events"]})
            self._write(payload)
            return {"webhook": webhook, "event": event}

    def update_webhook(self, tenant_ids: list[str], webhook_id: str, action: str) -> dict[str, Any] | None:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            for webhook in payload["webhooks"]:
                if webhook["webhook_id"] != webhook_id or webhook["tenant_id"] not in tenant_ids:
                    continue
                if action == "disable":
                    webhook["status"] = "disabled"
                elif action == "retry":
                    webhook["retry_count"] = int(webhook.get("retry_count", 0)) + 1
                    webhook["status"] = "active"
                    webhook["last_delivery"] = utc_now_iso()
                    delivery = {
                        "delivery_id": f"DLV-{len(payload['deliveries']) + 1:04d}",
                        "tenant_id": webhook["tenant_id"],
                        "webhook_id": webhook_id,
                        "event": "manual.retry",
                        "status": "delivered",
                        "attempts": webhook["retry_count"],
                        "latency_ms": webhook["latency_ms"],
                        "created_at": utc_now_iso(),
                    }
                    payload["deliveries"].append(delivery)
                elif action == "test":
                    webhook["last_delivery"] = utc_now_iso()
                    webhook["latency_ms"] = max(96, int(webhook.get("latency_ms", 120)) - 12)
                webhook["updated_at"] = utc_now_iso()
                event = self._event(payload, webhook["tenant_id"], f"webhook_{action}", {"webhook_id": webhook_id})
                self._write(payload)
                return {"webhook": dict(webhook), "event": event}
        return None

    def _event(self, payload: dict[str, Any], tenant_id: str, action: str, payload_data: dict[str, Any]) -> dict[str, Any]:
        event = {
            "event_id": f"PLAT-EVT-{len(payload['events']) + 1:05d}",
            "tenant_id": tenant_id,
            "action": action,
            "payload": payload_data,
            "created_at": utc_now_iso(),
            "chain_hash": f"platform-{len(payload['events']) + 1:05d}-{action}",
        }
        payload["events"].append(event)
        return event


platform_store = PlatformStore(settings.sentra_platform_store_path)

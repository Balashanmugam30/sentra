from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.developer.models import (
    WEBHOOK_EVENTS,
    WIDGET_TYPES,
    client_id,
    key_id,
    mask_secret,
    public_token,
    utc_now_iso,
    webhook_id,
    widget_id,
)


class DeveloperStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"api_keys": [], "webhooks": [], "oauth_apps": [], "widgets": [], "deliveries": []}

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
        with self._lock:
            payload = self._read()
            if not payload["api_keys"]:
                payload["api_keys"].append(self._api_key("TEN-BALA-UNI", "Demo Operations API", ["read:incidents", "read:soc", "write:webhooks"], 100_000))
                payload["api_keys"].append(self._api_key("TEN-BALA-MFG", "Manufacturing Telemetry API", ["read:geo", "read:facility"], 80_000))
                created += 2
            if not payload["webhooks"]:
                payload["webhooks"].append(self._webhook("TEN-BALA-UNI", "https://hooks.example.com/sentra", ["incident.created", "alert.critical"]))
                payload["webhooks"].append(self._webhook("TEN-BALA-HOSP", "https://hospital.example.com/sentra", ["success.churn_risk_high", "ai.recommendation_created"]))
            if not payload["oauth_apps"]:
                payload["oauth_apps"].append(self._oauth_app("TEN-BALA-UNI", "Bala Command Portal", "https://bala.example.com/oauth/callback", "admin@sentra.local"))
            if not payload["widgets"]:
                payload["widgets"].append(self._widget("TEN-BALA-UNI", "readiness_meter", "Readiness Meter", ["localhost", "bala.example.com"]))
                payload["widgets"].append(self._widget("TEN-BALA-UNI", "live_incident", "Live Incident Widget", ["localhost", "status.bala.example.com"]))
            self._write(payload)
        return {"created": created}

    def api_keys(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [dict(item) for item in self._read()["api_keys"] if item["tenant_id"] in tenant_ids and item["status"] != "revoked"]

    def create_key(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        record = self._api_key(tenant_id, data["label"], data.get("scopes") or ["read:incidents"], int(data.get("rate_limit") or 60_000))
        with self._lock:
            payload = self._read()
            payload["api_keys"].append(record)
            self._write(payload)
        return record

    def revoke_key(self, tenant_ids: list[str], key_id_value: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            record = next((item for item in payload["api_keys"] if item["tenant_id"] in tenant_ids and item["key_id"] == key_id_value), None)
            if record is None:
                return None
            record["status"] = "revoked"
            self._write(payload)
            return dict(record)

    def webhooks(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [dict(item) for item in self._read()["webhooks"] if item["tenant_id"] in tenant_ids and item["status"] != "deleted"]

    def create_webhook(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        events = [event for event in data.get("events", []) if event in WEBHOOK_EVENTS] or ["incident.created"]
        record = self._webhook(tenant_id, data["endpoint"], events)
        with self._lock:
            payload = self._read()
            payload["webhooks"].append(record)
            self._write(payload)
        return record

    def test_webhook(self, tenant_ids: list[str], webhook_id_value: str | None, event: str) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            record = next((item for item in payload["webhooks"] if item["tenant_id"] in tenant_ids and (webhook_id_value is None or item["webhook_id"] == webhook_id_value)), None)
            if record is None:
                return {"ok": False, "message": "Webhook not found"}
            record["last_delivery"] = utc_now_iso()
            record["failure_count"] = 0
            delivery = {"delivery_id": f"DEL-{len(payload['deliveries']) + 1:05d}", "webhook_id": record["webhook_id"], "event": event if event in WEBHOOK_EVENTS else "alert.critical", "status": "delivered", "latency_ms": 96, "created_at": utc_now_iso()}
            payload["deliveries"].append(delivery)
            self._write(payload)
            return {"ok": True, "message": "Webhook test delivered", "delivery": delivery}

    def delete_webhook(self, tenant_ids: list[str], webhook_id_value: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            record = next((item for item in payload["webhooks"] if item["tenant_id"] in tenant_ids and item["webhook_id"] == webhook_id_value), None)
            if record is None:
                return None
            record["status"] = "deleted"
            self._write(payload)
            return dict(record)

    def oauth_apps(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [dict(item) for item in self._read()["oauth_apps"] if item["tenant_id"] in tenant_ids]

    def register_app(self, tenant_id: str, owner: str, data: dict[str, Any]) -> dict[str, Any]:
        record = self._oauth_app(tenant_id, data["name"], data["redirect_uri"], owner)
        with self._lock:
            payload = self._read()
            payload["oauth_apps"].append(record)
            self._write(payload)
        return record

    def usage(self, tenant_ids: list[str]) -> dict[str, Any]:
        keys = self.api_keys(tenant_ids)
        webhooks = self.webhooks(tenant_ids)
        deliveries = self._deliveries(tenant_ids)
        failed = len([item for item in deliveries if item["status"] != "delivered"])
        top_events: dict[str, int] = {}
        for delivery in deliveries:
            top_events[delivery["event"]] = top_events.get(delivery["event"], 0) + 1
        return {
            "api_calls_month": 24_800 + len(keys) * 6_200,
            "webhook_deliveries": len(deliveries) + len(webhooks) * 240,
            "failed_deliveries": failed,
            "active_keys": len(keys),
            "active_webhooks": len(webhooks),
            "rate_limit_remaining": max(0, sum(int(item["rate_limit"]) for item in keys) - 24_800),
            "top_events": [{"event": key, "count": value} for key, value in sorted(top_events.items(), key=lambda item: item[1], reverse=True)] or [{"event": "incident.created", "count": 180}],
        }

    def docs(self) -> dict[str, Any]:
        return {
            "base_url": "/api",
            "auth": "Bearer API key with scoped tenant permissions",
            "resources": [
                {"name": "Incidents", "path": "/incidents", "scopes": ["read:incidents"]},
                {"name": "SOC", "path": "/soc/live", "scopes": ["read:soc"]},
                {"name": "Marketplace", "path": "/marketplace/apps", "scopes": ["read:marketplace"]},
                {"name": "Webhooks", "path": "/dev/webhooks", "scopes": ["write:webhooks"]},
            ],
            "webhook_events": list(WEBHOOK_EVENTS),
        }

    def sdk(self) -> dict[str, Any]:
        return {
            "sdks": [
                {"language": "TypeScript", "package": "@sentra/sdk", "status": "preview-ready"},
                {"language": "Python", "package": "sentra-sdk", "status": "preview-ready"},
                {"language": "cURL", "package": "OpenAPI snippets", "status": "available"},
            ],
            "quickstart": [
                "Create a tenant-scoped API key.",
                "Subscribe to incident.created and alert.critical webhooks.",
                "Use cached GET endpoints for dashboards and webhook events for realtime changes.",
            ],
        }

    def widgets(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [dict(item) for item in self._read()["widgets"] if item["tenant_id"] in tenant_ids]

    def create_widget(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        widget_type = data.get("widget_type") if data.get("widget_type") in WIDGET_TYPES else "readiness_meter"
        record = self._widget(tenant_id, widget_type, data.get("name") or "Sentra Widget", data.get("allowed_domains") or ["localhost"], data.get("theme") or "dark", int(data.get("refresh_interval") or 30))
        with self._lock:
            payload = self._read()
            payload["widgets"].append(record)
            self._write(payload)
        return record

    def public_widget(self, widget_id_value: str) -> dict[str, Any] | None:
        self.seed_demo()
        with self._lock:
            widget = next((item for item in self._read()["widgets"] if item["widget_id"] == widget_id_value), None)
        if widget is None:
            return None
        return {
            **dict(widget),
            "payload": {
                "title": widget["name"],
                "status": "operational",
                "score": 87,
                "updated_at": utc_now_iso(),
                "summary": "Sentra embedded widget verified and tenant-scoped.",
            },
        }

    def _deliveries(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        with self._lock:
            webhooks = {item["webhook_id"] for item in self._read()["webhooks"] if item["tenant_id"] in tenant_ids}
            return [dict(item) for item in self._read()["deliveries"] if item["webhook_id"] in webhooks]

    def _api_key(self, tenant_id: str, label: str, scopes: list[str], rate_limit: int) -> dict[str, Any]:
        raw_key = f"sk_sentra_{tenant_id.lower().replace('-', '_')}_{key_id().lower()}"
        return {"key_id": key_id(), "tenant_id": tenant_id, "label": label, "masked_key": mask_secret(raw_key), "created_at": utc_now_iso(), "last_used": None, "scopes": scopes, "rate_limit": rate_limit, "status": "active"}

    def _webhook(self, tenant_id: str, endpoint: str, events: list[str]) -> dict[str, Any]:
        return {"webhook_id": webhook_id(), "tenant_id": tenant_id, "endpoint": endpoint, "events": events, "status": "active", "last_delivery": None, "failure_count": 0, "secret_masked": mask_secret(f"whsec_{webhook_id()}"), "created_at": utc_now_iso()}

    def _oauth_app(self, tenant_id: str, name: str, redirect_uri: str, owner: str) -> dict[str, Any]:
        return {"client_id": client_id(), "tenant_id": tenant_id, "name": name, "redirect_uri": redirect_uri, "owner": owner, "status": "active", "created_at": utc_now_iso()}

    def _widget(self, tenant_id: str, widget_type: str, name: str, allowed_domains: list[str], theme: str = "dark", refresh_interval: int = 30) -> dict[str, Any]:
        return {"widget_id": widget_id(), "tenant_id": tenant_id, "widget_type": widget_type, "name": name, "theme": theme, "allowed_domains": allowed_domains, "refresh_interval": refresh_interval, "public_token": public_token(), "created_at": utc_now_iso()}


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        developer_store.seed_demo()
        with developer_store._lock:
            payload = developer_store._read()
            return sorted({item["tenant_id"] for key in ("api_keys", "webhooks", "oauth_apps", "widgets") for item in payload[key]} | {str(tenant["tenant_id"])})
    return [str(tenant["tenant_id"])]


developer_store = DeveloperStore(settings.sentra_developer_store_path)

from __future__ import annotations

from collections import Counter
from statistics import mean
from typing import Any

from app.platform.store import platform_store


def _avg(rows: list[dict[str, Any]], key: str) -> float:
    if not rows:
        return 0.0
    return round(mean(float(row.get(key, 0)) for row in rows), 2)


def _p95(values: list[int]) -> int:
    if not values:
        return 0
    sorted_values = sorted(values)
    index = min(len(sorted_values) - 1, max(0, round(len(sorted_values) * 0.95) - 1))
    return sorted_values[index]


class PlatformService:
    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        developers = platform_store.rows("developers", tenant_ids)
        apps = platform_store.rows("oauth_apps", tenant_ids)
        keys = platform_store.rows("api_keys", tenant_ids)
        webhooks = platform_store.rows("webhooks", tenant_ids)
        docs = platform_store.rows("docs", tenant_ids)
        sdks = platform_store.rows("sdk_packages", tenant_ids)
        alerts = platform_store.rows("alerts", tenant_ids)
        active_keys = [key for key in keys if key["status"] == "active"]
        active_apps = [app for app in apps if app["status"] == "active"]
        active_hooks = [hook for hook in webhooks if hook["status"] == "active"]
        score = round(
            min(100, 38 + len(active_keys) * 6 + len(active_apps) * 7 + len(active_hooks) * 8)
            - len([alert for alert in alerts if alert["status"] == "open"]) * 2
        )
        return {
            "developer_ecosystem_score": max(0, min(100, score)),
            "active_developers": len(developers),
            "apps_created": len(apps),
            "docs_usage": sum(int(doc["views"]) for doc in docs),
            "sdk_downloads": sum(int(sdk["downloads"]) for sdk in sdks),
            "builder_growth_percent": 34,
            "active_api_keys": len(active_keys),
            "webhook_success_rate": round(_avg(webhooks, "success_rate"), 1),
            "sandbox_runs": sum(int(dev["sandbox_runs"]) for dev in developers),
            "alerts": alerts,
            "environments": platform_store.rows("environments", tenant_ids),
            "organizations": platform_store.rows("organizations", tenant_ids),
        }

    def api_keys(self, tenant_ids: list[str]) -> dict[str, Any]:
        keys = platform_store.rows("api_keys", tenant_ids)
        return {
            "keys": keys,
            "active": len([key for key in keys if key["status"] == "active"]),
            "revoked": len([key for key in keys if key["status"] == "revoked"]),
            "environments": dict(Counter(str(key["environment"]) for key in keys)),
            "scope_catalog": sorted({scope for key in keys for scope in key["scopes"]}),
        }

    def create_api_key(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        return platform_store.create_api_key(tenant_ids, payload)

    def update_api_key(self, tenant_ids: list[str], key_id: str, action: str) -> dict[str, Any] | None:
        return platform_store.update_api_key(tenant_ids, key_id, action)

    def apps(self, tenant_ids: list[str]) -> dict[str, Any]:
        apps = platform_store.rows("oauth_apps", tenant_ids)
        return {
            "apps": apps,
            "active": len([app for app in apps if app["status"] == "active"]),
            "security_review": len([app for app in apps if app["status"] == "security_review"]),
            "connected_users": sum(int(app["connected_users"]) for app in apps),
            "scopes": sorted({scope for app in apps for scope in app["scopes"]}),
        }

    def create_app(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        return platform_store.create_app(tenant_ids, payload)

    def update_app(self, tenant_ids: list[str], app_id: str, payload: dict[str, Any], action: str = "update") -> dict[str, Any] | None:
        return platform_store.update_app(tenant_ids, app_id, payload, action)

    def webhooks(self, tenant_ids: list[str]) -> dict[str, Any]:
        hooks = platform_store.rows("webhooks", tenant_ids)
        return {
            "webhooks": hooks,
            "deliveries": platform_store.rows("deliveries", tenant_ids),
            "active": len([hook for hook in hooks if hook["status"] == "active"]),
            "degraded": len([hook for hook in hooks if hook["status"] == "degraded"]),
            "failed_deliveries": sum(int(hook["failures_today"]) for hook in hooks),
            "avg_latency_ms": round(_avg(hooks, "latency_ms")),
            "signature_verified": len([hook for hook in hooks if hook["signature_status"] in {"verified", "rotated"}]),
        }

    def create_webhook(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        return platform_store.create_webhook(tenant_ids, payload)

    def update_webhook(self, tenant_ids: list[str], webhook_id: str, action: str) -> dict[str, Any] | None:
        return platform_store.update_webhook(tenant_ids, webhook_id, action)

    def usage(self, tenant_ids: list[str]) -> dict[str, Any]:
        logs = platform_store.rows("usage_logs", tenant_ids)
        organizations = {org["tenant_id"]: org["name"] for org in platform_store.rows("organizations", tenant_ids)}
        total_requests = sum(int(row["requests"]) for row in logs)
        error_requests = sum(int(row["requests"]) for row in logs if int(row["status"]) >= 400)
        by_endpoint: Counter[str] = Counter()
        by_tenant: Counter[str] = Counter()
        for row in logs:
            by_endpoint[str(row["endpoint"])] += int(row["requests"])
            by_tenant[organizations.get(str(row["tenant_id"]), str(row["tenant_id"]))] += int(row["requests"])
        return {
            "daily_requests": total_requests,
            "monthly_requests": total_requests * 28,
            "top_endpoints": [{"endpoint": endpoint, "requests": requests} for endpoint, requests in by_endpoint.most_common(6)],
            "top_customers": [{"name": name, "requests": requests} for name, requests in by_tenant.most_common(6)],
            "error_percent": round((error_requests / max(1, total_requests)) * 100, 2),
            "avg_latency_ms": round(_avg(logs, "latency_ms")),
            "p95_latency_ms": _p95([int(row["latency_ms"]) for row in logs]),
            "revenue_potential": 184_000,
            "upgrade_suggestions": [
                "Campus API usage is near Growth plan cap; recommend Enterprise burst add-on.",
                "Hospital webhook retries justify regulated integration support tier.",
                "Government audit mirror is a candidate for sovereign API package.",
            ],
            "logs": logs,
        }

    def rate_limits(self, tenant_ids: list[str]) -> dict[str, Any]:
        limits = platform_store.rows("rate_limits", tenant_ids)
        return {
            "limits": limits,
            "blocked_requests": sum(int(row["blocked_requests"]) for row in limits),
            "average_usage_percent": round(_avg(limits, "usage_percent")),
            "abuse_watch": [row for row in limits if int(row["abuse_score"]) >= 15 or row["status"] != "healthy"],
        }

    def logs(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {
            "usage_logs": platform_store.rows("usage_logs", tenant_ids),
            "audit_events": platform_store.rows("events", tenant_ids),
            "deliveries": platform_store.rows("deliveries", tenant_ids),
        }

    def sdks(self, tenant_ids: list[str]) -> dict[str, Any]:
        packages = platform_store.rows("sdk_packages", tenant_ids)
        return {
            "packages": packages,
            "total_downloads": sum(int(package["downloads"]) for package in packages),
            "ready_languages": sorted({package["language"] for package in packages if package["status"] in {"ready", "docs_ready", "sandbox_ready"}}),
            "rest_examples": [package for package in packages if package["language"] == "OpenAPI"],
        }

    def docs(self, tenant_ids: list[str]) -> dict[str, Any]:
        docs = platform_store.rows("docs", tenant_ids)
        return {
            "docs": docs,
            "published": len([doc for doc in docs if doc["status"] == "published"]),
            "views": sum(int(doc["views"]) for doc in docs),
            "openapi_ready": True,
            "sections": dict(Counter(str(doc["section"]) for doc in docs)),
        }

    def sandbox(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {
            "events": platform_store.rows("sandbox_events", tenant_ids),
            "test_keys_enabled": True,
            "fake_events_enabled": True,
            "mock_incidents": ["fire", "gas_leak", "panic", "webhook_failure"],
            "payload_generator": "deterministic",
            "safe_mode": True,
        }


platform_service = PlatformService()


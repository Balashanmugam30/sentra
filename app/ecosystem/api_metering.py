from __future__ import annotations


def api_usage_snapshot(tenant_id: str) -> dict[str, object]:
    return {
        "tenant_id": tenant_id,
        "requests_day": 2_400_000,
        "webhook_events_day": 860_000,
        "avg_latency_ms": 118,
        "p95_latency_ms": 242,
        "rate_limit_blocks": 128,
        "top_api_customers": ["Bala University", "GovSecure South", "Metro Campus Group", "Titan Industrial"],
        "usage_revenue_mrr": 72_000,
    }


def developer_metrics(tenant_id: str) -> dict[str, object]:
    return {
        "tenant_id": tenant_id,
        "api_keys": 86,
        "oauth_apps": 34,
        "sandbox_tenants": 112,
        "developers_active": 1_420,
        "sdk_downloads": 8_900,
        "docs_score": 94,
    }

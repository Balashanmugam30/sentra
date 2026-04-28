from __future__ import annotations

from statistics import mean
from typing import Any

from app.launchcore.store import launch_store


def _avg(rows: list[dict[str, Any]], key: str) -> int:
    if not rows:
        return 0
    return round(mean(float(row.get(key, 0)) for row in rows))


class LaunchService:
    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        readiness = self.readiness(tenant_ids)
        performance = self.performance(tenant_ids)
        quality = self.quality(tenant_ids)
        return {
            "launch_score": readiness["launch_score"],
            "status": "launch_ready",
            "positioning": "Production-ready crisis intelligence operating system",
            "readiness": readiness,
            "performance_score": performance["performance_score"],
            "quality_score": quality["quality_score"],
            "design_score": _avg(launch_store.rows("design_audits", tenant_ids), "score"),
            "design_audits": launch_store.rows("design_audits", tenant_ids),
            "top_actions": launch_store.rows("executive_actions", tenant_ids),
            "preferences": launch_store.rows("preferences", tenant_ids),
            "launch_language": [
                "Trust-first enterprise command platform.",
                "Built for hospitals, hotels, campuses, malls, factories, smart cities, and government pilots.",
                "AI, operations, security, digital twin, data, and demo layers are integrated into one flagship experience.",
            ],
        }

    def performance(self, tenant_ids: list[str]) -> dict[str, Any]:
        routes = launch_store.rows("performance_routes", tenant_ids)
        avg_p95 = _avg(routes, "p95_ms")
        return {
            "performance_score": 94,
            "avg_route_p95_ms": avg_p95,
            "routes": routes,
            "slow_components": [
                {"name": "Twin live canvas", "cost_ms": 72, "fix": "lazy render overlays and keep executive mini mode on tablets"},
                {"name": "SOC incident table", "cost_ms": 38, "fix": "virtualize long evidence rows"},
                {"name": "Investor forecast chart", "cost_ms": 31, "fix": "memoize scenario series"},
            ],
            "api_latency": {"p50_ms": 86, "p95_ms": 224, "error_rate": 0.3},
            "cache": {"hit_ratio": 91, "dedupe_saves_today": 18420, "stale_while_revalidate": True},
            "websocket": {"connected_clients": 14, "health_percent": 98, "reconnects_today": 2},
            "hydration": {"average_ms": 410, "largest_route_ms": 690, "status": "healthy"},
            "optimizations": ["route chunk splitting", "request dedupe", "manual refresh for launch pages", "runtime cache hot paths", "fallback cards"],
        }

    def quality(self, tenant_ids: list[str]) -> dict[str, Any]:
        checks = launch_store.rows("quality_checks", tenant_ids)
        open_count = sum(int(row["count"]) for row in checks if row["status"] != "pass")
        return {
            "quality_score": 93,
            "open_items": open_count,
            "checks": checks,
            "scanner": {
                "routes_scanned": 116,
                "broken_routes": 0,
                "console_errors": 1,
                "failed_apis": 0,
                "auth_loops": 0,
                "type_mismatches": 0,
            },
            "degraded_mode": "friendly fallback cards active across launch dashboards",
        }

    def readiness(self, tenant_ids: list[str]) -> dict[str, Any]:
        dimensions = launch_store.rows("readiness", tenant_ids)
        return {
            "launch_score": _avg(dimensions, "score"),
            "dimensions": dimensions,
            "feature_completeness": 98,
            "route_coverage": 94,
            "trust_readiness": 93,
            "compliance_readiness": 92,
            "investor_readiness": 95,
            "demo_readiness": 97,
            "submission_readiness": 94,
            "recommendation": "Ship as a polished enterprise demo and keep final customer pilots in approval-required autonomy mode.",
        }

    def executive(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {
            "readiness_score": self.readiness(tenant_ids)["launch_score"],
            "arr": 4_800_000,
            "trust_score": 94,
            "global_health": 96,
            "top_threats": [
                {"title": "Tablet density on twin-heavy pages", "severity": "watch", "owner": "product"},
                {"title": "Third-party map warning in local mode", "severity": "low", "owner": "platform"},
                {"title": "Enterprise pilot evidence pack needs final branding pass", "severity": "watch", "owner": "go-to-market"},
            ],
            "top_next_actions": launch_store.rows("executive_actions", tenant_ids),
            "board_summary": [
                "Sentra is feature-complete across AI, operations, security, digital twin, revenue, data, and integrations.",
                "Launch readiness is strong enough for investor, judge, and enterprise demos.",
                "Primary residual risk is presentation polish on dense field-command layouts.",
            ],
            "export_cta": {"label": "Export launch board pack", "status": "ready", "format": "PDF mock"},
        }

    def ops(self, tenant_ids: list[str]) -> dict[str, Any]:
        signals = launch_store.rows("ops_signals", tenant_ids)
        return {
            "ops_score": 95,
            "live_errors": 1,
            "uptime_percent": 99.96,
            "background_jobs": 18,
            "queue_depth": 27,
            "retries_today": 8,
            "degraded_services": ["ServiceNow connector watch"],
            "signals": signals,
            "alert_history": [
                {"alert_id": "AL-LAUNCH-001", "title": "ServiceNow retry queue entered watch", "status": "contained", "severity": "medium"},
                {"alert_id": "AL-LAUNCH-002", "title": "Twin overlay render budget exceeded tablet threshold", "status": "watch", "severity": "low"},
                {"alert_id": "AL-LAUNCH-003", "title": "Cache hit ratio recovered above launch target", "status": "resolved", "severity": "low"},
            ],
        }

    def scan(self, tenant_id: str, target: str) -> dict[str, Any]:
        return launch_store.record_scan(tenant_id, target)

    def optimize(self, tenant_id: str, target: str) -> dict[str, Any]:
        return launch_store.record_optimize(tenant_id, target)


launch_service = LaunchService()

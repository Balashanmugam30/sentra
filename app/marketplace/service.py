from __future__ import annotations

from collections import Counter
from statistics import mean
from typing import Any

from app.marketplace.recommendations import build_marketplace_recommendations
from app.marketplace.store import DEMO_TENANTS, marketplace_store, tenant_scope


def _avg(rows: list[dict[str, Any]], key: str) -> float:
    if not rows:
        return 0.0
    return round(mean(float(row.get(key, 0)) for row in rows), 2)


class MarketplaceService:
    def recommendations(self, tenant_ids: list[str], tenant: dict[str, object]) -> list[dict[str, Any]]:
        return build_marketplace_recommendations(installed=marketplace_store.list_installed(tenant_ids), tenant=tenant)

    def metrics(self, tenant_ids: list[str] | None = None) -> dict[str, Any]:
        installs = marketplace_store.list_all_installations()
        if tenant_ids is not None:
            installs = [item for item in installs if item["tenant_id"] in tenant_ids]
        active = [item for item in installs if item["status"] == "connected" and item.get("enabled", True)]
        marketplace_mrr = sum(int(item.get("billing_addon_value") or 0) for item in active)
        top_counts: dict[str, dict[str, Any]] = {}
        for item in active:
            bucket = top_counts.setdefault(item["app_id"], {"app_id": item["app_id"], "name": item["app_name"], "mrr": 0, "installs": 0})
            bucket["mrr"] += int(item.get("billing_addon_value") or 0)
            bucket["installs"] += 1
        tenant_count = max(1, len({item["tenant_id"] for item in installs}))
        return {
            "marketplace_mrr": marketplace_mrr,
            "addon_arr": marketplace_mrr * 12,
            "avg_apps_per_tenant": round(len(active) / tenant_count, 1),
            "top_paid_apps": sorted(top_counts.values(), key=lambda item: item["mrr"], reverse=True)[:6],
            "conversion_rate": 37,
            "trial_to_paid_rate": 62,
            "partner_revenue": round(marketplace_mrr * 0.22),
            "install_count": len(installs),
            "active_integrations": len(active),
            "expansion_revenue": round(marketplace_mrr * 0.34),
        }

    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(None if set(tenant_ids) == set(DEMO_TENANTS) else tenant_ids)
        apps = marketplace_store.list_apps()
        installs = marketplace_store.list_installed(tenant_ids)
        trials = marketplace_store.rows("trials", tenant_ids)
        reviews = marketplace_store.rows("reviews", tenant_ids)
        security = marketplace_store.rows("security_approvals", tenant_ids)
        network_score = round(
            min(100, 42 + metrics["avg_apps_per_tenant"] * 8 + len(marketplace_store.rows("partners", tenant_ids)) * 4)
        )
        return {
            "marketplace_arr": metrics["addon_arr"],
            "addon_mrr": metrics["marketplace_mrr"],
            "take_rate": 22,
            "network_effect_score": network_score,
            "install_count": len(installs),
            "active_integrations": metrics["active_integrations"],
            "featured_count": len([app for app in apps if app["featured"]]),
            "certified_count": len([app for app in apps if app["security_verified"] and app["enterprise_ready"]]),
            "trial_conversion_rate": metrics["trial_to_paid_rate"],
            "active_trials": len([trial for trial in trials if trial["stage"] != "converted"]),
            "average_rating": round(_avg(reviews, "rating"), 1),
            "security_approved": len([item for item in security if item["status"] == "approved"]),
            "failed_sync_alerts": marketplace_store.rows("failed_sync_alerts", tenant_ids),
            "recommended_apps": marketplace_store.trending()[:5],
        }

    def vendors(self, tenant_ids: list[str]) -> dict[str, Any]:
        vendors = marketplace_store.rows("vendors", tenant_ids)
        return {
            "vendors": vendors,
            "average_support_score": round(_avg(vendors, "support_score")),
            "revenue_generated": sum(int(vendor["revenue_generated"]) for vendor in vendors),
            "certified_vendors": len([vendor for vendor in vendors if "verified" in str(vendor["certification_badge"])]),
            "categories": dict(Counter(str(vendor["category"]) for vendor in vendors)),
        }

    def partners(self, tenant_ids: list[str]) -> dict[str, Any]:
        partners = marketplace_store.rows("partners", tenant_ids)
        return {
            "partners": partners,
            "co_sell_pipeline": sum(int(partner["co_sell_pipeline"]) for partner in partners),
            "certified_consultants": sum(int(partner["certified_consultants"]) for partner in partners),
            "average_partner_score": round(_avg(partners, "partner_score")),
            "types": dict(Counter(str(partner["type"]) for partner in partners)),
        }

    def revenue(self, tenant_ids: list[str]) -> dict[str, Any]:
        shares = marketplace_store.rows("revenue_share", tenant_ids)
        addons = marketplace_store.rows("billing_addons", tenant_ids)
        trials = marketplace_store.rows("trials", tenant_ids)
        gross_mrr = sum(int(share["gross_mrr"]) for share in shares)
        sentra_revenue = sum(int(share["sentra_revenue"]) for share in shares)
        return {
            "addon_mrr": sum(int(addon["mrr"]) for addon in addons),
            "marketplace_arr": gross_mrr * 12,
            "take_rate": round((sentra_revenue / max(1, gross_mrr)) * 100),
            "partner_payouts": sum(int(share["partner_payout"]) for share in shares),
            "sentra_revenue": sentra_revenue,
            "revenue_share": shares,
            "billing_addons": addons,
            "trials": trials,
            "trial_conversion_rate": round(_avg(trials, "conversion_probability")),
            "top_grossing": sorted(shares, key=lambda row: int(row["gross_mrr"]), reverse=True),
        }

    def reviews(self, tenant_ids: list[str]) -> dict[str, Any]:
        reviews = marketplace_store.rows("reviews", tenant_ids)
        return {
            "reviews": reviews,
            "average_rating": round(_avg(reviews, "rating"), 1),
            "review_count": len(reviews),
            "rating_distribution": dict(Counter(str(review["rating"]) for review in reviews)),
        }

    def security(self, tenant_ids: list[str]) -> dict[str, Any]:
        approvals = marketplace_store.rows("security_approvals", tenant_ids)
        return {
            "approvals": approvals,
            "average_trust_score": round(_avg(approvals, "trust_score")),
            "average_permission_risk": round(_avg(approvals, "permission_risk")),
            "approved": len([approval for approval in approvals if approval["status"] == "approved"]),
            "pending": len([approval for approval in approvals if approval["status"] != "approved"]),
            "data_classes": sorted({str(approval["data_access_class"]) for approval in approvals}),
        }

    def automation_templates(self, tenant_ids: list[str]) -> dict[str, Any]:
        templates = marketplace_store.rows("automation_templates", tenant_ids)
        return {
            "templates": templates,
            "providers": dict(Counter(str(template["provider"]) for template in templates)),
            "total_installs": sum(int(template["installs"]) for template in templates),
            "average_success_rate": round(_avg(templates, "success_rate")),
        }


marketplace_service = MarketplaceService()


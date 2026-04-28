from __future__ import annotations

from collections import Counter
from statistics import mean
from typing import Any

from app.channel.store import channel_store


def _sum(rows: list[dict[str, Any]], key: str) -> int:
    return sum(int(row.get(key) or 0) for row in rows)


def _avg(rows: list[dict[str, Any]], key: str) -> int:
    if not rows:
        return 0
    return round(mean(float(row.get(key, 0)) for row in rows))


class ChannelService:
    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        partners = channel_store.rows("partners", tenant_ids)
        resellers = channel_store.rows("resellers", tenant_ids)
        brands = channel_store.rows("white_label_brands", tenant_ids)
        oems = channel_store.rows("oem_contracts", tenant_ids)
        countries = channel_store.rows("countries", tenant_ids)
        revenue = channel_store.rows("partner_revenue", tenant_ids)
        pipeline = channel_store.rows("regional_pipelines", tenant_ids)
        scorecards = channel_store.rows("expansion_scorecards", tenant_ids)
        blocked = channel_store.rows("blocked_countries", tenant_ids)
        partner_arr = _sum(revenue, "arr")
        licensing_arr = _sum(brands, "licensing_arr")
        oem_commitment = _sum(oems, "annual_commitment")
        weighted_pipeline = _sum(pipeline, "weighted_arr")
        score = min(100, round((_avg(partners, "score") * 0.32) + (_avg(countries, "readiness_score") * 0.28) + 35 - len(blocked) * 2))
        next_country = max(countries, key=lambda row: int(row["readiness_score"]), default={})
        return {
            "channel_score": max(0, score),
            "partner_arr": partner_arr,
            "white_label_arr": licensing_arr,
            "oem_commitment": oem_commitment,
            "weighted_pipeline": weighted_pipeline,
            "active_partners": len([row for row in partners if row["status"] == "active"]),
            "reseller_mrr": _sum(resellers, "mrr"),
            "countries_ready": len([row for row in countries if row["status"] in {"launch_ready", "live", "launched"}]),
            "next_best_country": next_country.get("name", "UAE"),
            "launch_readiness_average": _avg(countries, "readiness_score"),
            "blocked_countries": blocked,
            "strategic_ai": [
                "Launch UAE sovereign pilot before USA motion; pricing fit and procurement readiness are strongest.",
                "Upgrade Singapore GovTech Partner to Diamond after reference architecture is complete.",
                "India channel can scale fastest if implementation academy capacity increases by 20%.",
            ],
            "scorecards": scorecards,
        }

    def partners(self, tenant_ids: list[str]) -> dict[str, Any]:
        partners = channel_store.rows("partners", tenant_ids)
        return {
            "partners": partners,
            "tiers": channel_store.rows("partner_tiers", tenant_ids),
            "franchise_operators": channel_store.rows("franchise_operators", tenant_ids),
            "active": len([row for row in partners if row["status"] == "active"]),
            "pipeline_arr": _sum(partners, "pipeline_arr"),
            "coverage_countries": sorted({country for row in partners for country in row.get("countries", [])}),
            "coverage_gaps": ["Australia emergency-services integrator", "USA state procurement reseller", "Saudi data residency counsel"],
        }

    def resellers(self, tenant_ids: list[str]) -> dict[str, Any]:
        resellers = channel_store.rows("resellers", tenant_ids)
        return {
            "resellers": resellers,
            "reseller_mrr": _sum(resellers, "mrr"),
            "commission_due": _sum(resellers, "commission_due"),
            "open_deals": _sum(resellers, "open_deals"),
            "tiers": dict(Counter(str(row["tier"]) for row in resellers)),
        }

    def whitelabel(self, tenant_ids: list[str]) -> dict[str, Any]:
        brands = channel_store.rows("white_label_brands", tenant_ids)
        return {
            "brands": brands,
            "active_brands": len([row for row in brands if row["status"] == "live"]),
            "licensing_arr": _sum(brands, "licensing_arr"),
            "license_seats": _sum(brands, "license_seats"),
            "language_packs": sorted({language for row in brands for language in row.get("language_packs", [])}),
        }

    def oem(self, tenant_ids: list[str]) -> dict[str, Any]:
        contracts = channel_store.rows("oem_contracts", tenant_ids)
        return {
            "contracts": contracts,
            "annual_commitment": _sum(contracts, "annual_commitment"),
            "seats": _sum(contracts, "seats"),
            "api_embedded_usage": _sum(contracts, "api_embedded_usage"),
            "active": len([row for row in contracts if row["status"] == "active"]),
        }

    def countries(self, tenant_ids: list[str]) -> dict[str, Any]:
        countries = channel_store.rows("countries", tenant_ids)
        return {
            "countries": countries,
            "blocked": channel_store.rows("blocked_countries", tenant_ids),
            "legal_readiness": channel_store.rows("legal_readiness", tenant_ids),
            "average_readiness": _avg(countries, "readiness_score"),
            "next_launch": sorted(countries, key=lambda row: int(row["readiness_score"]), reverse=True)[:3],
        }

    def revenue(self, tenant_ids: list[str]) -> dict[str, Any]:
        revenue = channel_store.rows("partner_revenue", tenant_ids)
        commissions = channel_store.rows("commissions", tenant_ids)
        return {
            "partner_revenue": revenue,
            "commissions": commissions,
            "partner_arr": _sum(revenue, "arr"),
            "partner_mrr": _sum(revenue, "mrr"),
            "commission_due": _sum([row for row in commissions if row["status"] != "paid"], "amount"),
            "forecast_arr": _sum(revenue, "forecast_arr"),
            "regional_winners": sorted(revenue, key=lambda row: int(row["forecast_arr"]), reverse=True)[:4],
        }

    def pipeline(self, tenant_ids: list[str]) -> dict[str, Any]:
        pipeline = channel_store.rows("regional_pipelines", tenant_ids)
        return {
            "pipeline": pipeline,
            "weighted_forecast": _sum(pipeline, "weighted_arr"),
            "stage_mix": dict(Counter(str(row["stage"]) for row in pipeline)),
            "high_probability": [row for row in pipeline if int(row["probability"]) >= 60],
        }

    def certifications(self, tenant_ids: list[str]) -> dict[str, Any]:
        certs = channel_store.rows("certifications", tenant_ids)
        return {
            "certifications": certs,
            "trained_staff": _sum(certs, "trained_staff"),
            "active": len([row for row in certs if row["status"] == "active"]),
            "average_score": _avg(certs, "score"),
        }

    def pricing(self, tenant_ids: list[str]) -> dict[str, Any]:
        pricing = channel_store.rows("pricing_by_region", tenant_ids)
        return {
            "pricing": pricing,
            "legal_readiness": channel_store.rows("legal_readiness", tenant_ids),
            "average_pricing_fit": _avg(pricing, "pricing_fit"),
            "approved_regions": len([row for row in pricing if row["status"] == "approved"]),
        }


channel_service = ChannelService()


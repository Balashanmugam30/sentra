from __future__ import annotations

from typing import Any


def network_effects_snapshot(apps: list[dict[str, Any]], partners: list[dict[str, Any]]) -> dict[str, object]:
    active_apps = len([app for app in apps if app.get("status") == "connected"])
    partner_count = sum(int(partner["active_partners"]) for partner in partners)
    return {
        "invites_caused_by_customers": 18_400,
        "apps_causing_retention": max(44, active_apps),
        "partners_causing_deals": partner_count,
        "usage_causing_expansion": 72_000,
        "community_referrals": 4_820,
        "moat_score": 95,
        "expansion_score": 93,
        "flywheel": [
            "customers export command reports",
            "executives invite peer agencies",
            "partners attach integrations",
            "developers build widgets",
            "usage expands seats and API tier",
        ],
    }


def ecosystem_simulation() -> dict[str, object]:
    return {
        "scenario": "partner_app_store_flywheel",
        "projected_marketplace_arr": 2_640_000,
        "projected_partner_arr": 4_180_000,
        "projected_api_mrr": 104_000,
        "moat_score_after": 97,
        "top_growth_loop": "integration install -> embedded report -> partner referral",
    }

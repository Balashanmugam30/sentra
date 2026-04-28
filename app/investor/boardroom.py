from __future__ import annotations

from typing import Any


def build_boardroom(metrics: dict[str, Any], readiness: dict[str, Any], valuation: dict[str, Any]) -> dict[str, Any]:
    return {
        "month": "April 2026",
        "what_changed": [
            "Marketplace, growth OS, customer success, and investor OS are live in one command platform.",
            "Expansion pipeline normalized to $18.4M with UAE as the next flagship market.",
            "NRR and AI/GovTech moat support premium valuation range.",
        ],
        "wins": ["$4.8M ARR base", "129% NRR", "30 months runway", "91 expansion score"],
        "risks": ["SOC2 completion timing", "Government procurement cycles", "Founder-led enterprise sales concentration"],
        "cash_position": metrics["cash_on_hand"],
        "growth_metrics": {"YoY_growth_percent": metrics["YoY_growth_percent"], "rule_of_40": metrics["rule_of_40"], "burn_multiple": metrics["burn_multiple"]},
        "churn_movement": "Stable and below enterprise SaaS risk threshold.",
        "product_launches": ["Autonomous AI Core", "Marketplace", "Growth OS", "Investor OS"],
        "security_trust_score": 94,
        "global_expansion_status": "UAE and Singapore pilot-ready; India launched; US high-ticket pipeline.",
        "hiring_progress": "Engineering hiring paused until Series A; GTM hires prioritized for UAE/Germany.",
        "top_asks": ["Approve Series A outreach", "Prioritize SOC2 readiness", "Open UAE strategic partner motion"],
        "board_pack_status": "export_ready",
        "valuation_range": {
            "conservative": valuation["conservative_valuation"],
            "base": valuation["base_valuation"],
            "aggressive": valuation["aggressive_valuation"],
        },
        "readiness_score": readiness["score"],
    }


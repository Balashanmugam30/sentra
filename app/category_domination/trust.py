from __future__ import annotations

from app.category_domination.models import CATEGORY_METRICS


def brand_authority() -> dict[str, object]:
    return {
        "mentions_month": CATEGORY_METRICS["brand_mentions_month"],
        "positive_sentiment": CATEGORY_METRICS["positive_sentiment"],
        "thought_leadership_score": 89,
        "social_authority": 84,
        "press_velocity": 37,
        "influence_graph": [
            {"node": "Government CIOs", "influence": 92},
            {"node": "Campus Safety Leaders", "influence": 88},
            {"node": "Critical Infrastructure Operators", "influence": 86},
            {"node": "Enterprise Risk Boards", "influence": 91},
            {"node": "AI Safety Analysts", "influence": 83},
        ],
    }


def customer_trust() -> dict[str, object]:
    return {
        "logos_won": CATEGORY_METRICS["enterprise_wins"],
        "testimonials": [
            "Sentra gave our board one operating picture across risk, revenue, and resilience.",
            "The crisis simulations moved us from reactive drills to predictive command readiness.",
            "No other platform connected government-grade response with SaaS operating discipline.",
        ],
        "nps": CATEGORY_METRICS["nps"],
        "uptime_trust": 99.94,
        "renewal_confidence": CATEGORY_METRICS["renewal_confidence"],
        "retention_quality": "enterprise-grade",
    }


def government_trust() -> dict[str, object]:
    return {
        "gov_shortlists": CATEGORY_METRICS["gov_shortlists"],
        "procurement_readiness": 92,
        "compliance_trust": 91,
        "sovereign_fit": 94,
        "defense_suitability": 89,
        "badges": ["Audit Hardened", "Sovereign Ready", "Multi-Agency", "Critical Infrastructure", "RBAC Verified"],
    }


def enterprise_wins() -> dict[str, object]:
    return {
        "enterprise_wins": CATEGORY_METRICS["enterprise_wins"],
        "pipeline_quality": 88,
        "average_contract_value": 214_000,
        "replacement_deals": 19,
        "multi_module_attach_rate": 76,
        "top_verticals": ["Universities", "Hospitals", "Manufacturing", "Government", "Airports"],
    }


from __future__ import annotations

from app.monopoly_expansion.models import COUNTRY_CONQUEST, MONOPOLY_METRICS


def global_conquest() -> dict[str, object]:
    return {
        "countries_active": MONOPOLY_METRICS["countries_active"],
        "regions_controlled": MONOPOLY_METRICS["regions_controlled"],
        "country_map": COUNTRY_CONQUEST,
        "next_best_country": "Saudi Arabia",
        "expansion_strategy": "enter through sovereign cloud partners, then expand into airports, smart city, and critical infrastructure buyers",
    }


def procurement_default() -> dict[str, object]:
    return {
        "rfp_invites": 146,
        "preferred_vendor_rate": MONOPOLY_METRICS["rfp_preferred_vendor_rate"],
        "repeat_bids": 58,
        "referenceability": 88,
        "default_procurement_motion": "platform benchmark plus sovereign trust packet",
        "shortlist_dominance": [
            {"segment": "Universities", "preferred_rate": 68},
            {"segment": "Hospitals", "preferred_rate": 61},
            {"segment": "Government", "preferred_rate": 57},
            {"segment": "Industrial Campuses", "preferred_rate": 66},
            {"segment": "Airports", "preferred_rate": 59},
        ],
    }


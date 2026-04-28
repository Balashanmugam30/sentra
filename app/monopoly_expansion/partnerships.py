from __future__ import annotations

from app.monopoly_expansion.models import STRATEGIC_PARTNERS


def strategic_partnerships() -> list[dict[str, object]]:
    return STRATEGIC_PARTNERS


def channel_domination() -> dict[str, object]:
    return {
        "reseller_revenue": 8_400_000,
        "partner_coverage": 71,
        "procurement_pipeline": 24_600_000,
        "regional_distributors": 36,
        "coverage_map": [
            {"region": "North America", "coverage": 78, "top_partner": "AWS GovCloud"},
            {"region": "India", "coverage": 84, "top_partner": "Deloitte Risk"},
            {"region": "Middle East", "coverage": 72, "top_partner": "Azure Sovereign"},
            {"region": "Europe", "coverage": 61, "top_partner": "Accenture Federal"},
            {"region": "SEA", "coverage": 69, "top_partner": "Google Public Sector"},
        ],
    }


def activate_partnership() -> dict[str, object]:
    return {
        "partner": "Azure Sovereign",
        "status": "activated",
        "pipeline_added": 3_200_000,
        "procurement_lift": 9,
        "next_step": "launch sovereign co-sell motion for government command centers",
    }


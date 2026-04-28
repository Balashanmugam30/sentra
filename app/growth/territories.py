from __future__ import annotations

from typing import Any


TERRITORY_BLUEPRINTS: tuple[tuple[str, str, str, str, int], ...] = (
    ("India South", "India", "University Network", "Bengaluru / Chennai / Coimbatore", 94),
    ("UAE Enterprise", "UAE", "Smart City", "Dubai / Abu Dhabi", 96),
    ("Germany Public Sector", "Germany", "Government Security Grid", "Berlin / Munich", 86),
    ("US Healthcare", "USA", "Hospital Group", "New York / Texas / California", 93),
    ("UK Universities", "UK", "University Network", "London / Manchester", 84),
    ("Singapore Government", "Singapore", "Government Security Grid", "Singapore", 91),
)


def build_territories(tenant_id: str, countries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    country_by_name = {country["name"]: country for country in countries}
    territories = []
    for index, (name, country_name, vertical, cities, score) in enumerate(TERRITORY_BLUEPRINTS, start=1):
        country = country_by_name.get(country_name, {})
        territories.append(
            {
                "territory_id": f"TER-{tenant_id}-{index:02d}",
                "tenant_id": tenant_id,
                "name": name,
                "country": country_name,
                "vertical_focus": vertical,
                "cities": cities,
                "ARR_potential": round(int(country.get("ARR_potential", 1_000_000)) * (score / 100) * 0.42),
                "pipeline_arr": round(int(country.get("ARR_potential", 1_000_000)) * (score / 100) * 0.18),
                "owner": "Global Expansion",
                "score": score,
                "coverage_status": "covered" if score >= 90 else "partner-led",
            }
        )
    return territories


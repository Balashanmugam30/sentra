"""Earth digital twin deterministic model."""

from __future__ import annotations

from typing import Any

from .models import WorldMetrics

COUNTRIES = [
    "India",
    "United States",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Singapore",
    "United Arab Emirates",
    "Saudi Arabia",
    "Australia",
    "Canada",
    "Brazil",
    "South Africa",
    "Kenya",
    "Nigeria",
    "Egypt",
    "Israel",
    "Turkey",
    "Indonesia",
    "Malaysia",
    "Thailand",
    "Vietnam",
    "South Korea",
    "China",
    "Italy",
    "Spain",
    "Netherlands",
    "Sweden",
    "Norway",
    "Finland",
    "Poland",
    "Ukraine",
    "Mexico",
    "Argentina",
    "Chile",
    "Colombia",
    "Peru",
    "New Zealand",
    "Philippines",
    "Bangladesh",
    "Sri Lanka",
    "Qatar",
    "Oman",
    "Jordan",
    "Morocco",
    "Ghana",
    "Ethiopia",
    "Rwanda",
    "Switzerland",
    "Ireland",
    "Denmark",
    "Belgium",
]

REGIONS = ["North America", "Europe", "Middle East", "South Asia", "SEA", "Africa", "Australia"]


def build_countries(metrics: WorldMetrics) -> dict[str, Any]:
    countries = []
    for index, country in enumerate(COUNTRIES):
        stability = max(42, min(98, 88 - (index % 9) * 3 + (index % 5)))
        growth = max(38, min(96, 74 + (index * 7) % 21))
        readiness = max(45, min(97, 82 - (index % 7) * 2 + (index % 3)))
        cyber = max(48, min(99, 80 + (index * 5) % 18 - (index % 4)))
        logistics = max(44, min(97, 78 + (index * 3) % 19 - (index % 6)))
        diplomatic = max(35, min(96, 84 - (index % 8) * 4 + (index % 2) * 3))
        countries.append(
            {
                "country": country,
                "region": REGIONS[index % len(REGIONS)],
                "stability_score": stability,
                "growth_score": growth,
                "disaster_readiness": readiness,
                "cyber_defense": cyber,
                "logistics_strength": logistics,
                "diplomatic_risk": 100 - diplomatic,
                "status": "watch" if stability < 68 else "stable" if stability < 86 else "strong",
            }
        )
    return {"countries_live": metrics.countries_live, "countries": countries}


def build_earth_twin(metrics: WorldMetrics) -> dict[str, Any]:
    countries = build_countries(metrics)["countries"]
    return {
        "countries_active": metrics.countries_live,
        "global_stability": metrics.global_stability,
        "weather_systems": [
            {"system": "Indian Ocean cyclone band", "risk": 63, "trajectory": "west-northwest"},
            {"system": "European heat dome", "risk": 57, "trajectory": "stationary"},
            {"system": "Pacific atmospheric river", "risk": 52, "trajectory": "eastbound"},
        ],
        "conflict_zones": [
            {"zone": "Eastern Europe corridor", "severity": 71, "confidence": 88},
            {"zone": "Red Sea maritime lane", "severity": 66, "confidence": 84},
        ],
        "economic_hotspots": [
            {"region": "Gulf enterprise corridor", "pressure": "rising demand", "confidence": 91},
            {"region": "US healthcare critical infrastructure", "pressure": "high security spend", "confidence": 86},
        ],
        "trade_routes": [
            {"route": "Singapore - India - UAE", "status": "priority", "throughput": 87},
            {"route": "Europe - Gulf - South Asia", "status": "watch", "throughput": 74},
            {"route": "Pacific semiconductor lane", "status": "constrained", "throughput": 69},
        ],
        "risk_points": countries[:12],
        "population_pressure": [
            {"region": "South Asia urban belt", "pressure": 68},
            {"region": "Gulf construction corridor", "pressure": 59},
            {"region": "SEA coastal capitals", "pressure": 61},
        ],
    }


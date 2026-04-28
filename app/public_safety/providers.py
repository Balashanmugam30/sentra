from __future__ import annotations

from app.core.config import settings


def build_provider_snapshot() -> dict[str, str]:
    traffic = settings.traffic_provider.lower()
    transit = settings.transit_provider.lower()
    utility = settings.utility_provider.lower()

    if traffic == "tomtom" and not settings.tomtom_api_key:
        traffic = "demo"
    elif traffic == "mapbox" and not settings.mapbox_access_token:
        traffic = "demo"

    if transit != "gtfs":
        transit = "demo"
    if utility != "demo":
        utility = "demo"

    return {
        "traffic_provider": traffic,
        "transit_provider": transit,
        "utility_provider": utility,
        "city_mode": settings.city_mode.lower(),
    }

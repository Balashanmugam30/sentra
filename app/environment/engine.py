from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.environment.airquality import apply_air_quality_scenario
from app.environment.forecast import demo_forecast_payload
from app.environment.hazard import (
    build_alerts,
    compute_global_hazard_score,
    compute_hazard_scores,
    compute_operational_impacts,
)
from app.environment.providers import fetch_environment_provider_payload
from app.environment.weather import apply_weather_scenario
from app.services.incident_service import get_all_incidents
_environment_state: dict[str, Any] = {
    "scenario": None,
    "focus": {
        "lat": settings.default_lat,
        "lng": settings.default_lng,
    },
}


def _build_environment_state() -> dict[str, Any]:
    incidents = get_all_incidents()
    scenario = _environment_state["scenario"]
    lat = float(_environment_state["focus"]["lat"])
    lng = float(_environment_state["focus"]["lng"])
    provider_payload = fetch_environment_provider_payload(lat=lat, lng=lng, incidents=incidents)
    weather = apply_weather_scenario(provider_payload["weather"], scenario)
    air_quality = apply_air_quality_scenario(provider_payload["air_quality"], scenario)
    hazards = compute_hazard_scores(
        weather=weather,
        air_quality=air_quality,
        incidents=incidents,
        scenario=scenario,
    )
    operational_impacts = compute_operational_impacts(
        weather=weather,
        air_quality=air_quality,
        hazards=hazards,
        incidents=incidents,
        scenario=scenario,
    )
    if provider_payload["provider"] == "openweather" and provider_payload["forecast_seed"]:
        intervals: list[dict[str, Any]] = []
        for item in provider_payload["forecast_seed"]:
            synthetic_weather = dict(weather)
            synthetic_weather["temperature_c"] = item["temp"]
            synthetic_weather["feels_like_c"] = item["temp"] + 2
            synthetic_weather["wind_kph"] = item["wind"]
            synthetic_weather["rain_mm"] = item["rain"]
            synthetic_hazards = compute_hazard_scores(
                weather=synthetic_weather,
                air_quality=air_quality,
                incidents=incidents,
                scenario=scenario,
            )
            intervals.append(
                {
                    "label": item["label"],
                    "rain": item["rain"],
                    "wind": item["wind"],
                    "temp": item["temp"],
                    "hazard_score": compute_global_hazard_score(synthetic_hazards),
                    "summary": (
                        "Critical weather pressure over operations."
                        if compute_global_hazard_score(synthetic_hazards) >= 80
                        else "Weather watch active across response corridors."
                        if compute_global_hazard_score(synthetic_hazards) >= 45
                        else "Low environmental pressure window."
                    ),
                }
            )
    else:
        intervals = demo_forecast_payload(weather, air_quality, incidents, scenario)

    alerts = build_alerts(hazards=hazards, air_quality=air_quality, weather=weather)
    return {
        "provider": provider_payload["provider"],
        "updated_at": provider_payload["updated_at"],
        "weather": weather,
        "air_quality": air_quality,
        "hazards": hazards,
        "operational_impacts": operational_impacts,
        "global_hazard_score": compute_global_hazard_score(hazards),
        "forecast": intervals,
        "alerts": alerts,
        "focus": {"lat": lat, "lng": lng},
    }


def build_environment_live_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _build_environment_state()
    return {
        "summary_only": summary_only,
        "provider": state["provider"],
        "updated_at": state["updated_at"],
        "weather": state["weather"],
        "air_quality": state["air_quality"],
        "hazards": state["hazards"],
        "operational_impacts": state["operational_impacts"],
        "global_hazard_score": state["global_hazard_score"],
    }


def build_environment_forecast_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _build_environment_state()
    return {
        "summary_only": summary_only,
        "provider": state["provider"],
        "updated_at": state["updated_at"],
        "intervals": state["forecast"][:6],
    }


def build_environment_alerts_snapshot(*, summary_only: bool) -> dict[str, Any]:
    state = _build_environment_state()
    return {
        "summary_only": summary_only,
        "provider": state["provider"],
        "updated_at": state["updated_at"],
        "alerts": state["alerts"],
    }


def build_environment_overlay() -> dict[str, Any]:
    state = _build_environment_state()
    return {
        "provider": state["provider"],
        "wind_kph": state["weather"]["wind_kph"],
        "wind_direction": state["weather"]["wind_direction"],
        "rain_mm": state["weather"]["rain_mm"],
        "visibility_km": state["weather"]["visibility_km"],
        "aqi": state["air_quality"]["aqi"],
        "fire_spread_risk": state["hazards"]["fire_spread_risk"],
        "flood_risk": state["hazards"]["flood_risk"],
        "smoke_risk": state["hazards"]["smoke_risk"],
    }


def apply_environment_test_scenario(scenario: str, *, summary_only: bool) -> dict[str, Any]:
    _environment_state["scenario"] = scenario
    return build_environment_live_snapshot(summary_only=summary_only)


def apply_environment_focus(lat: float, lng: float, *, summary_only: bool) -> dict[str, Any]:
    _environment_state["focus"] = {"lat": lat, "lng": lng}
    return build_environment_live_snapshot(summary_only=summary_only)


def reset_environment_state() -> None:
    _environment_state["scenario"] = None
    _environment_state["focus"] = {"lat": settings.default_lat, "lng": settings.default_lng}

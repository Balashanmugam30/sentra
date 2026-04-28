from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any
from urllib.error import URLError
from urllib.request import urlopen

from app.core.config import settings
from app.environment.airquality import demo_air_quality_payload
from app.environment.forecast import demo_forecast_payload
from app.environment.weather import demo_weather_payload, normalize_wind_direction
from app.models.incident import Incident


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _http_get_json(url: str) -> dict[str, Any]:
    with urlopen(url, timeout=settings.environment_timeout_seconds) as response:
        return json.loads(response.read().decode("utf-8"))


def _openweather_payload(lat: float, lng: float, incidents: list[Incident]) -> dict[str, Any]:
    api_key = settings.openweather_api_key
    current_url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lng}&appid={api_key}&units=metric"
    )
    forecast_url = (
        "https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={lat}&lon={lng}&appid={api_key}&units=metric"
    )
    air_url = (
        "https://api.openweathermap.org/data/2.5/air_pollution"
        f"?lat={lat}&lon={lng}&appid={api_key}"
    )

    current = _http_get_json(current_url)
    forecast = _http_get_json(forecast_url)
    air = _http_get_json(air_url)
    weather_entry = current["weather"][0] if current.get("weather") else {}
    weather = {
        "temperature_c": round(float(current["main"]["temp"]), 1),
        "feels_like_c": round(float(current["main"]["feels_like"]), 1),
        "humidity": int(current["main"]["humidity"]),
        "wind_kph": round(float(current.get("wind", {}).get("speed", 0.0)) * 3.6, 1),
        "wind_direction": normalize_wind_direction(float(current.get("wind", {}).get("deg", 0.0))),
        "rain_mm": round(float(current.get("rain", {}).get("1h", current.get("rain", {}).get("3h", 0.0))), 1),
        "pressure": int(current["main"]["pressure"]),
        "visibility_km": round(float(current.get("visibility", 10000)) / 1000, 1),
        "condition": str(weather_entry.get("description") or weather_entry.get("main") or "Live weather"),
    }

    air_entry = air["list"][0] if air.get("list") else {}
    components = air_entry.get("components", {})
    aqi_map = {1: 35, 2: 70, 3: 115, 4: 170, 5: 225}
    air_quality = {
        "aqi": aqi_map.get(int(air_entry.get("main", {}).get("aqi", 2)), 70),
        "pm25": round(float(components.get("pm2_5", 0.0)), 1),
        "pm10": round(float(components.get("pm10", 0.0)), 1),
        "o3": round(float(components.get("o3", 0.0)) / 10, 1),
        "no2": round(float(components.get("no2", 0.0)) / 10, 1),
        "risk_band": "fair",
    }
    if air_quality["aqi"] <= 50:
        air_quality["risk_band"] = "good"
    elif air_quality["aqi"] <= 100:
        air_quality["risk_band"] = "fair"
    elif air_quality["aqi"] <= 150:
        air_quality["risk_band"] = "moderate"
    elif air_quality["aqi"] <= 200:
        air_quality["risk_band"] = "poor"
    else:
        air_quality["risk_band"] = "severe"

    intervals: list[dict[str, Any]] = []
    forecast_list = forecast.get("list", [])[:16]
    target_indexes = [0, 1, 2, 4, 8, 15]
    labels = ["+1h", "+3h", "+6h", "+12h", "+24h", "+48h"]
    for label, index in zip(labels, target_indexes, strict=True):
        entry = forecast_list[min(index, len(forecast_list) - 1)] if forecast_list else {}
        main = entry.get("main", {})
        wind = entry.get("wind", {})
        rain = entry.get("rain", {})
        intervals.append(
            {
                "label": label,
                "rain": round(float(rain.get("3h", 0.0)), 1),
                "wind": round(float(wind.get("speed", 0.0)) * 3.6, 1),
                "temp": round(float(main.get("temp", weather["temperature_c"])), 1),
            }
        )

    return {
        "provider": "openweather",
        "updated_at": _now(),
        "weather": weather,
        "air_quality": air_quality,
        "forecast_seed": intervals,
    }


def _demo_payload(incidents: list[Incident]) -> dict[str, Any]:
    weather = demo_weather_payload()
    air_quality = demo_air_quality_payload()
    return {
        "provider": "demo",
        "updated_at": _now(),
        "weather": weather,
        "air_quality": air_quality,
        "forecast_seed": demo_forecast_payload(weather, air_quality, incidents, None),
    }


def fetch_environment_provider_payload(*, lat: float, lng: float, incidents: list[Incident]) -> dict[str, Any]:
    provider = settings.weather_provider.lower()
    if provider == "openweather" and settings.openweather_api_key:
        try:
            return _openweather_payload(lat, lng, incidents)
        except (URLError, KeyError, ValueError, TimeoutError):
            pass
    return _demo_payload(incidents)

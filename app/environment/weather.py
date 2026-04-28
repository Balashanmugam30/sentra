from __future__ import annotations

from typing import Any


def normalize_wind_direction(degrees: float) -> str:
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round((degrees % 360) / 45) % len(directions)
    return directions[index]


def demo_weather_payload() -> dict[str, Any]:
    return {
        "temperature_c": 34.0,
        "feels_like_c": 38.0,
        "humidity": 68,
        "wind_kph": 22.0,
        "wind_direction": "SW",
        "rain_mm": 4.0,
        "pressure": 1007,
        "visibility_km": 6.5,
        "condition": "Humid haze",
    }


def apply_weather_scenario(base: dict[str, Any], scenario: str | None) -> dict[str, Any]:
    payload = dict(base)
    if scenario == "cyclone":
        payload.update(
            {
                "temperature_c": 29.0,
                "feels_like_c": 31.0,
                "humidity": 89,
                "wind_kph": 64.0,
                "wind_direction": "SE",
                "rain_mm": 58.0,
                "pressure": 986,
                "visibility_km": 1.8,
                "condition": "Cyclonic storm",
            }
        )
    elif scenario == "heavy_rain":
        payload.update(
            {
                "temperature_c": 27.0,
                "feels_like_c": 29.0,
                "humidity": 92,
                "wind_kph": 31.0,
                "wind_direction": "S",
                "rain_mm": 46.0,
                "pressure": 995,
                "visibility_km": 2.4,
                "condition": "Heavy rainfall",
            }
        )
    elif scenario == "wildfire_smoke":
        payload.update(
            {
                "temperature_c": 36.0,
                "feels_like_c": 39.0,
                "humidity": 41,
                "wind_kph": 38.0,
                "wind_direction": "W",
                "rain_mm": 0.0,
                "pressure": 1008,
                "visibility_km": 3.1,
                "condition": "Smoke haze",
            }
        )
    elif scenario == "toxic_leak_wind":
        payload.update(
            {
                "temperature_c": 33.0,
                "feels_like_c": 36.0,
                "humidity": 57,
                "wind_kph": 34.0,
                "wind_direction": "NE",
                "rain_mm": 0.0,
                "pressure": 1009,
                "visibility_km": 4.8,
                "condition": "Wind-driven toxic plume",
            }
        )
    elif scenario == "heatwave":
        payload.update(
            {
                "temperature_c": 41.0,
                "feels_like_c": 46.0,
                "humidity": 43,
                "wind_kph": 18.0,
                "wind_direction": "W",
                "rain_mm": 0.0,
                "pressure": 1005,
                "visibility_km": 8.2,
                "condition": "Extreme heat",
            }
        )
    elif scenario == "dense_fog":
        payload.update(
            {
                "temperature_c": 24.0,
                "feels_like_c": 24.0,
                "humidity": 97,
                "wind_kph": 7.0,
                "wind_direction": "N",
                "rain_mm": 1.0,
                "pressure": 1012,
                "visibility_km": 0.4,
                "condition": "Dense fog",
            }
        )
    elif scenario == "clear_day":
        payload.update(
            {
                "temperature_c": 31.0,
                "feels_like_c": 33.0,
                "humidity": 52,
                "wind_kph": 12.0,
                "wind_direction": "E",
                "rain_mm": 0.0,
                "pressure": 1011,
                "visibility_km": 9.5,
                "condition": "Clear day",
            }
        )
    return payload

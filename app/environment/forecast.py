from __future__ import annotations

from typing import Any

from app.environment.airquality import apply_air_quality_scenario
from app.environment.hazard import compute_global_hazard_score, compute_hazard_scores
from app.environment.weather import apply_weather_scenario
from app.models.incident import Incident

FORECAST_LABELS = ["+1h", "+3h", "+6h", "+12h", "+24h", "+48h"]


def demo_forecast_payload(
    weather: dict[str, Any],
    air_quality: dict[str, Any],
    incidents: list[Incident],
    scenario: str | None,
) -> list[dict[str, Any]]:
    offsets = [
        {"temp": 0.5, "wind": 1.0, "rain": 2.0},
        {"temp": 1.0, "wind": 3.0, "rain": 3.5},
        {"temp": -0.5, "wind": 5.0, "rain": 5.0},
        {"temp": -1.5, "wind": 2.0, "rain": 4.0},
        {"temp": -2.0, "wind": 1.0, "rain": 1.5},
        {"temp": -1.0, "wind": 0.0, "rain": 0.5},
    ]

    intervals: list[dict[str, Any]] = []
    for label, offset in zip(FORECAST_LABELS, offsets, strict=True):
        future_weather = dict(weather)
        future_air = dict(air_quality)
        future_weather["temperature_c"] = round(weather["temperature_c"] + offset["temp"], 1)
        future_weather["feels_like_c"] = round(weather["feels_like_c"] + offset["temp"], 1)
        future_weather["wind_kph"] = round(max(0.0, weather["wind_kph"] + offset["wind"]), 1)
        future_weather["rain_mm"] = round(max(0.0, weather["rain_mm"] + offset["rain"]), 1)
        if scenario == "cyclone":
            future_weather["wind_kph"] = round(weather["wind_kph"] + offset["wind"] + 6, 1)
            future_weather["rain_mm"] = round(weather["rain_mm"] + offset["rain"] + 8, 1)
        elif scenario == "wildfire_smoke":
            future_air = apply_air_quality_scenario(future_air, "wildfire_smoke")
        elif scenario == "heatwave":
            future_weather["temperature_c"] = round(weather["temperature_c"] + 0.8 + offset["temp"], 1)
            future_weather["feels_like_c"] = round(weather["feels_like_c"] + 1.0 + offset["temp"], 1)
        elif scenario == "dense_fog":
            future_weather["visibility_km"] = max(0.2, weather["visibility_km"] - 0.05)

        hazards = compute_hazard_scores(
            weather=future_weather,
            air_quality=future_air,
            incidents=incidents,
            scenario=scenario,
        )
        hazard_score = compute_global_hazard_score(hazards)
        intervals.append(
            {
                "label": label,
                "rain": future_weather["rain_mm"],
                "wind": future_weather["wind_kph"],
                "temp": future_weather["temperature_c"],
                "hazard_score": hazard_score,
                "summary": _forecast_summary(hazard_score, future_weather, future_air),
            }
        )
    return intervals


def _forecast_summary(hazard_score: int, weather: dict[str, Any], air_quality: dict[str, Any]) -> str:
    if hazard_score >= 80:
        return f"Critical operational pressure with wind {round(weather['wind_kph'])} kph and AQI {air_quality['aqi']}."
    if hazard_score >= 60:
        return f"Elevated hazard window with rain {round(weather['rain_mm'])} mm and reduced mobility."
    if hazard_score >= 40:
        return "Watch conditions remain active; keep adaptive routing and responder caution enabled."
    return "Low environmental pressure; standard routing and field posture remain viable."

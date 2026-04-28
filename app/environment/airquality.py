from __future__ import annotations

from typing import Any


def _risk_band(aqi: int) -> str:
    if aqi <= 50:
        return "good"
    if aqi <= 100:
        return "fair"
    if aqi <= 150:
        return "moderate"
    if aqi <= 200:
        return "poor"
    return "severe"


def demo_air_quality_payload() -> dict[str, Any]:
    aqi = 118
    return {
        "aqi": aqi,
        "pm25": 49.0,
        "pm10": 76.0,
        "o3": 31.0,
        "no2": 18.0,
        "risk_band": _risk_band(aqi),
    }


def apply_air_quality_scenario(base: dict[str, Any], scenario: str | None) -> dict[str, Any]:
    payload = dict(base)
    if scenario == "wildfire_smoke":
        payload.update({"aqi": 188, "pm25": 142.0, "pm10": 198.0, "o3": 52.0, "no2": 24.0})
    elif scenario == "toxic_leak_wind":
        payload.update({"aqi": 164, "pm25": 88.0, "pm10": 132.0, "o3": 67.0, "no2": 71.0})
    elif scenario == "cyclone":
        payload.update({"aqi": 96, "pm25": 36.0, "pm10": 61.0, "o3": 24.0, "no2": 15.0})
    elif scenario == "heatwave":
        payload.update({"aqi": 138, "pm25": 58.0, "pm10": 94.0, "o3": 73.0, "no2": 20.0})
    elif scenario == "dense_fog":
        payload.update({"aqi": 149, "pm25": 66.0, "pm10": 105.0, "o3": 29.0, "no2": 26.0})
    elif scenario == "clear_day":
        payload.update({"aqi": 44, "pm25": 16.0, "pm10": 24.0, "o3": 18.0, "no2": 10.0})
    payload["risk_band"] = _risk_band(int(payload["aqi"]))
    return payload

from __future__ import annotations

from typing import Any

from app.models.incident import Incident


def _cap(value: float) -> int:
    return max(0, min(100, round(value)))


def compute_hazard_scores(
    *,
    weather: dict[str, Any],
    air_quality: dict[str, Any],
    incidents: list[Incident],
    scenario: str | None,
) -> dict[str, int]:
    active_fire = any(incident.status == "active" and incident.type == "fire" for incident in incidents)
    hazardous_air_incident = any(
        incident.status == "active" and incident.type in {"hazardous_gas", "toxic_air", "gas"}
        for incident in incidents
    )

    storm_risk = _cap((weather["wind_kph"] * 0.9) + (weather["rain_mm"] * 0.6) + (1005 - weather["pressure"]) * 1.2)
    flood_risk = _cap((weather["rain_mm"] * 1.35) + (weather["humidity"] * 0.32) + max(0.0, 3 - weather["visibility_km"]) * 6)
    fire_spread_risk = _cap(
        (weather["wind_kph"] * 1.05)
        + max(0.0, weather["temperature_c"] - 28) * 1.4
        - (weather["humidity"] * 0.18)
        + (26 if active_fire else 0)
    )
    heat_risk = _cap(max(0.0, weather["temperature_c"] - 26) * 5 + max(0.0, weather["feels_like_c"] - 32) * 2.2)
    smoke_risk = _cap((air_quality["aqi"] * 0.45) + (air_quality["pm25"] * 0.22) + (18 if active_fire else 0) + (22 if hazardous_air_incident else 0))
    lightning_risk = _cap((weather["wind_kph"] * 0.7) + (weather["rain_mm"] * 0.55) + max(0.0, 1000 - weather["pressure"]) * 0.9)
    visibility_risk = _cap(max(0.0, 6 - weather["visibility_km"]) * 15 + (air_quality["aqi"] * 0.12))

    if scenario == "cyclone":
        storm_risk = max(storm_risk, 94)
        flood_risk = max(flood_risk, 83)
        lightning_risk = max(lightning_risk, 86)
    elif scenario == "wildfire_smoke":
        smoke_risk = max(smoke_risk, 92)
        fire_spread_risk = max(fire_spread_risk, 79)
    elif scenario == "heatwave":
        heat_risk = max(heat_risk, 95)
    elif scenario == "dense_fog":
        visibility_risk = max(visibility_risk, 96)
    elif scenario == "toxic_leak_wind":
        smoke_risk = max(smoke_risk, 88)
        visibility_risk = max(visibility_risk, 58)
    elif scenario == "heavy_rain":
        flood_risk = max(flood_risk, 74)
        storm_risk = max(storm_risk, 63)
    elif scenario == "clear_day":
        storm_risk = min(storm_risk, 10)
        flood_risk = min(flood_risk, 6)
        smoke_risk = min(smoke_risk, 18)

    return {
        "storm_risk": storm_risk,
        "flood_risk": flood_risk,
        "fire_spread_risk": fire_spread_risk,
        "heat_risk": heat_risk,
        "smoke_risk": smoke_risk,
        "lightning_risk": lightning_risk,
        "visibility_risk": visibility_risk,
    }


def compute_operational_impacts(
    *,
    weather: dict[str, Any],
    air_quality: dict[str, Any],
    hazards: dict[str, int],
    incidents: list[Incident],
    scenario: str | None,
) -> dict[str, Any]:
    outdoor_alert_level = "normal"
    if air_quality["aqi"] > 150 or hazards["storm_risk"] > 80:
        outdoor_alert_level = "critical"
    elif air_quality["aqi"] > 120 or hazards["flood_risk"] > 65 or hazards["heat_risk"] > 75:
        outdoor_alert_level = "high"
    elif hazards["visibility_risk"] > 45 or hazards["smoke_risk"] > 45:
        outdoor_alert_level = "elevated"

    evacuation_difficulty = _cap(
        (hazards["flood_risk"] * 0.25)
        + (hazards["visibility_risk"] * 0.25)
        + (hazards["smoke_risk"] * 0.2)
        + (hazards["storm_risk"] * 0.2)
        + (15 if any(incident.status == "active" for incident in incidents) else 0)
    )
    responder_speed_penalty = _cap(
        (weather["wind_kph"] * 0.55)
        + max(0.0, 3 - weather["visibility_km"]) * 10
        + (hazards["flood_risk"] * 0.18)
    )

    if weather["wind_kph"] > 42 or weather["rain_mm"] > 35 or hazards["visibility_risk"] > 75:
        drone_flight_status = "grounded"
    elif weather["wind_kph"] > 25 or air_quality["aqi"] > 130:
        drone_flight_status = "caution"
    else:
        drone_flight_status = "clear"

    facility_hvac_recommendation = "Maintain monitored fresh-air mode"
    if scenario == "toxic_leak_wind" or air_quality["no2"] > 60 or hazards["smoke_risk"] > 75:
        facility_hvac_recommendation = "Isolate outside air intakes and purge affected sectors selectively"
    elif hazards["heat_risk"] > 80:
        facility_hvac_recommendation = "Increase cooling load support and protect medical staging areas"
    elif hazards["flood_risk"] > 70:
        facility_hvac_recommendation = "Protect low-lying mechanical rooms and stage water ingress checks"

    return {
        "evacuation_difficulty": evacuation_difficulty,
        "responder_speed_penalty": responder_speed_penalty,
        "drone_flight_status": drone_flight_status,
        "facility_hvac_recommendation": facility_hvac_recommendation,
        "outdoor_alert_level": outdoor_alert_level,
    }


def compute_global_hazard_score(hazards: dict[str, int]) -> int:
    return _cap(
        (hazards["storm_risk"] * 0.18)
        + (hazards["flood_risk"] * 0.14)
        + (hazards["fire_spread_risk"] * 0.16)
        + (hazards["heat_risk"] * 0.14)
        + (hazards["smoke_risk"] * 0.18)
        + (hazards["lightning_risk"] * 0.08)
        + (hazards["visibility_risk"] * 0.12)
    )


def build_alerts(
    *,
    hazards: dict[str, int],
    air_quality: dict[str, Any],
    weather: dict[str, Any],
) -> list[dict[str, str]]:
    alerts: list[dict[str, str]] = []

    if hazards["storm_risk"] >= 70:
        alerts.append(
            {
                "alert_id": "ENV-ALERT-STORM",
                "type": "storm_warning",
                "severity": "critical" if hazards["storm_risk"] >= 85 else "high",
                "title": "Storm warning",
                "summary": f"Wind {round(weather['wind_kph'])} kph with heavy weather affecting outdoor operations.",
            }
        )
    if hazards["flood_risk"] >= 65:
        alerts.append(
            {
                "alert_id": "ENV-ALERT-FLOOD",
                "type": "flood_watch",
                "severity": "high" if hazards["flood_risk"] >= 80 else "medium",
                "title": "Flood watch",
                "summary": f"Rain accumulation {round(weather['rain_mm'])} mm is raising flood pressure in exposed zones.",
            }
        )
    if hazards["heat_risk"] >= 70:
        alerts.append(
            {
                "alert_id": "ENV-ALERT-HEAT",
                "type": "heat_advisory",
                "severity": "high" if hazards["heat_risk"] >= 85 else "medium",
                "title": "Heat advisory",
                "summary": f"Feels-like temperature {round(weather['feels_like_c'])}C requires responder heat controls.",
            }
        )
    if air_quality["aqi"] >= 140 or hazards["smoke_risk"] >= 75:
        alerts.append(
            {
                "alert_id": "ENV-ALERT-AIR",
                "type": "air_quality_warning",
                "severity": "critical" if air_quality["aqi"] >= 180 else "high",
                "title": "Air quality warning",
                "summary": f"AQI {air_quality['aqi']} with smoke burden affecting outdoor exposure.",
            }
        )
    if hazards["visibility_risk"] >= 70:
        alerts.append(
            {
                "alert_id": "ENV-ALERT-VIS",
                "type": "visibility_alert",
                "severity": "critical" if hazards["visibility_risk"] >= 90 else "high",
                "title": "Visibility hazard",
                "summary": f"Visibility reduced to {weather['visibility_km']} km across active response corridors.",
            }
        )
    return alerts[:5]

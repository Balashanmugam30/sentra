from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class WeatherState(BaseModel):
    temperature_c: float
    feels_like_c: float
    humidity: int = Field(..., ge=0, le=100)
    wind_kph: float = Field(..., ge=0)
    wind_direction: str
    rain_mm: float = Field(..., ge=0)
    pressure: int = Field(..., ge=800, le=1200)
    visibility_km: float = Field(..., ge=0)
    condition: str


class AirQualityState(BaseModel):
    aqi: int = Field(..., ge=0)
    pm25: float = Field(..., ge=0)
    pm10: float = Field(..., ge=0)
    o3: float = Field(..., ge=0)
    no2: float = Field(..., ge=0)
    risk_band: Literal["good", "fair", "moderate", "poor", "severe"]


class HazardScores(BaseModel):
    storm_risk: int = Field(..., ge=0, le=100)
    flood_risk: int = Field(..., ge=0, le=100)
    fire_spread_risk: int = Field(..., ge=0, le=100)
    heat_risk: int = Field(..., ge=0, le=100)
    smoke_risk: int = Field(..., ge=0, le=100)
    lightning_risk: int = Field(..., ge=0, le=100)
    visibility_risk: int = Field(..., ge=0, le=100)


class OperationalImpacts(BaseModel):
    evacuation_difficulty: int = Field(..., ge=0, le=100)
    responder_speed_penalty: int = Field(..., ge=0, le=100)
    drone_flight_status: Literal["clear", "caution", "grounded"]
    facility_hvac_recommendation: str
    outdoor_alert_level: Literal["normal", "elevated", "high", "critical"]


class ForecastInterval(BaseModel):
    label: Literal["+1h", "+3h", "+6h", "+12h", "+24h", "+48h"]
    rain: float = Field(..., ge=0)
    wind: float = Field(..., ge=0)
    temp: float
    hazard_score: int = Field(..., ge=0, le=100)
    summary: str


class EnvironmentAlert(BaseModel):
    alert_id: str
    type: str
    severity: Literal["low", "medium", "high", "critical"]
    title: str
    summary: str


class EnvironmentLiveResponse(BaseModel):
    summary_only: bool = False
    partial: bool = False
    stale_data: bool = False
    provider: str
    updated_at: datetime
    weather: WeatherState
    air_quality: AirQualityState
    hazards: HazardScores
    operational_impacts: OperationalImpacts
    global_hazard_score: int = Field(..., ge=0, le=100)


class EnvironmentForecastResponse(BaseModel):
    summary_only: bool = False
    provider: str
    updated_at: datetime
    intervals: list[ForecastInterval]


class EnvironmentAlertsResponse(BaseModel):
    summary_only: bool = False
    provider: str
    updated_at: datetime
    alerts: list[EnvironmentAlert]


class EnvironmentFocusRequest(BaseModel):
    lat: float
    lng: float


class EnvironmentTestScenarioRequest(BaseModel):
    scenario: Literal[
        "cyclone",
        "heavy_rain",
        "wildfire_smoke",
        "toxic_leak_wind",
        "heatwave",
        "dense_fog",
        "clear_day",
    ]


class EnvironmentTestScenarioResponse(BaseModel):
    status: str
    scenario: str
    live: EnvironmentLiveResponse

from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings


SEEDED_AT = "2026-04-26T00:00:00+00:00"
STORE_VERSION = "phase22x-analytics-2026-04-26"

ANALYTICS: tuple[dict[str, Any], ...] = (
    {"metric_id": "ARR", "domain": "executive", "label": "ARR trend", "value": 4800000, "delta": 182, "unit": "$", "insight": "Enterprise and channel motions compound ARR growth."},
    {"metric_id": "CHURN", "domain": "executive", "label": "Churn risk", "value": 4.2, "delta": -1.1, "unit": "%", "insight": "High usage customers show lower churn risk."},
    {"metric_id": "RESPONSE", "domain": "crisis", "label": "Avg response time", "value": 3.8, "delta": -34, "unit": "min", "insight": "Autonomous operations reduced dispatch delay."},
    {"metric_id": "CONTAIN", "domain": "crisis", "label": "Containment rate", "value": 91, "delta": 8, "unit": "%", "insight": "Twin routing and comms improved containment."},
    {"metric_id": "MODEL", "domain": "ai", "label": "Model accuracy", "value": 94, "delta": 3, "unit": "%", "insight": "Retraining and drift monitoring improved precision."},
    {"metric_id": "OVERRIDE", "domain": "ai", "label": "Override rate", "value": 8, "delta": -5, "unit": "%", "insight": "Council consensus is better calibrated."},
    {"metric_id": "CITY", "domain": "government", "label": "Civic readiness", "value": 88, "delta": 6, "unit": "%", "insight": "Hospital load and weather pressure are stable."},
)

FORECASTS: tuple[dict[str, Any], ...] = (
    {"forecast_id": "FC-CHURN", "title": "Churn next quarter", "probability": 12, "impact": "medium", "recommendation": "Launch QBR for watch accounts."},
    {"forecast_id": "FC-INCIDENT", "title": "Likely incidents next week", "probability": 68, "impact": "high", "recommendation": "Pre-position responders for kitchen and campus lab zones."},
    {"forecast_id": "FC-EXPANSION", "title": "Expansion revenue", "probability": 74, "impact": "high", "recommendation": "Push UAE and India partner packs."},
    {"forecast_id": "FC-STAFF", "title": "Staffing overload", "probability": 41, "impact": "medium", "recommendation": "Add reserve team for night shift."},
    {"forecast_id": "FC-HARDWARE", "title": "Hardware failures", "probability": 23, "impact": "low", "recommendation": "Replace two weak HVAC gateways."},
    {"forecast_id": "FC-PR", "title": "PR reputation risk", "probability": 18, "impact": "medium", "recommendation": "Keep holding statement ready."},
    {"forecast_id": "FC-WEATHER", "title": "Weather disruption", "probability": 36, "impact": "medium", "recommendation": "Monitor civic traffic and flood feeds."},
)


class AnalyticsHubStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"store_version": STORE_VERSION, "analytics": [], "forecasts": [], "events": []}

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        if payload.get("store_version") != STORE_VERSION:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        with self._lock:
            payload = self._read()
            for table, rows, key in (("analytics", ANALYTICS, "metric_id"), ("forecasts", FORECASTS, "forecast_id")):
                existing = {row[key] for row in payload[table] if key in row}
                for row in rows:
                    if row[key] in existing:
                        continue
                    payload[table].append({**row, "updated_at": SEEDED_AT})
                    created += 1
            self._write(payload)
        return {"created": created}

    def rows(self, table: str) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [dict(row) for row in self._read()[table]]


analyticshub_store = AnalyticsHubStore(settings.sentra_analyticshub_store_path)


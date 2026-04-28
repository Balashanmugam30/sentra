from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings


DEMO_TENANTS = (
    "TEN-BALA-UNI",
    "TEN-BALA-MFG",
    "TEN-BALA-HOSP",
    "TEN-GOVSECURE",
    "TEN-GRAND-MERIDIAN",
)


def utc_now_iso() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


SEED_ZONES: tuple[dict[str, Any], ...] = (
    {
        "zone_id": "BEH-HOTEL-F8",
        "name": "Hotel Floor 8",
        "population": 186,
        "density": 71,
        "exits": 2,
        "visible_exits": 54,
        "smoke_level": 38,
        "fire_severity": 44,
        "alarm_clarity": 72,
        "alarm_status": "clear voice alert active",
        "language_mix": ["English", "Hindi", "Arabic"],
        "avg_age_band": "mixed adults",
        "mobility_percent": 11,
        "visibility_score": 68,
        "noise_level": 62,
        "previous_alerts": 2,
        "leadership_presence": 54,
        "conflicting_instructions": 18,
        "time_pressure": 63,
    },
    {
        "zone_id": "BEH-LOBBY",
        "name": "Main Lobby",
        "population": 420,
        "density": 86,
        "exits": 4,
        "visible_exits": 78,
        "smoke_level": 12,
        "fire_severity": 18,
        "alarm_clarity": 82,
        "alarm_status": "directional signage synchronized",
        "language_mix": ["English", "Spanish", "Hindi"],
        "avg_age_band": "families and adults",
        "mobility_percent": 8,
        "visibility_score": 86,
        "noise_level": 74,
        "previous_alerts": 1,
        "leadership_presence": 72,
        "conflicting_instructions": 10,
        "time_pressure": 48,
    },
    {
        "zone_id": "BEH-PARKING-B2",
        "name": "Parking B2",
        "population": 96,
        "density": 47,
        "exits": 2,
        "visible_exits": 39,
        "smoke_level": 31,
        "fire_severity": 28,
        "alarm_clarity": 51,
        "alarm_status": "audio reverberation detected",
        "language_mix": ["English", "Tamil"],
        "avg_age_band": "adults",
        "mobility_percent": 6,
        "visibility_score": 44,
        "noise_level": 68,
        "previous_alerts": 0,
        "leadership_presence": 26,
        "conflicting_instructions": 24,
        "time_pressure": 56,
    },
    {
        "zone_id": "BEH-FOOD-COURT",
        "name": "Food Court",
        "population": 680,
        "density": 93,
        "exits": 3,
        "visible_exits": 48,
        "smoke_level": 26,
        "fire_severity": 32,
        "alarm_clarity": 64,
        "alarm_status": "mixed PA and staff instructions",
        "language_mix": ["English", "Hindi", "Malayalam", "Arabic"],
        "avg_age_band": "families",
        "mobility_percent": 13,
        "visibility_score": 62,
        "noise_level": 88,
        "previous_alerts": 3,
        "leadership_presence": 42,
        "conflicting_instructions": 31,
        "time_pressure": 69,
    },
    {
        "zone_id": "BEH-ICU-WING",
        "name": "ICU Wing",
        "population": 78,
        "density": 61,
        "exits": 2,
        "visible_exits": 58,
        "smoke_level": 8,
        "fire_severity": 21,
        "alarm_clarity": 76,
        "alarm_status": "clinical quiet alert",
        "language_mix": ["English", "Tamil"],
        "avg_age_band": "elderly and clinical",
        "mobility_percent": 46,
        "visibility_score": 79,
        "noise_level": 38,
        "previous_alerts": 1,
        "leadership_presence": 88,
        "conflicting_instructions": 9,
        "time_pressure": 57,
    },
    {
        "zone_id": "BEH-STADIUM-A",
        "name": "Stadium Gate A",
        "population": 1220,
        "density": 96,
        "exits": 5,
        "visible_exits": 52,
        "smoke_level": 4,
        "fire_severity": 12,
        "alarm_clarity": 58,
        "alarm_status": "crowd audio interference",
        "language_mix": ["English", "Hindi", "Kannada"],
        "avg_age_band": "young adults",
        "mobility_percent": 5,
        "visibility_score": 70,
        "noise_level": 94,
        "previous_alerts": 2,
        "leadership_presence": 34,
        "conflicting_instructions": 36,
        "time_pressure": 61,
    },
    {
        "zone_id": "BEH-CAMPUS-C",
        "name": "Campus Block C",
        "population": 310,
        "density": 66,
        "exits": 3,
        "visible_exits": 67,
        "smoke_level": 17,
        "fire_severity": 22,
        "alarm_clarity": 74,
        "alarm_status": "mobile plus PA synchronized",
        "language_mix": ["English", "Tamil", "Hindi"],
        "avg_age_band": "students and staff",
        "mobility_percent": 7,
        "visibility_score": 81,
        "noise_level": 59,
        "previous_alerts": 4,
        "leadership_presence": 61,
        "conflicting_instructions": 15,
        "time_pressure": 43,
    },
)


class BehaviorStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"zones": [], "events": []}

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
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
            existing = {(zone["tenant_id"], zone["zone_id"]) for zone in payload["zones"]}
            for tenant_id in DEMO_TENANTS:
                for zone in SEED_ZONES:
                    if (tenant_id, zone["zone_id"]) in existing:
                        continue
                    payload["zones"].append({**zone, "tenant_id": tenant_id, "updated_at": utc_now_iso()})
                    created += 1
            self._write(payload)
        return {"created": created}

    def zones(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(zone) for zone in self._read()["zones"] if zone["tenant_id"] in tenant_ids]
        return sorted(rows, key=lambda zone: int(zone["population"]), reverse=True)

    def run(self, tenant_ids: list[str], scenario: str | None = None) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            payload["events"].append(
                {
                    "event_id": f"BEH-EVT-{len(payload['events']) + 1:05d}",
                    "tenant_id": tenant_ids[0],
                    "action": "behavior_run",
                    "scenario": scenario or "active_evacuation",
                    "created_at": utc_now_iso(),
                }
            )
            self._write(payload)
        return {"scenario": scenario or "active_evacuation", "generated_at": utc_now_iso()}


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEMO_TENANTS)
    return [str(tenant["tenant_id"])]


behavior_store = BehaviorStore(settings.sentra_behavior_store_path)


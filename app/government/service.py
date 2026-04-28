from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.government.border_ai import build_border_ai
from app.government.continuity import build_continuity
from app.government.defense_grid import build_defense_grid
from app.government.disaster_engine import build_disaster_engine, run_disaster_simulation
from app.government.infrastructure import build_infrastructure
from app.government.intelligence import build_multi_agency
from app.government.models import BASE_GOVERNMENT_METRICS, DEMO_TENANTS, government_id, utc_now_iso
from app.government.national_readiness import build_national_readiness
from app.government.sovereign_ai import build_sovereign_copilot
from app.government.warroom import build_wargame


class GovernmentStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"metrics": [], "events": [], "reports": []}

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
            existing = {item["tenant_id"] for item in payload["metrics"]}
            for tenant_id in DEMO_TENANTS:
                if tenant_id not in existing:
                    payload["metrics"].append({"tenant_id": tenant_id, **BASE_GOVERNMENT_METRICS, "updated_at": utc_now_iso()})
                    created += 1
            self._write(payload)
        return {"created": created}

    def metrics(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            return dict(self._find_metric(payload, tenant_ids))

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(tenant_ids)
        return {
            "generated_at": utc_now_iso(),
            **{
                key: metrics[key]
                for key in (
                    "national_readiness",
                    "cyber_defense",
                    "medical_surge_capacity",
                    "grid_stability",
                    "airports_protected",
                    "ports_protected",
                    "states_connected",
                    "active_agencies",
                    "threat_level",
                    "recovery_confidence",
                    "border_integrity",
                    "continuity_readiness",
                )
            },
        }

    def readiness(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_national_readiness(self.metrics(tenant_ids))

    def disaster(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_disaster_engine(self.metrics(tenant_ids))

    def defense(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_defense_grid(self.metrics(tenant_ids))

    def borders(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_border_ai(self.metrics(tenant_ids))

    def infrastructure(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_infrastructure(self.metrics(tenant_ids))

    def continuity(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_continuity(self.metrics(tenant_ids))

    def wargame(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_wargame(self.metrics(tenant_ids))

    def copilot(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(tenant_ids)
        return {
            **build_sovereign_copilot(metrics),
            "multi_agency": build_multi_agency(metrics),
        }

    def multi_agency(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_multi_agency(self.metrics(tenant_ids))

    def run_simulation(self, tenant_ids: list[str], scenario: str | None = None) -> dict[str, Any]:
        return run_disaster_simulation(self.metrics(tenant_ids), scenario)

    def action(self, tenant_ids: list[str], action: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        payload = payload or {}
        result: dict[str, Any] = {"action_id": government_id("GOV"), "action": action, "created_at": utc_now_iso()}
        if action == "simulation_run":
            result.update({"simulation": self.run_simulation(tenant_ids, str(payload.get("scenario") or "Cyclone"))})
        elif action == "emergency_activated":
            result.update({"region": payload.get("region") or "South Region", "posture": "national emergency command active", "agencies_notified": 9})
        elif action == "unit_deployed":
            result.update({"agency": payload.get("agency") or "Military", "units": int(payload.get("units") or 12), "region": payload.get("region") or "South Region"})
        elif action == "report_exported":
            result.update({"report_id": government_id("GOV-REPORT"), "status": "ready", "sections": ["Readiness", "Disaster", "Defense", "Infrastructure", "Continuity"]})
        else:
            result.update({"copilot": self.copilot(tenant_ids)})
        with self._lock:
            stored = self._read()
            if action == "report_exported":
                stored["reports"].append(result)
            self._append_event(stored, tenant_ids[0], action, str(result["action_id"]))
            self._write(stored)
        return result

    def _find_metric(self, payload: dict[str, Any], tenant_ids: list[str]) -> dict[str, Any]:
        metric = next((item for item in payload["metrics"] if item["tenant_id"] in tenant_ids), None)
        if metric is None:
            metric = {"tenant_id": tenant_ids[0], **BASE_GOVERNMENT_METRICS, "updated_at": utc_now_iso()}
            payload["metrics"].append(metric)
        return metric

    def _append_event(self, payload: dict[str, Any], tenant_id: str, action: str, target: str) -> None:
        payload["events"].append({"event_id": government_id("GOV-EVT"), "tenant_id": tenant_id, "action": action, "target": target, "created_at": utc_now_iso()})


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEMO_TENANTS)
    return [str(tenant["tenant_id"])]


government_store = GovernmentStore(settings.sentra_government_store_path)

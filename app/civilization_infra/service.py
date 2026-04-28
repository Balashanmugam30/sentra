from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.civilization_infra.cities import education_grid, mega_city_ops
from app.civilization_infra.disasters import continuity_sim, disaster_model, disaster_prediction, national_brief
from app.civilization_infra.grid import continuity_backbone, national_grid
from app.civilization_infra.healthcare import healthcare_network
from app.civilization_infra.models import DEMO_TENANTS, civilization_id, utc_now_iso
from app.civilization_infra.scoring import civilization_score, live_snapshot
from app.civilization_infra.transport import transport_command
from app.civilization_infra.utilities import food_security, utility_resilience, water_command
from app.core.config import settings


class CivilizationInfraStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"tenants": [], "events": [], "continuity_sims": [], "disaster_models": [], "briefs": []}

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
            existing = set(payload["tenants"])
            for tenant_id in DEMO_TENANTS:
                if tenant_id not in existing:
                    payload["tenants"].append(tenant_id)
                    created += 1
            self._write(payload)
        return {"created": created}

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        return {"generated_at": utc_now_iso(), **live_snapshot()}

    def grid(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"grid": national_grid(), "continuity": continuity_backbone()}

    def cities(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"cities": mega_city_ops(), "education": education_grid()}

    def utilities(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"utilities": utility_resilience(), "water": water_command(), "food": food_security()}

    def transport(self, tenant_ids: list[str]) -> dict[str, Any]:
        return transport_command()

    def healthcare(self, tenant_ids: list[str]) -> dict[str, Any]:
        return healthcare_network()

    def disasters(self, tenant_ids: list[str]) -> dict[str, Any]:
        return disaster_prediction()

    def score(self, tenant_ids: list[str]) -> dict[str, Any]:
        return civilization_score()

    def run_continuity_sim(self, tenant_id: str) -> dict[str, Any]:
        result = continuity_sim(tenant_id)
        self._record("continuity_sims", tenant_id, "continuity_sim_executed", result)
        return result

    def run_disaster_model(self, tenant_id: str) -> dict[str, Any]:
        result = disaster_model(tenant_id)
        self._record("disaster_models", tenant_id, "disaster_model_run", result)
        return result

    def generate_national_brief(self, tenant_id: str) -> dict[str, Any]:
        result = national_brief(tenant_id)
        self._record("briefs", tenant_id, "national_brief_generated", result)
        return result

    def _record(self, collection: str, tenant_id: str, action: str, result: dict[str, Any]) -> None:
        with self._lock:
            payload = self._read()
            payload[collection].append(result)
            payload["events"].append(
                {
                    "event_id": civilization_id("CIV-EVT"),
                    "tenant_id": tenant_id,
                    "action": action,
                    "target": str(result.get("simulation_id") or result.get("model_id") or result.get("brief_id")),
                    "created_at": utc_now_iso(),
                }
            )
            self._write(payload)


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    tenant_id = str(tenant["tenant_id"])
    if str(identity.get("role")) == "super_admin":
        return sorted(set(DEMO_TENANTS + [tenant_id]))
    return [tenant_id]


civilization_infra_store = CivilizationInfraStore(settings.sentra_civilization_infra_store_path)


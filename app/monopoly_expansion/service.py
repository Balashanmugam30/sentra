from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.monopoly_expansion.acquisitions import acquisition_model, acquisition_targets
from app.monopoly_expansion.bundling import launch_bundle, product_bundles
from app.monopoly_expansion.conquest import global_conquest, procurement_default
from app.monopoly_expansion.lockin import customer_lockin
from app.monopoly_expansion.models import DEMO_TENANTS, monopoly_id, utc_now_iso
from app.monopoly_expansion.network import market_consolidation, network_flywheel
from app.monopoly_expansion.partnerships import activate_partnership, channel_domination, strategic_partnerships
from app.monopoly_expansion.regulatory import regulatory_watch
from app.monopoly_expansion.scoring import board_strategy, live_snapshot, monopoly_score


class MonopolyExpansionStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"tenants": [], "events": [], "acquisition_models": [], "bundles": [], "simulations": [], "board_strategies": [], "partnerships": []}

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

    def acquisitions(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"targets": acquisition_targets(), "model": acquisition_model()}

    def partnerships(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"partners": strategic_partnerships(), "channel": channel_domination()}

    def conquest(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"global": global_conquest(), "procurement": procurement_default()}

    def lockin(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"lockin": customer_lockin(), "bundles": product_bundles()}

    def network(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"network": network_flywheel(), "consolidation": market_consolidation()}

    def regulatory(self, tenant_ids: list[str]) -> dict[str, Any]:
        return regulatory_watch()

    def score(self, tenant_ids: list[str]) -> dict[str, Any]:
        return monopoly_score()

    def run_acquisition_model(self, tenant_id: str, target: str | None) -> dict[str, Any]:
        result = {"model_id": monopoly_id("ACQ"), "tenant_id": tenant_id, "created_at": utc_now_iso(), **acquisition_model(target)}
        self._record("acquisition_models", tenant_id, "acquisition_model_run", result)
        return result

    def launch_bundle(self, tenant_id: str, bundle: str | None) -> dict[str, Any]:
        result = {"bundle_id": monopoly_id("BNDL"), "tenant_id": tenant_id, "created_at": utc_now_iso(), **launch_bundle(bundle)}
        self._record("bundles", tenant_id, "bundle_launched", result)
        return result

    def run_expansion_sim(self, tenant_id: str, scenario: str | None) -> dict[str, Any]:
        result = {
            "simulation_id": monopoly_id("XSIM"),
            "tenant_id": tenant_id,
            "scenario": scenario or "default_global_choice",
            "created_at": utc_now_iso(),
            "countries_after": 31,
            "partner_revenue_after": 12_800_000,
            "monopoly_score_after": 98,
            "board_move": "combine OpsVision acquisition, sovereign co-sell, and Data Empire bundle into one 12-month expansion plan",
        }
        self._record("simulations", tenant_id, "expansion_simulation_executed", result)
        return result

    def generate_board_strategy(self, tenant_id: str) -> dict[str, Any]:
        result = {"tenant_id": tenant_id, "created_at": utc_now_iso(), **board_strategy()}
        self._record("board_strategies", tenant_id, "board_strategy_generated", result)
        return result

    def activate_partnership(self, tenant_id: str) -> dict[str, Any]:
        result = {"partnership_id": monopoly_id("PART"), "tenant_id": tenant_id, "created_at": utc_now_iso(), **activate_partnership()}
        self._record("partnerships", tenant_id, "partnership_activated", result)
        return result

    def _record(self, collection: str, tenant_id: str, action: str, result: dict[str, Any]) -> None:
        with self._lock:
            payload = self._read()
            payload[collection].append(result)
            payload["events"].append(
                {
                    "event_id": monopoly_id("MON-EVT"),
                    "tenant_id": tenant_id,
                    "action": action,
                    "target": str(result.get("model_id") or result.get("bundle_id") or result.get("simulation_id") or result.get("strategy_id") or result.get("partnership_id")),
                    "created_at": utc_now_iso(),
                }
            )
            self._write(payload)


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    tenant_id = str(tenant["tenant_id"])
    if str(identity.get("role")) == "super_admin":
        return sorted(set(DEMO_TENANTS + [tenant_id]))
    return [tenant_id]


monopoly_expansion_store = MonopolyExpansionStore(settings.sentra_monopoly_expansion_store_path)


from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ecosystem.api_metering import api_usage_snapshot, developer_metrics
from app.ecosystem.apps import integration_health, marketplace_summary
from app.ecosystem.certification import certification_network, issue_certification
from app.ecosystem.expansion_ai import ecosystem_recommendations
from app.ecosystem.marketplace import install_app_row, seed_marketplace_apps
from app.ecosystem.models import DEMO_TENANTS, ecosystem_id, utc_now_iso
from app.ecosystem.network_effects import ecosystem_simulation, network_effects_snapshot
from app.ecosystem.oauth import create_api_key, white_label_sdk
from app.ecosystem.partners import launch_partner_row, seed_partner_network
from app.ecosystem.webhooks import webhook_health


class EcosystemStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "apps": [],
            "partners": [],
            "api_keys": [],
            "certifications_issued": [],
            "simulations": [],
            "events": [],
        }

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
            existing_apps = {(item["tenant_id"], item["app_id"]) for item in payload["apps"]}
            existing_partners = {item["tenant_id"] for item in payload["partners"]}
            for tenant_id in DEMO_TENANTS:
                for app in seed_marketplace_apps(tenant_id):
                    if (tenant_id, app["app_id"]) not in existing_apps:
                        payload["apps"].append(app)
                        created += 1
                if tenant_id not in existing_partners:
                    payload["partners"].extend(seed_partner_network(tenant_id))
            self._write(payload)
        return {"created": created}

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        apps = self.marketplace(tenant_ids)["apps"]
        partners = self.partners(tenant_ids)
        api_usage = api_usage_snapshot(tenant_ids[0])
        developers = developer_metrics(tenant_ids[0])
        certifications = self.certifications(tenant_ids)
        partner_pipeline = sum(int(item["pipeline"]) for item in partners)
        partner_arr = sum(int(item["sourced_arr"]) for item in partners)
        summary = marketplace_summary(apps)
        network = network_effects_snapshot(apps, partners)
        return {
            "generated_at": utc_now_iso(),
            "installed_apps": summary["installed_apps"],
            "active_integrations": summary["active_apps"],
            "marketplace_arr": summary["marketplace_arr"],
            "api_requests_day": api_usage["requests_day"],
            "webhook_events_day": api_usage["webhook_events_day"],
            "usage_revenue_mrr": api_usage["usage_revenue_mrr"],
            "active_developers": developers["developers_active"],
            "sdk_downloads": developers["sdk_downloads"],
            "partners_active": 63,
            "partner_pipeline": partner_pipeline or 9_700_000,
            "partner_arr": partner_arr or 3_200_000,
            "certified_experts": sum(int(item["certified_count"]) for item in certifications),
            "training_revenue": sum(int(item["training_revenue"]) for item in certifications),
            "moat_score": network["moat_score"],
            "expansion_score": network["expansion_score"],
            "top_app_category": summary["top_app_category"],
        }

    def marketplace(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        apps = self._list("apps", tenant_ids)
        return {"apps": sorted(apps, key=lambda item: int(item["marketplace_arr"]), reverse=True), "summary": marketplace_summary(apps)}

    def integrations(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return integration_health(self.marketplace(tenant_ids)["apps"])

    def developers(self, tenant_ids: list[str]) -> dict[str, Any]:
        tenant_id = tenant_ids[0]
        return {"developers": developer_metrics(tenant_id), "white_label_sdk": white_label_sdk(tenant_id)}

    def api_usage(self, tenant_ids: list[str]) -> dict[str, Any]:
        return api_usage_snapshot(tenant_ids[0])

    def webhooks(self, tenant_ids: list[str]) -> dict[str, Any]:
        return webhook_health(tenant_ids[0])

    def partners(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("partners", tenant_ids), key=lambda item: int(item["pipeline"]), reverse=True)

    def certifications(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return certification_network(tenant_ids[0])

    def network_effects(self, tenant_ids: list[str]) -> dict[str, Any]:
        return network_effects_snapshot(self.marketplace(tenant_ids)["apps"], self.partners(tenant_ids))

    def expansion_ai(self) -> list[dict[str, Any]]:
        return ecosystem_recommendations()

    def create_api_key(self, tenant_id: str, label: str | None) -> dict[str, Any]:
        key = create_api_key(tenant_id, label)
        with self._lock:
            payload = self._read()
            payload["api_keys"].append(key)
            self._append_event(payload, tenant_id, "api_key_created", str(key["key_id"]))
            self._write(payload)
        return key

    def install_app(self, tenant_id: str, app_id: str, installed_by: str) -> dict[str, Any]:
        install = install_app_row(tenant_id, app_id, installed_by)
        with self._lock:
            payload = self._read()
            payload["apps"] = [
                item
                for item in payload["apps"]
                if not (item["tenant_id"] == tenant_id and item["app_id"] == app_id)
            ]
            payload["apps"].append(install)
            self._append_event(payload, tenant_id, "app_installed", app_id)
            self._write(payload)
        return install

    def launch_partner(self, tenant_id: str, partner_type: str | None) -> dict[str, Any]:
        partner = launch_partner_row(tenant_id, partner_type)
        with self._lock:
            payload = self._read()
            payload["partners"].append(partner)
            self._append_event(payload, tenant_id, "partner_launched", str(partner["partner_id"]))
            self._write(payload)
        return partner

    def run_simulation(self, tenant_id: str, scenario: str | None) -> dict[str, Any]:
        simulation = {"simulation_id": ecosystem_id("ESIM"), "tenant_id": tenant_id, **ecosystem_simulation(), "created_at": utc_now_iso()}
        if scenario:
            simulation["scenario"] = scenario
        with self._lock:
            payload = self._read()
            payload["simulations"].append(simulation)
            self._append_event(payload, tenant_id, "simulation_run", str(simulation["scenario"]))
            self._write(payload)
        return simulation

    def issue_certification(self, tenant_id: str, track: str | None) -> dict[str, Any]:
        certification = issue_certification(tenant_id, track)
        with self._lock:
            payload = self._read()
            payload["certifications_issued"].append(certification)
            self._append_event(payload, tenant_id, "certification_issued", str(certification["credential_id"]))
            self._write(payload)
        return certification

    def _list(self, key: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(item) for item in self._read()[key] if item["tenant_id"] in tenant_ids]

    def _append_event(self, payload: dict[str, Any], tenant_id: str, action: str, target: str) -> None:
        payload["events"].append(
            {
                "event_id": ecosystem_id("EEVT"),
                "tenant_id": tenant_id,
                "action": action,
                "target": target,
                "created_at": utc_now_iso(),
            }
        )


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    tenant_id = str(tenant["tenant_id"])
    if str(identity.get("role")) == "super_admin":
        return sorted(set(DEMO_TENANTS + [tenant_id]))
    return [tenant_id]


ecosystem_store = EcosystemStore(settings.sentra_ecosystem_store_path)

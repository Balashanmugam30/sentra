from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.revenue_growth.authority import build_authority_signals, trust_score
from app.revenue_growth.conversion_ai import build_conversion_metrics, conversion_recommendations, demo_to_paid
from app.revenue_growth.funnels import build_funnel, funnel_metrics
from app.revenue_growth.models import DEMO_TENANTS, LEAD_SOURCES, revenue_growth_id, utc_now_iso
from app.revenue_growth.pricing_psychology import build_pricing_experiments, run_pricing_test
from app.revenue_growth.referrals import launch_referral_campaign, seed_referral_programs
from app.revenue_growth.sales_ai import build_sales_actions, create_lead_action
from app.revenue_growth.viral import build_viral_loop, simulate_growth_loop
from app.revenue_growth.waitlist import build_waitlist


class RevenueGrowthStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "lead_sources": [],
            "referral_programs": [],
            "sales_actions": [],
            "custom_leads": [],
            "pricing_tests": [],
            "campaigns": [],
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
            existing_sources = {(item["tenant_id"], item["source_id"]) for item in payload["lead_sources"]}
            existing_referrals = {item["tenant_id"] for item in payload["referral_programs"]}
            existing_actions = {item["tenant_id"] for item in payload["sales_actions"]}
            for tenant_id in DEMO_TENANTS:
                for source_id, name, leads, conversion_rate, cac in LEAD_SOURCES:
                    if (tenant_id, source_id) in existing_sources:
                        continue
                    payload["lead_sources"].append(
                        {
                            "source_id": source_id,
                            "tenant_id": tenant_id,
                            "name": name,
                            "leads": leads,
                            "conversion_rate": conversion_rate,
                            "cac": cac,
                            "pipeline_value": round(leads * conversion_rate * 310),
                            "status": "dominant" if conversion_rate >= 10 else "scaling",
                        }
                    )
                    created += 1
                if tenant_id not in existing_referrals:
                    payload["referral_programs"].extend(seed_referral_programs(tenant_id))
                if tenant_id not in existing_actions:
                    payload["sales_actions"].extend(build_sales_actions(tenant_id))
            self._write(payload)
        return {"created": created}

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        tenant_id = tenant_ids[0]
        funnel = build_funnel(tenant_id)
        metrics = funnel_metrics(funnel)
        sources = self.lead_sources(tenant_ids)
        best_cac = min(sources, key=lambda item: int(item["cac"])) if sources else {"name": "Referral"}
        referrals = self.referrals(tenant_ids)
        referral_revenue = sum(int(item["revenue_generated"]) for item in referrals)
        return {
            "generated_at": utc_now_iso(),
            "visitors_month": 142_000,
            "leads": 8_240,
            "trials": 1_940,
            "paid_customers": 418,
            "enterprise_customers": 12,
            "mrr": 68_500,
            "arr": 822_000,
            "visitor_to_lead": metrics["visitor_to_lead"],
            "lead_to_trial": metrics["lead_to_trial"],
            "trial_to_paid": metrics["trial_to_paid"],
            "referral_revenue": referral_revenue,
            "viral_coefficient": 1.34,
            "avg_cac": 118,
            "ltv_cac": 8.1,
            "growth_score": 93,
            "best_cac_channel": str(best_cac["name"]),
        }

    def funnel(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return build_funnel(tenant_ids[0])

    def lead_sources(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("lead_sources", tenant_ids), key=lambda item: int(item["leads"]), reverse=True)

    def conversion(self, tenant_ids: list[str]) -> dict[str, Any]:
        tenant_id = tenant_ids[0]
        return {
            "metrics": build_conversion_metrics(tenant_id),
            "demo_to_paid": demo_to_paid(tenant_id),
            "recommendations": self.sales_ai(tenant_ids)[:3],
        }

    def referrals(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("referral_programs", tenant_ids), key=lambda item: int(item["revenue_generated"]), reverse=True)

    def viral(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"tenant_id": tenant_ids[0], **build_viral_loop()}

    def pricing(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        tenant_id = tenant_ids[0]
        return sorted(build_pricing_experiments(tenant_id), key=lambda item: float(item["conversion_rate"]) * int(item["arpu"]), reverse=True)

    def sales_ai(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        actions = self._list("sales_actions", tenant_ids)
        return sorted(actions, key=lambda item: (str(item["priority"]) == "critical", int(item["expected_revenue"])), reverse=True)

    def waitlist(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_waitlist(tenant_ids[0])

    def authority(self, tenant_ids: list[str]) -> dict[str, Any]:
        signals = build_authority_signals(tenant_ids[0])
        return {"signals": signals, "trust_score": trust_score(signals)}

    def run_pricing_test(self, tenant_id: str, variant: str | None) -> dict[str, Any]:
        result = run_pricing_test(tenant_id, variant)
        with self._lock:
            payload = self._read()
            payload["pricing_tests"].append({"test_id": revenue_growth_id("PTEST"), "tenant_id": tenant_id, **result, "created_at": utc_now_iso()})
            self._append_event(payload, tenant_id, "pricing_test_launched", str(result["winner"]["experiment_id"]))
            self._write(payload)
        return result

    def create_lead(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        source = str(data.get("source") or "demo_request")
        expected_value = int(data.get("expected_value") or 128_000)
        lead = {
            "lead_id": revenue_growth_id("RLEAD"),
            "tenant_id": tenant_id,
            "company_name": data.get("company_name") or "Apex Continuity Group",
            "contact_name": data.get("contact_name") or "Mira Stone",
            "email": data.get("email") or "mira@apexcontinuity.example",
            "source": source,
            "expected_value": expected_value,
            "score": 88 if expected_value >= 100_000 else 74,
            "status": "qualified",
            "created_at": utc_now_iso(),
        }
        action = create_lead_action(tenant_id, str(lead["company_name"]), source, expected_value)
        with self._lock:
            payload = self._read()
            payload["custom_leads"].append(lead)
            payload["sales_actions"].append(action)
            for item in payload["lead_sources"]:
                if item["tenant_id"] == tenant_id and item["source_id"] == source:
                    item["leads"] = int(item["leads"]) + 1
                    item["pipeline_value"] = int(item["pipeline_value"]) + expected_value
            self._append_event(payload, tenant_id, "lead_created", str(lead["lead_id"]))
            self._write(payload)
        return lead

    def launch_referral_campaign(self, tenant_ids: list[str], campaign: str | None) -> dict[str, Any]:
        campaign_name = campaign or "executive_referral_sprint"
        with self._lock:
            payload = self._read()
            for tenant_id in tenant_ids:
                programs = [item for item in payload["referral_programs"] if item["tenant_id"] == tenant_id]
                updated = launch_referral_campaign(programs, campaign_name)
                payload["referral_programs"] = [item for item in payload["referral_programs"] if item["tenant_id"] != tenant_id] + updated
                payload["campaigns"].append({"campaign_id": revenue_growth_id("RCAMP"), "tenant_id": tenant_id, "name": campaign_name, "created_at": utc_now_iso(), "status": "active"})
                self._append_event(payload, tenant_id, "campaign_started", campaign_name)
            self._write(payload)
        return {"campaign": campaign_name, "projected_referral_revenue": 124_000}

    def run_growth_simulation(self, tenant_ids: list[str], scenario: str | None) -> dict[str, Any]:
        current = self.live(tenant_ids)
        simulation = simulate_growth_loop(int(current["growth_score"]))
        simulation["scenario"] = scenario or str(simulation["scenario"])
        with self._lock:
            payload = self._read()
            payload["simulations"].append({"simulation_id": revenue_growth_id("RSIM"), "tenant_id": tenant_ids[0], **simulation, "created_at": utc_now_iso()})
            self._append_event(payload, tenant_ids[0], "simulation_run", str(simulation["scenario"]))
            self._write(payload)
        return simulation

    def _list(self, key: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(item) for item in self._read()[key] if item["tenant_id"] in tenant_ids]

    def _append_event(self, payload: dict[str, Any], tenant_id: str, action: str, target: str) -> None:
        payload["events"].append(
            {
                "event_id": revenue_growth_id("RGEVT"),
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


revenue_growth_store = RevenueGrowthStore(settings.sentra_revenue_growth_store_path)

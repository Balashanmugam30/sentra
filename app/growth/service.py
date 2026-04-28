from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.growth.contracts import create_contract, seed_contracts
from app.growth.expansion_ai import build_expansion_recommendations
from app.growth.forecast import build_global_forecast
from app.growth.models import COUNTRIES, DEMO_TENANTS, REGIONS, growth_id, utc_now_iso
from app.growth.pricing import pricing_for_country
from app.growth.territories import build_territories


class GrowthStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "regions": [],
            "countries": [],
            "territories": [],
            "channel_partners": [],
            "contracts": [],
            "crm_deals": [],
            "leads": [],
            "customers": [],
            "pricing": [],
            "white_labels": [],
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
            existing_country_scope = {(country["tenant_id"], country["country_id"]) for country in payload["countries"]}
            for tenant_id in DEMO_TENANTS:
                tenant_countries = []
                for country in COUNTRIES:
                    if (tenant_id, country["country_id"]) in existing_country_scope:
                        tenant_countries.append(next(item for item in payload["countries"] if item["tenant_id"] == tenant_id and item["country_id"] == country["country_id"]))
                        continue
                    row = {**country, "tenant_id": tenant_id, "launched_at": utc_now_iso() if country["status"] == "launched" else None}
                    payload["countries"].append(row)
                    tenant_countries.append(row)
                    payload["pricing"].extend(pricing_for_country(tenant_id, row))
                    created += 1
                if not any(region["tenant_id"] == tenant_id for region in payload["regions"]):
                    payload["regions"].extend(_seed_regions(tenant_id, tenant_countries))
                if not any(territory["tenant_id"] == tenant_id for territory in payload["territories"]):
                    payload["territories"].extend(build_territories(tenant_id, tenant_countries))
                if not any(contract["tenant_id"] == tenant_id for contract in payload["contracts"]):
                    payload["contracts"].extend(seed_contracts(tenant_id))
                if not any(deal["tenant_id"] == tenant_id for deal in payload["crm_deals"]):
                    payload["crm_deals"].extend(_seed_crm_deals(tenant_id))
                if not any(lead["tenant_id"] == tenant_id for lead in payload["leads"]):
                    payload["leads"].extend(_seed_leads(tenant_id))
                if not any(customer["tenant_id"] == tenant_id for customer in payload["customers"]):
                    payload["customers"].extend(_seed_customers(tenant_id))
                if not any(partner["tenant_id"] == tenant_id for partner in payload["channel_partners"]):
                    payload["channel_partners"].extend(_seed_channel_partners(tenant_id))
                if not any(item["tenant_id"] == tenant_id for item in payload["white_labels"]):
                    payload["white_labels"].extend(_seed_white_labels(tenant_id))
            self._write(payload)
        return {"created": created}

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        countries = self.countries(tenant_ids)
        regions = self.regions(tenant_ids)
        contracts = self.contracts(tenant_ids)
        partners = self.channel_partners(tenant_ids)
        forecast = build_global_forecast(countries, contracts, partners)
        unique_countries = {country["name"] for country in countries}
        return {
            "generated_at": utc_now_iso(),
            "countries_live": len(unique_countries),
            "regions_active": len({region["name"] for region in regions if region["status"] == "active"}),
            "pipeline_arr": forecast["global_arr_pipeline"],
            "closed_arr": forecast["closed_arr"],
            "open_government_deals": forecast["government_contracts_open"],
            "partners_active": forecast["partners_active"],
            "launches_this_quarter": len([country for country in countries if country["status"] in ("launched", "pilot")]),
            "expansion_score": forecast["expansion_score"],
            "best_market": forecast["best_market"],
            "fastest_win_cycle": forecast["fastest_win_cycle"],
            "highest_ticket_size": forecast["highest_ticket_size"],
        }

    def regions(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return self._list("regions", tenant_ids)

    def countries(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("countries", tenant_ids), key=lambda country: int(country["market_score"]), reverse=True)

    def territories(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("territories", tenant_ids), key=lambda territory: int(territory["ARR_potential"]), reverse=True)

    def channel_partners(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("channel_partners", tenant_ids), key=lambda partner: int(partner["pipeline_influenced"]), reverse=True)

    def contracts(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("contracts", tenant_ids), key=lambda contract: int(contract["value"]), reverse=True)

    def pricing(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("pricing", tenant_ids), key=lambda item: (item["country"], item["usd_equivalent_monthly"]))

    def forecast(self, tenant_ids: list[str]) -> dict[str, Any]:
        forecast = build_global_forecast(self.countries(tenant_ids), self.contracts(tenant_ids), self.channel_partners(tenant_ids))
        deals = self.deals(tenant_ids)
        customers = self.customers(tenant_ids)
        weighted = sum(round(int(deal["arr_value"]) * int(deal["probability"]) / 100) for deal in deals)
        likely_closes = sum(int(deal["arr_value"]) for deal in deals if int(deal["probability"]) >= 70 and deal["stage"] not in {"Won", "Lost"})
        expansion = sum(int(item["expansion_potential"]) for item in customers if item["status"] == "expansion ready")
        forecast.update(
            {
                "weighted_pipeline_arr": weighted,
                "likely_closes_this_month": likely_closes,
                "quarter_forecast": weighted + round(expansion * 0.36),
                "best_case": round((weighted + expansion) * 1.18),
                "worst_case": round(weighted * 0.62),
                "rep_attainment": self.rep_leaderboard(tenant_ids),
            }
        )
        return forecast

    def pipeline(self, tenant_ids: list[str]) -> dict[str, Any]:
        contracts = self.contracts(tenant_ids)
        deals = self.deals(tenant_ids)
        by_stage: dict[str, int] = {}
        by_type: dict[str, int] = {}
        for contract in contracts:
            by_stage[contract["stage"]] = by_stage.get(contract["stage"], 0) + int(contract["value"])
            by_type[contract["deal_type"]] = by_type.get(contract["deal_type"], 0) + int(contract["value"])
        crm_by_stage: dict[str, int] = {}
        for deal in deals:
            crm_by_stage[deal["stage"]] = crm_by_stage.get(deal["stage"], 0) + int(deal["arr_value"])
        return {
            "by_stage": by_stage,
            "by_type": by_type,
            "crm_by_stage": crm_by_stage,
            "largest_deals": contracts[:6],
            "hot_deals": deals[:8],
            "weighted_pipeline": sum(round(int(contract["value"]) * int(contract["probability"]) / 100) for contract in contracts),
            "weighted_crm_forecast": sum(round(int(deal["arr_value"]) * int(deal["probability"]) / 100) for deal in deals),
        }

    def gtm_summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        deals = self.deals(tenant_ids)
        leads = self.leads(tenant_ids)
        funnel = self.funnel(tenant_ids)
        customers = self.customers(tenant_ids)
        pipeline_value = sum(int(deal["arr_value"]) for deal in deals if deal["stage"] not in {"Won", "Lost"})
        weighted = sum(round(int(deal["arr_value"]) * int(deal["probability"]) / 100) for deal in deals if deal["stage"] not in {"Won", "Lost"})
        renewal_pipeline = sum(int(customer["arr"]) for customer in customers if customer["status"] in {"watch", "at risk", "healthy"})
        expansion_pipeline = sum(int(customer["expansion_potential"]) for customer in customers)
        return {
            "generated_at": utc_now_iso(),
            "pipeline_value": pipeline_value,
            "weighted_forecast": weighted,
            "visitors": 142_000,
            "leads": len(leads) + 8_240,
            "demos_booked_percent": 18.4,
            "sql_percent": 31.8,
            "close_percent": 21.6,
            "cac": 118,
            "cpl": 14,
            "viral_coefficient": 1.34,
            "renewal_pipeline": renewal_pipeline,
            "expansion_pipeline": expansion_pipeline,
            "churn_risk_accounts": len([customer for customer in customers if customer["status"] == "at risk"]),
            "customer_health_score": round(sum(int(customer["adoption_score"]) for customer in customers) / max(1, len(customers))),
            "quarter_forecast": weighted + round(expansion_pipeline * 0.32),
            "best_case": round((weighted + expansion_pipeline) * 1.16),
            "worst_case": round(weighted * 0.64),
            "funnel_leaks": funnel["leaks"],
        }

    def deals(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("crm_deals", tenant_ids), key=lambda deal: (int(deal["probability"]), int(deal["arr_value"])), reverse=True)

    def leads(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        leads = self._list("leads", tenant_ids)
        for lead in leads:
            lead["ai_score"] = _lead_score(lead)
            lead["recommended_action"] = _lead_action(lead)
        return sorted(leads, key=lambda lead: int(lead["ai_score"]), reverse=True)

    def funnel(self, tenant_ids: list[str]) -> dict[str, Any]:
        deals = self.deals(tenant_ids)
        won_value = sum(int(deal["arr_value"]) for deal in deals if deal["stage"] == "Won")
        stages = [
            {"stage": "Visitors", "count": 142_000, "conversion_rate": 100.0, "dropoff_rate": 0.0, "revenue_value": 0},
            {"stage": "Leads", "count": 8_240, "conversion_rate": 5.8, "dropoff_rate": 94.2, "revenue_value": 1_900_000},
            {"stage": "MQL", "count": 3_180, "conversion_rate": 38.6, "dropoff_rate": 61.4, "revenue_value": 1_420_000},
            {"stage": "SQL", "count": 1_012, "conversion_rate": 31.8, "dropoff_rate": 68.2, "revenue_value": 990_000},
            {"stage": "Demo", "count": 186, "conversion_rate": 18.4, "dropoff_rate": 81.6, "revenue_value": 720_000},
            {"stage": "Proposal", "count": 84, "conversion_rate": 45.2, "dropoff_rate": 54.8, "revenue_value": 520_000},
            {"stage": "Won", "count": 18, "conversion_rate": 21.6, "dropoff_rate": 78.4, "revenue_value": max(won_value, 418_000)},
        ]
        channels = [
            {"source": "website", "visitors": 64_000, "leads": 3_120, "cpl": 9, "cac": 104, "close_rate": 18.2, "roi": 7.4, "pipeline_value": 520_000},
            {"source": "referral", "visitors": 12_800, "leads": 1_180, "cpl": 6, "cac": 72, "close_rate": 31.0, "roi": 12.6, "pipeline_value": 420_000},
            {"source": "LinkedIn outbound", "visitors": 8_600, "leads": 740, "cpl": 21, "cac": 184, "close_rate": 14.8, "roi": 5.3, "pipeline_value": 310_000},
            {"source": "partner", "visitors": 4_900, "leads": 540, "cpl": 16, "cac": 118, "close_rate": 26.2, "roi": 9.8, "pipeline_value": 660_000},
            {"source": "government RFP", "visitors": 910, "leads": 88, "cpl": 44, "cac": 410, "close_rate": 11.4, "roi": 18.2, "pipeline_value": 1_200_000},
        ]
        return {
            "stages": stages,
            "channels": channels,
            "referral_engine": {
                "referrals_sent": 1_240,
                "accepted": 386,
                "revenue_generated": 96_000,
                "viral_coefficient": 1.34,
                "best_ambassador": "Grand Meridian Hotel",
            },
            "leaks": [
                "Demo to proposal conversion has 54.8% dropoff; add security ROI proof deck.",
                "LinkedIn outbound CAC is elevated; route only high-score healthcare and campus accounts.",
                "Government RFP close rate is slow but high value; assign procurement specialist earlier.",
            ],
        }

    def customers(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("customers", tenant_ids), key=lambda customer: int(customer["arr"]), reverse=True)

    def renewals(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        renewals = []
        for customer in self.customers(tenant_ids):
            risk = customer["status"]
            renewals.append(
                {
                    "renewal_id": f"REN-{customer['customer_id']}",
                    "customer": customer["customer"],
                    "due_bucket": _renewal_bucket(str(customer["renewal_date"])),
                    "renewal_date": customer["renewal_date"],
                    "arr": customer["arr"],
                    "risk": risk,
                    "owner": customer["owner"],
                    "recommended_playbook": _renewal_playbook(customer),
                }
            )
        return renewals

    def expansions(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return [
            {
                "opportunity_id": f"EXP-{customer['customer_id']}",
                "customer": customer["customer"],
                "type": _expansion_type(customer),
                "potential_arr": int(customer["expansion_potential"]),
                "confidence": max(62, 100 - int(customer["risk_score"])),
                "trigger": customer["expansion_trigger"],
                "next_action": _expansion_action(customer),
            }
            for customer in self.customers(tenant_ids)
            if int(customer["expansion_potential"]) > 0
        ]

    def rep_leaderboard(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        reps: dict[str, dict[str, Any]] = {}
        for deal in self.deals(tenant_ids):
            rep = str(deal["owner"])
            record = reps.setdefault(rep, {"rep": rep, "pipeline": 0, "weighted_forecast": 0, "closed_arr": 0, "won": 0, "count": 0})
            record["count"] += 1
            if deal["stage"] == "Won":
                record["closed_arr"] += int(deal["arr_value"])
                record["won"] += 1
            elif deal["stage"] != "Lost":
                record["pipeline"] += int(deal["arr_value"])
                record["weighted_forecast"] += round(int(deal["arr_value"]) * int(deal["probability"]) / 100)
        leaderboard = []
        for record in reps.values():
            count = max(1, int(record.pop("count")))
            won = int(record.pop("won"))
            record["attainment"] = min(142, round((int(record["closed_arr"]) + int(record["weighted_forecast"])) / 4_000))
            record["win_rate"] = round((won / count) * 100, 1)
            leaderboard.append(record)
        return sorted(leaderboard, key=lambda rep: int(rep["weighted_forecast"]) + int(rep["closed_arr"]), reverse=True)

    def update_deal(self, tenant_ids: list[str], data: dict[str, Any]) -> dict[str, Any] | None:
        deal_id = str(data.get("deal_id") or "")
        with self._lock:
            payload = self._read()
            deal = next((item for item in payload["crm_deals"] if item["tenant_id"] in tenant_ids and item["deal_id"] == deal_id), None)
            if deal is None:
                return None
            if data.get("stage"):
                deal["stage"] = data["stage"]
                deal["probability"] = _stage_probability(str(data["stage"]), int(deal["probability"]))
            if data.get("owner"):
                deal["owner"] = data["owner"]
            if data.get("note"):
                deal.setdefault("notes", []).append(str(data["note"]))
            self._append_event(payload, str(deal["tenant_id"]), "deal_updated", deal_id)
            self._write(payload)
            return dict(deal)

    def save_customer(self, tenant_ids: list[str], data: dict[str, Any]) -> dict[str, Any] | None:
        customer_id = str(data.get("customer_id") or "")
        with self._lock:
            payload = self._read()
            customer = next((item for item in payload["customers"] if item["tenant_id"] in tenant_ids and item["customer_id"] == customer_id), None)
            if customer is None:
                return None
            customer["status"] = "watch"
            customer["risk_score"] = max(12, int(customer["risk_score"]) - 18)
            customer["next_success_action"] = "Save playbook launched: executive check-in, adoption audit, and renewal value recap."
            self._append_event(payload, str(customer["tenant_id"]), "customer_save_playbook_launched", customer_id)
            self._write(payload)
            return dict(customer)

    def expand_customer(self, tenant_ids: list[str], data: dict[str, Any]) -> dict[str, Any] | None:
        customer_id = str(data.get("customer_id") or "")
        with self._lock:
            payload = self._read()
            customer = next((item for item in payload["customers"] if item["tenant_id"] in tenant_ids and item["customer_id"] == customer_id), None)
            if customer is None:
                return None
            uplift = max(12_000, round(int(customer["expansion_potential"]) * 0.42))
            customer["arr"] = int(customer["arr"]) + uplift
            customer["expansion_potential"] = max(0, int(customer["expansion_potential"]) - uplift)
            customer["status"] = "healthy"
            customer["next_success_action"] = "Expansion motion launched and forecast updated."
            self._append_event(payload, str(customer["tenant_id"]), "customer_expansion_launched", customer_id)
            self._write(payload)
            return dict(customer)

    def white_labels(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return self._list("white_labels", tenant_ids)

    def expansion_ai(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return build_expansion_recommendations(self.countries(tenant_ids), self.channel_partners(tenant_ids))

    def launch_country(self, tenant_ids: list[str], country_name: str) -> dict[str, Any] | None:
        return self._patch_country(tenant_ids, country_name, {"status": "launched", "deployment_readiness": 96, "launched_at": utc_now_iso()}, "country_launched")

    def open_region(self, tenant_ids: list[str], region_name: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            region = next((item for item in payload["regions"] if item["tenant_id"] in tenant_ids and item["name"].lower() == region_name.lower()), None)
            if region is None:
                return None
            region["status"] = "active"
            self._append_event(payload, str(region["tenant_id"]), "region_opened", region["name"])
            self._write(payload)
            return dict(region)

    def create_enterprise_deal(self, tenant_id: str, data: dict[str, Any], government: bool = False) -> dict[str, Any]:
        contract = create_contract(tenant_id, data, government=government)
        with self._lock:
            payload = self._read()
            payload["contracts"].append(contract)
            self._append_event(payload, tenant_id, "government_deal_created" if government else "enterprise_deal_created", contract["contract_id"])
            self._write(payload)
        return contract

    def assign_partner(self, tenant_ids: list[str], partner_id: str, country_name: str | None = None) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            partner = next((item for item in payload["channel_partners"] if item["tenant_id"] in tenant_ids and item["partner_id"] == partner_id), None)
            if partner is None:
                return None
            if country_name and country_name not in partner["country_coverage"]:
                partner["country_coverage"].append(country_name)
            partner["pipeline_influenced"] = int(partner["pipeline_influenced"]) + 180_000
            partner["certification_score"] = min(100, int(partner["certification_score"]) + 3)
            self._append_event(payload, str(partner["tenant_id"]), "partner_assigned", partner_id)
            self._write(payload)
            return dict(partner)

    def change_pricing(self, tenant_ids: list[str], country_name: str, plan: str, percent: int) -> list[dict[str, Any]]:
        changed = []
        multiplier = 1 + percent / 100
        with self._lock:
            payload = self._read()
            for price in payload["pricing"]:
                if price["tenant_id"] in tenant_ids and price["country"].lower() == country_name.lower() and price["plan"].lower() == plan.lower():
                    price["local_monthly"] = round(int(price["local_monthly"]) * multiplier)
                    price["local_annual"] = price["local_monthly"] * 10
                    price["usd_equivalent_monthly"] = round(int(price["usd_equivalent_monthly"]) * multiplier)
                    price["premium_uplift_percent"] = int(price["premium_uplift_percent"]) + percent
                    changed.append(dict(price))
            if changed:
                self._append_event(payload, str(changed[0]["tenant_id"]), "pricing_changed", f"{country_name}:{plan}:{percent}")
            self._write(payload)
        return changed

    def create_franchise(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        name = data.get("name") or "Sentra Gulf Edition"
        partner = data.get("partner_name") or "Regional Partner"
        program = {
            "franchise_id": growth_id("WLB"),
            "tenant_id": tenant_id,
            "name": name,
            "partner_name": partner,
            "custom_domain": f"{name.lower().replace(' ', '-')}.sentra.example",
            "custom_logo": "partner-logo.svg",
            "custom_theme": "navy-cyan-gold",
            "reseller_owned_billing": True,
            "regional_hosting_tag": data.get("region") or "gulf",
            "language_pack": "en",
            "status": "active",
            "created_at": utc_now_iso(),
        }
        with self._lock:
            payload = self._read()
            payload["white_labels"].append(program)
            self._append_event(payload, tenant_id, "white_label_created", program["franchise_id"])
            self._write(payload)
        return program

    def run_expansion_simulation(self, tenant_ids: list[str], scenario: str | None = None) -> dict[str, Any]:
        recommendations = self.expansion_ai(tenant_ids)
        forecast = self.forecast(tenant_ids)
        with self._lock:
            payload = self._read()
            self._append_event(payload, tenant_ids[0], "simulation_run", scenario or "default")
            self._write(payload)
        return {
            "scenario": scenario or "uae_first",
            "winner": recommendations[0]["title"] if recommendations else "Launch UAE first",
            "projected_arr_12m": forecast["projected_arr_12m"],
            "risk_adjusted_confidence": 88,
            "next_actions": [item["cta"] for item in recommendations[:3]],
        }

    def _list(self, key: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(item) for item in self._read()[key] if item["tenant_id"] in tenant_ids]

    def _patch_country(self, tenant_ids: list[str], country_name: str, updates: dict[str, Any], event_type: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            country = next((item for item in payload["countries"] if item["tenant_id"] in tenant_ids and item["name"].lower() == country_name.lower()), None)
            if country is None:
                return None
            country.update(updates)
            self._append_event(payload, str(country["tenant_id"]), event_type, country["name"])
            self._write(payload)
            return dict(country)

    def _append_event(self, payload: dict[str, Any], tenant_id: str, action: str, target: str) -> None:
        payload["events"].append({"event_id": f"GROWTH-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_id, "action": action, "target": target, "created_at": utc_now_iso()})


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEMO_TENANTS)
    return [str(tenant["tenant_id"])]


def _seed_regions(tenant_id: str, countries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    regions = []
    for region in REGIONS:
        region_countries = [country for country in countries if country["region"] == region["name"]]
        regions.append(
            {
                **region,
                "tenant_id": tenant_id,
                "countries_live": len([country for country in region_countries if country["status"] in ("launched", "pilot")]),
                "pipeline_arr": sum(int(country["ARR_potential"]) for country in region_countries),
                "owner": f"{region['name']} GTM Lead",
            }
        )
    return regions


def _seed_channel_partners(tenant_id: str) -> list[dict[str, Any]]:
    return [
        {"partner_id": f"CHP-{tenant_id}-SHIELD", "tenant_id": tenant_id, "name": "ShieldGrid Global", "partner_type": "systems integrator", "country_coverage": ["USA", "UAE", "Germany"], "pipeline_influenced": 2_400_000, "ARR_closed": 820_000, "commission_due": 86_000, "certification_score": 94, "win_rate": 42, "status": "active"},
        {"partner_id": f"CHP-{tenant_id}-BHARAT", "tenant_id": tenant_id, "name": "Bharat Ops Consulting", "partner_type": "reseller", "country_coverage": ["India", "Singapore"], "pipeline_influenced": 1_800_000, "ARR_closed": 640_000, "commission_due": 52_000, "certification_score": 88, "win_rate": 39, "status": "active"},
        {"partner_id": f"CHP-{tenant_id}-CIVIC", "tenant_id": tenant_id, "name": "CivicSecure Alliance", "partner_type": "government consultant", "country_coverage": ["UAE", "Saudi", "Singapore"], "pipeline_influenced": 2_100_000, "ARR_closed": 760_000, "commission_due": 74_000, "certification_score": 91, "win_rate": 45, "status": "active"},
    ]


def _seed_white_labels(tenant_id: str) -> list[dict[str, Any]]:
    now = utc_now_iso()
    return [
        {"franchise_id": f"WLB-{tenant_id}-GULF", "tenant_id": tenant_id, "name": "Sentra Gulf Edition", "partner_name": "CivicSecure Alliance", "custom_domain": "gulf.sentra.example", "custom_logo": "gulf-logo.svg", "custom_theme": "navy-cyan-gold", "reseller_owned_billing": True, "regional_hosting_tag": "middle-east", "language_pack": "en-ar", "status": "active", "created_at": now},
        {"franchise_id": f"WLB-{tenant_id}-EDU", "tenant_id": tenant_id, "name": "Sentra Edu India", "partner_name": "Bharat Ops Consulting", "custom_domain": "edu-india.sentra.example", "custom_logo": "edu-logo.svg", "custom_theme": "navy-cyan", "reseller_owned_billing": True, "regional_hosting_tag": "india", "language_pack": "en-hi", "status": "pilot", "created_at": now},
        {"franchise_id": f"WLB-{tenant_id}-GOV", "tenant_id": tenant_id, "name": "Sentra Europe GovSecure", "partner_name": "ShieldGrid Global", "custom_domain": "gov-eu.sentra.example", "custom_logo": "gov-logo.svg", "custom_theme": "navy-gold", "reseller_owned_billing": False, "regional_hosting_tag": "europe", "language_pack": "en-de", "status": "pipeline", "created_at": now},
    ]


def _future(days: int) -> str:
    from datetime import datetime, timedelta, timezone

    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def _seed_crm_deals(tenant_id: str) -> list[dict[str, Any]]:
    return [
        {"deal_id": f"CRM-{tenant_id}-BALA-UNI", "tenant_id": tenant_id, "company": "Bala University", "arr_value": 184_000, "owner": "Avery Chen", "stage": "Security Review", "probability": 72, "next_step": "Complete SSO and campus camera privacy review", "risk_flags": ["procurement committee", "privacy review"], "expected_close_date": _future(19), "source": "founder network", "industry": "Higher Education", "notes": ["Chancellor wants campus-wide evacuation proof."]},
        {"deal_id": f"CRM-{tenant_id}-METROCARE", "tenant_id": tenant_id, "company": "MetroCare Hospital", "arr_value": 260_000, "owner": "Nora Hale", "stage": "Proposal", "probability": 68, "next_step": "Send ICU continuity proposal and security appendix", "risk_flags": ["clinical workflow validation"], "expected_close_date": _future(24), "source": "inbound form", "industry": "Healthcare", "notes": ["CIO engaged after oxygen leak demo."]},
        {"deal_id": f"CRM-{tenant_id}-NOVA", "tenant_id": tenant_id, "company": "Nova Mall Group", "arr_value": 118_000, "owner": "Maya Sol", "stage": "Demo", "probability": 54, "next_step": "Run crowd surge demo with tenant comms", "risk_flags": ["budget timing"], "expected_close_date": _future(31), "source": "LinkedIn outbound", "industry": "Retail", "notes": ["Security director asked for multi-site pricing."]},
        {"deal_id": f"CRM-{tenant_id}-GRAND", "tenant_id": tenant_id, "company": "Grand Meridian Hotel", "arr_value": 96_000, "owner": "Avery Chen", "stage": "Negotiation", "probability": 81, "next_step": "Finalize IoT expansion addendum", "risk_flags": ["legal redlines"], "expected_close_date": _future(12), "source": "referral", "industry": "Hospitality", "notes": ["GM wants board ROI story."]},
        {"deal_id": f"CRM-{tenant_id}-GOVSOUTH", "tenant_id": tenant_id, "company": "GovSecure South", "arr_value": 420_000, "owner": "Iris Park", "stage": "Discovery", "probability": 42, "next_step": "Map sovereign hosting and procurement path", "risk_flags": ["RFP timing", "compliance"], "expected_close_date": _future(64), "source": "government RFP", "industry": "Government", "notes": ["National readiness score resonated."]},
        {"deal_id": f"CRM-{tenant_id}-AIRPORT", "tenant_id": tenant_id, "company": "Atlas Airport Authority", "arr_value": 310_000, "owner": "Nora Hale", "stage": "Qualified", "probability": 38, "next_step": "Book terminal operations workshop", "risk_flags": ["multi-stakeholder"], "expected_close_date": _future(52), "source": "event", "industry": "Aviation", "notes": ["Needs passenger flow + mass notification demo."]},
        {"deal_id": f"CRM-{tenant_id}-WON-HOTEL", "tenant_id": tenant_id, "company": "Crown Harbor Hotel", "arr_value": 72_000, "owner": "Maya Sol", "stage": "Won", "probability": 100, "next_step": "Handoff to onboarding", "risk_flags": [], "expected_close_date": _future(-7), "source": "partner", "industry": "Hospitality", "notes": ["Won via referral loop."]},
    ]


def _seed_leads(tenant_id: str) -> list[dict[str, Any]]:
    return [
        {"lead_id": f"LEAD-{tenant_id}-BALA-UNI", "tenant_id": tenant_id, "company": "Bala University", "source": "founder network", "industry": "Higher Education", "company_size": 88, "urgency": 91, "industry_fit": 94, "budget_signal": 78, "geography": "India", "engagement_score": 89, "security_need": 92, "buying_intent": 87},
        {"lead_id": f"LEAD-{tenant_id}-METROCARE", "tenant_id": tenant_id, "company": "MetroCare Hospital", "source": "inbound form", "industry": "Healthcare", "company_size": 93, "urgency": 96, "industry_fit": 95, "budget_signal": 81, "geography": "USA", "engagement_score": 86, "security_need": 97, "buying_intent": 84},
        {"lead_id": f"LEAD-{tenant_id}-NOVA", "tenant_id": tenant_id, "company": "Nova Mall Group", "source": "LinkedIn outbound", "industry": "Retail", "company_size": 74, "urgency": 72, "industry_fit": 86, "budget_signal": 69, "geography": "UAE", "engagement_score": 79, "security_need": 88, "buying_intent": 71},
        {"lead_id": f"LEAD-{tenant_id}-GOVSOUTH", "tenant_id": tenant_id, "company": "GovSecure South", "source": "government RFP", "industry": "Government", "company_size": 98, "urgency": 89, "industry_fit": 96, "budget_signal": 83, "geography": "USA", "engagement_score": 77, "security_need": 99, "buying_intent": 73},
        {"lead_id": f"LEAD-{tenant_id}-AIRPORT", "tenant_id": tenant_id, "company": "Atlas Airport Authority", "source": "event", "industry": "Aviation", "company_size": 91, "urgency": 82, "industry_fit": 92, "budget_signal": 76, "geography": "Singapore", "engagement_score": 84, "security_need": 94, "buying_intent": 78},
    ]


def _seed_customers(tenant_id: str) -> list[dict[str, Any]]:
    return [
        {"customer_id": f"CUST-{tenant_id}-GRAND", "tenant_id": tenant_id, "customer": "Grand Meridian Hotel", "status": "expansion ready", "adoption_score": 92, "seats_used": 188, "seats_purchased": 220, "support_tickets": 3, "sentiment": "positive", "renewal_date": _future(44), "arr": 85_000, "expansion_potential": 96_000, "risk_score": 18, "nps": 64, "csat": 93, "owner": "Avery Chen", "expansion_trigger": "IoT fleet and executive dashboard usage increased 41%", "next_success_action": "Package IoT expansion with annual commitment uplift."},
        {"customer_id": f"CUST-{tenant_id}-METRO", "tenant_id": tenant_id, "customer": "MetroCare Hospital", "status": "healthy", "adoption_score": 89, "seats_used": 477, "seats_purchased": 520, "support_tickets": 6, "sentiment": "positive", "renewal_date": _future(27), "arr": 180_000, "expansion_potential": 74_000, "risk_score": 26, "nps": 58, "csat": 91, "owner": "Nora Hale", "expansion_trigger": "Healthcare continuity workflows adopted across ICU drills", "next_success_action": "Schedule QBR and propose oxygen-risk module expansion."},
        {"customer_id": f"CUST-{tenant_id}-NOVA", "tenant_id": tenant_id, "customer": "Nova Mall Group", "status": "at risk", "adoption_score": 64, "seats_used": 69, "seats_purchased": 72, "support_tickets": 14, "sentiment": "mixed", "renewal_date": _future(12), "arr": 22_800, "expansion_potential": 36_000, "risk_score": 71, "nps": 21, "csat": 74, "owner": "Maya Sol", "expansion_trigger": "Crowd surge dashboard viewed but staff adoption lagging", "next_success_action": "Launch save playbook and staff enablement sprint."},
        {"customer_id": f"CUST-{tenant_id}-SKYLINE", "tenant_id": tenant_id, "customer": "Skyline Campus", "status": "watch", "adoption_score": 73, "seats_used": 21, "seats_purchased": 24, "support_tickets": 5, "sentiment": "neutral", "renewal_date": _future(9), "arr": 5_880, "expansion_potential": 28_000, "risk_score": 45, "nps": 36, "csat": 82, "owner": "Iris Park", "expansion_trigger": "Student safety routing usage spiked after drill", "next_success_action": "Offer annual upgrade and campus-wide route lab."},
        {"customer_id": f"CUST-{tenant_id}-BALA", "tenant_id": tenant_id, "customer": "Bala University", "status": "healthy", "adoption_score": 86, "seats_used": 142, "seats_purchased": 180, "support_tickets": 4, "sentiment": "positive", "renewal_date": _future(88), "arr": 142_000, "expansion_potential": 58_000, "risk_score": 24, "nps": 61, "csat": 90, "owner": "Avery Chen", "expansion_trigger": "Campus staff task completion above 93%", "next_success_action": "Expand to residential halls and athletics venues."},
    ]


def _lead_score(lead: dict[str, Any]) -> int:
    weights = {
        "company_size": 0.12,
        "urgency": 0.16,
        "industry_fit": 0.16,
        "budget_signal": 0.13,
        "engagement_score": 0.13,
        "security_need": 0.17,
        "buying_intent": 0.13,
    }
    return round(sum(int(lead[key]) * weight for key, weight in weights.items()))


def _lead_action(lead: dict[str, Any]) -> str:
    score = _lead_score(lead)
    if score >= 88:
        return "Route to founder-led executive demo within 24 hours."
    if score >= 80:
        return "Schedule security ROI workshop and send crisis simulation proof."
    return "Nurture with industry benchmark report and urgency trigger."


def _renewal_bucket(renewal_date: str) -> str:
    from datetime import datetime, timezone

    parsed = datetime.fromisoformat(renewal_date)
    days = (parsed - datetime.now(timezone.utc)).days
    if days <= 0:
        return "overdue"
    if days <= 30:
        return "due in 30d"
    if days <= 60:
        return "due in 60d"
    return "due in 90d"


def _renewal_playbook(customer: dict[str, Any]) -> str:
    if customer["status"] == "at risk":
        return "Launch save playbook, executive escalation, and adoption recovery sprint."
    if customer["status"] == "expansion ready":
        return "Schedule QBR and package multi-site expansion with annual uplift."
    return "Send value recap, renewal ROI report, and readiness benchmark."


def _expansion_type(customer: dict[str, Any]) -> str:
    if customer["customer"] == "Grand Meridian Hotel":
        return "multi-site rollout"
    if "Hospital" in customer["customer"]:
        return "module add-on"
    if "Campus" in customer["customer"] or "University" in customer["customer"]:
        return "enterprise upgrade"
    return "seat expansion"


def _expansion_action(customer: dict[str, Any]) -> str:
    if customer["status"] == "at risk":
        return "Recover adoption first, then pitch expansion after sentiment improves."
    return f"Open expansion motion: {customer['next_success_action']}"


def _stage_probability(stage: str, fallback: int) -> int:
    return {
        "New": 8,
        "Qualified": 22,
        "Discovery": 38,
        "Demo": 54,
        "Proposal": 68,
        "Security Review": 72,
        "Negotiation": 84,
        "Won": 100,
        "Lost": 0,
    }.get(stage, fallback)


growth_store = GrowthStore(settings.sentra_growth_store_path)

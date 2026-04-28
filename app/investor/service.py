from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.investor.boardroom import build_boardroom
from app.investor.captable import build_cap_table
from app.investor.copilot import build_copilot
from app.investor.dataroom import build_dataroom
from app.investor.fundraising import build_fundraising_readiness
from app.investor.ipo import build_ipo
from app.investor.metrics import build_investor_metrics
from app.investor.mna import build_mna
from app.investor.models import BASE_INVESTOR_METRICS, DEMO_INVESTORS, DEMO_TENANTS, future_iso, investor_id, utc_now_iso
from app.investor.runway import build_runway
from app.investor.valuation import build_valuation


class InvestorStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"metrics": [], "investors": [], "events": [], "board_packs": []}

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
            metric_tenants = {item["tenant_id"] for item in payload["metrics"]}
            investor_tenants = {item["tenant_id"] for item in payload["investors"]}
            for tenant_id in DEMO_TENANTS:
                if tenant_id not in metric_tenants:
                    payload["metrics"].append({"tenant_id": tenant_id, **BASE_INVESTOR_METRICS, "updated_at": utc_now_iso()})
                    created += 1
                existing_investors = {(item["tenant_id"], item["investor_id"]) for item in payload["investors"]}
                if tenant_id not in investor_tenants or any((tenant_id, investor["investor_id"]) not in existing_investors for investor in DEMO_INVESTORS):
                    for index, investor in enumerate(DEMO_INVESTORS, start=1):
                        if (tenant_id, investor["investor_id"]) in existing_investors:
                            continue
                        payload["investors"].append(
                            {
                                **investor,
                                "tenant_id": tenant_id,
                                "last_meeting": None if index % 2 else utc_now_iso(),
                                "next_action_date": future_iso(7 + index * 3),
                                "created_at": utc_now_iso(),
                            }
                        )
            self._write(payload)
        return {"created": created}

    def metrics(self, tenant_ids: list[str]) -> dict[str, Any]:
        base = self._base_metrics(tenant_ids)
        return build_investor_metrics(base)

    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(tenant_ids)
        valuation = self.valuation(tenant_ids)
        runway = self.runway(tenant_ids)
        readiness = self.readiness(tenant_ids)
        ipo = self.ipo(tenant_ids)
        investors = self.investors(tenant_ids)
        weighted_raise = sum(round(int(item["check_size"]) * int(item["probability_to_invest"]) / 100) for item in investors)
        burn_multiple = round(int(metrics["net_burn"]) * 12 / max(1, int(metrics["net_new_ARR"])), 2)
        return {
            "generated_at": utc_now_iso(),
            "ARR": int(metrics["ARR"]),
            "MRR": int(metrics["MRR"]),
            "growth_percent": int(metrics["YoY_growth_percent"]),
            "net_revenue_retention": int(metrics["net_revenue_retention"]),
            "gross_margin_percent": int(metrics["gross_margin_percent"]),
            "burn_multiple": burn_multiple,
            "runway_months": int(runway["runway_months"]),
            "rule_of_40": int(metrics["rule_of_40"]),
            "cash_on_hand": int(metrics["cash_on_hand"]),
            "monthly_burn": int(metrics["monthly_burn"]),
            "fundraising_readiness": int(readiness["score"]),
            "raise_recommendation": readiness["raise_recommendation"],
            "base_valuation": int(valuation["base_valuation"]),
            "conservative_valuation": int(valuation["conservative_valuation"]),
            "aggressive_valuation": int(valuation["aggressive_valuation"]),
            "weighted_raise": weighted_raise,
            "ipo_score": int(ipo["score"]),
            "next_raise_deadline": (datetime.now(timezone.utc) + timedelta(days=max(30, (int(runway["runway_months"]) - 6) * 30))).date().isoformat(),
            "investor_count": len(investors),
        }

    def valuation(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_valuation(self.metrics(tenant_ids))

    def runway(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_runway(self.metrics(tenant_ids))

    def captable(self) -> dict[str, Any]:
        return build_cap_table()

    def readiness(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_fundraising_readiness(self.metrics(tenant_ids))

    def board(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(tenant_ids)
        readiness = build_fundraising_readiness(metrics)
        valuation = build_valuation(metrics)
        return build_boardroom(metrics, readiness, valuation)

    def boardpack(self, tenant_ids: list[str]) -> dict[str, Any]:
        board = self.board(tenant_ids)
        metrics = self.metrics(tenant_ids)
        runway = self.runway(tenant_ids)
        return {
            "month": "April 2026",
            "title": "Sentra Institutional Board Pack",
            "status": "export_ready",
            "kpi_summary": {
                "ARR": metrics["ARR"],
                "growth_percent": metrics["YoY_growth_percent"],
                "NRR": metrics["net_revenue_retention"],
                "burn": metrics["monthly_burn"],
                "runway_months": runway["runway_months"],
            },
            "revenue_growth": board.get("what_changed", []),
            "pipeline_health": ["Enterprise/government pipeline weighted raise supports next institutional round."],
            "churn": ["Logo churn remains controlled; expansion ARR outpaces contraction."],
            "product_velocity": ["Operations, revenue, growth, and investor systems now fully connected."],
            "hiring_status": ["Prioritize enterprise AE, solutions engineer, and security compliance lead."],
            "cash_runway": runway,
            "risks": board.get("risks", []),
            "asks": board.get("top_asks", []),
            "next_90_days": ["Close two lighthouse enterprise accounts", "Complete SOC2 evidence sprint", "Run strategic UAE investor process"],
            "department_scorecards": [
                {"department": "Product", "score": 91, "status": "shipping investor-grade systems"},
                {"department": "GTM", "score": 86, "status": "pipeline quality improving"},
                {"department": "Security", "score": 88, "status": "SOC2 evidence sprint active"},
                {"department": "Finance", "score": 84, "status": "forecast discipline maturing"},
            ],
            "market_position": "Category-defining AI crisis command platform with government-grade expansion wedge.",
        }

    def dataroom(self) -> dict[str, Any]:
        return build_dataroom()

    def mna(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_mna(self.metrics(tenant_ids))

    def ipo(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_ipo(self.metrics(tenant_ids))

    def investors(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            investors = [dict(item) for item in self._read()["investors"] if item["tenant_id"] in tenant_ids]
        return sorted(investors, key=lambda item: int(item["interest_score"]), reverse=True)

    def update_fund(self, tenant_ids: list[str], data: dict[str, Any]) -> dict[str, Any] | None:
        investor_id_value = str(data.get("investor_id") or "")
        with self._lock:
            payload = self._read()
            investor = next((item for item in payload["investors"] if item["tenant_id"] in tenant_ids and item["investor_id"] == investor_id_value), None)
            if investor is None:
                return None
            if data.get("status"):
                investor["status"] = str(data["status"])
                investor["probability_to_invest"] = min(92, int(investor["probability_to_invest"]) + 8)
                investor["interest_score"] = min(99, int(investor["interest_score"]) + 4)
            if data.get("note"):
                investor["note"] = str(data["note"])
            investor["next_action_date"] = future_iso(7)
            self._append_event(payload, str(investor["tenant_id"]), "fund_updated", investor_id_value)
            self._write(payload)
            return dict(investor)

    def copilot(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(tenant_ids)
        readiness = build_fundraising_readiness(metrics)
        valuation = build_valuation(metrics)
        return build_copilot(metrics, readiness, valuation, self.investors(tenant_ids))

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(tenant_ids)
        valuation = build_valuation(metrics)
        readiness = build_fundraising_readiness(metrics)
        runway = build_runway(metrics)
        investors = self.investors(tenant_ids)
        return {
            "generated_at": utc_now_iso(),
            "ARR": metrics["ARR"],
            "MRR": metrics["MRR"],
            "YoY_growth_percent": metrics["YoY_growth_percent"],
            "net_revenue_retention": metrics["net_revenue_retention"],
            "gross_margin_percent": metrics["gross_margin_percent"],
            "runway_months": runway["runway_months"],
            "rule_of_40": metrics["rule_of_40"],
            "fundraising_readiness_score": readiness["score"],
            "base_valuation": valuation["base_valuation"],
            "investor_pipeline": sum(int(item["check_size"]) for item in investors if int(item["probability_to_invest"]) >= 35),
            "board_pack_status": "export_ready",
        }

    def add_cash(self, tenant_ids: list[str], amount: int) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            metric = self._find_metric(payload, tenant_ids)
            metric["cash_on_hand"] = int(metric["cash_on_hand"]) + amount
            metric["updated_at"] = utc_now_iso()
            self._append_event(payload, str(metric["tenant_id"]), "raise_planned", f"cash:{amount}")
            self._write(payload)
            return build_runway(build_investor_metrics(dict(metric)))

    def run_scenario(self, tenant_ids: list[str], scenario: str | None = None) -> dict[str, Any]:
        runway = self.runway(tenant_ids)
        selected = scenario or "Raise $10M"
        match = next((item for item in runway["scenarios"] if item["action"].lower() == selected.lower()), runway["scenarios"][2])
        with self._lock:
            payload = self._read()
            self._append_event(payload, tenant_ids[0], "scenario_simulated", selected)
            self._write(payload)
        return {"scenario": selected, "result": match, "recommended": selected == "Raise $10M"}

    def add_investor(self, tenant_id: str, data: dict[str, Any]) -> dict[str, Any]:
        record = {
            "investor_id": investor_id("INV"),
            "tenant_id": tenant_id,
            "fund_name": data.get("fund_name") or "New Strategic Fund",
            "partner_name": data.get("partner_name") or "Partner",
            "check_size": int(data.get("check_size") or 2_500_000),
            "stage_fit": data.get("stage_fit") or "Series A",
            "geography": "Global",
            "thesis_fit": "AI command operating systems",
            "warm_intro": "Founder network",
            "last_meeting": None,
            "interest_score": 72,
            "probability_to_invest": 28,
            "next_action_date": future_iso(10),
            "status": "new",
            "created_at": utc_now_iso(),
        }
        with self._lock:
            payload = self._read()
            payload["investors"].append(record)
            self._append_event(payload, tenant_id, "investor_added", record["investor_id"])
            self._write(payload)
        return record

    def update_cap_table(self, tenant_ids: list[str]) -> dict[str, Any]:
        captable = self.captable()
        with self._lock:
            payload = self._read()
            self._append_event(payload, tenant_ids[0], "cap_table_updated", "series_a_model")
            self._write(payload)
        return captable

    def generate_board_pack(self, tenant_ids: list[str]) -> dict[str, Any]:
        board = self.board(tenant_ids)
        pack = {
            "board_pack_id": investor_id("BOARD"),
            "tenant_id": tenant_ids[0],
            "generated_at": utc_now_iso(),
            "title": "Sentra Investor Board Pack",
            "status": "ready",
            "sections": ["Metrics", "Valuation", "Runway", "Growth", "Risks", "Board asks"],
            "summary": board["what_changed"][0],
        }
        with self._lock:
            payload = self._read()
            payload["board_packs"].append(pack)
            self._append_event(payload, tenant_ids[0], "board_pack_generated", pack["board_pack_id"])
            self._write(payload)
        return pack

    def _base_metrics(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            metric = self._find_metric(payload, tenant_ids)
            return dict(metric)

    def _find_metric(self, payload: dict[str, Any], tenant_ids: list[str]) -> dict[str, Any]:
        metric = next((item for item in payload["metrics"] if item["tenant_id"] in tenant_ids), None)
        if metric is None:
            metric = {"tenant_id": tenant_ids[0], **BASE_INVESTOR_METRICS, "updated_at": utc_now_iso()}
            payload["metrics"].append(metric)
        return metric

    def _append_event(self, payload: dict[str, Any], tenant_id: str, action: str, target: str) -> None:
        payload["events"].append({"event_id": f"INV-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_id, "action": action, "target": target, "created_at": utc_now_iso()})


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEMO_TENANTS)
    return [str(tenant["tenant_id"])]


investor_store = InvestorStore(settings.sentra_investor_store_path)

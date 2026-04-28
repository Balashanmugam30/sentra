from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.execution.board_actions import build_board_actions
from app.execution.ceo_ai import build_ceo_ai
from app.execution.cfo_ai import build_cfo_ai
from app.execution.chro_ai import build_chro_ai
from app.execution.ciso_ai import build_ciso_ai
from app.execution.coo_ai import build_coo_ai
from app.execution.cro_ai import build_cro_ai
from app.execution.efficiency import build_efficiency
from app.execution.models import BASE_EXECUTION_METRICS, DEMO_TENANTS, execution_id, utc_now_iso
from app.execution.org_simulator import build_org_simulator, run_org_simulation
from app.execution.risk_engine import build_risk_engine
from app.execution.workflows import build_workflows


class ExecutionStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"metrics": [], "events": []}

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
                    payload["metrics"].append({"tenant_id": tenant_id, **BASE_EXECUTION_METRICS, "updated_at": utc_now_iso()})
                    created += 1
            self._write(payload)
        return {"created": created}

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(tenant_ids)
        return {
            "generated_at": utc_now_iso(),
            **{key: metrics[key] for key in ("ARR", "MRR", "growth_percent", "cash_balance", "monthly_burn", "runway_months", "employees", "countries", "NPS", "gross_margin_percent", "LTV_CAC", "board_readiness", "CEO_confidence")},
            "execution_score": self.execution_score(metrics),
        }

    def metrics(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            return dict(self._find_metric(payload, tenant_ids))

    def execution_score(self, metrics: dict[str, Any]) -> int:
        return min(
            100,
            round(
                int(metrics["CEO_confidence"]) * 0.22
                + int(metrics["board_readiness"]) * 0.22
                + int(metrics["productivity_score"]) * 0.2
                + int(metrics["security_maturity"]) * 0.16
                + min(100, int(metrics["runway_months"]) * 2.2) * 0.2
            ),
        )

    def ceo(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_ceo_ai(self.metrics(tenant_ids))

    def coo(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_coo_ai(self.metrics(tenant_ids))

    def cfo(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_cfo_ai(self.metrics(tenant_ids))

    def cro(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_cro_ai(self.metrics(tenant_ids))

    def chro(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_chro_ai(self.metrics(tenant_ids))

    def ciso(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_ciso_ai(self.metrics(tenant_ids))

    def council(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(tenant_ids)
        positions = [
            {"agent": "CEO Agent", "position": "UAE expansion plus disciplined Series C timing", "score": 88},
            {"agent": "CFO Agent", "position": "Protect runway above 30 months and cut low-yield spend", "score": 91},
            {"agent": "COO Agent", "position": "Remove engineering and procurement bottlenecks before scaling", "score": 84},
            {"agent": "CRO Agent", "position": "Partner-led government sales blitz with founder support", "score": 89},
            {"agent": "CHRO Agent", "position": "Hire 3 leadership roles before adding volume headcount", "score": 80},
            {"agent": "CISO Agent", "position": "Finish SOC2 evidence before major government push", "score": 92},
        ]
        return {
            "agents": positions,
            "consensus_percent": 87,
            "disagreements": ["CRO wants faster sales hiring; CFO wants budget gates.", "CEO wants acquisition optionality; COO warns about integration strain."],
            "final_recommendation": "Cut burn leakage, expand UAE, hire 3 sales leaders, finish security evidence, and delay major raise until anchor deal closes.",
            "confidence": int(metrics["CEO_confidence"]),
            "fallback_strategy": "Cost defense mode with partner-only expansion if UAE slips by 60 days.",
        }

    def board(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_board_actions(self.metrics(tenant_ids))

    def scenarios(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_org_simulator(self.metrics(tenant_ids))

    def productivity(self, tenant_ids: list[str]) -> dict[str, Any]:
        metrics = self.metrics(tenant_ids)
        efficiency = build_efficiency(metrics)
        return {
            "productivity_score": int(metrics["productivity_score"]),
            "meetings_load": efficiency["meetings_load_hours_per_week"],
            "delivery_delays": efficiency["delivery_delays"],
            "overloaded_teams": efficiency["overloaded_teams"],
            "revenue_per_employee": efficiency["revenue_per_employee"],
            "output_efficiency": efficiency["output_efficiency"],
        }

    def workflows(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_workflows(self.metrics(tenant_ids))

    def efficiency(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_efficiency(self.metrics(tenant_ids))

    def risk(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_risk_engine(self.metrics(tenant_ids))

    def simulate(self, tenant_ids: list[str], scenario: str | None = None) -> dict[str, Any]:
        return run_org_simulation(self.metrics(tenant_ids), scenario)

    def action(self, tenant_ids: list[str], action: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        payload = payload or {}
        metrics = self.metrics(tenant_ids)
        result: dict[str, Any] = {"action_id": execution_id("EXEC"), "action": action, "created_at": utc_now_iso()}
        if action == "growth_mode":
            result.update({"mode": "aggressive_growth", "budget_shift": 1_250_000, "runway_months": max(29, int(metrics["runway_months"]) - 5), "expected_arr_uplift": 2_400_000})
        elif action == "cost_mode":
            result.update({"mode": "cost_defense", "annual_savings": 780_000, "runway_months": int(metrics["runway_months"]) + 8, "growth_drag_percent": 4})
        elif action == "raise_plan":
            result.update({"raise_amount": int(payload.get("amount") or 20_000_000), "timing": "after UAE anchor", "target_pre_money": 120_000_000})
        elif action == "hire_plan":
            result.update({"hires": int(payload.get("hires") or 3), "roles": ["VP Middle East", "Enterprise AE Germany", "Security Program Lead"], "runway_impact_months": -2})
        elif action == "run_review":
            result.update({"review": self.council(tenant_ids), "board_actions": self.board(tenant_ids)["recommended_actions"][:3]})
        else:
            result.update({"simulation": self.simulate(tenant_ids, str(payload.get("scenario") or "Expand to 3 countries"))})
        with self._lock:
            stored = self._read()
            self._append_event(stored, tenant_ids[0], action, str(result["action_id"]))
            self._write(stored)
        return result

    def _find_metric(self, payload: dict[str, Any], tenant_ids: list[str]) -> dict[str, Any]:
        metric = next((item for item in payload["metrics"] if item["tenant_id"] in tenant_ids), None)
        if metric is None:
            metric = {"tenant_id": tenant_ids[0], **BASE_EXECUTION_METRICS, "updated_at": utc_now_iso()}
            payload["metrics"].append(metric)
        return metric

    def _append_event(self, payload: dict[str, Any], tenant_id: str, action: str, target: str) -> None:
        payload["events"].append({"event_id": execution_id("EXEC-EVT"), "tenant_id": tenant_id, "action": action, "target": target, "created_at": utc_now_iso()})


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEMO_TENANTS)
    return [str(tenant["tenant_id"])]


execution_store = ExecutionStore(settings.sentra_execution_store_path)

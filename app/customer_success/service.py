from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.billing.service import billing_store
from app.core.config import settings
from app.customer_success.churn import predict_churn
from app.customer_success.copilot import build_copilot_actions
from app.customer_success.expansion import detect_expansion
from app.customer_success.health import compute_health
from app.customer_success.models import DEMO_SUCCESS_ACCOUNTS, account_id, utc_now_iso
from app.customer_success.onboarding import onboarding_progress
from app.customer_success.renewals import build_renewal
from app.tenancy.provisioning import tenancy_store


class CustomerSuccessStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"accounts": [], "events": []}

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

    def seed_demo(self) -> dict[str, Any]:
        tenancy_store.seed_demo()
        billing_store.seed_demo()
        with self._lock:
            payload = self._read()
            existing = {account["tenant_id"] for account in payload["accounts"]}
            created = 0
            for account in DEMO_SUCCESS_ACCOUNTS:
                if account["tenant_id"] in existing:
                    continue
                payload["accounts"].append(_normalize_account(dict(account)))
                created += 1
            self._write(payload)
            return {"created": created, "accounts": len(payload["accounts"])}

    def list_accounts(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            accounts = [_enriched_account(dict(account)) for account in payload["accounts"] if account["tenant_id"] in tenant_ids]
        if not accounts and tenant_ids:
            accounts = [self._ensure_tenant_account(tenant_ids[0])]
        return sorted(accounts, key=lambda account: (account["churn_risk"], account["contract_value"]), reverse=True)

    def all_tenant_ids(self) -> list[str]:
        self.seed_demo()
        with self._lock:
            return [str(account["tenant_id"]) for account in self._read()["accounts"]]

    def health(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return [compute_health(account) for account in self.list_accounts(tenant_ids)]

    def churn(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(
            [predict_churn(account) for account in self.list_accounts(tenant_ids)],
            key=lambda item: (int(item["risk_percent"]), int(item["estimated_revenue_at_risk"])),
            reverse=True,
        )

    def renewals(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(
            [build_renewal(account) for account in self.list_accounts(tenant_ids)],
            key=lambda item: int(item["days_until_renewal"]),
        )

    def expansion(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(
            [detect_expansion(account) for account in self.list_accounts(tenant_ids)],
            key=lambda item: (int(item["opportunity_score"]), int(item["expected_MRR_gain"])),
            reverse=True,
        )

    def onboarding(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return [onboarding_progress(account) for account in self.list_accounts(tenant_ids)]

    def support(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        snapshots = []
        for account in self.list_accounts(tenant_ids):
            sla = max(48, min(99, round(104 - float(account["avg_resolution_time"]) * 2 - int(account["support_tickets"]) * 1.8)))
            snapshots.append(
                {
                    "tenant_id": account["tenant_id"],
                    "workspace_name": account["workspace_name"],
                    "ticket_volume": account["support_tickets"],
                    "avg_resolution_time": account["avg_resolution_time"],
                    "resolution_SLA": sla,
                    "priority_escalations": max(0, int(account["support_tickets"]) // 4),
                    "support_sentiment": "negative" if int(account["CSAT_score"]) < 75 else "positive" if int(account["CSAT_score"]) >= 90 else "neutral",
                    "NPS_score": account["NPS_score"],
                    "CSAT_score": account["CSAT_score"],
                }
            )
        return snapshots

    def metrics(self, tenant_ids: list[str]) -> dict[str, Any]:
        accounts = self.list_accounts(tenant_ids)
        health = self.health(tenant_ids)
        churn = self.churn(tenant_ids)
        expansion = self.expansion(tenant_ids)
        renewals = self.renewals(tenant_ids)
        health_average = round(sum(int(item["health_score"]) for item in health) / max(1, len(health)))
        at_risk_revenue = sum(int(item["estimated_revenue_at_risk"]) for item in churn if int(item["risk_percent"]) >= 50)
        expansion_pipeline = sum(int(item["expected_MRR_gain"]) * 12 for item in expansion if int(item["opportunity_score"]) >= 55)
        renewal_pipeline = sum(int(item["contract_value"]) for item in renewals if int(item["days_until_renewal"]) <= 90)
        lifecycle_mix: dict[str, int] = {}
        for account in accounts:
            stage = str(account["lifecycle_stage"])
            lifecycle_mix[stage] = lifecycle_mix.get(stage, 0) + 1
        return {
            "NRR": max(112, round(100 + (expansion_pipeline / max(1, sum(int(account["ARR"]) for account in accounts))) * 100 - 3)),
            "gross_retention": max(91, 100 - round(at_risk_revenue / max(1, sum(int(account["ARR"]) for account in accounts)) * 25)),
            "health_average": health_average,
            "at_risk_revenue": at_risk_revenue,
            "expansion_pipeline": expansion_pipeline,
            "renewal_pipeline": renewal_pipeline,
            "NPS_average": round(sum(int(account["NPS_score"]) for account in accounts) / max(1, len(accounts)), 1),
            "CSAT_average": round(sum(int(account["CSAT_score"]) for account in accounts) / max(1, len(accounts)), 1),
            "accounts_count": len(accounts),
            "lifecycle_mix": lifecycle_mix,
            "executive_summary": "NRR is expansion-positive with visible rescue motions for low-adoption accounts.",
        }

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        health = self.health(tenant_ids)
        churn = self.churn(tenant_ids)
        metrics = self.metrics(tenant_ids)
        copilot = self.copilot(tenant_ids)
        mix = {status: len([item for item in health if item["status"] == status]) for status in ("healthy", "watch", "risk", "critical")}
        causes: dict[str, int] = {}
        for prediction in churn:
            for cause in prediction["top_causes"]:
                causes[cause] = causes.get(cause, 0) + 1
        top_causes = [cause for cause, _ in sorted(causes.items(), key=lambda item: item[1], reverse=True)[:5]]
        return {
            "generated_at": utc_now_iso(),
            "NRR": metrics["NRR"],
            "health_mix": mix,
            "at_risk_accounts": [item for item in churn if int(item["risk_percent"]) >= 50][:5],
            "expansion_pipeline": metrics["expansion_pipeline"],
            "renewals_due_90d": len([item for item in self.renewals(tenant_ids) if int(item["days_until_renewal"]) <= 90]),
            "top_churn_reasons": top_causes,
            "ai_save_actions": copilot[:5],
            "summary": "Customer success engine is tracking retention, expansion, renewals, sentiment, and rescue motions.",
        }

    def copilot(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return build_copilot_actions(self.list_accounts(tenant_ids))

    def test_risk(self, tenant_ids: list[str], scenario: str | None = None, tenant_id: str | None = None) -> dict[str, Any]:
        target = tenant_id if tenant_id in tenant_ids else tenant_ids[0]
        scenario_name = scenario or "silent_churn"
        return self._patch_account(
            target,
            {
                "login_frequency": 24,
                "adoption_score": 39,
                "stakeholder_engagement": 26,
                "NPS_score": 3,
                "CSAT_score": 61,
                "support_tickets": 14,
                "avg_resolution_time": 22.0,
                "sentiment_trend": "falling",
                "payment_status": "past_due" if scenario_name == "failed_payment" else "healthy",
                "lifecycle_stage": "rescue",
            },
            "test_risk",
            {"scenario": scenario_name},
        )

    def save_account(self, tenant_ids: list[str], tenant_id: str | None = None) -> dict[str, Any]:
        target = tenant_id if tenant_id in tenant_ids else tenant_ids[0]
        account = self._get_account(target)
        return self._patch_account(
            target,
            {
                "login_frequency": min(100, int(account["login_frequency"]) + 18),
                "adoption_score": min(100, int(account["adoption_score"]) + 20),
                "stakeholder_engagement": min(100, int(account["stakeholder_engagement"]) + 24),
                "NPS_score": min(10, int(account["NPS_score"]) + 3),
                "CSAT_score": min(100, int(account["CSAT_score"]) + 18),
                "support_tickets": max(0, int(account["support_tickets"]) - 5),
                "avg_resolution_time": max(2.0, float(account["avg_resolution_time"]) - 8),
                "payment_status": "healthy",
                "sentiment_trend": "rising",
                "lifecycle_stage": "adoption",
            },
            "account_saved",
            {},
        )

    def expand_account(self, tenant_ids: list[str], tenant_id: str | None = None) -> dict[str, Any]:
        target = tenant_id if tenant_id in tenant_ids else tenant_ids[0]
        account = self._get_account(target)
        next_mrr = int(account["MRR"]) + max(1_800, round(int(account["MRR"]) * 0.18))
        return self._patch_account(
            target,
            {
                "MRR": next_mrr,
                "ARR": next_mrr * 12,
                "seats_limit": int(account["seats_limit"]) + 25,
                "seats_used": int(account["seats_used"]) + 12,
                "contract_value": next_mrr * 12,
                "stakeholder_engagement": min(100, int(account["stakeholder_engagement"]) + 8),
                "lifecycle_stage": "expansion",
                "sentiment_trend": "rising",
            },
            "account_expanded",
            {},
        )

    def run_qbr(self, tenant_ids: list[str], tenant_id: str | None = None) -> dict[str, Any]:
        target = tenant_id if tenant_id in tenant_ids else tenant_ids[0]
        account = self._get_account(target)
        return self._patch_account(
            target,
            {
                "stakeholder_engagement": min(100, int(account["stakeholder_engagement"]) + 18),
                "NPS_score": min(10, int(account["NPS_score"]) + 1),
                "onboarding_completion": min(100, int(account["onboarding_completion"]) + 6),
                "sentiment_trend": "rising",
            },
            "qbr_run",
            {},
        )

    def _ensure_tenant_account(self, tenant_id: str) -> dict[str, Any]:
        context = tenancy_store.get_plan(tenant_id)
        subscription = billing_store.get_subscription(tenant_id, tenant_id)
        account = _normalize_account(
            {
                "tenant_id": tenant_id,
                "workspace_name": subscription.get("organization_name") or tenant_id,
                "plan": context.get("plan_name", "Business").lower(),
                "MRR": int(subscription.get("monthly_mrr") or 2_400),
                "seats_used": int(subscription.get("seats_used") or 3),
                "seats_limit": int(subscription.get("seat_limit") or 50),
                "feature_usage": {"soc": 45, "geo": 38, "ai": 35, "reports": 28, "osint": 24},
                "login_frequency": 42,
                "API_usage": 4_200,
                "report_usage": 5,
                "AI_actions_used": 34,
                "adoption_score": 48,
                "onboarding_completion": 58,
                "stakeholder_engagement": 45,
                "support_tickets": 4,
                "avg_resolution_time": 8.5,
                "NPS_score": 6,
                "CSAT_score": 78,
                "payment_status": "healthy",
                "uptime_experience": 98,
                "sentiment_trend": "stable",
                "renewal_date": subscription.get("renewal_date"),
                "contract_value": int(subscription.get("annual_value") or 28_800),
                "account_owner": "Sentra Success",
                "lifecycle_stage": "onboarding",
            }
        )
        with self._lock:
            payload = self._read()
            if _find_account(payload, tenant_id) is None:
                payload["accounts"].append(account)
                self._write(payload)
        return _enriched_account(account)

    def _get_account(self, tenant_id: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            account = _find_account(payload, tenant_id)
            if account is not None:
                return _enriched_account(dict(account))
        if account is None:
            return self._ensure_tenant_account(tenant_id)
        return _enriched_account(dict(account))

    def _patch_account(self, tenant_id: str, updates: dict[str, Any], event_type: str, event_payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            account = _find_account(payload, tenant_id)
            if account is None:
                payload["accounts"].append(_normalize_account({"tenant_id": tenant_id, "workspace_name": tenant_id}))
                account = payload["accounts"][-1]
            before = dict(account)
            account.update(updates)
            account["updated_at"] = utc_now_iso()
            account["ARR"] = int(account["MRR"]) * 12
            enriched = _enriched_account(dict(account))
            account["churn_risk"] = enriched["churn_risk"]
            account["expansion_potential"] = enriched["expansion_potential"]
            payload["events"].append(
                {
                    "event_id": f"CS-EVT-{len(payload['events']) + 1:05d}",
                    "event_type": event_type,
                    "tenant_id": tenant_id,
                    "payload": event_payload,
                    "before": before,
                    "after": dict(account),
                    "created_at": utc_now_iso(),
                }
            )
            self._write(payload)
            return _enriched_account(dict(account))


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return customer_success_store.all_tenant_ids()
    return [str(tenant["tenant_id"])]


def _normalize_account(account: dict[str, Any]) -> dict[str, Any]:
    account.setdefault("account_id", account_id())
    account.setdefault("workspace_name", account.get("tenant_id", "Sentra Workspace"))
    account.setdefault("plan", "business")
    account.setdefault("MRR", 2_400)
    account["ARR"] = int(account.get("ARR") or int(account["MRR"]) * 12)
    account.setdefault("seats_used", 3)
    account.setdefault("seats_limit", 50)
    account.setdefault("feature_usage", {"soc": 44, "geo": 36, "ai": 34, "reports": 28, "osint": 20})
    account.setdefault("login_frequency", 44)
    account.setdefault("API_usage", 3_200)
    account.setdefault("report_usage", 4)
    account.setdefault("AI_actions_used", 24)
    account.setdefault("adoption_score", 46)
    account.setdefault("onboarding_completion", 54)
    account.setdefault("stakeholder_engagement", 42)
    account.setdefault("support_tickets", 3)
    account.setdefault("avg_resolution_time", 8.0)
    account.setdefault("NPS_score", 6)
    account.setdefault("CSAT_score", 78)
    account.setdefault("payment_status", "healthy")
    account.setdefault("uptime_experience", 98)
    account.setdefault("sentiment_trend", "stable")
    account.setdefault("renewal_date", utc_now_iso())
    account.setdefault("contract_value", int(account["ARR"]))
    account.setdefault("account_owner", "Sentra Success")
    account.setdefault("lifecycle_stage", "onboarding")
    account.setdefault("updated_at", utc_now_iso())
    enriched = _enriched_account(dict(account))
    account["churn_risk"] = enriched["churn_risk"]
    account["expansion_potential"] = enriched["expansion_potential"]
    return account


def _enriched_account(account: dict[str, Any]) -> dict[str, Any]:
    account["ARR"] = int(account.get("ARR") or int(account["MRR"]) * 12)
    account["churn_risk"] = int(predict_churn(account)["risk_percent"])
    account["expansion_potential"] = int(detect_expansion(account)["opportunity_score"])
    return account


def _find_account(payload: dict[str, Any], tenant_id: str) -> dict[str, Any] | None:
    return next((account for account in payload["accounts"] if account["tenant_id"] == tenant_id), None)


customer_success_store = CustomerSuccessStore(settings.sentra_customer_success_store_path)

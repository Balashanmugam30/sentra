from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4

from app.core.config import settings


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def future_date(days: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).date().isoformat()


PLAN_MATRIX: dict[str, dict[str, Any]] = {
    "starter": {
        "plan_key": "starter",
        "name": "Starter",
        "audience": "Small teams proving Sentra in one facility",
        "monthly_price": 490,
        "yearly_price": 4_900,
        "included_seats": 12,
        "max_seats": 35,
        "ai_quota": 1_500,
        "api_quota": 80_000,
        "storage_quota_gb": 120,
        "support_tier": "Standard email",
        "enabled_modules": ["alerts", "mobile", "iot_basic", "reports"],
        "upgrade_signal": "Upgrade when usage reaches multi-site operations.",
    },
    "growth": {
        "plan_key": "growth",
        "name": "Growth",
        "audience": "Regional operators standardizing response workflows",
        "monthly_price": 1_900,
        "yearly_price": 19_000,
        "included_seats": 40,
        "max_seats": 140,
        "ai_quota": 8_000,
        "api_quota": 420_000,
        "storage_quota_gb": 800,
        "support_tier": "Priority support",
        "enabled_modules": ["alerts", "mobile", "iot", "ai_decision", "ops", "premium_reports"],
        "upgrade_signal": "Enterprise recommended for SLA, SSO, and advanced AI autonomy.",
    },
    "enterprise": {
        "plan_key": "enterprise",
        "name": "Enterprise",
        "audience": "Large deployments with advanced AI and uptime commitments",
        "monthly_price": 8_500,
        "yearly_price": 85_000,
        "included_seats": 180,
        "max_seats": 1_200,
        "ai_quota": 55_000,
        "api_quota": 2_500_000,
        "storage_quota_gb": 6_000,
        "support_tier": "24/7 SLA support",
        "enabled_modules": ["all_core", "advanced_ai", "ops", "executive", "security", "ecosystem"],
        "upgrade_signal": "Government tier recommended for sovereign and isolated environments.",
    },
    "government": {
        "plan_key": "government",
        "name": "Government",
        "audience": "Sovereign agencies and public infrastructure operators",
        "monthly_price": 18_000,
        "yearly_price": 180_000,
        "included_seats": 400,
        "max_seats": 5_000,
        "ai_quota": 140_000,
        "api_quota": 8_000_000,
        "storage_quota_gb": 20_000,
        "support_tier": "Sovereign command support",
        "enabled_modules": ["all_core", "government", "world", "omega", "audit_plus", "isolated_env"],
        "upgrade_signal": "Custom Strategic for national rollouts and bespoke integrations.",
    },
    "custom_strategic": {
        "plan_key": "custom_strategic",
        "name": "Custom Strategic",
        "audience": "Negotiated global, defense, and national infrastructure programs",
        "monthly_price": 0,
        "yearly_price": 0,
        "included_seats": 1_000,
        "max_seats": None,
        "ai_quota": 500_000,
        "api_quota": 30_000_000,
        "storage_quota_gb": 100_000,
        "support_tier": "Named success, security, and deployment team",
        "enabled_modules": ["platform_all", "bespoke_integrations", "private_deployments", "command_governance"],
        "upgrade_signal": "Board-approved commercial architecture required.",
    },
}


DEMO_TENANTS: list[dict[str, Any]] = [
    {
        "tenant_id": "TEN-GRAND-MERIDIAN",
        "customer": "Grand Meridian Hotel",
        "plan_key": "enterprise",
        "status": "active",
        "billing_interval": "annual",
        "seats_purchased": 220,
        "seats_used": 188,
        "pending_invites": 14,
        "suspended_users": 3,
        "renewal_days": 44,
        "payment_method_valid": True,
        "retry_attempts": 0,
        "failed_charges": 0,
        "growth_rate": 31,
        "usage_score": 92,
        "renewal_risk": "low",
        "executive_owner": "Avery Chen",
    },
    {
        "tenant_id": "TEN-METROCARE",
        "customer": "MetroCare Hospital",
        "plan_key": "government",
        "status": "active",
        "billing_interval": "annual",
        "seats_purchased": 520,
        "seats_used": 477,
        "pending_invites": 22,
        "suspended_users": 7,
        "renewal_days": 27,
        "payment_method_valid": True,
        "retry_attempts": 0,
        "failed_charges": 0,
        "growth_rate": 24,
        "usage_score": 96,
        "renewal_risk": "medium",
        "executive_owner": "Nora Hale",
    },
    {
        "tenant_id": "TEN-NOVA-MALL",
        "customer": "Nova Mall Group",
        "plan_key": "growth",
        "status": "past_due",
        "billing_interval": "monthly",
        "seats_purchased": 72,
        "seats_used": 69,
        "pending_invites": 8,
        "suspended_users": 2,
        "renewal_days": 12,
        "payment_method_valid": False,
        "retry_attempts": 2,
        "failed_charges": 1,
        "growth_rate": 18,
        "usage_score": 84,
        "renewal_risk": "high",
        "executive_owner": "Maya Sol",
    },
    {
        "tenant_id": "TEN-SKYLINE-CAMPUS",
        "customer": "Skyline Campus",
        "plan_key": "starter",
        "status": "trial",
        "billing_interval": "monthly",
        "seats_purchased": 24,
        "seats_used": 21,
        "pending_invites": 11,
        "suspended_users": 0,
        "renewal_days": 9,
        "payment_method_valid": True,
        "retry_attempts": 0,
        "failed_charges": 0,
        "growth_rate": 42,
        "usage_score": 77,
        "renewal_risk": "medium",
        "executive_owner": "Iris Park",
    },
]


class RevenueStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"subscriptions": [], "invoices": [], "events": []}

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

    def seed_demo(self) -> None:
        with self._lock:
            payload = self._read()
            existing = {item["tenant_id"] for item in payload["subscriptions"]}
            for tenant in DEMO_TENANTS:
                if tenant["tenant_id"] in existing:
                    continue
                subscription = self._subscription_from_seed(tenant)
                payload["subscriptions"].append(subscription)
                payload["invoices"].extend(self._seed_invoices(subscription))
            self._write(payload)

    def plans(self) -> list[dict[str, Any]]:
        return [deepcopy(plan) for plan in PLAN_MATRIX.values()]

    def subscriptions(self) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [deepcopy(item) for item in self._read()["subscriptions"]]

    def invoices(self, tenant_id: str | None = None) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            invoices = [deepcopy(item) for item in self._read()["invoices"]]
        if tenant_id:
            invoices = [invoice for invoice in invoices if invoice["tenant_id"] == tenant_id]
        return sorted(invoices, key=lambda item: item["due_date"])

    def current_subscription(self, tenant: dict[str, Any]) -> dict[str, Any]:
        self.seed_demo()
        tenant_id = str(tenant.get("tenant_id") or "TEN-GRAND-MERIDIAN")
        with self._lock:
            payload = self._read()
            subscription = _find_subscription(payload, tenant_id)
            if subscription is None:
                subscription = self._subscription_from_seed(
                    {
                        **DEMO_TENANTS[0],
                        "tenant_id": tenant_id,
                        "customer": str(tenant.get("organization_name") or "Grand Meridian Hotel"),
                    }
                )
                payload["subscriptions"].append(subscription)
                payload["invoices"].extend(self._seed_invoices(subscription))
                self._write(payload)
            return deepcopy(subscription)

    def change_plan(self, *, tenant: dict[str, Any], plan_key: str, interval: str, direction: str) -> tuple[str, dict[str, Any], dict[str, Any]]:
        self.seed_demo()
        if plan_key not in PLAN_MATRIX:
            raise ValueError("Unknown revenue plan")
        target_plan = PLAN_MATRIX[plan_key]
        tenant_id = str(tenant.get("tenant_id") or "TEN-GRAND-MERIDIAN")
        with self._lock:
            payload = self._read()
            subscription = _find_subscription(payload, tenant_id)
            if subscription is None:
                subscription = self._subscription_from_seed({**DEMO_TENANTS[0], "tenant_id": tenant_id})
                payload["subscriptions"].append(subscription)
            seats_used = int(subscription["seats"]["seats_used"])
            quota_usage = _usage_for_subscription(subscription)
            invalid_reasons = []
            max_seats = target_plan["max_seats"]
            if max_seats is not None and seats_used > int(max_seats):
                invalid_reasons.append("seat usage exceeds target plan limit")
            if quota_usage[0]["used"] > int(target_plan["ai_quota"]):
                invalid_reasons.append("AI usage exceeds target plan quota")
            if quota_usage[1]["used"] > int(target_plan["api_quota"]):
                invalid_reasons.append("API usage exceeds target plan quota")
            if direction == "downgrade" and invalid_reasons:
                raise ValueError(f"Cannot downgrade: {', '.join(invalid_reasons)}")
            approval_required = plan_key in {"government", "custom_strategic"}
            if not approval_required:
                subscription.update(
                    {
                        "plan_key": plan_key,
                        "plan_name": target_plan["name"],
                        "status": "active",
                        "billing_interval": interval,
                        "monthly_recurring_revenue": _monthly_revenue(target_plan, interval),
                        "annual_contract_value": _annual_value(target_plan, interval),
                        "proration_preview": _proration(subscription, target_plan, interval),
                        "approval_required": False,
                        "cancel_at_renewal": False,
                        "updated_at": utc_now_iso(),
                    }
                )
                subscription["seats"]["seats_purchased"] = max(
                    int(subscription["seats"]["seats_purchased"]),
                    int(target_plan["included_seats"]),
                )
                _refresh_seat_snapshot(subscription)
            payload["events"].append(
                _event(
                    "plan_change_requested" if approval_required else "plan_changed",
                    tenant_id,
                    {"plan_key": plan_key, "interval": interval, "direction": direction, "approval_required": approval_required},
                )
            )
            self._write(payload)
            message = "Plan change queued for approval" if approval_required else "Plan changed"
            return message, deepcopy(subscription), {"approval_required": approval_required, "target_plan": target_plan}

    def cancel(self, tenant: dict[str, Any], immediate: bool = False) -> dict[str, Any]:
        return self._patch_subscription(
            tenant,
            {
                "status": "canceled" if immediate else "cancel_at_renewal",
                "cancel_at_renewal": not immediate,
                "updated_at": utc_now_iso(),
            },
            "subscription_cancelled",
        )

    def reactivate(self, tenant: dict[str, Any]) -> dict[str, Any]:
        return self._patch_subscription(
            tenant,
            {"status": "active", "cancel_at_renewal": False, "trial_days_remaining": 0, "updated_at": utc_now_iso()},
            "subscription_reactivated",
        )

    def update_seats(self, tenant: dict[str, Any], delta: int) -> dict[str, Any]:
        self.seed_demo()
        tenant_id = str(tenant.get("tenant_id") or "TEN-GRAND-MERIDIAN")
        with self._lock:
            payload = self._read()
            subscription = _find_subscription(payload, tenant_id)
            if subscription is None:
                subscription = self._subscription_from_seed({**DEMO_TENANTS[0], "tenant_id": tenant_id})
                payload["subscriptions"].append(subscription)
            seats = subscription["seats"]
            seats["seats_purchased"] = max(int(seats["seats_used"]), int(seats["seats_purchased"]) + delta)
            _refresh_seat_snapshot(subscription)
            subscription["monthly_recurring_revenue"] = _seat_adjusted_mrr(subscription)
            subscription["annual_contract_value"] = subscription["monthly_recurring_revenue"] * 12
            subscription["updated_at"] = utc_now_iso()
            payload["events"].append(_event("seat_changed", tenant_id, {"delta": delta}))
            self._write(payload)
            return deepcopy(subscription)

    def mark_invoice_paid(self, invoice_id: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            invoice = next((item for item in payload["invoices"] if item["invoice_id"] == invoice_id), None)
            if invoice is None:
                raise ValueError("Invoice not found")
            invoice["status"] = "paid"
            invoice["paid_at"] = utc_now_iso()
            payload["events"].append(_event("invoice_marked_paid", invoice["tenant_id"], {"invoice_id": invoice_id}))
            self._write(payload)
            return deepcopy(invoice)

    def events(self) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [deepcopy(item) for item in self._read()["events"]]

    def _patch_subscription(self, tenant: dict[str, Any], updates: dict[str, Any], event_type: str) -> dict[str, Any]:
        self.seed_demo()
        tenant_id = str(tenant.get("tenant_id") or "TEN-GRAND-MERIDIAN")
        with self._lock:
            payload = self._read()
            subscription = _find_subscription(payload, tenant_id)
            if subscription is None:
                subscription = self._subscription_from_seed({**DEMO_TENANTS[0], "tenant_id": tenant_id})
                payload["subscriptions"].append(subscription)
            subscription.update(updates)
            payload["events"].append(_event(event_type, tenant_id, updates))
            self._write(payload)
            return deepcopy(subscription)

    def _subscription_from_seed(self, seed: dict[str, Any]) -> dict[str, Any]:
        plan = PLAN_MATRIX[str(seed["plan_key"])]
        interval = str(seed["billing_interval"])
        subscription = {
            "tenant_id": str(seed["tenant_id"]),
            "customer": str(seed["customer"]),
            "plan_key": plan["plan_key"],
            "plan_name": plan["name"],
            "status": seed["status"],
            "billing_interval": interval,
            "monthly_recurring_revenue": _monthly_revenue(plan, interval),
            "annual_contract_value": _annual_value(plan, interval),
            "renewal_date": future_date(int(seed["renewal_days"])),
            "cancel_at_renewal": False,
            "trial_days_remaining": 14 if seed["status"] == "trial" else 0,
            "proration_preview": 0,
            "approval_required": False,
            "payment_method_valid": bool(seed["payment_method_valid"]),
            "retry_attempts": int(seed["retry_attempts"]),
            "failed_charges": int(seed["failed_charges"]),
            "growth_rate": int(seed["growth_rate"]),
            "usage_score": int(seed["usage_score"]),
            "renewal_risk": str(seed["renewal_risk"]),
            "executive_owner": str(seed["executive_owner"]),
            "updated_at": utc_now_iso(),
            "seats": {
                "seats_purchased": int(seed["seats_purchased"]),
                "seats_used": int(seed["seats_used"]),
                "pending_invites": int(seed["pending_invites"]),
                "suspended_users": int(seed["suspended_users"]),
                "available_seats": 0,
                "utilization_percent": 0,
                "recommendation": "",
            },
        }
        _refresh_seat_snapshot(subscription)
        return subscription

    def _seed_invoices(self, subscription: dict[str, Any]) -> list[dict[str, Any]]:
        base = int(subscription["monthly_recurring_revenue"])
        statuses = ["paid", "open", "overdue" if subscription["status"] == "past_due" else "paid"]
        return [
            _invoice(subscription, status, base, offset)
            for offset, status in enumerate(statuses)
        ]


def _find_subscription(payload: dict[str, Any], tenant_id: str) -> dict[str, Any] | None:
    return next((item for item in payload["subscriptions"] if item["tenant_id"] == tenant_id), None)


def _monthly_revenue(plan: dict[str, Any], interval: str) -> int:
    if plan["plan_key"] == "custom_strategic":
        return 42_000
    return round(int(plan["yearly_price"]) / 12) if interval == "annual" else int(plan["monthly_price"])


def _annual_value(plan: dict[str, Any], interval: str) -> int:
    if plan["plan_key"] == "custom_strategic":
        return 504_000
    return int(plan["yearly_price"]) if interval == "annual" else int(plan["monthly_price"]) * 12


def _seat_adjusted_mrr(subscription: dict[str, Any]) -> int:
    plan = PLAN_MATRIX[str(subscription["plan_key"])]
    seats = subscription["seats"]
    included = int(plan["included_seats"])
    extra = max(0, int(seats["seats_purchased"]) - included)
    extra_rate = max(35, round(_monthly_revenue(plan, "monthly") / max(1, included) * 0.42))
    return _monthly_revenue(plan, str(subscription["billing_interval"])) + extra * extra_rate


def _proration(subscription: dict[str, Any], target_plan: dict[str, Any], interval: str) -> int:
    current = int(subscription["monthly_recurring_revenue"])
    target = _monthly_revenue(target_plan, interval)
    return max(-12_000, round((target - current) * 0.58))


def _refresh_seat_snapshot(subscription: dict[str, Any]) -> None:
    seats = subscription["seats"]
    purchased = int(seats["seats_purchased"])
    used = int(seats["seats_used"])
    available = max(0, purchased - used - int(seats["pending_invites"]))
    utilization = round((used / max(1, purchased)) * 100)
    seats["available_seats"] = available
    seats["utilization_percent"] = utilization
    seats["recommendation"] = (
        "Expansion recommended before next incident drill"
        if utilization >= 85
        else "Seat capacity is healthy for current deployment"
    )


def _usage_for_subscription(subscription: dict[str, Any]) -> list[dict[str, Any]]:
    plan = PLAN_MATRIX[str(subscription["plan_key"])]
    seed = sum(ord(char) for char in str(subscription["tenant_id"]))
    usage_factor = 0.62 + (seed % 26) / 100
    if subscription["status"] == "past_due":
        usage_factor = 0.91
    metrics = [
        ("ai_decisions", "AI decision runs", int(plan["ai_quota"]), round(int(plan["ai_quota"]) * usage_factor), "runs"),
        ("api_calls", "API calls", int(plan["api_quota"]), round(int(plan["api_quota"]) * (usage_factor - 0.08)), "calls"),
        ("notifications", "Notifications sent", 180_000, 126_400 + seed * 7, "messages"),
        ("storage", "Storage used", int(plan["storage_quota_gb"]), round(int(plan["storage_quota_gb"]) * (usage_factor - 0.12)), "GB"),
        ("exports", "Exports generated", 1_200, 720 + seed % 220, "exports"),
        ("camera_events", "Camera processing events", 95_000, 61_000 + seed * 3, "events"),
        ("automations", "Automation executions", 24_000, 15_000 + seed * 2, "runs"),
    ]
    usage: list[dict[str, Any]] = []
    for key, label, included, used, unit in metrics:
        remaining = max(0, included - used)
        overage = max(0, used - included)
        usage.append(
            {
                "key": key,
                "label": label,
                "included": included,
                "used": used,
                "remaining": remaining,
                "overage_estimate": round(overage * (0.02 if unit != "GB" else 2.4)),
                "unit": unit,
            }
        )
    return usage


def _invoice(subscription: dict[str, Any], status: str, amount: int, offset: int) -> dict[str, Any]:
    subtotal = amount
    taxes = round(subtotal * 0.0825)
    credits = 0 if status != "overdue" else 250
    invoice_id = f"REV-INV-{uuid4().hex[:8].upper()}"
    return {
        "invoice_id": invoice_id,
        "customer": subscription["customer"],
        "tenant_id": subscription["tenant_id"],
        "billing_period": f"2026-{max(1, 4 - offset):02d}",
        "subtotal": subtotal,
        "taxes": taxes,
        "credits": credits,
        "total": subtotal + taxes - credits,
        "status": status,
        "due_date": future_date(7 - offset * 10),
        "download_url": f"https://billing.sentra.local/revenue/{invoice_id}.pdf",
    }


def _event(event_type: str, tenant_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "event_id": f"REV-AUD-{uuid4().hex[:10].upper()}",
        "event_type": event_type,
        "tenant_id": tenant_id,
        "payload": payload,
        "created_at": utc_now_iso(),
    }


revenue_store = RevenueStore(settings.sentra_revenue_store_path)


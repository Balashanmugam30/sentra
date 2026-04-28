from __future__ import annotations

import importlib
import json
import os
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4

from app.billing.models import BILLING_PLAN_MATRIX, DEMO_BILLING_METRICS, future_iso, plan_for_key, utc_now_iso
from app.core.config import settings
from app.tenancy.provisioning import tenancy_store
from app.tenancy.usage import build_usage_snapshot


class BillingStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"subscriptions": [], "invoices": [], "events": [], "coupons": []}

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
        tenancy_store.seed_demo()
        with self._lock:
            payload = self._read()
            existing = {item["tenant_id"] for item in payload["subscriptions"]}
            for tenant_id, name, plan, status, interval in [
                ("TEN-BALA-UNI", "Bala University", "enterprise", "active", "annual"),
                ("TEN-BALA-MFG", "Bala Manufacturing", "business", "active", "monthly"),
                ("TEN-BALA-HOSP", "Bala Hospital Demo", "government", "trialing", "annual"),
            ]:
                if tenant_id not in existing:
                    payload["subscriptions"].append(
                        _subscription(
                            tenant_id=tenant_id,
                            organization_name=name,
                            plan_key=plan,
                            status=status,
                            interval=interval,
                        )
                    )
                    payload["invoices"].extend(_demo_invoices(tenant_id, plan))
            self._write(payload)

    def get_subscription(self, tenant_id: str, organization_name: str = "") -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            subscription = _find_subscription(payload, tenant_id)
            if subscription is None:
                subscription = _subscription(
                    tenant_id=tenant_id,
                    organization_name=organization_name or tenant_id,
                    plan_key="business",
                    status="trialing",
                    interval="monthly",
                )
                payload["subscriptions"].append(subscription)
                payload["invoices"].extend(_demo_invoices(tenant_id, "business"))
                self._write(payload)
            return _with_live_usage(dict(subscription))

    def list_subscriptions(self) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [_with_live_usage(dict(item)) for item in self._read()["subscriptions"]]

    def list_invoices(self, tenant_id: str | None = None) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            invoices = [dict(item) for item in self._read()["invoices"]]
        if tenant_id:
            invoices = [invoice for invoice in invoices if invoice["tenant_id"] == tenant_id]
        return sorted(invoices, key=lambda item: item["created_at"], reverse=True)

    def change_plan(self, *, tenant_id: str, plan_key: str, interval: str) -> dict[str, Any]:
        plan = plan_for_key(plan_key)
        with self._lock:
            payload = self._read()
            subscription = _find_subscription(payload, tenant_id)
            if subscription is None:
                subscription = _subscription(
                    tenant_id=tenant_id,
                    organization_name=tenant_id,
                    plan_key=plan_key,
                    status="active",
                    interval=interval,
                )
                payload["subscriptions"].append(subscription)
            subscription.update(
                {
                    "plan": plan["plan_key"],
                    "billing_interval": interval,
                    "billing_status": "active",
                    "seat_limit": plan["seat_limit"],
                    "monthly_mrr": _monthly_mrr(plan, interval),
                    "annual_value": _annual_value(plan, interval),
                    "suspended_flag": False,
                    "cancel_at_period_end": False,
                    "entitlements": plan["entitlements"],
                    "locked_modules": _locked_modules(plan["entitlements"]),
                    "renewal_date": future_iso(365 if interval == "annual" else 30),
                    "updated_at": utc_now_iso(),
                }
            )
            payload["events"].append(_event("plan_changed", tenant_id, {"plan": plan_key, "interval": interval}))
            payload["invoices"].insert(0, _invoice(tenant_id, plan_key, "paid", _monthly_mrr(plan, interval)))
            self._write(payload)
        tenancy_store.update_plan(tenant_id, plan_key)
        return _with_live_usage(dict(subscription))

    def update_seats(self, *, tenant_id: str, delta: int) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            subscription = _find_subscription(payload, tenant_id)
            if subscription is None:
                subscription = _subscription(
                    tenant_id=tenant_id,
                    organization_name=tenant_id,
                    plan_key="business",
                    status="active",
                    interval="monthly",
                )
                payload["subscriptions"].append(subscription)
            subscription["seat_limit"] = max(1, int(subscription["seat_limit"]) + delta)
            subscription["updated_at"] = utc_now_iso()
            payload["events"].append(_event("seat_changed", tenant_id, {"delta": delta}))
            self._write(payload)
            return _with_live_usage(dict(subscription))

    def cancel(self, tenant_id: str) -> dict[str, Any]:
        return self._patch_subscription(tenant_id, {"cancel_at_period_end": True, "updated_at": utc_now_iso()}, "subscription_cancelled")

    def reactivate(self, tenant_id: str) -> dict[str, Any]:
        return self._patch_subscription(
            tenant_id,
            {
                "cancel_at_period_end": False,
                "billing_status": "active",
                "suspended_flag": False,
                "updated_at": utc_now_iso(),
            },
            "subscription_reactivated",
        )

    def apply_coupon(self, tenant_id: str, coupon: str) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            payload["coupons"].append({"tenant_id": tenant_id, "coupon": coupon, "applied_at": utc_now_iso()})
            payload["events"].append(_event("coupon_applied", tenant_id, {"coupon": coupon}))
            self._write(payload)
        return self.get_subscription(tenant_id)

    def record_webhook(self, event_type: str, tenant_id: str) -> dict[str, Any]:
        if event_type in {"invoice.payment_failed", "payment_intent.payment_failed"}:
            subscription = self._patch_subscription(
                tenant_id,
                {
                    "billing_status": "past_due",
                    "payment_method_status": "failed",
                    "grace_period_days": 7,
                    "updated_at": utc_now_iso(),
                },
                "invoice_failed",
            )
            with self._lock:
                payload = self._read()
                payload["invoices"].insert(0, _invoice(tenant_id, subscription["plan"], "failed", subscription["monthly_mrr"]))
                self._write(payload)
            return subscription
        if event_type in {"invoice.paid", "checkout.session.completed", "customer.subscription.created"}:
            return self._patch_subscription(
                tenant_id,
                {
                    "billing_status": "active",
                    "payment_method_status": "valid",
                    "suspended_flag": False,
                    "grace_period_days": 0,
                    "updated_at": utc_now_iso(),
                },
                "invoice_paid",
            )
        if event_type == "customer.subscription.deleted":
            return self._patch_subscription(
                tenant_id,
                {"billing_status": "canceled", "suspended_flag": True, "updated_at": utc_now_iso()},
                "subscription_deleted",
            )
        return self._patch_subscription(tenant_id, {"updated_at": utc_now_iso()}, event_type)

    def _patch_subscription(self, tenant_id: str, updates: dict[str, Any], event_type: str) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            subscription = _find_subscription(payload, tenant_id)
            if subscription is None:
                subscription = _subscription(
                    tenant_id=tenant_id,
                    organization_name=tenant_id,
                    plan_key="business",
                    status="active",
                    interval="monthly",
                )
                payload["subscriptions"].append(subscription)
            subscription.update(updates)
            payload["events"].append(_event(event_type, tenant_id, updates))
            self._write(payload)
            return _with_live_usage(dict(subscription))


class StripeGateway:
    def __init__(self) -> None:
        self.secret_key = settings.stripe_secret_key
        self.webhook_secret = settings.stripe_webhook_secret
        self.publishable_key = settings.stripe_publishable_key
        self._stripe = None
        if self.secret_key:
            try:
                self._stripe = importlib.import_module("stripe")
                self._stripe.api_key = self.secret_key
            except Exception:
                self._stripe = None

    @property
    def provider(self) -> str:
        return "stripe" if self._stripe is not None and self.secret_key else "demo"

    def create_checkout_url(
        self,
        *,
        tenant_id: str,
        customer_id: str | None,
        plan_key: str,
        interval: str,
        success_url: str | None,
        cancel_url: str | None,
        seats: int,
    ) -> tuple[str, str]:
        if self.provider != "stripe":
            session_id = f"demo_checkout_{uuid4().hex[:12]}"
            return session_id, f"https://billing.sentra.local/demo/checkout/{tenant_id}/{plan_key}?session={session_id}"

        price_env = plan_for_key(plan_key)[
            "stripe_price_env_annual" if interval == "annual" else "stripe_price_env_monthly"
        ]
        price_id = os.getenv(str(price_env), "")
        if not price_id:
            session_id = f"demo_checkout_{uuid4().hex[:12]}"
            return session_id, f"https://billing.sentra.local/demo/missing-price/{plan_key}?session={session_id}"

        session = self._stripe.checkout.Session.create(
            mode="subscription",
            customer=customer_id,
            success_url=success_url or "http://localhost/app?billing=success",
            cancel_url=cancel_url or "http://localhost/app?billing=cancelled",
            line_items=[{"price": price_id, "quantity": seats}],
            allow_promotion_codes=True,
            client_reference_id=tenant_id,
            metadata={"tenant_id": tenant_id, "plan": plan_key, "interval": interval},
        )
        return str(session["id"]), str(session["url"])

    def create_portal_url(self, *, customer_id: str | None, tenant_id: str) -> str:
        if self.provider != "stripe" or not customer_id:
            return f"https://billing.sentra.local/demo/portal/{tenant_id}"
        session = self._stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url="http://localhost/app?billing=portal-return",
        )
        return str(session["url"])


def provider() -> str:
    return stripe_gateway.provider


def billing_plans() -> list[dict[str, Any]]:
    return [dict(plan) for plan in BILLING_PLAN_MATRIX.values()]


def subscription_for_tenant(tenant: dict[str, Any]) -> dict[str, Any]:
    return billing_store.get_subscription(str(tenant["tenant_id"]), str(tenant["organization_name"]))


def billing_me(tenant: dict[str, Any]) -> dict[str, Any]:
    subscription = subscription_for_tenant(tenant)
    plan = plan_for_key(subscription["plan"])
    return {
        "provider": provider(),
        "publishable_key": settings.stripe_publishable_key or None,
        "subscription": subscription,
        "plan": plan,
        "payment_recovery": payment_recovery_for_subscription(subscription),
        "entitlements": {item: item in subscription["entitlements"] for item in _all_entitlements()},
    }


def create_checkout(tenant: dict[str, Any], payload: dict[str, Any]) -> dict[str, str]:
    subscription = subscription_for_tenant(tenant)
    plan_key = payload["plan"]
    seats = int(payload.get("seats") or subscription["seats_used"] or 1)
    session_id, url = stripe_gateway.create_checkout_url(
        tenant_id=str(tenant["tenant_id"]),
        customer_id=subscription.get("stripe_customer_id"),
        plan_key=plan_key,
        interval=payload.get("interval", "monthly"),
        success_url=payload.get("success_url"),
        cancel_url=payload.get("cancel_url"),
        seats=max(1, seats),
    )
    return {"provider": provider(), "session_id": session_id, "url": url}


def revenue_snapshot() -> dict[str, Any]:
    subscriptions = billing_store.list_subscriptions()
    active = [item for item in subscriptions if item["billing_status"] in {"active", "trialing", "past_due"}]
    mrr = max(DEMO_BILLING_METRICS["mrr"], sum(int(item["monthly_mrr"]) for item in active))
    active_customers = max(DEMO_BILLING_METRICS["active_customers"], len(active))
    failed_invoices = [invoice for invoice in billing_store.list_invoices() if invoice["status"] == "failed"]
    return {
        "provider": provider(),
        "mrr": mrr,
        "arr": mrr * 12,
        "arpu": round(mrr / max(1, active_customers)),
        "ltv": round((mrr / max(1, active_customers)) * 42),
        "active_customers": active_customers,
        "trials_converting": DEMO_BILLING_METRICS["trials_converting"],
        "failed_payments": max(DEMO_BILLING_METRICS["failed_payments"], len(failed_invoices)),
        "expansion_mrr": DEMO_BILLING_METRICS["expansion_revenue"],
        "contraction_mrr": 8_400,
        "churn_percent": DEMO_BILLING_METRICS["churn_risk_percent"],
        "trial_conversion_percent": 64.0,
        "failed_payment_rate": 3.2,
        "collection_recovery_percent": DEMO_BILLING_METRICS["collection_recovery_percent"],
        "net_revenue_retention": DEMO_BILLING_METRICS["net_revenue_retention"],
        "top_plans": _top_plans(active),
        "trend": _revenue_trend(mrr),
    }


def usage_snapshot(tenant: dict[str, Any]) -> dict[str, Any]:
    subscription = subscription_for_tenant(tenant)
    usage = build_usage_snapshot(str(tenant["tenant_id"]))
    plan = plan_for_key(subscription["plan"])
    return {
        "tenant_id": tenant["tenant_id"],
        "seats_used": subscription["seats_used"],
        "seat_limit": subscription["seat_limit"],
        "seat_utilization_percent": round((subscription["seats_used"] / max(1, subscription["seat_limit"])) * 100),
        "api_calls_month": usage["api_calls_month"],
        "api_rate_limit": plan["api_rate_limit"],
        "reports_generated": usage["reports_generated"],
        "ai_actions_month": usage["ai_actions_month"],
    }


def failed_payments_snapshot() -> dict[str, Any]:
    failed = [invoice for invoice in billing_store.list_invoices() if invoice["status"] == "failed"]
    return {
        "failed_count": max(DEMO_BILLING_METRICS["failed_payments"], len(failed)),
        "invoices": failed[:12],
        "recovery_rate_percent": DEMO_BILLING_METRICS["collection_recovery_percent"],
    }


def churn_snapshot() -> dict[str, Any]:
    at_risk = [
        {
            "tenant_id": item["tenant_id"],
            "organization_name": item["organization_name"],
            "reason": "Payment past due" if item["billing_status"] == "past_due" else "Seat utilization below 20%",
            "risk_score": 76 if item["billing_status"] == "past_due" else 48,
        }
        for item in billing_store.list_subscriptions()
        if item["billing_status"] == "past_due" or item["seats_used"] / max(1, item["seat_limit"]) < 0.2
    ]
    return {
        "churn_risk_percent": DEMO_BILLING_METRICS["churn_risk_percent"],
        "at_risk_tenants": at_risk[:10],
        "recommended_actions": [
            "Prioritize payment recovery for past-due enterprise tenants.",
            "Offer annual conversion discount to high-usage Business tenants.",
            "Trigger success outreach for low-seat-utilization accounts.",
        ],
    }


def payment_recovery_for_subscription(subscription: dict[str, Any]) -> dict[str, Any]:
    if subscription["billing_status"] == "past_due":
        return {
            "state": "at_risk",
            "grace_period_days": subscription["grace_period_days"],
            "next_retry": future_iso(2),
            "message": "Payment retry scheduled. Tenant remains active during grace period.",
        }
    return {
        "state": "healthy",
        "grace_period_days": 0,
        "next_retry": None,
        "message": "Collections health is normal.",
    }


def _subscription(*, tenant_id: str, organization_name: str, plan_key: str, status: str, interval: str) -> dict[str, Any]:
    plan = plan_for_key(plan_key)
    seed = sum(ord(char) for char in tenant_id)
    seats_used = min(plan["seat_limit"], 3 + seed % max(4, min(40, plan["seat_limit"])))
    return {
        "tenant_id": tenant_id,
        "organization_name": organization_name,
        "stripe_customer_id": f"cus_demo_{tenant_id.lower().replace('-', '_')}",
        "stripe_subscription_id": f"sub_demo_{uuid4().hex[:12]}",
        "plan": plan["plan_key"],
        "billing_status": status,
        "billing_interval": interval,
        "trial_ends_at": future_iso(14) if status == "trialing" else None,
        "renewal_date": future_iso(365 if interval == "annual" else 30),
        "seat_limit": plan["seat_limit"],
        "seats_used": seats_used,
        "monthly_mrr": _monthly_mrr(plan, interval),
        "annual_value": _annual_value(plan, interval),
        "grace_period_days": 0,
        "suspended_flag": False,
        "cancel_at_period_end": False,
        "payment_method_status": "valid",
        "entitlements": plan["entitlements"],
        "locked_modules": _locked_modules(plan["entitlements"]),
        "updated_at": utc_now_iso(),
    }


def _with_live_usage(subscription: dict[str, Any]) -> dict[str, Any]:
    try:
        usage = build_usage_snapshot(subscription["tenant_id"])
        subscription["seats_used"] = min(int(subscription["seat_limit"]), max(1, int(usage["active_users"])))
    except Exception:
        subscription["seats_used"] = max(1, int(subscription.get("seats_used", 1)))
    subscription.setdefault("locked_modules", _locked_modules(subscription.get("entitlements", [])))
    return subscription


def _monthly_mrr(plan: dict[str, Any], interval: str) -> int:
    return round(int(plan["annual_price"]) / 12) if interval == "annual" else int(plan["monthly_price"])


def _annual_value(plan: dict[str, Any], interval: str) -> int:
    return int(plan["annual_price"]) if interval == "annual" else int(plan["monthly_price"]) * 12


def _invoice(tenant_id: str, plan_key: str, status: str, amount: int) -> dict[str, Any]:
    invoice_id = f"INV-{uuid4().hex[:10].upper()}"
    now = utc_now_iso()
    return {
        "invoice_id": invoice_id,
        "tenant_id": tenant_id,
        "number": invoice_id,
        "status": status,
        "amount_due": amount,
        "amount_paid": amount if status == "paid" else 0,
        "currency": "usd",
        "hosted_invoice_url": f"https://billing.sentra.local/invoices/{invoice_id}",
        "invoice_pdf": f"https://billing.sentra.local/invoices/{invoice_id}.pdf",
        "created_at": now,
        "due_date": future_iso(7),
        "paid_at": now if status == "paid" else None,
        "failure_reason": "card_declined" if status == "failed" else None,
    }


def _demo_invoices(tenant_id: str, plan_key: str) -> list[dict[str, Any]]:
    plan = plan_for_key(plan_key)
    return [
        _invoice(tenant_id, plan_key, "paid", _monthly_mrr(plan, "monthly")),
        _invoice(tenant_id, plan_key, "paid", _monthly_mrr(plan, "monthly")),
    ]


def _event(event_type: str, tenant_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    return {"event_id": f"BILL-{uuid4().hex[:12]}", "event_type": event_type, "tenant_id": tenant_id, "payload": payload, "created_at": utc_now_iso()}


def _find_subscription(payload: dict[str, Any], tenant_id: str) -> dict[str, Any] | None:
    return next((item for item in payload["subscriptions"] if item["tenant_id"] == tenant_id), None)


def _all_entitlements() -> list[str]:
    entitlements: set[str] = set()
    for plan in BILLING_PLAN_MATRIX.values():
        entitlements.update(plan["entitlements"])
    return sorted(entitlements)


def _locked_modules(entitlements: list[str]) -> list[str]:
    gated = [
        "advanced_ai",
        "osint_pro",
        "executive_reports",
        "sso",
        "branding",
        "workflow_automation",
        "government_mode",
    ]
    return [module for module in gated if module not in entitlements]


def _top_plans(subscriptions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts: dict[str, int] = {}
    revenue: dict[str, int] = {}
    for subscription in subscriptions:
        plan = str(subscription["plan"])
        counts[plan] = counts.get(plan, 0) + 1
        revenue[plan] = revenue.get(plan, 0) + int(subscription["monthly_mrr"])
    return [
        {"plan": plan, "customers": counts[plan], "mrr": revenue[plan]}
        for plan in sorted(counts, key=lambda item: revenue[item], reverse=True)
    ]


def _revenue_trend(mrr: int) -> list[dict[str, Any]]:
    return [
        {"period": "30d", "mrr": round(mrr * 0.92), "arr": round(mrr * 0.92 * 12)},
        {"period": "60d", "mrr": round(mrr * 0.97), "arr": round(mrr * 0.97 * 12)},
        {"period": "90d", "mrr": mrr, "arr": mrr * 12},
    ]


billing_store = BillingStore(settings.sentra_billing_store_path)
stripe_gateway = StripeGateway()

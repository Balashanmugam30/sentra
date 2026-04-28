from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4

from app.tenancy.models import DEMO_MEMBERSHIP_BY_EMAIL, DEMO_ORGANIZATIONS, ORG_ROLES, plan_for_key, utc_now_iso


class TenancyStore:
    def __init__(self, path: str = "data/tenancy_store.json") -> None:
        self._path = Path(path)
        self._lock = Lock()
        self._path.parent.mkdir(parents=True, exist_ok=True)

    def _default_payload(self) -> dict[str, Any]:
        return {
            "organizations": [],
            "plans": [],
            "memberships": [],
            "usage": [],
            "active_tenant_by_user": {},
            "invites": [],
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

    def seed_demo(self) -> None:
        with self._lock:
            payload = self._read()
            existing_ids = {org["id"] for org in payload["organizations"]}
            for org in DEMO_ORGANIZATIONS:
                if org["id"] not in existing_ids:
                    organization = dict(org)
                    organization["created_at"] = utc_now_iso()
                    payload["organizations"].append(organization)
                    payload["plans"].append({"tenant_id": org["id"], **plan_for_key(str(org["plan"]).lower())})
                    payload["usage"].append(_default_usage(org["id"]))
            self._write(payload)

    def create_organization(
        self,
        *,
        name: str,
        slug: str,
        industry: str,
        size: str,
        country: str,
        timezone: str,
        plan: str,
        owner_user_id: str,
        owner_email: str,
        owner_name: str,
    ) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            normalized_slug = slug.strip().lower().replace(" ", "-")
            if any(org["slug"] == normalized_slug for org in payload["organizations"]):
                normalized_slug = f"{normalized_slug}-{uuid4().hex[:4]}"
            tenant_id = f"TEN-{uuid4().hex[:10].upper()}"
            organization = {
                "id": tenant_id,
                "slug": normalized_slug,
                "name": name.strip(),
                "industry": industry.strip() or "enterprise",
                "size": size.strip() or "unknown",
                "country": country.strip() or "Global",
                "timezone": timezone.strip() or "UTC",
                "logo_url": "",
                "primary_color": "#67e8f9",
                "created_at": utc_now_iso(),
                "status": "active",
                "plan": plan.strip().lower() or "business",
            }
            payload["organizations"].append(organization)
            payload["plans"].append({"tenant_id": tenant_id, **plan_for_key(organization["plan"])})
            payload["usage"].append(_default_usage(tenant_id))
            payload["memberships"].append(
                _membership(
                    user_id=owner_user_id,
                    tenant_id=tenant_id,
                    email=owner_email,
                    name=owner_name,
                    role="owner",
                    department="Command",
                    invited_by=owner_user_id,
                )
            )
            payload["active_tenant_by_user"][owner_user_id] = tenant_id
            self._write(payload)
            return dict(organization)

    def ensure_user_membership(self, user: dict[str, Any]) -> dict[str, Any]:
        self.seed_demo()
        email = str(user["email"]).lower()
        user_id = str(user["user_id"])
        name = str(user["name"])
        is_platform_admin = str(user.get("role") or "").lower() in {"super_admin", "admin"} or email in {
            "admin@sentra.local",
            "admin@sentra.demo",
        }
        tenant_id, role, department = DEMO_MEMBERSHIP_BY_EMAIL.get(
            email,
            ("TEN-BALA-UNI", "viewer", "Observers"),
        )
        with self._lock:
            payload = self._read()
            membership = _find_membership(payload, user_id, tenant_id)
            if membership is None:
                membership = _membership(
                    user_id=user_id,
                    tenant_id=tenant_id,
                    email=email,
                    name=name,
                    role=role,
                    department=department,
                    invited_by="system",
                )
                payload["memberships"].append(membership)

            if is_platform_admin:
                for organization in DEMO_ORGANIZATIONS:
                    demo_tenant_id = str(organization["id"])
                    if _find_membership(payload, user_id, demo_tenant_id) is None:
                        payload["memberships"].append(
                            _membership(
                                user_id=user_id,
                                tenant_id=demo_tenant_id,
                                email=email,
                                name=name,
                                role="owner",
                                department="Command",
                                invited_by="system",
                            )
                        )

            payload["active_tenant_by_user"].setdefault(user_id, tenant_id)
            self._write(payload)
            return dict(membership)

    def resolve_context(self, user: dict[str, Any], requested_tenant_id: str | None = None) -> dict[str, Any]:
        default_membership = self.ensure_user_membership(user)
        user_id = str(user["user_id"])
        with self._lock:
            payload = self._read()
            active_tenant_id = requested_tenant_id or payload["active_tenant_by_user"].get(user_id) or default_membership["tenant_id"]
            membership = _find_membership(payload, user_id, str(active_tenant_id))
            if membership is None or not membership.get("active", True):
                active_tenant_id = default_membership["tenant_id"]
                membership = _find_membership(payload, user_id, str(active_tenant_id)) or default_membership
                payload["active_tenant_by_user"][user_id] = active_tenant_id
                self._write(payload)
            organization = _find_org(payload, str(active_tenant_id)) or _find_org(payload, str(default_membership["tenant_id"]))
            plan = _find_plan(payload, str(active_tenant_id)) or {"tenant_id": active_tenant_id, **plan_for_key("business")}
            return {
                "tenant_id": str(active_tenant_id),
                "organization_name": str(organization["name"]),
                "organization_slug": str(organization["slug"]),
                "organization": dict(organization),
                "plan": dict(plan),
                "org_role": str(membership["role"]),
                "department": str(membership.get("department") or ""),
                "memberships": [dict(item) for item in payload["memberships"] if item["user_id"] == user_id and item.get("active", True)],
            }

    def switch_workspace(self, *, user_id: str, tenant_id: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            membership = _find_membership(payload, user_id, tenant_id)
            if membership is None or not membership.get("active", True):
                return None
            payload["active_tenant_by_user"][user_id] = tenant_id
            self._write(payload)
        return self.resolve_context({"user_id": user_id, "email": membership["email"], "name": membership["name"]})

    def list_users(self, tenant_id: str) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(item) for item in self._read()["memberships"] if item["tenant_id"] == tenant_id]

    def invite_user(self, *, tenant_id: str, email: str, name: str, role: str, department: str, invited_by: str) -> dict[str, Any]:
        normalized_role = role if role in ORG_ROLES else "viewer"
        with self._lock:
            payload = self._read()
            invited_user_id = f"INV-{uuid4().hex[:10]}"
            membership = _membership(
                user_id=invited_user_id,
                tenant_id=tenant_id,
                email=email.strip().lower(),
                name=name.strip() or email.strip().lower(),
                role=normalized_role,
                department=department.strip() or "Unassigned",
                invited_by=invited_by,
            )
            membership["active"] = False
            membership["invite_token"] = f"INVITE-{uuid4().hex}"
            membership["invite_expires_at"] = utc_now_iso()
            payload["memberships"].append(membership)
            payload["invites"].append(dict(membership))
            self._write(payload)
            return dict(membership)

    def update_user_role(self, *, tenant_id: str, user_id: str, role: str) -> dict[str, Any] | None:
        normalized_role = role if role in ORG_ROLES else "viewer"
        with self._lock:
            payload = self._read()
            membership = _find_membership(payload, user_id, tenant_id)
            if membership is None:
                return None
            membership["role"] = normalized_role
            self._write(payload)
            return dict(membership)

    def deactivate_user(self, *, tenant_id: str, user_id: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            membership = _find_membership(payload, user_id, tenant_id)
            if membership is None:
                return None
            membership["active"] = False
            self._write(payload)
            return dict(membership)

    def update_settings(self, tenant_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            organization = _find_org(payload, tenant_id)
            if organization is None:
                return None
            for key in ("name", "industry", "size", "country", "timezone", "status"):
                if updates.get(key) is not None:
                    organization[key] = updates[key]
            self._write(payload)
            return dict(organization)

    def update_branding(self, tenant_id: str, *, logo_url: str | None, primary_color: str | None, name: str | None) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            organization = _find_org(payload, tenant_id)
            if organization is None:
                return None
            if logo_url is not None:
                organization["logo_url"] = logo_url
            if primary_color is not None:
                organization["primary_color"] = primary_color
            if name is not None:
                organization["name"] = name
            self._write(payload)
            return dict(organization)

    def update_plan(self, tenant_id: str, plan: str) -> dict[str, Any] | None:
        normalized_plan = plan.strip().lower()
        with self._lock:
            payload = self._read()
            organization = _find_org(payload, tenant_id)
            if organization is None:
                return None
            organization["plan"] = normalized_plan
            next_plan = {"tenant_id": tenant_id, **plan_for_key(normalized_plan)}
            existing_plan = _find_plan(payload, tenant_id)
            if existing_plan is None:
                payload["plans"].append(next_plan)
            else:
                existing_plan.clear()
                existing_plan.update(next_plan)
            self._write(payload)
            return dict(organization)

    def get_usage(self, tenant_id: str) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            usage = _find_usage(payload, tenant_id)
            if usage is None:
                usage = _default_usage(tenant_id)
                payload["usage"].append(usage)
                self._write(payload)
            active_users = len([item for item in payload["memberships"] if item["tenant_id"] == tenant_id and item.get("active", True)])
            usage = dict(usage)
            usage["active_users"] = max(active_users, int(usage.get("active_users", 0)))
            return usage

    def get_plan(self, tenant_id: str) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            return dict(_find_plan(payload, tenant_id) or {"tenant_id": tenant_id, **plan_for_key("business")})


def _default_usage(tenant_id: str) -> dict[str, Any]:
    seed = sum(ord(char) for char in tenant_id)
    return {
        "tenant_id": tenant_id,
        "active_users": 3 + seed % 12,
        "incidents_month": 8 + seed % 17,
        "ai_actions_month": 42 + seed % 85,
        "reports_generated": 6 + seed % 21,
        "api_calls_month": 1_200 + seed * 7,
        "storage_used_gb": round(4.5 + (seed % 120) / 10, 1),
    }


def _membership(*, user_id: str, tenant_id: str, email: str, name: str, role: str, department: str, invited_by: str) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "email": email,
        "name": name,
        "role": role,
        "department": department,
        "invited_by": invited_by,
        "joined_at": utc_now_iso(),
        "active": True,
    }


def _find_org(payload: dict[str, Any], tenant_id: str) -> dict[str, Any] | None:
    return next((org for org in payload["organizations"] if org["id"] == tenant_id), None)


def _find_plan(payload: dict[str, Any], tenant_id: str) -> dict[str, Any] | None:
    return next((plan for plan in payload["plans"] if plan["tenant_id"] == tenant_id), None)


def _find_usage(payload: dict[str, Any], tenant_id: str) -> dict[str, Any] | None:
    return next((usage for usage in payload["usage"] if usage["tenant_id"] == tenant_id), None)


def _find_membership(payload: dict[str, Any], user_id: str, tenant_id: str) -> dict[str, Any] | None:
    return next(
        (item for item in payload["memberships"] if item["user_id"] == user_id and item["tenant_id"] == tenant_id),
        None,
    )


tenancy_store = TenancyStore()

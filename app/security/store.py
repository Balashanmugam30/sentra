from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS, utc_now_iso


ORGANIZATIONS: tuple[dict[str, Any], ...] = (
    {
        "org_id": "ORG-GRAND-MERIDIAN",
        "tenant_id": "TEN-GRAND-MERIDIAN",
        "org_name": "Grand Meridian Hotels",
        "tier": "Enterprise",
        "seats_total": 820,
        "seats_used": 642,
        "sso_enabled": True,
        "sso_provider": "Microsoft Entra",
        "owner": "Security Admin",
        "risk_score": 18,
        "last_activity": "2026-04-26T08:42:00+00:00",
        "billing_tier": "Enterprise",
    },
    {
        "org_id": "ORG-METROCARE",
        "tenant_id": "TEN-BALA-HOSP",
        "org_name": "MetroCare Hospitals",
        "tier": "Government",
        "seats_total": 1280,
        "seats_used": 1104,
        "sso_enabled": True,
        "sso_provider": "Google Workspace",
        "owner": "Ops Lead",
        "risk_score": 24,
        "last_activity": "2026-04-26T08:36:00+00:00",
        "billing_tier": "Government",
    },
    {
        "org_id": "ORG-NOVA-MALL",
        "tenant_id": "TEN-BALA-MFG",
        "org_name": "Nova Mall Group",
        "tier": "Growth",
        "seats_total": 460,
        "seats_used": 394,
        "sso_enabled": False,
        "sso_provider": "SSO ready",
        "owner": "Analyst 1",
        "risk_score": 31,
        "last_activity": "2026-04-26T08:31:00+00:00",
        "billing_tier": "Growth",
    },
    {
        "org_id": "ORG-SKYLINE",
        "tenant_id": "TEN-BALA-UNI",
        "org_name": "Skyline University",
        "tier": "Enterprise",
        "seats_total": 900,
        "seats_used": 768,
        "sso_enabled": True,
        "sso_provider": "SAML",
        "owner": "Night Operator",
        "risk_score": 27,
        "last_activity": "2026-04-26T08:27:00+00:00",
        "billing_tier": "Enterprise",
    },
    {
        "org_id": "ORG-SMARTCITY",
        "tenant_id": "TEN-GOVSECURE",
        "org_name": "SmartCity Authority",
        "tier": "Custom Strategic",
        "seats_total": 1500,
        "seats_used": 1248,
        "sso_enabled": True,
        "sso_provider": "Sovereign SAML",
        "owner": "Bala CEO",
        "risk_score": 14,
        "last_activity": "2026-04-26T08:44:00+00:00",
        "billing_tier": "Custom Strategic",
    },
)

USERS: tuple[dict[str, Any], ...] = (
    {
        "id": "USR-BALA-CEO",
        "name": "Bala CEO",
        "email": "bala.ceo@sentra.demo",
        "org_id": "ORG-SMARTCITY",
        "tenant_id": "TEN-GOVSECURE",
        "role": "Super Admin",
        "status": "active",
        "department": "Executive",
        "mfa_enabled": True,
        "created_at": "2026-01-08T09:00:00+00:00",
        "last_seen": "2026-04-26T08:45:00+00:00",
        "trusted_devices": 4,
        "risk_score": 8,
    },
    {
        "id": "USR-SECURITY-ADMIN",
        "name": "Security Admin",
        "email": "security.admin@sentra.demo",
        "org_id": "ORG-GRAND-MERIDIAN",
        "tenant_id": "TEN-GRAND-MERIDIAN",
        "role": "Security Manager",
        "status": "active",
        "department": "Security",
        "mfa_enabled": True,
        "created_at": "2026-02-02T09:00:00+00:00",
        "last_seen": "2026-04-26T08:42:00+00:00",
        "trusted_devices": 3,
        "risk_score": 12,
    },
    {
        "id": "USR-OPS-LEAD",
        "name": "Ops Lead",
        "email": "ops.lead@sentra.demo",
        "org_id": "ORG-METROCARE",
        "tenant_id": "TEN-BALA-HOSP",
        "role": "Operations Lead",
        "status": "active",
        "department": "Operations",
        "mfa_enabled": True,
        "created_at": "2026-02-16T09:00:00+00:00",
        "last_seen": "2026-04-26T08:39:00+00:00",
        "trusted_devices": 2,
        "risk_score": 16,
    },
    {
        "id": "USR-ANALYST-1",
        "name": "Analyst 1",
        "email": "analyst1@sentra.demo",
        "org_id": "ORG-NOVA-MALL",
        "tenant_id": "TEN-BALA-MFG",
        "role": "Analyst",
        "status": "active",
        "department": "Analytics",
        "mfa_enabled": False,
        "created_at": "2026-03-01T09:00:00+00:00",
        "last_seen": "2026-04-26T08:20:00+00:00",
        "trusted_devices": 1,
        "risk_score": 38,
    },
    {
        "id": "USR-NIGHT-OPERATOR",
        "name": "Night Operator",
        "email": "night.operator@sentra.demo",
        "org_id": "ORG-SKYLINE",
        "tenant_id": "TEN-BALA-UNI",
        "role": "Operator",
        "status": "locked",
        "department": "Command Desk",
        "mfa_enabled": False,
        "created_at": "2026-03-12T09:00:00+00:00",
        "last_seen": "2026-04-26T06:12:00+00:00",
        "trusted_devices": 1,
        "risk_score": 64,
    },
    {
        "id": "USR-VIEWER-GUEST",
        "name": "Viewer Guest",
        "email": "viewer.guest@sentra.demo",
        "org_id": "ORG-GRAND-MERIDIAN",
        "tenant_id": "TEN-GRAND-MERIDIAN",
        "role": "Viewer",
        "status": "active",
        "department": "External Audit",
        "mfa_enabled": True,
        "created_at": "2026-03-30T09:00:00+00:00",
        "last_seen": "2026-04-25T19:18:00+00:00",
        "trusted_devices": 1,
        "risk_score": 21,
    },
)

SESSIONS: tuple[dict[str, Any], ...] = (
    {"session_id": "SES-BALA-CEO-01", "user_id": "USR-BALA-CEO", "tenant_id": "TEN-GOVSECURE", "device": "MacBook Pro", "browser": "Chrome 124", "region": "Chennai, IN", "risk_score": 9, "created_at": "2026-04-26T05:58:00+00:00", "last_active": "2026-04-26T08:45:00+00:00", "token_age_minutes": 167, "status": "active", "trusted_device": True, "impossible_travel": False},
    {"session_id": "SES-SEC-ADMIN-01", "user_id": "USR-SECURITY-ADMIN", "tenant_id": "TEN-GRAND-MERIDIAN", "device": "Windows Command Tablet", "browser": "Edge 124", "region": "New York, US", "risk_score": 18, "created_at": "2026-04-26T06:12:00+00:00", "last_active": "2026-04-26T08:42:00+00:00", "token_age_minutes": 150, "status": "active", "trusted_device": True, "impossible_travel": False},
    {"session_id": "SES-OPS-LEAD-01", "user_id": "USR-OPS-LEAD", "tenant_id": "TEN-BALA-HOSP", "device": "iPad Field", "browser": "Safari 17", "region": "Boston, US", "risk_score": 22, "created_at": "2026-04-26T06:18:00+00:00", "last_active": "2026-04-26T08:39:00+00:00", "token_age_minutes": 141, "status": "active", "trusted_device": True, "impossible_travel": False},
    {"session_id": "SES-ANALYST-01", "user_id": "USR-ANALYST-1", "tenant_id": "TEN-BALA-MFG", "device": "Lenovo ThinkPad", "browser": "Firefox 125", "region": "Dubai, AE", "risk_score": 42, "created_at": "2026-04-25T20:10:00+00:00", "last_active": "2026-04-26T08:20:00+00:00", "token_age_minutes": 730, "status": "watch", "trusted_device": False, "impossible_travel": False},
    {"session_id": "SES-NIGHT-OP-01", "user_id": "USR-NIGHT-OPERATOR", "tenant_id": "TEN-BALA-UNI", "device": "Unknown Android", "browser": "Mobile Chrome", "region": "Unknown VPN", "risk_score": 78, "created_at": "2026-04-26T02:12:00+00:00", "last_active": "2026-04-26T06:12:00+00:00", "token_age_minutes": 600, "status": "revoked", "trusted_device": False, "impossible_travel": True},
)

ALERTS: tuple[dict[str, Any], ...] = (
    {"alert_id": "SEC-ALERT-001", "tenant_id": "TEN-BALA-UNI", "type": "locked_account", "severity": "high", "title": "Night Operator locked after repeated OTP failures", "detail": "Account is contained; admin review required before unlock.", "created_at": "2026-04-26T06:14:00+00:00", "status": "open"},
    {"alert_id": "SEC-ALERT-002", "tenant_id": "TEN-BALA-MFG", "type": "mfa_gap", "severity": "medium", "title": "Analyst 1 requires MFA enrollment", "detail": "Read-only analytics access is allowed, export permissions stay blocked.", "created_at": "2026-04-26T08:03:00+00:00", "status": "watch"},
    {"alert_id": "SEC-ALERT-003", "tenant_id": "TEN-GRAND-MERIDIAN", "type": "sso_health", "severity": "low", "title": "Microsoft Entra certificate rotation due in 18 days", "detail": "No outage risk yet; schedule rotation during low traffic window.", "created_at": "2026-04-26T07:41:00+00:00", "status": "scheduled"},
    {"alert_id": "SEC-ALERT-004", "tenant_id": "TEN-GOVSECURE", "type": "impossible_travel_watch", "severity": "medium", "title": "Sovereign workspace impossible-travel model armed", "detail": "No active violation; model confidence is calibrated at 92 percent.", "created_at": "2026-04-26T08:10:00+00:00", "status": "healthy"},
)

ROLES: tuple[dict[str, Any], ...] = (
    {"role_id": "super_admin", "name": "Super Admin", "tier": "platform", "users": 1, "permissions": ["all platform control", "tenant switching", "billing access", "AI override", "security policy"]},
    {"role_id": "org_admin", "name": "Org Admin", "tier": "tenant", "users": 0, "permissions": ["manage users", "configure SSO", "billing access", "export reports", "workspace policy"]},
    {"role_id": "security_manager", "name": "Security Manager", "tier": "operations", "users": 1, "permissions": ["view incidents", "approve actions", "twin control", "revoke sessions", "security audit"]},
    {"role_id": "operations_lead", "name": "Operations Lead", "tier": "operations", "users": 1, "permissions": ["approve actions", "workflow control", "field dispatch", "tenant reports"]},
    {"role_id": "analyst", "name": "Analyst", "tier": "read", "users": 1, "permissions": ["analytics view", "reports view", "read-only AI insights"]},
    {"role_id": "operator", "name": "Operator", "tier": "field", "users": 1, "permissions": ["task updates", "incident acknowledgement", "limited zone tools"]},
    {"role_id": "viewer", "name": "Viewer", "tier": "read", "users": 1, "permissions": ["limited alerts", "personal route", "read-only status"]},
)


class SecurityCenterStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "organizations": [],
            "users": [],
            "sessions": [],
            "alerts": [],
            "roles": [],
            "events": [],
            "active_org_id": "ORG-GRAND-MERIDIAN",
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
        seed_groups = {
            "organizations": (ORGANIZATIONS, "org_id"),
            "users": (USERS, "id"),
            "sessions": (SESSIONS, "session_id"),
            "alerts": (ALERTS, "alert_id"),
            "roles": (ROLES, "role_id"),
        }
        with self._lock:
            payload = self._read()
            for table, (rows, key) in seed_groups.items():
                existing = {row[key] for row in payload[table] if key in row}
                for row in rows:
                    if row[key] in existing:
                        continue
                    payload[table].append({**row, "updated_at": utc_now_iso()})
                    created += 1
            self._write(payload)
        return {"created": created}

    def rows(self, table: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(row) for row in self._read()[table]]
        if table == "roles" or set(tenant_ids) == set(DEMO_TENANTS):
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids]

    def invite_user(self, tenant_ids: list[str], data: dict[str, Any]) -> dict[str, Any]:
        self.seed_demo()
        email = str(data.get("email") or "invited.user@sentra.demo").strip().lower()
        name = str(data.get("name") or email.split("@")[0]).strip()
        role = str(data.get("role") or "Viewer").strip()
        org_id = str(data.get("org_id") or "")
        with self._lock:
            payload = self._read()
            existing_user = next((dict(row) for row in payload["users"] if row["email"] == email), None)
            if existing_user is not None:
                event = self._append_event_locked(payload, tenant_ids[0], "user_invite_deduped", {"user_id": existing_user["id"], "email": email})
                self._write(payload)
                return {"user": existing_user, "event": event, "already_invited": True}

            org = next(
                (row for row in payload["organizations"] if row["org_id"] == org_id and row["tenant_id"] in tenant_ids),
                next((row for row in payload["organizations"] if row["tenant_id"] in tenant_ids), payload["organizations"][0]),
            )
            user = {
                "id": f"USR-INVITE-{len(payload['users']) + 1:03d}",
                "name": name,
                "email": email,
                "org_id": org["org_id"],
                "tenant_id": org["tenant_id"],
                "role": role,
                "status": "invited",
                "department": str(data.get("department") or "Pending onboarding"),
                "mfa_enabled": False,
                "created_at": utc_now_iso(),
                "last_seen": "pending",
                "trusted_devices": 0,
                "risk_score": 34,
                "invite_method": str(data.get("invite_method") or "email"),
            }
            payload["users"].append(user)
            event = self._append_event_locked(payload, org["tenant_id"], "user_invited", {"user_id": user["id"], "email": email, "role": role})
            self._write(payload)
            return {"user": user, "event": event, "already_invited": False}

    def disable_user(self, tenant_ids: list[str], user_id: str) -> dict[str, Any] | None:
        return self._update_user(tenant_ids, user_id, {"status": "disabled"}, "user_disabled")

    def set_user_role(self, tenant_ids: list[str], user_id: str, role: str) -> dict[str, Any] | None:
        return self._update_user(tenant_ids, user_id, {"role": role}, "user_role_changed")

    def reset_mfa(self, tenant_ids: list[str], user_id: str) -> dict[str, Any] | None:
        return self._update_user(tenant_ids, user_id, {"mfa_enabled": False, "mfa_reset_required": True}, "user_mfa_reset")

    def _update_user(self, tenant_ids: list[str], user_id: str, updates: dict[str, Any], action: str) -> dict[str, Any] | None:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            for user in payload["users"]:
                if user["id"] != user_id or user["tenant_id"] not in tenant_ids:
                    continue
                user.update(updates)
                user["updated_at"] = utc_now_iso()
                event = self._append_event_locked(payload, str(user["tenant_id"]), action, {"user_id": user_id, **updates})
                self._write(payload)
                return {"user": dict(user), "event": event}
        return None

    def create_org(self, tenant_ids: list[str], data: dict[str, Any]) -> dict[str, Any]:
        self.seed_demo()
        org_name = str(data.get("org_name") or data.get("name") or "New Sentra Workspace").strip()
        tenant_id = tenant_ids[0]
        with self._lock:
            payload = self._read()
            org = {
                "org_id": f"ORG-{len(payload['organizations']) + 1:03d}",
                "tenant_id": tenant_id,
                "org_name": org_name,
                "tier": str(data.get("tier") or "Growth"),
                "seats_total": int(data.get("seats_total") or 120),
                "seats_used": 1,
                "sso_enabled": False,
                "sso_provider": "SSO ready",
                "owner": str(data.get("owner") or "Org Admin"),
                "risk_score": 29,
                "last_activity": utc_now_iso(),
                "billing_tier": str(data.get("billing_tier") or "Growth"),
                "updated_at": utc_now_iso(),
            }
            payload["organizations"].append(org)
            event = self._append_event_locked(payload, tenant_id, "organization_created", {"org_id": org["org_id"], "org_name": org_name})
            self._write(payload)
            return {"organization": org, "event": event}

    def switch_org(self, tenant_ids: list[str], org_id: str) -> dict[str, Any] | None:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            org = next((dict(row) for row in payload["organizations"] if row["org_id"] == org_id and row["tenant_id"] in tenant_ids), None)
            if org is None:
                return None
            payload["active_org_id"] = org_id
            event = self._append_event_locked(payload, org["tenant_id"], "organization_switched", {"org_id": org_id})
            self._write(payload)
            return {"organization": org, "event": event}

    def revoke_session(self, tenant_ids: list[str], session_id: str) -> dict[str, Any] | None:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            for session in payload["sessions"]:
                if session["session_id"] != session_id or session["tenant_id"] not in tenant_ids:
                    continue
                session["status"] = "revoked"
                session["risk_score"] = min(100, int(session.get("risk_score", 0)) + 8)
                session["updated_at"] = utc_now_iso()
                event = self._append_event_locked(payload, str(session["tenant_id"]), "session_revoked", {"session_id": session_id})
                self._write(payload)
                return {"session": dict(session), "event": event}
        return None

    def record_event(self, tenant_ids: list[str], action: str, payload_data: dict[str, Any] | None = None) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            event = self._append_event_locked(payload, tenant_ids[0], action, payload_data or {})
            self._write(payload)
            return event

    def _append_event_locked(self, payload: dict[str, Any], tenant_id: str, action: str, payload_data: dict[str, Any]) -> dict[str, Any]:
        event = {
            "event_id": f"SEC-EVT-{len(payload['events']) + 1:05d}",
            "tenant_id": tenant_id,
            "action": action,
            "payload": payload_data,
            "created_at": utc_now_iso(),
        }
        payload["events"].append(event)
        return dict(event)


security_center_store = SecurityCenterStore(settings.sentra_security_store_path)

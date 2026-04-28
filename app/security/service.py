from __future__ import annotations

from collections import Counter
from statistics import mean
from typing import Any

from app.security.store import security_center_store


def _avg(rows: list[dict[str, Any]], key: str) -> float:
    if not rows:
        return 0.0
    return round(mean(float(row.get(key, 0)) for row in rows), 2)


class SecurityCenterService:
    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        users = security_center_store.rows("users", tenant_ids)
        orgs = security_center_store.rows("organizations", tenant_ids)
        sessions = security_center_store.rows("sessions", tenant_ids)
        alerts = security_center_store.rows("alerts", tenant_ids)
        roles = security_center_store.rows("roles", tenant_ids)
        mfa_enabled = len([user for user in users if bool(user.get("mfa_enabled"))])
        active_users = len([user for user in users if user.get("status") in {"active", "invited"}])
        active_sessions = len([session for session in sessions if session.get("status") == "active"])
        trusted_devices = len([session for session in sessions if bool(session.get("trusted_device"))])
        failed_logins = len([alert for alert in alerts if alert.get("type") in {"locked_account", "impossible_travel_watch"}])
        suspicious_attempts = len([alert for alert in alerts if alert.get("severity") in {"medium", "high"}])
        locked_accounts = len([user for user in users if user.get("status") == "locked"])
        role_distribution = dict(Counter(str(user.get("role", "Unknown")) for user in users))
        security_score = self.security_score(users, orgs, sessions, alerts)
        return {
            "active_users": active_users,
            "organizations": len(orgs),
            "sessions_online": active_sessions,
            "failed_logins": failed_logins,
            "mfa_coverage": round((mfa_enabled / max(1, len(users))) * 100),
            "suspicious_attempts": suspicious_attempts,
            "locked_accounts": locked_accounts,
            "role_distribution": role_distribution,
            "devices_trusted": trusted_devices,
            "security_score": security_score,
            "sso_ready_orgs": len([org for org in orgs if bool(org.get("sso_enabled"))]),
            "average_org_risk": _avg(orgs, "risk_score"),
            "average_session_risk": _avg(sessions, "risk_score"),
            "recent_alerts": alerts[:6],
            "roles": roles,
            "auth_methods": [
                {"method": "Email + Password", "status": "active", "coverage": 100},
                {"method": "Magic Link", "status": "mock ready", "coverage": 82},
                {"method": "Google SSO", "status": "mock ready", "coverage": 64},
                {"method": "Microsoft SSO", "status": "active", "coverage": 76},
                {"method": "Organization SSO", "status": "ready state", "coverage": 88},
            ],
            "mfa_methods": [
                {"method": "Email OTP", "status": "active"},
                {"method": "Authenticator App", "status": "mock ready"},
                {"method": "Backup Codes", "status": "generated on enrollment"},
                {"method": "Admin Force MFA", "status": "enforced"},
            ],
        }

    def security_score(
        self,
        users: list[dict[str, Any]],
        orgs: list[dict[str, Any]],
        sessions: list[dict[str, Any]],
        alerts: list[dict[str, Any]],
    ) -> dict[str, Any]:
        if not users:
            return {"score": 0, "grade": "No data", "drivers": []}
        mfa = len([user for user in users if bool(user.get("mfa_enabled"))]) / max(1, len(users))
        locked_penalty = len([user for user in users if user.get("status") == "locked"]) * 4
        high_risk_sessions = len([session for session in sessions if int(session.get("risk_score", 0)) >= 60]) * 5
        stale_admins = len([user for user in users if user.get("role") in {"Super Admin", "Org Admin"} and str(user.get("last_seen")) == "pending"]) * 6
        sso = len([org for org in orgs if bool(org.get("sso_enabled"))]) / max(1, len(orgs))
        alert_penalty = len([alert for alert in alerts if alert.get("severity") == "high"]) * 3
        score = round(58 + (mfa * 22) + (sso * 18) - locked_penalty - high_risk_sessions - stale_admins - alert_penalty)
        score = max(0, min(100, score))
        return {
            "score": score,
            "grade": "Elite" if score >= 90 else "Strong" if score >= 80 else "Watch" if score >= 68 else "Needs action",
            "drivers": [
                {"label": "MFA adoption", "value": round(mfa * 100), "status": "strong" if mfa >= 0.75 else "watch"},
                {"label": "SSO coverage", "value": round(sso * 100), "status": "strong" if sso >= 0.75 else "watch"},
                {"label": "High-risk sessions", "value": high_risk_sessions // 5, "status": "watch" if high_risk_sessions else "strong"},
                {"label": "Locked accounts", "value": locked_penalty // 4, "status": "watch" if locked_penalty else "strong"},
            ],
        }

    def users(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return security_center_store.rows("users", tenant_ids)

    def organizations(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return security_center_store.rows("organizations", tenant_ids)

    def sessions(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return security_center_store.rows("sessions", tenant_ids)

    def roles(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return security_center_store.rows("roles", tenant_ids)

    def alerts(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return security_center_store.rows("alerts", tenant_ids)

    def invite_user(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        return security_center_store.invite_user(tenant_ids, payload)

    def disable_user(self, tenant_ids: list[str], user_id: str) -> dict[str, Any] | None:
        return security_center_store.disable_user(tenant_ids, user_id)

    def set_user_role(self, tenant_ids: list[str], user_id: str, role: str) -> dict[str, Any] | None:
        return security_center_store.set_user_role(tenant_ids, user_id, role)

    def reset_mfa(self, tenant_ids: list[str], user_id: str) -> dict[str, Any] | None:
        return security_center_store.reset_mfa(tenant_ids, user_id)

    def create_org(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        return security_center_store.create_org(tenant_ids, payload)

    def switch_org(self, tenant_ids: list[str], org_id: str) -> dict[str, Any] | None:
        return security_center_store.switch_org(tenant_ids, org_id)

    def revoke_session(self, tenant_ids: list[str], session_id: str) -> dict[str, Any] | None:
        return security_center_store.revoke_session(tenant_ids, session_id)


security_center_service = SecurityCenterService()

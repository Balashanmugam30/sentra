from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.marketplace.catalog import APP_BY_ID, APP_BY_SLUG, MARKETPLACE_APPS
from app.marketplace.models import MARKETPLACE_CATEGORIES


SEEDED_AT = "2026-04-26T00:00:00+00:00"
STORE_VERSION = "phase27b-2026-04-26"
DEMO_TENANTS = ("TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSP", "TEN-GOVSECURE", "TEN-GRAND-MERIDIAN")

DEMO_INSTALLS: dict[str, list[str]] = {
    "TEN-BALA-UNI": ["APP-SLACK-CRISIS", "APP-GMAPS-EVAC", "APP-BOARD-PDF"],
    "TEN-BALA-MFG": ["APP-SAP-INCIDENT", "APP-POWER-GRID", "APP-SNOW-RESPONSE"],
    "TEN-BALA-HOSP": ["APP-TEAMS-COMMAND", "APP-WHATSAPP-PRO", "APP-AI-VOICE"],
    "TEN-GOVSECURE": ["APP-VISITOR-SHIELD", "APP-DRONE-FLEET", "APP-SNOW-RESPONSE"],
    "TEN-GRAND-MERIDIAN": ["APP-SLACK-CRISIS", "APP-GMAPS-EVAC", "APP-WHATSAPP-PRO"],
}

VENDORS: tuple[dict[str, Any], ...] = (
    {"vendor_id": "VEN-SALESFORCE", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Salesforce", "category": "business systems", "support_score": 96, "revenue_generated": 184000, "certification_badge": "verified enterprise", "response_sla_hours": 4, "trust_score": 94},
    {"vendor_id": "VEN-MICROSOFT", "tenant_id": "TEN-BALA-HOSP", "name": "Microsoft", "category": "communication + identity", "support_score": 97, "revenue_generated": 216000, "certification_badge": "verified government", "response_sla_hours": 3, "trust_score": 96},
    {"vendor_id": "VEN-SERVICENOW", "tenant_id": "TEN-GOVSECURE", "name": "ServiceNow", "category": "workflow automation", "support_score": 94, "revenue_generated": 142000, "certification_badge": "certified partner", "response_sla_hours": 5, "trust_score": 92},
    {"vendor_id": "VEN-SKYOPS", "tenant_id": "TEN-BALA-MFG", "name": "SkyOps Robotics", "category": "field robotics", "support_score": 88, "revenue_generated": 96000, "certification_badge": "security reviewed", "response_sla_hours": 8, "trust_score": 86},
)

PARTNERS: tuple[dict[str, Any], ...] = (
    {"partner_id": "PAR-ACCENTURE", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Accenture Safety Cloud", "type": "implementation firm", "region": "global", "certified_consultants": 84, "co_sell_pipeline": 2400000, "response_sla_hours": 6, "partner_score": 95},
    {"partner_id": "PAR-TCS", "tenant_id": "TEN-BALA-HOSP", "name": "TCS Smart Facilities", "type": "channel partner", "region": "India", "certified_consultants": 62, "co_sell_pipeline": 1280000, "response_sla_hours": 8, "partner_score": 91},
    {"partner_id": "PAR-GOVTECH", "tenant_id": "TEN-GOVSECURE", "name": "Strategic GovTech Fund", "type": "government partner", "region": "APAC Gov", "certified_consultants": 22, "co_sell_pipeline": 3400000, "response_sla_hours": 4, "partner_score": 93},
    {"partner_id": "PAR-SAFETYOPS", "tenant_id": "TEN-BALA-MFG", "name": "SafetyOps Integrators", "type": "implementation firm", "region": "industrial", "certified_consultants": 31, "co_sell_pipeline": 780000, "response_sla_hours": 10, "partner_score": 87},
)

REVIEWS: tuple[dict[str, Any], ...] = (
    {"review_id": "REV-001", "tenant_id": "TEN-GRAND-MERIDIAN", "app_id": "APP-SLACK-CRISIS", "author": "Grand Meridian Ops", "rating": 5, "title": "Incident rooms feel native", "body": "Slack Crisis Bridge shortened executive escalation during drills.", "created_at": "2026-04-20T10:00:00+00:00"},
    {"review_id": "REV-002", "tenant_id": "TEN-BALA-HOSP", "app_id": "APP-WHATSAPP-PRO", "author": "Hospital Command", "rating": 4, "title": "Reliable broadcast fallback", "body": "Template approvals and retries make regulated communications cleaner.", "created_at": "2026-04-21T12:00:00+00:00"},
    {"review_id": "REV-003", "tenant_id": "TEN-GOVSECURE", "app_id": "APP-SNOW-RESPONSE", "author": "Gov Response Lead", "rating": 5, "title": "Workflow audit trail is excellent", "body": "ServiceNow Response Flow gives procurement a clean control story.", "created_at": "2026-04-22T14:00:00+00:00"},
)

BILLING_ADDONS: tuple[dict[str, Any], ...] = (
    {"addon_id": "ADDON-AI-VOICE", "tenant_id": "TEN-BALA-HOSP", "app_id": "APP-AI-VOICE", "name": "AI Voice Call Escalation", "mrr": 8200, "status": "active", "plan_fit": "Enterprise"},
    {"addon_id": "ADDON-EVAC-MAPS", "tenant_id": "TEN-GRAND-MERIDIAN", "app_id": "APP-GMAPS-EVAC", "name": "Google Maps Evac Layer", "mrr": 12400, "status": "active", "plan_fit": "Enterprise"},
    {"addon_id": "ADDON-DRONES", "tenant_id": "TEN-GOVSECURE", "app_id": "APP-DRONE-FLEET", "name": "Drone Fleet Control", "mrr": 15600, "status": "trial", "plan_fit": "Government"},
)

REVENUE_SHARE: tuple[dict[str, Any], ...] = (
    {"share_id": "REVSH-001", "tenant_id": "TEN-GRAND-MERIDIAN", "vendor": "Google", "app_id": "APP-GMAPS-EVAC", "gross_mrr": 12400, "take_rate": 22, "partner_payout": 9672, "sentra_revenue": 2728},
    {"share_id": "REVSH-002", "tenant_id": "TEN-BALA-HOSP", "vendor": "VoiceOps AI", "app_id": "APP-AI-VOICE", "gross_mrr": 8200, "take_rate": 25, "partner_payout": 6150, "sentra_revenue": 2050},
    {"share_id": "REVSH-003", "tenant_id": "TEN-GOVSECURE", "vendor": "SkyOps Robotics", "app_id": "APP-DRONE-FLEET", "gross_mrr": 15600, "take_rate": 18, "partner_payout": 12792, "sentra_revenue": 2808},
)

TRIALS: tuple[dict[str, Any], ...] = (
    {"trial_id": "TRL-001", "tenant_id": "TEN-BALA-HOSP", "app_id": "APP-AI-VOICE", "stage": "active", "days_left": 11, "conversion_probability": 71, "expansion_mrr": 8200},
    {"trial_id": "TRL-002", "tenant_id": "TEN-GOVSECURE", "app_id": "APP-DRONE-FLEET", "stage": "security review", "days_left": 18, "conversion_probability": 64, "expansion_mrr": 15600},
    {"trial_id": "TRL-003", "tenant_id": "TEN-BALA-UNI", "app_id": "APP-BOARD-PDF", "stage": "converted", "days_left": 0, "conversion_probability": 100, "expansion_mrr": 2400},
)

FAILED_SYNC_ALERTS: tuple[dict[str, Any], ...] = (
    {"alert_id": "SYNC-001", "tenant_id": "TEN-BALA-HOSP", "app_id": "APP-WHATSAPP-PRO", "severity": "medium", "title": "WhatsApp template sync delayed", "status": "retrying", "last_seen": "2026-04-26T07:30:00+00:00"},
    {"alert_id": "SYNC-002", "tenant_id": "TEN-BALA-MFG", "app_id": "APP-POWER-GRID", "severity": "low", "title": "Power telemetry lag above SLA", "status": "watch", "last_seen": "2026-04-26T06:55:00+00:00"},
)

AUTOMATION_TEMPLATES: tuple[dict[str, Any], ...] = (
    {"template_id": "AUTO-N8N-FIRE", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "n8n fire response connector", "provider": "n8n", "trigger": "incident.created", "actions": ["open workflow", "notify responders", "export evidence"], "installs": 44, "success_rate": 98},
    {"template_id": "AUTO-SLACK-ROOM", "tenant_id": "TEN-BALA-UNI", "name": "Slack emergency room automation", "provider": "Slack", "trigger": "alert.critical", "actions": ["create channel", "pin checklist", "page lead"], "installs": 72, "success_rate": 99},
    {"template_id": "AUTO-TEAMS-APPROVAL", "tenant_id": "TEN-BALA-HOSP", "name": "Teams executive approval workflow", "provider": "Teams", "trigger": "approval.required", "actions": ["send card", "collect decision", "audit result"], "installs": 51, "success_rate": 97},
    {"template_id": "AUTO-SMS-FLOW", "tenant_id": "TEN-GOVSECURE", "name": "SMS silent-zone retry flow", "provider": "SMS", "trigger": "communications.silent", "actions": ["retry alternate channel", "notify manager"], "installs": 38, "success_rate": 96},
    {"template_id": "AUTO-BOARD-REPORT", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Executive report auto-export", "provider": "Board PDF Exporter", "trigger": "incident.closed", "actions": ["generate PDF", "send to board room"], "installs": 29, "success_rate": 99},
)

SECURITY_APPROVALS: tuple[dict[str, Any], ...] = (
    {"approval_id": "SEC-APP-001", "tenant_id": "TEN-GRAND-MERIDIAN", "app_id": "APP-SLACK-CRISIS", "trust_score": 94, "permission_risk": 18, "data_access_class": "Internal", "status": "approved", "reviewer": "Security Admin"},
    {"approval_id": "SEC-APP-002", "tenant_id": "TEN-GOVSECURE", "app_id": "APP-DRONE-FLEET", "trust_score": 86, "permission_risk": 36, "data_access_class": "Sensitive facility", "status": "pending", "reviewer": "Gov CISO"},
    {"approval_id": "SEC-APP-003", "tenant_id": "TEN-BALA-HOSP", "app_id": "APP-AI-VOICE", "trust_score": 89, "permission_risk": 28, "data_access_class": "PII", "status": "approved", "reviewer": "Privacy Officer"},
)

USAGE_STATS: tuple[dict[str, Any], ...] = (
    {"usage_id": "MKT-USG-001", "tenant_id": "TEN-GRAND-MERIDIAN", "app_id": "APP-GMAPS-EVAC", "monthly_events": 184200, "active_users": 420, "health": 98, "expansion_signal": "high"},
    {"usage_id": "MKT-USG-002", "tenant_id": "TEN-BALA-HOSP", "app_id": "APP-AI-VOICE", "monthly_events": 64200, "active_users": 180, "health": 96, "expansion_signal": "medium"},
    {"usage_id": "MKT-USG-003", "tenant_id": "TEN-GOVSECURE", "app_id": "APP-DRONE-FLEET", "monthly_events": 31200, "active_users": 48, "health": 92, "expansion_signal": "high"},
)


class MarketplaceStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "store_version": STORE_VERSION,
            "installations": [],
            "vendors": [],
            "partners": [],
            "reviews": [],
            "billing_addons": [],
            "revenue_share": [],
            "trials": [],
            "failed_sync_alerts": [],
            "automation_templates": [],
            "security_approvals": [],
            "usage_stats": [],
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
        if payload.get("store_version") != STORE_VERSION:
            return default
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        with self._lock:
            payload = self._read()
            existing_installs = {(item["tenant_id"], item["app_id"]) for item in payload["installations"]}
            for tenant_id, app_ids in DEMO_INSTALLS.items():
                for app_id in app_ids:
                    if (tenant_id, app_id) in existing_installs:
                        continue
                    payload["installations"].append(self._installation(tenant_id, app_id, "system"))
                    created += 1

            seed_groups = {
                "vendors": (VENDORS, "vendor_id"),
                "partners": (PARTNERS, "partner_id"),
                "reviews": (REVIEWS, "review_id"),
                "billing_addons": (BILLING_ADDONS, "addon_id"),
                "revenue_share": (REVENUE_SHARE, "share_id"),
                "trials": (TRIALS, "trial_id"),
                "failed_sync_alerts": (FAILED_SYNC_ALERTS, "alert_id"),
                "automation_templates": (AUTOMATION_TEMPLATES, "template_id"),
                "security_approvals": (SECURITY_APPROVALS, "approval_id"),
                "usage_stats": (USAGE_STATS, "usage_id"),
            }
            for table, (rows, key) in seed_groups.items():
                existing = {row[key] for row in payload[table] if key in row}
                for row in rows:
                    if row[key] in existing:
                        continue
                    payload[table].append({**row, "updated_at": SEEDED_AT})
                    created += 1
            self._write(payload)
        return {"created": created, "installations": len(self.list_all_installations())}

    def list_apps(self) -> list[dict[str, Any]]:
        return [dict(item) for item in MARKETPLACE_APPS]

    def get_app(self, app_id: str) -> dict[str, Any] | None:
        return APP_BY_ID.get(app_id) or APP_BY_SLUG.get(app_id)

    def categories(self) -> list[dict[str, str]]:
        return [dict(item) for item in MARKETPLACE_CATEGORIES]

    def featured(self) -> list[dict[str, Any]]:
        return [dict(item) for item in MARKETPLACE_APPS if item["featured"]]

    def trending(self) -> list[dict[str, Any]]:
        return sorted(self.list_apps(), key=lambda item: (float(item["rating"]), int(item["review_count"])), reverse=True)[:8]

    def certified(self) -> list[dict[str, Any]]:
        return [dict(item) for item in MARKETPLACE_APPS if item["security_verified"] and item["enterprise_ready"]]

    def search(self, query: str) -> list[dict[str, Any]]:
        needle = query.strip().lower()
        if not needle:
            return self.list_apps()
        return [
            dict(item)
            for item in MARKETPLACE_APPS
            if needle in str(item["name"]).lower()
            or needle in str(item["vendor"]).lower()
            or needle in str(item["category"]).lower()
            or any(needle in str(tag).lower() for tag in item["tags"])
        ]

    def list_installed(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            installs = [dict(item) for item in self._read()["installations"] if item["tenant_id"] in tenant_ids]
        return sorted(installs, key=lambda item: (item["status"] != "connected", item["app_name"]))

    def list_all_installations(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(item) for item in self._read()["installations"]]

    def rows(self, table: str, tenant_ids: list[str] | None = None) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(row) for row in self._read()[table]]
        if tenant_ids is None or set(tenant_ids) == set(DEMO_TENANTS):
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids]

    def install(self, tenant_id: str, app_id: str, installed_by: str, config: dict[str, Any] | None = None) -> dict[str, Any]:
        app = self.get_app(app_id)
        if app is None:
            raise KeyError(app_id)
        with self._lock:
            payload = self._read()
            existing = _find_install(payload, tenant_id, str(app["app_id"]))
            if existing is not None:
                existing.update({"status": "connected", "enabled": True, "updated_at": SEEDED_AT, "last_health_check": SEEDED_AT})
                existing["config_masked"] = _mask_config(config or existing.get("config_masked") or {})
                installation = dict(existing)
            else:
                installation = self._installation(tenant_id, str(app["app_id"]), installed_by, config=config)
                payload["installations"].append(installation)
            self._append_event(payload, tenant_id, str(app["app_id"]), "installed")
            self._write(payload)
        return installation

    def uninstall(self, tenant_ids: list[str], app_id: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            before = len(payload["installations"])
            removed = next((item for item in payload["installations"] if item["tenant_id"] in tenant_ids and item["app_id"] == app_id), None)
            payload["installations"] = [
                item for item in payload["installations"] if not (item["tenant_id"] in tenant_ids and item["app_id"] == app_id)
            ]
            if len(payload["installations"]) == before:
                return None
            self._append_event(payload, str(removed["tenant_id"]), app_id, "uninstalled")
            self._write(payload)
        return dict(removed)

    def set_status(self, tenant_ids: list[str], app_id: str, status: str, enabled: bool | None = None) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            install = _find_install_for_scope(payload, tenant_ids, app_id)
            if install is None:
                return None
            install["status"] = status
            if enabled is not None:
                install["enabled"] = enabled
            install["updated_at"] = SEEDED_AT
            install["last_health_check"] = SEEDED_AT
            if status == "connected":
                install["usage_count"] = int(install.get("usage_count") or 0) + 7
            self._append_event(payload, str(install["tenant_id"]), app_id, status)
            self._write(payload)
            return dict(install)

    def update_config(self, tenant_ids: list[str], app_id: str, config: dict[str, Any]) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            install = _find_install_for_scope(payload, tenant_ids, app_id)
            if install is None:
                return None
            install["config_masked"] = _mask_config(config)
            install["status"] = "connected"
            install["updated_at"] = SEEDED_AT
            self._append_event(payload, str(install["tenant_id"]), app_id, "configured")
            self._write(payload)
            return dict(install)

    def test_connection(self, tenant_ids: list[str], app_id: str) -> dict[str, Any] | None:
        install = self.set_status(tenant_ids, app_id, "connected", True)
        if install is None:
            return None
        return {
            "ok": True,
            "latency_ms": 84 + (len(app_id) % 7) * 9,
            "message": f"{install['app_name']} connection verified",
            "checked_at": install["last_health_check"],
        }

    def start_trial(self, tenant_id: str, app_id: str) -> dict[str, Any]:
        app = self.get_app(app_id)
        if app is None:
            raise KeyError(app_id)
        with self._lock:
            payload = self._read()
            trial = {
                "trial_id": f"TRL-CUSTOM-{len(payload['trials']) + 1:03d}",
                "tenant_id": tenant_id,
                "app_id": str(app["app_id"]),
                "stage": "active",
                "days_left": 14,
                "conversion_probability": 68,
                "expansion_mrr": int(app["monthly_price"]) * 18,
                "updated_at": SEEDED_AT,
            }
            payload["trials"].append(trial)
            self._append_event(payload, tenant_id, str(app["app_id"]), "trial_started")
            self._write(payload)
            return trial

    def add_review(self, tenant_id: str, app_id: str, rating: int, title: str, body: str) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            review = {
                "review_id": f"REV-CUSTOM-{len(payload['reviews']) + 1:03d}",
                "tenant_id": tenant_id,
                "app_id": app_id,
                "author": "Sentra Admin",
                "rating": max(1, min(5, rating)),
                "title": title,
                "body": body,
                "created_at": SEEDED_AT,
                "updated_at": SEEDED_AT,
            }
            payload["reviews"].append(review)
            self._append_event(payload, tenant_id, app_id, "review_submitted")
            self._write(payload)
            return review

    def vendor_apply(self, tenant_id: str, name: str) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            vendor = {
                "vendor_id": f"VEN-CUSTOM-{len(payload['vendors']) + 1:03d}",
                "tenant_id": tenant_id,
                "name": name,
                "category": "partner applicant",
                "support_score": 82,
                "revenue_generated": 0,
                "certification_badge": "application submitted",
                "response_sla_hours": 24,
                "trust_score": 78,
                "updated_at": SEEDED_AT,
            }
            payload["vendors"].append(vendor)
            self._append_event(payload, tenant_id, vendor["vendor_id"], "vendor_applied")
            self._write(payload)
            return vendor

    def approve_security(self, tenant_ids: list[str], app_id: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            approval = next((item for item in payload["security_approvals"] if item["tenant_id"] in tenant_ids and item["app_id"] == app_id), None)
            if approval is None:
                return None
            approval["status"] = "approved"
            approval["updated_at"] = SEEDED_AT
            self._append_event(payload, str(approval["tenant_id"]), app_id, "security_approved")
            self._write(payload)
            return dict(approval)

    def simulate_revenue(self, tenant_ids: list[str]) -> dict[str, Any]:
        shares = self.rows("revenue_share", tenant_ids)
        current = sum(int(row["gross_mrr"]) for row in shares)
        simulated = round(current * 1.28)
        return {
            "current_mrr": current,
            "simulated_mrr": simulated,
            "uplift": simulated - current,
            "assumption": "28% attach-rate lift from featured apps and partner co-sell motion",
        }

    def _installation(self, tenant_id: str, app_id: str, installed_by: str, config: dict[str, Any] | None = None) -> dict[str, Any]:
        app = APP_BY_ID[app_id]
        return {
            "installation_id": f"INT-{tenant_id.replace('TEN-', '')}-{app_id.replace('APP-', '')}",
            "tenant_id": tenant_id,
            "app_id": app_id,
            "app_name": str(app["name"]),
            "category": str(app["category"]),
            "installed_at": SEEDED_AT,
            "installed_by": installed_by,
            "status": "connected",
            "version": str(app["version"]),
            "config_masked": _mask_config(config or {"workspace": tenant_id, "mode": "demo_safe"}),
            "last_health_check": SEEDED_AT,
            "usage_count": 120 + len(app_id) * 9,
            "billing_addon_value": int(app["monthly_price"]),
            "enabled": True,
            "updated_at": SEEDED_AT,
        }

    def _append_event(self, payload: dict[str, Any], tenant_id: str, app_id: str, action: str) -> None:
        payload["events"].append(
            {
                "event_id": f"MKT-EVT-{len(payload['events']) + 1:05d}",
                "tenant_id": tenant_id,
                "app_id": app_id,
                "action": action,
                "created_at": SEEDED_AT,
            }
        )


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") in {"super_admin", "admin"}:
        return list(DEMO_TENANTS)
    return [str(tenant["tenant_id"])]


def _find_install(payload: dict[str, Any], tenant_id: str, app_id: str) -> dict[str, Any] | None:
    return next((item for item in payload["installations"] if item["tenant_id"] == tenant_id and item["app_id"] == app_id), None)


def _find_install_for_scope(payload: dict[str, Any], tenant_ids: list[str], app_id: str) -> dict[str, Any] | None:
    return next((item for item in payload["installations"] if item["tenant_id"] in tenant_ids and item["app_id"] == app_id), None)


def _mask_config(config: dict[str, Any]) -> dict[str, Any]:
    masked: dict[str, Any] = {}
    for key, value in config.items():
        if any(token in key.lower() for token in ("key", "secret", "token", "password")):
            masked[key] = "********"
        else:
            masked[key] = value
    return masked


marketplace_store = MarketplaceStore(settings.sentra_marketplace_store_path)

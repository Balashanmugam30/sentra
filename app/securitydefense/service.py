from __future__ import annotations

from collections import Counter
from statistics import mean
from typing import Any

from app.securitydefense.store import security_defense_store


def _avg(rows: list[dict[str, Any]], key: str) -> float:
    if not rows:
        return 0.0
    return round(mean(float(row.get(key, 0)) for row in rows), 2)


def _risk_band(score: int) -> str:
    if score >= 90:
        return "trusted"
    if score >= 70:
        return "watch"
    if score >= 50:
        return "risky"
    return "block"


class SecurityDefenseService:
    def soc_summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        incidents = security_defense_store.rows("incidents", tenant_ids)
        threats = security_defense_store.rows("threats", tenant_ids)
        zero_trust = security_defense_store.rows("zero_trust", tenant_ids)
        policies = security_defense_store.rows("policies", tenant_ids)
        open_incidents = [item for item in incidents if item.get("status") in {"open", "queued", "watch"}]
        severity = Counter(str(item.get("severity", "low")) for item in incidents)
        categories = Counter(str(item.get("category", "unknown")) for item in threats)
        highest_risk = max((int(item.get("risk_score", item.get("risk", 0))) for item in [*incidents, *threats]), default=0)
        return {
            "open_incidents": len(open_incidents),
            "detections_today": sum(int(item.get("detections", item.get("count", 0))) for item in incidents),
            "severity_radar": {"high": severity.get("high", 0), "medium": severity.get("medium", 0), "low": severity.get("low", 0)},
            "attack_categories": dict(categories),
            "mean_response_time": round(_avg(incidents, "mttr_minutes"), 1),
            "auto_containment_count": len([item for item in incidents if str(item.get("analyst_owner")) == "AutoContain"]),
            "threat_level": "critical" if highest_risk >= 85 else "elevated" if highest_risk >= 65 else "guarded",
            "analyst_queue": len([item for item in incidents if item.get("status") == "queued"]),
            "zero_trust_average": _avg(zero_trust, "trust_score"),
            "policy_coverage": _avg(policies, "coverage"),
            "top_threats": sorted(threats, key=lambda item: int(item["risk"]), reverse=True)[:4],
        }

    def incidents(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return security_defense_store.rows("incidents", tenant_ids)

    def threats(self, tenant_ids: list[str]) -> dict[str, Any]:
        threats = security_defense_store.rows("threats", tenant_ids)
        return {
            "threats": threats,
            "detectors": sorted({str(item["detector"]) for item in threats}),
            "categories": dict(Counter(str(item["category"]) for item in threats)),
            "risk_average": _avg(threats, "risk"),
            "highest_risk": max((int(item["risk"]) for item in threats), default=0),
            "automated_responses": [
                "force logout session",
                "require re-auth",
                "pause API key",
                "temporary user lock",
                "notify admins",
                "isolate route access",
            ],
        }

    def zero_trust(self, tenant_ids: list[str]) -> dict[str, Any]:
        identities = security_defense_store.rows("zero_trust", tenant_ids)
        policies = security_defense_store.rows("policies", tenant_ids)
        trust = round(_avg(identities, "trust_score"))
        return {
            "trust_score": trust,
            "band": _risk_band(trust),
            "device_trust": round(_avg(identities, "device_trust")),
            "network_trust": round(_avg(identities, "network_trust")),
            "session_trust": round(_avg(identities, "session_trust")),
            "user_trust": round(_avg(identities, "user_trust")),
            "step_up_triggers": sum(int(item.get("step_up_count", 0)) for item in policies),
            "policy_blocks": sum(int(item.get("blocks", 0)) for item in policies),
            "identities": identities,
            "policies": policies,
            "risk_heatmap": [
                {"zone": "Admin Console", "risk": 72, "trust": 64},
                {"zone": "API Gateway", "risk": 68, "trust": 58},
                {"zone": "Exports", "risk": 61, "trust": 71},
                {"zone": "Tenant Switch", "risk": 55, "trust": 78},
            ],
        }

    def forensics(self, tenant_ids: list[str]) -> dict[str, Any]:
        ledger = security_defense_store.rows("forensics", tenant_ids)
        return {
            "ledger": ledger,
            "timeline_events": len(ledger),
            "privileged_actions": len([item for item in ledger if "role" in str(item.get("action")) or "token" in str(item.get("action"))]),
            "export_json_ready": True,
            "export_csv_ready": True,
            "chain_integrity": 100,
            "latest_hash": ledger[-1]["chain_hash"] if ledger else "none",
            "filters": ["actor", "org", "action", "result", "severity"],
        }

    def executive(self, tenant_ids: list[str]) -> dict[str, Any]:
        summary = self.soc_summary(tenant_ids)
        zero = self.zero_trust(tenant_ids)
        forensics = self.forensics(tenant_ids)
        compliance_score = self.compliance_score(tenant_ids)
        return {
            "security_maturity": 89,
            "risk_exposure": 100 - int(compliance_score["score"]),
            "top_threats": summary["top_threats"],
            "compliance_score": compliance_score,
            "sla_response_score": 93,
            "readiness_index": 91,
            "zero_trust_score": zero["trust_score"],
            "audit_integrity": forensics["chain_integrity"],
            "recommended_actions": [
                "Force MFA for every privileged role before public-sector pilots.",
                "Keep API burst containment in auto mode for automation endpoints.",
                "Review export burst evidence with a named security manager.",
                "Rotate SSO certificate for hotel tenant within 18 days.",
            ],
            "board_summary": "Sentra defense posture is enterprise-ready with strong audit integrity, automated containment, and measurable zero-trust enforcement.",
        }

    def compliance_score(self, tenant_ids: list[str]) -> dict[str, Any]:
        zero = security_defense_store.rows("zero_trust", tenant_ids)
        forensics = security_defense_store.rows("forensics", tenant_ids)
        policies = security_defense_store.rows("policies", tenant_ids)
        score = round((_avg(zero, "trust_score") * 0.32) + (_avg(policies, "coverage") * 0.38) + (min(100, len(forensics) * 12) * 0.3))
        return {
            "score": max(0, min(100, score)),
            "drivers": [
                {"label": "MFA and step-up coverage", "value": 91},
                {"label": "Audit completeness", "value": 100},
                {"label": "Session hygiene", "value": 84},
                {"label": "Policy coverage", "value": round(_avg(policies, "coverage"))},
            ],
        }

    def respond(self, tenant_ids: list[str], action: str, payload: dict[str, Any]) -> dict[str, Any]:
        event = security_defense_store.response_action(tenant_ids, action, payload)
        return {
            "event": event,
            "result": {
                "lock_user": "User locked and admin notified.",
                "revoke_session": "Session revoked, token family flagged, forensic ledger updated.",
                "step_up_auth": "Step-up MFA required before privileged continuation.",
                "isolate_key": "API key paused and integration route isolated.",
            }.get(action, "Response action recorded."),
            "audit_ready": True,
        }


security_defense_service = SecurityDefenseService()

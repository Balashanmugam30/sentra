from __future__ import annotations

from typing import Any


def build_marketplace_recommendations(
    *,
    installed: list[dict[str, Any]],
    tenant: dict[str, object],
) -> list[dict[str, Any]]:
    installed_app_ids = {str(item["app_id"]) for item in installed}
    industry = str((tenant.get("organization") or {}).get("industry", "")).lower() if isinstance(tenant.get("organization"), dict) else ""
    plan_name = str((tenant.get("plan") or {}).get("plan_name", "")).lower() if isinstance(tenant.get("plan"), dict) else ""
    recommendations: list[dict[str, Any]] = []

    def add(app_id: str, title: str, reason: str, impact: str, priority: str, cta: str) -> None:
        if app_id in installed_app_ids:
            return
        recommendations.append(
            {
                "recommendation_id": f"REC-{app_id}",
                "app_id": app_id,
                "title": title,
                "reason": reason,
                "estimated_impact": impact,
                "priority": priority,
                "cta": cta,
            }
        )

    add(
        "APP-TWILIO",
        "Add resilient SMS and voice alerts",
        "Sentra detected command workflows without an external SMS/voice path.",
        "Cuts occupant notification latency by 40-60% during crisis events.",
        "high",
        "Install Twilio",
    )
    add(
        "APP-OKTA" if "government" not in plan_name else "APP-ENTRA",
        "Enable enterprise SSO",
        "Workspace has enterprise access patterns but no identity provider connected.",
        "Improves auditability, lifecycle controls, and privileged-access assurance.",
        "high",
        "Connect SSO",
    )
    add(
        "APP-SERVICENOW",
        "Connect ITSM incident handoff",
        "Critical alerts currently resolve inside Sentra without ticketing evidence trails.",
        "Creates auditable recovery tasks and change records automatically.",
        "medium",
        "Connect ServiceNow",
    )
    if any(term in industry for term in ("factory", "hospital", "government", "university")):
        add(
            "APP-HONEYWELL",
            "Fuse building automation telemetry",
            "Facility-heavy workspace would benefit from HVAC, sensor, and zone-control telemetry.",
            "Raises facility command confidence and reduces manual confirmation cycles.",
            "medium",
            "Install Honeywell",
        )
        add(
            "APP-BOSCH-FIRE",
            "Add fire-panel verification",
            "Crisis playbooks include fire scenarios but no dedicated fire-system connector.",
            "Improves alarm provenance and response routing for smoke/fire incidents.",
            "medium",
            "Install Bosch Fire Systems",
        )
    add(
        "APP-SALESFORCE",
        "Sync enterprise revenue workflows",
        "CRM and customer success engines can enrich pipeline and renewal intelligence from Salesforce.",
        "Improves expansion forecasting and account-level executive readiness.",
        "low",
        "Connect Salesforce",
    )
    return recommendations[:6]

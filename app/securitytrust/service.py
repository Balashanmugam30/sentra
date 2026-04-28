from __future__ import annotations

from collections import Counter
from statistics import mean
from typing import Any

from app.securitytrust.store import security_trust_store


def _avg(rows: list[dict[str, Any]], key: str) -> float:
    if not rows:
        return 0.0
    return round(mean(float(row.get(key, 0)) for row in rows), 2)


class SecurityTrustService:
    def compliance_summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        frameworks = security_trust_store.rows("frameworks", tenant_ids)
        gaps = security_trust_store.rows("gaps", tenant_ids)
        return {
            "frameworks": frameworks,
            "control_pass_rate": round(_avg(frameworks, "control_pass_rate")),
            "compliance_average": round(_avg(frameworks, "score")),
            "open_gaps": sum(int(row.get("open_gaps", 0)) for row in frameworks),
            "risk_priority_queue": sorted(gaps, key=lambda row: (0 if row["priority"] == "high" else 1, int(row["eta_days"]))),
            "remediation_eta_days": round(_avg(frameworks, "remediation_eta_days")),
            "procurement_readiness": self.procurement_readiness(tenant_ids),
        }

    def privacy(self, tenant_ids: list[str]) -> dict[str, Any]:
        fields = security_trust_store.rows("privacy_fields", tenant_ids)
        queues = security_trust_store.rows("privacy_queues", tenant_ids)
        pii = [field for field in fields if field["classification"] in {"PII", "Sensitive"}]
        masked = [field for field in fields if bool(field.get("masked"))]
        encrypted = [field for field in fields if bool(field.get("encrypted"))]
        return {
            "fields": fields,
            "queues": queues,
            "pii_exposure_score": round(_avg(pii, "exposure")),
            "masking_coverage": round((len(masked) / max(1, len(fields))) * 100),
            "encryption_posture": round((len(encrypted) / max(1, len(fields))) * 100),
            "consent_posture": 89,
            "privacy_incidents": 0,
            "classification_map": dict(Counter(str(field["classification"]) for field in fields)),
            "deletion_queue": [item for item in queues if item["type"] == "deletion"],
            "export_requests": [item for item in queues if item["type"] == "export"],
        }

    def policies(self, tenant_ids: list[str]) -> dict[str, Any]:
        policies = security_trust_store.rows("policies", tenant_ids)
        return {
            "policies": policies,
            "approved": len([policy for policy in policies if policy["status"] == "approved"]),
            "needs_revision": len([policy for policy in policies if policy["status"] == "revise"]),
            "coverage": round(_avg(policies, "coverage")),
            "categories": dict(Counter(str(policy["category"]) for policy in policies)),
        }

    def approve_policy(self, tenant_ids: list[str], policy_id: str, decision: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        return security_trust_store.approve_policy(tenant_ids, policy_id, decision, payload)

    def vendor_risk(self, tenant_ids: list[str]) -> dict[str, Any]:
        vendors = security_trust_store.rows("vendors", tenant_ids)
        return {
            "vendors": vendors,
            "average_risk": round(_avg(vendors, "risk_score")),
            "token_health": round(_avg(vendors, "token_health")),
            "high_risk_vendors": [vendor for vendor in vendors if int(vendor["risk_score"]) >= 40],
            "trust_tiers": dict(Counter(str(vendor["trust_tier"]) for vendor in vendors)),
            "data_classes": sorted({data_class for vendor in vendors for data_class in vendor["data_classes"]}),
        }

    def evidence(self, tenant_ids: list[str]) -> dict[str, Any]:
        evidence = security_trust_store.rows("evidence", tenant_ids)
        return {
            "evidence": evidence,
            "export_formats": ["JSON", "CSV", "PDF"],
            "ready_items": len([item for item in evidence if item["status"] == "ready"]),
            "total_items": sum(int(item["items"]) for item in evidence),
            "latest_hash": evidence[0]["hash"] if evidence else "none",
            "board_pack_ready": any(item["evidence_id"] == "EVD-BOARD-PACK" and item["status"] == "ready" for item in evidence),
        }

    def trust_executive(self, tenant_ids: list[str]) -> dict[str, Any]:
        compliance = self.compliance_summary(tenant_ids)
        privacy = self.privacy(tenant_ids)
        vendor = self.vendor_risk(tenant_ids)
        evidence = self.evidence(tenant_ids)
        legal = security_trust_store.rows("legal_items", tenant_ids)
        procurement = self.procurement_readiness(tenant_ids)
        trust_index = self.trust_index(compliance, privacy, vendor, evidence, procurement)
        return {
            "trust_index": trust_index,
            "security_maturity": 91,
            "compliance_confidence": compliance["compliance_average"],
            "buyer_readiness": procurement["buyer_readiness"],
            "procurement_readiness": procurement,
            "legal_readiness": round((len([item for item in legal if item["status"] == "ready"]) / max(1, len(legal))) * 100),
            "legal_items": legal,
            "top_blockers": [
                gap["title"] for gap in compliance["risk_priority_queue"][:3]
            ],
            "next_30_day_actions": [
                "Close backup restore evidence for SOC2 procurement packet.",
                "Complete HIPAA BAA review for hospital pilots.",
                "Refresh vendor access review for automation integrations.",
                "Generate board trust pack before enterprise pilots.",
            ],
            "board_summary": "Sentra is procurement-ready for enterprise pilots with strong compliance posture, exportable evidence, and a clear 30-day remediation path.",
        }

    def procurement_readiness(self, tenant_ids: list[str]) -> dict[str, Any]:
        tenants = security_trust_store.rows("tenants", tenant_ids)
        evidence = security_trust_store.rows("evidence", tenant_ids)
        vendors = security_trust_store.rows("vendors", tenant_ids)
        readiness = round((_avg(tenants, "buyer_readiness") * 0.5) + (min(100, len(evidence) * 14) * 0.3) + ((100 - _avg(vendors, "risk_score")) * 0.2))
        return {
            "buyer_readiness": readiness,
            "legal_readiness": 88,
            "security_questionnaire_ready": True,
            "vendor_packet_ready": True,
            "procurement_stage": "enterprise pilot ready" if readiness >= 85 else "remediation active",
        }

    def trust_index(
        self,
        compliance: dict[str, Any],
        privacy: dict[str, Any],
        vendor: dict[str, Any],
        evidence: dict[str, Any],
        procurement: dict[str, Any],
    ) -> dict[str, Any]:
        value = round(
            0.24 * float(compliance["compliance_average"])
            + 0.18 * float(privacy["masking_coverage"])
            + 0.18 * float(privacy["encryption_posture"])
            + 0.16 * float(100 - vendor["average_risk"])
            + 0.12 * float(procurement["buyer_readiness"])
            + 0.12 * float(min(100, evidence["ready_items"] * 16))
        )
        return {
            "score": max(0, min(100, value)),
            "band": "elite" if value >= 90 else "strong" if value >= 75 else "developing" if value >= 60 else "weak",
            "drivers": [
                {"label": "Compliance average", "value": compliance["compliance_average"]},
                {"label": "Privacy masking", "value": privacy["masking_coverage"]},
                {"label": "Vendor risk inverse", "value": round(100 - vendor["average_risk"])},
                {"label": "Procurement readiness", "value": procurement["buyer_readiness"]},
            ],
        }


security_trust_service = SecurityTrustService()

from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS, utc_now_iso


TENANT_PROFILES: tuple[dict[str, Any], ...] = (
    {"tenant_id": "TEN-BALA-UNI", "name": "Bala University", "sector": "Education", "buyer_readiness": 86},
    {"tenant_id": "TEN-BALA-HOSP", "name": "Bala Hospital Demo", "sector": "Healthcare", "buyer_readiness": 91},
    {"tenant_id": "TEN-BALA-MFG", "name": "Bala Manufacturing", "sector": "Industrial", "buyer_readiness": 82},
    {"tenant_id": "TEN-GOVSECURE", "name": "SmartCity Authority", "sector": "Government", "buyer_readiness": 93},
    {"tenant_id": "TEN-GRAND-MERIDIAN", "name": "GovSecure South", "sector": "Government pilot", "buyer_readiness": 88},
)

FRAMEWORKS: tuple[dict[str, Any], ...] = (
    {"framework_id": "SOC2", "tenant_id": "TEN-GOVSECURE", "name": "SOC2 readiness", "score": 91, "control_pass_rate": 92, "open_gaps": 4, "risk_priority": "high", "remediation_eta_days": 24, "controls": ["audit logs", "RBAC", "MFA", "backups", "incident response", "monitoring"]},
    {"framework_id": "ISO27001", "tenant_id": "TEN-BALA-MFG", "name": "ISO27001 readiness", "score": 87, "control_pass_rate": 88, "open_gaps": 6, "risk_priority": "medium", "remediation_eta_days": 31, "controls": ["policies", "asset control", "risk management", "training", "governance"]},
    {"framework_id": "GDPR", "tenant_id": "TEN-BALA-UNI", "name": "GDPR readiness", "score": 84, "control_pass_rate": 85, "open_gaps": 7, "risk_priority": "medium", "remediation_eta_days": 28, "controls": ["deletion flows", "consent controls", "data minimization", "export controls"]},
    {"framework_id": "HIPAA", "tenant_id": "TEN-BALA-HOSP", "name": "HIPAA readiness", "score": 89, "control_pass_rate": 91, "open_gaps": 5, "risk_priority": "high", "remediation_eta_days": 21, "controls": ["access control", "audit trails", "encryption", "least privilege"]},
    {"framework_id": "DPDP", "tenant_id": "TEN-BALA-UNI", "name": "DPDP India readiness", "score": 86, "control_pass_rate": 87, "open_gaps": 5, "risk_priority": "medium", "remediation_eta_days": 26, "controls": ["consent posture", "data minimization", "purpose logs", "deletion queue"]},
    {"framework_id": "GOV-PROC", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Gov procurement readiness", "score": 90, "control_pass_rate": 92, "open_gaps": 3, "risk_priority": "high", "remediation_eta_days": 18, "controls": ["vendor risk", "audit exports", "policy approvals", "legal trust room"]},
)

GAPS: tuple[dict[str, Any], ...] = (
    {"gap_id": "GAP-SOC2-004", "tenant_id": "TEN-GOVSECURE", "framework": "SOC2", "title": "Formal backup restore test evidence", "priority": "high", "owner": "Security Admin", "eta_days": 9, "status": "in progress"},
    {"gap_id": "GAP-HIPAA-002", "tenant_id": "TEN-BALA-HOSP", "framework": "HIPAA", "title": "Clinical export retention acknowledgement", "priority": "high", "owner": "Privacy Officer", "eta_days": 7, "status": "queued"},
    {"gap_id": "GAP-GDPR-006", "tenant_id": "TEN-BALA-UNI", "framework": "GDPR", "title": "Data subject request response SLA evidence", "priority": "medium", "owner": "Legal Ops", "eta_days": 14, "status": "review"},
    {"gap_id": "GAP-ISO-003", "tenant_id": "TEN-BALA-MFG", "framework": "ISO27001", "title": "Vendor access quarterly review", "priority": "medium", "owner": "Procurement", "eta_days": 18, "status": "in progress"},
)

PRIVACY_FIELDS: tuple[dict[str, Any], ...] = (
    {"field_id": "PF-USER-EMAIL", "tenant_id": "TEN-BALA-UNI", "name": "user_email", "classification": "PII", "exposure": 28, "masked": True, "encrypted": True, "retention_days": 365, "purpose": "account access"},
    {"field_id": "PF-CLINICAL-STATUS", "tenant_id": "TEN-BALA-HOSP", "name": "medical_assistance_status", "classification": "Sensitive", "exposure": 42, "masked": True, "encrypted": True, "retention_days": 180, "purpose": "emergency triage"},
    {"field_id": "PF-INCIDENT-ZONE", "tenant_id": "TEN-BALA-MFG", "name": "incident_zone", "classification": "Internal", "exposure": 18, "masked": False, "encrypted": True, "retention_days": 730, "purpose": "safety analytics"},
    {"field_id": "PF-PUBLIC-ALERT", "tenant_id": "TEN-GOVSECURE", "name": "public_alert_copy", "classification": "Public", "exposure": 6, "masked": False, "encrypted": False, "retention_days": 1095, "purpose": "public safety record"},
    {"field_id": "PF-DEVICE-REGION", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "device_region", "classification": "PII", "exposure": 31, "masked": True, "encrypted": True, "retention_days": 365, "purpose": "session risk"},
)

PRIVACY_QUEUES: tuple[dict[str, Any], ...] = (
    {"queue_id": "DEL-001", "tenant_id": "TEN-BALA-UNI", "type": "deletion", "subject": "visitor route history", "due_days": 5, "status": "scheduled", "risk": 18},
    {"queue_id": "EXP-002", "tenant_id": "TEN-BALA-HOSP", "type": "export", "subject": "clinical incident audit pack", "due_days": 2, "status": "legal review", "risk": 34},
    {"queue_id": "RET-003", "tenant_id": "TEN-BALA-MFG", "type": "retention", "subject": "IoT telemetry archive", "due_days": 21, "status": "active", "risk": 16},
    {"queue_id": "MASK-004", "tenant_id": "TEN-GOVSECURE", "type": "masking", "subject": "board report occupant names", "due_days": 1, "status": "ready", "risk": 12},
)

POLICIES: tuple[dict[str, Any], ...] = (
    {"policy_id": "POL-MFA", "tenant_id": "TEN-GOVSECURE", "name": "MFA policy", "category": "access", "status": "approved", "version": "v3.1", "owner": "Security Admin", "coverage": 96, "last_review": "2026-04-19", "next_review": "2026-05-19"},
    {"policy_id": "POL-PASSWORD", "tenant_id": "TEN-BALA-UNI", "name": "Password policy", "category": "identity", "status": "approved", "version": "v2.7", "owner": "IT Security", "coverage": 92, "last_review": "2026-04-12", "next_review": "2026-05-12"},
    {"policy_id": "POL-ACCESS-REVIEW", "tenant_id": "TEN-BALA-HOSP", "name": "Access review cycles", "category": "governance", "status": "revise", "version": "v1.9", "owner": "Compliance Lead", "coverage": 84, "last_review": "2026-04-01", "next_review": "2026-04-30"},
    {"policy_id": "POL-ADMIN", "tenant_id": "TEN-GOVSECURE", "name": "Admin privilege policy", "category": "access", "status": "approved", "version": "v2.4", "owner": "CISO", "coverage": 94, "last_review": "2026-04-10", "next_review": "2026-05-10"},
    {"policy_id": "POL-VENDOR", "tenant_id": "TEN-BALA-MFG", "name": "Vendor access policy", "category": "third party", "status": "approved", "version": "v2.0", "owner": "Procurement", "coverage": 88, "last_review": "2026-04-06", "next_review": "2026-05-06"},
    {"policy_id": "POL-RETENTION", "tenant_id": "TEN-BALA-UNI", "name": "Retention policy", "category": "privacy", "status": "revise", "version": "v3.0", "owner": "Privacy Officer", "coverage": 86, "last_review": "2026-03-28", "next_review": "2026-04-28"},
    {"policy_id": "POL-AI-USAGE", "tenant_id": "TEN-GOVSECURE", "name": "AI usage policy", "category": "AI governance", "status": "approved", "version": "v1.6", "owner": "AI Governance", "coverage": 90, "last_review": "2026-04-15", "next_review": "2026-05-15"},
    {"policy_id": "POL-OVERRIDE", "tenant_id": "TEN-BALA-HOSP", "name": "Emergency override policy", "category": "crisis operations", "status": "approved", "version": "v2.2", "owner": "Operations", "coverage": 91, "last_review": "2026-04-17", "next_review": "2026-05-17"},
)

VENDORS: tuple[dict[str, Any], ...] = (
    {"vendor_id": "VEN-GOOGLE", "tenant_id": "TEN-BALA-UNI", "name": "Google", "risk_score": 24, "token_health": 94, "trust_tier": "tier 1", "permissions": ["SSO", "email"], "data_classes": ["PII"], "last_review": "2026-04-08", "next_review": "2026-05-08", "outages": 0, "access_scope": "federated identity"},
    {"vendor_id": "VEN-MICROSOFT", "tenant_id": "TEN-GOVSECURE", "name": "Microsoft", "risk_score": 18, "token_health": 96, "trust_tier": "tier 1", "permissions": ["SSO", "Teams"], "data_classes": ["PII", "Internal"], "last_review": "2026-04-10", "next_review": "2026-05-10", "outages": 0, "access_scope": "identity + comms"},
    {"vendor_id": "VEN-SLACK", "tenant_id": "TEN-BALA-MFG", "name": "Slack", "risk_score": 36, "token_health": 82, "trust_tier": "tier 2", "permissions": ["alerts"], "data_classes": ["Internal"], "last_review": "2026-04-02", "next_review": "2026-05-02", "outages": 1, "access_scope": "incident notifications"},
    {"vendor_id": "VEN-TEAMS", "tenant_id": "TEN-GOVSECURE", "name": "Teams", "risk_score": 22, "token_health": 91, "trust_tier": "tier 1", "permissions": ["alerts", "approvals"], "data_classes": ["Internal", "PII"], "last_review": "2026-04-09", "next_review": "2026-05-09", "outages": 0, "access_scope": "executive communications"},
    {"vendor_id": "VEN-WHATSAPP", "tenant_id": "TEN-BALA-HOSP", "name": "WhatsApp", "risk_score": 48, "token_health": 78, "trust_tier": "tier 3", "permissions": ["public alerts"], "data_classes": ["Public", "PII"], "last_review": "2026-03-31", "next_review": "2026-04-30", "outages": 1, "access_scope": "mass notification"},
    {"vendor_id": "VEN-N8N", "tenant_id": "TEN-BALA-MFG", "name": "n8n", "risk_score": 42, "token_health": 84, "trust_tier": "tier 2", "permissions": ["automation"], "data_classes": ["Internal"], "last_review": "2026-04-05", "next_review": "2026-05-05", "outages": 0, "access_scope": "workflow orchestration"},
    {"vendor_id": "VEN-STRIPE", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Stripe", "risk_score": 21, "token_health": 93, "trust_tier": "tier 1", "permissions": ["billing"], "data_classes": ["PII", "Financial"], "last_review": "2026-04-11", "next_review": "2026-05-11", "outages": 0, "access_scope": "billing"},
    {"vendor_id": "VEN-MAPS", "tenant_id": "TEN-BALA-UNI", "name": "Maps provider", "risk_score": 31, "token_health": 88, "trust_tier": "tier 2", "permissions": ["routing"], "data_classes": ["Internal"], "last_review": "2026-04-03", "next_review": "2026-05-03", "outages": 0, "access_scope": "route intelligence"},
    {"vendor_id": "VEN-EMAIL", "tenant_id": "TEN-BALA-HOSP", "name": "Email provider", "risk_score": 29, "token_health": 89, "trust_tier": "tier 2", "permissions": ["email"], "data_classes": ["PII"], "last_review": "2026-04-07", "next_review": "2026-05-07", "outages": 0, "access_scope": "notification delivery"},
)

EVIDENCE: tuple[dict[str, Any], ...] = (
    {"evidence_id": "EVD-BOARD-PACK", "tenant_id": "TEN-GOVSECURE", "name": "Downloadable board pack", "type": "PDF", "status": "ready", "items": 42, "last_generated": "2026-04-26T08:10:00+00:00", "hash": "e0a1-board-pack"},
    {"evidence_id": "EVD-AUDIT-LOGS", "tenant_id": "TEN-BALA-UNI", "name": "Audit logs", "type": "JSON", "status": "ready", "items": 18420, "last_generated": "2026-04-26T08:05:00+00:00", "hash": "b19f-audit-logs"},
    {"evidence_id": "EVD-ACCESS-REVIEW", "tenant_id": "TEN-BALA-HOSP", "name": "Access review exports", "type": "CSV", "status": "legal review", "items": 128, "last_generated": "2026-04-25T18:00:00+00:00", "hash": "a72c-access-review"},
    {"evidence_id": "EVD-INCIDENT-HISTORY", "tenant_id": "TEN-BALA-MFG", "name": "Incident history", "type": "JSON", "status": "ready", "items": 824, "last_generated": "2026-04-26T07:44:00+00:00", "hash": "88be-incident-history"},
    {"evidence_id": "EVD-POLICY-ACK", "tenant_id": "TEN-GOVSECURE", "name": "Policy acknowledgements", "type": "CSV", "status": "ready", "items": 412, "last_generated": "2026-04-26T06:55:00+00:00", "hash": "c120-policy-ack"},
    {"evidence_id": "EVD-COMPLIANCE-SNAP", "tenant_id": "TEN-GRAND-MERIDIAN", "name": "Compliance snapshots", "type": "PDF", "status": "ready", "items": 18, "last_generated": "2026-04-26T08:00:00+00:00", "hash": "91ad-compliance-snap"},
)

LEGAL_ITEMS: tuple[dict[str, Any], ...] = (
    {"item_id": "LEGAL-DPA", "tenant_id": "TEN-GOVSECURE", "title": "Data Processing Agreement", "status": "ready", "owner": "Legal Ops", "buyer_blocker": False},
    {"item_id": "LEGAL-BAA", "tenant_id": "TEN-BALA-HOSP", "title": "HIPAA BAA draft", "status": "review", "owner": "Healthcare Counsel", "buyer_blocker": True},
    {"item_id": "LEGAL-SLA", "tenant_id": "TEN-GRAND-MERIDIAN", "title": "Enterprise SLA", "status": "ready", "owner": "Procurement", "buyer_blocker": False},
    {"item_id": "LEGAL-AI", "tenant_id": "TEN-BALA-UNI", "title": "AI governance appendix", "status": "ready", "owner": "AI Governance", "buyer_blocker": False},
)


class SecurityTrustStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "tenants": [],
            "frameworks": [],
            "gaps": [],
            "privacy_fields": [],
            "privacy_queues": [],
            "policies": [],
            "vendors": [],
            "evidence": [],
            "legal_items": [],
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

    def seed_demo(self) -> dict[str, int]:
        created = 0
        seed_groups = {
            "tenants": (TENANT_PROFILES, "tenant_id"),
            "frameworks": (FRAMEWORKS, "framework_id"),
            "gaps": (GAPS, "gap_id"),
            "privacy_fields": (PRIVACY_FIELDS, "field_id"),
            "privacy_queues": (PRIVACY_QUEUES, "queue_id"),
            "policies": (POLICIES, "policy_id"),
            "vendors": (VENDORS, "vendor_id"),
            "evidence": (EVIDENCE, "evidence_id"),
            "legal_items": (LEGAL_ITEMS, "item_id"),
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
        if set(tenant_ids) == set(DEMO_TENANTS):
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids]

    def approve_policy(self, tenant_ids: list[str], policy_id: str, decision: str, payload_data: dict[str, Any]) -> dict[str, Any] | None:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            for policy in payload["policies"]:
                if policy["policy_id"] != policy_id or policy["tenant_id"] not in tenant_ids:
                    continue
                policy["status"] = decision
                policy["last_review"] = utc_now_iso()[:10]
                policy["updated_at"] = utc_now_iso()
                event = {
                    "event_id": f"TRUST-EVT-{len(payload['events']) + 1:05d}",
                    "tenant_id": policy["tenant_id"],
                    "action": f"policy_{decision}",
                    "payload": {"policy_id": policy_id, **payload_data},
                    "created_at": utc_now_iso(),
                    "chain_hash": f"trust-{len(payload['events']) + 1:05d}-{policy_id.lower()}",
                }
                payload["events"].append(event)
                self._write(payload)
                return {"policy": dict(policy), "event": event}
        return None


security_trust_store = SecurityTrustStore(settings.sentra_security_trust_store_path)

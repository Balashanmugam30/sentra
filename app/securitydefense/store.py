from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS, utc_now_iso


ORGS: tuple[dict[str, Any], ...] = (
    {"org_id": "ORG-BALA-UNI", "tenant_id": "TEN-BALA-UNI", "name": "Bala University", "sector": "Education", "risk": 34, "maturity": 84},
    {"org_id": "ORG-BALA-HOSP", "tenant_id": "TEN-BALA-HOSP", "name": "Bala Hospital Demo", "sector": "Healthcare", "risk": 28, "maturity": 88},
    {"org_id": "ORG-BALA-MFG", "tenant_id": "TEN-BALA-MFG", "name": "Bala Manufacturing", "sector": "Industrial", "risk": 41, "maturity": 81},
    {"org_id": "ORG-SMARTCITY", "tenant_id": "TEN-GOVSECURE", "name": "SmartCity Authority", "sector": "Government", "risk": 22, "maturity": 91},
)

INCIDENTS: tuple[dict[str, Any], ...] = (
    {"incident_id": "SOC-NIGHT-ADMIN", "tenant_id": "TEN-BALA-UNI", "org": "Bala University", "title": "Night admin anomaly", "category": "privilege_misuse", "severity": "high", "status": "open", "detections": 7, "containment_action": "Require re-auth and manager review", "mttd_seconds": 41, "mttr_minutes": 13, "analyst_owner": "SOC Alpha", "risk_score": 82, "created_at": "2026-04-26T02:14:00+00:00"},
    {"incident_id": "SOC-API-SPIKE", "tenant_id": "TEN-BALA-MFG", "org": "Bala Manufacturing", "title": "API request spike", "category": "api_abuse", "severity": "medium", "status": "contained", "detections": 1840, "containment_action": "Burst limit tightened", "mttd_seconds": 24, "mttr_minutes": 7, "analyst_owner": "AutoContain", "risk_score": 68, "created_at": "2026-04-26T04:20:00+00:00"},
    {"incident_id": "SOC-TOKEN-REPLAY", "tenant_id": "TEN-GOVSECURE", "org": "SmartCity Authority", "title": "Token replay warning", "category": "token_replay", "severity": "high", "status": "watch", "detections": 3, "containment_action": "Token family revoked", "mttd_seconds": 35, "mttr_minutes": 9, "analyst_owner": "SOC Bravo", "risk_score": 76, "created_at": "2026-04-26T05:03:00+00:00"},
    {"incident_id": "SOC-EXPORT-BURST", "tenant_id": "TEN-BALA-HOSP", "org": "Bala Hospital Demo", "title": "Suspicious export burst", "category": "insider_risk", "severity": "medium", "status": "queued", "detections": 12, "containment_action": "Export review queue", "mttd_seconds": 58, "mttr_minutes": 18, "analyst_owner": "SOC Clinical", "risk_score": 64, "created_at": "2026-04-26T06:31:00+00:00"},
    {"incident_id": "SOC-GEO-ANOMALY", "tenant_id": "TEN-BALA-UNI", "org": "Bala University", "title": "Geo anomaly login", "category": "impossible_travel", "severity": "medium", "status": "open", "detections": 2, "containment_action": "Step-up MFA", "mttd_seconds": 33, "mttr_minutes": 11, "analyst_owner": "SOC Alpha", "risk_score": 61, "created_at": "2026-04-26T07:11:00+00:00"},
    {"incident_id": "SOC-MFA-BYPASS", "tenant_id": "TEN-BALA-HOSP", "org": "Bala Hospital Demo", "title": "Repeated MFA bypass attempts", "category": "credential_stuffing", "severity": "high", "status": "contained", "detections": 18, "containment_action": "Account lock and admin notify", "mttd_seconds": 22, "mttr_minutes": 6, "analyst_owner": "AutoContain", "risk_score": 79, "created_at": "2026-04-26T08:01:00+00:00"},
)

THREATS: tuple[dict[str, Any], ...] = (
    {"threat_id": "THR-BRUTE-001", "tenant_id": "TEN-BALA-HOSP", "detector": "Brute Force Detector", "category": "brute_force", "signal": "Many failed login attempts against clinical admin", "count": 18, "confidence": 94, "risk": 79, "status": "contained", "recommended_action": "Keep lockout and force password review."},
    {"threat_id": "THR-TRAVEL-002", "tenant_id": "TEN-BALA-UNI", "detector": "Impossible Travel Detector", "category": "geo_anomaly", "signal": "Admin region shifted within impossible travel window", "count": 2, "confidence": 87, "risk": 61, "status": "open", "recommended_action": "Require MFA and verify device trust."},
    {"threat_id": "THR-PRIV-003", "tenant_id": "TEN-BALA-UNI", "detector": "Privilege Misuse Detector", "category": "permission_abuse", "signal": "Late-night privileged changes outside maintenance window", "count": 7, "confidence": 91, "risk": 82, "status": "open", "recommended_action": "Temporary restrict admin role pending review."},
    {"threat_id": "THR-API-004", "tenant_id": "TEN-BALA-MFG", "detector": "API Abuse Detector", "category": "api_spike", "signal": "Automation endpoint spike from one integration", "count": 1840, "confidence": 89, "risk": 68, "status": "contained", "recommended_action": "Pause API key if spike repeats."},
    {"threat_id": "THR-TOKEN-005", "tenant_id": "TEN-GOVSECURE", "detector": "Token Replay Detector", "category": "token_replay", "signal": "Duplicated token family seen across two device fingerprints", "count": 3, "confidence": 92, "risk": 76, "status": "watch", "recommended_action": "Revoke session and rotate refresh family."},
    {"threat_id": "THR-INSIDER-006", "tenant_id": "TEN-BALA-HOSP", "detector": "Insider Risk Detector", "category": "insider_risk", "signal": "Exports plus escalation attempts from one analyst", "count": 12, "confidence": 84, "risk": 64, "status": "queued", "recommended_action": "Route evidence to security manager."},
    {"threat_id": "THR-LATERAL-007", "tenant_id": "TEN-GOVSECURE", "detector": "Lateral Movement Detector", "category": "tenant_switch", "signal": "Repeated denied tenant switch attempts", "count": 5, "confidence": 86, "risk": 66, "status": "watch", "recommended_action": "Block org switching for this session."},
    {"threat_id": "THR-MALWARE-008", "tenant_id": "TEN-BALA-MFG", "detector": "Malware Mock Detector", "category": "malware_mock", "signal": "Suspicious user-agent pattern on export endpoint", "count": 4, "confidence": 73, "risk": 49, "status": "monitor", "recommended_action": "Continue telemetry capture."},
)

ZERO_TRUST: tuple[dict[str, Any], ...] = (
    {"identity_id": "ZT-SEC-ADMIN", "tenant_id": "TEN-BALA-UNI", "actor": "security.admin@sentra.demo", "role": "Security Manager", "trust_score": 63, "band": "risky", "decision": "require MFA", "device_trust": 72, "network_trust": 58, "session_trust": 61, "user_trust": 66, "triggers": ["unusual time login", "privileged action burst"], "recommended_action": "Require re-auth before privileged changes."},
    {"identity_id": "ZT-OPS-LEAD", "tenant_id": "TEN-BALA-HOSP", "actor": "ops.lead@sentra.demo", "role": "Operations Lead", "trust_score": 86, "band": "watch", "decision": "allow + monitor", "device_trust": 92, "network_trust": 84, "session_trust": 82, "user_trust": 87, "triggers": ["clinical export review"], "recommended_action": "Monitor high-impact exports."},
    {"identity_id": "ZT-API-AUTO", "tenant_id": "TEN-BALA-MFG", "actor": "automation.api@sentra.demo", "role": "Integration", "trust_score": 54, "band": "risky", "decision": "temporary restrict", "device_trust": 74, "network_trust": 49, "session_trust": 47, "user_trust": 61, "triggers": ["API spike", "token age"], "recommended_action": "Pause API key if second spike occurs."},
    {"identity_id": "ZT-GOV-ADMIN", "tenant_id": "TEN-GOVSECURE", "actor": "gov.admin@sentra.demo", "role": "Super Admin", "trust_score": 93, "band": "trusted", "decision": "allow", "device_trust": 96, "network_trust": 92, "session_trust": 91, "user_trust": 94, "triggers": ["none"], "recommended_action": "No intervention required."},
    {"identity_id": "ZT-UNKNOWN-01", "tenant_id": "TEN-BALA-UNI", "actor": "unknown.device@sentra.demo", "role": "Operator", "trust_score": 42, "band": "block", "decision": "revoke access", "device_trust": 28, "network_trust": 44, "session_trust": 39, "user_trust": 51, "triggers": ["unknown device", "geo shift", "failed attempts"], "recommended_action": "Force logout and lock account pending verification."},
)

POLICIES: tuple[dict[str, Any], ...] = (
    {"policy_id": "POL-ZT-001", "name": "Admin step-up authentication", "control": "require MFA", "blocks": 4, "step_up_count": 18, "status": "active", "coverage": 96},
    {"policy_id": "POL-ZT-002", "name": "Unknown device restriction", "control": "temporary restrict", "blocks": 7, "step_up_count": 11, "status": "active", "coverage": 91},
    {"policy_id": "POL-ZT-003", "name": "API burst containment", "control": "pause key", "blocks": 2, "step_up_count": 0, "status": "active", "coverage": 88},
    {"policy_id": "POL-ZT-004", "name": "Tenant switch guardrail", "control": "isolate route access", "blocks": 5, "step_up_count": 6, "status": "active", "coverage": 93},
    {"policy_id": "POL-ZT-005", "name": "Export evidence review", "control": "manager approval", "blocks": 1, "step_up_count": 9, "status": "watch", "coverage": 84},
)

FORENSICS: tuple[dict[str, Any], ...] = (
    {"ledger_id": "FOR-0001", "tenant_id": "TEN-BALA-UNI", "timestamp": "2026-04-26T02:14:10+00:00", "actor": "security.admin@sentra.demo", "org": "Bala University", "action": "role_change_attempt", "target": "operator role", "ip_region": "Unknown VPN", "device": "Windows Command Tablet", "result": "step_up_required", "severity": "high", "chain_hash": "b83f9a21c0e4"},
    {"ledger_id": "FOR-0002", "tenant_id": "TEN-BALA-MFG", "timestamp": "2026-04-26T04:20:18+00:00", "actor": "automation.api@sentra.demo", "org": "Bala Manufacturing", "action": "api_spike", "target": "/operations/automation", "ip_region": "Dubai, AE", "device": "Service token", "result": "rate_limited", "severity": "medium", "chain_hash": "d41b3e77a91c"},
    {"ledger_id": "FOR-0003", "tenant_id": "TEN-GOVSECURE", "timestamp": "2026-04-26T05:03:43+00:00", "actor": "gov.admin@sentra.demo", "org": "SmartCity Authority", "action": "token_replay_detected", "target": "refresh family", "ip_region": "Sovereign Edge", "device": "Duplicated fingerprint", "result": "revoked", "severity": "high", "chain_hash": "901f6cc12abc"},
    {"ledger_id": "FOR-0004", "tenant_id": "TEN-BALA-HOSP", "timestamp": "2026-04-26T06:31:08+00:00", "actor": "analyst1@sentra.demo", "org": "Bala Hospital Demo", "action": "export_generated", "target": "clinical response report", "ip_region": "Boston, US", "device": "Lenovo ThinkPad", "result": "review_queued", "severity": "medium", "chain_hash": "4fe21b0a991d"},
    {"ledger_id": "FOR-0005", "tenant_id": "TEN-BALA-HOSP", "timestamp": "2026-04-26T08:01:20+00:00", "actor": "night.operator@sentra.demo", "org": "Bala Hospital Demo", "action": "mfa_bypass_attempt", "target": "clinical admin console", "ip_region": "Unknown VPN", "device": "Unknown Android", "result": "blocked", "severity": "high", "chain_hash": "67ac419ec233"},
)


class SecurityDefenseStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "orgs": [],
            "incidents": [],
            "threats": [],
            "zero_trust": [],
            "policies": [],
            "forensics": [],
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
        seed_groups = {
            "orgs": (ORGS, "org_id"),
            "incidents": (INCIDENTS, "incident_id"),
            "threats": (THREATS, "threat_id"),
            "zero_trust": (ZERO_TRUST, "identity_id"),
            "policies": (POLICIES, "policy_id"),
            "forensics": (FORENSICS, "ledger_id"),
        }
        created = 0
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
        if table == "policies" or set(tenant_ids) == set(DEMO_TENANTS):
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids]

    def response_action(self, tenant_ids: list[str], action: str, payload_data: dict[str, Any]) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            event = {
                "event_id": f"DEF-EVT-{len(payload['events']) + 1:05d}",
                "tenant_id": tenant_ids[0],
                "action": action,
                "payload": payload_data,
                "created_at": utc_now_iso(),
                "chain_hash": f"mock-{len(payload['events']) + 1:05d}-{action[:8]}",
            }
            payload["events"].append(event)
            if action == "revoke_session":
                payload["forensics"].append(
                    {
                        "ledger_id": f"FOR-{len(payload['forensics']) + 1:04d}",
                        "tenant_id": tenant_ids[0],
                        "timestamp": utc_now_iso(),
                        "actor": str(payload_data.get("actor") or "security.admin@sentra.demo"),
                        "org": "Sentra Security",
                        "action": "session_revoked",
                        "target": str(payload_data.get("session_id") or "unknown session"),
                        "ip_region": "SOC Console",
                        "device": "Admin browser",
                        "result": "success",
                        "severity": "high",
                        "chain_hash": event["chain_hash"],
                        "updated_at": utc_now_iso(),
                    }
                )
            self._write(payload)
        return event


security_defense_store = SecurityDefenseStore(settings.sentra_security_defense_store_path)

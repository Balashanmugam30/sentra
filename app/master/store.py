from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS, utc_now_iso


TENANTS: tuple[dict[str, Any], ...] = (
    {
        "tenant_id": "TEN-GRAND-MERIDIAN",
        "name": "Grand Meridian Hotels",
        "vertical": "Hospitality",
        "region": "North America",
        "plan": "Enterprise",
        "status": "mission_ready",
        "buildings": 48,
        "seats": 820,
        "users": 744,
        "ai_runs": 18420,
        "notifications": 312000,
        "storage_tb": 18.4,
        "sla_percent": 99.96,
        "mrr": 148000,
        "arr": 1776000,
        "open_incidents": 2,
        "command_capacity": 91,
        "role_hierarchy": ["owner", "regional_admin", "building_commander", "responder", "auditor"],
        "last_audit": "2026-04-26T00:06:00+00:00",
    },
    {
        "tenant_id": "TEN-BALA-HOSP",
        "name": "MetroCare Hospitals",
        "vertical": "Healthcare",
        "region": "India",
        "plan": "Government",
        "status": "protected",
        "buildings": 22,
        "seats": 1100,
        "users": 1042,
        "ai_runs": 22640,
        "notifications": 498000,
        "storage_tb": 24.9,
        "sla_percent": 99.98,
        "mrr": 216000,
        "arr": 2592000,
        "open_incidents": 1,
        "command_capacity": 94,
        "role_hierarchy": ["owner", "clinical_admin", "security_manager", "medical_responder", "privacy_auditor"],
        "last_audit": "2026-04-26T00:08:00+00:00",
    },
    {
        "tenant_id": "TEN-BALA-MFG",
        "name": "Nova Mall Group",
        "vertical": "Retail",
        "region": "GCC",
        "plan": "Growth",
        "status": "watch",
        "buildings": 31,
        "seats": 540,
        "users": 492,
        "ai_runs": 12780,
        "notifications": 208400,
        "storage_tb": 11.2,
        "sla_percent": 99.91,
        "mrr": 93000,
        "arr": 1116000,
        "open_incidents": 4,
        "command_capacity": 84,
        "role_hierarchy": ["owner", "mall_admin", "tenant_manager", "security_lead", "floor_staff"],
        "last_audit": "2026-04-26T00:10:00+00:00",
    },
    {
        "tenant_id": "TEN-BALA-UNI",
        "name": "Skyline University",
        "vertical": "Education",
        "region": "Europe",
        "plan": "Enterprise",
        "status": "mission_ready",
        "buildings": 64,
        "seats": 1360,
        "users": 1208,
        "ai_runs": 19240,
        "notifications": 388000,
        "storage_tb": 20.1,
        "sla_percent": 99.94,
        "mrr": 126000,
        "arr": 1512000,
        "open_incidents": 0,
        "command_capacity": 89,
        "role_hierarchy": ["owner", "campus_admin", "residence_lead", "security_manager", "student_safety"],
        "last_audit": "2026-04-26T00:12:00+00:00",
    },
    {
        "tenant_id": "TEN-GOVSECURE",
        "name": "SmartCity Authority",
        "vertical": "Public Sector",
        "region": "APAC",
        "plan": "Custom Strategic",
        "status": "sovereign",
        "buildings": 118,
        "seats": 2400,
        "users": 2165,
        "ai_runs": 38400,
        "notifications": 842000,
        "storage_tb": 41.8,
        "sla_percent": 99.99,
        "mrr": 420000,
        "arr": 5040000,
        "open_incidents": 3,
        "command_capacity": 96,
        "role_hierarchy": ["sovereign_owner", "regional_commander", "agency_admin", "field_commander", "auditor"],
        "last_audit": "2026-04-26T00:14:00+00:00",
    },
)

REGIONS: tuple[dict[str, Any], ...] = (
    {"region_id": "REG-NA", "name": "North America", "tenants": 42, "active_incidents": 5, "latency_ms": 48, "sla_percent": 99.95, "capacity": 88, "command_nodes": 126},
    {"region_id": "REG-GCC", "name": "GCC", "tenants": 18, "active_incidents": 3, "latency_ms": 61, "sla_percent": 99.93, "capacity": 82, "command_nodes": 74},
    {"region_id": "REG-IN", "name": "India", "tenants": 57, "active_incidents": 4, "latency_ms": 54, "sla_percent": 99.96, "capacity": 91, "command_nodes": 188},
    {"region_id": "REG-EU", "name": "Europe", "tenants": 39, "active_incidents": 2, "latency_ms": 58, "sla_percent": 99.94, "capacity": 86, "command_nodes": 132},
    {"region_id": "REG-APAC", "name": "APAC", "tenants": 44, "active_incidents": 6, "latency_ms": 67, "sla_percent": 99.92, "capacity": 84, "command_nodes": 141},
)

INCIDENTS: tuple[dict[str, Any], ...] = (
    {"incident_id": "INC-AUTO-FIRE", "tenant_id": "TEN-GRAND-MERIDIAN", "title": "Fire + auto dispatch", "severity": "critical", "status": "executing", "eta_to_stability_min": 11, "actions_linked": 6},
    {"incident_id": "INC-PANIC-REROUTE", "tenant_id": "TEN-BALA-MFG", "title": "Panic + crowd reroute", "severity": "high", "status": "stabilizing", "eta_to_stability_min": 8, "actions_linked": 5},
    {"incident_id": "INC-CYBER-FALLBACK", "tenant_id": "TEN-GOVSECURE", "title": "Cyber outage + fallback", "severity": "high", "status": "failover_active", "eta_to_stability_min": 17, "actions_linked": 7},
    {"incident_id": "INC-SLA-BREACH", "tenant_id": "TEN-GRAND-MERIDIAN", "title": "VIP tenant SLA breach", "severity": "medium", "status": "executive_watch", "eta_to_stability_min": 22, "actions_linked": 4},
    {"incident_id": "INC-GLOBAL-SURGE", "tenant_id": "TEN-GOVSECURE", "title": "Global surge event", "severity": "critical", "status": "surge_control", "eta_to_stability_min": 28, "actions_linked": 9},
)

ACTION_QUEUE: tuple[dict[str, Any], ...] = (
    {"action_id": "ACT-DISPATCH-001", "tenant_id": "TEN-GRAND-MERIDIAN", "title": "Dispatch responders to Kitchen B", "type": "dispatch", "owner": "Ops Alpha", "priority": "critical", "status": "running", "approval_status": "approved", "eta_minutes": 3, "guardrail": "life_safety_first", "confidence": 96},
    {"action_id": "ACT-COMMS-002", "tenant_id": "TEN-GRAND-MERIDIAN", "title": "Send floor 3 guided evacuation broadcast", "type": "communications", "owner": "Comms Relay", "priority": "critical", "status": "queued", "approval_status": "approved", "eta_minutes": 1, "guardrail": "calm_authoritative_tone", "confidence": 94},
    {"action_id": "ACT-ZONE-003", "tenant_id": "TEN-BALA-MFG", "title": "Open north exit and close smoke corridor", "type": "zone_control", "owner": "Security Bravo", "priority": "high", "status": "awaiting_approval", "approval_status": "manager_required", "eta_minutes": 4, "guardrail": "avoid_crowd_compression", "confidence": 89},
    {"action_id": "ACT-WORKFLOW-004", "tenant_id": "TEN-BALA-HOSP", "title": "Launch oxygen wing recovery workflow", "type": "workflow", "owner": "Facilities Lead", "priority": "high", "status": "queued", "approval_status": "clinical_required", "eta_minutes": 9, "guardrail": "patient_continuity", "confidence": 91},
    {"action_id": "ACT-FALLBACK-005", "tenant_id": "TEN-GOVSECURE", "title": "Switch notification provider to sovereign fallback", "type": "failover", "owner": "Cloud Sentinel", "priority": "critical", "status": "running", "approval_status": "auto_safe", "eta_minutes": 2, "guardrail": "data_residency_locked", "confidence": 92},
    {"action_id": "ACT-RECOVERY-006", "tenant_id": "TEN-BALA-UNI", "title": "Trigger campus re-entry readiness checks", "type": "recovery", "owner": "Campus Ops", "priority": "medium", "status": "queued", "approval_status": "approved", "eta_minutes": 18, "guardrail": "human_approval_before_reopen", "confidence": 88},
)

EXECUTIONS: tuple[dict[str, Any], ...] = (
    {"execution_id": "EXE-0001", "tenant_id": "TEN-GRAND-MERIDIAN", "action_id": "ACT-DISPATCH-001", "status": "running", "progress": 68, "last_step": "Responder route confirmed via east stairwell", "latency_ms": 210, "retry_count": 0},
    {"execution_id": "EXE-0002", "tenant_id": "TEN-GOVSECURE", "action_id": "ACT-FALLBACK-005", "status": "running", "progress": 74, "last_step": "Fallback provider accepted priority queue", "latency_ms": 188, "retry_count": 1},
    {"execution_id": "EXE-0003", "tenant_id": "TEN-BALA-MFG", "action_id": "ACT-ZONE-003", "status": "waiting", "progress": 42, "last_step": "Human approval required before exit close", "latency_ms": 242, "retry_count": 0},
)

RECOVERY_ITEMS: tuple[dict[str, Any], ...] = (
    {"recovery_id": "REC-CLOSED-LOOP", "tenant_id": "TEN-GRAND-MERIDIAN", "title": "Closed-loop fire recovery", "score": 94, "outcome": "Floor 3 evacuation stable; smoke containment verified.", "next_action": "Start HVAC clearance and room reopen waves.", "eta_minutes": 42},
    {"recovery_id": "REC-CYBER-FALLBACK", "tenant_id": "TEN-GOVSECURE", "title": "Cyber outage fallback recovery", "score": 91, "outcome": "Traffic shifted to sovereign queue with no data residency breach.", "next_action": "Keep primary connector isolated until checks pass.", "eta_minutes": 27},
    {"recovery_id": "REC-PANIC-REROUTE", "tenant_id": "TEN-BALA-MFG", "title": "Crowd reroute recovery", "score": 88, "outcome": "Food court density reduced below pressure threshold.", "next_action": "Release re-entry in staged waves.", "eta_minutes": 31},
)

GUARDRAILS: tuple[dict[str, Any], ...] = (
    {"guardrail_id": "GR-LIFE", "name": "Life safety override", "state": "active", "coverage": 100, "description": "Blocks revenue-optimized decisions when human risk exceeds threshold."},
    {"guardrail_id": "GR-RBAC", "name": "Human governance approvals", "state": "active", "coverage": 96, "description": "Routes critical actions to manager, executive, or dual approval."},
    {"guardrail_id": "GR-ROLLBACK", "name": "Rollback and fail-safe posture", "state": "active", "coverage": 94, "description": "Every autonomous execution carries rollback or fallback instructions."},
    {"guardrail_id": "GR-TENANT", "name": "Tenant isolation", "state": "active", "coverage": 99, "description": "Data and command actions stay scoped to tenant and region."},
)

USAGE_ROWS: tuple[dict[str, Any], ...] = tuple(
    {
        "usage_id": f"USAGE-{tenant['tenant_id']}",
        "tenant_id": tenant["tenant_id"],
        "tenant_name": tenant["name"],
        "ai_runs": tenant["ai_runs"],
        "notifications": tenant["notifications"],
        "storage_tb": tenant["storage_tb"],
        "seat_utilization": round(tenant["users"] / tenant["seats"] * 100),
        "quota_health": min(99, tenant["command_capacity"] + 3),
    }
    for tenant in TENANTS
)

REVENUE_ROWS: tuple[dict[str, Any], ...] = tuple(
    {
        "revenue_id": f"REV-{tenant['tenant_id']}",
        "tenant_id": tenant["tenant_id"],
        "tenant_name": tenant["name"],
        "mrr": tenant["mrr"],
        "arr": tenant["arr"],
        "growth_percent": 182 if tenant["tenant_id"] == "TEN-GOVSECURE" else 116 + len(tenant["name"]) % 38,
        "churn_risk": 3 if tenant["status"] != "watch" else 12,
        "expansion_pipeline": round(tenant["arr"] * 0.34),
        "renewal_days": 42 + len(tenant["name"]) % 45,
    }
    for tenant in TENANTS
)

FORECASTS: tuple[dict[str, Any], ...] = (
    {"forecast_id": "FC-BASE", "tenant_id": "TEN-GOVSECURE", "scenario": "base", "arr_12_month": 18400000, "growth_percent": 182, "churn_percent": 3.4, "enterprise_wins": 18, "confidence": 91},
    {"forecast_id": "FC-CONSERVATIVE", "tenant_id": "TEN-GOVSECURE", "scenario": "conservative", "arr_12_month": 14200000, "growth_percent": 124, "churn_percent": 5.8, "enterprise_wins": 11, "confidence": 94},
    {"forecast_id": "FC-AGGRESSIVE", "tenant_id": "TEN-GOVSECURE", "scenario": "aggressive", "arr_12_month": 28600000, "growth_percent": 268, "churn_percent": 2.2, "enterprise_wins": 31, "confidence": 82},
)

INVESTORS: tuple[dict[str, Any], ...] = (
    {"investor_id": "INV-SEQUOIA-SCOUT", "tenant_id": "TEN-GOVSECURE", "fund": "Sequoia scout", "stage": "partner_intro", "conviction": 84, "check_size": 500000, "next_action": "Send crisis autonomy demo cut", "fit": "AI infrastructure"},
    {"investor_id": "INV-ACCEL", "tenant_id": "TEN-GOVSECURE", "fund": "Accel partner", "stage": "first_meeting", "conviction": 78, "check_size": 2500000, "next_action": "Share ARR forecast and cloud tenant metrics", "fit": "enterprise SaaS"},
    {"investor_id": "INV-LIGHTSPEED", "tenant_id": "TEN-GOVSECURE", "fund": "Lightspeed associate", "stage": "diligence", "conviction": 72, "check_size": 1000000, "next_action": "Provide AI governance evidence", "fit": "vertical AI"},
    {"investor_id": "INV-TIGER", "tenant_id": "TEN-GOVSECURE", "fund": "Tiger growth", "stage": "target", "conviction": 61, "check_size": 8000000, "next_action": "Wait for $10M ARR signal", "fit": "growth"},
    {"investor_id": "INV-UAE", "tenant_id": "TEN-GOVSECURE", "fund": "Sovereign UAE fund", "stage": "partner_meeting", "conviction": 88, "check_size": 12000000, "next_action": "Discuss sovereign command cloud", "fit": "national resilience"},
    {"investor_id": "INV-GOVTECH", "tenant_id": "TEN-GOVSECURE", "fund": "Strategic GovTech Fund", "stage": "term_sheet_watch", "conviction": 91, "check_size": 6000000, "next_action": "Draft strategic pilot terms", "fit": "public safety"},
)

FINANCE_ROWS: tuple[dict[str, Any], ...] = (
    {"finance_id": "FIN-BOARD", "tenant_id": "TEN-GOVSECURE", "arr": 4800000, "mrr": 400000, "growth_percent": 182, "nrr": 129, "burn_monthly": 210000, "cash": 6400000, "runway_months": 30, "burn_multiple": 0.52, "valuation_base": 62000000, "valuation_low": 42000000, "valuation_high": 98000000, "ipo_score": 64},
)

BOARD_SUMMARY: tuple[dict[str, Any], ...] = (
    {"summary_id": "BOARD-MONTHLY", "tenant_id": "TEN-GOVSECURE", "title": "April board command pack", "readiness_score": 91, "strategic_ask": "Approve sovereign pilot and Series A prep window.", "top_risk": "Enterprise onboarding capacity becomes bottleneck if GCC pilots close together.", "recommended_action": "Hire deployment lead and keep autonomy guardrails in approval-required mode for public-sector pilots."},
)

AUDIT_ROWS: tuple[dict[str, Any], ...] = (
    {"audit_id": "AUD-MASTER-0001", "tenant_id": "TEN-GRAND-MERIDIAN", "action": "autonomous_dispatch_approved", "actor": "ai.council@sentra", "result": "success", "risk_score": 72, "created_at": "2026-04-26T00:15:00+00:00"},
    {"audit_id": "AUD-MASTER-0002", "tenant_id": "TEN-GOVSECURE", "action": "fallback_provider_switched", "actor": "cloud.sentinel@sentra", "result": "success", "risk_score": 68, "created_at": "2026-04-26T00:17:00+00:00"},
    {"audit_id": "AUD-MASTER-0003", "tenant_id": "TEN-BALA-MFG", "action": "exit_control_waiting_approval", "actor": "governance.router@sentra", "result": "pending", "risk_score": 54, "created_at": "2026-04-26T00:19:00+00:00"},
)


class MasterStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "tenants": [],
            "regions": [],
            "incidents": [],
            "action_queue": [],
            "executions": [],
            "recovery": [],
            "guardrails": [],
            "usage": [],
            "revenue": [],
            "forecasts": [],
            "investors": [],
            "finance": [],
            "board_summary": [],
            "audit": [],
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
            "tenants": (TENANTS, "tenant_id"),
            "regions": (REGIONS, "region_id"),
            "incidents": (INCIDENTS, "incident_id"),
            "action_queue": (ACTION_QUEUE, "action_id"),
            "executions": (EXECUTIONS, "execution_id"),
            "recovery": (RECOVERY_ITEMS, "recovery_id"),
            "guardrails": (GUARDRAILS, "guardrail_id"),
            "usage": (USAGE_ROWS, "usage_id"),
            "revenue": (REVENUE_ROWS, "revenue_id"),
            "forecasts": (FORECASTS, "forecast_id"),
            "investors": (INVESTORS, "investor_id"),
            "finance": (FINANCE_ROWS, "finance_id"),
            "board_summary": (BOARD_SUMMARY, "summary_id"),
            "audit": (AUDIT_ROWS, "audit_id"),
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
        if table in {"regions", "guardrails", "forecasts", "investors", "finance", "board_summary"}:
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids]

    def singletons(self, table: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        rows = self.rows(table, tenant_ids)
        if rows:
            return rows
        with self._lock:
            return [dict(row) for row in self._read()[table]]

    def record_event(self, tenant_ids: list[str], action: str, payload_data: dict[str, Any] | None = None) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            event = {
                "event_id": f"MASTER-EVT-{len(payload['events']) + 1:05d}",
                "tenant_id": tenant_ids[0],
                "action": action,
                "payload": payload_data or {},
                "created_at": utc_now_iso(),
            }
            payload["events"].append(event)
            payload["audit"].append(
                {
                    "audit_id": f"AUD-MASTER-{len(payload['audit']) + 1:04d}",
                    "tenant_id": tenant_ids[0],
                    "action": action,
                    "actor": str((payload_data or {}).get("actor") or "sentra.master"),
                    "result": "success",
                    "risk_score": int((payload_data or {}).get("risk_score") or 58),
                    "created_at": event["created_at"],
                    "updated_at": event["created_at"],
                }
            )
            self._write(payload)
        return event

    def update_action(self, tenant_ids: list[str], action_id: str | None, status: str, approval_status: str | None = None) -> dict[str, Any] | None:
        selected: dict[str, Any] | None = None
        with self._lock:
            payload = self._read()
            for action in payload["action_queue"]:
                if action.get("tenant_id") not in tenant_ids and set(tenant_ids) != set(DEMO_TENANTS):
                    continue
                if action_id and action["action_id"] != action_id:
                    continue
                action["status"] = status
                if approval_status is not None:
                    action["approval_status"] = approval_status
                action["updated_at"] = utc_now_iso()
                selected = dict(action)
                break
            if selected is not None:
                payload["events"].append(
                    {
                        "event_id": f"MASTER-EVT-{len(payload['events']) + 1:05d}",
                        "tenant_id": selected["tenant_id"],
                        "action": f"autonomy_action_{status}",
                        "payload": {"action_id": selected["action_id"], "approval_status": selected["approval_status"]},
                        "created_at": utc_now_iso(),
                    }
                )
                self._write(payload)
        return selected

    def create_tenant(self, tenant_ids: list[str], data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            name = str(data.get("name") or "New Strategic Tenant")
            tenant = {
                "tenant_id": f"TEN-CUSTOM-{len(payload['tenants']) + 1:03d}",
                "name": name,
                "vertical": str(data.get("vertical") or "Enterprise"),
                "region": str(data.get("region") or "North America"),
                "plan": str(data.get("plan") or "Enterprise"),
                "status": "provisioning",
                "buildings": int(data.get("buildings") or 1),
                "seats": int(data.get("seats") or 120),
                "users": 0,
                "ai_runs": 0,
                "notifications": 0,
                "storage_tb": 0.0,
                "sla_percent": 99.9,
                "mrr": int(data.get("mrr") or 48000),
                "arr": int(data.get("arr") or 576000),
                "open_incidents": 0,
                "command_capacity": 75,
                "role_hierarchy": ["owner", "admin", "operator", "auditor"],
                "last_audit": utc_now_iso(),
                "updated_at": utc_now_iso(),
            }
            payload["tenants"].append(tenant)
            payload["events"].append(
                {
                    "event_id": f"MASTER-EVT-{len(payload['events']) + 1:05d}",
                    "tenant_id": tenant_ids[0],
                    "action": "tenant_created",
                    "payload": {"tenant_id": tenant["tenant_id"], "name": name},
                    "created_at": utc_now_iso(),
                }
            )
            self._write(payload)
        return tenant


master_store = MasterStore(settings.sentra_master_store_path)


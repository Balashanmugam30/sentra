from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ops.governance_store import ops_governance_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


APPROVALS: list[dict[str, Any]] = [
    {
        "approval_id": "APR-LOW-COMMS-001",
        "title": "Routine responder ETA update",
        "action_type": "routine_comms",
        "risk_level": "low",
        "risk_score": 18,
        "required_approval": "auto",
        "assigned_to": "Automation Policy",
        "backup_approver": "Comms Desk",
        "sla_minutes": 2,
        "pending_minutes": 1,
        "impact": "Keeps occupants informed without public escalation.",
        "evidence": ["Council confidence 94%", "Message template approved", "No private data exposed"],
        "priority_score": 42,
        "workflow": "Fire response communications",
    },
    {
        "approval_id": "APR-EXIT-002",
        "title": "Unlock east stairwell exits",
        "action_type": "unlock_exits",
        "risk_level": "medium",
        "risk_score": 47,
        "required_approval": "manager",
        "assigned_to": "Security Manager",
        "backup_approver": "Ops Alpha",
        "sla_minutes": 4,
        "pending_minutes": 3,
        "impact": "Accelerates evacuation while preserving access control evidence.",
        "evidence": ["Exit B camera clear", "Crowd flow model green", "Fire Agent recommends release"],
        "priority_score": 78,
        "workflow": "Hotel kitchen fire",
    },
    {
        "approval_id": "APR-POWER-003",
        "title": "Shutdown basement power segment",
        "action_type": "shutdown_power",
        "risk_level": "critical",
        "risk_score": 91,
        "required_approval": "dual",
        "assigned_to": "Executive Liaison",
        "backup_approver": "Facilities Director",
        "sla_minutes": 6,
        "pending_minutes": 8,
        "impact": "Reduces ignition risk but may disrupt elevator and ventilation fallback.",
        "evidence": ["Gas confidence 88%", "HVAC isolation pending", "Facilities load high"],
        "priority_score": 96,
        "workflow": "Basement gas leak",
    },
    {
        "approval_id": "APR-PUBLIC-004",
        "title": "Mass public alert to guests",
        "action_type": "mass_public_alert",
        "risk_level": "high",
        "risk_score": 73,
        "required_approval": "executive",
        "assigned_to": "Executive Liaison",
        "backup_approver": "General Manager",
        "sla_minutes": 5,
        "pending_minutes": 4,
        "impact": "Prevents confusion but increases reputational blast radius if premature.",
        "evidence": ["Smoke spread forecast 7 min", "Evacuation route stable", "Comms Agent confidence 87%"],
        "priority_score": 88,
        "workflow": "Hotel kitchen fire",
    },
    {
        "approval_id": "APR-TICKET-005",
        "title": "Create facilities inspection ticket",
        "action_type": "create_ticket",
        "risk_level": "low",
        "risk_score": 14,
        "required_approval": "auto",
        "assigned_to": "Automation Policy",
        "backup_approver": "Facilities Lead",
        "sla_minutes": 3,
        "pending_minutes": 1,
        "impact": "Records follow-up maintenance evidence for audit completion.",
        "evidence": ["Workflow dependency active", "No occupant-facing impact", "Retry queue healthy"],
        "priority_score": 38,
        "workflow": "Containment verify",
    },
]


AUTOMATIONS: list[dict[str, Any]] = [
    {
        "action_id": "AUTO-SEND-ALERT",
        "title": "Send governed alert",
        "connector": "n8n:webhook:sentra-alert",
        "system": "SMS / Email mock flow",
        "status": "ready",
        "risk_level": "medium",
        "last_attempt": "2 min ago",
        "retries": 0,
        "next_retry": "on failure",
        "fallback": "Switch to local notification queue",
        "success_rate": 98,
    },
    {
        "action_id": "AUTO-CREATE-TICKET",
        "title": "Create incident ticket",
        "connector": "n8n:webhook:create-ticket",
        "system": "Service desk",
        "status": "auto_approved",
        "risk_level": "low",
        "last_attempt": "1 min ago",
        "retries": 0,
        "next_retry": "not scheduled",
        "fallback": "Queue ticket in Sentra ledger",
        "success_rate": 99,
    },
    {
        "action_id": "AUTO-DISPATCH-TEAM",
        "title": "Dispatch backup team",
        "connector": "n8n:webhook:dispatch-team",
        "system": "Operations roster",
        "status": "watch",
        "risk_level": "high",
        "last_attempt": "5 min ago",
        "retries": 1,
        "next_retry": "45 sec",
        "fallback": "Notify Ops Alpha manually",
        "success_rate": 91,
    },
    {
        "action_id": "AUTO-EXPORT-REPORT",
        "title": "Export incident evidence pack",
        "connector": "n8n:webhook:evidence-export",
        "system": "Audit export",
        "status": "ready",
        "risk_level": "medium",
        "last_attempt": "not run",
        "retries": 0,
        "next_retry": "on failure",
        "fallback": "Generate local JSON evidence bundle",
        "success_rate": 96,
    },
]


ROLE_WORKLOAD: list[dict[str, Any]] = [
    {"role": "Security Manager", "pending": 3, "approvals_per_hour": 11, "avg_decision_time": "2m 20s", "load": 82, "bottleneck": True},
    {"role": "Executive Liaison", "pending": 5, "approvals_per_hour": 7, "avg_decision_time": "4m 10s", "load": 91, "bottleneck": True},
    {"role": "Facilities Director", "pending": 2, "approvals_per_hour": 6, "avg_decision_time": "3m 05s", "load": 64, "bottleneck": False},
    {"role": "Comms Desk", "pending": 1, "approvals_per_hour": 14, "avg_decision_time": "1m 45s", "load": 46, "bottleneck": False},
]


DELEGATIONS: list[dict[str, Any]] = [
    {"delegation_id": "DEL-001", "from": "Executive Liaison", "to": "General Manager", "coverage": "High-risk public alerts", "status": "available", "load_delta": "-22%"},
    {"delegation_id": "DEL-002", "from": "Security Manager", "to": "Ops Alpha", "coverage": "Exit and perimeter actions", "status": "recommended", "load_delta": "-18%"},
    {"delegation_id": "DEL-003", "from": "Facilities Director", "to": "Regional Facilities Lead", "coverage": "Power and HVAC actions", "status": "backup", "load_delta": "-15%"},
]


RETRY_HEALTH: list[dict[str, Any]] = [
    {"provider": "Primary webhook relay", "status": "healthy", "queued": 2, "failed": 0, "p95_latency": "410ms", "failover_ready": True},
    {"provider": "SMS provider", "status": "watch", "queued": 7, "failed": 1, "p95_latency": "1.2s", "failover_ready": True},
    {"provider": "Email provider", "status": "healthy", "queued": 4, "failed": 0, "p95_latency": "690ms", "failover_ready": True},
]


DEMO_SCENARIOS: list[dict[str, str]] = [
    {"scenario_id": "delayed_manager", "label": "Delayed manager approval"},
    {"scenario_id": "dual_power_shutdown", "label": "Dual approval power shutdown"},
    {"scenario_id": "webhook_retry", "label": "Webhook failure retry"},
    {"scenario_id": "executive_surge", "label": "Executive surge queue"},
    {"scenario_id": "auto_low_risk", "label": "Full auto low-risk recovery"},
]


def _status_for(approval: dict[str, Any], state: dict[str, Any]) -> str:
    approval_id = str(approval["approval_id"])
    if approval_id in state["rejected"]:
        return "rejected"
    if approval_id in state["approved"]:
        return "approved" if approval["required_approval"] != "auto" else "auto_approved"
    if int(approval["pending_minutes"]) > int(approval["sla_minutes"]) or approval_id in state["escalated"]:
        return "escalated"
    return "pending"


def _enrich_approvals(state: dict[str, Any]) -> list[dict[str, Any]]:
    approvals: list[dict[str, Any]] = []
    for approval in APPROVALS:
        item = dict(approval)
        approval_id = str(item["approval_id"])
        item["status"] = _status_for(item, state)
        item["delegated_to"] = state["delegated"].get(approval_id)
        item["sla_remaining_minutes"] = max(0, int(item["sla_minutes"]) - int(item["pending_minutes"]))
        item["route"] = route_approval(str(item["action_type"]), str(item["risk_level"]))
        approvals.append(item)
    return sorted(approvals, key=lambda item: int(item["priority_score"]), reverse=True)


def route_approval(action_type: str, risk_level: str) -> dict[str, Any]:
    if risk_level == "low" or action_type in {"routine_comms", "create_ticket"}:
        return {"decision": "auto_approve", "approver": "Automation Policy", "rationale": "Low-risk action with reversible operational impact."}
    if risk_level == "medium" or action_type == "unlock_exits":
        return {"decision": "manager_approval", "approver": "Security Manager", "rationale": "Operational action needs manager evidence review."}
    if risk_level == "high" or action_type == "mass_public_alert":
        return {"decision": "executive_approval", "approver": "Executive Liaison", "rationale": "High-impact public or reputational action."}
    return {"decision": "dual_approval", "approver": "Executive Liaison + Facilities Director", "rationale": "Critical irreversible action requires two-party approval."}


def _escalations(approvals: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "escalation_id": f"ESC-{approval['approval_id']}",
            "approval_id": approval["approval_id"],
            "title": approval["title"],
            "level": 2 if approval["risk_level"] == "critical" else 1,
            "current_owner": approval.get("delegated_to") or approval["assigned_to"],
            "next_owner": approval["backup_approver"],
            "reason": "Approval SLA breached" if approval["status"] == "escalated" else "Priority watch",
            "fallback": "Auto-safe fallback available" if approval["risk_level"] != "critical" else "Manual dual approval required",
        }
        for approval in approvals
        if approval["status"] == "escalated" or int(approval["priority_score"]) >= 88
    ]


def build_governance_snapshot() -> dict[str, Any]:
    state = ops_governance_store.get_state()
    approvals = _enrich_approvals(state)
    pending = [approval for approval in approvals if approval["status"] in {"pending", "escalated"}]
    auto_approved = [approval for approval in approvals if approval["status"] == "auto_approved"]
    escalations = _escalations(approvals)
    approved_count = len([approval for approval in approvals if approval["status"] in {"approved", "auto_approved"}])
    return {
        "generated_at": _now_iso(),
        "mode": "demo",
        "scenarios": DEMO_SCENARIOS,
        "pending_approvals": pending,
        "priority_queue": pending[:4],
        "sla_to_approve": [
            {
                "approval_id": approval["approval_id"],
                "title": approval["title"],
                "remaining_minutes": approval["sla_remaining_minutes"],
                "status": "breached" if approval["status"] == "escalated" else "watch",
                "assigned_to": approval.get("delegated_to") or approval["assigned_to"],
            }
            for approval in pending
        ],
        "auto_approved_actions": auto_approved,
        "escalated_decisions": escalations,
        "role_workload": ROLE_WORKLOAD,
        "delegations": DELEGATIONS,
        "automation": AUTOMATIONS,
        "retry_health": RETRY_HEALTH,
        "analytics": {
            "auto_approval_percent": 38,
            "avg_approval_time": "2m 52s",
            "escalations_avoided": 14,
            "workflows_completed": 27,
            "governance_efficiency": 91,
            "response_acceleration": "+31%",
        },
        "trust": {
            "decisions_governed": 184,
            "unsafe_actions_blocked": 9,
            "audit_completeness": "100%",
            "trust_score": 94,
            "autonomy_maturity": "Governed semi-auto",
        },
        "evidence": [
            {"evidence_id": "EVD-001", "title": "Approval route matrix", "source": "Smart Approval Router", "completeness": 100, "hash": "EVD-ROUTE-9F3A"},
            {"evidence_id": "EVD-002", "title": "Webhook retry transcript", "source": "Automation Engine", "completeness": 96, "hash": "EVD-RETRY-74B1"},
            {"evidence_id": "EVD-003", "title": "Decision maker workload", "source": "Governance Load Balancer", "completeness": 98, "hash": "EVD-LOAD-51C2"},
        ],
        "ledger": state["automation_runs"],
        "summary": {
            "pending_count": len(pending),
            "critical_count": len([approval for approval in pending if approval["risk_level"] == "critical"]),
            "approved_count": approved_count,
            "automation_ready": len([item for item in AUTOMATIONS if item["status"] in {"ready", "auto_approved"}]),
            "escalation_count": len(escalations),
        },
    }


def get_approvals() -> dict[str, Any]:
    snapshot = build_governance_snapshot()
    return {
        "generated_at": snapshot["generated_at"],
        "approvals": snapshot["pending_approvals"],
        "priority_queue": snapshot["priority_queue"],
    }


def approve(approval_id: str) -> dict[str, Any]:
    ops_governance_store.approve(approval_id)
    return build_governance_snapshot()


def reject(approval_id: str) -> dict[str, Any]:
    ops_governance_store.reject(approval_id)
    return build_governance_snapshot()


def delegate(approval_id: str, delegate_to: str) -> dict[str, Any]:
    ops_governance_store.delegate(approval_id, delegate_to)
    return build_governance_snapshot()


def escalate(approval_id: str) -> dict[str, Any]:
    ops_governance_store.escalate(approval_id)
    return build_governance_snapshot()


def get_automation_snapshot() -> dict[str, Any]:
    snapshot = build_governance_snapshot()
    return {
        "generated_at": snapshot["generated_at"],
        "automation": snapshot["automation"],
        "retry_health": snapshot["retry_health"],
        "ledger": snapshot["ledger"],
    }


def run_automation(action_id: str) -> dict[str, Any]:
    ops_governance_store.run_automation(action_id)
    return build_governance_snapshot()


def get_analytics() -> dict[str, Any]:
    snapshot = build_governance_snapshot()
    return {
        "generated_at": snapshot["generated_at"],
        "analytics": snapshot["analytics"],
        "role_workload": snapshot["role_workload"],
        "trust": snapshot["trust"],
    }

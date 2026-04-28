from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ops.executive_store import ops_executive_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


CEO_ACTIONS: list[dict[str, Any]] = [
    {"action_id": "reduce_losses", "label": "Reduce Losses Now", "plan": "Prioritize loss containment, insurance evidence, and asset protection while preserving safety gates.", "confidence": 91},
    {"action_id": "fastest_recovery", "label": "Fastest Recovery", "plan": "Accelerate reopen gates, vendor mobilization, and low-risk auto approvals.", "confidence": 89},
    {"action_id": "protect_reputation", "label": "Protect Reputation", "plan": "Lock public messaging, executive brief cadence, and customer recovery credits.", "confidence": 93},
    {"action_id": "preserve_revenue", "label": "Preserve Revenue", "plan": "Keep unaffected zones operational and stage occupancy return waves.", "confidence": 87},
    {"action_id": "safety_first", "label": "Safety First", "plan": "Maximize evacuation confidence, medical coverage, and conservative reopen gating.", "confidence": 96},
    {"action_id": "cost_defense", "label": "Cost Defense", "plan": "Reduce overtime, optimize resource allocation, and defer noncritical recovery spend.", "confidence": 84},
]


STRATEGY_OPTIONS: list[dict[str, Any]] = [
    {"option_id": "immediate_shutdown", "label": "A. Immediate Shutdown", "cost": "$1.8M", "downtime": "18h", "risk": 18, "recovery_time": "20h", "reputation_impact": "low safety criticism, high revenue hit"},
    {"option_id": "partial_shutdown", "label": "B. Partial Shutdown", "cost": "$620K", "downtime": "6h", "risk": 31, "recovery_time": "8h", "reputation_impact": "balanced public confidence"},
    {"option_id": "continue_controls", "label": "C. Continue With Controls", "cost": "$280K", "downtime": "2h", "risk": 54, "recovery_time": "4h", "reputation_impact": "higher scrutiny if second incident occurs"},
    {"option_id": "mutual_aid_surge", "label": "D. Mutual Aid Surge", "cost": "$840K", "downtime": "5h", "risk": 26, "recovery_time": "5h", "reputation_impact": "strong public safety posture"},
]


def build_executive_snapshot() -> dict[str, Any]:
    state = ops_executive_store.get_state()
    selected_option = next((item for item in STRATEGY_OPTIONS if item["option_id"] == state["simulation"]), STRATEGY_OPTIONS[1])
    selected_action = next((item for item in CEO_ACTIONS if item["action_id"] == state["selected_action"]), CEO_ACTIONS[4])
    return {
        "generated_at": _now_iso(),
        "mode": "demo",
        "readiness_score": 94,
        "active_risks": [
            {"risk_id": "RISK-REPUTATION", "title": "Reputation exposure if guest comms lag", "severity": "high", "owner": "Comms Desk", "mitigation": "Protect Reputation action prepared"},
            {"risk_id": "RISK-REOPEN", "title": "Recovery approval bottleneck", "severity": "medium", "owner": "Executive Liaison", "mitigation": "Delegate reopen gates"},
            {"risk_id": "RISK-PROVIDER", "title": "Webhook relay instability", "severity": "medium", "owner": "Automation Engine", "mitigation": "Switch fallback provider"},
        ],
        "financial_exposure": {"current": "$2.4M", "avoidable": "$1.2M", "burn_rate_per_hour": "$94K", "insured_recovery": "$780K"},
        "reputation_exposure": {"score": 32, "public_risk": "controlled", "media_pressure": "moderate", "customer_confidence": 88},
        "recovery_eta": "6h 20m",
        "teams_utilization": [
            {"team": "Security", "utilization": 82, "status": "watch"},
            {"team": "Medical", "utilization": 61, "status": "healthy"},
            {"team": "Facilities", "utilization": 76, "status": "watch"},
            {"team": "Comms", "utilization": 58, "status": "healthy"},
        ],
        "sla_health": {"success_rate": 91, "breached": 2, "watch": 6, "healthy": 28},
        "ceo_actions": CEO_ACTIONS,
        "selected_action": selected_action,
        "strategy_options": STRATEGY_OPTIONS,
        "selected_simulation": selected_option,
        "execution_tuner": [
            {"lever": "Staffing loads", "current": "82%", "optimized": "68%", "gain": "+14 capacity points"},
            {"lever": "Approval speed", "current": "2m 52s", "optimized": "1m 35s", "gain": "+31% faster"},
            {"lever": "Workflow completion", "current": "74%", "optimized": "88%", "gain": "+14%"},
            {"lever": "Communication success", "current": "97%", "optimized": "99%", "gain": "+2%"},
            {"lever": "Reopen speed", "current": "6h 20m", "optimized": "4h 45m", "gain": "95m saved"},
            {"lever": "Resource costs", "current": "$620K", "optimized": "$510K", "gain": "$110K saved"},
        ],
        "board_summary": {
            "headline": "Sentra stabilized the incident, protected safety, and reduced avoidable losses while preserving executive control.",
            "talking_points": [
                "Crisis detected and routed into governed workflows within seconds.",
                "Communications reached 2,384 people with 97% delivery success.",
                "Recovery plan is 54% complete with reopen gates under governance.",
                "Self-healing actions are protecting uptime and external connectors.",
            ],
            "export_ready": True,
        },
        "demo_story": [
            {"step": 1, "title": "Crisis begins", "metric": "Kitchen Zone B fire detected", "status": "detected"},
            {"step": 2, "title": "Sentra detects issue", "metric": "AI severity 91/100", "status": "scored"},
            {"step": 3, "title": "AI responds", "metric": "Workflow and comms launched", "status": "active"},
            {"step": 4, "title": "Operations stabilize", "metric": "SLA success 91%", "status": "stable"},
            {"step": 5, "title": "Recovery launched", "metric": "54% continuity progress", "status": "recovering"},
            {"step": 6, "title": "Executive metrics improve", "metric": "$1.2M losses reduced", "status": "board-ready"},
        ],
        "trust_ledger": state["ledger"],
        "summary": {
            "operational_readiness": 94,
            "active_risks": 3,
            "financial_exposure": "$2.4M",
            "reputation_score": 68,
            "recovery_eta": "6h 20m",
            "sla_success": 91,
            "board_confidence": 96,
        },
    }


def run_ceo_action(action_id: str | None = None) -> dict[str, Any]:
    ops_executive_store.run_action(action_id or "safety_first")
    return build_executive_snapshot()


def run_strategy_simulation(option_id: str | None = None) -> dict[str, Any]:
    ops_executive_store.simulate(option_id or "partial_shutdown")
    return build_executive_snapshot()


def get_executive_summary() -> dict[str, Any]:
    snapshot = build_executive_snapshot()
    return {"generated_at": snapshot["generated_at"], "board_summary": snapshot["board_summary"], "summary": snapshot["summary"]}


def get_executive_kpis() -> dict[str, Any]:
    snapshot = build_executive_snapshot()
    return {
        "generated_at": snapshot["generated_at"],
        "summary": snapshot["summary"],
        "financial_exposure": snapshot["financial_exposure"],
        "sla_health": snapshot["sla_health"],
    }

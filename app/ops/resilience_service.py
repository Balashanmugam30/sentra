from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ops.resilience_store import ops_resilience_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


SYSTEM_HEALTH: list[dict[str, Any]] = [
    {"module": "Workflow Engine", "status": "healthy", "score": 96, "latency_ms": 142, "owner": "Ops Core"},
    {"module": "Communications OS", "status": "watch", "score": 88, "latency_ms": 410, "owner": "Comms Desk"},
    {"module": "Governance Router", "status": "healthy", "score": 93, "latency_ms": 188, "owner": "Executive Liaison"},
    {"module": "Webhook Relay", "status": "degraded", "score": 74, "latency_ms": 1240, "owner": "Automation Engine"},
    {"module": "Recovery Store", "status": "healthy", "score": 91, "latency_ms": 166, "owner": "Continuity Ops"},
    {"module": "Resource Dispatch", "status": "healthy", "score": 94, "latency_ms": 212, "owner": "Field Ops"},
]


AUTO_HEAL_ACTIONS: list[dict[str, Any]] = [
    {"action_id": "HEAL-WORKFLOW-RESTART", "title": "Restart failed workflow", "target": "Workflow Engine", "risk": "medium", "impact": "Restores stuck playbook execution", "confidence": 94},
    {"action_id": "HEAL-WEBHOOK-RETRY", "title": "Retry webhook with backoff", "target": "Webhook Relay", "risk": "low", "impact": "Recovers external automation delivery", "confidence": 97},
    {"action_id": "HEAL-PROVIDER-SWITCH", "title": "Switch fallback provider", "target": "SMS Provider", "risk": "medium", "impact": "Preserves mass notification delivery", "confidence": 91},
    {"action_id": "HEAL-NOTIFY-REROUTE", "title": "Reroute notifications", "target": "Communications OS", "risk": "low", "impact": "Moves traffic from degraded SMS to in-app + voice", "confidence": 93},
    {"action_id": "HEAL-QUEUE-REBALANCE", "title": "Rebalance queues", "target": "Task Queue", "risk": "medium", "impact": "Prevents queue overflow during crisis surge", "confidence": 89},
    {"action_id": "HEAL-DISABLE-CONNECTOR", "title": "Disable bad connector", "target": "Webhook Relay", "risk": "high", "impact": "Stops retry storm from unstable integration", "confidence": 86},
    {"action_id": "HEAL-ISOLATE-MODULE", "title": "Isolate noisy module", "target": "IoT Feed", "risk": "medium", "impact": "Protects downstream AI and operations state", "confidence": 88},
    {"action_id": "HEAL-CLEAR-CACHE", "title": "Auto clear stale cache", "target": "Runtime Cache", "risk": "low", "impact": "Refreshes stale dashboard state", "confidence": 96},
    {"action_id": "HEAL-REDUCE-POLLING", "title": "Reduce polling load", "target": "Frontend Live Hooks", "risk": "low", "impact": "Prevents client request storms", "confidence": 95},
]


FAILURE_FORECASTS: list[dict[str, Any]] = [
    {"risk_id": "RISK-COMMS-OUTAGE", "title": "Communication outage risk", "risk_score": 38, "eta_to_failure": "42 min", "driver": "SMS latency drift + retry growth", "recommendation": "Shift priority messages to in-app, voice, and n8n webhook."},
    {"risk_id": "RISK-QUEUE-OVERFLOW", "title": "Queue overflow risk", "risk_score": 44, "eta_to_failure": "28 min", "driver": "Escalation queue rising faster than approvals", "recommendation": "Rebalance queues and auto-approve low-risk actions."},
    {"risk_id": "RISK-APPROVAL-BOTTLENECK", "title": "Approval bottleneck risk", "risk_score": 61, "eta_to_failure": "18 min", "driver": "Executive Liaison load at 91%", "recommendation": "Delegate high-risk public alert review to General Manager."},
    {"risk_id": "RISK-OPERATOR-OVERLOAD", "title": "Operator overload risk", "risk_score": 57, "eta_to_failure": "24 min", "driver": "Security Bravo fatigue and task density", "recommendation": "Activate reserve security pool."},
    {"risk_id": "RISK-PROVIDER-DOWNTIME", "title": "Provider downtime risk", "risk_score": 33, "eta_to_failure": "55 min", "driver": "Webhook relay p95 above normal band", "recommendation": "Warm fallback provider and cap retries."},
    {"risk_id": "RISK-CASCADE-DELAY", "title": "Cascading delay risk", "risk_score": 49, "eta_to_failure": "31 min", "driver": "Delayed approvals may slow recovery gates", "recommendation": "Run fastest recovery CEO action if recovery ETA slips."},
]


def _api_failures() -> list[dict[str, Any]]:
    return [
        {"route": "POST /ops/automation/run", "failures": 3, "last_error": "Webhook relay timeout", "owner": "Automation Engine", "status": "retrying"},
        {"route": "POST /ops/communications/send", "failures": 2, "last_error": "SMS provider slow ack", "owner": "Communications OS", "status": "watch"},
        {"route": "GET /iot/fleet", "failures": 1, "last_error": "Stale node heartbeat", "owner": "IoT Intelligence", "status": "isolated"},
    ]


def _timeline(state: dict[str, Any]) -> list[dict[str, Any]]:
    seeded = [
        {"timestamp": _now_iso(), "event": "Circuit breaker armed", "detail": "Webhook relay breaker set to half-open after timeout burst.", "status": "watch"},
        {"timestamp": _now_iso(), "event": "Polling load reduced", "detail": "Noncritical live panels shifted to stale-while-revalidate mode.", "status": "healed"},
        {"timestamp": _now_iso(), "event": "Notification reroute prepared", "detail": "SMS fallback prepared through voice and in-app channels.", "status": "ready"},
    ]
    return [*state["events"], *seeded][-16:]


def build_resilience_snapshot() -> dict[str, Any]:
    state = ops_resilience_store.get_state()
    healed = state["healed_actions"]
    actions = [{**action, "status": "healed" if action["action_id"] in healed else "ready"} for action in AUTO_HEAL_ACTIONS]
    health_score = round(sum(int(item["score"]) for item in SYSTEM_HEALTH) / len(SYSTEM_HEALTH))
    return {
        "generated_at": _now_iso(),
        "mode": "demo",
        "system_health": SYSTEM_HEALTH,
        "api_failures": _api_failures(),
        "queue_pressure": [
            {"queue": "approval_queue", "depth": 27, "pressure": 71, "status": "watch"},
            {"queue": "notification_retry", "depth": 42, "pressure": 64, "status": "watch"},
            {"queue": "workflow_events", "depth": 18, "pressure": 38, "status": "healthy"},
        ],
        "circuit_breakers": [
            {"breaker": "webhook_relay", "state": "half_open", "trip_count": 2, "fallback": "local evidence queue"},
            {"breaker": "sms_provider", "state": "closed", "trip_count": 0, "fallback": "voice mock"},
            {"breaker": "iot_feed", "state": "closed", "trip_count": 0, "fallback": "last known telemetry"},
        ],
        "retry_engine": [
            {"provider": "Webhook Relay", "attempts": 3, "backoff": "30s / 90s / 3m", "success_rate": 91},
            {"provider": "SMS Provider", "attempts": 2, "backoff": "20s / 60s", "success_rate": 94},
            {"provider": "Audit Export", "attempts": 1, "backoff": "15s", "success_rate": 99},
        ],
        "workflow_failures": [
            {"workflow_id": "WF-HOTEL-KITCHEN-FIRE", "task": "Containment verify", "reason": "Camera confidence delayed", "recovery_action": "reroute verification to responder check-in"},
            {"workflow_id": "WF-RECOVERY-HOTEL", "task": "Room reopen waves", "reason": "Approval gate pending", "recovery_action": "delegate executive approval"},
        ],
        "recovery_timeline": _timeline(state),
        "auto_heal_actions": actions,
        "latency_radar": [
            {"service": "Workflow", "p50": 142, "p95": 390, "p99": 620},
            {"service": "Communications", "p50": 410, "p95": 1180, "p99": 1850},
            {"service": "Governance", "p50": 188, "p95": 420, "p99": 760},
            {"service": "Webhook", "p50": 760, "p95": 2100, "p99": 3200},
        ],
        "integration_health": [
            {"integration": "n8n webhook relay", "status": "watch", "uptime": 99.1, "last_recovery": "4 min ago"},
            {"integration": "SMS provider", "status": "healthy", "uptime": 99.5, "last_recovery": "none"},
            {"integration": "IoT bridge", "status": "healthy", "uptime": 99.8, "last_recovery": "18 min ago"},
            {"integration": "Audit export", "status": "healthy", "uptime": 100, "last_recovery": "none"},
        ],
        "failure_forecast": FAILURE_FORECASTS,
        "trust_ledger": _timeline(state),
        "summary": {
            "health_score": health_score,
            "systems_degraded": len([item for item in SYSTEM_HEALTH if item["status"] in {"watch", "degraded"}]),
            "auto_heal_ready": len([item for item in actions if item["status"] == "ready"]),
            "auto_healed": len([item for item in actions if item["status"] == "healed"]),
            "collapse_risk": 41,
            "uptime_protection": "99.95%",
        },
    }


def run_heal(action_id: str | None = None) -> dict[str, Any]:
    selected = action_id or "HEAL-WEBHOOK-RETRY"
    ops_resilience_store.heal(selected)
    return build_resilience_snapshot()


def get_resilience_forecast() -> dict[str, Any]:
    snapshot = build_resilience_snapshot()
    return {"generated_at": snapshot["generated_at"], "failure_forecast": snapshot["failure_forecast"], "summary": snapshot["summary"]}


def get_resilience_events() -> dict[str, Any]:
    snapshot = build_resilience_snapshot()
    return {"generated_at": snapshot["generated_at"], "events": snapshot["recovery_timeline"], "trust_ledger": snapshot["trust_ledger"]}

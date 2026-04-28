import type { OpsResilienceSnapshot, OpsSystemHealthRecord } from "@/lib/ops/types";

export function getHealthTone(record: OpsSystemHealthRecord) {
  if (record.status === "degraded") {
    return "border-rose-300/30 bg-rose-400/10 text-rose-100";
  }
  if (record.status === "watch") {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }
  return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
}

export function buildLocalResilienceSnapshot(): OpsResilienceSnapshot {
  const generatedAt = new Date().toISOString();
  return {
    generated_at: generatedAt,
    mode: "demo",
    system_health: [
      { module: "Workflow Engine", status: "healthy", score: 96, latency_ms: 142, owner: "Ops Core" },
      { module: "Communications OS", status: "watch", score: 88, latency_ms: 410, owner: "Comms Desk" },
      { module: "Webhook Relay", status: "degraded", score: 74, latency_ms: 1240, owner: "Automation Engine" },
    ],
    api_failures: [
      { route: "POST /ops/automation/run", failures: 3, last_error: "Webhook relay timeout", owner: "Automation Engine", status: "retrying" },
    ],
    queue_pressure: [
      { queue: "approval_queue", depth: 27, pressure: 71, status: "watch" },
      { queue: "notification_retry", depth: 42, pressure: 64, status: "watch" },
    ],
    circuit_breakers: [
      { breaker: "webhook_relay", state: "half_open", trip_count: 2, fallback: "local evidence queue" },
    ],
    retry_engine: [
      { provider: "Webhook Relay", attempts: 3, backoff: "30s / 90s / 3m", success_rate: 91 },
    ],
    workflow_failures: [
      { workflow_id: "WF-HOTEL-KITCHEN-FIRE", task: "Containment verify", reason: "Camera confidence delayed", recovery_action: "reroute verification to responder check-in" },
    ],
    recovery_timeline: [
      { timestamp: generatedAt, event: "Polling load reduced", detail: "Noncritical live panels shifted to stale-while-revalidate mode.", status: "healed" },
    ],
    auto_heal_actions: [
      { action_id: "HEAL-WEBHOOK-RETRY", title: "Retry webhook with backoff", target: "Webhook Relay", risk: "low", impact: "Recovers external automation delivery", confidence: 97, status: "ready" },
      { action_id: "HEAL-REDUCE-POLLING", title: "Reduce polling load", target: "Frontend Live Hooks", risk: "low", impact: "Prevents client request storms", confidence: 95, status: "ready" },
    ],
    latency_radar: [
      { service: "Workflow", p50: 142, p95: 390, p99: 620 },
      { service: "Webhook", p50: 760, p95: 2100, p99: 3200 },
    ],
    integration_health: [
      { integration: "n8n webhook relay", status: "watch", uptime: 99.1, last_recovery: "4 min ago" },
      { integration: "SMS provider", status: "healthy", uptime: 99.5, last_recovery: "none" },
    ],
    failure_forecast: [
      { risk_id: "RISK-APPROVAL-BOTTLENECK", title: "Approval bottleneck risk", risk_score: 61, eta_to_failure: "18 min", driver: "Executive Liaison load at 91%", recommendation: "Delegate high-risk public alert review." },
      { risk_id: "RISK-QUEUE-OVERFLOW", title: "Queue overflow risk", risk_score: 44, eta_to_failure: "28 min", driver: "Escalation queue rising", recommendation: "Rebalance queues." },
    ],
    trust_ledger: [
      { timestamp: generatedAt, event: "Resilience local fallback", detail: "Local deterministic resilience state loaded.", status: "verified" },
    ],
    summary: {
      health_score: 86,
      systems_degraded: 2,
      auto_heal_ready: 2,
      auto_healed: 0,
      collapse_risk: 41,
      uptime_protection: "99.95%",
    },
  };
}

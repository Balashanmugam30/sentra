import type { OpsExecutiveSnapshot } from "@/lib/ops/types";

export function buildLocalExecutiveSnapshot(): OpsExecutiveSnapshot {
  const generatedAt = new Date().toISOString();
  const safetyFirstAction = { action_id: "safety_first", label: "Safety First", plan: "Maximize evacuation confidence, medical coverage, and conservative reopen gating.", confidence: 96 };
  const partialShutdownOption = { option_id: "partial_shutdown", label: "B. Partial Shutdown", cost: "$620K", downtime: "6h", risk: 31, recovery_time: "8h", reputation_impact: "balanced public confidence" };
  const ceoActions = [
    { action_id: "reduce_losses", label: "Reduce Losses Now", plan: "Prioritize loss containment, insurance evidence, and asset protection while preserving safety gates.", confidence: 91 },
    { action_id: "fastest_recovery", label: "Fastest Recovery", plan: "Accelerate reopen gates, vendor mobilization, and low-risk auto approvals.", confidence: 89 },
    { action_id: "protect_reputation", label: "Protect Reputation", plan: "Lock public messaging, executive brief cadence, and customer recovery credits.", confidence: 93 },
    safetyFirstAction,
  ];
  const strategyOptions = [
    { option_id: "immediate_shutdown", label: "A. Immediate Shutdown", cost: "$1.8M", downtime: "18h", risk: 18, recovery_time: "20h", reputation_impact: "low safety criticism, high revenue hit" },
    partialShutdownOption,
    { option_id: "continue_controls", label: "C. Continue With Controls", cost: "$280K", downtime: "2h", risk: 54, recovery_time: "4h", reputation_impact: "higher scrutiny if second incident occurs" },
  ];
  return {
    generated_at: generatedAt,
    mode: "demo",
    readiness_score: 94,
    active_risks: [
      { risk_id: "RISK-REPUTATION", title: "Reputation exposure if guest comms lag", severity: "high", owner: "Comms Desk", mitigation: "Protect Reputation action prepared" },
      { risk_id: "RISK-REOPEN", title: "Recovery approval bottleneck", severity: "medium", owner: "Executive Liaison", mitigation: "Delegate reopen gates" },
    ],
    financial_exposure: { current: "$2.4M", avoidable: "$1.2M", burn_rate_per_hour: "$94K", insured_recovery: "$780K" },
    reputation_exposure: { score: 32, public_risk: "controlled", media_pressure: "moderate", customer_confidence: 88 },
    recovery_eta: "6h 20m",
    teams_utilization: [
      { team: "Security", utilization: 82, status: "watch" },
      { team: "Medical", utilization: 61, status: "healthy" },
    ],
    sla_health: { success_rate: 91, breached: 2, watch: 6, healthy: 28 },
    ceo_actions: ceoActions,
    selected_action: safetyFirstAction,
    strategy_options: strategyOptions,
    selected_simulation: partialShutdownOption,
    execution_tuner: [
      { lever: "Staffing loads", current: "82%", optimized: "68%", gain: "+14 capacity points" },
      { lever: "Approval speed", current: "2m 52s", optimized: "1m 35s", gain: "+31% faster" },
      { lever: "Reopen speed", current: "6h 20m", optimized: "4h 45m", gain: "95m saved" },
    ],
    board_summary: {
      headline: "Sentra stabilized the incident, protected safety, and reduced avoidable losses while preserving executive control.",
      talking_points: [
        "Crisis detected and routed into governed workflows within seconds.",
        "Communications reached 2,384 people with 97% delivery success.",
        "Recovery plan is 54% complete with reopen gates under governance.",
      ],
      export_ready: true,
    },
    demo_story: [
      { step: 1, title: "Crisis begins", metric: "Kitchen Zone B fire detected", status: "detected" },
      { step: 2, title: "Sentra detects issue", metric: "AI severity 91/100", status: "scored" },
      { step: 3, title: "Operations stabilize", metric: "SLA success 91%", status: "stable" },
      { step: 4, title: "Executive metrics improve", metric: "$1.2M losses reduced", status: "board-ready" },
    ],
    trust_ledger: [
      { timestamp: generatedAt, event: "Executive local fallback", detail: "Local deterministic executive command state loaded.", status: "verified" },
    ],
    summary: {
      operational_readiness: 94,
      active_risks: 2,
      financial_exposure: "$2.4M",
      reputation_score: 68,
      recovery_eta: "6h 20m",
      sla_success: 91,
      board_confidence: 96,
    },
  };
}

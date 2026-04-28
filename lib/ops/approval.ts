import type { OpsGovernanceApproval, OpsGovernanceSnapshot } from "@/lib/ops/types";

export function getApprovalTone(approval: OpsGovernanceApproval) {
  if (approval.risk_level === "critical") {
    return "border-rose-300/30 bg-rose-400/10 text-rose-100";
  }
  if (approval.risk_level === "high") {
    return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  }
  if (approval.risk_level === "medium") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }
  return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
}

export function routeApproval(actionType: string, riskLevel: string) {
  if (riskLevel === "low" || actionType === "routine_comms" || actionType === "create_ticket") {
    return {
      decision: "auto_approve",
      approver: "Automation Policy",
      rationale: "Low-risk reversible action can execute without adding human delay.",
    };
  }
  if (riskLevel === "medium" || actionType === "unlock_exits") {
    return {
      decision: "manager_approval",
      approver: "Security Manager",
      rationale: "Operational action needs manager review before execution.",
    };
  }
  if (riskLevel === "high" || actionType === "mass_public_alert") {
    return {
      decision: "executive_approval",
      approver: "Executive Liaison",
      rationale: "High-impact action carries reputational or public safety exposure.",
    };
  }
  return {
    decision: "dual_approval",
    approver: "Executive Liaison + Facilities Director",
    rationale: "Critical irreversible action requires two-party governance.",
  };
}

export function buildLocalGovernanceSnapshot(): OpsGovernanceSnapshot {
  const generatedAt = new Date().toISOString();
  const approvals: OpsGovernanceApproval[] = [
    {
      approval_id: "APR-EXIT-002",
      title: "Unlock east stairwell exits",
      action_type: "unlock_exits",
      risk_level: "medium",
      risk_score: 47,
      required_approval: "manager",
      assigned_to: "Security Manager",
      backup_approver: "Ops Alpha",
      sla_minutes: 4,
      pending_minutes: 3,
      sla_remaining_minutes: 1,
      impact: "Accelerates evacuation while preserving access control evidence.",
      evidence: ["Exit B camera clear", "Crowd flow model green", "Fire Agent recommends release"],
      priority_score: 78,
      workflow: "Hotel kitchen fire",
      status: "pending",
      route: routeApproval("unlock_exits", "medium"),
    },
    {
      approval_id: "APR-POWER-003",
      title: "Shutdown basement power segment",
      action_type: "shutdown_power",
      risk_level: "critical",
      risk_score: 91,
      required_approval: "dual",
      assigned_to: "Executive Liaison",
      backup_approver: "Facilities Director",
      sla_minutes: 6,
      pending_minutes: 8,
      sla_remaining_minutes: 0,
      impact: "Reduces ignition risk but may disrupt elevator and ventilation fallback.",
      evidence: ["Gas confidence 88%", "HVAC isolation pending", "Facilities load high"],
      priority_score: 96,
      workflow: "Basement gas leak",
      status: "escalated",
      route: routeApproval("shutdown_power", "critical"),
    },
  ];

  return {
    generated_at: generatedAt,
    mode: "demo",
    scenarios: [
      { scenario_id: "delayed_manager", label: "Delayed manager approval" },
      { scenario_id: "dual_power_shutdown", label: "Dual approval power shutdown" },
      { scenario_id: "webhook_retry", label: "Webhook failure retry" },
      { scenario_id: "executive_surge", label: "Executive surge queue" },
      { scenario_id: "auto_low_risk", label: "Full auto low-risk recovery" },
    ],
    pending_approvals: approvals,
    priority_queue: approvals,
    sla_to_approve: approvals.map((approval) => ({
      approval_id: approval.approval_id,
      title: approval.title,
      remaining_minutes: approval.sla_remaining_minutes,
      status: approval.status === "escalated" ? "breached" : "watch",
      assigned_to: approval.assigned_to,
    })),
    auto_approved_actions: [
      {
        approval_id: "APR-LOW-COMMS-001",
        title: "Routine responder ETA update",
        action_type: "routine_comms",
        risk_level: "low",
        risk_score: 18,
        required_approval: "auto",
        assigned_to: "Automation Policy",
        backup_approver: "Comms Desk",
        sla_minutes: 2,
        pending_minutes: 1,
        sla_remaining_minutes: 1,
        impact: "Keeps occupants informed without public escalation.",
        evidence: ["Council confidence 94%", "Message template approved", "No private data exposed"],
        status: "auto_approved",
        priority_score: 42,
        workflow: "Fire response communications",
        route: routeApproval("routine_comms", "low"),
      },
    ],
    escalated_decisions: [
      {
        escalation_id: "ESC-APR-POWER-003",
        approval_id: "APR-POWER-003",
        title: "Shutdown basement power segment",
        level: 2,
        current_owner: "Executive Liaison",
        next_owner: "Facilities Director",
        reason: "Approval SLA breached",
        fallback: "Manual dual approval required",
      },
    ],
    role_workload: [
      { role: "Security Manager", pending: 3, approvals_per_hour: 11, avg_decision_time: "2m 20s", load: 82, bottleneck: true },
      { role: "Executive Liaison", pending: 5, approvals_per_hour: 7, avg_decision_time: "4m 10s", load: 91, bottleneck: true },
      { role: "Facilities Director", pending: 2, approvals_per_hour: 6, avg_decision_time: "3m 05s", load: 64, bottleneck: false },
    ],
    delegations: [
      { delegation_id: "DEL-001", from: "Executive Liaison", to: "General Manager", coverage: "High-risk public alerts", status: "available", load_delta: "-22%" },
      { delegation_id: "DEL-002", from: "Security Manager", to: "Ops Alpha", coverage: "Exit and perimeter actions", status: "recommended", load_delta: "-18%" },
    ],
    automation: [
      { action_id: "AUTO-SEND-ALERT", title: "Send governed alert", connector: "n8n:webhook:sentra-alert", system: "SMS / Email mock flow", status: "ready", risk_level: "medium", last_attempt: "2 min ago", retries: 0, next_retry: "on failure", fallback: "Switch to local notification queue", success_rate: 98 },
      { action_id: "AUTO-DISPATCH-TEAM", title: "Dispatch backup team", connector: "n8n:webhook:dispatch-team", system: "Operations roster", status: "watch", risk_level: "high", last_attempt: "5 min ago", retries: 1, next_retry: "45 sec", fallback: "Notify Ops Alpha manually", success_rate: 91 },
    ],
    retry_health: [
      { provider: "Primary webhook relay", status: "healthy", queued: 2, failed: 0, p95_latency: "410ms", failover_ready: true },
      { provider: "SMS provider", status: "watch", queued: 7, failed: 1, p95_latency: "1.2s", failover_ready: true },
    ],
    analytics: {
      auto_approval_percent: 38,
      avg_approval_time: "2m 52s",
      escalations_avoided: 14,
      workflows_completed: 27,
      governance_efficiency: 91,
      response_acceleration: "+31%",
    },
    trust: {
      decisions_governed: 184,
      unsafe_actions_blocked: 9,
      audit_completeness: "100%",
      trust_score: 94,
      autonomy_maturity: "Governed semi-auto",
    },
    evidence: [
      { evidence_id: "EVD-001", title: "Approval route matrix", source: "Smart Approval Router", completeness: 100, hash: "EVD-ROUTE-9F3A" },
      { evidence_id: "EVD-002", title: "Webhook retry transcript", source: "Automation Engine", completeness: 96, hash: "EVD-RETRY-74B1" },
    ],
    ledger: [
      {
        timestamp: generatedAt,
        event: "Governance OS local fallback",
        detail: "Local deterministic approval and automation state loaded.",
        status: "verified",
      },
    ],
    summary: {
      pending_count: approvals.length,
      critical_count: 1,
      approved_count: 1,
      automation_ready: 1,
      escalation_count: 1,
    },
  };
}

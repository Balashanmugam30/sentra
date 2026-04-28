import type { OpsRecoverySnapshot } from "@/lib/ops/types";

export function getRecoveryTone(status: string) {
  if (status === "awaiting_approval" || status === "blocked") {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }
  if (status === "running" || status === "ready") {
    return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
  }
  return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
}

export function buildLocalRecoverySnapshot(): OpsRecoverySnapshot {
  const generatedAt = new Date().toISOString();
  const tasks = [
    { task_id: "REC-FLOOR-CLEAR", title: "Clear floor", owner: "Security Bravo", stage: "hazard_clearance", status: "running", progress: 74, approval_required: false },
    { task_id: "REC-HVAC", title: "HVAC inspect", owner: "Facilities Rapid Team", stage: "utilities_restore", status: "running", progress: 61, approval_required: false },
    { task_id: "REC-ROOM-WAVE", title: "Room reopen waves", owner: "Executive Liaison", stage: "reopen_checklist", status: "awaiting_approval", progress: 35, approval_required: true },
    { task_id: "REC-PR", title: "PR brief", owner: "Comms Desk", stage: "compliance_checks", status: "awaiting_approval", progress: 45, approval_required: true },
  ];
  return {
    generated_at: generatedAt,
    mode: "demo",
    scenario: "hotel_fire_recovery",
    scenarios: [
      { scenario_id: "hotel_fire_recovery", label: "Hotel fire recovery" },
      { scenario_id: "hospital_incident", label: "Hospital incident" },
      { scenario_id: "mall_surge", label: "Mall surge recovery" },
    ],
    damage_assessment: [
      { area: "Kitchen Zone B", damage: "smoke + suppression water", severity: "high", estimated_loss: "$180K", clearance_eta: "4h" },
      { area: "Floor 3 East corridor", damage: "light smoke exposure", severity: "medium", estimated_loss: "$42K", clearance_eta: "90m" },
    ],
    tasks,
    hazard_clearance: tasks.filter((task) => task.stage === "hazard_clearance"),
    utilities_restore: tasks.filter((task) => task.stage === "utilities_restore"),
    compliance_checks: tasks.filter((task) => task.stage === "compliance_checks"),
    reopen_checklist: [
      { gate_id: "REOPEN-ZONE", title: "Zone reopen", required_for: "Affected floor", risk: "medium", status: "ready", evidence: "Hazard and utility evidence attached." },
      { gate_id: "REOPEN-BUILDING", title: "Full building reopen", required_for: "Executive reopening", risk: "high", status: "blocked", evidence: "Awaiting room wave approval." },
    ],
    insurance_tasks: [],
    vendor_coordination: [
      { vendor_id: "vendor_restorepro", name: "RestorePro Water Cleanup", scope: "water cleanup", eta: "42 min", status: "mobilized", confidence: 91 },
      { vendor_id: "vendor_airsafe", name: "AirSafe HVAC", scope: "HVAC inspection", eta: "25 min", status: "on site", confidence: 94 },
    ],
    occupancy_return_plan: [
      { wave: "Wave 1", scope: "Lobby and unaffected public zones", capacity: 380, eta: "45 min", status: "ready" },
      { wave: "Wave 2", scope: "Floor 1-2 guest rooms", capacity: 620, eta: "2h", status: "pending utilities" },
    ],
    ledger: [
      { timestamp: generatedAt, event: "Recovery Continuity local fallback", detail: "Local deterministic recovery state loaded.", status: "verified" },
    ],
    kpis: {
      time_to_contain: "18 min",
      time_to_reopen: "6h 20m",
      losses_reduced: "$1.2M",
      continuity_score: 94,
      readiness_score: 92,
      recovery_progress: 54,
      rooms_reopenable: 1420,
      vendors_active: 2,
    },
    summary: {
      active_tasks: 4,
      awaiting_approval: 2,
      reopen_gates_ready: 1,
      progress: 54,
    },
  };
}

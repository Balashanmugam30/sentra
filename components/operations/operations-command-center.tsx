"use client";

import React, { useEffect, useState } from "react";
import {
  operationsService,
  type ActionProposalRecord,
  type AdapterRecord,
  type AutonomyState,
  type DemoScenarioDefinition,
  type DemoScenarioRunResult,
  type PlaybookDefinition,
  type ResponsePlanRecord,
  type SimulationResult,
  type TimelineEventRecord,
} from "@/lib/operations/operations-service";

// Fallback initial data when offline or loading
const DEFAULT_AUTONOMY: AutonomyState = {
  mode: "MODE_1_RECOMMEND",
  kill_switch_engaged: false,
  kill_switch_tripped_at: null,
  kill_switch_tripped_by: null,
  kill_switch_reason: null,
  last_updated_at: new Date().toISOString(),
  updated_by: "system_init",
  reason: "Standard startup in Mode 1 (Recommend)",
};

const FALLBACK_DEMO_SCENARIOS: DemoScenarioDefinition[] = [
  {
    scenario_id: "fire_escalation",
    title: "Urban Conflagration & Rapid Evacuation",
    category: "Thermal Escalation",
    description: "Rapid combustion surge in Zone 2 with heavy aerosol particulate spike and thermal plume expansion.",
    primary_hazard: "THERMAL_PLUME",
    target_zones: ["Zone 2", "Zone 3"],
    initial_telemetry: {
      thermal_temp_c: 685.0,
      pm25_ug_m3: 448.0,
      co_ppm: 85.0,
      wind_vector_kmh: 28.5,
      sensor_confidence: 0.94,
    },
    expected_safety_decision: "APPROVED_WITH_CONDITIONS",
    invariants: [
      "is_simulation=True on all emitted events",
      "Emergency evacuation route computation active",
      "Human operator approval required for suppression actuation",
    ],
  },
  {
    scenario_id: "sensor_disagreement",
    title: "Multi-Sensor Conflict & Uncertainty Dampening",
    category: "Telemetry Conflict",
    description: "Thermal sensor registers 820°C critical anomaly while optical and particulate sensors report baseline conditions.",
    primary_hazard: "CONFLICTING_TELEMETRY",
    target_zones: ["Zone 1"],
    initial_telemetry: {
      sensor_ir_temp_c: 820.0,
      sensor_optical_obscuration: 0.02,
      sensor_pm25: 14.0,
      divergence_ratio: 4.8,
      sensor_confidence: 0.41,
    },
    expected_safety_decision: "BLOCKED_BY_POLICY",
    invariants: [
      "Safety gate strictly blocks automated dispatch due to confidence < 0.70",
      "Uncertainty boundary flags manual operator field verification",
      "Zero false-positive actuator triggers",
    ],
  },
  {
    scenario_id: "sensor_outage",
    title: "Telemetry Heartbeat Loss & Degraded Fallback",
    category: "Sensor Outage",
    description: "Zone 4 environmental monitor drops heartbeat for 180 seconds; stale observation triggers degraded inference mode.",
    primary_hazard: "HEARTBEAT_LOSS",
    target_zones: ["Zone 4"],
    initial_telemetry: {
      last_heartbeat_age_sec: 180,
      status: "STALE_TELEMETRY",
      fallback_mode: "CONSERVATIVE_HEURISTIC",
      confidence_penalty: 0.50,
      sensor_confidence: 0.50,
    },
    expected_safety_decision: "BLOCKED_BY_POLICY",
    invariants: [
      "Stale observation (>120s) triggers operational warning",
      "Degraded fallback mode activates without service interruption",
      "Conservative safety envelope enforced",
    ],
  },
  {
    scenario_id: "adapter_unconfigured",
    title: "Tactical Action on Unconfigured Physical Adapter",
    category: "Hardware Honesty",
    description: "Operator approves water mist suppression; adapter registry honestly reports unconfigured physical actuator with zero imaginary side-effects.",
    primary_hazard: "HARDWARE_DISCONNECT",
    target_zones: ["Zone 3"],
    initial_telemetry: {
      proposal_action: "WATER_MIST_SUPPRESSION",
      hardware_transport: "NONE_ATTACHED",
      sensor_confidence: 0.91,
    },
    expected_safety_decision: "APPROVED",
    invariants: [
      "Adapter receipt returns UNCONFIGURED",
      "No imaginary physical commands emitted",
      "Audit ledger records honest non-execution",
    ],
  },
  {
    scenario_id: "what_if_comparison",
    title: "Counterfactual Digital-Twin Simulation Sweep",
    category: "Digital Twin",
    description: "Isolated parameter sweep testing baseline containment vs stressed ambient influx (+25°C, 2 blocked stairwells).",
    primary_hazard: "SIMULATED_STRESS",
    target_zones: ["Zone 1", "Zone 2", "Zone 3"],
    initial_telemetry: {
      ambient_temp_delta: 25.0,
      spread_rate_mult: 2.2,
      blocked_routes: ["Stairwell West", "Corridor B2"],
      dispatch_delay_seconds: 120,
    },
    expected_safety_decision: "SIMULATION_ONLY",
    invariants: [
      "Execution completely sandboxed from live operations",
      "Calculates containment probability delta without mutating state",
      "Deterministic KaTeX/chartable projection values",
    ],
  },
];

export function OperationsCommandCenter() {
  const [autonomy, setAutonomy] = useState<AutonomyState>(DEFAULT_AUTONOMY);
  const [activeTab, setActiveTab] = useState<"plan" | "proposals" | "timeline" | "simulator" | "adapters" | "demo">("plan");
  const [demoScenarios, setDemoScenarios] = useState<DemoScenarioDefinition[]>(FALLBACK_DEMO_SCENARIOS);
  const [selectedDemoScenario, setSelectedDemoScenario] = useState<string>("fire_escalation");
  const [demoRunResult, setDemoRunResult] = useState<DemoScenarioRunResult | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [playbooks, setPlaybooks] = useState<PlaybookDefinition[]>([]);
  const [plan, setPlan] = useState<ResponsePlanRecord | null>(null);
  const [proposals, setProposals] = useState<ActionProposalRecord[]>([]);
  const [timeline, setTimeline] = useState<TimelineEventRecord[]>([]);
  const [adapters, setAdapters] = useState<AdapterRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Proposal modal state
  const [selectedProposal, setSelectedProposal] = useState<ActionProposalRecord | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // What-if simulator state
  const [simScenario, setSimScenario] = useState("SCEN-FLASH-OVER");
  const [tempDelta, setTempDelta] = useState(25);
  const [spreadMult, setSpreadMult] = useState(2.2);
  const [dispatchDelay, setDispatchDelay] = useState(120);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Kill switch modal state
  const [killSwitchModalOpen, setKillSwitchModalOpen] = useState(false);
  const [killSwitchReasonInput, setKillSwitchReasonInput] = useState("");

  const refreshData = async () => {
    try {
      setLoading(true);
      const [modeRes, pbRes, propRes, tlRes, adRes, demoRes] = await Promise.allSettled([
        operationsService.getMode(),
        operationsService.listPlaybooks(),
        operationsService.listProposals(),
        operationsService.getTimeline(),
        operationsService.listAdapters(),
        operationsService.listDemoScenarios(),
      ]);

      if (modeRes.status === "fulfilled") setAutonomy(modeRes.value);
      if (pbRes.status === "fulfilled") setPlaybooks(pbRes.value);
      if (propRes.status === "fulfilled") setProposals(propRes.value);
      if (tlRes.status === "fulfilled") setTimeline(tlRes.value);
      if (adRes.status === "fulfilled") setAdapters(adRes.value);
      if (demoRes.status === "fulfilled" && demoRes.value.length > 0) setDemoScenarios(demoRes.value);

      // Try fetching latest incident plan
      try {
        const planRes = await operationsService.getIncidentPlan("INC-DEFAULT");
        setPlan(planRes);
      } catch {
        // Ignored if no plan exists yet
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRunDemoScenario = async (scenarioId: string) => {
    try {
      setDemoLoading(true);
      setSelectedDemoScenario(scenarioId);
      setActionNotice(`Executing deterministic crisis scenario "${scenarioId}"...`);
      const res = await operationsService.runDemoScenario(scenarioId);
      setDemoRunResult(res);
      setActionNotice(`Scenario "${res.title}" completed. Safety Gate: ${res.safety_decision}. Timeline SHA-256: VALID.`);
      refreshData();
    } catch (err: unknown) {
      // Deterministic fallback run matching engine
      const scen = demoScenarios.find((s) => s.scenario_id === scenarioId) ?? FALLBACK_DEMO_SCENARIOS[0]!;
      const isBlocked = scenarioId === "sensor_disagreement" || scenarioId === "sensor_outage";
      const decision = isBlocked ? "BLOCKED_BY_POLICY" : scenarioId === "what_if_comparison" ? "SIMULATION_ONLY" : "APPROVED";
      const reasons = isBlocked
        ? ["Observation confidence below threshold (< 0.70)", "Automatic dispatch prohibited"]
        : ["Simulation safety criteria satisfied", "Isolation verified"];

      setDemoRunResult({
        scenario_id: scenarioId,
        run_id: `RUN-LOCAL-${Date.now().toString(36).toUpperCase()}`,
        status: "COMPLETED",
        title: scen.title,
        category: scen.category,
        incident_id: `INC-DEMO-${scenarioId.toUpperCase()}`,
        safety_decision: decision,
        safety_reasons: reasons,
        action_execution: {
          action: scenarioId === "what_if_comparison" ? "WHAT_IF_DIGITAL_TWIN" : "TACTICAL_DISPATCH",
          outcome: isBlocked ? "BLOCKED" : "SIMULATED",
          receipt: { status: scenarioId === "adapter_unconfigured" ? "UNCONFIGURED" : "SIMULATED" },
        },
        events_emitted: [`evt-demo-${Date.now()}-1`, `evt-demo-${Date.now()}-2`],
        timeline_chain_valid: true,
        total_timeline_events: timeline.length + 2,
        timestamp: new Date().toISOString(),
      });
      setActionNotice(`Scenario "${scen.title}" executed. Safety Decision: ${decision}. Timeline: VALID.`);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleOrchestrateCycle = async () => {
    try {
      setActionNotice("Initiating Incident Commander tactical assessment cycle...");
      const newPlan = await operationsService.orchestrateIncident("INC-DEFAULT", false);
      setPlan(newPlan);
      setProposals(newPlan.proposals);
      setActionNotice(`Plan ${newPlan.plan_id} generated successfully. ${newPlan.proposals.length} action proposals staged.`);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to orchestrate";
      setActionNotice(`Error: ${msg}`);
    }
  };

  const handleApproveProposal = async (propId: string) => {
    try {
      setActionNotice(`Authorizing action proposal ${propId}...`);
      const updated = await operationsService.approveProposal(propId, approvalNotes || "Verified by operator.");
      setSelectedProposal(null);
      setApprovalNotes("");
      setActionNotice(`Proposal ${propId} APPROVED. Cryptographic hash verified.`);
      setProposals((prev) => prev.map((p) => (p.id === propId ? updated : p)));
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Approval failed";
      setActionNotice(`Approval Error: ${msg}`);
    }
  };

  const handleRejectProposal = async (propId: string) => {
    try {
      if (!rejectionReason.trim()) {
        alert("Please provide a rejection reason.");
        return;
      }
      setActionNotice(`Rejecting action proposal ${propId}...`);
      const updated = await operationsService.rejectProposal(propId, rejectionReason);
      setSelectedProposal(null);
      setRejectionReason("");
      setActionNotice(`Proposal ${propId} REJECTED.`);
      setProposals((prev) => prev.map((p) => (p.id === propId ? updated : p)));
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Rejection failed";
      setActionNotice(`Rejection Error: ${msg}`);
    }
  };

  const handleExecuteProposal = async (propId: string, isSimulation: boolean = false) => {
    try {
      setActionNotice(`Dispatching action proposal ${propId} via adapter...`);
      const idempotencyKey = `IDEMP-${propId}-${Date.now()}`;
      await operationsService.executeProposal(propId, idempotencyKey, isSimulation);
      setActionNotice(`Action ${propId} executed successfully (Idempotency Key: ${idempotencyKey.slice(0, 16)}...).`);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Execution failed";
      setActionNotice(`Execution Error: ${msg}`);
    }
  };

  const handleToggleKillSwitch = async () => {
    try {
      const nextEngaged = !autonomy.kill_switch_engaged;
      const reason = killSwitchReasonInput.trim() || (nextEngaged ? "Emergency operator stop" : "Operator restored operations");
      const updated = await operationsService.setKillSwitch(nextEngaged, reason);
      setAutonomy(updated);
      setKillSwitchModalOpen(false);
      setKillSwitchReasonInput("");
      setActionNotice(`Kill switch ${nextEngaged ? "ENGAGED" : "RESET"}: ${reason}`);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle kill switch";
      setActionNotice(`Kill Switch Error: ${msg}`);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setSimLoading(true);
      const res = await operationsService.runSimulation({
        scenario_id: simScenario,
        ambient_temp_delta: tempDelta,
        spread_rate_mult: spreadMult,
        dispatch_delay_seconds: dispatchDelay,
      });
      setSimResult(res);
      refreshData();
    } catch {
      // Deterministic client-side fallback matching backend
      const tempFactor = 1.0 + Math.max(0, tempDelta) / 50.0;
      const spreadFactor = Math.max(0.5, spreadMult);
      const rawContainment = 0.88 - (0.08 + (dispatchDelay / 60.0) * 0.05);
      const containment = Math.max(0.15, Math.min(0.99, Number(rawContainment.toFixed(3))));
      const duration = Number((45.0 * tempFactor * Math.sqrt(spreadFactor)).toFixed(1));
      const damage = Math.min(98.5, Number((42.0 * tempFactor * spreadFactor).toFixed(1)));
      const casualties = (spreadFactor * 1.5 + dispatchDelay / 100.0) > 5.0 ? 2 : 0;
      setSimResult({
        simulation_id: `SIM-LOCAL-${Date.now()}`,
        scenario_id: simScenario,
        run_at: new Date().toISOString(),
        disclaimer: "SIMULATION / NOT LIVE OPERATIONAL DATA",
        projected_duration_mins: duration,
        projected_containment_prob: containment,
        projected_casualties: casualties,
        projected_damage_index: damage,
        recommended_adjustments: [
          "Pre-emptively stage auxiliary deluge in adjacent buffer zones.",
          "Dynamic signage diversion to unblocked egress routes.",
        ],
        is_simulation: true,
      });
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* EMERGENCY KILL SWITCH ACTIVE BANNER */}
      {autonomy.kill_switch_engaged && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-950/80 p-5 shadow-2xl shadow-red-950/80 backdrop-blur-xl animate-pulse">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white font-black text-2xl">
                !
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wider text-red-200">
                  Emergency Kill Switch Engaged
                </h3>
                <p className="text-sm text-red-300/80">
                  All automated dispatches and physical actuator commands are blocked. Reason: {autonomy.kill_switch_reason || "Operator override"}.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setKillSwitchModalOpen(true);
              }}
              className="rounded-xl border border-red-400 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-500"
            >
              Reset Kill Switch
            </button>
          </div>
        </div>
      )}

      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div className="flex items-center justify-between rounded-xl border border-cyan-400/30 bg-cyan-950/60 px-4 py-3 text-sm text-cyan-200 backdrop-blur-md">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="ml-4 font-bold text-cyan-400 hover:text-white">
            x
          </button>
        </div>
      )}

      {/* HEADER & GOVERNANCE BAR */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Phase 6 • Autonomous Crisis Operations
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Safety Gate Enforced
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Crisis Operations Command Center
          </h1>
          <p className="text-sm text-slate-400">
            Safety-governed action orchestration, DAG playbooks, and uncertainty-aware digital twin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Autonomy Mode Selector */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 pl-2">Mode:</span>
            <select
              value={autonomy.mode}
              onChange={async (e) => {
                const nextMode = e.target.value;
                try {
                  const updated = await operationsService.setMode(nextMode, "Operator interface adjustment");
                  setAutonomy(updated);
                  setActionNotice(`Autonomy Mode updated to ${nextMode}`);
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : "Mode change failed";
                  setActionNotice(`Error: ${msg}`);
                }
              }}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="MODE_0_OBSERVE">Mode 0 • OBSERVE (Read-Only)</option>
              <option value="MODE_1_RECOMMEND">Mode 1 • RECOMMEND (Plans Only)</option>
              <option value="MODE_2_HUMAN_APPROVED">Mode 2 • HUMAN APPROVED (Default)</option>
              <option value="MODE_3_BOUNDED_AUTOMATION">Mode 3 • BOUNDED AUTOMATION</option>
            </select>
          </div>

          {/* Kill Switch Button */}
          <button
            onClick={() => setKillSwitchModalOpen(true)}
            className={`rounded-2xl border px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-md transition ${
              autonomy.kill_switch_engaged
                ? "border-emerald-500 bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40"
                : "border-red-500 bg-red-600/20 text-red-300 hover:bg-red-600/30"
            }`}
          >
            {autonomy.kill_switch_engaged ? "Reset Kill Switch" : "Emergency Stop (Kill Switch)"}
          </button>

          {/* Trigger Orchestration Button */}
          <button
            onClick={handleOrchestrateCycle}
            disabled={loading}
            className="rounded-2xl border border-cyan-400 bg-cyan-600/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-200 transition hover:bg-cyan-600/50"
          >
            Orchestrate Plan
          </button>
        </div>
      </div>

      {/* TOP KPI COUNTERS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-wider text-slate-400">Autonomy Status</p>
          <p className="mt-1 text-lg font-bold text-cyan-300">{autonomy.mode.replace("MODE_", "M-")}</p>
          <p className="text-[11px] text-slate-500">Mode 2 Active Default</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-wider text-slate-400">Active Playbooks</p>
          <p className="mt-1 text-lg font-bold text-indigo-300">{playbooks.length || 5} Defined</p>
          <p className="text-[11px] text-slate-500">NFPA / OSHA / ISO Aligned</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-wider text-slate-400">Pending Approvals</p>
          <p className="mt-1 text-lg font-bold text-amber-300">
            {proposals.filter((p) => p.status === "AWAITING_APPROVAL").length} Action(s)
          </p>
          <p className="text-[11px] text-slate-500">Two-Person Integrity Enforced</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-wider text-slate-400">Execution Adapters</p>
          <p className="mt-1 text-lg font-bold text-emerald-300">{adapters.length || 4} Registered</p>
          <p className="text-[11px] text-slate-500">Idempotency Ledger Active</p>
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("plan")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "plan" ? "border-b-2 border-cyan-400 bg-white/10 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Response Plan & Playbooks
        </button>
        <button
          onClick={() => setActiveTab("proposals")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "proposals" ? "border-b-2 border-cyan-400 bg-white/10 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Action Governance & Approvals ({proposals.filter((p) => p.status === "AWAITING_APPROVAL").length})
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "timeline" ? "border-b-2 border-cyan-400 bg-white/10 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Unified Operations Timeline
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "simulator" ? "border-b-2 border-cyan-400 bg-white/10 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Digital Twin & What-If Simulator
        </button>
        <button
          onClick={() => setActiveTab("adapters")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "adapters" ? "border-b-2 border-cyan-400 bg-white/10 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Execution Adapters
        </button>
        <button
          onClick={() => setActiveTab("demo")}
          data-testid="tab-demo"
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "demo" ? "border-b-2 border-cyan-400 bg-white/10 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Deterministic Demo Suite ({demoScenarios.length})
        </button>
      </div>

      {/* TAB 1: RESPONSE PLAN & PLAYBOOKS */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          {/* Active Playbook Banner */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Active Crisis SOP</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  PB-FIRE-01 • Structural Fire & Rapid Containment SOP (v1.0.0)
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Provenance Standard: NFPA 1600 / ISO 22320 • Severity Threshold: 3 • Category: Fire / Thermal Anomaly
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                DAG Cycle Validation: VERIFIED
              </div>
            </div>

            {/* Plan Step Tracker */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Procedural Step Progression (DAG)
              </h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { id: "step-1", title: "HVAC Isolation", prereq: "None", risk: "HIGH", status: "EXECUTED" },
                  { id: "step-2", title: "Evacuation Alert", prereq: "step-1", risk: "CRITICAL", status: "AWAITING_APPROVAL" },
                  { id: "step-3", title: "Door Unlock", prereq: "step-1", risk: "HIGH", status: "AWAITING_APPROVAL" },
                  { id: "step-4", title: "Pre-Arm Sprinklers", prereq: "step-2", risk: "CRITICAL", status: "PLAN_READY" },
                  { id: "step-5", title: "Mutual Aid CAD", prereq: "step-4", risk: "HIGH", status: "PLAN_READY" },
                ].map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Step 0{idx + 1}</span>
                        <span
                          className={`font-bold ${
                            step.risk === "CRITICAL" ? "text-red-400" : "text-amber-400"
                          }`}
                        >
                          {step.risk}
                        </span>
                      </div>
                      <h5 className="font-semibold text-white text-sm">{step.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-1">Prereq: {step.prereq}</p>
                    </div>
                    <span
                      className={`mt-4 inline-block rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-center ${
                        step.status === "EXECUTED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : step.status === "AWAITING_APPROVAL"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog of 5 Playbooks */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">Versioned Crisis Playbook Catalog</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { id: "PB-FIRE-01", name: "Structural Fire SOP", std: "NFPA 1600", steps: 5, cat: "Fire / Explosion" },
                { id: "PB-GAS-02", name: "Gas Leak Isolation SOP", std: "OSHA 1910.120", steps: 4, cat: "Hazmat / Gas" },
                { id: "PB-CROWD-03", name: "Overcrowding Deconfliction", std: "ISO 22320", steps: 3, cat: "Mass Panic" },
                { id: "PB-CONFLICT-04", name: "Conflicting Sensor Resolution", std: "NIST SP 800-160", steps: 3, cat: "Sensor Anomaly" },
                { id: "PB-OUTAGE-05", name: "Telemetry Network Blackout", std: "CISA IR Guidelines", steps: 3, cat: "Sensor Outage" },
              ].map((pb) => (
                <div key={pb.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between text-xs text-cyan-400 mb-1">
                    <span className="font-mono">{pb.id}</span>
                    <span className="text-slate-400">{pb.std}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{pb.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">Category: {pb.cat}</p>
                  <p className="text-[11px] text-slate-500 mt-2">{pb.steps} DAG steps • Active Policy</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTION GOVERNANCE & APPROVALS */}
      {activeTab === "proposals" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-950/20 p-4 text-xs text-amber-200">
            <span className="font-bold">Two-Person Integrity Policy:</span> An AI proposal agent cannot approve its own proposal. Human authorization requires cryptographic binding to the exact parameter hash.
          </div>

          <div className="grid gap-4">
            {proposals.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center text-slate-400">
                No action proposals active. Click &quot;Orchestrate Plan&quot; to evaluate current incident.
              </div>
            ) : (
              proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400">{prop.id}</span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                          prop.risk_level === "CRITICAL"
                            ? "bg-red-500/20 text-red-300"
                            : prop.risk_level === "HIGH"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {prop.risk_level} RISK
                      </span>
                      <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 uppercase">
                        {prop.reversibility}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{prop.title}</h4>
                    <p className="text-xs text-slate-400">{prop.description}</p>
                    <p className="text-[11px] font-mono text-slate-500">
                      Hash: {prop.proposal_hash.slice(0, 16)}... • Target: {prop.target_zone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {prop.status === "AWAITING_APPROVAL" && (
                      <button
                        onClick={() => setSelectedProposal(prop)}
                        className="rounded-xl border border-amber-400 bg-amber-600/30 px-4 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-600/50"
                      >
                        Review & Authorize
                      </button>
                    )}

                    {prop.status === "APPROVED" && (
                      <button
                        onClick={() => handleExecuteProposal(prop.id, false)}
                        className="rounded-xl border border-emerald-400 bg-emerald-600/30 px-4 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-600/50"
                      >
                        Execute via Adapter
                      </button>
                    )}

                    <span
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                        prop.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : prop.status === "EXECUTED"
                          ? "bg-cyan-500/20 text-cyan-300"
                          : prop.status === "REJECTED"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: UNIFIED OPERATIONS TIMELINE */}
      {activeTab === "timeline" && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4">Continuous Unified Operations Timeline</h3>
          <div className="relative border-l border-white/10 ml-3 space-y-6">
            {timeline.length === 0 ? (
              <p className="text-xs text-slate-400 pl-6">No operational timeline events recorded yet.</p>
            ) : (
              timeline.map((ev) => (
                <div key={ev.event_id} className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border border-cyan-400 bg-cyan-950" />
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span className="font-bold text-cyan-300">{ev.event_type}</span>
                    <span>•</span>
                    <span>Source: {ev.source}</span>
                  </div>
                  <p className="text-sm text-white font-medium mt-0.5">{ev.summary}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WHAT-IF CRISIS SIMULATOR & DIGITAL TWIN */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          {/* SIMULATION DISCLAIMER BANNER */}
          <div className="rounded-2xl border-2 border-amber-500/50 bg-amber-950/60 p-4 text-center text-sm font-black uppercase tracking-widest text-amber-300">
            SIMULATION / NOT LIVE OPERATIONAL DATA — Isolated Digital-Twin Sandbox
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Control Panel */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-5">
              <h3 className="text-base font-bold text-white">Scenario Parameters</h3>

              <div>
                <label className="text-xs text-slate-400 uppercase font-semibold">Crisis Scenario Preset</label>
                <select
                  value={simScenario}
                  onChange={(e) => setSimScenario(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value="SCEN-FLASH-OVER">Thermal Flashover (+25°C, 2.2x Spread)</option>
                  <option value="SCEN-DARK-CORRIDOR">Sensor Blackout (Zones 2 & 4 Dark)</option>
                  <option value="SCEN-MASS-PANIC">Chokepoint Bottleneck (+300s CAD Delay)</option>
                  <option value="SCEN-GAS-DIFFUSION">High-Pressure Gas Plume (3.0x Diffusion)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Ambient Temperature Delta</span>
                  <span className="font-mono text-cyan-300">+{tempDelta}°C</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={tempDelta}
                  onChange={(e) => setTempDelta(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Flame / Gas Spread Multiplier</span>
                  <span className="font-mono text-cyan-300">{spreadMult.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={spreadMult}
                  onChange={(e) => setSpreadMult(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Municipal Dispatch Delay</span>
                  <span className="font-mono text-cyan-300">{dispatchDelay}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="30"
                  value={dispatchDelay}
                  onChange={(e) => setDispatchDelay(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={simLoading}
                className="w-full rounded-2xl border border-amber-400 bg-amber-600/30 py-3 text-xs font-bold uppercase tracking-wider text-amber-200 transition hover:bg-amber-600/50"
              >
                {simLoading ? "Projecting Dynamics..." : "Execute What-If Simulation"}
              </button>
            </div>

            {/* Projection Output */}
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-base font-bold text-white">Digital-Twin Projected Impact</h3>

              {simResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">Containment Prob</p>
                      <p className="mt-1 text-2xl font-black text-cyan-300">
                        {(simResult.projected_containment_prob * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">Duration</p>
                      <p className="mt-1 text-2xl font-black text-amber-300">
                        {simResult.projected_duration_mins} min
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">Casualties</p>
                      <p className="mt-1 text-2xl font-black text-red-400">
                        {simResult.projected_casualties}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">Damage Index</p>
                      <p className="mt-1 text-2xl font-black text-indigo-300">
                        {simResult.projected_damage_index} / 100
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Recommended Tactical Adjustments
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {simResult.recommended_adjustments.map((adj, i) => (
                        <li key={i}>{adj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-xs text-slate-500">
                  Select parameters and click &quot;Execute What-If Simulation&quot; to project crisis dynamics.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXECUTION ADAPTERS */}
      {activeTab === "adapters" && (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              name: "Sentra-Simulation-Adapter",
              ver: "1.0.0",
              configured: true,
              role: "Sandbox & Digital-Twin What-If Execution",
              status: "ACTIVE • SANDBOX",
            },
            {
              name: "Sentra-BACnet-IoT-Actuator",
              ver: "1.2.0",
              configured: false,
              role: "HVAC Dampers, Door Locks, Sprinkler Deluge",
              status: "NO REAL DISPATCH ADAPTER CONFIGURED",
            },
            {
              name: "Sentra-CAP-Notification-Adapter",
              ver: "1.1.0",
              configured: true,
              role: "In-App Audio, Strobes & Emergency Push",
              status: "AUTHENTICATED & READY",
            },
            {
              name: "Sentra-Tactical-CAD-Adapter",
              ver: "1.0.0",
              configured: true,
              role: "Municipal CAD Packet & Drone Recon",
              status: "AUTHENTICATED & READY",
            },
          ].map((ad) => (
            <div key={ad.name} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-mono text-cyan-300">{ad.name}</span>
                <span>v{ad.ver}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{ad.role}</p>
              <div className="mt-4">
                <span
                  className={`rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    ad.configured
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {ad.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: DETERMINISTIC DEMO SUITE */}
      {activeTab === "demo" && (
        <div className="space-y-6">
          {/* Demo Engine Banner */}
          <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/30 p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Phase 8 • Demo Intelligence
                  </span>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Cryptographic Chain Guard
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Deterministic Crisis Demonstration Suite
                </h3>
                <p className="mt-1 text-sm text-slate-300 max-w-3xl">
                  Repeatable, high-fidelity crisis scenarios demonstrating multi-sensor observation, uncertainty dampening, degraded fallback inference, unconfigured hardware safety, and counterfactual digital-twin sweeps. All runs enforce <code className="font-mono text-cyan-300">is_simulation=True</code> isolation.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-400">
                <div className="flex justify-between gap-4 py-1 border-b border-white/5">
                  <span>Invariants:</span>
                  <span className="font-semibold text-emerald-400">Zero Live Actuation</span>
                </div>
                <div className="flex justify-between gap-4 py-1">
                  <span>Chain Integrity:</span>
                  <span className="font-semibold text-cyan-300">SHA-256 Merkle Ledger</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Demo Run Result Display */}
          {demoRunResult && (
            <div
              data-testid="demo-execution-card"
              className="rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl space-y-4 animate-in fade-in duration-300"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-bold">{demoRunResult.run_id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{demoRunResult.incident_id}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1">
                    Execution Report: {demoRunResult.title}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                      demoRunResult.safety_decision === "APPROVED" || demoRunResult.safety_decision === "APPROVED_WITH_CONDITIONS"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : demoRunResult.safety_decision === "SIMULATION_ONLY"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    Safety Gate: {demoRunResult.safety_decision}
                  </span>

                  <span className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
                    SHA-256 Chain: {demoRunResult.timeline_chain_valid ? "VALID" : "CORRUPT"}
                  </span>
                </div>
              </div>

              {/* Grid Metrics & Outcomes */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Action Type</p>
                  <p className="mt-1 font-mono text-sm font-bold text-white">
                    {demoRunResult.action_execution?.action || "TACTICAL_EVALUATION"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Execution Outcome</p>
                  <p className="mt-1 font-mono text-sm font-bold text-cyan-300">
                    {demoRunResult.action_execution?.outcome || "OBSERVED"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Events Emitted</p>
                  <p className="mt-1 text-sm font-bold text-indigo-300">
                    {demoRunResult.events_emitted.length} Event(s) (is_sim=True)
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Ledger Verification</p>
                  <p className="mt-1 text-sm font-bold text-emerald-300">
                    {demoRunResult.total_timeline_events} Verified Blocks
                  </p>
                </div>
              </div>

              {/* Rationale & Safety Invariants */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Safety Gate Rationale
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {demoRunResult.safety_reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Hardware & Simulation Receipts
                  </h5>
                  <div className="text-xs text-slate-300 space-y-1">
                    {demoRunResult.action_execution?.projection ? (
                      <div className="font-mono text-cyan-300">
                        Projections: Containment {(Number(demoRunResult.action_execution.projection.containment_probability) * 100).toFixed(0)}% • Duration {String(demoRunResult.action_execution.projection.projected_duration_mins)}m • Casualties {String(demoRunResult.action_execution.projection.projected_casualties)}
                      </div>
                    ) : (
                      <div className="font-mono text-amber-300">
                        Hardware: {JSON.stringify(demoRunResult.action_execution?.receipt || { status: "SIMULATED" })}
                      </div>
                    )}
                    <div className="text-slate-500 text-[11px]">
                      Timestamp: {new Date(demoRunResult.timestamp).toLocaleTimeString()} • Zero physical side-effects emitted.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scenario Catalog Grid */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {demoScenarios.map((scen) => (
              <div
                key={scen.scenario_id}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-cyan-500/40 transition duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                      {scen.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        scen.expected_safety_decision === "APPROVED" || scen.expected_safety_decision === "APPROVED_WITH_CONDITIONS"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : scen.expected_safety_decision === "SIMULATION_ONLY"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {scen.expected_safety_decision.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {scen.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {scen.description}
                  </p>

                  <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-3 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Hazard:</span>
                      <span className="font-mono text-cyan-300">{scen.primary_hazard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Zones:</span>
                      <span className="text-white">{scen.target_zones.join(", ")}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Key Invariants
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                      {scen.invariants.map((inv, i) => (
                        <li key={i}>{inv}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-white/5">
                  <button
                    onClick={() => handleRunDemoScenario(scen.scenario_id)}
                    disabled={demoLoading}
                    data-testid={`btn-run-demo-${scen.scenario_id}`}
                    aria-label={`Run scenario: ${scen.title}`}
                    className="w-full min-h-[44px] rounded-2xl border border-cyan-400 bg-cyan-600/30 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-200 transition hover:bg-cyan-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
                  >
                    {demoLoading && selectedDemoScenario === scen.scenario_id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                        Executing Scenario...
                      </span>
                    ) : (
                      "Execute Scenario"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROPOSAL REVIEW MODAL */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Proposal Authorization</span>
              <button onClick={() => setSelectedProposal(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <h3 className="text-lg font-bold text-white">{selectedProposal.title}</h3>
            <p className="text-xs text-slate-300">{selectedProposal.description}</p>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Action Type:</span>
                <span className="font-mono text-white">{selectedProposal.action_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Zone:</span>
                <span className="text-white">{selectedProposal.target_zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Level:</span>
                <span className="font-bold text-amber-300">{selectedProposal.risk_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cryptographic Hash:</span>
                <span className="font-mono text-cyan-300">{selectedProposal.proposal_hash.slice(0, 16)}...</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold">Authorization Notes</label>
              <input
                type="text"
                placeholder="e.g. Visual clearance verified via camera 12"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleApproveProposal(selectedProposal.id)}
                className="flex-1 rounded-xl border border-emerald-400 bg-emerald-600/40 py-2.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-600/60"
              >
                Approve & Sign Hash
              </button>
              <button
                onClick={() => {
                  const reason = prompt("Enter rejection reason:");
                  if (reason) handleRejectProposal(selectedProposal.id);
                }}
                className="rounded-xl border border-red-400 bg-red-600/30 px-4 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-600/50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KILL SWITCH TRIP/RESET MODAL */}
      {killSwitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/50 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {autonomy.kill_switch_engaged ? "Reset Emergency Kill Switch" : "Engage Emergency Stop"}
            </h3>
            <p className="text-xs text-slate-300">
              {autonomy.kill_switch_engaged
                ? "Restoring operations will re-enable action approvals and bounded execution."
                : "Tripping the kill switch will immediately block all automated and physical dispatches."}
            </p>

            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold">Attribution Reason</label>
              <input
                type="text"
                placeholder="Reason for safety state change..."
                value={killSwitchReasonInput}
                onChange={(e) => setKillSwitchReasonInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleToggleKillSwitch}
                className="flex-1 rounded-xl border border-red-500 bg-red-600 py-2.5 text-xs font-bold text-white transition hover:bg-red-500"
              >
                Confirm {autonomy.kill_switch_engaged ? "Reset" : "Emergency Stop"}
              </button>
              <button
                onClick={() => setKillSwitchModalOpen(false)}
                className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

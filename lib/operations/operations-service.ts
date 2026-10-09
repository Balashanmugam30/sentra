/**
 * Client-side service for Phase 6 Autonomous Crisis Operations API.
 */

export interface AutonomyState {
  mode: "MODE_0_OBSERVE" | "MODE_1_RECOMMEND" | "MODE_2_HUMAN_APPROVED" | "MODE_3_BOUNDED_AUTOMATION";
  kill_switch_engaged: boolean;
  kill_switch_tripped_at: string | null;
  kill_switch_tripped_by: string | null;
  kill_switch_reason: string | null;
  last_updated_at: string;
  updated_by: string;
  reason: string;
}

export interface PlaybookStepDefinition {
  step_id: string;
  title: string;
  description: string;
  action_type: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reversibility: "REVERSIBLE" | "PARTIALLY_REVERSIBLE" | "IRREVERSIBLE";
  required_role: string;
  requires_human_approval: boolean;
  prerequisites: string[];
  timeout_seconds: number;
}

export interface PlaybookDefinition {
  id: string;
  name: string;
  version: string;
  status: string;
  description: string;
  applicable_categories: string[];
  severity_threshold: number;
  steps: PlaybookStepDefinition[];
  provenance_standard: string;
  safety_constraints: string[];
}

export interface ActionProposalRecord {
  id: string;
  incident_id: string;
  tenant_id: string;
  title: string;
  description: string;
  action_type: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reversibility: "REVERSIBLE" | "PARTIALLY_REVERSIBLE" | "IRREVERSIBLE";
  target_zone: string;
  parameters: Record<string, unknown>;
  proposal_hash: string;
  created_at: string;
  expires_at: string;
  status: "OPEN" | "ASSESSING" | "PLAN_READY" | "AWAITING_APPROVAL" | "APPROVED" | "EXECUTING" | "EXECUTED" | "FAILED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  proposer_id: string;
  proposer_role: string;
  safety_decision: string;
  safety_reasons: string[];
  approved_by: string | null;
  approved_at: string | null;
  approval_hash: string | null;
  rejection_reason: string | null;
  execution_outcome: string | null;
  adapter_name: string | null;
}

export interface ResponsePlanRecord {
  plan_id: string;
  incident_id: string;
  tenant_id: string;
  playbook_id: string;
  playbook_version: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  steps: Array<{
    step_id: string;
    title: string;
    action_type: string;
    risk_level: string;
    status: string;
    proposal_id: string | null;
    requires_approval: boolean;
  }>;
  proposals: ActionProposalRecord[];
  rationale: string;
  uncertainty_notes: string[];
  confidence_score: number;
}

export interface TimelineEventRecord {
  event_id: string;
  incident_id: string;
  timestamp: string;
  event_type: string;
  source: string;
  actor_id: string;
  actor_role: string;
  summary: string;
  details: Record<string, unknown>;
  is_simulation: boolean;
}

export interface SimulationResult {
  simulation_id: string;
  scenario_id: string;
  run_at: string;
  disclaimer: string;
  projected_duration_mins: number;
  projected_containment_prob: number;
  projected_casualties: number;
  projected_damage_index: number;
  recommended_adjustments: string[];
  is_simulation: boolean;
}

export interface AdapterRecord {
  name: string;
  version: string;
  configured: boolean;
  authenticated: boolean;
  is_simulation: boolean;
  supported_actions: string[];
}

export interface DemoScenarioDefinition {
  scenario_id: string;
  title: string;
  category: string;
  description: string;
  primary_hazard: string;
  target_zones: string[];
  initial_telemetry: Record<string, unknown>;
  expected_safety_decision: string;
  invariants: string[];
}

export interface DemoScenarioRunResult {
  scenario_id: string;
  run_id: string;
  status: string;
  title: string;
  category: string;
  incident_id: string;
  safety_decision: string;
  safety_reasons: string[];
  action_execution: {
    action: string;
    outcome: string;
    proposal_id?: string;
    target_zone?: string;
    receipt?: Record<string, unknown>;
    projection?: Record<string, unknown>;
  } | null;
  events_emitted: string[];
  timeline_chain_valid: boolean;
  total_timeline_events: number;
  timestamp: string;
}

const API_BASE = "/api/v1/operations";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("sentra_access_token") : null;
  const headers = new Headers(options?.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }
  return res.json() as Promise<T>;
}

export const operationsService = {
  async getReadiness() {
    return fetchJson<{ status: string; phase: number; active_playbooks_count: number }>(`${API_BASE}/readiness`);
  },

  async getMode(): Promise<AutonomyState> {
    return fetchJson<AutonomyState>(`${API_BASE}/mode`);
  },

  async setMode(mode: string, reason: string): Promise<AutonomyState> {
    return fetchJson<AutonomyState>(`${API_BASE}/mode`, {
      method: "POST",
      body: JSON.stringify({ mode, reason }),
    });
  },

  async setKillSwitch(engaged: boolean, reason: string): Promise<AutonomyState> {
    return fetchJson<AutonomyState>(`${API_BASE}/kill-switch`, {
      method: "POST",
      body: JSON.stringify({ engaged, reason }),
    });
  },

  async listPlaybooks(): Promise<PlaybookDefinition[]> {
    return fetchJson<PlaybookDefinition[]>(`${API_BASE}/playbooks`);
  },

  async orchestrateIncident(incidentId: string, simulated: boolean = false): Promise<ResponsePlanRecord> {
    return fetchJson<ResponsePlanRecord>(`${API_BASE}/incidents/${incidentId}/orchestrate`, {
      method: "POST",
      body: JSON.stringify({ simulated }),
    });
  },

  async getIncidentPlan(incidentId: string): Promise<ResponsePlanRecord> {
    return fetchJson<ResponsePlanRecord>(`${API_BASE}/incidents/${incidentId}/plan`);
  },

  async listProposals(incidentId?: string): Promise<ActionProposalRecord[]> {
    const query = incidentId ? `?incident_id=${incidentId}` : "";
    return fetchJson<ActionProposalRecord[]>(`${API_BASE}/proposals${query}`);
  },

  async approveProposal(proposalId: string, notes?: string): Promise<ActionProposalRecord> {
    return fetchJson<ActionProposalRecord>(`${API_BASE}/proposals/${proposalId}/approve`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  },

  async rejectProposal(proposalId: string, rejection_reason: string): Promise<ActionProposalRecord> {
    return fetchJson<ActionProposalRecord>(`${API_BASE}/proposals/${proposalId}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejection_reason }),
    });
  },

  async executeProposal(proposalId: string, idempotencyKey: string, isSimulation: boolean = false): Promise<unknown> {
    return fetchJson(`${API_BASE}/proposals/${proposalId}/execute`, {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        is_simulation: isSimulation,
      }),
    });
  },

  async getTimeline(incidentId?: string): Promise<TimelineEventRecord[]> {
    const url = incidentId ? `${API_BASE}/incidents/${incidentId}/timeline` : `${API_BASE}/timeline`;
    return fetchJson<TimelineEventRecord[]>(url);
  },

  async listAdapters(): Promise<AdapterRecord[]> {
    return fetchJson<AdapterRecord[]>(`${API_BASE}/adapters`);
  },

  async runSimulation(payload: {
    scenario_id?: string;
    ambient_temp_delta?: number;
    spread_rate_mult?: number;
    dispatch_delay_seconds?: number;
    sensor_outage_zones?: string[];
    blocked_routes?: string[];
  }): Promise<SimulationResult> {
    return fetchJson<SimulationResult>(`${API_BASE}/simulations/run`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async listDemoScenarios(): Promise<DemoScenarioDefinition[]> {
    return fetchJson<DemoScenarioDefinition[]>(`${API_BASE}/demo/scenarios`);
  },

  async runDemoScenario(scenarioId: string): Promise<DemoScenarioRunResult> {
    return fetchJson<DemoScenarioRunResult>(`${API_BASE}/demo/run`, {
      method: "POST",
      body: JSON.stringify({ scenario_id: scenarioId }),
    });
  },
};

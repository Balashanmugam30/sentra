import { apiClient } from "@/lib/core/api-client";

export type DecisionScenario = {
  scenario_id: string;
  name: string;
  environment_id: string;
  primary_zone: string;
  hazard: string;
  panic_level: number;
  crowd_density: number;
  fire_smoke_gas_risk: number;
  blocked_exits: number;
  vulnerable_people: number;
  responder_availability: number;
  compliance_score: number;
  time_pressure: number;
  financial_exposure: number;
  reputation_exposure: number;
};

export type RecommendedAction = {
  action_id: string;
  title: string;
  rank: number;
  urgency: string;
  confidence: number;
  expected_outcome: string;
  owner: string;
};

export type StrategyOption = {
  strategy: string;
  casualty_risk: number;
  evac_time_minutes: number;
  panic_probability: number;
  trust_impact: number;
  financial_damage: number;
  reputation_impact: number;
  score: number;
};

export type ApprovalItem = {
  approval_id: string;
  tenant_id: string;
  action: string;
  risk: string;
  approver: string;
  sla_minutes: number;
  status: string;
  scenario: string;
};

export type DecisionSnapshot = {
  generated_at: string;
  scenario: DecisionScenario;
  live_human_risk_score: number;
  urgency: string;
  recommended_actions: RecommendedAction[];
  panic_containment_plan: string[];
  crowd_split_strategy: {
    split_required: boolean;
    primary_flow: string;
    secondary_flow: string;
    ratio: string;
    reason: string;
  };
  zone_messaging_orders: Array<{
    zone: string;
    tone: string;
    message: string;
    confidence: number;
  }>;
  exit_control_decisions: Array<{
    exit: string;
    decision: string;
    pressure: number;
    why: string;
  }>;
  response_timeline: Array<{
    minute: string;
    decision: string;
    confidence: number;
  }>;
  confidence_meter: {
    overall: number;
    sensor_quality: number;
    crowd_model: number;
    human_compliance: number;
    commander_review_required: boolean;
  };
  approval_queue: ApprovalItem[];
  override_options: string[];
  expected_outcome: {
    panic_reduction_percent: number;
    stampede_risk_reduction_percent: number;
    compliance_gain_percent: number;
    evacuation_time_saved_minutes: number;
  };
};

export type StrategySnapshot = {
  generated_at: string;
  scenario: string;
  strategies: StrategyOption[];
  winner: StrategyOption;
  why_winner_selected: string;
};

export type MessageSnapshot = {
  generated_at: string;
  scenario: string;
  recommended_tone: string;
  announcement: string;
  strict_tone: string;
  urgency_tone: string;
  multilingual: string[];
  why: string;
};

export type ApprovalSnapshot = {
  generated_at: string;
  pending: ApprovalItem[];
  total_pending: number;
  highest_priority: string;
  governance_mode: string;
};

export type TrustSnapshot = {
  overall_trust: number;
  obey_probability: number;
  delay_probability: number;
  override_risk: number;
  trust_drivers: string[];
};

export type DecisionMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export function scoreHumanDecision(input: Pick<DecisionScenario, "panic_level" | "crowd_density" | "fire_smoke_gas_risk" | "blocked_exits" | "time_pressure" | "vulnerable_people" | "compliance_score">) {
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        input.panic_level * 0.22 +
          input.crowd_density * 0.18 +
          input.fire_smoke_gas_risk * 0.2 +
          input.blocked_exits * 7 +
          input.time_pressure * 0.18 +
          input.vulnerable_people * 0.035 +
          (100 - input.compliance_score) * 0.12,
      ),
    ),
  );
}

export function chooseMessageTone(panicLevel: number, complianceScore: number) {
  if (panicLevel >= 78 && complianceScore < 62) {
    return "authority tone";
  }
  if (panicLevel >= 66) {
    return "calm urgency tone";
  }
  return "calm tone";
}

export function shouldSplitCrowd(density: number, blockedExits: number) {
  return density >= 76 || blockedExits > 0;
}

export const fallbackDecision: DecisionSnapshot = {
  generated_at: "2026-04-26T00:00:00.000Z",
  scenario: {
    scenario_id: "DEC-STADIUM-RUSH",
    name: "Stadium Exit Rush",
    environment_id: "CROWD-STADIUM-GATE",
    primary_zone: "Stadium Gate A",
    hazard: "crowd_surge",
    panic_level: 84,
    crowd_density: 94,
    fire_smoke_gas_risk: 28,
    blocked_exits: 0,
    vulnerable_people: 220,
    responder_availability: 65,
    compliance_score: 54,
    time_pressure: 91,
    financial_exposure: 980000,
    reputation_exposure: 88,
  },
  live_human_risk_score: 66,
  urgency: "high",
  recommended_actions: [
    { action_id: "ACT-PANIC-CONTAIN", title: "Contain panic with authoritative calm instructions", rank: 1, urgency: "high", confidence: 89, expected_outcome: "panic probability reduced within 90 seconds", owner: "Communications Lead" },
    { action_id: "ACT-SPLIT-FLOW", title: "Split crowd flow across secondary exits", rank: 2, urgency: "high", confidence: 91, expected_outcome: "corridor pressure reduced by 18-27%", owner: "Floor Marshals" },
    { action_id: "ACT-RESPONDER-FIRST", title: "Send responders first to Stadium Gate A", rank: 3, urgency: "high", confidence: 84, expected_outcome: "visible leadership raises compliance and protects vulnerable occupants", owner: "Responder Team" },
    { action_id: "ACT-ASSISTANCE-LANE", title: "Reserve assisted evacuation lane", rank: 4, urgency: "high", confidence: 85, expected_outcome: "special assistance queue stabilizes before bottleneck creation", owner: "Medical and Security" },
  ],
  panic_containment_plan: [
    "Switch all displays to one route instruction per zone",
    "Deploy visible staff marshals at convergence points",
    "Repeat calm authority message every 45 seconds",
    "Suppress conflicting local announcements",
  ],
  crowd_split_strategy: {
    split_required: true,
    primary_flow: "East Flow Gate",
    secondary_flow: "North Ramp",
    ratio: "60/40",
    reason: "Density and corridor pressure exceed safe single-exit flow thresholds.",
  },
  zone_messaging_orders: [
    { zone: "Stadium Gate A", tone: "authority tone", message: "Move calmly in controlled lines. Follow Sentra staff to the marked alternate route. Do not push.", confidence: 91 },
    { zone: "Secondary exits", tone: "directional authority", message: "Follow green arrows. Keep moving in two lines. Do not return for belongings.", confidence: 88 },
  ],
  exit_control_decisions: [
    { exit: "East Flow Gate", decision: "open and meter", pressure: 97, why: "divert 22% flow to alternate exit" },
    { exit: "North Ramp", decision: "open and meter", pressure: 83, why: "maintain metered flow" },
  ],
  response_timeline: [
    { minute: "0-1", decision: "broadcast optimized message and freeze conflicting audio", confidence: 93 },
    { minute: "1-3", decision: "split crowd and deploy responders to visible leadership points", confidence: 89 },
    { minute: "3-8", decision: "meter stairwell load and prioritize vulnerable occupants", confidence: 86 },
    { minute: "8-20", decision: "verify exit pressure and update re-entry posture", confidence: 82 },
  ],
  confidence_meter: { overall: 82, sensor_quality: 92, crowd_model: 84, human_compliance: 54, commander_review_required: false },
  approval_queue: [
    { approval_id: "APPROVE-HUMAN-001", tenant_id: "TEN-GRAND-MERIDIAN", action: "Split crowd between East Flow Gate and South Ramp", risk: "high", approver: "Operations Commander", sla_minutes: 2, status: "pending", scenario: "Stadium Exit Rush" },
  ],
  override_options: ["switch to full evacuation", "lockdown high-risk zone", "shelter vulnerable occupants", "pause autonomous messages"],
  expected_outcome: { panic_reduction_percent: 24, stampede_risk_reduction_percent: 31, compliance_gain_percent: 17, evacuation_time_saved_minutes: 7 },
};

export const fallbackStrategy: StrategySnapshot = {
  generated_at: fallbackDecision.generated_at,
  scenario: "Stadium Exit Rush",
  strategies: [
    { strategy: "Full evacuation", casualty_risk: 12, evac_time_minutes: 24, panic_probability: 72, trust_impact: 74, financial_damage: 980000, reputation_impact: 92, score: 57 },
    { strategy: "Partial corridor evacuation", casualty_risk: 16, evac_time_minutes: 18, panic_probability: 57, trust_impact: 82, financial_damage: 627200, reputation_impact: 81, score: 69 },
    { strategy: "Shelter in place", casualty_risk: 22, evac_time_minutes: 38, panic_probability: 63, trust_impact: 70, financial_damage: 411600, reputation_impact: 90, score: 52 },
    { strategy: "Zone lockdown", casualty_risk: 37, evac_time_minutes: 31, panic_probability: 70, trust_impact: 66, financial_damage: 568400, reputation_impact: 96, score: 42 },
    { strategy: "Guided phased evacuation", casualty_risk: 12, evac_time_minutes: 16, panic_probability: 44, trust_impact: 90, financial_damage: 490000, reputation_impact: 76, score: 79 },
  ],
  winner: { strategy: "Guided phased evacuation", casualty_risk: 12, evac_time_minutes: 16, panic_probability: 44, trust_impact: 90, financial_damage: 490000, reputation_impact: 76, score: 79 },
  why_winner_selected: "Selected by minimizing panic and casualty risk while preserving route trust and evacuation speed.",
};

export const fallbackMessages: MessageSnapshot = {
  generated_at: fallbackDecision.generated_at,
  scenario: "Stadium Exit Rush",
  recommended_tone: "authority tone",
  announcement: "Please move calmly. Follow Sentra staff to the marked alternate route. Do not push. Stadium Gate A is being opened in controlled waves.",
  strict_tone: "Move now in controlled lines. Follow Sentra staff to the marked alternate route. Do not push. Stadium Gate A is being opened in controlled waves.",
  urgency_tone: "Proceed now, calmly to the marked alternate route. Do not push. Stadium Gate A is being opened in controlled waves.",
  multilingual: ["English", "Hindi", "Tamil", "Arabic"],
  why: "Message selected from panic, compliance, hazard type, and crowd-density pressure.",
};

export const fallbackApproval: ApprovalSnapshot = {
  generated_at: fallbackDecision.generated_at,
  pending: fallbackDecision.approval_queue,
  total_pending: 1,
  highest_priority: "Split crowd between East Flow Gate and South Ramp",
  governance_mode: "approval_required",
};

export function getDecision() {
  return apiClient.requestData<{ data: DecisionSnapshot }>("/behavior/decision", {
    priority: "high",
    cacheTtlMs: 8_000,
  });
}

export function getStrategy() {
  return apiClient.requestData<{ data: StrategySnapshot }>("/behavior/strategy", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getMessages() {
  return apiClient.requestData<{ data: MessageSnapshot }>("/behavior/messages", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getApprovalQueue() {
  return apiClient.requestData<{ data: ApprovalSnapshot }>("/behavior/approval", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function runDecisionEngine(scenario = "DEC-STADIUM-RUSH") {
  return apiClient.requestData<DecisionMutationResponse>("/behavior/run", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function approveDecision(approval_id = "APPROVE-HUMAN-001") {
  return apiClient.requestData<DecisionMutationResponse>("/behavior/approve", {
    method: "POST",
    body: { approval_id },
    priority: "high",
  });
}

export function overrideDecision(reason = "commander changed intervention posture") {
  return apiClient.requestData<DecisionMutationResponse>("/behavior/override", {
    method: "POST",
    body: { reason },
    priority: "high",
  });
}

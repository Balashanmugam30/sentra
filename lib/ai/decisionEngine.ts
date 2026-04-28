import { buildDecisionConfidence } from "@/lib/ai/confidence";
import { buildDecisionForecast } from "@/lib/ai/forecast";
import { compareDecisionStrategies } from "@/lib/ai/strategies";
import type {
  AIDecisionAction,
  AIDecisionIncident,
  AIDecisionResponse,
  AIDecisionResources,
  AIDecisionScores,
} from "@/lib/ai/types";

export const decisionScenarioMap: Record<string, AIDecisionIncident> = {
  hotel_kitchen_fire: {
    label: "Hotel kitchen fire",
    incident_type: "fire",
    building: "Grand Meridian Hotel",
    zone: "Kitchen Zone B",
    floor: "3",
    building_type: "hotel",
    occupancy: 428,
    responders_eta_minutes: 2,
    blocked_exits: ["West service corridor"],
    signals: ["flame_detected", "smoke_confidence_72", "gas_elevated", "camera_validation_requested"],
    node_health: 88,
    camera_confidence: 81,
    weather: "clear",
    time_of_day: "evening dinner rush",
    prior_incidents: 2,
  },
  basement_gas_leak: {
    label: "Basement gas leak",
    incident_type: "gas",
    building: "Grand Meridian Hotel",
    zone: "Basement generator bay",
    floor: "B1",
    building_type: "hotel",
    occupancy: 96,
    responders_eta_minutes: 4,
    blocked_exits: [],
    signals: ["gas_danger", "temperature_rising", "ventilation_warning"],
    node_health: 79,
    camera_confidence: 68,
    weather: "humid",
    time_of_day: "late night",
    prior_incidents: 1,
  },
  hospital_oxygen_leak: {
    label: "Hospital oxygen leak",
    incident_type: "medical_infra",
    building: "Bala Hospital",
    zone: "ICU oxygen manifold",
    floor: "2",
    building_type: "hospital",
    occupancy: 612,
    responders_eta_minutes: 3,
    blocked_exits: ["Service lift bank"],
    signals: ["oxygen_pressure_drop", "panic_button", "staff_escalation", "camera_visibility_clear"],
    node_health: 91,
    camera_confidence: 84,
    weather: "clear",
    time_of_day: "day shift",
    prior_incidents: 0,
  },
  mall_crowd_surge: {
    label: "Mall crowd surge",
    incident_type: "crowd",
    building: "Metro Mall",
    zone: "Main atrium",
    floor: "G",
    building_type: "mall",
    occupancy: 2400,
    responders_eta_minutes: 5,
    blocked_exits: ["North escalator"],
    signals: ["crowd_density_86", "queue_congestion_78", "panic_cluster"],
    node_health: 86,
    camera_confidence: 89,
    weather: "rain outside",
    time_of_day: "weekend peak",
    prior_incidents: 3,
  },
  power_outage_blockage: {
    label: "Power outage + blockage",
    incident_type: "utility",
    building: "Bala University",
    zone: "Engineering block",
    floor: "5",
    building_type: "university",
    occupancy: 780,
    responders_eta_minutes: 6,
    blocked_exits: ["Stairwell A", "Elevator bank"],
    signals: ["power_failure", "blocked_exit", "backup_lighting_degraded"],
    node_health: 73,
    camera_confidence: 72,
    weather: "storm warning",
    time_of_day: "class changeover",
    prior_incidents: 1,
  },
  false_alarm_validation: {
    label: "False alarm validation",
    incident_type: "validation",
    building: "Grand Meridian Hotel",
    zone: "Laundry utility",
    floor: "2",
    building_type: "hotel",
    occupancy: 88,
    responders_eta_minutes: 2,
    blocked_exits: [],
    signals: ["single_smoke_sensor", "camera_clear", "node_health_good"],
    node_health: 94,
    camera_confidence: 93,
    weather: "clear",
    time_of_day: "midday",
    prior_incidents: 0,
  },
};

function scoreIncident(incident: AIDecisionIncident): AIDecisionScores {
  const signals = new Set(incident.signals);
  let severity = 34;
  if (["fire", "gas", "medical_infra"].includes(incident.incident_type)) {
    severity += 28;
  }
  if (signals.has("flame_detected") || signals.has("gas_danger") || signals.has("oxygen_pressure_drop")) {
    severity += 18;
  }
  if (incident.occupancy >= 400) {
    severity += 12;
  }
  severity += incident.blocked_exits.length * 7;
  if (incident.responders_eta_minutes > 4) {
    severity += 5;
  }
  const severityScore = Math.min(100, severity);
  return {
    severity_score: severityScore,
    escalation_risk: Math.min(100, severityScore - 8 + incident.blocked_exits.length * 7 + incident.prior_incidents * 3),
    people_impact_score: Math.min(100, Math.round(incident.occupancy / 30) + incident.blocked_exits.length * 12 + 18),
    business_impact_score: Math.min(100, 48 + (incident.building_type === "hotel" || incident.building_type === "hospital" ? 18 : 10) + incident.prior_incidents * 4),
    urgency_level: severityScore >= 82 ? "critical" : severityScore >= 64 ? "high" : "watch",
  };
}

function buildActions(incident: AIDecisionIncident, strategyName: string): AIDecisionAction[] {
  const actions = [
    ["Trigger evacuation alarm", `Activate floor ${incident.floor} alarm and route signage`, "automation", 96],
    ["Dispatch responders", `Send 2 responders to ${incident.zone}`, "human", 93],
    ["Lock elevators", "Hold elevators outside affected floor", "facility", 89],
    ["Open safest stairwell route", "Route occupants away from blocked exits", "routing", 87],
    ["Notify external agency", "Prepare fire/medical escalation packet", "comms", 84],
    ["Request camera validation", "Capture public corridor verification snapshot", "vision", 81],
  ] as const;
  return actions.map(([title, detail, owner, priority], index) => ({
    rank: index + 1,
    title,
    detail,
    owner,
    priority,
    strategy_dependency: strategyName,
  }));
}

function buildResources(incident: AIDecisionIncident, scores: AIDecisionScores): AIDecisionResources {
  return {
    responders_needed: scores.severity_score >= 82 ? 4 : 2,
    medics_needed: scores.people_impact_score >= 40 ? 2 : 1,
    security_needed: incident.incident_type === "crowd" || incident.incident_type === "fire" ? 3 : 1,
    route_marshals_needed: incident.occupancy >= 400 ? 6 : 2,
    external_agency_required: scores.severity_score >= 78,
    resource_summary: "Prioritize responders, route marshals, and external escalation readiness.",
  };
}

export function runLocalDecisionEngine(scenarioId = "hotel_kitchen_fire"): AIDecisionResponse {
  const incident = decisionScenarioMap[scenarioId] ?? decisionScenarioMap.hotel_kitchen_fire;
  if (!incident) {
    throw new Error("AI decision scenario seed is unavailable.");
  }
  const scores = scoreIncident(incident);
  const strategies = compareDecisionStrategies(incident, scores);
  const recommendedStrategy = strategies[0];
  if (!recommendedStrategy) {
    throw new Error("AI decision strategy model returned no candidates.");
  }
  const confidence = buildDecisionConfidence(incident, recommendedStrategy);
  return {
    generated_at: new Date().toISOString(),
    scenario_id: scenarioId,
    active_incident: incident,
    scores,
    recommended_strategy: recommendedStrategy,
    strategies,
    actions: buildActions(incident, recommendedStrategy.name),
    explainability: [
      `Signals considered: ${incident.signals.join(", ")}.`,
      `Occupancy ${incident.occupancy} and blocked exits ${incident.blocked_exits.length} raise people-impact risk.`,
      `Responder ETA ${incident.responders_eta_minutes}m makes ${recommendedStrategy.name} the best strategy.`,
    ],
    confidence,
    forecast: buildDecisionForecast(incident, scores),
    resources: buildResources(incident, scores),
    executive_summary: `${incident.zone} ${incident.incident_type} risk detected at ${incident.building}. Severity ${scores.severity_score}/100 with escalation risk ${scores.escalation_risk}/100. Recommend ${recommendedStrategy.name.toLowerCase()}.`,
  };
}

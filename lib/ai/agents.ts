import type { AIDecisionIncident, AIDecisionScores, CouncilSpecialistAgent } from "@/lib/ai/types";

const agentProfiles = [
  {
    agent_id: "fire_agent",
    name: "Fire Agent",
    domain: "Fire containment",
    avatar: "F",
    priority: "containment",
    color: "red",
    historical_accuracy: 94,
    trust_score: 91,
    override_rate: 8,
    speed_score: 96,
    confidence_drift: "+4%",
  },
  {
    agent_id: "medical_agent",
    name: "Medical Agent",
    domain: "Triage and casualty reduction",
    avatar: "M",
    priority: "human safety",
    color: "emerald",
    historical_accuracy: 92,
    trust_score: 89,
    override_rate: 11,
    speed_score: 88,
    confidence_drift: "+3%",
  },
  {
    agent_id: "security_agent",
    name: "Security Agent",
    domain: "Perimeter and crowd control",
    avatar: "S",
    priority: "access control",
    color: "cyan",
    historical_accuracy: 90,
    trust_score: 87,
    override_rate: 13,
    speed_score: 91,
    confidence_drift: "+2%",
  },
  {
    agent_id: "logistics_agent",
    name: "Logistics Agent",
    domain: "Routes and resources",
    avatar: "L",
    priority: "movement efficiency",
    color: "blue",
    historical_accuracy: 93,
    trust_score: 90,
    override_rate: 9,
    speed_score: 94,
    confidence_drift: "+5%",
  },
  {
    agent_id: "communications_agent",
    name: "Communications Agent",
    domain: "Responder and public messaging",
    avatar: "C",
    priority: "message clarity",
    color: "amber",
    historical_accuracy: 88,
    trust_score: 86,
    override_rate: 15,
    speed_score: 93,
    confidence_drift: "+1%",
  },
  {
    agent_id: "executive_risk_agent",
    name: "Executive Risk Agent",
    domain: "Continuity and liability",
    avatar: "E",
    priority: "business continuity",
    color: "violet",
    historical_accuracy: 91,
    trust_score: 88,
    override_rate: 12,
    speed_score: 84,
    confidence_drift: "+3%",
  },
] as const;

function actionsForAgent(agentId: string, incident: AIDecisionIncident) {
  const map: Record<string, string[]> = {
    fire_agent: [
      `Isolate ignition source in ${incident.zone}`,
      `Start suppression timing for floor ${incident.floor}`,
      "Prevent smoke migration through service corridor",
    ],
    medical_agent: [
      "Open triage lane at east stairwell landing",
      "Deploy medic pair to mobility-impaired occupants",
      "Keep casualty extraction route clear of responders",
    ],
    security_agent: [
      "Lock service elevators and hold unauthorized access",
      "Create perimeter around affected floor",
      "Prevent crowd backflow into hazard zone",
    ],
    logistics_agent: [
      "Route occupants through east stairwell first",
      "Stage reserve responders two floors below incident",
      "Balance traffic away from blocked exits",
    ],
    communications_agent: [
      "Send concise floor-specific evacuation instructions",
      "Prepare public statement but hold external broadcast",
      "Push responder channel update every 90 seconds",
    ],
    executive_risk_agent: [
      "Preserve incident evidence and decision audit trail",
      "Prepare executive continuity summary",
      "Minimize disruption outside affected zones",
    ],
  };

  return map[agentId] ?? [];
}

function constraintsForAgent(agentId: string, incident: AIDecisionIncident) {
  const blocked = incident.blocked_exits.join(", ") || "no blocked exits reported";
  const map: Record<string, string[]> = {
    fire_agent: [`Blocked path status: ${blocked}`, "Suppression must not trap occupants"],
    medical_agent: ["Avoid stairwell overload for vulnerable occupants", "Keep medics out until ingress is clear"],
    security_agent: ["Do not lock exits needed for evacuation", "Prevent entry without slowing responders"],
    logistics_agent: [`Responder ETA is ${incident.responders_eta_minutes} minutes`, "Maintain reserves if second zone triggers"],
    communications_agent: ["Avoid panic language", "External statement waits for verified scope"],
    executive_risk_agent: ["Preserve safety-first posture", "Continuity cannot override life safety"],
  };

  return map[agentId] ?? [];
}

function reasoningForAgent(agentId: string, incident: AIDecisionIncident, scores: AIDecisionScores) {
  const map: Record<string, string> = {
    fire_agent: `${incident.incident_type} signals and severity ${scores.severity_score}/100 require containment-first action.`,
    medical_agent: `Occupancy ${incident.occupancy} and evacuation congestion create triage risk.`,
    security_agent: "Blocked exits and crowd movement require perimeter control without blocking safe egress.",
    logistics_agent: `Route choices must account for ${incident.blocked_exits.length} blocked exits and responder ETA.`,
    communications_agent: "Message sequencing can reduce panic while keeping responders synchronized.",
    executive_risk_agent: `Business impact ${scores.business_impact_score}/100 requires continuity updates after life-safety actions.`,
  };

  return map[agentId] ?? "Agent reviewed available incident signals.";
}

export function buildSpecialistAgents(
  incident: AIDecisionIncident,
  scores: AIDecisionScores,
): CouncilSpecialistAgent[] {
  return agentProfiles.map((profile, index) => {
    const urgency = Math.min(
      100,
      scores.severity_score + (index % 3) * 3 + (profile.agent_id === "fire_agent" || profile.agent_id === "medical_agent" ? 8 : 0),
    );
    const confidence = Math.min(
      98,
      profile.historical_accuracy - incident.blocked_exits.length + (scores.escalation_risk < 85 ? 2 : -2),
    );

    return {
      ...profile,
      urgency_score: urgency,
      confidence,
      top_actions: actionsForAgent(profile.agent_id, incident),
      constraints: constraintsForAgent(profile.agent_id, incident),
      reasoning: reasoningForAgent(profile.agent_id, incident, scores),
      stance: confidence >= 88 ? "support" : "conditional",
    };
  });
}

type PerceptionInput = {
  severity: number;
  risk_level: string;
  location: string;
  incident_type: string;
};

export function decideAction(data: PerceptionInput) {
  let action = "MONITOR";
  let priority = "LOW";

  if (data.risk_level === "HIGH") {
    action = "EVACUATE IMMEDIATELY";
    priority = "CRITICAL";
  } else if (data.risk_level === "MEDIUM") {
    action = "ALERT RESPONSE TEAM";
    priority = "HIGH";
  } else {
    action = "MONITOR SITUATION";
    priority = "LOW";
  }

  return {
    recommended_action: action,
    priority,
    decision_confidence: 0.75 + Math.random() * 0.2,
    decided_by: "decision_engine",
  };
}

type InputEvent = {
  type: string;
  payload: {
    type: string;
    severity: number;
    location: string;
  };
};

export function analyzeEvent(event: InputEvent) {
  const { severity, type } = event.payload;

  let risk = "LOW";
  if (severity >= 3) {
    risk = "HIGH";
  } else if (severity === 2) {
    risk = "MEDIUM";
  }

  let incidentType = "generic";

  if (type.includes("fire")) {
    incidentType = "fire_risk";
  } else if (type.includes("crowd")) {
    incidentType = "crowd_anomaly";
  } else if (type.includes("simulated")) {
    incidentType = "simulated_event";
  }

  return {
    ...event.payload,
    risk_level: risk,
    incident_type: incidentType,
    confidence: 0.7 + Math.random() * 0.2,
    detected_by: "perception_engine",
  };
}

/**
 * Sentra Crisis Intelligence - Future Capability Seams & Type Contracts
 * Foundation interfaces for perception, prediction, multi-agent decisions, and digital twin simulations.
 */

export type EvidenceType =
  | "sensor_telemetry"
  | "camera_frame"
  | "thermal_signature"
  | "acoustic_anomaly"
  | "operator_log"
  | "external_feed";

export interface IncidentEvidence {
  id: string;
  incidentId: string;
  type: EvidenceType;
  source: string;
  timestamp: string;
  confidence: number;
  data: Record<string, unknown>;
  metadata?: {
    location?: {
      buildingId?: string;
      floor?: number;
      zone?: string;
      coordinates?: [number, number];
    };
    rawPayloadHash?: string;
    verifiedByOperator?: boolean;
  };
}

export interface AIConfidenceAssessment {
  incidentId: string;
  evaluatedAt: string;
  overallConfidence: number;
  perceptionConfidence: number;
  predictiveConfidence: number;
  recommendationConfidence: number;
  factors: Array<{
    dimension: string;
    score: number;
    weight: number;
    rationale: string;
  }>;
  suggestedHumanReview: boolean;
}

export type ActionStatus = "draft" | "proposed" | "approved" | "executing" | "completed" | "aborted";
export type ActionPriority = "low" | "medium" | "high" | "critical";

export interface ProposedAction {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  category: "evacuation" | "containment" | "resource_dispatch" | "public_warning" | "infrastructure_override";
  priority: ActionPriority;
  status: ActionStatus;
  proposedByAgent: string;
  targetZones: string[];
  estimatedImpact: {
    livesProtected?: number;
    evacuationMinutesSaved?: number;
    riskReductionPct?: number;
  };
  requiredApprovals: string[];
  createdAt: string;
  expiresAt?: string;
}

export type TimelineEventCategory =
  | "detection"
  | "triage"
  | "prediction_update"
  | "agent_decision"
  | "operator_override"
  | "field_execution"
  | "containment";

export interface TimelineEvent {
  id: string;
  incidentId: string;
  timestamp: string;
  category: TimelineEventCategory;
  title: string;
  description: string;
  actor: {
    type: "system" | "agent" | "human_operator" | "field_responder";
    id: string;
    name?: string;
  };
  severity: "info" | "warning" | "critical" | "resolved";
  metadata?: Record<string, unknown>;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  buildingId: string;
  initialConditions: {
    incidentType: string;
    originZone: string;
    initialOccupancy: number;
    activeHazards: string[];
    environmentalFactors: {
      temperatureCelsius?: number;
      windSpeedKmh?: number;
      hvacStatus?: "active" | "exhaust_mode" | "shutdown";
    };
  };
  durationSeconds: number;
  timeStepSeconds: number;
  outcomes?: {
    totalEvacuationTimeSeconds?: number;
    bottleneckZones?: string[];
    predictedCasualtiesMin?: number;
    predictedCasualtiesMax?: number;
    structuralIntegrityPct?: number;
  };
  simulatedAt?: string;
}

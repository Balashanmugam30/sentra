export type SourceType =
  | "CAMERA"
  | "FLIR_THERMAL"
  | "IOT_SENSOR"
  | "AIR_QUALITY"
  | "ACCESS_CONTROL"
  | "HUMAN_REPORT"
  | "SEISMIC"
  | "DRONE"
  | "HISTORICAL";

export type ActionApprovalStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "executed";

export interface SourceNode {
  id: string;
  name: string;
  source_type: SourceType;
  location: string;
  calibration_index: number;
  status: "active" | "degraded" | "offline" | string;
  simulated: boolean;
}

export interface ObservationNode {
  id: string;
  source_id: string;
  timestamp: string;
  metric_type: string;
  raw_value: number;
  unit: string;
  normalized_severity: number;
  confidence: number;
  bounding_box?: [number, number, number, number] | null; // [ymin, xmin, ymax, xmax]
  label: string;
  simulated: boolean;
}

export interface CorroborationEdge {
  source_obs_id: string;
  target_obs_id: string;
  similarity_score: number;
  cross_modal_factor: number;
  corroboration_rationale: string;
}

export interface ConflictEdge {
  obs_a_id: string;
  obs_b_id: string;
  discrepancy_metric: number;
  conflict_severity: "low" | "moderate" | "high" | "critical" | string;
  explanation: string;
}

export interface EvidenceNode {
  id: string;
  title: string;
  description: string;
  observation_ids: string[];
  primary_source_type: SourceType;
  confidence_score: number;
  variance_penalty: number;
  conflict_score: number;
  verification_status: "unverified" | "corroborated" | "conflicted" | "verified" | string;
  provenance_chain: string[];
}

export interface EvidenceGraph {
  sources: SourceNode[];
  observations: ObservationNode[];
  evidence: EvidenceNode[];
  corroborations: CorroborationEdge[];
  conflicts: ConflictEdge[];
  fused_confidence: number;
  cross_modal_conflict_detected: boolean;
  conflict_summary?: string | null;
}

export interface RAGCitation {
  doc_id: string;
  title: string;
  standard: string;
  chunk_id: string;
  section: string;
  excerpt: string;
  relevance_score: number;
}

export interface SpecialistAgentAssessment {
  role: string;
  agent_id: string;
  severity_rating: number;
  confidence: number;
  rationale: string;
  proposed_actions: string[];
  dissent_or_caveats?: string | null;
}

export interface ActionProposal {
  id: string;
  title: string;
  description: string;
  action_type: string;
  priority: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | string;
  risk_level: "EXTREME" | "HIGH" | "MEDIUM" | "LOW" | string;
  target_zone: string;
  sop_citations: string[];
  approval_status: ActionApprovalStatus;
  requires_operator_role: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  parameters: Record<string, unknown>;
}

export interface IncidentCommanderAssessment {
  incident_id: string;
  tenant_id: string;
  timestamp: string;
  threat_level: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | string;
  consensus_score: number;
  executive_summary: string;
  inference_source: "GEMINI_LIVE_INFERENCE" | "RULE_BASED_FALLBACK" | string;
  model_name: string;
  is_degraded: boolean;
  degradation_reason?: string | null;
  evidence_graph: EvidenceGraph;
  specialist_debates: SpecialistAgentAssessment[];
  action_proposals: ActionProposal[];
  citations: RAGCitation[];
  latency_ms: number;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
}

export interface ProposalReviewRequest {
  operator_id: string;
  operator_name: string;
  decision: "approve" | "reject" | "execute";
  rejection_reason?: string;
  modified_parameters?: Record<string, unknown>;
}

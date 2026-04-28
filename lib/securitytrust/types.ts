export type ComplianceFramework = {
  framework_id: string;
  tenant_id: string;
  name: string;
  score: number;
  control_pass_rate: number;
  open_gaps: number;
  risk_priority: "high" | "medium" | "low";
  remediation_eta_days: number;
  controls: string[];
};

export type ComplianceGap = {
  gap_id: string;
  tenant_id: string;
  framework: string;
  title: string;
  priority: "high" | "medium" | "low";
  owner: string;
  eta_days: number;
  status: string;
};

export type ProcurementReadiness = {
  buyer_readiness: number;
  legal_readiness: number;
  security_questionnaire_ready: boolean;
  vendor_packet_ready: boolean;
  procurement_stage: string;
};

export type ComplianceSummary = {
  frameworks: ComplianceFramework[];
  control_pass_rate: number;
  compliance_average: number;
  open_gaps: number;
  risk_priority_queue: ComplianceGap[];
  remediation_eta_days: number;
  procurement_readiness: ProcurementReadiness;
};

export type PrivacyField = {
  field_id: string;
  tenant_id: string;
  name: string;
  classification: "PII" | "Sensitive" | "Internal" | "Public";
  exposure: number;
  masked: boolean;
  encrypted: boolean;
  retention_days: number;
  purpose: string;
};

export type PrivacyQueueItem = {
  queue_id: string;
  tenant_id: string;
  type: "deletion" | "export" | "retention" | "masking";
  subject: string;
  due_days: number;
  status: string;
  risk: number;
};

export type PrivacyState = {
  fields: PrivacyField[];
  queues: PrivacyQueueItem[];
  pii_exposure_score: number;
  masking_coverage: number;
  encryption_posture: number;
  consent_posture: number;
  privacy_incidents: number;
  classification_map: Record<string, number>;
  deletion_queue: PrivacyQueueItem[];
  export_requests: PrivacyQueueItem[];
};

export type TrustPolicy = {
  policy_id: string;
  tenant_id: string;
  name: string;
  category: string;
  status: "approved" | "revise" | "archived";
  version: string;
  owner: string;
  coverage: number;
  last_review: string;
  next_review: string;
};

export type PolicyState = {
  policies: TrustPolicy[];
  approved: number;
  needs_revision: number;
  coverage: number;
  categories: Record<string, number>;
};

export type VendorRisk = {
  vendor_id: string;
  tenant_id: string;
  name: string;
  risk_score: number;
  token_health: number;
  trust_tier: string;
  permissions: string[];
  data_classes: string[];
  last_review: string;
  next_review: string;
  outages: number;
  access_scope: string;
};

export type VendorRiskState = {
  vendors: VendorRisk[];
  average_risk: number;
  token_health: number;
  high_risk_vendors: VendorRisk[];
  trust_tiers: Record<string, number>;
  data_classes: string[];
};

export type EvidenceItem = {
  evidence_id: string;
  tenant_id: string;
  name: string;
  type: "JSON" | "CSV" | "PDF";
  status: string;
  items: number;
  last_generated: string;
  hash: string;
};

export type EvidenceState = {
  evidence: EvidenceItem[];
  export_formats: string[];
  ready_items: number;
  total_items: number;
  latest_hash: string;
  board_pack_ready: boolean;
};

export type TrustIndex = {
  score: number;
  band: "elite" | "strong" | "developing" | "weak";
  drivers: { label: string; value: number }[];
};

export type LegalItem = {
  item_id: string;
  tenant_id: string;
  title: string;
  status: string;
  owner: string;
  buyer_blocker: boolean;
};

export type TrustExecutive = {
  trust_index: TrustIndex;
  security_maturity: number;
  compliance_confidence: number;
  buyer_readiness: number;
  procurement_readiness: ProcurementReadiness;
  legal_readiness: number;
  legal_items: LegalItem[];
  top_blockers: string[];
  next_30_day_actions: string[];
  board_summary: string;
};

export type TrustMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type SecurityTrustState = {
  compliance: ComplianceSummary;
  privacy: PrivacyState;
  policies: PolicyState;
  vendorRisk: VendorRiskState;
  evidence: EvidenceState;
  executive: TrustExecutive;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

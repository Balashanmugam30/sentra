import type {
  ComplianceSummary,
  EvidenceState,
  PolicyState,
  PrivacyState,
  TrustExecutive,
  VendorRiskState,
} from "@/lib/securitytrust/types";

export const fallbackCompliance: ComplianceSummary = {
  frameworks: [
    { framework_id: "SOC2", tenant_id: "TEN-GOVSECURE", name: "SOC2 readiness", score: 91, control_pass_rate: 92, open_gaps: 4, risk_priority: "high", remediation_eta_days: 24, controls: ["audit logs", "RBAC", "MFA", "backups", "incident response", "monitoring"] },
    { framework_id: "ISO27001", tenant_id: "TEN-BALA-MFG", name: "ISO27001 readiness", score: 87, control_pass_rate: 88, open_gaps: 6, risk_priority: "medium", remediation_eta_days: 31, controls: ["policies", "asset control", "risk management", "training", "governance"] },
    { framework_id: "GDPR", tenant_id: "TEN-BALA-UNI", name: "GDPR readiness", score: 84, control_pass_rate: 85, open_gaps: 7, risk_priority: "medium", remediation_eta_days: 28, controls: ["deletion flows", "consent controls", "data minimization", "export controls"] },
    { framework_id: "HIPAA", tenant_id: "TEN-BALA-HOSP", name: "HIPAA readiness", score: 89, control_pass_rate: 91, open_gaps: 5, risk_priority: "high", remediation_eta_days: 21, controls: ["access control", "audit trails", "encryption", "least privilege"] },
    { framework_id: "DPDP", tenant_id: "TEN-BALA-UNI", name: "DPDP India readiness", score: 86, control_pass_rate: 87, open_gaps: 5, risk_priority: "medium", remediation_eta_days: 26, controls: ["consent posture", "data minimization", "purpose logs", "deletion queue"] },
    { framework_id: "GOV-PROC", tenant_id: "TEN-GRAND-MERIDIAN", name: "Gov procurement readiness", score: 90, control_pass_rate: 92, open_gaps: 3, risk_priority: "high", remediation_eta_days: 18, controls: ["vendor risk", "audit exports", "policy approvals", "legal trust room"] },
  ],
  control_pass_rate: 89,
  compliance_average: 88,
  open_gaps: 30,
  risk_priority_queue: [
    { gap_id: "GAP-SOC2-004", tenant_id: "TEN-GOVSECURE", framework: "SOC2", title: "Formal backup restore test evidence", priority: "high", owner: "Security Admin", eta_days: 9, status: "in progress" },
    { gap_id: "GAP-HIPAA-002", tenant_id: "TEN-BALA-HOSP", framework: "HIPAA", title: "Clinical export retention acknowledgement", priority: "high", owner: "Privacy Officer", eta_days: 7, status: "queued" },
    { gap_id: "GAP-GDPR-006", tenant_id: "TEN-BALA-UNI", framework: "GDPR", title: "Data subject request response SLA evidence", priority: "medium", owner: "Legal Ops", eta_days: 14, status: "review" },
    { gap_id: "GAP-ISO-003", tenant_id: "TEN-BALA-MFG", framework: "ISO27001", title: "Vendor access quarterly review", priority: "medium", owner: "Procurement", eta_days: 18, status: "in progress" },
  ],
  remediation_eta_days: 25,
  procurement_readiness: {
    buyer_readiness: 88,
    legal_readiness: 88,
    security_questionnaire_ready: true,
    vendor_packet_ready: true,
    procurement_stage: "enterprise pilot ready",
  },
};

export const fallbackPrivacy: PrivacyState = {
  fields: [
    { field_id: "PF-USER-EMAIL", tenant_id: "TEN-BALA-UNI", name: "user_email", classification: "PII", exposure: 28, masked: true, encrypted: true, retention_days: 365, purpose: "account access" },
    { field_id: "PF-CLINICAL-STATUS", tenant_id: "TEN-BALA-HOSP", name: "medical_assistance_status", classification: "Sensitive", exposure: 42, masked: true, encrypted: true, retention_days: 180, purpose: "emergency triage" },
    { field_id: "PF-INCIDENT-ZONE", tenant_id: "TEN-BALA-MFG", name: "incident_zone", classification: "Internal", exposure: 18, masked: false, encrypted: true, retention_days: 730, purpose: "safety analytics" },
    { field_id: "PF-PUBLIC-ALERT", tenant_id: "TEN-GOVSECURE", name: "public_alert_copy", classification: "Public", exposure: 6, masked: false, encrypted: false, retention_days: 1095, purpose: "public safety record" },
    { field_id: "PF-DEVICE-REGION", tenant_id: "TEN-GRAND-MERIDIAN", name: "device_region", classification: "PII", exposure: 31, masked: true, encrypted: true, retention_days: 365, purpose: "session risk" },
  ],
  queues: [
    { queue_id: "DEL-001", tenant_id: "TEN-BALA-UNI", type: "deletion", subject: "visitor route history", due_days: 5, status: "scheduled", risk: 18 },
    { queue_id: "EXP-002", tenant_id: "TEN-BALA-HOSP", type: "export", subject: "clinical incident audit pack", due_days: 2, status: "legal review", risk: 34 },
    { queue_id: "RET-003", tenant_id: "TEN-BALA-MFG", type: "retention", subject: "IoT telemetry archive", due_days: 21, status: "active", risk: 16 },
    { queue_id: "MASK-004", tenant_id: "TEN-GOVSECURE", type: "masking", subject: "board report occupant names", due_days: 1, status: "ready", risk: 12 },
  ],
  pii_exposure_score: 34,
  masking_coverage: 60,
  encryption_posture: 80,
  consent_posture: 89,
  privacy_incidents: 0,
  classification_map: { PII: 2, Sensitive: 1, Internal: 1, Public: 1 },
  deletion_queue: [{ queue_id: "DEL-001", tenant_id: "TEN-BALA-UNI", type: "deletion", subject: "visitor route history", due_days: 5, status: "scheduled", risk: 18 }],
  export_requests: [{ queue_id: "EXP-002", tenant_id: "TEN-BALA-HOSP", type: "export", subject: "clinical incident audit pack", due_days: 2, status: "legal review", risk: 34 }],
};

export const fallbackPolicies: PolicyState = {
  policies: [
    { policy_id: "POL-MFA", tenant_id: "TEN-GOVSECURE", name: "MFA policy", category: "access", status: "approved", version: "v3.1", owner: "Security Admin", coverage: 96, last_review: "2026-04-19", next_review: "2026-05-19" },
    { policy_id: "POL-PASSWORD", tenant_id: "TEN-BALA-UNI", name: "Password policy", category: "identity", status: "approved", version: "v2.7", owner: "IT Security", coverage: 92, last_review: "2026-04-12", next_review: "2026-05-12" },
    { policy_id: "POL-ACCESS-REVIEW", tenant_id: "TEN-BALA-HOSP", name: "Access review cycles", category: "governance", status: "revise", version: "v1.9", owner: "Compliance Lead", coverage: 84, last_review: "2026-04-01", next_review: "2026-04-30" },
    { policy_id: "POL-ADMIN", tenant_id: "TEN-GOVSECURE", name: "Admin privilege policy", category: "access", status: "approved", version: "v2.4", owner: "CISO", coverage: 94, last_review: "2026-04-10", next_review: "2026-05-10" },
    { policy_id: "POL-VENDOR", tenant_id: "TEN-BALA-MFG", name: "Vendor access policy", category: "third party", status: "approved", version: "v2.0", owner: "Procurement", coverage: 88, last_review: "2026-04-06", next_review: "2026-05-06" },
    { policy_id: "POL-RETENTION", tenant_id: "TEN-BALA-UNI", name: "Retention policy", category: "privacy", status: "revise", version: "v3.0", owner: "Privacy Officer", coverage: 86, last_review: "2026-03-28", next_review: "2026-04-28" },
    { policy_id: "POL-AI-USAGE", tenant_id: "TEN-GOVSECURE", name: "AI usage policy", category: "AI governance", status: "approved", version: "v1.6", owner: "AI Governance", coverage: 90, last_review: "2026-04-15", next_review: "2026-05-15" },
    { policy_id: "POL-OVERRIDE", tenant_id: "TEN-BALA-HOSP", name: "Emergency override policy", category: "crisis operations", status: "approved", version: "v2.2", owner: "Operations", coverage: 91, last_review: "2026-04-17", next_review: "2026-05-17" },
  ],
  approved: 6,
  needs_revision: 2,
  coverage: 90,
  categories: { access: 2, identity: 1, governance: 1, "third party": 1, privacy: 1, "AI governance": 1, "crisis operations": 1 },
};

export const fallbackVendorRisk: VendorRiskState = {
  vendors: [
    { vendor_id: "VEN-GOOGLE", tenant_id: "TEN-BALA-UNI", name: "Google", risk_score: 24, token_health: 94, trust_tier: "tier 1", permissions: ["SSO", "email"], data_classes: ["PII"], last_review: "2026-04-08", next_review: "2026-05-08", outages: 0, access_scope: "federated identity" },
    { vendor_id: "VEN-MICROSOFT", tenant_id: "TEN-GOVSECURE", name: "Microsoft", risk_score: 18, token_health: 96, trust_tier: "tier 1", permissions: ["SSO", "Teams"], data_classes: ["PII", "Internal"], last_review: "2026-04-10", next_review: "2026-05-10", outages: 0, access_scope: "identity + comms" },
    { vendor_id: "VEN-SLACK", tenant_id: "TEN-BALA-MFG", name: "Slack", risk_score: 36, token_health: 82, trust_tier: "tier 2", permissions: ["alerts"], data_classes: ["Internal"], last_review: "2026-04-02", next_review: "2026-05-02", outages: 1, access_scope: "incident notifications" },
    { vendor_id: "VEN-WHATSAPP", tenant_id: "TEN-BALA-HOSP", name: "WhatsApp", risk_score: 48, token_health: 78, trust_tier: "tier 3", permissions: ["public alerts"], data_classes: ["Public", "PII"], last_review: "2026-03-31", next_review: "2026-04-30", outages: 1, access_scope: "mass notification" },
  ],
  average_risk: 30,
  token_health: 89,
  high_risk_vendors: [],
  trust_tiers: { "tier 1": 2, "tier 2": 1, "tier 3": 1 },
  data_classes: ["Internal", "PII", "Public"],
};

export const fallbackEvidence: EvidenceState = {
  evidence: [
    { evidence_id: "EVD-BOARD-PACK", tenant_id: "TEN-GOVSECURE", name: "Downloadable board pack", type: "PDF", status: "ready", items: 42, last_generated: "2026-04-26T08:10:00+00:00", hash: "e0a1-board-pack" },
    { evidence_id: "EVD-AUDIT-LOGS", tenant_id: "TEN-BALA-UNI", name: "Audit logs", type: "JSON", status: "ready", items: 18420, last_generated: "2026-04-26T08:05:00+00:00", hash: "b19f-audit-logs" },
    { evidence_id: "EVD-ACCESS-REVIEW", tenant_id: "TEN-BALA-HOSP", name: "Access review exports", type: "CSV", status: "legal review", items: 128, last_generated: "2026-04-25T18:00:00+00:00", hash: "a72c-access-review" },
    { evidence_id: "EVD-INCIDENT-HISTORY", tenant_id: "TEN-BALA-MFG", name: "Incident history", type: "JSON", status: "ready", items: 824, last_generated: "2026-04-26T07:44:00+00:00", hash: "88be-incident-history" },
  ],
  export_formats: ["JSON", "CSV", "PDF"],
  ready_items: 3,
  total_items: 19414,
  latest_hash: "e0a1-board-pack",
  board_pack_ready: true,
};

export const fallbackExecutive: TrustExecutive = {
  trust_index: {
    score: 84,
    band: "strong",
    drivers: [
      { label: "Compliance average", value: 88 },
      { label: "Privacy masking", value: 60 },
      { label: "Vendor risk inverse", value: 70 },
      { label: "Procurement readiness", value: 88 },
    ],
  },
  security_maturity: 91,
  compliance_confidence: 88,
  buyer_readiness: 88,
  procurement_readiness: {
    buyer_readiness: 88,
    legal_readiness: 88,
    security_questionnaire_ready: true,
    vendor_packet_ready: true,
    procurement_stage: "enterprise pilot ready",
  },
  legal_readiness: 75,
  legal_items: [
    { item_id: "LEGAL-DPA", tenant_id: "TEN-GOVSECURE", title: "Data Processing Agreement", status: "ready", owner: "Legal Ops", buyer_blocker: false },
    { item_id: "LEGAL-BAA", tenant_id: "TEN-BALA-HOSP", title: "HIPAA BAA draft", status: "review", owner: "Healthcare Counsel", buyer_blocker: true },
    { item_id: "LEGAL-SLA", tenant_id: "TEN-GRAND-MERIDIAN", title: "Enterprise SLA", status: "ready", owner: "Procurement", buyer_blocker: false },
  ],
  top_blockers: ["Formal backup restore test evidence", "Clinical export retention acknowledgement", "Data subject request response SLA evidence"],
  next_30_day_actions: [
    "Close backup restore evidence for SOC2 procurement packet.",
    "Complete HIPAA BAA review for hospital pilots.",
    "Refresh vendor access review for automation integrations.",
    "Generate board trust pack before enterprise pilots.",
  ],
  board_summary: "Sentra is procurement-ready for enterprise pilots with strong compliance posture, exportable evidence, and a clear 30-day remediation path.",
};

export function trustTone(score: number) {
  if (score >= 90) {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }
  if (score >= 75) {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }
  if (score >= 60) {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
  return "border-red-300/30 bg-red-400/10 text-red-100";
}

export function formatTrustDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

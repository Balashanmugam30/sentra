import type {
  DefenseIncident,
  DefenseThreat,
  ExecutiveDefense,
  ForensicsState,
  SocSummary,
  ThreatCenter,
  ZeroTrustState,
} from "@/lib/securitydefense/types";

export const fallbackIncidents: DefenseIncident[] = [
  { incident_id: "SOC-NIGHT-ADMIN", tenant_id: "TEN-BALA-UNI", org: "Bala University", title: "Night admin anomaly", category: "privilege_misuse", severity: "high", status: "open", detections: 7, containment_action: "Require re-auth and manager review", mttd_seconds: 41, mttr_minutes: 13, analyst_owner: "SOC Alpha", risk_score: 82, created_at: "2026-04-26T02:14:00+00:00" },
  { incident_id: "SOC-API-SPIKE", tenant_id: "TEN-BALA-MFG", org: "Bala Manufacturing", title: "API request spike", category: "api_abuse", severity: "medium", status: "contained", detections: 1840, containment_action: "Burst limit tightened", mttd_seconds: 24, mttr_minutes: 7, analyst_owner: "AutoContain", risk_score: 68, created_at: "2026-04-26T04:20:00+00:00" },
  { incident_id: "SOC-TOKEN-REPLAY", tenant_id: "TEN-GOVSECURE", org: "SmartCity Authority", title: "Token replay warning", category: "token_replay", severity: "high", status: "watch", detections: 3, containment_action: "Token family revoked", mttd_seconds: 35, mttr_minutes: 9, analyst_owner: "SOC Bravo", risk_score: 76, created_at: "2026-04-26T05:03:00+00:00" },
  { incident_id: "SOC-EXPORT-BURST", tenant_id: "TEN-BALA-HOSP", org: "Bala Hospital Demo", title: "Suspicious export burst", category: "insider_risk", severity: "medium", status: "queued", detections: 12, containment_action: "Export review queue", mttd_seconds: 58, mttr_minutes: 18, analyst_owner: "SOC Clinical", risk_score: 64, created_at: "2026-04-26T06:31:00+00:00" },
  { incident_id: "SOC-GEO-ANOMALY", tenant_id: "TEN-BALA-UNI", org: "Bala University", title: "Geo anomaly login", category: "impossible_travel", severity: "medium", status: "open", detections: 2, containment_action: "Step-up MFA", mttd_seconds: 33, mttr_minutes: 11, analyst_owner: "SOC Alpha", risk_score: 61, created_at: "2026-04-26T07:11:00+00:00" },
  { incident_id: "SOC-MFA-BYPASS", tenant_id: "TEN-BALA-HOSP", org: "Bala Hospital Demo", title: "Repeated MFA bypass attempts", category: "credential_stuffing", severity: "high", status: "contained", detections: 18, containment_action: "Account lock and admin notify", mttd_seconds: 22, mttr_minutes: 6, analyst_owner: "AutoContain", risk_score: 79, created_at: "2026-04-26T08:01:00+00:00" },
];

export const fallbackThreatsList: DefenseThreat[] = [
  { threat_id: "THR-BRUTE-001", tenant_id: "TEN-BALA-HOSP", detector: "Brute Force Detector", category: "brute_force", signal: "Many failed login attempts against clinical admin", count: 18, confidence: 94, risk: 79, status: "contained", recommended_action: "Keep lockout and force password review." },
  { threat_id: "THR-TRAVEL-002", tenant_id: "TEN-BALA-UNI", detector: "Impossible Travel Detector", category: "geo_anomaly", signal: "Admin region shifted within impossible travel window", count: 2, confidence: 87, risk: 61, status: "open", recommended_action: "Require MFA and verify device trust." },
  { threat_id: "THR-PRIV-003", tenant_id: "TEN-BALA-UNI", detector: "Privilege Misuse Detector", category: "permission_abuse", signal: "Late-night privileged changes outside maintenance window", count: 7, confidence: 91, risk: 82, status: "open", recommended_action: "Temporary restrict admin role pending review." },
  { threat_id: "THR-API-004", tenant_id: "TEN-BALA-MFG", detector: "API Abuse Detector", category: "api_spike", signal: "Automation endpoint spike from one integration", count: 1840, confidence: 89, risk: 68, status: "contained", recommended_action: "Pause API key if spike repeats." },
  { threat_id: "THR-TOKEN-005", tenant_id: "TEN-GOVSECURE", detector: "Token Replay Detector", category: "token_replay", signal: "Duplicated token family seen across two device fingerprints", count: 3, confidence: 92, risk: 76, status: "watch", recommended_action: "Revoke session and rotate refresh family." },
  { threat_id: "THR-INSIDER-006", tenant_id: "TEN-BALA-HOSP", detector: "Insider Risk Detector", category: "insider_risk", signal: "Exports plus escalation attempts from one analyst", count: 12, confidence: 84, risk: 64, status: "queued", recommended_action: "Route evidence to security manager." },
];

export const fallbackSummary: SocSummary = {
  open_incidents: 4,
  detections_today: 1882,
  severity_radar: { high: 3, medium: 3, low: 0 },
  attack_categories: { brute_force: 1, geo_anomaly: 1, permission_abuse: 1, api_spike: 1, token_replay: 1, insider_risk: 1 },
  mean_response_time: 10.7,
  auto_containment_count: 2,
  threat_level: "elevated",
  analyst_queue: 1,
  zero_trust_average: 67.6,
  policy_coverage: 90.4,
  top_threats: fallbackThreatsList.slice(0, 4),
};

export const fallbackThreats: ThreatCenter = {
  threats: fallbackThreatsList,
  detectors: [
    "Brute Force Detector",
    "Impossible Travel Detector",
    "Privilege Misuse Detector",
    "API Abuse Detector",
    "Token Replay Detector",
    "Insider Risk Detector",
  ],
  categories: { brute_force: 1, geo_anomaly: 1, permission_abuse: 1, api_spike: 1, token_replay: 1, insider_risk: 1 },
  risk_average: 71.6,
  highest_risk: 82,
  automated_responses: ["force logout session", "require re-auth", "pause API key", "temporary user lock", "notify admins", "isolate route access"],
};

export const fallbackZeroTrust: ZeroTrustState = {
  trust_score: 68,
  band: "risky",
  device_trust: 72,
  network_trust: 65,
  session_trust: 64,
  user_trust: 72,
  step_up_triggers: 44,
  policy_blocks: 19,
  identities: [
    { identity_id: "ZT-SEC-ADMIN", tenant_id: "TEN-BALA-UNI", actor: "security.admin@sentra.demo", role: "Security Manager", trust_score: 63, band: "risky", decision: "require MFA", device_trust: 72, network_trust: 58, session_trust: 61, user_trust: 66, triggers: ["unusual time login", "privileged action burst"], recommended_action: "Require re-auth before privileged changes." },
    { identity_id: "ZT-OPS-LEAD", tenant_id: "TEN-BALA-HOSP", actor: "ops.lead@sentra.demo", role: "Operations Lead", trust_score: 86, band: "watch", decision: "allow + monitor", device_trust: 92, network_trust: 84, session_trust: 82, user_trust: 87, triggers: ["clinical export review"], recommended_action: "Monitor high-impact exports." },
    { identity_id: "ZT-API-AUTO", tenant_id: "TEN-BALA-MFG", actor: "automation.api@sentra.demo", role: "Integration", trust_score: 54, band: "risky", decision: "temporary restrict", device_trust: 74, network_trust: 49, session_trust: 47, user_trust: 61, triggers: ["API spike", "token age"], recommended_action: "Pause API key if second spike occurs." },
    { identity_id: "ZT-GOV-ADMIN", tenant_id: "TEN-GOVSECURE", actor: "gov.admin@sentra.demo", role: "Super Admin", trust_score: 93, band: "trusted", decision: "allow", device_trust: 96, network_trust: 92, session_trust: 91, user_trust: 94, triggers: ["none"], recommended_action: "No intervention required." },
    { identity_id: "ZT-UNKNOWN-01", tenant_id: "TEN-BALA-UNI", actor: "unknown.device@sentra.demo", role: "Operator", trust_score: 42, band: "block", decision: "revoke access", device_trust: 28, network_trust: 44, session_trust: 39, user_trust: 51, triggers: ["unknown device", "geo shift", "failed attempts"], recommended_action: "Force logout and lock account pending verification." },
  ],
  policies: [
    { policy_id: "POL-ZT-001", name: "Admin step-up authentication", control: "require MFA", blocks: 4, step_up_count: 18, status: "active", coverage: 96 },
    { policy_id: "POL-ZT-002", name: "Unknown device restriction", control: "temporary restrict", blocks: 7, step_up_count: 11, status: "active", coverage: 91 },
    { policy_id: "POL-ZT-003", name: "API burst containment", control: "pause key", blocks: 2, step_up_count: 0, status: "active", coverage: 88 },
    { policy_id: "POL-ZT-004", name: "Tenant switch guardrail", control: "isolate route access", blocks: 5, step_up_count: 6, status: "active", coverage: 93 },
    { policy_id: "POL-ZT-005", name: "Export evidence review", control: "manager approval", blocks: 1, step_up_count: 9, status: "watch", coverage: 84 },
  ],
  risk_heatmap: [
    { zone: "Admin Console", risk: 72, trust: 64 },
    { zone: "API Gateway", risk: 68, trust: 58 },
    { zone: "Exports", risk: 61, trust: 71 },
    { zone: "Tenant Switch", risk: 55, trust: 78 },
  ],
};

export const fallbackForensics: ForensicsState = {
  ledger: [
    { ledger_id: "FOR-0001", tenant_id: "TEN-BALA-UNI", timestamp: "2026-04-26T02:14:10+00:00", actor: "security.admin@sentra.demo", org: "Bala University", action: "role_change_attempt", target: "operator role", ip_region: "Unknown VPN", device: "Windows Command Tablet", result: "step_up_required", severity: "high", chain_hash: "b83f9a21c0e4" },
    { ledger_id: "FOR-0002", tenant_id: "TEN-BALA-MFG", timestamp: "2026-04-26T04:20:18+00:00", actor: "automation.api@sentra.demo", org: "Bala Manufacturing", action: "api_spike", target: "/operations/automation", ip_region: "Dubai, AE", device: "Service token", result: "rate_limited", severity: "medium", chain_hash: "d41b3e77a91c" },
    { ledger_id: "FOR-0003", tenant_id: "TEN-GOVSECURE", timestamp: "2026-04-26T05:03:43+00:00", actor: "gov.admin@sentra.demo", org: "SmartCity Authority", action: "token_replay_detected", target: "refresh family", ip_region: "Sovereign Edge", device: "Duplicated fingerprint", result: "revoked", severity: "high", chain_hash: "901f6cc12abc" },
    { ledger_id: "FOR-0004", tenant_id: "TEN-BALA-HOSP", timestamp: "2026-04-26T06:31:08+00:00", actor: "analyst1@sentra.demo", org: "Bala Hospital Demo", action: "export_generated", target: "clinical response report", ip_region: "Boston, US", device: "Lenovo ThinkPad", result: "review_queued", severity: "medium", chain_hash: "4fe21b0a991d" },
  ],
  timeline_events: 4,
  privileged_actions: 2,
  export_json_ready: true,
  export_csv_ready: true,
  chain_integrity: 100,
  latest_hash: "4fe21b0a991d",
  filters: ["actor", "org", "action", "result", "severity"],
};

export const fallbackExecutive: ExecutiveDefense = {
  security_maturity: 89,
  risk_exposure: 13,
  top_threats: fallbackThreatsList.slice(0, 4),
  compliance_score: {
    score: 87,
    drivers: [
      { label: "MFA and step-up coverage", value: 91 },
      { label: "Audit completeness", value: 100 },
      { label: "Session hygiene", value: 84 },
      { label: "Policy coverage", value: 90 },
    ],
  },
  sla_response_score: 93,
  readiness_index: 91,
  zero_trust_score: 68,
  audit_integrity: 100,
  recommended_actions: [
    "Force MFA for every privileged role before public-sector pilots.",
    "Keep API burst containment in auto mode for automation endpoints.",
    "Review export burst evidence with a named security manager.",
    "Rotate SSO certificate for hotel tenant within 18 days.",
  ],
  board_summary: "Sentra defense posture is enterprise-ready with strong audit integrity, automated containment, and measurable zero-trust enforcement.",
};

export function defenseTone(score: number) {
  if (score >= 80) {
    return "border-red-300/30 bg-red-400/10 text-red-100";
  }
  if (score >= 60) {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

export function trustTone(score: number) {
  if (score >= 90) {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }
  if (score >= 70) {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }
  if (score >= 50) {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
  return "border-red-300/30 bg-red-400/10 text-red-100";
}

export function formatDefenseDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

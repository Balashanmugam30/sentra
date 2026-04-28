import type { LaunchExecutive, LaunchPerformance, LaunchQuality, LaunchReadiness, LaunchSummary, LaunchOps } from "@/lib/launch/types";

export const fallbackLaunchSummary: LaunchSummary = {
  launch_score: 95,
  status: "launch_ready",
  positioning: "Production-ready crisis intelligence operating system",
  performance_score: 94,
  quality_score: 93,
  design_score: 94,
  design_audits: [
    { audit_id: "DA-TYPO", tenant_id: "TEN-GRAND-MERIDIAN", area: "Typography", score: 96, status: "elite", checks: ["Clear H1/H2 rhythm", "Metric readability", "Compact label hierarchy"], finding: "Executive and command pages share a consistent premium type scale." },
    { audit_id: "DA-CARDS", tenant_id: "TEN-BALA-HOSP", area: "Cards + Buttons", score: 94, status: "strong", checks: ["Glass cards", "Action hierarchy", "Hover/focus states"], finding: "Critical cards and CTAs use consistent rounded glass treatment." },
    { audit_id: "DA-LAYOUT", tenant_id: "TEN-NOVA-MALL", area: "Layout Rhythm", score: 93, status: "strong", checks: ["Grid alignment", "Section spacing", "Responsive breakpoints"], finding: "War-room pages keep dense data readable." },
  ],
  top_actions: [
    { action_id: "EX-ACT-DEMO", title: "Run judge demo in executive mode", impact: "Proves product story in five minutes", urgency: "today" },
    { action_id: "EX-ACT-TRUST", title: "Export trust and compliance pack", impact: "Unblocks enterprise procurement", urgency: "this week" },
  ],
  preferences: [
    { pref_id: "PREF-MODE", name: "Mode", options: ["tactical", "executive"], default: "executive" },
    { pref_id: "PREF-DENSITY", name: "Density", options: ["compact", "balanced", "spacious"], default: "balanced" },
  ],
  launch_language: [
    "Trust-first enterprise command platform.",
    "Built for hospitals, hotels, campuses, malls, factories, smart cities, and government pilots.",
    "AI, operations, security, digital twin, data, and integrations are unified.",
  ],
};

export const fallbackLaunchPerformance: LaunchPerformance = {
  performance_score: 94,
  avg_route_p95_ms: 181,
  routes: [
    { route: "/demo", p95_ms: 148, status: "fast", cache: "edge-ready", chunk_kb: 84, owner: "demo" },
    { route: "/twin/live", p95_ms: 224, status: "watch", cache: "live-dedupe", chunk_kb: 132, owner: "digital_twin" },
    { route: "/security/soc", p95_ms: 190, status: "fast", cache: "runtime-cache", chunk_kb: 104, owner: "security" },
  ],
  slow_components: [
    { name: "Twin live canvas", cost_ms: 72, fix: "lazy render overlays and keep executive mini mode on tablets" },
    { name: "SOC incident table", cost_ms: 38, fix: "virtualize long evidence rows" },
  ],
  api_latency: { p50_ms: 86, p95_ms: 224, error_rate: 0.3 },
  cache: { hit_ratio: 91, dedupe_saves_today: 18420, stale_while_revalidate: true },
  websocket: { connected_clients: 14, health_percent: 98, reconnects_today: 2 },
  hydration: { average_ms: 410, largest_route_ms: 690, status: "healthy" },
  optimizations: ["route chunk splitting", "request dedupe", "manual refresh for launch pages", "fallback cards"],
};

export const fallbackLaunchQuality: LaunchQuality = {
  quality_score: 93,
  open_items: 3,
  checks: [
    { check_id: "QC-ROUTES", name: "Broken route scanner", severity: "low", status: "pass", count: 0, detail: "Core launch routes resolve." },
    { check_id: "QC-CONSOLE", name: "Console error tracker", severity: "medium", status: "watch", count: 1, detail: "One third-party map warning remains non-blocking in local mode." },
    { check_id: "QC-MOBILE", name: "Mobile layout issues", severity: "medium", status: "watch", count: 2, detail: "Dense twin and SOC pages should stay in executive compact mode on tablets." },
  ],
  scanner: { routes_scanned: 116, broken_routes: 0, console_errors: 1, failed_apis: 0, auth_loops: 0, type_mismatches: 0 },
  degraded_mode: "friendly fallback cards active across launch dashboards",
};

export const fallbackLaunchReadiness: LaunchReadiness = {
  launch_score: 95,
  dimensions: [
    { dimension: "Build health", score: 96, status: "ready", evidence: "lint, typecheck, build, compileall" },
    { dimension: "Feature completeness", score: 98, status: "ready", evidence: "AI, ops, twin, security, revenue, data, integrations" },
    { dimension: "Trust readiness", score: 93, status: "ready", evidence: "RBAC, zero trust, compliance, audit stores" },
    { dimension: "Demo readiness", score: 97, status: "ready", evidence: "one-click story engine and judge scoring" },
  ],
  feature_completeness: 98,
  route_coverage: 94,
  trust_readiness: 93,
  compliance_readiness: 92,
  investor_readiness: 95,
  demo_readiness: 97,
  submission_readiness: 94,
  recommendation: "Ship as a polished enterprise demo and keep final customer pilots in approval-required autonomy mode.",
};

export const fallbackLaunchExecutive: LaunchExecutive = {
  readiness_score: 95,
  arr: 4800000,
  trust_score: 94,
  global_health: 96,
  top_threats: [
    { title: "Tablet density on twin-heavy pages", severity: "watch", owner: "product" },
    { title: "Enterprise pilot evidence pack needs final branding pass", severity: "watch", owner: "go-to-market" },
  ],
  top_next_actions: fallbackLaunchSummary.top_actions,
  board_summary: [
    "Sentra is feature-complete across AI, operations, security, digital twin, revenue, data, and integrations.",
    "Launch readiness is strong enough for investor, judge, and enterprise demos.",
    "Primary residual risk is presentation polish on dense field-command layouts.",
  ],
  export_cta: { label: "Export launch board pack", status: "ready", format: "PDF mock" },
};

export const fallbackLaunchOps: LaunchOps = {
  ops_score: 95,
  live_errors: 1,
  uptime_percent: 99.96,
  background_jobs: 18,
  queue_depth: 27,
  retries_today: 8,
  degraded_services: ["ServiceNow connector watch"],
  signals: [
    { signal_id: "OPS-UPTIME", label: "Uptime", value: 99.96, unit: "%", status: "healthy", detail: "Launch-grade availability target is being met." },
    { signal_id: "OPS-CACHE", label: "Cache hit ratio", value: 91, unit: "%", status: "healthy", detail: "Runtime cache and request dedupe are reducing backend load." },
  ],
  alert_history: [
    { alert_id: "AL-LAUNCH-001", title: "ServiceNow retry queue entered watch", status: "contained", severity: "medium" },
    { alert_id: "AL-LAUNCH-003", title: "Cache hit ratio recovered above launch target", status: "resolved", severity: "low" },
  ],
};

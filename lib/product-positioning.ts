export const SENTRA_POSITIONING = {
  identity: "AI Crisis Intelligence Platform",
  oneLine:
    "Sentra unifies incidents, intelligence, digital twins, security, and executive action into one real-time command system.",
  promise: "Turn fragmented high-stakes operations into coordinated, explainable response.",
  trustLine: "Designed for tenant-aware, audit-ready, real-time operational environments.",
} as const;

export const SENTRA_SHOWCASE_PATH = [
  {
    href: "/executive",
    label: "Executive Mode",
    summary: "Start with boardroom clarity: exposure, readiness, continuity, and AI confidence.",
  },
  {
    href: "/crisis",
    label: "Crisis Mode",
    summary: "Move into a focused war-room view for severity, responders, zones, and urgent actions.",
  },
  {
    href: "/demo",
    label: "Demo Mode",
    summary: "Run the cinematic two-minute story that explains the product without extra narration.",
  },
  {
    href: "/analytics",
    label: "Charts & Insights",
    summary: "Close with evidence: trends, savings, response speed, and forecast confidence.",
  },
] as const;

export const SENTRA_USE_CASES = [
  {
    title: "Manufacturing emergency response",
    outcome: "Coordinate alarms, floor teams, evacuation routes, and executive escalation from one command surface.",
    signal: "Fire panel, access control, CCTV, responder movement",
  },
  {
    title: "Smart city control center",
    outcome: "Fuse civic incidents, hospital load, weather pressure, and resource staging into a shared city view.",
    signal: "Public safety, weather, traffic, hospitals, communications",
  },
  {
    title: "Enterprise security war room",
    outcome: "Connect threat posture, access events, response workflows, and leadership reporting during active risk.",
    signal: "SOC, identity, incidents, audit trails, executive brief",
  },
  {
    title: "Logistics disruption management",
    outcome: "Predict downtime exposure, route pressure, customer impact, and recovery ETA before operations stall.",
    signal: "Facilities, routes, resources, communications, revenue risk",
  },
] as const;

export const SENTRA_TRUST_SIGNALS = [
  "Tenant-aware access model",
  "Firebase Auth foundation",
  "Role-based command surfaces",
  "Audit-ready action language",
  "Graceful live-data fallback",
  "Executive-ready evidence views",
] as const;

export const SENTRA_LAUNCH_READINESS = [
  {
    label: "Design system",
    metric: "Locked",
    summary: "Unified glass surfaces, spacing, typography, motion, and chart treatment across the showcase.",
  },
  {
    label: "Demo flow",
    metric: "2 min",
    summary: "Landing, executive, crisis, demo, and analytics views are ordered for a clean public walkthrough.",
  },
  {
    label: "Reliability",
    metric: "Stable",
    summary: "Live-data fallbacks, protected routes, and quiet loading states keep the experience calm under review.",
  },
  {
    label: "Access",
    metric: "Safe",
    summary: "Auth-gated workspaces preserve the app while the landing page explains the product immediately.",
  },
] as const;

export const SENTRA_CASE_STUDY = {
  problem:
    "Emergency operations are usually split across alarms, CCTV, radios, spreadsheets, dashboards, and leadership calls. The result is slow coordination when every minute matters.",
  whySystemsFail: [
    "Signals live in separate tools, so teams lose shared context.",
    "Dashboards show what happened, but rarely recommend what to do next.",
    "Executives get updates late, without impact, confidence, or recovery framing.",
    "Static demos do not prove how a product behaves during live operational pressure.",
  ],
  response: [
    "A multi-workspace command shell for operators, executives, demos, and crisis mode.",
    "Live incident state, AI recommendations, digital twin context, and premium analytics.",
    "Guided storytelling that translates technical depth into a product people understand fast.",
    "Graceful data fallbacks, route protection, and enterprise trust language throughout the UX.",
  ],
  stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind", "FastAPI", "Firebase", "ECharts", "Framer Motion"],
  aiCapabilities: [
    "Incident intelligence",
    "Executive risk summaries",
    "Digital twin forecasting",
    "AI council recommendations",
    "Predictive analytics",
    "Demo narration engine",
  ],
} as const;

export const SENTRA_SHOWCASE_METRICS = [
  { label: "Response speed gain", value: "+61%" },
  { label: "Risk reduction story", value: "42%" },
  { label: "Executive savings modeled", value: "$2.1M" },
  { label: "AI confidence surface", value: "93%" },
] as const;

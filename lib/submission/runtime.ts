import type {
  SubmissionArchitecture,
  SubmissionDeck,
  SubmissionDemoScriptState,
  SubmissionDocs,
  SubmissionImpact,
  SubmissionJudges,
  SubmissionScore,
  SubmissionSummary,
  SubmissionTeamState,
} from "@/lib/submission/types";

export const fallbackSubmissionArchitecture: SubmissionArchitecture = {
  architecture_score: 96,
  export_formats: ["PNG", "PDF", "SVG mock"],
  narrative: "Next.js command UI + FastAPI control plane + AI/MLOps + operations OS + digital twin + data hub + security trust layers.",
  diagrams: [
    { diagram_id: "ARCH-SYSTEM", title: "System Architecture", layers: ["Next.js UI", "FastAPI", "AI/MLOps", "Operations OS", "Data Hub", "Audit/RBAC"], export: "PNG/PDF" },
    { diagram_id: "ARCH-AI", title: "AI Agent Flow", layers: ["signals", "decision engine", "council", "governance", "execution", "learning"], export: "PNG/PDF" },
    { diagram_id: "ARCH-TWIN", title: "Digital Twin Architecture", layers: ["facility map", "hazards", "occupancy", "routes", "replay", "prediction"], export: "PNG/PDF" },
  ],
};

export const fallbackDemoScripts: SubmissionDemoScriptState = {
  script_score: 98,
  recovery_line: "If a live view fails, switch to /demo/judge, /submission/judges, or /submission/deck and narrate deterministic proof.",
  scripts: [
    {
      script_id: "SCRIPT-2MIN",
      mode: "2 minute rapid pitch",
      timing: "120 seconds",
      talking_points: ["Sentra is an AI crisis operating system.", "It detects, predicts, decides, communicates, executes, and recovers.", "The key moat is human behavior intelligence plus operational execution."],
      screen_sequence: ["/demo", "/twin/live", "/ai/council", "/operations/execution"],
      wow_moments: ["AI council debate", "digital twin replay", "executive summary"],
      objections: ["Is it real?", "Who pays?", "How safe is autonomy?"],
      break_glass: "If live demo fails, switch to /demo/judge and narrate generated evidence.",
    },
  ],
};

export const fallbackTeamStory: SubmissionTeamState = {
  positioning: "Student-built crisis intelligence platform with enterprise-grade execution depth.",
  interview_score: 94,
  story: [
    { story_id: "TEAM-ORIGIN", title: "Origin Story", body: "Sentra began from a simple insight: emergencies fail when tools and humans are not coordinated." },
    { story_id: "TEAM-EXECUTION", title: "Execution Strength", body: "The product spans AI, IoT, digital twin, operations, revenue, integrations, security, launch, and submission systems." },
  ],
};

export const fallbackSubmissionSummary: SubmissionSummary = {
  readiness_score: 96,
  selected_mode: "google_solution_challenge",
  modes: [
    { mode_id: "google_solution_challenge", name: "Google Solution Challenge", priority: "SDGs + social impact + inclusion + sustainability", score_weight: { impact: 30, scale: 20, innovation: 20 } },
    { mode_id: "investor", name: "Investor Pitch", priority: "ARR + moat + GTM + margins + scale", score_weight: { business_model: 25, moat: 25, traction: 20 } },
    { mode_id: "government", name: "Government Grant", priority: "resilience + trust + compliance + continuity", score_weight: { trust: 25, impact: 25, deployment: 20 } },
  ],
  pending_missing_assets: [
    { asset_id: "MISS-VIDEO", title: "Final 90-second demo recording", priority: "medium", owner: "founder" },
    { asset_id: "MISS-LOGO", title: "Transparent logo export", priority: "low", owner: "design" },
  ],
  generated_packs: [],
  exports: [
    { export_id: "EXP-DECK", name: "PDF deck", format: "PDF", status: "ready", last_exported: "2026-04-26T08:00:00+00:00" },
    { export_id: "EXP-PACK", name: "ZIP submission pack", format: "ZIP", status: "ready", last_exported: "2026-04-26T08:15:00+00:00" },
  ],
  last_export_dates: { "PDF deck": "2026-04-26T08:00:00+00:00", "ZIP submission pack": "2026-04-26T08:15:00+00:00" },
  recommended_next_steps: ["Record a 90-second demo video from /demo.", "Export the Google Solution Challenge pack.", "Use short judge answers during rapid Q&A."],
  architecture: fallbackSubmissionArchitecture,
  demo_scripts: fallbackDemoScripts,
  team_story: fallbackTeamStory,
};

export const fallbackSubmissionDeck: SubmissionDeck = {
  template: "investor",
  deck_quality_score: 96,
  templates: ["investor", "hackathon", "government"],
  export_formats: ["PDF", "PPTX mock", "Markdown"],
  slides: [
    { slide_id: "INV-01", template: "investor", order: 1, title: "Problem", headline: "Crisis response is fragmented, slow, and blind to human behavior.", bullets: ["Disconnected alerts and manual escalation.", "Most systems detect hazards but do not coordinate response.", "Downtime and panic compound early."], visual: "split-screen chaos vs command" },
    { slide_id: "INV-03", template: "investor", order: 3, title: "Product", headline: "Sentra is an autonomous crisis intelligence operating system.", bullets: ["AI council governs decisions.", "Operations OS executes workflows.", "Digital twin visualizes and replays evidence."], visual: "Sentra command OS architecture" },
  ],
};

export const fallbackSubmissionDocs: SubmissionDocs = {
  doc_score: 95,
  procurement_ready: true,
  security_packet_ready: true,
  case_study_pack: "Grand Meridian Hotel fire-to-recovery narrative",
  documents: [
    { doc_id: "DOC-EXEC", title: "Executive Summary", format: "PDF/DOCX", status: "ready", pages: 3, summary: "Board-ready overview of Sentra, product value, market, impact, and ask." },
    { doc_id: "DOC-TRUST", title: "Security Trust Packet", format: "PDF", status: "ready", pages: 8, summary: "RBAC, MFA, zero trust, compliance, privacy, audit, and vendor risk posture." },
  ],
};

export const fallbackSubmissionJudges: SubmissionJudges = {
  qna_score: 97,
  modes: ["short", "medium", "long"],
  recommended_mode: "short for live judging, medium for written submissions",
  answers: [
    { answer_id: "JA-WHY", question: "Why Sentra?", short: "Sentra turns fragmented emergency tools into one AI crisis command OS.", medium: "Sentra detects incidents, predicts what happens next, models human behavior, coordinates responders, sends targeted alerts, and manages recovery.", long: "Most safety tools stop at alerts. Sentra goes further by connecting hazards, people, operations, communications, resources, recovery, compliance, and executive reporting." },
    { answer_id: "JA-UNIQUE", question: "What makes this unique?", short: "Sentra models people, not just hazards.", medium: "The differentiator is behavior intelligence combined with digital twin, multi-agent AI, operations execution, and governance.", long: "A smoke detector cannot predict panic or reopening readiness. Sentra connects those layers into a closed-loop system." },
  ],
};

export const fallbackSubmissionImpact: SubmissionImpact = {
  impact_score: 97,
  population_protected: 240000,
  government_scale_potential: "city, campus, hospital network, mall group, and smart district deployments",
  proof_statement: "Sentra improves response speed, reduces casualty risk, cuts downtime, and creates audit evidence from detection through recovery.",
  metrics: [
    { metric_id: "IMP-RESPONSE", label: "Response time improved", value: 61, unit: "%", proof: "Auto-dispatch and communications reduce manual delay." },
    { metric_id: "IMP-CASUALTY", label: "Casualty risk reduced", value: 42, unit: "%", proof: "Behavior intelligence and route optimization lower panic and congestion risk." },
    { metric_id: "IMP-DOWNTIME", label: "Downtime reduced", value: 55, unit: "%", proof: "Recovery workflows and reopen governance shorten disruption." },
  ],
};

export const fallbackSubmissionScore: SubmissionScore = {
  overall_score: 96,
  winner_summary: "Sentra combines rare technical depth with memorable demo clarity, measurable impact, and enterprise business readiness.",
  mode_recommendations: {
    google_solution_challenge: ["Lead with SDGs, inclusion, and population protected.", "Show human behavior intelligence and public safety impact."],
    investor: ["Lead with ARR model, moat, marketplace, and data flywheel."],
  },
  categories: [
    { category: "innovation", score: 98, reason: "Human behavior intelligence, AI council, digital twin, and operations execution in one OS." },
    { category: "impact", score: 97, reason: "Targets life safety, continuity, response speed, recovery, and public-sector resilience." },
    { category: "wow_factor", score: 99, reason: "One-click demo and submission engine make the product immediately memorable." },
  ],
};

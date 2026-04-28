import type { DemoExportState, DemoJudgeState, DemoScenesState, DemoSummary, DemoViewState } from "@/lib/demo/types";

export const fallbackScenes: DemoScenesState = {
  state: { active_mode: "judge", active_scene_index: 0, speed: 1, playing: false, fullscreen: false },
  screenplay: [],
  scene_metrics: [],
  scenes: [
    {
      scene_id: "SCN-01-CALM",
      mode: "judge",
      order: 1,
      title: "Calm building baseline",
      what_happened: "Grand Meridian Hotel is operating normally with healthy telemetry and steady occupancy.",
      why_sentra_wins: "Sentra starts with a living operational picture instead of waiting for a 911 call.",
      ai_reasoning: "Baseline telemetry gives the AI confidence that later deviations are real.",
      next_action: "Arm digital twin and watch weak signals.",
      metrics: { risk: 8, confidence: 91, eta: "0 min" },
      caption: "At 10:40 AM, Sentra sees a calm facility before humans notice anything unusual.",
    },
    {
      scene_id: "SCN-02-FIRE",
      mode: "judge",
      order: 2,
      title: "Fire detected in Kitchen Zone B",
      what_happened: "Heat, smoke, and flame signatures converge from IoT telemetry and corridor vision.",
      why_sentra_wins: "The system correlates sensor, camera, and occupancy data into one verified incident.",
      ai_reasoning: "Multiple independent signals raise severity without waiting for manual confirmation.",
      next_action: "Trigger predictive spread and council analysis.",
      metrics: { risk: 82, confidence: 93, eta: "14 min" },
      caption: "At 10:42 AM, fire risk becomes confirmed and Sentra moves from monitoring to command.",
    },
    {
      scene_id: "SCN-05-COUNCIL",
      mode: "judge",
      order: 5,
      title: "Multi-agent council debates",
      what_happened: "Safety, logistics, medical, communications, and executive risk agents compare response strategies.",
      why_sentra_wins: "Multiple specialist AIs debate tradeoffs before the final plan is governed.",
      ai_reasoning: "Partial evacuation minimizes congestion while fire response contains the source.",
      next_action: "Approve phased evacuation with responder dispatch.",
      metrics: { consensus: 94, confidence: 93, risk_delta: -31 },
      caption: "Instead of a single black box, Sentra produces a governed expert consensus.",
    },
    {
      scene_id: "SCN-10-RECOVERY",
      mode: "judge",
      order: 10,
      title: "Recovery complete",
      what_happened: "Hazard clearance, guest relocation, vendor tasks, and reopening approvals complete.",
      why_sentra_wins: "Sentra owns the full crisis lifecycle from detection to reopening.",
      ai_reasoning: "Closeout is allowed only after verification, audit evidence, and human approval.",
      next_action: "Export board report and lessons learned.",
      metrics: { recovery_eta_minutes: 14, loss_reduction: 55, readiness: 96 },
      caption: "Sentra does not just respond. It recovers the business.",
    },
  ],
};
fallbackScenes.screenplay = fallbackScenes.scenes.map((scene) => scene.caption);
fallbackScenes.scene_metrics = fallbackScenes.scenes.map((scene) => scene.metrics);

export const fallbackSummary: DemoSummary = {
  headline: "The most advanced crisis intelligence operating system ever presented in a hackathon or startup pitch.",
  active_mode: "judge",
  active_scene_index: 0,
  scene_count: fallbackScenes.scenes.length,
  demo_modes: [
    { mode_id: "judge", name: "Hackathon Judge Demo", duration_minutes: 5, audience: "judges", promise: "Prove crisis intelligence from detection to recovery in one cinematic arc." },
    { mode_id: "investor", name: "Investor Demo", duration_minutes: 7, audience: "investors", promise: "Show TAM, ARR potential, defensible AI moat, and global scale." },
    { mode_id: "government", name: "Government Demo", duration_minutes: 8, audience: "public sector", promise: "Demonstrate smart city, hospital mesh, and sovereign readiness." },
    { mode_id: "enterprise", name: "Enterprise Demo", duration_minutes: 6, audience: "enterprise buyers", promise: "Run hotel, hospital, campus, mall, and industrial crisis operations." },
  ],
  wow_metrics: [
    { metric_id: "WOW-CASUALTY", label: "Casualty risk reduced", value: 42, suffix: "%", trend: "safer" },
    { metric_id: "WOW-SPEED", label: "Response speed", value: 61, suffix: "%", trend: "faster" },
    { metric_id: "WOW-SAVED", label: "Cost saved", value: 2.1, prefix: "$", suffix: "M", trend: "protected" },
    { metric_id: "WOW-CONFIDENCE", label: "AI confidence", value: 93, suffix: "%", trend: "trusted" },
  ],
  judge_score: 97,
  polish_score: 94,
  launch_status: "flagship ready",
  systems_connected: ["AI", "IoT", "Operations", "Twin", "Security", "Revenue", "Investor", "Behavior", "MLOps", "Channel"],
  presenter_shortcuts: ["Space next", "Left previous", "Right next", "F fullscreen", "D demo mode"],
  state: fallbackScenes.state,
};

export const fallbackJudge: DemoJudgeState = {
  overall_score: 97,
  judge_summary: "Sentra unifies detection, prediction, behavior intelligence, autonomous operations, communications, recovery, and monetization in one governed platform.",
  recommendation: "Open with the live twin, hit the fire climax by minute two, and close on recovery plus board export.",
  technical_highlights: ["Multi-agent AI council", "Hyper digital twin", "Human behavior intelligence", "Enterprise SaaS trust layer"],
  scores: [
    { category: "Innovation", score: 98, reason: "Human behavior, twin, autonomy, and governance combine into one OS." },
    { category: "Technical complexity", score: 96, reason: "Sentra spans IoT, MLOps, AI council, operations, comms, and SaaS." },
    { category: "Real-world impact", score: 97, reason: "Crisis response can reduce harm and downtime across major facilities." },
    { category: "Wow factor", score: 99, reason: "One-click cinematic demo makes the product immediately memorable." },
  ],
};

export const fallbackExports: DemoExportState = {
  latest_pack: "Sentra Phase 20.X launch pack",
  board_report_ready: true,
  investor_one_pager_ready: true,
  screenshot_pack_ready: true,
  evidence_note: "Exports are deterministic demo artifacts backed by scene and judge scoring data.",
  exports: [
    { export_id: "EXP-BOARD", name: "PDF board report", type: "pdf", status: "ready", pages: 14, audience: "board" },
    { export_id: "EXP-INVESTOR", name: "Investor one pager", type: "pdf", status: "ready", pages: 1, audience: "investor" },
    { export_id: "EXP-SCREEN", name: "Screenshot pack", type: "zip", status: "ready", pages: 24, audience: "media" },
  ],
};

export const fallbackDemoState: DemoViewState = {
  summary: fallbackSummary,
  scenes: fallbackScenes,
  judge: fallbackJudge,
  exports: fallbackExports,
  activeIndex: 0,
  playing: false,
  speed: 1,
  fullscreen: false,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

export function demoMetricValue(prefix: string | undefined, value: number, suffix: string) {
  return `${prefix ?? ""}${value}${suffix}`;
}


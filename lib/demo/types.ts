export type DemoEnvelope<T> = {
  generated_at: string;
  data: T;
};

export type DemoMutationResponse = {
  ok: boolean;
  message: string;
  generated_at: string;
  data: Record<string, unknown>;
};

export type DemoMode = {
  mode_id: string;
  name: string;
  duration_minutes: number;
  audience: string;
  promise: string;
};

export type DemoScene = {
  scene_id: string;
  mode: string;
  order: number;
  title: string;
  what_happened: string;
  why_sentra_wins: string;
  ai_reasoning: string;
  next_action: string;
  metrics: Record<string, number | string>;
  caption: string;
};

export type WowMetric = {
  metric_id: string;
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  trend: string;
};

export type DemoStateSnapshot = {
  active_mode: string;
  active_scene_index: number;
  speed: number;
  playing: boolean;
  fullscreen: boolean;
};

export type DemoSummary = {
  headline: string;
  active_mode: string;
  active_scene_index: number;
  scene_count: number;
  demo_modes: DemoMode[];
  wow_metrics: WowMetric[];
  judge_score: number;
  polish_score: number;
  launch_status: string;
  systems_connected: string[];
  presenter_shortcuts: string[];
  state: DemoStateSnapshot;
};

export type DemoScenesState = {
  scenes: DemoScene[];
  state: DemoStateSnapshot;
  screenplay: string[];
  scene_metrics: Record<string, number | string>[];
};

export type JudgeScore = {
  category: string;
  score: number;
  reason: string;
};

export type DemoJudgeState = {
  overall_score: number;
  scores: JudgeScore[];
  judge_summary: string;
  technical_highlights: string[];
  recommendation: string;
};

export type DemoExport = {
  export_id: string;
  name: string;
  type: string;
  status: string;
  pages: number;
  audience: string;
};

export type DemoExportState = {
  exports: DemoExport[];
  latest_pack: string;
  board_report_ready: boolean;
  investor_one_pager_ready: boolean;
  screenshot_pack_ready: boolean;
  evidence_note: string;
};

export type DemoViewState = {
  summary: DemoSummary;
  scenes: DemoScenesState;
  judge: DemoJudgeState;
  exports: DemoExportState;
  activeIndex: number;
  playing: boolean;
  speed: number;
  fullscreen: boolean;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};


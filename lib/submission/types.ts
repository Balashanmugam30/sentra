export type SubmissionMode = {
  mode_id: string;
  name: string;
  priority: string;
  score_weight: Record<string, number>;
};

export type DeckSlide = {
  slide_id: string;
  template: string;
  order: number;
  title: string;
  headline: string;
  bullets: string[];
  visual: string;
};

export type JudgeAnswer = {
  answer_id: string;
  question: string;
  short: string;
  medium: string;
  long: string;
};

export type SubmissionDoc = {
  doc_id: string;
  title: string;
  format: string;
  status: string;
  pages: number;
  summary: string;
};

export type ImpactMetric = {
  metric_id: string;
  label: string;
  value: number;
  unit: string;
  proof: string;
};

export type ArchitectureDiagram = {
  diagram_id: string;
  title: string;
  layers: string[];
  export: string;
};

export type DemoScript = {
  script_id: string;
  mode: string;
  timing: string;
  talking_points: string[];
  screen_sequence: string[];
  wow_moments: string[];
  objections: string[];
  break_glass: string;
};

export type TeamStory = {
  story_id: string;
  title: string;
  body: string;
};

export type ScoreCategory = {
  category: string;
  score: number;
  reason: string;
};

export type SubmissionExport = {
  export_id: string;
  name: string;
  format: string;
  status: string;
  last_exported?: string;
};

export type MissingAsset = {
  asset_id: string;
  title: string;
  priority: string;
  owner: string;
};

export type SubmissionSummary = {
  readiness_score: number;
  selected_mode: string;
  modes: SubmissionMode[];
  pending_missing_assets: MissingAsset[];
  generated_packs: Array<Record<string, unknown>>;
  exports: SubmissionExport[];
  last_export_dates: Record<string, string>;
  recommended_next_steps: string[];
  architecture: SubmissionArchitecture;
  demo_scripts: SubmissionDemoScriptState;
  team_story: SubmissionTeamState;
};

export type SubmissionDeck = {
  template: string;
  slides: DeckSlide[];
  templates: string[];
  export_formats: string[];
  deck_quality_score: number;
};

export type SubmissionDocs = {
  documents: SubmissionDoc[];
  doc_score: number;
  procurement_ready: boolean;
  security_packet_ready: boolean;
  case_study_pack: string;
};

export type SubmissionJudges = {
  answers: JudgeAnswer[];
  modes: string[];
  recommended_mode: string;
  qna_score: number;
};

export type SubmissionImpact = {
  impact_score: number;
  metrics: ImpactMetric[];
  population_protected: number;
  government_scale_potential: string;
  proof_statement: string;
};

export type SubmissionArchitecture = {
  diagrams: ArchitectureDiagram[];
  export_formats: string[];
  architecture_score: number;
  narrative: string;
};

export type SubmissionDemoScriptState = {
  scripts: DemoScript[];
  recovery_line: string;
  script_score: number;
};

export type SubmissionTeamState = {
  story: TeamStory[];
  positioning: string;
  interview_score: number;
};

export type SubmissionScore = {
  overall_score: number;
  categories: ScoreCategory[];
  winner_summary: string;
  mode_recommendations: Record<string, string[]>;
};

export type SubmissionEnvelope<T> = {
  generated_at: string;
  data: T;
};

export type SubmissionMutationResponse = {
  ok: boolean;
  message: string;
  generated_at: string;
  data: Record<string, unknown>;
};

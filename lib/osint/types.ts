export type OsintNewsItem = {
  headline: string;
  source: string;
  published_at: string;
  category: string;
  location_relevance: number;
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
  url: string | null;
};

export type OsintSentimentSummary = {
  positive: number;
  neutral: number;
  negative: number;
  fear: number;
  anger: number;
  urgency: number;
};

export type OsintSignalSpike = {
  signal_id: string;
  keyword: string;
  mention_volume: number;
  baseline: number;
  spike_score: number;
  trend: "rising" | "stable" | "falling";
};

export type OsintRumorItem = {
  rumor_id: string;
  claim: string;
  confidence: "low" | "medium" | "high";
  risk_level: "low" | "medium" | "high" | "critical";
  related_keyword: string;
  recommended_response: string;
};

export type OsintHistoryItem = {
  event_id: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  detail: string;
};

export type OsintExternalAlert = {
  alert_id: string;
  severity: "low" | "medium" | "high" | "critical";
  action: string;
  audience: "executive" | "public" | "operations" | "communications";
  rationale: string;
};

export type OsintLiveResponse = {
  summary_only: boolean;
  partial?: boolean;
  stale_data?: boolean;
  provider: string;
  updated_at: string;
  threat_level: "low" | "medium" | "high" | "critical";
  reputation_risk: number;
  mention_volume: number;
  sentiment_summary: OsintSentimentSummary;
  signal_spikes: OsintSignalSpike[];
  top_keywords: string[];
  external_alerts: OsintExternalAlert[];
  environment_cross_check: boolean;
  public_safety_cross_check: boolean;
};

export type OsintNewsResponse = {
  summary_only: boolean;
  provider: string;
  updated_at: string;
  items: OsintNewsItem[];
};

export type OsintRumorResponse = {
  summary_only: boolean;
  provider: string;
  updated_at: string;
  items: OsintRumorItem[];
};

export type OsintHistoryResponse = {
  summary_only: boolean;
  provider: string;
  updated_at: string;
  events: OsintHistoryItem[];
};

export type OsintScenario =
  | "viral_fire_video"
  | "fake_lockdown_rumor"
  | "protest_near_gate"
  | "toxic_cloud_posts"
  | "media_attention_spike"
  | "competitor_incident"
  | "calm_day";

export type OsintTestScenarioResponse = {
  status: string;
  scenario: OsintScenario;
  live: OsintLiveResponse;
};

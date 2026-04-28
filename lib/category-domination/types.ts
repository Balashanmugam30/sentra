export type CategoryLive = {
  generated_at: string;
  tam: number;
  sam: number;
  som_capture_target: number;
  enterprise_wins: number;
  gov_shortlists: number;
  brand_mentions_month: number;
  positive_sentiment: number;
  analyst_rank: string;
  competitive_win_rate: number;
  nps: number;
  renewal_confidence: number;
  avg_roi_delivered: number;
  ai_accuracy_advantage: number;
  operational_speed_gain: number;
  category_score: number;
  leadership_label: string;
  why_sentra_wins: string;
};

export type RegionCapture = {
  region: string;
  capture: number;
  target: number;
  growth_rate: number;
  priority: string;
};

export type MarketShare = {
  tam: number;
  sam: number;
  som_capture_target: number;
  current_penetration: number;
  target_expansion_percent: number;
  market_capture_velocity: number;
  region_capture_map: RegionCapture[];
  expansion_narrative: string;
};

export type Competitor = {
  competitor_id: string;
  name: string;
  pricing: string;
  weaknesses: string[];
  stale_features: string[];
  trust_issues: string[];
  slow_innovation: number;
  churn_risk: number;
  sentra_win_rate: number;
};

export type Killshot = {
  theme: string;
  sentra_advantage: string;
  competitor_gap: string;
  impact: string;
};

export type WinLoss = {
  win_reasons: string[];
  loss_reasons: string[];
  competitive_win_rate: number;
  replacement_rate: number;
  average_sales_cycle_days: number;
};

export type LeaderboardRow = {
  rank: number;
  company: string;
  category_score: number;
  growth: number;
  trust: number;
  ai_depth: number;
  label: string;
};

export type InfluenceNode = {
  node: string;
  influence: number;
};

export type TrustData = {
  brand: {
    mentions_month: number;
    positive_sentiment: number;
    thought_leadership_score: number;
    social_authority: number;
    press_velocity: number;
    influence_graph: InfluenceNode[];
  };
  customer: {
    logos_won: number;
    testimonials: string[];
    nps: number;
    uptime_trust: number;
    renewal_confidence: number;
    retention_quality: string;
  };
  government: {
    gov_shortlists: number;
    procurement_readiness: number;
    compliance_trust: number;
    sovereign_fit: number;
    defense_suitability: number;
    badges: string[];
  };
  enterprise: {
    enterprise_wins: number;
    pipeline_quality: number;
    average_contract_value: number;
    replacement_deals: number;
    multi_module_attach_rate: number;
    top_verticals: string[];
  };
  analyst: {
    rank: string;
    position: string;
    growth_class: string;
    execution_class: string;
    innovation_class: string;
    quadrant: Array<{ company: string; vision: number; execution: number }>;
  };
};

export type Benchmark = {
  avg_roi_delivered: number;
  ai_accuracy_advantage: number;
  operational_speed_gain: number;
  cost_savings: number;
  response_time_gain: number;
  platform_depth_advantage: number;
  comparisons: Array<{ metric: string; sentra: number; competitor_average: number; unit: string }>;
};

export type Narrative = {
  narratives: Array<{ title: string; message: string; proof: string }>;
  board_story: string;
  investor_headline: string;
  procurement_headline: string;
};

export type CategoryScore = {
  category_score: number;
  leadership_label: string;
  market_share_score: number;
  brand_authority_score: number;
  trust_score: number;
  benchmark_score: number;
  analyst_score: number;
  government_trust_score: number;
  narrative_control_score: number;
  momentum: string;
};

export type CategoryMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};


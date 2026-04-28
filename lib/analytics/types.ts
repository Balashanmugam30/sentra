export type AnalyticsGlobalStatus = "normal" | "elevated" | "critical";
export type AnalyticsCardStatus = "excellent" | "good" | "watch" | "critical";
export type HotspotMovement = "up" | "down" | "stable";
export type FinancialImpactLevel = "low" | "moderate" | "high" | "severe";
export type OperationalContinuity = "stable" | "degraded" | "disrupted";
export type ReputationRiskLevel = "low" | "medium" | "high";
export type DecisionState = "stable" | "elevated" | "critical" | "emergency";
export type MutualAidNeed = "none" | "consider" | "recommended" | "immediate";
export type ForecastContinuity = "stable" | "strained" | "degraded" | "critical";
export type ScenarioPresetCategory =
  | "life_safety"
  | "operations"
  | "resources"
  | "continuity";
export type ScenarioWinner = "option_a" | "option_b" | "tie";

export type AnalyticsSummary = {
  active_incidents: number;
  critical_incidents: number;
  resolved_today: number;
  alerts_sent: number;
  zones_impacted: number;
};

export type AnalyticsKpis = {
  avg_response_minutes: number;
  avg_resolution_minutes: number;
  containment_success_rate: number;
  evacuation_success_rate: number;
  resource_utilization: number;
};

export type AnalyticsLiveResponse = {
  generated_at: string;
  global_status: AnalyticsGlobalStatus;
  summary: AnalyticsSummary;
  kpis: AnalyticsKpis;
  top_risks: string[];
  next_actions: string[];
};

export type AnalyticsKpiCard = {
  key: string;
  label: string;
  value: string;
  status: AnalyticsCardStatus;
};

export type AnalyticsKpiCardsResponse = {
  generated_at: string;
  cards: AnalyticsKpiCard[];
};

export type AnalyticsHourlyCountPoint = {
  hour: string;
  count: number;
};

export type AnalyticsHourlyMinutesPoint = {
  hour: string;
  minutes: number;
};

export type AnalyticsHourlyPercentPoint = {
  hour: string;
  percent: number;
};

export type AnalyticsTrendsResponse = {
  generated_at: string;
  window: string;
  incident_volume: AnalyticsHourlyCountPoint[];
  response_time: AnalyticsHourlyMinutesPoint[];
  alerts_sent: AnalyticsHourlyCountPoint[];
  resource_load: AnalyticsHourlyPercentPoint[];
  trend_flags: string[];
};

export type AnalyticsHotspotZone = {
  zone: string;
  risk_score: number;
  incident_count: number;
  movement: HotspotMovement;
};

export type AnalyticsHotspotsResponse = {
  generated_at: string;
  zones: AnalyticsHotspotZone[];
  recurring_patterns: string[];
  recommended_focus: string[];
};

export type ExecutiveThreatItem = {
  title: string;
  severity: "critical" | "high" | "watch";
};

export type ExecutiveAnalyticsResponse = {
  generated_at: string;
  global_status: AnalyticsGlobalStatus;
  executive_risk_score: number;
  organization_readiness: number;
  financial_impact_level: FinancialImpactLevel;
  operational_continuity: OperationalContinuity;
  top_threats: ExecutiveThreatItem[];
  strategic_priorities: string[];
  recommended_decisions: string[];
  board_summary: string[];
};

export type ReadinessScorecardItem = {
  label: string;
  score: number;
  status: AnalyticsCardStatus;
};

export type AnalyticsReadinessResponse = {
  generated_at: string;
  scorecards: ReadinessScorecardItem[];
  overall_readiness: number;
};

export type ForecastTimeWindowItem = {
  minute: number;
  risk_score: number;
  continuity: ForecastContinuity;
  expected_disruption: string;
};

export type ForecastMetrics = {
  containment_probability: number;
  escalation_probability: number;
  evac_completion_probability: number;
  resource_recovery_probability: number;
};

export type AnalyticsForecastResponse = {
  generated_at: string;
  time_windows: ForecastTimeWindowItem[];
  metrics: ForecastMetrics;
  financial_exposure: FinancialImpactLevel;
  reputation_risk: ReputationRiskLevel;
  recovery_eta_minutes: number;
  executive_summary: string[];
};

export type BoardroomActionItem = {
  priority: number;
  title: string;
  impact: string;
  urgency: string;
};

export type AnalyticsBoardroomResponse = {
  generated_at: string;
  decision_state: DecisionState;
  recommended_actions: BoardroomActionItem[];
  mutual_aid_need: MutualAidNeed;
  business_modes: string[];
  best_mode: string;
  delay_cost_per_15min: string;
  top_dependencies: string[];
  board_message: string[];
};

export type ScenarioPresetItem = {
  id: string;
  title: string;
  category: ScenarioPresetCategory;
};

export type ScenarioLabRequest = {
  option_a: string;
  option_b: string;
};

export type ScenarioLabOptionResult = {
  title: string;
  casualty_risk: number;
  containment_probability: number;
  recovery_eta_minutes: number;
  downtime_minutes: number;
  financial_impact: FinancialImpactLevel;
  reputation_risk: ReputationRiskLevel;
  overall_score: number;
};

export type AnalyticsScenarioLabResponse = {
  generated_at: string;
  current_state: DecisionState;
  comparison: {
    option_a: ScenarioLabOptionResult;
    option_b: ScenarioLabOptionResult;
  };
  winner: ScenarioWinner;
  recommended_choice: string;
  decision_reasoning: string[];
  executive_summary: string[];
};

export type AnalyticsHubMetric = {
  metric_id: string;
  tenant_id: string;
  domain: "executive" | "crisis" | "ai" | "government" | string;
  label: string;
  value: number;
  unit: string;
  trend: number;
  insight: string;
};

export type AnalyticsHubForecast = {
  forecast_id: string;
  domain: string;
  prediction: string;
  probability: number;
  impact: string;
  action: string;
};

export type AnalyticsHubSummary = {
  analytics_supremacy_score: number;
  domains: string[];
  metrics: Record<string, AnalyticsHubMetric[]>;
  scenario_simulator: {
    options: string[];
    recommended: string;
    confidence: number;
  };
};

export type AnalyticsHubForecastState = {
  forecasts: AnalyticsHubForecast[];
  highest_risk: AnalyticsHubForecast[];
  next_best_moves: string[];
};

export type AnalyticsHubEnvelope<T> = {
  generated_at: string;
  data: T;
};

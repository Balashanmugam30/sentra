export type BehaviorCompliance = {
  obey_immediately: number;
  delay_then_comply: number;
  ignore_warning: number;
  move_opposite_direction: number;
};

export type BehaviorZone = {
  zone_id: string;
  tenant_id: string;
  name: string;
  population: number;
  density: number;
  exits: number;
  visible_exits: number;
  smoke_level: number;
  fire_severity: number;
  alarm_clarity: number;
  alarm_status: string;
  language_mix: string[];
  avg_age_band: string;
  mobility_percent: number;
  visibility_score: number;
  noise_level: number;
  previous_alerts: number;
  leadership_presence: number;
  conflicting_instructions: number;
  time_pressure: number;
  updated_at: string;
  panic_score: number;
  freeze_score: number;
  compliance: BehaviorCompliance;
  vulnerability_score: number;
  vulnerable_occupants: number;
  herd_score: number;
  bottleneck_score: number;
  recommended_communication: string;
  intervention: string;
  explanation: string;
};

export type BehaviorSummary = {
  generated_at: string;
  human_risk_score: number;
  panic_index: number;
  freeze_risk: number;
  compliance_confidence: number;
  evacuation_confidence: number;
  vulnerable_occupants: number;
  bottleneck_risk: number;
  highest_risk_zone: string;
  recommended_style: string;
  trust_score: number;
  population_modeled: number;
  at_risk_population: number;
};

export type BehaviorRecommendation = {
  recommendation_id: string;
  zone: string;
  priority: "critical" | "high" | "watch" | string;
  message_style: string;
  action: string;
  confidence: number;
  why: string;
};

export type BehaviorExecutive = {
  generated_at: string;
  occupant_stability_score: number;
  panic_spread_risk: number;
  evacuation_confidence: number;
  at_risk_population: number;
  recommended_executive_actions: string[];
  public_safety_narrative: string;
};

export type BehaviorMetricData = Record<string, unknown>;

export type BehaviorSnapshot = {
  summary: BehaviorSummary;
  zones: BehaviorZone[];
  panic: BehaviorMetricData;
  freeze: BehaviorMetricData;
  compliance: BehaviorMetricData;
  vulnerable: BehaviorMetricData;
  recommendations: BehaviorRecommendation[];
  executive: BehaviorExecutive;
};

export type BehaviorMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};


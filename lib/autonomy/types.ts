export type AutonomyMode = "advisory" | "approval_required" | "semi_auto" | "full_auto" | "lockdown_mode";

export type AutonomyMetrics = {
  tenant_id: string;
  decision_supremacy: number;
  trust_score: number;
  learning_improvement_percent: number;
  accepted_decisions_percent: number;
  rejected_decisions_percent: number;
  override_rate_percent: number;
  best_objective: string;
  avg_recovery_eta_minutes: number;
  playbooks_learned: number;
  prediction_accuracy_percent: number;
  self_heal_success_percent: number;
  human_confidence: number;
  board_confidence: number;
  current_objective: string;
  autonomy_mode: AutonomyMode;
  updated_at: string;
};

export type AutonomyLiveResponse = {
  provider: string;
  mode: string;
  generated_at: string;
  metrics: AutonomyMetrics;
  top_decision: Record<string, unknown>;
  active_objective: Record<string, unknown>;
  plan_summary: Record<string, unknown>;
  prediction_summary: Record<string, unknown>;
  trust_summary: Record<string, unknown>;
  health_summary: Record<string, unknown>;
  reasoning_summary: string;
  recommended_actions: Array<Record<string, unknown>>;
};

export type AutonomyDataResponse = {
  provider: string;
  generated_at: string;
  data: Record<string, unknown>;
};

export type AutonomyMutationResponse = {
  status: string;
  generated_at: string;
  event: Record<string, unknown>;
  data: Record<string, unknown>;
};


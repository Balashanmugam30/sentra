import type { OperationWorkflow } from "@/lib/operations/types";

export type ResilienceGlobalState =
  | "healthy"
  | "watch"
  | "degraded"
  | "recovering"
  | "critical";

export type CircuitState = "closed" | "open" | "half_open";
export type ProviderHealthStatus = "ready" | "standby" | "degraded" | "offline";
export type ResilienceScenario =
  | "provider_failure"
  | "workflow_stall"
  | "approval_timeout"
  | "multi_failure"
  | "network_partition";

export type ResilienceMetrics = {
  retries_attempted: number;
  fallbacks_used: number;
  circuits_open: number;
  stalled_workflows: number;
  timeouts_today: number;
  recoveries_completed: number;
};

export type ResilienceProvider = {
  name: string;
  status: ProviderHealthStatus;
  circuit_state: CircuitState;
  failures: number;
  last_success_at: string | null;
};

export type ResilienceLiveResponse = {
  generated_at: string;
  global_state: ResilienceGlobalState;
  metrics: ResilienceMetrics;
  providers: ResilienceProvider[];
  active_incidents: string[];
  recommended_actions: string[];
};

export type ResilienceEvent = {
  timestamp: string;
  message: string;
};

export type ResilienceHistoryResponse = {
  generated_at: string;
  events: ResilienceEvent[];
};

export type ResilienceRunTestRequest = {
  scenario: ResilienceScenario;
};

export type ResilienceRunTestResponse = {
  status: string;
  scenario: ResilienceScenario;
  global_state: ResilienceGlobalState;
};

export type ResetCircuitRequest = {
  provider: string;
};

export type ResetCircuitResponse = {
  status: string;
  provider: string;
  circuit_state: CircuitState;
};

export type RecoverWorkflowRequest = {
  workflow_id: string;
};

export type RecoverWorkflowResponse = {
  status: string;
  workflow: OperationWorkflow;
};

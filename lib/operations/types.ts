export type WorkflowStatus =
  | "queued"
  | "running"
  | "paused"
  | "awaiting_approval"
  | "completed"
  | "cancelled"
  | "failed";

export type WorkflowPriority = "low" | "medium" | "high" | "critical";

export type WorkflowStepType =
  | "notification"
  | "dispatch"
  | "lockdown"
  | "escalation"
  | "approval"
  | "monitoring"
  | "handoff"
  | "audit";

export type WorkflowGlobalState = "stable" | "elevated" | "critical";
export type WorkflowScenario =
  | "critical_fire"
  | "gas_leak"
  | "mass_panic"
  | "comms_failure";

export type OperationStep = {
  step_id: string;
  title: string;
  type: WorkflowStepType;
  status: WorkflowStatus;
  requires_approval: boolean;
  assigned_system: string;
  eta_seconds: number;
  action_name: string | null;
  required_role: string | null;
  approval_id: string | null;
};

export type OperationWorkflow = {
  workflow_id: string;
  title: string;
  trigger_source: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  affected_target: string;
  progress_percent: number;
  current_step: string | null;
  steps: OperationStep[];
};

export type OperationsLiveResponse = {
  generated_at: string;
  global_state: WorkflowGlobalState;
  active_workflows_count: number;
  awaiting_approvals_count: number;
  completed_today: number;
  failed_today: number;
  workflows: OperationWorkflow[];
};

export type OperationsHistoryResponse = {
  generated_at: string;
  workflows: OperationWorkflow[];
};

export type RunTestRequest = {
  scenario: WorkflowScenario;
};

export type RunTestResponse = {
  status: "created" | "updated";
  workflow: OperationWorkflow;
};

export type ApproveRequest = {
  workflow_id: string;
  step_id: string;
};

export type ApproveResponse = {
  status: "approved" | "completed";
  workflow: OperationWorkflow;
};

export type CancelRequest = {
  workflow_id: string;
};

export type CancelResponse = {
  status: "cancelled";
  workflow: OperationWorkflow;
};

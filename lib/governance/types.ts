import type { OperationWorkflow } from "@/lib/operations/types";

export type GovernanceStatus = "stable" | "elevated" | "critical";
export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "overridden";

export type ApprovalRequest = {
  approval_id: string;
  workflow_id: string;
  step_id: string;
  action_name: string;
  required_role: string;
  status: ApprovalStatus;
  requested_at: string;
  resolved_at: string | null;
  requested_by: string;
  resolved_by: string | null;
  notes: string | null;
};

export type RoleLoad = {
  role: string;
  pending_count: number;
};

export type GovernanceLiveResponse = {
  generated_at: string;
  global_status: GovernanceStatus;
  pending_approvals_count: number;
  paused_workflows_count: number;
  overrides_today: number;
  recent_requests: ApprovalRequest[];
  role_loads: RoleLoad[];
};

export type AuditAction =
  | "approval_requested"
  | "approval_granted"
  | "approval_rejected"
  | "workflow_paused"
  | "workflow_resumed"
  | "emergency_override"
  | "approval_reassigned";

export type AuditEvent = {
  timestamp: string;
  actor: string;
  action: AuditAction;
  workflow_id: string | null;
  approval_id: string | null;
  result: string;
  notes: string | null;
};

export type GovernanceAuditResponse = {
  generated_at: string;
  audit_events: AuditEvent[];
};

export type GovernanceActionResponse = {
  status: string;
  approval: ApprovalRequest | null;
  workflow: OperationWorkflow | null;
};

export type GovernanceApproveRequest = {
  approval_id: string;
  actor: string;
  notes?: string;
};

export type GovernanceRejectRequest = {
  approval_id: string;
  actor: string;
  notes?: string;
};

export type GovernancePauseRequest = {
  workflow_id: string;
  actor: string;
};

export type GovernanceResumeRequest = {
  workflow_id: string;
  actor: string;
};

export type GovernanceOverrideRequest = {
  workflow_id: string;
  actor: string;
  reason: string;
};

export type GovernanceReassignRequest = {
  approval_id: string;
  new_role: string;
};

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.operations.schemas import OperationWorkflow


GovernanceStatus = Literal["stable", "elevated", "critical"]
ApprovalStatus = Literal["pending", "approved", "rejected", "expired", "overridden"]
AuditAction = Literal[
    "approval_requested",
    "approval_granted",
    "approval_rejected",
    "workflow_paused",
    "workflow_resumed",
    "emergency_override",
    "approval_reassigned",
]


class ApprovalRequest(BaseModel):
    approval_id: str
    workflow_id: str
    step_id: str
    action_name: str
    required_role: str
    status: ApprovalStatus
    requested_at: datetime
    resolved_at: datetime | None = None
    requested_by: str
    resolved_by: str | None = None
    notes: str | None = None


class RoleLoad(BaseModel):
    role: str
    pending_count: int = Field(..., ge=0)


class GovernanceLiveResponse(BaseModel):
    generated_at: datetime
    global_status: GovernanceStatus
    pending_approvals_count: int = Field(..., ge=0)
    paused_workflows_count: int = Field(..., ge=0)
    overrides_today: int = Field(..., ge=0)
    recent_requests: list[ApprovalRequest]
    role_loads: list[RoleLoad]


class AuditEvent(BaseModel):
    timestamp: datetime
    actor: str
    action: AuditAction
    workflow_id: str | None = None
    approval_id: str | None = None
    result: str
    notes: str | None = None


class GovernanceAuditResponse(BaseModel):
    generated_at: datetime
    audit_events: list[AuditEvent]


class ApproveGovernanceRequest(BaseModel):
    approval_id: str
    actor: str
    notes: str | None = None


class RejectGovernanceRequest(BaseModel):
    approval_id: str
    actor: str
    notes: str | None = None


class PauseWorkflowRequest(BaseModel):
    workflow_id: str
    actor: str


class ResumeWorkflowRequest(BaseModel):
    workflow_id: str
    actor: str


class OverrideWorkflowRequest(BaseModel):
    workflow_id: str
    actor: str
    reason: str


class ReassignApprovalRequest(BaseModel):
    approval_id: str
    new_role: str


class GovernanceActionResponse(BaseModel):
    status: str
    approval: ApprovalRequest | None = None
    workflow: OperationWorkflow | None = None

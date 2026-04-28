from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


WorkflowStatus = Literal[
    "queued",
    "running",
    "paused",
    "awaiting_approval",
    "completed",
    "cancelled",
    "failed",
]
WorkflowPriority = Literal["low", "medium", "high", "critical"]
WorkflowStepType = Literal[
    "notification",
    "dispatch",
    "lockdown",
    "escalation",
    "approval",
    "monitoring",
    "handoff",
    "audit",
]
WorkflowGlobalState = Literal["stable", "elevated", "critical"]
WorkflowScenario = Literal["critical_fire", "gas_leak", "mass_panic", "comms_failure"]


class OperationStep(BaseModel):
    step_id: str
    title: str
    type: WorkflowStepType
    status: WorkflowStatus
    requires_approval: bool
    assigned_system: str
    eta_seconds: int = Field(..., ge=0)
    action_name: str | None = None
    required_role: str | None = None
    approval_id: str | None = None


class OperationWorkflow(BaseModel):
    workflow_id: str
    title: str
    trigger_source: str
    status: WorkflowStatus
    priority: WorkflowPriority
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    affected_target: str
    progress_percent: int = Field(..., ge=0, le=100)
    current_step: str | None = None
    steps: list[OperationStep]


class OperationsLiveResponse(BaseModel):
    generated_at: datetime
    global_state: WorkflowGlobalState
    active_workflows_count: int = Field(..., ge=0)
    awaiting_approvals_count: int = Field(..., ge=0)
    completed_today: int = Field(..., ge=0)
    failed_today: int = Field(..., ge=0)
    workflows: list[OperationWorkflow]


class OperationsHistoryResponse(BaseModel):
    generated_at: datetime
    workflows: list[OperationWorkflow]


class RunTestRequest(BaseModel):
    scenario: WorkflowScenario


class RunTestResponse(BaseModel):
    status: Literal["created", "updated"]
    workflow: OperationWorkflow


class ApproveRequest(BaseModel):
    workflow_id: str
    step_id: str


class ApproveResponse(BaseModel):
    status: Literal["approved", "completed"]
    workflow: OperationWorkflow


class CancelRequest(BaseModel):
    workflow_id: str


class CancelResponse(BaseModel):
    status: Literal["cancelled"]
    workflow: OperationWorkflow

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.integrations.connectors import PROVIDER_NAMES
from app.operations.schemas import OperationWorkflow


ResilienceGlobalState = Literal["healthy", "watch", "degraded", "recovering", "critical"]
CircuitState = Literal["closed", "open", "half_open"]
ProviderHealthStatus = Literal["ready", "standby", "degraded", "offline"]
ResilienceScenario = Literal[
    "provider_failure",
    "workflow_stall",
    "approval_timeout",
    "multi_failure",
    "network_partition",
]


class ResilienceMetrics(BaseModel):
    retries_attempted: int = Field(..., ge=0)
    fallbacks_used: int = Field(..., ge=0)
    circuits_open: int = Field(..., ge=0)
    stalled_workflows: int = Field(..., ge=0)
    timeouts_today: int = Field(..., ge=0)
    recoveries_completed: int = Field(..., ge=0)


class ResilienceProvider(BaseModel):
    name: str
    status: ProviderHealthStatus
    circuit_state: CircuitState
    failures: int = Field(..., ge=0)
    last_success_at: datetime | None = None


class ResilienceEvent(BaseModel):
    timestamp: datetime
    message: str


class ResilienceLiveResponse(BaseModel):
    generated_at: datetime
    global_state: ResilienceGlobalState
    metrics: ResilienceMetrics
    providers: list[ResilienceProvider]
    active_incidents: list[str]
    recommended_actions: list[str]


class ResilienceHistoryResponse(BaseModel):
    generated_at: datetime
    events: list[ResilienceEvent]


class ResilienceRunTestRequest(BaseModel):
    scenario: ResilienceScenario


class ResilienceRunTestResponse(BaseModel):
    status: str
    scenario: ResilienceScenario
    global_state: ResilienceGlobalState


class ResetCircuitRequest(BaseModel):
    provider: str


class ResetCircuitResponse(BaseModel):
    status: str
    provider: str
    circuit_state: CircuitState


class RecoverWorkflowRequest(BaseModel):
    workflow_id: str


class RecoverWorkflowResponse(BaseModel):
    status: str
    workflow: OperationWorkflow

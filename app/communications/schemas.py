from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ChannelName = Literal[
    "in_app",
    "sms",
    "email",
    "whatsapp",
    "voice",
    "siren",
    "executive_notice",
    "radio",
]
AlertPriority = Literal["normal", "elevated", "high", "critical"]
AudienceType = Literal["occupants", "responders", "executives"]
N8nStatus = Literal["ready", "connected", "disabled"]
RoleName = Literal[
    "occupants",
    "responders",
    "executives",
    "security",
    "medical",
    "facility_staff",
]
ProviderStatus = Literal["ready", "mock", "standby"]
AckStatusInput = Literal[
    "SAFE",
    "NEED_HELP",
    "TRAPPED",
    "EVACUATED",
    "ON_SITE",
    "TEAM_DEPLOYED",
    "MEDICAL_REQUIRED",
    "FALSE_ALARM",
]
AckStatus = Literal[
    "safe",
    "need_help",
    "trapped",
    "evacuated",
    "on_site",
    "team_deployed",
    "medical_required",
    "false_alarm",
]
AckPriority = Literal["low", "normal", "elevated", "high", "critical"]


class CommunicationAlertItem(BaseModel):
    zone: str
    priority: AlertPriority
    title: str
    message: str
    channels: list[ChannelName]
    audience: AudienceType


class DeliveryStatus(BaseModel):
    queued: int = Field(..., ge=0)
    sent: int = Field(..., ge=0)
    failed: int = Field(..., ge=0)


class CommunicationsLiveResponse(BaseModel):
    generated_at: datetime
    global_level: AlertPriority
    active_channels: list[ChannelName]
    alerts: list[CommunicationAlertItem]
    delivery_status: DeliveryStatus
    templates_used: list[str]
    next_actions: list[str]
    n8n_status: N8nStatus


class SendTestRequest(BaseModel):
    channel: ChannelName
    target: str
    message: str


class SendTestResponse(BaseModel):
    status: Literal["sent", "queued", "failed"]
    receipt_id: str
    n8n_triggered: bool


class BroadcastRequest(BaseModel):
    severity: AlertPriority
    zones: list[str]
    message: str


class BroadcastResponse(BaseModel):
    status: Literal["completed"]
    fanout_count: int = Field(..., ge=0)
    channels: list[ChannelName]
    n8n_triggered: bool


class RoleMessageItem(BaseModel):
    role: RoleName
    zone: str
    priority: AlertPriority
    title: str
    message: str
    channels: list[ChannelName]


class RoleCommunicationsResponse(BaseModel):
    generated_at: datetime
    global_level: AlertPriority
    roles_active: list[RoleName]
    messages: list[RoleMessageItem]
    delivery_summary: DeliveryStatus
    next_escalations: list[str]
    n8n_status: N8nStatus


class RoleTestRequest(BaseModel):
    role: RoleName
    zone: str


class RoleTestResponse(BaseModel):
    status: Literal["sent", "queued", "failed"]
    role: RoleName
    zone: str
    receipt_id: str
    n8n_triggered: bool


class IntegrationProviderItem(BaseModel):
    name: Literal["whatsapp", "email", "slack", "teams", "sms", "voice"]
    status: ProviderStatus


class DeliveryQueueSummary(BaseModel):
    pending: int = Field(..., ge=0)
    sent: int = Field(..., ge=0)
    failed: int = Field(..., ge=0)
    retried: int = Field(..., ge=0)


class CommunicationsIntegrationsResponse(BaseModel):
    generated_at: datetime
    n8n_status: N8nStatus
    webhook_configured: bool
    providers: list[IntegrationProviderItem]
    queue: DeliveryQueueSummary
    recent_events: list[str]


class TestWebhookRequest(BaseModel):
    event: str
    channel: ChannelName


class TestWebhookResponse(BaseModel):
    status: Literal["delivered", "queued", "failed"]
    provider: Literal["n8n"]
    webhook_response: str
    receipt_id: str


class RetryFailedResponse(BaseModel):
    status: Literal["completed"]
    retried: int = Field(..., ge=0)
    remaining_failed: int = Field(..., ge=0)


class AckTotals(BaseModel):
    alerts_sent: int = Field(..., ge=0)
    acknowledged: int = Field(..., ge=0)
    need_help: int = Field(..., ge=0)
    trapped: int = Field(..., ge=0)
    evacuated: int = Field(..., ge=0)
    pending: int = Field(..., ge=0)


class AcknowledgementItem(BaseModel):
    id: str
    zone: str
    role: RoleName
    status: AckStatus
    priority: AckPriority
    message: str
    received_at: datetime


class CommunicationsAcksResponse(BaseModel):
    generated_at: datetime
    global_level: AlertPriority
    totals: AckTotals
    responses: list[AcknowledgementItem]
    hotspots: list[str]
    recommended_actions: list[str]
    n8n_status: N8nStatus


class AckRespondRequest(BaseModel):
    zone: str
    role: RoleName
    status: AckStatusInput
    message: str


class AckRespondResponse(BaseModel):
    status: Literal["received"]
    ack_id: str
    priority: AckPriority
    n8n_triggered: bool


class AckBulkTestRequest(BaseModel):
    zone: str
    count: int = Field(..., ge=1, le=20)
    status: AckStatusInput


class AckBulkTestResponse(BaseModel):
    status: Literal["completed"]
    created: int = Field(..., ge=0)
    n8n_triggered: bool

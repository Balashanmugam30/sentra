from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.communications.acknowledgements import (
    generate_acknowledgement_snapshot,
    submit_ack_response,
    submit_bulk_test,
)
from app.communications.engine import (
    broadcast_alert,
    generate_live_communications,
    get_integrations_overview,
    retry_failed_deliveries,
    send_test_alert,
    test_webhook_delivery,
)
from app.communications.roles import generate_role_communications, send_role_test
from app.communications.schemas import (
    AckBulkTestRequest,
    AckBulkTestResponse,
    AckRespondRequest,
    AckRespondResponse,
    BroadcastRequest,
    BroadcastResponse,
    CommunicationsAcksResponse,
    CommunicationsIntegrationsResponse,
    CommunicationsLiveResponse,
    RetryFailedResponse,
    RoleCommunicationsResponse,
    RoleTestRequest,
    RoleTestResponse,
    SendTestRequest,
    SendTestResponse,
    TestWebhookRequest,
    TestWebhookResponse,
)
from app.offline.engine import queue_event_if_needed
from app.services.incident_service import get_all_incidents

router = APIRouter(prefix="/communications", tags=["Communications"])


@router.get("/live", response_model=CommunicationsLiveResponse)
def get_live_communications_route() -> CommunicationsLiveResponse:
    incidents = get_all_incidents()
    snapshot = generate_live_communications(incidents)

    return CommunicationsLiveResponse(
        generated_at=datetime.now(timezone.utc),
        global_level=snapshot["global_level"],
        active_channels=snapshot["active_channels"],
        alerts=snapshot["alerts"],
        delivery_status=snapshot["delivery_status"],
        templates_used=snapshot["templates_used"],
        next_actions=snapshot["next_actions"],
        n8n_status=snapshot["n8n_status"],
    )


@router.post("/send-test", response_model=SendTestResponse)
async def post_send_test(payload: SendTestRequest) -> SendTestResponse:
    result = await send_test_alert(payload.channel, payload.target, payload.message)
    queue_event_if_needed(
        source="communications",
        event_type="send_test",
        payload={
            "channel": payload.channel,
            "target": payload.target,
            "message": payload.message,
        },
        applied_locally=True,
    )
    return SendTestResponse(**result)


@router.post("/broadcast", response_model=BroadcastResponse)
async def post_broadcast(payload: BroadcastRequest) -> BroadcastResponse:
    result = await broadcast_alert(payload.severity, payload.zones, payload.message)
    queue_event_if_needed(
        source="communications",
        event_type="broadcast",
        payload={
            "severity": payload.severity,
            "zones": list(payload.zones),
            "message": payload.message,
        },
        applied_locally=True,
    )
    return BroadcastResponse(**result)


@router.get("/roles", response_model=RoleCommunicationsResponse)
def get_role_communications_route() -> RoleCommunicationsResponse:
    incidents = get_all_incidents()
    snapshot = generate_role_communications(incidents)

    return RoleCommunicationsResponse(
        generated_at=datetime.now(timezone.utc),
        global_level=snapshot["global_level"],
        roles_active=snapshot["roles_active"],
        messages=snapshot["messages"],
        delivery_summary=snapshot["delivery_summary"],
        next_escalations=snapshot["next_escalations"],
        n8n_status=snapshot["n8n_status"],
    )


@router.post("/send-role-test", response_model=RoleTestResponse)
async def post_send_role_test(payload: RoleTestRequest) -> RoleTestResponse:
    result = await send_role_test(payload.role, payload.zone)
    queue_event_if_needed(
        source="communications",
        event_type="role_test",
        payload={
            "role": payload.role,
            "zone": payload.zone,
        },
        applied_locally=True,
    )
    return RoleTestResponse(**result)


@router.get("/integrations", response_model=CommunicationsIntegrationsResponse)
def get_communications_integrations() -> CommunicationsIntegrationsResponse:
    snapshot = get_integrations_overview()

    return CommunicationsIntegrationsResponse(
        generated_at=datetime.now(timezone.utc),
        n8n_status=snapshot["n8n_status"],
        webhook_configured=snapshot["webhook_configured"],
        providers=snapshot["providers"],
        queue=snapshot["queue"],
        recent_events=snapshot["recent_events"],
    )


@router.post("/test-webhook", response_model=TestWebhookResponse)
async def post_test_webhook(payload: TestWebhookRequest) -> TestWebhookResponse:
    result = await test_webhook_delivery(payload.event, payload.channel)
    return TestWebhookResponse(**result)


@router.post("/retry-failed", response_model=RetryFailedResponse)
async def post_retry_failed() -> RetryFailedResponse:
    result = await retry_failed_deliveries()
    return RetryFailedResponse(**result)


@router.get("/acks", response_model=CommunicationsAcksResponse)
def get_communications_acks() -> CommunicationsAcksResponse:
    incidents = get_all_incidents()
    snapshot = generate_acknowledgement_snapshot(incidents)

    return CommunicationsAcksResponse(
        generated_at=datetime.now(timezone.utc),
        global_level=snapshot["global_level"],
        totals=snapshot["totals"],
        responses=snapshot["responses"],
        hotspots=snapshot["hotspots"],
        recommended_actions=snapshot["recommended_actions"],
        n8n_status=snapshot["n8n_status"],
    )


@router.post("/respond", response_model=AckRespondResponse)
async def post_communications_respond(payload: AckRespondRequest) -> AckRespondResponse:
    result = await submit_ack_response(
        payload.zone,
        payload.role,
        payload.status,
        payload.message,
    )
    queue_event_if_needed(
        source="communications",
        event_type="acknowledgement",
        payload={
            "zone": payload.zone,
            "role": payload.role,
            "status": payload.status,
            "message": payload.message,
        },
        applied_locally=True,
    )
    return AckRespondResponse(**result)


@router.post("/respond-bulk-test", response_model=AckBulkTestResponse)
async def post_communications_bulk_test(payload: AckBulkTestRequest) -> AckBulkTestResponse:
    result = await submit_bulk_test(payload.zone, payload.count, payload.status)
    return AckBulkTestResponse(**result)

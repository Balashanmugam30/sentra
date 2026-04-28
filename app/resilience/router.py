from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.resilience.recovery import (
    get_resilience_history_snapshot,
    get_resilience_live_snapshot,
    recover_stalled_workflow,
    reset_resilience_circuit,
    run_resilience_test,
)
from app.rbac.guard import get_optional_identity, require_any_permission
from app.offline.engine import mode_note
from app.resilience.schemas import (
    RecoverWorkflowRequest,
    RecoverWorkflowResponse,
    ResetCircuitRequest,
    ResetCircuitResponse,
    ResilienceHistoryResponse,
    ResilienceLiveResponse,
    ResilienceRunTestRequest,
    ResilienceRunTestResponse,
)
from app.services.incident_service import get_all_incidents
from app.tenancy.context import identity_tenant_cache_key

router = APIRouter(prefix="/resilience", tags=["Resilience"])


@router.get("/live", response_model=ResilienceLiveResponse)
def get_resilience_live_route(
    identity: dict[str, object] | None = Depends(get_optional_identity),
) -> ResilienceLiveResponse:
    def build() -> ResilienceLiveResponse:
        incidents = get_all_incidents()
        snapshot = get_resilience_live_snapshot(incidents)
        note = mode_note()
        recommended_actions = list(snapshot["recommended_actions"])
        if note and note not in recommended_actions:
            recommended_actions = [note, *recommended_actions]
        return ResilienceLiveResponse(
            generated_at=datetime.now(timezone.utc),
            global_state=snapshot["global_state"],
            metrics=snapshot["metrics"],
            providers=snapshot["providers"],
            active_incidents=snapshot["active_incidents"],
            recommended_actions=recommended_actions[:4],
        )

    key = identity_tenant_cache_key(identity, "resilience:live") if identity else "tenant:public:resilience:live"
    return cached_call(key, 5, build)


@router.get("/history", response_model=ResilienceHistoryResponse)
def get_resilience_history_route(
    identity: dict[str, object] | None = Depends(get_optional_identity),
) -> ResilienceHistoryResponse:
    def build() -> ResilienceHistoryResponse:
        incidents = get_all_incidents()
        snapshot = get_resilience_history_snapshot(incidents)
        return ResilienceHistoryResponse(
            generated_at=datetime.now(timezone.utc),
            events=snapshot["events"],
        )

    key = identity_tenant_cache_key(identity, "resilience:history") if identity else "tenant:public:resilience:history"
    return cached_call(key, 10, build)


@router.post("/run-test", response_model=ResilienceRunTestResponse)
def post_resilience_run_test_route(payload: ResilienceRunTestRequest) -> ResilienceRunTestResponse:
    incidents = get_all_incidents()
    result = run_resilience_test(payload.scenario, incidents)
    clear_runtime_cache("resilience:")
    return ResilienceRunTestResponse(
        status=result["status"],
        scenario=result["scenario"],
        global_state=result["global_state"],
    )


@router.post("/reset-circuit", response_model=ResetCircuitResponse)
def post_reset_circuit_route(
    request: Request,
    payload: ResetCircuitRequest,
    identity: dict[str, object] = Depends(require_any_permission("operations.manage", "governance.approve")),
) -> ResetCircuitResponse:
    result = reset_resilience_circuit(payload.provider)
    clear_runtime_cache("resilience:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "resilience:"))
    append_audit_event(
        category="resilience",
        action="reset_circuit",
        severity="medium",
        target_module="resilience",
        status="success",
        reason=f"Circuit reset for {payload.provider}",
        request=request,
        identity=identity,
        target_id=payload.provider,
        risk_score=32,
    )
    return ResetCircuitResponse(
        status=result["status"],
        provider=result["provider"],
        circuit_state=result["circuit_state"],
    )


@router.post("/recover-workflow", response_model=RecoverWorkflowResponse)
def post_recover_workflow_route(
    request: Request,
    payload: RecoverWorkflowRequest,
    identity: dict[str, object] = Depends(require_any_permission("operations.manage", "governance.approve")),
) -> RecoverWorkflowResponse:
    incidents = get_all_incidents()
    try:
        result = recover_stalled_workflow(payload.workflow_id, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("resilience:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "resilience:"))
    append_audit_event(
        category="resilience",
        action="recover_workflow",
        severity="medium",
        target_module="resilience",
        status="success",
        reason="Workflow recovery executed",
        request=request,
        identity=identity,
        target_id=payload.workflow_id,
        risk_score=37,
    )
    return RecoverWorkflowResponse(
        status=result["status"],
        workflow=result["workflow"],
    )

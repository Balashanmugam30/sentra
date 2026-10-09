from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.operations.adapters import adapter_registry, idempotency_ledger
from app.operations.domain import (
    ActionProposalRecord,
    ActionType,
    AdapterOutcome,
    AutonomyMode,
    AutonomyState,
    OperationLifecycleStatus,
    PlaybookDefinition,
    PlaybookStatus,
    ResponsePlanRecord,
    SafetyDecision,
    SimulationResult,
    SimulationScenario,
    TimelineEventRecord,
    compute_proposal_hash,
)
from app.operations.engine import (
    approve_workflow_step,
    cancel_workflow,
    get_live_operations_snapshot,
    get_operations_history_snapshot,
    run_test_workflow,
)
from app.operations.orchestrator import orchestrator
from app.operations.playbooks import playbook_engine
from app.operations.safety_gate import safety_gate
from app.operations.schemas import (
    ApproveProposalRequest,
    ApproveRequest,
    ApproveResponse,
    CancelRequest,
    CancelResponse,
    ExecuteProposalRequest,
    KillSwitchRequest,
    OperationsHistoryResponse,
    OperationsLiveResponse,
    OrchestrateIncidentRequest,
    RejectProposalRequest,
    RunSimulationRequest,
    RunTestRequest,
    RunTestResponse,
    SetAutonomyModeRequest,
)
from app.operations.simulator import simulator_engine
from app.operations.state_machine import IllegalStateTransitionError, lease_manager
from app.operations.store import operations_store
from app.operations.timeline import timeline_store
from app.rbac.guard import require_permission
from app.services.incident_service import get_all_incidents
from app.tenancy.context import identity_tenant_cache_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/operations", tags=["Operations"])


# ==============================================================================
# LEGACY WORKFLOW ENDPOINTS (Phase 2 & 3 Backward Compatibility)
# ==============================================================================


@router.get("/live", response_model=OperationsLiveResponse)
def get_live_operations_route(
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> OperationsLiveResponse:
    def build() -> OperationsLiveResponse:
        incidents = get_all_incidents()
        snapshot = get_live_operations_snapshot(incidents)
        return OperationsLiveResponse(
            generated_at=datetime.now(timezone.utc),
            global_state=snapshot["global_state"],
            active_workflows_count=snapshot["active_workflows_count"],
            awaiting_approvals_count=snapshot["awaiting_approvals_count"],
            completed_today=snapshot["completed_today"],
            failed_today=snapshot["failed_today"],
            workflows=snapshot["workflows"],
        )

    return cached_call(identity_tenant_cache_key(identity, "operations:live"), 5, build)


@router.get("/history", response_model=OperationsHistoryResponse)
def get_operations_history_route(
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> OperationsHistoryResponse:
    def build() -> OperationsHistoryResponse:
        incidents = get_all_incidents()
        snapshot = get_operations_history_snapshot(incidents)
        return OperationsHistoryResponse(
            generated_at=datetime.now(timezone.utc),
            workflows=snapshot["workflows"],
        )

    return cached_call(identity_tenant_cache_key(identity, "operations:history"), 10, build)


@router.post("/run-test", response_model=RunTestResponse)
def post_run_test_route(
    request: Request,
    payload: RunTestRequest,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> RunTestResponse:
    incidents = get_all_incidents()
    result = run_test_workflow(payload.scenario, incidents)
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))
    clear_runtime_cache("operations:")
    clear_runtime_cache("governance:")
    append_audit_event(
        category="operations",
        action="workflow_run",
        severity="high",
        target_module="operations",
        status="success",
        reason=f"Workflow scenario {payload.scenario} launched",
        request=request,
        identity=identity,
        target_id=result["workflow"].workflow_id,
        risk_score=62,
    )
    return RunTestResponse(
        status=result["status"],
        workflow=result["workflow"],
    )


@router.post("/approve", response_model=ApproveResponse)
def post_approve_route(
    request: Request,
    payload: ApproveRequest,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> ApproveResponse:
    incidents = get_all_incidents()
    try:
        result = approve_workflow_step(payload.workflow_id, payload.step_id, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("operations:")
    clear_runtime_cache("governance:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))

    append_audit_event(
        category="operations",
        action="approval",
        severity="medium",
        target_module="operations",
        status="success",
        reason=f"Approved workflow step {payload.step_id}",
        request=request,
        identity=identity,
        target_id=payload.workflow_id,
        risk_score=42,
    )
    return ApproveResponse(
        status=result["status"],
        workflow=result["workflow"],
    )


@router.post("/cancel", response_model=CancelResponse)
def post_cancel_route(
    request: Request,
    payload: CancelRequest,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> CancelResponse:
    incidents = get_all_incidents()
    try:
        result = cancel_workflow(payload.workflow_id, incidents)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    clear_runtime_cache("operations:")
    clear_runtime_cache("governance:")
    clear_runtime_cache(identity_tenant_cache_key(identity, "operations:"))
    clear_runtime_cache(identity_tenant_cache_key(identity, "governance:"))

    append_audit_event(
        category="operations",
        action="cancel",
        severity="high",
        target_module="operations",
        status="success",
        reason="Workflow cancelled",
        request=request,
        identity=identity,
        target_id=payload.workflow_id,
        risk_score=58,
    )
    return CancelResponse(
        status=result["status"],
        workflow=result["workflow"],
    )


# ==============================================================================
# PHASE 6 AUTONOMOUS CRISIS OPERATIONS ENDPOINTS
# ==============================================================================


@router.get("/readiness")
def get_operations_readiness() -> Dict[str, Any]:
    """Operational subsystem readiness check for Phase 6."""
    autonomy = operations_store.get_autonomy_state()
    playbooks = playbook_engine.list_playbooks()
    adapters = adapter_registry.list_adapters()
    return {
        "status": "ready",
        "phase": 6,
        "engine": "Autonomous Crisis Operations",
        "autonomy_mode": autonomy.mode.value,
        "kill_switch_engaged": autonomy.kill_switch_engaged,
        "active_playbooks_count": len(playbooks),
        "registered_adapters_count": len(adapters),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/mode", response_model=AutonomyState)
def get_autonomy_mode_route(
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> AutonomyState:
    """Returns current autonomy mode and emergency kill-switch status."""
    return operations_store.get_autonomy_state()


@router.post("/mode", response_model=AutonomyState)
def set_autonomy_mode_route(
    request: Request,
    payload: SetAutonomyModeRequest,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> AutonomyState:
    """Updates operational autonomy mode with mandatory attribution."""
    try:
        mode = AutonomyMode(payload.mode)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=f"Invalid autonomy mode: {payload.mode}") from err

    user_id = str(identity.get("id") or identity.get("sub") or "unknown_operator")
    updated = operations_store.set_autonomy_mode(mode=mode, updated_by=user_id, reason=payload.reason)

    append_audit_event(
        category="operations",
        action="autonomy_mode_update",
        severity="high",
        target_module="operations",
        status="success",
        reason=f"Autonomy mode updated to {mode.value}: {payload.reason}",
        request=request,
        identity=identity,
        target_id=mode.value,
        risk_score=75,
    )
    return updated


@router.post("/kill-switch", response_model=AutonomyState)
def set_kill_switch_route(
    request: Request,
    payload: KillSwitchRequest,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> AutonomyState:
    """Emergency stop: trip or reset the central operational kill switch."""
    user_id = str(identity.get("id") or identity.get("sub") or "unknown_operator")
    updated = operations_store.set_kill_switch(
        engaged=payload.engaged,
        actor_id=user_id,
        reason=payload.reason,
    )

    append_audit_event(
        category="operations",
        action="kill_switch_tripped" if payload.engaged else "kill_switch_reset",
        severity="critical" if payload.engaged else "high",
        target_module="operations",
        status="success",
        reason=f"Emergency kill switch {'ENGAGED' if payload.engaged else 'RESET'}: {payload.reason}",
        request=request,
        identity=identity,
        target_id="KILL_SWITCH",
        risk_score=95 if payload.engaged else 50,
    )
    return updated


@router.get("/playbooks", response_model=List[PlaybookDefinition])
def list_playbooks_route(
    status: Optional[str] = Query(None),
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> List[PlaybookDefinition]:
    """Lists versioned crisis playbooks with DAG validation metadata."""
    pb_status = None
    if status:
        try:
            pb_status = PlaybookStatus(status.upper())
        except ValueError:
            pass
    return playbook_engine.list_playbooks(status=pb_status)


@router.get("/playbooks/{playbook_id}", response_model=PlaybookDefinition)
def get_playbook_route(
    playbook_id: str,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> PlaybookDefinition:
    """Retrieves a single crisis playbook definition."""
    pb = playbook_engine.get_playbook(playbook_id)
    if not pb:
        raise HTTPException(status_code=404, detail=f"Playbook '{playbook_id}' not found.")
    return pb


@router.get("/incidents/{incident_id}/state")
def get_incident_lifecycle_state_route(
    incident_id: str,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> Dict[str, Any]:
    """Returns the operational lifecycle state machine status for an incident."""
    st = operations_store.get_incident_state(incident_id)
    return {
        "incident_id": incident_id,
        "state": st.value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/incidents/{incident_id}/orchestrate", response_model=ResponsePlanRecord)
def orchestrate_incident_route(
    incident_id: str,
    payload: OrchestrateIncidentRequest,
    request: Request,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> ResponsePlanRecord:
    """Triggers Incident Commander operational cycle to generate response plan & proposals."""
    user_id = str(identity.get("id") or identity.get("sub") or "commander_operator")
    try:
        plan = orchestrator.orchestrate_incident(
            incident_id=incident_id,
            actor_id=user_id,
            simulated=payload.simulated,
        )
    except IllegalStateTransitionError as err:
        raise HTTPException(status_code=409, detail=str(err)) from err

    append_audit_event(
        category="operations",
        action="incident_orchestrated",
        severity="medium",
        target_module="operations",
        status="success",
        reason=f"Incident Commander orchestrated tactical plan {plan.plan_id}",
        request=request,
        identity=identity,
        target_id=incident_id,
        risk_score=55,
    )
    return plan


@router.get("/incidents/{incident_id}/plan", response_model=ResponsePlanRecord)
def get_incident_plan_route(
    incident_id: str,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> ResponsePlanRecord:
    """Retrieves latest tactical response plan for an incident."""
    plan = operations_store.get_latest_plan_for_incident(incident_id)
    if not plan:
        raise HTTPException(status_code=404, detail=f"No response plan found for incident '{incident_id}'.")
    return plan


@router.get("/proposals", response_model=List[ActionProposalRecord])
def list_proposals_route(
    incident_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> List[ActionProposalRecord]:
    """Lists action proposals pending approval or execution."""
    lifecycle_status = None
    if status:
        try:
            lifecycle_status = OperationLifecycleStatus(status.upper())
        except ValueError:
            pass
    return operations_store.list_proposals(incident_id=incident_id, status=lifecycle_status)


@router.get("/proposals/{proposal_id}", response_model=ActionProposalRecord)
def get_proposal_route(
    proposal_id: str,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> ActionProposalRecord:
    """Retrieves single action proposal by ID."""
    proposal = operations_store.get_proposal(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal '{proposal_id}' not found.")
    return proposal


@router.post("/proposals/{proposal_id}/evaluate")
def evaluate_proposal_safety_route(
    proposal_id: str,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> Dict[str, Any]:
    """Runs deterministic Action Safety Gate evaluation for a proposal."""
    proposal = operations_store.get_proposal(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal '{proposal_id}' not found.")

    autonomy = operations_store.get_autonomy_state()
    decision, reasons = safety_gate.evaluate_proposal(
        proposal=proposal,
        autonomy_state=autonomy,
        evidence_confidence=0.88,
        target_adapter_configured=True,
    )
    return {
        "proposal_id": proposal_id,
        "decision": decision.value,
        "reasons": reasons,
        "autonomy_mode": autonomy.mode.value,
        "kill_switch_engaged": autonomy.kill_switch_engaged,
    }


@router.post("/proposals/{proposal_id}/approve", response_model=ActionProposalRecord)
def approve_proposal_route(
    proposal_id: str,
    payload: ApproveProposalRequest,
    request: Request,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> ActionProposalRecord:
    """Human operator authorizes an action proposal with hash verification."""
    proposal = operations_store.get_proposal(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal '{proposal_id}' not found.")

    user_id = str(identity.get("id") or identity.get("sub") or "human_commander")

    # Two-person integrity check: proposer cannot be approver for high/critical actions
    if proposal.proposer_id == user_id:
        raise HTTPException(
            status_code=403,
            detail="Two-person integrity policy: Proposer cannot approve their own action proposal.",
        )

    # Concurrency lease
    if not lease_manager.acquire_lease(proposal_id, user_id, ttl_seconds=15.0):
        raise HTTPException(status_code=409, detail="Proposal is currently locked by another concurrent operation.")

    try:
        now = datetime.now(timezone.utc)
        if now > proposal.expires_at:
            proposal.status = OperationLifecycleStatus.EXPIRED
            operations_store.update_proposal(proposal)
            raise HTTPException(status_code=410, detail="Action proposal has expired.")

        # Re-compute proposal hash to tie approval to exact payload
        p_hash = compute_proposal_hash(
            proposal.action_type.value,
            proposal.target_zone,
            proposal.parameters,
            proposal.incident_id,
            proposal.tenant_id,
        )

        proposal.approved_by = user_id
        proposal.approved_at = now
        proposal.approval_hash = p_hash
        proposal.status = OperationLifecycleStatus.APPROVED

        operations_store.update_proposal(proposal)

        timeline_store.append_event(
            incident_id=proposal.incident_id,
            event_type="PROPOSAL_APPROVED",
            source="human_operator",
            actor_id=user_id,
            actor_role="commander",
            summary=f"Operator {user_id} approved action '{proposal.title}' (Hash: {p_hash[:12]}...).",
            details={"proposal_id": proposal_id, "approval_hash": p_hash, "notes": payload.notes},
        )

        append_audit_event(
            category="operations",
            action="proposal_approved",
            severity="high",
            target_module="operations",
            status="success",
            reason=f"Action proposal {proposal_id} approved by {user_id}",
            request=request,
            identity=identity,
            target_id=proposal_id,
            risk_score=70,
        )
        return proposal
    finally:
        lease_manager.release_lease(proposal_id, user_id)


@router.post("/proposals/{proposal_id}/reject", response_model=ActionProposalRecord)
def reject_proposal_route(
    proposal_id: str,
    payload: RejectProposalRequest,
    request: Request,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> ActionProposalRecord:
    """Human operator rejects an action proposal."""
    proposal = operations_store.get_proposal(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal '{proposal_id}' not found.")

    user_id = str(identity.get("id") or identity.get("sub") or "human_commander")
    proposal.status = OperationLifecycleStatus.REJECTED
    proposal.rejection_reason = payload.rejection_reason
    operations_store.update_proposal(proposal)

    timeline_store.append_event(
        incident_id=proposal.incident_id,
        event_type="PROPOSAL_REJECTED",
        source="human_operator",
        actor_id=user_id,
        actor_role="commander",
        summary=f"Operator {user_id} rejected action '{proposal.title}': {payload.rejection_reason}.",
        details={"proposal_id": proposal_id, "reason": payload.rejection_reason},
    )

    append_audit_event(
        category="operations",
        action="proposal_rejected",
        severity="medium",
        target_module="operations",
        status="success",
        reason=f"Proposal {proposal_id} rejected by {user_id}: {payload.rejection_reason}",
        request=request,
        identity=identity,
        target_id=proposal_id,
        risk_score=35,
    )
    return proposal


@router.post("/proposals/{proposal_id}/execute")
def execute_proposal_route(
    proposal_id: str,
    payload: ExecuteProposalRequest,
    request: Request,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> Dict[str, Any]:
    """Dispatches approved action through designated execution adapter with idempotency."""
    proposal = operations_store.get_proposal(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal '{proposal_id}' not found.")

    user_id = str(identity.get("id") or identity.get("sub") or "dispatcher")

    # Acquire lease
    if not lease_manager.acquire_lease(proposal_id, user_id, ttl_seconds=30.0):
        raise HTTPException(status_code=409, detail="Action is currently executing or leased by another worker.")

    try:
        # Check idempotency ledger first
        existing_receipt = idempotency_ledger.get_existing(payload.idempotency_key)
        if existing_receipt:
            return {
                "status": "idempotent_replay",
                "receipt": existing_receipt.model_dump(),
                "proposal": proposal.model_dump(),
            }

        autonomy = operations_store.get_autonomy_state()

        # Re-evaluate Safety Gate immediately before execution
        decision, reasons = safety_gate.evaluate_proposal(
            proposal=proposal,
            autonomy_state=autonomy,
            evidence_confidence=0.88,
            target_adapter_configured=True,
            is_simulation=payload.is_simulation,
        )

        if decision == SafetyDecision.DENY:
            raise HTTPException(
                status_code=403,
                detail=f"Safety Gate DENIED execution: {'; '.join(reasons)}",
            )
        if decision == SafetyDecision.REQUIRE_HUMAN_APPROVAL and proposal.status != OperationLifecycleStatus.APPROVED:
            raise HTTPException(
                status_code=403,
                detail="Action requires prior verified operator approval before dispatch.",
            )

        # Transition status to EXECUTING
        proposal.status = OperationLifecycleStatus.EXECUTING
        proposal.execution_idempotency_key = payload.idempotency_key
        operations_store.update_proposal(proposal)

        # Select adapter
        adapter = adapter_registry.get_adapter_for_action(
            action_type=proposal.action_type,
            is_simulation=payload.is_simulation,
        )

        # Execute
        receipt = adapter.execute(
            proposal=proposal,
            idempotency_key=payload.idempotency_key,
            simulate_timeout=payload.simulate_timeout,
        )

        # Update proposal state
        if receipt.outcome in {AdapterOutcome.SUCCESS, AdapterOutcome.SIMULATED}:
            proposal.status = OperationLifecycleStatus.EXECUTED
        elif receipt.outcome == AdapterOutcome.EXECUTION_OUTCOME_UNKNOWN:
            proposal.status = OperationLifecycleStatus.FAILED
            proposal.rejection_reason = "Target system timeout: outcome unknown. Operator reconciliation required."
        else:
            proposal.status = OperationLifecycleStatus.FAILED
            proposal.rejection_reason = receipt.message

        proposal.execution_outcome = receipt.outcome
        proposal.adapter_name = receipt.adapter_name
        proposal.adapter_details = receipt.details
        operations_store.update_proposal(proposal)

        timeline_store.append_event(
            incident_id=proposal.incident_id,
            event_type="ACTION_EXECUTED",
            source=receipt.adapter_name,
            actor_id=user_id,
            actor_role="dispatcher",
            summary=f"Action '{proposal.title}' dispatched via {receipt.adapter_name}: {receipt.outcome.value}.",
            details=receipt.model_dump(),
            is_simulation=payload.is_simulation,
        )

        append_audit_event(
            category="operations",
            action="action_executed",
            severity="high",
            target_module="operations",
            status="success" if receipt.outcome in {AdapterOutcome.SUCCESS, AdapterOutcome.SIMULATED} else "failed",
            reason=f"Action {proposal_id} outcome: {receipt.outcome.value} via {receipt.adapter_name}",
            request=request,
            identity=identity,
            target_id=proposal_id,
            risk_score=78,
        )

        return {
            "status": "executed",
            "outcome": receipt.outcome.value,
            "receipt": receipt.model_dump(),
            "proposal": proposal.model_dump(),
        }
    finally:
        lease_manager.release_lease(proposal_id, user_id)


@router.get("/adapters")
def list_adapters_route(
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> List[Dict[str, Any]]:
    """Lists registered operational adapters, versions, and capabilities."""
    return adapter_registry.list_adapters()


@router.get("/incidents/{incident_id}/timeline", response_model=List[TimelineEventRecord])
def get_incident_timeline_route(
    incident_id: str,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> List[TimelineEventRecord]:
    """Retrieves continuous unified incident timeline events."""
    return timeline_store.get_events(incident_id=incident_id)


@router.get("/timeline", response_model=List[TimelineEventRecord])
def get_global_timeline_route(
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> List[TimelineEventRecord]:
    """Retrieves global operational timeline events."""
    return timeline_store.get_events()


@router.get("/simulations/scenarios", response_model=List[SimulationScenario])
def list_simulation_scenarios_route(
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> List[SimulationScenario]:
    """Lists What-If crisis simulation scenario presets."""
    return simulator_engine.list_scenarios()


@router.post("/simulations/run", response_model=SimulationResult)
def run_simulation_route(
    payload: RunSimulationRequest,
    request: Request,
    identity: dict[str, object] = Depends(require_permission("operations.manage")),
) -> SimulationResult:
    """Runs deterministic What-If simulation with strict simulation boundary."""
    preset = None
    if payload.scenario_id:
        preset = simulator_engine.get_scenario(payload.scenario_id)

    scenario = SimulationScenario(
        scenario_id=(
            payload.scenario_id or preset.scenario_id
            if preset
            else f"SCEN-CUSTOM-{datetime.now(timezone.utc).strftime('%H%M%S')}"
        ),
        name=payload.name or (preset.name if preset else "Custom Crisis Scenario"),
        description=preset.description if preset else "Operator-configured what-if crisis projection.",
        incident_id=payload.incident_id,
        ambient_temp_delta=(
            payload.ambient_temp_delta
            if payload.ambient_temp_delta != 0.0
            else (preset.ambient_temp_delta if preset else 0.0)
        ),
        spread_rate_mult=(
            payload.spread_rate_mult
            if payload.spread_rate_mult != 1.0
            else (preset.spread_rate_mult if preset else 1.0)
        ),
        sensor_outage_zones=payload.sensor_outage_zones or (preset.sensor_outage_zones if preset else []),
        blocked_routes=payload.blocked_routes or (preset.blocked_routes if preset else []),
        dispatch_delay_seconds=payload.dispatch_delay_seconds or (preset.dispatch_delay_seconds if preset else 0),
        is_simulation=True,
    )

    result = simulator_engine.run_simulation(scenario)

    user_id = str(identity.get("id") or identity.get("sub") or "simulator_operator")
    timeline_store.append_event(
        incident_id=payload.incident_id,
        event_type="SIMULATION_RUN",
        source="what_if_simulator",
        actor_id=user_id,
        actor_role="analyst",
        summary=f"Ran What-If Simulation '{scenario.name}': projected containment {result.projected_containment_prob * 100:.1f}%.",
        details=result.model_dump(),
        is_simulation=True,
    )

    append_audit_event(
        category="operations",
        action="simulation_run",
        severity="low",
        target_module="operations",
        status="success",
        reason=f"What-If simulation executed: {scenario.name}",
        request=request,
        identity=identity,
        target_id=result.simulation_id,
        risk_score=10,
    )
    return result

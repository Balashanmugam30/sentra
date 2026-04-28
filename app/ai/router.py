from __future__ import annotations

from datetime import datetime, timezone
from typing import Callable, TypeVar

from fastapi import APIRouter, Depends, Request

from app.core.config import settings
from app.core.runtime_cache import cached_call
from app.ai.decision_engine import (
    build_autonomous_snapshot,
    get_explanations,
    get_memory,
    record_decision,
    run_cycle,
    set_autonomy_mode,
    set_test_scenario,
)
from app.ai.orchestration import (
    build_comms_brain,
    build_facility_brain,
    build_orchestration_snapshot,
    build_predictive_forecast,
    build_resource_rebalancer,
    build_scenario_branches,
    build_strategy_timeline,
    compare_strategies,
    execute_plan,
    run_forecast_cycle,
    set_response_autonomy_mode,
)
from app.ai.schemas import (
    AIActionRequest,
    AIActionResponse,
    AICouncilActionRequest,
    AICouncilDataResponse,
    AICouncilRunRequest,
    AIExecutePlanRequest,
    AIOverrideRequest,
    AIRunCycleRequest,
    AISetAutonomyModeRequest,
    AIStrategicScenarioRequest,
    AITestScenarioRequest,
    AIDecisionDataResponse,
    AIDecisionResponse,
    AIDecisionRunRequest,
    AIDecisionScenarioLoadRequest,
    AIWeakSignalScenarioRequest,
    AdvancedMemoryResponse,
    AutonomousLiveResponse,
    BehaviorResponse,
    CampaignPlanResponse,
    CascadeResponse,
    CinematicDemoResponse,
    CommsBrainResponse,
    ConfidenceDriftResponse,
    CopilotExecuteRequest,
    CopilotResponse,
    CouncilSnapshot,
    DebateV2Response,
    ExplanationsResponse,
    FacilityBrainResponse,
    MemoryResponse,
    MultiAgentCouncilResponse,
    NegotiationResponse,
    OrchestrationResponse,
    PolicyEvolutionResponse,
    PredictiveForecastResponse,
    RecommendationsResponse,
    ResourceRebalancerResponse,
    ScenarioBranchesResponse,
    SpecialistAgentsResponse,
    StrategyTimelineResponse,
    SupremacyScoreResponse,
    SwarmResponse,
    TrustDashboardResponse,
    WeakSignalsResponse,
)
from app.ai.behavior import build_behavior_snapshot
from app.ai.cascade import build_cascade_snapshot, test_cascade_scenario
from app.ai.copilot import build_copilot_snapshot, build_supremacy_score, execute_copilot_intent, run_cinematic_demo
from app.ai.negotiation import build_negotiation_snapshot
from app.ai.strategic_learning import (
    build_campaign_plan,
    build_confidence_drift,
    build_debate_v2,
    build_memory_advanced,
    build_policy_evolution,
    build_specialist_agents,
    build_trust_dashboard,
    build_weak_signals,
    retrain_policies,
    run_debate,
    run_learning_cycle,
    simulate_campaign,
    test_weak_signal,
)
from app.ai.swarm import build_swarm_snapshot
from app.ai.service import (
    get_current_decision,
    get_forecast as get_decision_forecast,
    get_resources as get_decision_resources,
    get_summary as get_decision_summary,
    list_decision_scenarios,
    load_decision_scenario,
    run_decision,
)
from app.ai.council_service import build_council_snapshot
from app.audit.engine import append_audit_event
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ai", tags=["Autonomous Intelligence"])
T = TypeVar("T")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _identity_scope(identity: dict[str, object]) -> str:
    return str(
        identity.get("tenant_id")
        or identity.get("tenantId")
        or identity.get("organization_slug")
        or identity.get("org")
        or "global"
    )


def _ai_cached(scope: str, key: str, builder: Callable[[], T], ttl_seconds: float | None = None) -> T:
    ttl = ttl_seconds if ttl_seconds is not None else settings.prediction_cache_ttl_seconds
    return cached_call(f"ai:{scope}:{key}", ttl, builder)


@router.get("/live", response_model=AutonomousLiveResponse)
def get_ai_live_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomousLiveResponse:
    return _ai_cached(
        _identity_scope(identity),
        "live",
        lambda: AutonomousLiveResponse(**build_autonomous_snapshot()),
        ttl_seconds=min(settings.prediction_cache_ttl_seconds, 30),
    )


@router.get("/recommendations", response_model=RecommendationsResponse)
def get_ai_recommendations_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> RecommendationsResponse:
    def build() -> RecommendationsResponse:
        snapshot = build_autonomous_snapshot()
        return RecommendationsResponse(
            generated_at=snapshot["generated_at"],
            recommendations=snapshot["recommended_actions"],
        )

    return _ai_cached(
        _identity_scope(identity),
        "recommendations",
        build,
        ttl_seconds=min(settings.prediction_cache_ttl_seconds, 30),
    )


@router.get("/council", response_model=MultiAgentCouncilResponse)
def get_ai_council_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> MultiAgentCouncilResponse:
    return MultiAgentCouncilResponse(**build_council_snapshot())


@router.get("/explanations", response_model=ExplanationsResponse)
def get_ai_explanations_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> ExplanationsResponse:
    return ExplanationsResponse(
        generated_at=_now(),
        explanations=get_explanations(),
    )


@router.get("/memory", response_model=MemoryResponse)
def get_ai_memory_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> MemoryResponse:
    episodes = get_memory()
    return MemoryResponse(
        generated_at=_now(),
        episodes=episodes,
        lessons=[str(item["lesson"]) for item in episodes[:5]],
    )


@router.get("/predict", response_model=PredictiveForecastResponse)
def get_ai_predict_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> PredictiveForecastResponse:
    return _ai_cached(
        _identity_scope(identity),
        "predict",
        lambda: PredictiveForecastResponse(**build_predictive_forecast()),
    )


@router.get("/scenarios", response_model=ScenarioBranchesResponse)
def get_ai_scenarios_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> ScenarioBranchesResponse:
    return _ai_cached(
        _identity_scope(identity),
        "scenarios",
        lambda: ScenarioBranchesResponse(**build_scenario_branches()),
    )


@router.get("/orchestration", response_model=OrchestrationResponse)
def get_ai_orchestration_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrchestrationResponse:
    return _ai_cached(
        _identity_scope(identity),
        "orchestration",
        lambda: OrchestrationResponse(**build_orchestration_snapshot()),
    )


@router.get("/resources", response_model=ResourceRebalancerResponse)
def get_ai_resources_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> ResourceRebalancerResponse:
    return _ai_cached(
        _identity_scope(identity),
        "resources",
        lambda: ResourceRebalancerResponse(**build_resource_rebalancer()),
    )


@router.get("/facility-brain", response_model=FacilityBrainResponse)
def get_ai_facility_brain_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> FacilityBrainResponse:
    return _ai_cached(
        _identity_scope(identity),
        "facility-brain",
        lambda: FacilityBrainResponse(**build_facility_brain()),
    )


@router.get("/comms", response_model=CommsBrainResponse)
def get_ai_comms_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> CommsBrainResponse:
    return _ai_cached(
        _identity_scope(identity),
        "comms",
        lambda: CommsBrainResponse(**build_comms_brain()),
    )


@router.get("/timeline", response_model=StrategyTimelineResponse)
def get_ai_timeline_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> StrategyTimelineResponse:
    return StrategyTimelineResponse(**build_strategy_timeline())


@router.get("/memory-advanced", response_model=AdvancedMemoryResponse)
def get_ai_memory_advanced_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AdvancedMemoryResponse:
    return AdvancedMemoryResponse(**build_memory_advanced())


@router.get("/agents", response_model=SpecialistAgentsResponse)
def get_ai_agents_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> SpecialistAgentsResponse:
    return SpecialistAgentsResponse(**build_specialist_agents())


@router.get("/debate", response_model=DebateV2Response)
def get_ai_debate_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> DebateV2Response:
    return _ai_cached(
        _identity_scope(identity),
        "debate",
        lambda: DebateV2Response(**build_debate_v2()),
    )


@router.get("/weak-signals", response_model=WeakSignalsResponse)
def get_ai_weak_signals_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> WeakSignalsResponse:
    return WeakSignalsResponse(**build_weak_signals())


@router.get("/policies", response_model=PolicyEvolutionResponse)
def get_ai_policies_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> PolicyEvolutionResponse:
    return PolicyEvolutionResponse(**build_policy_evolution())


@router.get("/confidence", response_model=ConfidenceDriftResponse)
def get_ai_confidence_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> ConfidenceDriftResponse:
    return ConfidenceDriftResponse(**build_confidence_drift())


@router.get("/campaign", response_model=CampaignPlanResponse)
def get_ai_campaign_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> CampaignPlanResponse:
    return CampaignPlanResponse(**build_campaign_plan())


@router.get("/trust", response_model=TrustDashboardResponse)
def get_ai_trust_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> TrustDashboardResponse:
    return TrustDashboardResponse(**build_trust_dashboard())


@router.get("/decision", response_model=AIDecisionResponse)
def get_ai_decision_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AIDecisionResponse:
    return AIDecisionResponse(**get_current_decision())


@router.post("/decision/run", response_model=AIDecisionResponse)
def post_ai_decision_run_route(
    request: Request,
    payload: AIDecisionRunRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AIDecisionResponse:
    result = run_decision(payload.scenario_id)
    append_audit_event(
        category="system",
        action="ai_decision_run",
        severity="high" if int(result["scores"]["severity_score"]) >= 82 else "medium",
        target_module="ai",
        target_id=str(result["scenario_id"]),
        status="success",
        reason=f"AI decision core recommended {result['recommended_strategy']['name']}",
        request=request,
        identity=identity,
        risk_score=int(result["scores"]["severity_score"]),
    )
    return AIDecisionResponse(**result)


@router.post("/scenarios/load", response_model=AIDecisionResponse)
def post_ai_scenarios_load_route(
    request: Request,
    payload: AIDecisionScenarioLoadRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AIDecisionResponse:
    result = load_decision_scenario(payload.scenario_id)
    append_audit_event(
        category="system",
        action="ai_decision_scenario_loaded",
        severity="low",
        target_module="ai",
        target_id=payload.scenario_id,
        status="success",
        reason=f"Decision scenario loaded: {payload.scenario_id}",
        request=request,
        identity=identity,
        risk_score=18,
        is_demo=True,
    )
    return AIDecisionResponse(**result)


@router.get("/decision/scenarios", response_model=AIDecisionDataResponse)
def get_ai_decision_scenarios_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AIDecisionDataResponse:
    return AIDecisionDataResponse(generated_at=_now(), data={"scenarios": list_decision_scenarios()})


@router.get("/summary", response_model=AIDecisionDataResponse)
def get_ai_summary_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AIDecisionDataResponse:
    summary = get_decision_summary()
    return AIDecisionDataResponse(generated_at=summary["generated_at"], scenario_id=str(summary["scenario_id"]), data=summary)


@router.get("/forecast", response_model=AIDecisionDataResponse)
def get_ai_forecast_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AIDecisionDataResponse:
    forecast = get_decision_forecast()
    return AIDecisionDataResponse(generated_at=forecast["generated_at"], scenario_id=str(forecast["scenario_id"]), data=forecast)


@router.get("/decision/resources", response_model=AIDecisionDataResponse)
def get_ai_decision_resources_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AIDecisionDataResponse:
    resources = get_decision_resources()
    return AIDecisionDataResponse(generated_at=resources["generated_at"], scenario_id=str(resources["scenario_id"]), data=resources)


@router.get("/swarm", response_model=SwarmResponse)
def get_ai_swarm_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> SwarmResponse:
    return SwarmResponse(**build_swarm_snapshot())


@router.get("/cascade", response_model=CascadeResponse)
def get_ai_cascade_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> CascadeResponse:
    return CascadeResponse(**build_cascade_snapshot())


@router.get("/copilot", response_model=CopilotResponse)
def get_ai_copilot_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> CopilotResponse:
    return _ai_cached(
        _identity_scope(identity),
        "copilot",
        lambda: CopilotResponse(**build_copilot_snapshot()),
    )


@router.get("/behavior", response_model=BehaviorResponse)
def get_ai_behavior_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> BehaviorResponse:
    return BehaviorResponse(**build_behavior_snapshot())


@router.get("/negotiation", response_model=NegotiationResponse)
def get_ai_negotiation_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> NegotiationResponse:
    return NegotiationResponse(**build_negotiation_snapshot())


@router.get("/supremacy-score", response_model=SupremacyScoreResponse)
def get_ai_supremacy_score_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> SupremacyScoreResponse:
    return SupremacyScoreResponse(**build_supremacy_score())


@router.post("/approve", response_model=AIActionResponse)
def post_ai_approve_route(
    request: Request,
    payload: AIActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AIActionResponse:
    memory = record_decision(recommendation_id=payload.recommendation_id, status="approved")
    append_audit_event(
        category="system",
        action="ai_recommendation_approved",
        severity="medium",
        target_module="ai",
        target_id=payload.recommendation_id,
        status="success",
        reason=payload.note or "Human approved autonomous recommendation",
        request=request,
        identity=identity,
        risk_score=44,
    )
    return AIActionResponse(
        status="approved",
        recommendation_id=payload.recommendation_id,
        autonomy_mode=build_autonomous_snapshot(force=True)["autonomy_mode"],
        memory=memory,
        live=AutonomousLiveResponse(**build_autonomous_snapshot(force=True)),
    )


@router.post("/reject", response_model=AIActionResponse)
def post_ai_reject_route(
    request: Request,
    payload: AIActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AIActionResponse:
    memory = record_decision(recommendation_id=payload.recommendation_id, status="rejected")
    append_audit_event(
        category="system",
        action="ai_recommendation_rejected",
        severity="medium",
        target_module="ai",
        target_id=payload.recommendation_id,
        status="success",
        reason=payload.note or "Human rejected autonomous recommendation",
        request=request,
        identity=identity,
        risk_score=38,
    )
    return AIActionResponse(
        status="rejected",
        recommendation_id=payload.recommendation_id,
        autonomy_mode=build_autonomous_snapshot(force=True)["autonomy_mode"],
        memory=memory,
        live=AutonomousLiveResponse(**build_autonomous_snapshot(force=True)),
    )


@router.post("/override", response_model=AIActionResponse)
def post_ai_override_route(
    request: Request,
    payload: AIOverrideRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AIActionResponse:
    if payload.mode:
        set_autonomy_mode(payload.mode)
    recommendation_id = payload.recommendation_id or build_autonomous_snapshot()["top_decision"]["recommendation_id"]
    memory = record_decision(recommendation_id=recommendation_id, status="modified")
    append_audit_event(
        category="system",
        action="ai_human_override",
        severity="high",
        target_module="ai",
        target_id=recommendation_id,
        status="success",
        reason=payload.reason or payload.modified_plan or "Human override applied",
        request=request,
        identity=identity,
        risk_score=58,
    )
    live = build_autonomous_snapshot(force=True)
    return AIActionResponse(
        status="override_applied",
        recommendation_id=recommendation_id,
        autonomy_mode=live["autonomy_mode"],
        memory=memory,
        live=AutonomousLiveResponse(**live),
    )


@router.post("/run-cycle", response_model=AutonomousLiveResponse)
def post_ai_run_cycle_route(
    request: Request,
    payload: AIRunCycleRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomousLiveResponse:
    live = run_cycle(payload.scenario)
    append_audit_event(
        category="system",
        action="ai_decision_cycle",
        severity="low",
        target_module="ai",
        status="success",
        reason=f"Autonomous AI cycle executed for {payload.scenario or 'current state'}",
        request=request,
        identity=identity,
        risk_score=22,
    )
    return AutonomousLiveResponse(**live)


@router.post("/run-forecast", response_model=PredictiveForecastResponse)
def post_ai_run_forecast_route(
    request: Request,
    payload: AIRunCycleRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> PredictiveForecastResponse:
    forecast = run_forecast_cycle(payload.scenario)
    append_audit_event(
        category="system",
        action="ai_forecast_cycle",
        severity="low",
        target_module="ai",
        status="success",
        reason=f"Predictive forecast executed for {payload.scenario or 'live state'}",
        request=request,
        identity=identity,
        risk_score=20,
    )
    return PredictiveForecastResponse(**forecast)


@router.post("/compare-strategies", response_model=ScenarioBranchesResponse)
def post_ai_compare_strategies_route(
    request: Request,
    identity: dict[str, object] = Depends(get_current_identity),
) -> ScenarioBranchesResponse:
    result = compare_strategies()
    winner = result.get("winning_strategy") or {"strategy": "corridor-first containment"}
    append_audit_event(
        category="system",
        action="ai_compare_strategies",
        severity="low",
        target_module="ai",
        status="success",
        reason=f"Compared strategy branches; winner {winner.get('strategy', 'corridor-first containment')}",
        request=request,
        identity=identity,
        risk_score=18,
    )
    return ScenarioBranchesResponse(**result)


@router.post("/set-autonomy-mode", response_model=OrchestrationResponse)
def post_ai_set_autonomy_mode_route(
    request: Request,
    payload: AISetAutonomyModeRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrchestrationResponse:
    result = set_response_autonomy_mode(payload.mode)
    append_audit_event(
        category="system",
        action="ai_response_autonomy_mode",
        severity="medium" if payload.mode in {"full_auto", "lockdown_emergency"} else "low",
        target_module="ai",
        status="success",
        reason=f"Set response orchestration mode to {payload.mode}",
        request=request,
        identity=identity,
        risk_score=64 if payload.mode in {"full_auto", "lockdown_emergency"} else 28,
    )
    return OrchestrationResponse(**result)


@router.post("/execute-plan", response_model=OrchestrationResponse)
def post_ai_execute_plan_route(
    request: Request,
    payload: AIExecutePlanRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrchestrationResponse:
    result = execute_plan()
    append_audit_event(
        category="system",
        action="ai_execute_plan",
        severity="high",
        target_module="ai",
        target_id=payload.plan_id,
        status="success",
        reason="Autonomous response orchestrator advanced the current plan",
        request=request,
        identity=identity,
        risk_score=72,
    )
    return OrchestrationResponse(**result)


@router.post("/run-learning-cycle", response_model=AdvancedMemoryResponse)
def post_ai_run_learning_cycle_route(
    request: Request,
    payload: AIStrategicScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AdvancedMemoryResponse:
    result = run_learning_cycle(payload.scenario)
    append_audit_event(
        category="system",
        action="ai_strategic_learning_cycle",
        severity="medium",
        target_module="ai",
        status="success",
        reason=f"Strategic learning cycle executed for {payload.scenario or 'current strategic state'}",
        request=request,
        identity=identity,
        risk_score=34,
    )
    return AdvancedMemoryResponse(**result)


@router.post("/run-debate", response_model=DebateV2Response)
def post_ai_run_debate_route(
    request: Request,
    payload: AIStrategicScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> DebateV2Response:
    result = run_debate(payload.scenario)
    append_audit_event(
        category="system",
        action="ai_debate_v2",
        severity="low",
        target_module="ai",
        status="success",
        reason=f"Specialist agent debate executed for {payload.scenario or 'current strategic state'}",
        request=request,
        identity=identity,
        risk_score=24,
    )
    return DebateV2Response(**result)


@router.post("/test-weak-signal", response_model=WeakSignalsResponse)
def post_ai_test_weak_signal_route(
    request: Request,
    payload: AIWeakSignalScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> WeakSignalsResponse:
    result = test_weak_signal(payload.scenario)
    append_audit_event(
        category="system",
        action="ai_weak_signal_test",
        severity="low",
        target_module="ai",
        status="success",
        reason=f"Weak signal scenario tested: {payload.scenario}",
        request=request,
        identity=identity,
        risk_score=18,
        is_demo=True,
    )
    return WeakSignalsResponse(**result)


@router.post("/retrain-policies", response_model=PolicyEvolutionResponse)
def post_ai_retrain_policies_route(
    request: Request,
    identity: dict[str, object] = Depends(get_current_identity),
) -> PolicyEvolutionResponse:
    result = retrain_policies()
    append_audit_event(
        category="system",
        action="ai_policy_retrain",
        severity="medium",
        target_module="ai",
        status="success",
        reason=f"Policy evolution engine recalibrated to revision {result['revision']}",
        request=request,
        identity=identity,
        risk_score=36,
    )
    return PolicyEvolutionResponse(**result)


@router.post("/simulate-campaign", response_model=CampaignPlanResponse)
def post_ai_simulate_campaign_route(
    request: Request,
    payload: AIStrategicScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> CampaignPlanResponse:
    result = simulate_campaign(payload.scenario)
    append_audit_event(
        category="system",
        action="ai_campaign_simulated",
        severity="medium",
        target_module="ai",
        status="success",
        reason=f"Autonomous campaign simulated for {payload.scenario or 'current strategic state'}",
        request=request,
        identity=identity,
        risk_score=32,
    )
    return CampaignPlanResponse(**result)


@router.post("/copilot/execute", response_model=CopilotResponse)
def post_ai_copilot_execute_route(
    request: Request,
    payload: CopilotExecuteRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> CopilotResponse:
    result = execute_copilot_intent(payload.intent)
    append_audit_event(
        category="system",
        action="ai_executive_copilot_execute",
        severity="high",
        target_module="ai",
        target_id=payload.intent,
        status="success",
        reason=f"Executive copilot converted intent into governed plan: {payload.intent}",
        request=request,
        identity=identity,
        risk_score=62,
    )
    return CopilotResponse(**result)


@router.post("/run-cinematic-demo", response_model=CinematicDemoResponse)
def post_ai_run_cinematic_demo_route(
    request: Request,
    identity: dict[str, object] = Depends(get_current_identity),
) -> CinematicDemoResponse:
    result = run_cinematic_demo()
    append_audit_event(
        category="system",
        action="ai_cinematic_demo_run",
        severity="low",
        target_module="ai",
        target_id=result["demo_id"],
        status="success",
        reason="Cinematic demo mode advanced the crisis stabilization story.",
        request=request,
        identity=identity,
        risk_score=16,
        is_demo=True,
    )
    return CinematicDemoResponse(**result)


@router.post("/test-cascade", response_model=CascadeResponse)
def post_ai_test_cascade_route(
    request: Request,
    payload: AIStrategicScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> CascadeResponse:
    result = test_cascade_scenario(payload.scenario)
    append_audit_event(
        category="system",
        action="ai_cascade_test",
        severity="low",
        target_module="ai",
        status="success",
        reason=f"Cascade chain scenario tested for {payload.scenario or 'current state'}",
        request=request,
        identity=identity,
        risk_score=18,
        is_demo=True,
    )
    return CascadeResponse(**result)


@router.post("/test-scenario", response_model=AutonomousLiveResponse)
def post_ai_test_scenario_route(
    request: Request,
    payload: AITestScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AutonomousLiveResponse:
    set_test_scenario(payload.scenario)
    live = run_cycle(payload.scenario)
    append_audit_event(
        category="system",
        action="ai_test_scenario",
        severity="low",
        target_module="ai",
        status="success",
        reason=f"Applied autonomous AI test scenario {payload.scenario}",
        request=request,
        identity=identity,
        risk_score=18,
        is_demo=True,
    )
    return AutonomousLiveResponse(**live)

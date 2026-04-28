from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.agents.council import (
    apply_test_scenario,
    generate_council_snapshot,
    generate_memory_snapshot,
    reset_council_state,
)
from app.agents.debate import (
    get_debate_history_snapshot,
    get_live_debate_snapshot,
    reset_debate_state,
    run_debate_scenario,
)
from app.agents.optimizer import (
    get_live_optimization_snapshot,
    get_optimization_history_snapshot,
    reset_optimization_state,
    run_optimization_scenario,
)
from app.agents.learning import (
    get_learning_history_snapshot,
    get_learning_live_snapshot,
    reset_learning_state,
    run_learning_cycle,
)
from app.agents.schemas import (
    AgentScenarioRequest,
    AgentScenarioResponse,
    DebateHistoryResponse,
    DebateLiveResponse,
    DebateResetResponse,
    DebateRunRequest,
    OptimizationHistoryResponse,
    OptimizationPlanResponse,
    OptimizationResetResponse,
    OptimizationRunRequest,
    LearningHistoryResponse,
    LearningLiveResponse,
    LearningResetResponse,
    LearningRunRequest,
    LearningRunResponse,
    AgentsLiveResponse,
    AgentsMemoryResponse,
    AgentsResetResponse,
)
from app.services.incident_service import get_all_incidents

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("/live", response_model=AgentsLiveResponse)
def get_agents_live_route() -> AgentsLiveResponse:
    incidents = get_all_incidents()
    snapshot = generate_council_snapshot(incidents)
    return AgentsLiveResponse(
        generated_at=datetime.now(timezone.utc),
        global_state=snapshot["global_state"],
        council_health=snapshot["council_health"],
        alignment_score=snapshot["alignment_score"],
        agents=snapshot["agents"],
        top_priorities=snapshot["top_priorities"],
        shared_risks=snapshot["shared_risks"],
        recommended_joint_plan=snapshot["recommended_joint_plan"],
        command_summary=snapshot["command_summary"],
    )


@router.get("/memory", response_model=AgentsMemoryResponse)
def get_agents_memory_route() -> AgentsMemoryResponse:
    snapshot = generate_memory_snapshot()
    return AgentsMemoryResponse(
        generated_at=datetime.now(timezone.utc),
        agents=snapshot["agents"],
    )


@router.post("/reset", response_model=AgentsResetResponse)
def post_agents_reset_route() -> AgentsResetResponse:
    snapshot = reset_council_state()
    return AgentsResetResponse(
        status=snapshot["status"],
        agents_reset=snapshot["agents_reset"],
    )


@router.post("/test-scenario", response_model=AgentScenarioResponse)
def post_agents_test_scenario_route(payload: AgentScenarioRequest) -> AgentScenarioResponse:
    incidents = get_all_incidents()
    council = apply_test_scenario(incidents, payload.scenario)
    return AgentScenarioResponse(
        generated_at=datetime.now(timezone.utc),
        status="applied",
        scenario=payload.scenario,
        council=AgentsLiveResponse(
            generated_at=datetime.now(timezone.utc),
            global_state=council["global_state"],
            council_health=council["council_health"],
            alignment_score=council["alignment_score"],
            agents=council["agents"],
            top_priorities=council["top_priorities"],
            shared_risks=council["shared_risks"],
            recommended_joint_plan=council["recommended_joint_plan"],
            command_summary=council["command_summary"],
        ),
    )


@router.get("/debate/live", response_model=DebateLiveResponse)
def get_agents_debate_live_route() -> DebateLiveResponse:
    incidents = get_all_incidents()
    snapshot = get_live_debate_snapshot(incidents)
    return DebateLiveResponse(
        generated_at=datetime.now(timezone.utc),
        global_state=snapshot["global_state"],
        active_debate=snapshot["active_debate"],
        consensus_score=snapshot["consensus_score"],
        conflicts=snapshot["conflicts"],
        participants=snapshot["participants"],
        final_plan=snapshot["final_plan"],
        executive_note=snapshot["executive_note"],
        recommended_next_action=snapshot["recommended_next_action"],
    )


@router.get("/debate/history", response_model=DebateHistoryResponse)
def get_agents_debate_history_route() -> DebateHistoryResponse:
    snapshot = get_debate_history_snapshot()
    return DebateHistoryResponse(
        generated_at=datetime.now(timezone.utc),
        sessions=snapshot["sessions"],
    )


@router.post("/debate/run", response_model=DebateLiveResponse)
def post_agents_debate_run_route(payload: DebateRunRequest) -> DebateLiveResponse:
    incidents = get_all_incidents()
    snapshot = run_debate_scenario(incidents, payload.scenario)
    return DebateLiveResponse(
        generated_at=datetime.now(timezone.utc),
        global_state=snapshot["global_state"],
        active_debate=snapshot["active_debate"],
        consensus_score=snapshot["consensus_score"],
        conflicts=snapshot["conflicts"],
        participants=snapshot["participants"],
        final_plan=snapshot["final_plan"],
        executive_note=snapshot["executive_note"],
        recommended_next_action=snapshot["recommended_next_action"],
    )


@router.post("/debate/reset", response_model=DebateResetResponse)
def post_agents_debate_reset_route() -> DebateResetResponse:
    snapshot = reset_debate_state()
    return DebateResetResponse(
        status=snapshot["status"],
        debates_cleared=snapshot["debates_cleared"],
    )


@router.get("/optimize/live", response_model=OptimizationPlanResponse)
def get_agents_optimize_live_route() -> OptimizationPlanResponse:
    incidents = get_all_incidents()
    snapshot = get_live_optimization_snapshot(incidents)
    return OptimizationPlanResponse(**snapshot)


@router.get("/optimize/history", response_model=OptimizationHistoryResponse)
def get_agents_optimize_history_route() -> OptimizationHistoryResponse:
    snapshot = get_optimization_history_snapshot()
    return OptimizationHistoryResponse(
        generated_at=datetime.now(timezone.utc),
        plans=snapshot["plans"],
    )


@router.post("/optimize/run", response_model=OptimizationPlanResponse)
def post_agents_optimize_run_route(payload: OptimizationRunRequest) -> OptimizationPlanResponse:
    incidents = get_all_incidents()
    snapshot = run_optimization_scenario(incidents, payload.scenario)
    return OptimizationPlanResponse(**snapshot)


@router.post("/optimize/reset", response_model=OptimizationResetResponse)
def post_agents_optimize_reset_route() -> OptimizationResetResponse:
    snapshot = reset_optimization_state()
    return OptimizationResetResponse(
        status=snapshot["status"],
        plans_cleared=snapshot["plans_cleared"],
    )


@router.get("/learning/live", response_model=LearningLiveResponse)
def get_agents_learning_live_route() -> LearningLiveResponse:
    incidents = get_all_incidents()
    snapshot = get_learning_live_snapshot(incidents)
    return LearningLiveResponse(**snapshot)


@router.get("/learning/history", response_model=LearningHistoryResponse)
def get_agents_learning_history_route() -> LearningHistoryResponse:
    snapshot = get_learning_history_snapshot()
    return LearningHistoryResponse(**snapshot)


@router.post("/learning/run-cycle", response_model=LearningRunResponse)
def post_agents_learning_run_cycle_route(payload: LearningRunRequest) -> LearningRunResponse:
    incidents = get_all_incidents()
    snapshot = run_learning_cycle(incidents, payload.scenario)
    return LearningRunResponse(
        generated_at=snapshot["generated_at"],
        status=snapshot["status"],
        scenario=snapshot["scenario"],
        episode=snapshot["episode"],
        learning=snapshot["learning"],
    )


@router.post("/learning/reset", response_model=LearningResetResponse)
def post_agents_learning_reset_route() -> LearningResetResponse:
    snapshot = reset_learning_state()
    return LearningResetResponse(
        status=snapshot["status"],
        episodes_cleared=snapshot["episodes_cleared"],
    )

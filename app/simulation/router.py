from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.services.incident_service import get_all_incidents
from app.simulation.scenario import generate_scenario_projection
from app.simulation.schemas import (
    ScenarioRequest,
    ScenarioResponse,
    SimulationResponse,
    TimelineResponse,
    WarRoomResponse,
)
from app.simulation.timeline import generate_timeline_forecast
from app.simulation.twin import generate_live_twin_state
from app.simulation.warroom import generate_warroom_state

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.get("/live", response_model=SimulationResponse)
def get_live_simulation() -> SimulationResponse:
    incidents = get_all_incidents()
    state = generate_live_twin_state(incidents)

    return SimulationResponse(
        generated_at=datetime.now(timezone.utc),
        global_mode=state["global_mode"],
        system_health=state["system_health"],
        zones=state["zones"],
        corridors=state["corridors"],
        responders=state["responders"],
        summary=state["summary"],
    )


@router.get("/timeline", response_model=TimelineResponse)
def get_timeline_simulation() -> TimelineResponse:
    incidents = get_all_incidents()
    forecast = generate_timeline_forecast(incidents)

    return TimelineResponse(
        generated_at=datetime.now(timezone.utc),
        snapshots=forecast["snapshots"],
        forecast_summary=forecast["forecast_summary"],
    )


@router.post("/scenario", response_model=ScenarioResponse)
def post_scenario_simulation(payload: ScenarioRequest) -> ScenarioResponse:
    incidents = get_all_incidents()
    scenario = generate_scenario_projection(
        incidents,
        payload.incident_zone,
        payload.severity,
        payload.event_type,
    )

    return ScenarioResponse(
        generated_at=datetime.now(timezone.utc),
        scenario=scenario["scenario"],
        recommended_mode=scenario["recommended_mode"],
        severity_index=scenario["severity_index"],
        impact_chain=scenario["impact_chain"],
        affected_zones=scenario["affected_zones"],
        recommended_actions=scenario["recommended_actions"],
        resource_load=scenario["resource_load"],
    )


@router.get("/warroom", response_model=WarRoomResponse)
def get_warroom_simulation() -> WarRoomResponse:
    incidents = get_all_incidents()
    warroom = generate_warroom_state(incidents)

    return WarRoomResponse(
        generated_at=datetime.now(timezone.utc),
        global_state=warroom["global_state"],
        agents=warroom["agents"],
        conflicts=warroom["conflicts"],
        consensus_plan=warroom["consensus_plan"],
        commander_decision=warroom["commander_decision"],
        response_score=warroom["response_score"],
    )

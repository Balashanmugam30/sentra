from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.analytics.comparison import generate_scenario_lab_comparison
from app.analytics.decision import generate_boardroom_snapshot
from app.analytics.executive import (
    generate_executive_snapshot,
    generate_readiness_scorecards,
)
from app.analytics.engine import generate_kpi_cards, generate_live_analytics
from app.analytics.forecast import generate_forecast_snapshot
from app.analytics.scenario_lab import get_scenario_presets
from app.analytics.schemas import (
    AnalyticsBoardroomResponse,
    AnalyticsForecastResponse,
    AnalyticsHotspotsResponse,
    AnalyticsKpiCardsResponse,
    AnalyticsLiveResponse,
    AnalyticsReadinessResponse,
    AnalyticsScenarioLabResponse,
    AnalyticsTrendsResponse,
    ExecutiveAnalyticsResponse,
    ScenarioLabRequest,
    ScenarioPresetItem,
)
from app.analytics.trends import generate_hotspot_snapshot, generate_trend_snapshot
from app.rbac.guard import require_permission
from app.services.incident_service import get_all_incidents

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/live", response_model=AnalyticsLiveResponse)
def get_live_analytics_route() -> AnalyticsLiveResponse:
    incidents = get_all_incidents()
    snapshot = generate_live_analytics(incidents)

    return AnalyticsLiveResponse(
        generated_at=datetime.now(timezone.utc),
        global_status=snapshot["global_status"],
        summary=snapshot["summary"],
        kpis=snapshot["kpis"],
        top_risks=snapshot["top_risks"],
        next_actions=snapshot["next_actions"],
    )


@router.get("/kpis", response_model=AnalyticsKpiCardsResponse)
def get_kpi_cards_route() -> AnalyticsKpiCardsResponse:
    incidents = get_all_incidents()
    cards = generate_kpi_cards(incidents)

    return AnalyticsKpiCardsResponse(
        generated_at=datetime.now(timezone.utc),
        cards=cards,
    )


@router.get("/trends", response_model=AnalyticsTrendsResponse)
def get_trend_snapshot_route() -> AnalyticsTrendsResponse:
    incidents = get_all_incidents()
    snapshot = generate_trend_snapshot(incidents)

    return AnalyticsTrendsResponse(
        generated_at=datetime.now(timezone.utc),
        window=snapshot["window"],
        incident_volume=snapshot["incident_volume"],
        response_time=snapshot["response_time"],
        alerts_sent=snapshot["alerts_sent"],
        resource_load=snapshot["resource_load"],
        trend_flags=snapshot["trend_flags"],
    )


@router.get("/hotspots", response_model=AnalyticsHotspotsResponse)
def get_hotspot_snapshot_route() -> AnalyticsHotspotsResponse:
    incidents = get_all_incidents()
    snapshot = generate_hotspot_snapshot(incidents)

    return AnalyticsHotspotsResponse(
        generated_at=datetime.now(timezone.utc),
        zones=snapshot["zones"],
        recurring_patterns=snapshot["recurring_patterns"],
        recommended_focus=snapshot["recommended_focus"],
    )


@router.get("/executive", response_model=ExecutiveAnalyticsResponse)
def get_executive_snapshot_route(
    _: dict[str, object] = Depends(require_permission("analytics.executive")),
) -> ExecutiveAnalyticsResponse:
    incidents = get_all_incidents()
    snapshot = generate_executive_snapshot(incidents)

    return ExecutiveAnalyticsResponse(
        generated_at=datetime.now(timezone.utc),
        global_status=snapshot["global_status"],
        executive_risk_score=snapshot["executive_risk_score"],
        organization_readiness=snapshot["organization_readiness"],
        financial_impact_level=snapshot["financial_impact_level"],
        operational_continuity=snapshot["operational_continuity"],
        top_threats=snapshot["top_threats"],
        strategic_priorities=snapshot["strategic_priorities"],
        recommended_decisions=snapshot["recommended_decisions"],
        board_summary=snapshot["board_summary"],
    )


@router.get("/readiness", response_model=AnalyticsReadinessResponse)
def get_readiness_snapshot_route() -> AnalyticsReadinessResponse:
    incidents = get_all_incidents()
    snapshot = generate_readiness_scorecards(incidents)

    return AnalyticsReadinessResponse(
        generated_at=datetime.now(timezone.utc),
        scorecards=snapshot["scorecards"],
        overall_readiness=snapshot["overall_readiness"],
    )


@router.get("/forecast", response_model=AnalyticsForecastResponse)
def get_forecast_snapshot_route() -> AnalyticsForecastResponse:
    incidents = get_all_incidents()
    snapshot = generate_forecast_snapshot(incidents)

    return AnalyticsForecastResponse(
        generated_at=datetime.now(timezone.utc),
        time_windows=snapshot["time_windows"],
        metrics=snapshot["metrics"],
        financial_exposure=snapshot["financial_exposure"],
        reputation_risk=snapshot["reputation_risk"],
        recovery_eta_minutes=snapshot["recovery_eta_minutes"],
        executive_summary=snapshot["executive_summary"],
    )


@router.get("/boardroom", response_model=AnalyticsBoardroomResponse)
def get_boardroom_snapshot_route(
    _: dict[str, object] = Depends(require_permission("analytics.executive")),
) -> AnalyticsBoardroomResponse:
    incidents = get_all_incidents()
    snapshot = generate_boardroom_snapshot(incidents)

    return AnalyticsBoardroomResponse(
        generated_at=datetime.now(timezone.utc),
        decision_state=snapshot["decision_state"],
        recommended_actions=snapshot["recommended_actions"],
        mutual_aid_need=snapshot["mutual_aid_need"],
        business_modes=snapshot["business_modes"],
        best_mode=snapshot["best_mode"],
        delay_cost_per_15min=snapshot["delay_cost_per_15min"],
        top_dependencies=snapshot["top_dependencies"],
        board_message=snapshot["board_message"],
    )


@router.get("/scenario-presets", response_model=list[ScenarioPresetItem])
def get_scenario_presets_route() -> list[ScenarioPresetItem]:
    return [ScenarioPresetItem(**item) for item in get_scenario_presets()]


@router.post("/scenario-lab", response_model=AnalyticsScenarioLabResponse)
def post_scenario_lab_route(payload: ScenarioLabRequest) -> AnalyticsScenarioLabResponse:
    incidents = get_all_incidents()
    snapshot = generate_scenario_lab_comparison(
        incidents,
        payload.option_a,
        payload.option_b,
    )

    return AnalyticsScenarioLabResponse(
        generated_at=datetime.now(timezone.utc),
        current_state=snapshot["current_state"],
        comparison=snapshot["comparison"],
        winner=snapshot["winner"],
        recommended_choice=snapshot["recommended_choice"],
        decision_reasoning=snapshot["decision_reasoning"],
        executive_summary=snapshot["executive_summary"],
    )

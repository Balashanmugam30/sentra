from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


AnalyticsStatus = Literal["excellent", "good", "watch", "critical"]
AnalyticsGlobalStatus = Literal["normal", "elevated", "critical"]
HotspotMovement = Literal["up", "down", "stable"]
FinancialImpactLevel = Literal["low", "moderate", "high", "severe"]
OperationalContinuity = Literal["stable", "degraded", "disrupted"]
ReputationRiskLevel = Literal["low", "medium", "high"]
DecisionState = Literal["stable", "elevated", "critical", "emergency"]
MutualAidNeed = Literal["none", "consider", "recommended", "immediate"]
ForecastContinuity = Literal["stable", "strained", "degraded", "critical"]
ScenarioPresetCategory = Literal["life_safety", "operations", "resources", "continuity"]
ScenarioWinner = Literal["option_a", "option_b", "tie"]


class AnalyticsSummary(BaseModel):
    active_incidents: int = Field(..., ge=0)
    critical_incidents: int = Field(..., ge=0)
    resolved_today: int = Field(..., ge=0)
    alerts_sent: int = Field(..., ge=0)
    zones_impacted: int = Field(..., ge=0)


class AnalyticsKpis(BaseModel):
    avg_response_minutes: float = Field(..., ge=0)
    avg_resolution_minutes: float = Field(..., ge=0)
    containment_success_rate: int = Field(..., ge=0, le=100)
    evacuation_success_rate: int = Field(..., ge=0, le=100)
    resource_utilization: int = Field(..., ge=0, le=100)


class AnalyticsLiveResponse(BaseModel):
    generated_at: datetime
    global_status: AnalyticsGlobalStatus
    summary: AnalyticsSummary
    kpis: AnalyticsKpis
    top_risks: list[str]
    next_actions: list[str]


class AnalyticsKpiCard(BaseModel):
    key: str
    label: str
    value: str
    status: AnalyticsStatus


class AnalyticsKpiCardsResponse(BaseModel):
    generated_at: datetime
    cards: list[AnalyticsKpiCard]


class AnalyticsHourlyCountPoint(BaseModel):
    hour: str
    count: int = Field(..., ge=0)


class AnalyticsHourlyMinutesPoint(BaseModel):
    hour: str
    minutes: float = Field(..., ge=0)


class AnalyticsHourlyPercentPoint(BaseModel):
    hour: str
    percent: int = Field(..., ge=0, le=100)


class AnalyticsTrendsResponse(BaseModel):
    generated_at: datetime
    window: str
    incident_volume: list[AnalyticsHourlyCountPoint]
    response_time: list[AnalyticsHourlyMinutesPoint]
    alerts_sent: list[AnalyticsHourlyCountPoint]
    resource_load: list[AnalyticsHourlyPercentPoint]
    trend_flags: list[str]


class AnalyticsHotspotZone(BaseModel):
    zone: str
    risk_score: int = Field(..., ge=0, le=100)
    incident_count: int = Field(..., ge=0)
    movement: HotspotMovement


class AnalyticsHotspotsResponse(BaseModel):
    generated_at: datetime
    zones: list[AnalyticsHotspotZone]
    recurring_patterns: list[str]
    recommended_focus: list[str]


class ExecutiveThreatItem(BaseModel):
    title: str
    severity: Literal["critical", "high", "watch"]


class ExecutiveAnalyticsResponse(BaseModel):
    generated_at: datetime
    global_status: AnalyticsGlobalStatus
    executive_risk_score: int = Field(..., ge=0, le=100)
    organization_readiness: int = Field(..., ge=0, le=100)
    financial_impact_level: FinancialImpactLevel
    operational_continuity: OperationalContinuity
    top_threats: list[ExecutiveThreatItem]
    strategic_priorities: list[str]
    recommended_decisions: list[str]
    board_summary: list[str]


class ReadinessScorecardItem(BaseModel):
    label: str
    score: int = Field(..., ge=0, le=100)
    status: AnalyticsStatus


class AnalyticsReadinessResponse(BaseModel):
    generated_at: datetime
    scorecards: list[ReadinessScorecardItem]
    overall_readiness: int = Field(..., ge=0, le=100)


class ForecastTimeWindowItem(BaseModel):
    minute: int = Field(..., ge=0)
    risk_score: int = Field(..., ge=0, le=100)
    continuity: ForecastContinuity
    expected_disruption: str


class ForecastMetrics(BaseModel):
    containment_probability: int = Field(..., ge=0, le=100)
    escalation_probability: int = Field(..., ge=0, le=100)
    evac_completion_probability: int = Field(..., ge=0, le=100)
    resource_recovery_probability: int = Field(..., ge=0, le=100)


class AnalyticsForecastResponse(BaseModel):
    generated_at: datetime
    time_windows: list[ForecastTimeWindowItem]
    metrics: ForecastMetrics
    financial_exposure: FinancialImpactLevel
    reputation_risk: ReputationRiskLevel
    recovery_eta_minutes: int = Field(..., ge=0)
    executive_summary: list[str]


class BoardroomActionItem(BaseModel):
    priority: int = Field(..., ge=1)
    title: str
    impact: str
    urgency: str


class AnalyticsBoardroomResponse(BaseModel):
    generated_at: datetime
    decision_state: DecisionState
    recommended_actions: list[BoardroomActionItem]
    mutual_aid_need: MutualAidNeed
    business_modes: list[str]
    best_mode: str
    delay_cost_per_15min: str
    top_dependencies: list[str]
    board_message: list[str]


class ScenarioPresetItem(BaseModel):
    id: str
    title: str
    category: ScenarioPresetCategory


class ScenarioLabRequest(BaseModel):
    option_a: str
    option_b: str


class ScenarioLabOptionResult(BaseModel):
    title: str
    casualty_risk: int = Field(..., ge=0, le=100)
    containment_probability: int = Field(..., ge=0, le=100)
    recovery_eta_minutes: int = Field(..., ge=0)
    downtime_minutes: int = Field(..., ge=0)
    financial_impact: FinancialImpactLevel
    reputation_risk: ReputationRiskLevel
    overall_score: int = Field(..., ge=0, le=100)


class ScenarioLabComparison(BaseModel):
    option_a: ScenarioLabOptionResult
    option_b: ScenarioLabOptionResult


class AnalyticsScenarioLabResponse(BaseModel):
    generated_at: datetime
    current_state: DecisionState
    comparison: ScenarioLabComparison
    winner: ScenarioWinner
    recommended_choice: str
    decision_reasoning: list[str]
    executive_summary: list[str]

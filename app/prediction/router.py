from __future__ import annotations

from datetime import datetime, timezone
from typing import Callable, TypeVar

from fastapi import APIRouter

from app.core.config import settings
from app.core.runtime_cache import cached_call
from app.prediction.evacuation import generate_evacuation_recommendations
from app.prediction.fire_spread import forecastFireSpread
from app.prediction.communications import generate_communications_intelligence
from app.prediction.commander import generate_commander_decisions
from app.prediction.coordinator import generate_coordination_intelligence
from app.prediction.learning import generate_learning_decisions
from app.prediction.memory import generate_memory_snapshot
from app.prediction.resources import generate_resource_deployments
from app.prediction.schemas import (
    CommanderResponse,
    CommunicationResponse,
    CoordinatorResponse,
    EvacuationResponse,
    FireSpreadResponse,
    LearningDecisionResponse,
    MemoryResponse,
    PredictionResponse,
    ResourceDeploymentResponse,
)
from app.prediction.service import generate_predictions
from app.services.incident_service import get_all_incidents

router = APIRouter(prefix="/predictions", tags=["Predictions"])
T = TypeVar("T")


def _prediction_cached(key: str, builder: Callable[[], T]) -> T:
    return cached_call(f"predictions:{key}", settings.prediction_cache_ttl_seconds, builder)


@router.get("/live", response_model=PredictionResponse)
def get_live_predictions() -> PredictionResponse:
    return _prediction_cached(
        "live",
        lambda: PredictionResponse(
            generated_at=datetime.now(timezone.utc),
            predictions=generate_predictions(get_all_incidents()),
        ),
    )


@router.get("/fire-spread", response_model=FireSpreadResponse)
def get_fire_spread_predictions() -> FireSpreadResponse:
    def build() -> FireSpreadResponse:
        incidents = get_all_incidents()
        forecasts = forecastFireSpread(incidents)

        return FireSpreadResponse(
            generated_at=datetime.now(timezone.utc),
            active_sources=len(
                [
                    incident
                    for incident in incidents
                    if incident.status == "active" and incident.severity >= 2
                ]
            ),
            forecasts=forecasts,
        )

    return _prediction_cached("fire-spread", build)


@router.get("/evacuation", response_model=EvacuationResponse)
def get_evacuation_predictions() -> EvacuationResponse:
    def build() -> EvacuationResponse:
        recommendations = generate_evacuation_recommendations(get_all_incidents())

        return EvacuationResponse(
            generated_at=datetime.now(timezone.utc),
            global_status=recommendations["global_status"],
            recommended_safe_zones=recommendations["recommended_safe_zones"],
            blocked_zones=recommendations["blocked_zones"],
            routes=recommendations["routes"],
            alerts=recommendations["alerts"],
        )

    return _prediction_cached("evacuation", build)


@router.get("/resources", response_model=ResourceDeploymentResponse)
def get_resource_predictions() -> ResourceDeploymentResponse:
    def build() -> ResourceDeploymentResponse:
        intelligence = generate_resource_deployments(get_all_incidents())

        return ResourceDeploymentResponse(
            generated_at=datetime.now(timezone.utc),
            global_load=intelligence["global_load"],
            available_units=intelligence["available_units"],
            deployments=intelligence["deployments"],
            shortages=intelligence["shortages"],
            recommendations=intelligence["recommendations"],
        )

    return _prediction_cached("resources", build)


@router.get("/communications", response_model=CommunicationResponse)
def get_communication_predictions() -> CommunicationResponse:
    def build() -> CommunicationResponse:
        intelligence = generate_communications_intelligence(get_all_incidents())

        return CommunicationResponse(
            generated_at=datetime.now(timezone.utc),
            threat_level=intelligence["threat_level"],
            occupant_alerts=intelligence["occupant_alerts"],
            responder_messages=intelligence["responder_messages"],
            executive_summary=intelligence["executive_summary"],
            escalations=intelligence["escalations"],
        )

    return _prediction_cached("communications", build)


@router.get("/commander", response_model=CommanderResponse)
def get_commander_predictions() -> CommanderResponse:
    def build() -> CommanderResponse:
        decisions = generate_commander_decisions(get_all_incidents())

        return CommanderResponse(
            generated_at=datetime.now(timezone.utc),
            incident_mode=decisions["incident_mode"],
            severity_index=decisions["severity_index"],
            top_actions=decisions["top_actions"],
            resource_orders=decisions["resource_orders"],
            strategic_objectives=decisions["strategic_objectives"],
            next_15_min_plan=decisions["next_15_min_plan"],
            executive_status=decisions["executive_status"],
        )

    return _prediction_cached("commander", build)


@router.get("/coordinator", response_model=CoordinatorResponse)
def get_coordinator_predictions() -> CoordinatorResponse:
    def build() -> CoordinatorResponse:
        intelligence = generate_coordination_intelligence(get_all_incidents())

        return CoordinatorResponse(
            generated_at=datetime.now(timezone.utc),
            global_mode=intelligence["global_mode"],
            system_health=intelligence["system_health"],
            conflicts_detected=intelligence["conflicts_detected"],
            priority_stack=intelligence["priority_stack"],
            coordinated_actions=intelligence["coordinated_actions"],
            cross_agent_score=intelligence["cross_agent_score"],
            recommended_next_phase=intelligence["recommended_next_phase"],
        )

    return _prediction_cached("coordinator", build)


@router.get("/memory", response_model=MemoryResponse)
def get_memory_predictions() -> MemoryResponse:
    def build() -> MemoryResponse:
        memory = generate_memory_snapshot(get_all_incidents())

        return MemoryResponse(
            generated_at=datetime.now(timezone.utc),
            total_incidents_observed=memory["total_incidents_observed"],
            hotspot_zones=memory["hotspot_zones"],
            trusted_safe_zones=memory["trusted_safe_zones"],
            historical_route_success=memory["historical_route_success"],
            resource_effectiveness=memory["resource_effectiveness"],
            learning_status=memory["learning_status"],
        )

    return _prediction_cached("memory", build)


@router.get("/learning-decisions", response_model=LearningDecisionResponse)
def get_learning_decision_predictions() -> LearningDecisionResponse:
    def build() -> LearningDecisionResponse:
        learning = generate_learning_decisions(get_all_incidents())

        return LearningDecisionResponse(
            generated_at=datetime.now(timezone.utc),
            adaptive_actions=learning["adaptive_actions"],
            confidence=learning["confidence"],
            based_on_events=learning["based_on_events"],
        )

    return _prediction_cached("learning-decisions", build)


@router.get("/incident/{incident_id}/history")
def get_incident_prediction_history(
    incident_id: str,
    limit: int = 20,
    tenant_id: str = "TEN-BALA-HQ",
):
    """Returns historical prediction sequence for incident trend monitoring."""
    from app.data.storage import data_storage
    clean_id = incident_id.strip("/")
    return {
        "incident_id": clean_id,
        "history": data_storage.get_prediction_history(clean_id, limit=limit, tenant_id=tenant_id),
    }


@router.get("/incident/{incident_id}", response_model=None)
def get_calibrated_incident_predictions(
    incident_id: str,
    tenant_id: str = "TEN-BALA-HQ",
    fallback: bool = False,
):
    """
    Phase 5 Calibrated Crisis Prediction Bundle.
    Returns multi-task predictions with 90% uncertainty intervals [lower, upper],
    data quality metrics, feature freshness, and honest fallback states.
    Triggers concurrent shadow model divergence evaluation.
    """
    from app.ml.prediction_engine import crisis_prediction_engine
    from app.mlops.model_registry import mlops_governance
    from app.data.feature_engine import feature_engine

    clean_id = incident_id.strip("/")
    bundle = crisis_prediction_engine.predict(
        incident_id=clean_id,
        tenant_id=tenant_id,
        force_fallback=fallback,
    )

    # Run background shadow model evaluation
    features = feature_engine.extract_features(clean_id, tenant_id=tenant_id)
    mlops_governance.run_shadow_evaluation(
        incident_id=clean_id,
        features=features,
        active_prediction_value=bundle.escalation_risk.risk_score,
    )

    return bundle.model_dump(mode="json")


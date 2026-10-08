# app/data/canonical_schemas.py
"""
Sentra Phase 5 - Canonical Data Plane Schemas.
Establishes normalized, tenant-isolated data models for multi-sensor ingestion,
data quality scoring, feature extraction, uncertainty-calibrated predictions,
and MLOps model governance.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Literal, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class SensorModality(str, Enum):
    FLIR_THERMAL = "FLIR_THERMAL"
    AIR_QUALITY = "AIR_QUALITY"
    CCTV_OPTICAL = "CCTV_OPTICAL"
    ACOUSTIC_SENSOR = "ACOUSTIC_SENSOR"
    HUMAN_REPORT = "HUMAN_REPORT"
    STRUCTURAL_IOT = "STRUCTURAL_IOT"


class ProcessingStatus(str, Enum):
    RECEIVED = "received"
    VALIDATED = "validated"
    NORMALIZED = "normalized"
    PERSISTED = "persisted"
    AGGREGATED = "aggregated"
    REJECTED = "rejected"


class ModelDeploymentState(str, Enum):
    CANDIDATE = "candidate"
    VALIDATED = "validated"
    SHADOW = "shadow"
    ACTIVE = "active"
    RETIRED = "retired"
    ROLLBACK = "rollback"


class DriftState(str, Enum):
    NORMAL = "NORMAL"
    WATCH = "WATCH"
    DRIFT_DETECTED = "DRIFT_DETECTED"
    SEVERE_DRIFT = "SEVERE_DRIFT"


class PredictionStatus(str, Enum):
    HIGH_CONFIDENCE = "HIGH_CONFIDENCE"
    UNCERTAIN = "UNCERTAIN"
    LOW_COVERAGE = "LOW_COVERAGE"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    MODEL_FALLBACK = "MODEL_FALLBACK"
    HEURISTIC_FALLBACK = "HEURISTIC_FALLBACK"


# ---------------------------------------------------------------------------
# Workstream A: Canonical Data Entities
# ---------------------------------------------------------------------------

class LocationCoordinates(BaseModel):
    zone_id: str
    zone_name: str
    floor: Optional[int] = 1
    building: Optional[str] = "Main Facility"
    latitude: Optional[float] = 11.0168
    longitude: Optional[float] = 76.9558


class SensorRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"SNR-{uuid4().hex[:8].upper()}")
    tenant_id: str = "TEN-BALA-HQ"
    modality: SensorModality
    model_number: str
    serial_number: str
    location: LocationCoordinates
    calibrated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    sampling_rate_hz: float = 1.0


class BaseIngestedReading(BaseModel):
    id: str = Field(default_factory=lambda: f"RDG-{uuid4().hex[:10].upper()}")
    idempotency_key: Optional[str] = None
    tenant_id: str = "TEN-BALA-HQ"
    incident_id: str
    sensor_id: str
    modality: SensorModality
    location: LocationCoordinates
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ingestion_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    provenance: str = "iot_ingest_gateway"
    schema_version: str = "5.0.0"
    processing_status: ProcessingStatus = ProcessingStatus.RECEIVED
    confidence: float = Field(0.90, ge=0.0, le=1.0)


class ThermalReading(BaseIngestedReading):
    modality: SensorModality = SensorModality.FLIR_THERMAL
    temperature_celsius: float = Field(..., ge=-50.0, le=1500.0)
    ambient_celsius: float = 24.0
    thermal_gradient_celsius: float = Field(..., description="Rise over ambient threshold")
    radiometric_emissivity: float = Field(0.95, ge=0.1, le=1.0)
    focal_plane_array_temp: float = 22.5


class EnvironmentalReading(BaseIngestedReading):
    modality: SensorModality = SensorModality.AIR_QUALITY
    particulate_pm25: float = Field(..., ge=0.0, le=2000.0)
    particulate_pm10: float = Field(..., ge=0.0, le=5000.0)
    co2_ppm: float = Field(420.0, ge=300.0, le=10000.0)
    voc_ppb: float = Field(50.0, ge=0.0, le=50000.0)
    combustion_aerosol_ppm: float = Field(0.0, ge=0.0, le=500.0)


class CameraObservation(BaseIngestedReading):
    modality: SensorModality = SensorModality.CCTV_OPTICAL
    crowd_count: int = Field(0, ge=0)
    optical_flow_velocity_mps: float = Field(1.2, ge=0.0, le=15.0)
    egress_obstruction_ratio: float = Field(0.0, ge=0.0, le=1.0)
    visible_smoke_density: float = Field(0.0, ge=0.0, le=1.0)
    bounding_boxes: List[List[float]] = Field(default_factory=list)


class HumanReport(BaseIngestedReading):
    modality: SensorModality = SensorModality.HUMAN_REPORT
    reporter_callsign: str
    report_text: str
    verified_visual_hazard: bool = True
    estimated_casualties: int = Field(0, ge=0)


class ObservationEnvelope(BaseModel):
    """Normalized carrier for all ingested observations."""
    reading_id: str
    tenant_id: str
    incident_id: str
    sensor_id: str
    modality: SensorModality
    location: LocationCoordinates
    timestamp: datetime
    ingestion_timestamp: datetime
    metrics: Dict[str, Any]
    provenance: str
    confidence: float
    status: ProcessingStatus = ProcessingStatus.VALIDATED
    schema_version: str = "5.0.0"


# ---------------------------------------------------------------------------
# Workstream E: Data Quality Models
# ---------------------------------------------------------------------------

class DataQualityViolation(BaseModel):
    rule: str
    reading_id: str
    sensor_id: str
    description: str
    severity: Literal["warning", "critical"]


class DataQualityReport(BaseModel):
    incident_id: str
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    quality_score: float = Field(1.0, ge=0.0, le=1.0, description="Overall data reliability (0-1)")
    coverage_score: float = Field(1.0, ge=0.0, le=1.0, description="Percentage of required sensors active")
    freshness_seconds: float = Field(0.0, ge=0.0, description="Age of newest reading in seconds")
    conflicting_sensors_count: int = 0
    stale_sensors_count: int = 0
    total_readings_evaluated: int = 0
    violations: List[DataQualityViolation] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Workstream F: Feature Engineering Models
# ---------------------------------------------------------------------------

class EnvironmentalFeatures(BaseModel):
    max_temperature_c: float
    thermal_rise_rate_c_per_min: float
    particulate_peak_ppm: float
    particulate_surge_ratio: float
    hazard_index: float = Field(0.0, ge=0.0, le=1.0)


class SpatialFeatures(BaseModel):
    affected_zone_radius_m: float
    active_sensor_density_per_sqm: float
    distance_to_nearest_exit_m: float
    perimeter_isolation_pct: float = Field(0.0, ge=0.0, le=100.0)


class CrowdFeatures(BaseModel):
    estimated_occupancy: int
    crowd_density_per_sqm: float
    egress_velocity_mps: float
    flow_deceleration_rate: float
    corridor_congestion_risk: float = Field(0.0, ge=0.0, le=1.0)


class TemporalFeatures(BaseModel):
    incident_duration_minutes: float
    observation_frequency_hz: float
    volatility_index: float = Field(0.0, ge=0.0, le=1.0)


class EvidenceFeatures(BaseModel):
    sensor_agreement_ratio: float = Field(1.0, ge=0.0, le=1.0)
    cross_modal_conflict_delta: float = Field(0.0, ge=0.0, le=1.0)
    fused_confidence_score: float = Field(0.9, ge=0.0, le=1.0)
    modality_coverage_count: int = Field(1, ge=1)


class FeatureSnapshot(BaseModel):
    id: str = Field(default_factory=lambda: f"FEAT-{uuid4().hex[:8].upper()}")
    incident_id: str
    tenant_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    feature_schema_version: str = "2.0.0"
    environmental: EnvironmentalFeatures
    spatial: SpatialFeatures
    crowd: CrowdFeatures
    temporal: TemporalFeatures
    evidence: EvidenceFeatures
    raw_reading_ids: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Workstream G & H: Prediction & Uncertainty Models
# ---------------------------------------------------------------------------

class UncertaintyInterval(BaseModel):
    point_estimate: float = Field(..., ge=0.0, le=1.0)
    lower_bound_90: float = Field(..., ge=0.0, le=1.0)
    upper_bound_90: float = Field(..., ge=0.0, le=1.0)
    confidence_level: float = 0.90
    spread: float = Field(..., description="upper - lower width representing epistemic uncertainty")


class SeverityPrediction(BaseModel):
    predicted_severity: Literal["SEV-1 Critical", "SEV-2 High", "SEV-3 Moderate", "SEV-4 Low"]
    probabilities: Dict[str, float]
    point_score: float
    uncertainty: UncertaintyInterval


class EscalationRiskPrediction(BaseModel):
    risk_score: float = Field(..., ge=0.0, le=1.0)
    uncertainty: UncertaintyInterval
    time_horizon_minutes: int = 15
    trend_direction: Literal["rapidly_escalating", "holding_steady", "de-escalating"]


class EvacuationCorridorRisk(BaseModel):
    corridor_id: str
    corridor_name: str
    congestion_risk: float = Field(..., ge=0.0, le=1.0)
    uncertainty: UncertaintyInterval
    projected_pinch_point: bool = False
    reroute_recommended: bool = False


class HazardPersistenceTrend(BaseModel):
    persistence_hours: float
    decay_rate_per_hour: float
    momentum: Literal["expanding", "stationary", "contained"]


class CriticalStateEstimation(BaseModel):
    time_to_critical_state_seconds: Optional[int] = None
    critical_event_type: str = "thermal_flashover"
    sufficient_evidence: bool = True
    reasoning: str


class IncidentPredictionBundle(BaseModel):
    id: str = Field(default_factory=lambda: f"PRED-{uuid4().hex[:10].upper()}")
    incident_id: str
    tenant_id: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_version: str = "risk-ensemble-v2.4"
    feature_snapshot_id: str
    status: PredictionStatus = PredictionStatus.HIGH_CONFIDENCE
    data_quality_score: float
    feature_freshness_seconds: float
    coverage_score: float
    provenance: str = "sentra_ml_inference_cluster"
    fallback_mode: bool = False
    fallback_reason: Optional[str] = None

    # Multi-task predictions
    severity: SeverityPrediction
    escalation_risk: EscalationRiskPrediction
    evacuation_corridors: List[EvacuationCorridorRisk]
    hazard_persistence: HazardPersistenceTrend
    critical_state: CriticalStateEstimation


# ---------------------------------------------------------------------------
# Workstream I & J & K: MLOps & Model Governance Models
# ---------------------------------------------------------------------------

class ModelEvaluationMetrics(BaseModel):
    accuracy: float = 0.934
    precision: float = 0.918
    recall: float = 0.945
    f1_score: float = 0.931
    brier_calibration_score: float = 0.048
    p50_latency_ms: float = 14.2
    p95_latency_ms: float = 38.5
    p99_latency_ms: float = 62.0
    fallback_rate_pct: float = 0.8
    test_sample_size: int = 12400
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ModelVersionRecord(BaseModel):
    model_id: str
    model_name: str
    version: str
    task: str
    framework: str
    training_data_reference: str
    feature_schema_version: str = "2.0.0"
    deployment_state: ModelDeploymentState
    metrics: ModelEvaluationMetrics
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = False
    is_shadow: bool = False


class ShadowDivergenceLog(BaseModel):
    id: str = Field(default_factory=lambda: f"DIV-{uuid4().hex[:8].upper()}")
    incident_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    active_model_id: str
    active_prediction: float
    shadow_model_id: str
    shadow_prediction: float
    divergence_delta: float
    active_latency_ms: float
    shadow_latency_ms: float
    within_acceptable_threshold: bool = True


class DriftMetric(BaseModel):
    feature_name: str
    psi_score: float
    distribution_shift_detected: bool
    mean_reference: float
    mean_current: float


class DriftReport(BaseModel):
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    drift_state: DriftState = DriftState.NORMAL
    overall_psi: float = 0.042
    feature_drifts: List[DriftMetric] = Field(default_factory=list)
    sensor_dropout_rate_pct: float = 0.0
    notes: str = "Feature distributions adhere to calibrated baselines."


class InferenceTelemetryReport(BaseModel):
    total_inferences: int = 0
    p50_latency_ms: float = 14.5
    p95_latency_ms: float = 38.2
    p99_latency_ms: float = 61.8
    total_errors: int = 0
    total_fallbacks: int = 0
    gemini_tokens_used: int = 0
    estimated_ai_cost_usd: float = 0.0
    active_model_version: str = "risk-ensemble-v2.4"
    shadow_model_version: str = "transformer-crowd-v3.0"
    tenant_id: str = "TEN-BALA-HQ"

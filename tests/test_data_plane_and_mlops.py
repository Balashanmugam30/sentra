# tests/test_data_plane_and_mlops.py
"""
Sentra Phase 5 Test Suite - Data Plane, Prediction, and MLOps Verification.
Validates multi-sensor ingestion, idempotency, data quality scoring, feature extraction,
calibrated uncertainty intervals, model registry, shadow mode divergence, drift monitoring,
and FastAPI endpoints.
"""

from __future__ import annotations

import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.data.canonical_schemas import (
    ModelDeploymentState,
    PredictionStatus,
    SensorModality,
)
from app.data.ingestion import IngestionError, ingestion_pipeline
from app.data.quality_engine import quality_engine
from app.data.feature_engine import feature_engine
from app.data.storage import data_storage
from app.ml.prediction_engine import crisis_prediction_engine
from app.mlops.model_registry import mlops_governance


@pytest.fixture
def client():
    return TestClient(app)


def test_ingestion_and_idempotency():
    """Verifies that multi-source telemetry is ingested and duplicate deliveries are safely ignored."""
    from uuid import uuid4

    unique_key = f"IDEMP-TEST-{uuid4().hex[:8]}"
    reading_payload = {
        "idempotency_key": unique_key,
        "incident_id": f"INC-TEST-{uuid4().hex[:6]}",
        "sensor_id": "SNR-FLIR-09",
        "modality": "FLIR_THERMAL",
        "temperature_celsius": 76.5,
        "ambient_celsius": 24.0,
        "thermal_gradient_celsius": 52.5,
        "location": {"zone_id": "ZONE-KITCHEN-B", "zone_name": "Kitchen Zone B"},
    }

    # First delivery: should be new
    env1, is_new1 = ingestion_pipeline.ingest_reading(reading_payload)
    assert is_new1 is True
    assert env1.metrics["temperature_celsius"] == 76.5
    assert env1.modality == SensorModality.FLIR_THERMAL

    # Duplicate delivery with same idempotency key: should not duplicate
    env2, is_new2 = ingestion_pipeline.ingest_reading(reading_payload)
    assert is_new2 is False


def test_ingestion_range_validation():
    """Verifies that impossible physical measurements are strictly rejected."""
    # Negative particulate count
    with pytest.raises(IngestionError):
        ingestion_pipeline.ingest_reading(
            {
                "incident_id": "INC-TEST-501",
                "modality": "AIR_QUALITY",
                "particulate_pm25": -15.0,
            }
        )

    # Implausible temperature > 1500°C
    with pytest.raises(IngestionError):
        ingestion_pipeline.ingest_reading(
            {
                "incident_id": "INC-TEST-501",
                "modality": "FLIR_THERMAL",
                "temperature_celsius": 2500.0,
            }
        )


def test_data_quality_scoring_and_conflicts():
    """Verifies data quality engine detects cross-modal conflicts and scores reliability."""
    incident_id = "INC-QUALITY-TEST"

    # Ingest high thermal anomaly with 0 aerosol particulate to trigger conflict
    ingestion_pipeline.ingest_reading(
        {
            "incident_id": incident_id,
            "sensor_id": "SNR-THM-CONFLICT",
            "modality": "FLIR_THERMAL",
            "temperature_celsius": 95.0,
            "ambient_celsius": 24.0,
            "thermal_gradient_celsius": 71.0,
        }
    )
    ingestion_pipeline.ingest_reading(
        {
            "incident_id": incident_id,
            "sensor_id": "SNR-AIR-CONFLICT",
            "modality": "AIR_QUALITY",
            "particulate_pm25": 4.0,
            "combustion_aerosol_ppm": 0.0,
        }
    )

    report = quality_engine.evaluate_incident_data(incident_id)
    assert report.total_readings_evaluated >= 2
    assert report.conflicting_sensors_count >= 1
    # Quality score should reflect penalty
    assert report.quality_score < 1.0


def test_feature_engineering_extraction():
    """Verifies multi-dimensional feature extraction produces valid snapshot."""
    incident_id = "INC-FEAT-TEST"

    ingestion_pipeline.ingest_reading(
        {
            "incident_id": incident_id,
            "sensor_id": "SNR-THM-FEAT",
            "modality": "FLIR_THERMAL",
            "temperature_celsius": 68.0,
        }
    )
    ingestion_pipeline.ingest_reading(
        {
            "incident_id": incident_id,
            "sensor_id": "SNR-CAM-FEAT",
            "modality": "CCTV_OPTICAL",
            "crowd_count": 22,
            "optical_flow_velocity_mps": 0.8,
        }
    )

    feat = feature_engine.extract_features(incident_id)
    assert feat.feature_schema_version == "2.0.0"
    assert feat.environmental.max_temperature_c >= 68.0
    assert feat.crowd.estimated_occupancy >= 22
    assert feat.spatial.distance_to_nearest_exit_m > 0
    assert feat.temporal.incident_duration_minutes > 0


def test_prediction_engine_uncertainty_intervals():
    """Verifies calibrated uncertainty intervals and multi-task predictions."""
    incident_id = "INC-PRED-TEST"

    ingestion_pipeline.ingest_reading(
        {
            "incident_id": incident_id,
            "sensor_id": "SNR-THM-P1",
            "modality": "FLIR_THERMAL",
            "temperature_celsius": 78.4,
        }
    )
    ingestion_pipeline.ingest_reading(
        {
            "incident_id": incident_id,
            "sensor_id": "SNR-AIR-P1",
            "modality": "AIR_QUALITY",
            "particulate_pm25": 42.8,
            "combustion_aerosol_ppm": 35.0,
        }
    )
    ingestion_pipeline.ingest_reading(
        {
            "incident_id": incident_id,
            "sensor_id": "SNR-CAM-P1",
            "modality": "CCTV_OPTICAL",
            "crowd_count": 18,
        }
    )

    bundle = crisis_prediction_engine.predict(incident_id)
    assert bundle.status == PredictionStatus.HIGH_CONFIDENCE
    assert bundle.model_version == "risk-ensemble-v2.4"

    # Escalation Risk with 90% uncertainty interval
    esc = bundle.escalation_risk
    assert 0.0 <= esc.risk_score <= 1.0
    assert esc.uncertainty.lower_bound_90 <= esc.risk_score <= esc.uncertainty.upper_bound_90
    assert esc.uncertainty.confidence_level == 0.90
    assert esc.uncertainty.spread > 0.0

    # Severity distribution
    assert bundle.severity.predicted_severity in {"SEV-1 Critical", "SEV-2 High", "SEV-3 Moderate", "SEV-4 Low"}

    # Evacuation corridors
    assert len(bundle.evacuation_corridors) >= 2

    # Forced fallback test
    fallback_bundle = crisis_prediction_engine.predict(incident_id, force_fallback=True)
    assert fallback_bundle.fallback_mode is True
    assert fallback_bundle.status == PredictionStatus.HEURISTIC_FALLBACK
    assert fallback_bundle.fallback_reason is not None


def test_mlops_model_registry_and_shadow_execution():
    """Verifies model lifecycle state transitions and shadow candidate execution."""
    # List models
    models = mlops_governance.list_models()
    assert len(models) >= 4
    model_ids = {m.model_id for m in models}
    assert "sentra-ensemble-risk-v2.4" in model_ids
    assert "sentra-transformer-crowd-v3.0" in model_ids

    # Active and shadow state
    active_and_shadow = mlops_governance.get_active_models()
    assert len(active_and_shadow["active_models"]) >= 1
    assert len(active_and_shadow["shadow_models"]) >= 1

    # Shadow execution divergence
    incident_id = "INC-SHADOW-TEST"
    features = feature_engine.extract_features(incident_id)
    shadow_log = mlops_governance.run_shadow_evaluation(
        incident_id=incident_id,
        features=features,
        active_prediction_value=0.12,
    )
    assert shadow_log.active_prediction == 0.12
    assert 0.0 <= shadow_log.shadow_prediction <= 1.0
    assert shadow_log.divergence_delta >= 0.0
    assert shadow_log.within_acceptable_threshold is True

    # Test excessive divergence flag
    diverged_log = mlops_governance.run_shadow_evaluation(
        incident_id=incident_id,
        features=features,
        active_prediction_value=0.88,
    )
    assert diverged_log.within_acceptable_threshold is False


def test_drift_and_telemetry_monitoring():
    """Verifies feature Population Stability Index (PSI) and inference telemetry."""
    drift_report = mlops_governance.evaluate_drift()
    assert drift_report.drift_state.value in {"NORMAL", "WATCH", "DRIFT_DETECTED", "SEVERE_DRIFT"}
    assert len(drift_report.feature_drifts) >= 4
    assert drift_report.overall_psi >= 0.0

    telemetry = mlops_governance.get_telemetry_report()
    assert telemetry.total_inferences >= 0
    assert telemetry.p50_latency_ms > 0.0
    assert telemetry.p95_latency_ms >= telemetry.p50_latency_ms
    assert telemetry.active_model_version == "risk-ensemble-v2.4"


def test_fastapi_data_and_mlops_endpoints(client: TestClient):
    """Verifies public and authenticated endpoints across data and mlops routers."""
    # 1. POST /data/ingest
    res_ingest = client.post(
        "/data/ingest",
        json={
            "incident_id": "INC-API-501",
            "sensor_id": "SNR-FLIR-API",
            "modality": "FLIR_THERMAL",
            "temperature_celsius": 82.0,
            "ambient_celsius": 24.0,
            "thermal_gradient_celsius": 58.0,
        },
    )
    assert res_ingest.status_code == 201
    assert res_ingest.json()["status"] == "success"

    # 2. GET /data/health
    res_health = client.get("/data/health?incident_id=INC-API-501")
    assert res_health.status_code == 200
    health_data = res_health.json()
    assert "data_quality_score" in health_data
    assert "storage" in health_data

    # 3. GET /predictions/incident/{incident_id}
    res_pred = client.get("/predictions/incident/INC-API-501")
    assert res_pred.status_code == 200
    pred_data = res_pred.json()
    assert "escalation_risk" in pred_data
    assert "uncertainty" in pred_data["escalation_risk"]
    assert "model_version" in pred_data

    # 4. GET /predictions/incident/{incident_id}/history
    res_hist = client.get("/predictions/incident/INC-API-501/history")
    assert res_hist.status_code == 200
    assert "history" in res_hist.json()

    # 5. GET /mlops/governance/models
    res_models = client.get("/mlops/governance/models")
    assert res_models.status_code == 200
    assert len(res_models.json()["models"]) >= 4

    # 6. GET /mlops/governance/drift
    res_drift = client.get("/mlops/governance/drift")
    assert res_drift.status_code == 200
    assert "drift_state" in res_drift.json()

    # 7. GET /mlops/governance/telemetry
    res_telem = client.get("/mlops/governance/telemetry")
    assert res_telem.status_code == 200
    assert "p50_latency_ms" in res_telem.json()

    # 8. GET /mlops/health
    res_ml_health = client.get("/mlops/health")
    assert res_ml_health.status_code == 200
    assert res_ml_health.json()["status"] in {"healthy", "warning"}

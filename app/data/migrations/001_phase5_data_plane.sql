-- app/data/migrations/001_phase5_data_plane.sql
-- Sentra Phase 5: Persistent Data Plane & MLOps Governance Schema
-- PostgreSQL 15+ compatible with multi-tenancy, time indexing, and foreign key constraints.

CREATE TABLE IF NOT EXISTS sensor_registry (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    modality VARCHAR(32) NOT NULL,
    model_number VARCHAR(64) NOT NULL,
    serial_number VARCHAR(64) NOT NULL,
    zone_id VARCHAR(64) NOT NULL,
    zone_name VARCHAR(128) NOT NULL,
    sampling_rate_hz FLOAT DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    calibrated_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_tenant ON sensor_registry(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sensor_modality ON sensor_registry(modality);

CREATE TABLE IF NOT EXISTS sensor_observations (
    id VARCHAR(64) PRIMARY KEY,
    idempotency_key VARCHAR(128) UNIQUE,
    tenant_id VARCHAR(64) NOT NULL,
    incident_id VARCHAR(64) NOT NULL,
    sensor_id VARCHAR(64) NOT NULL,
    modality VARCHAR(32) NOT NULL,
    zone_id VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    ingestion_timestamp TIMESTAMPTZ DEFAULT NOW(),
    metrics JSONB NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.9,
    processing_status VARCHAR(32) NOT NULL DEFAULT 'persisted',
    provenance VARCHAR(128) NOT NULL,
    schema_version VARCHAR(16) NOT NULL DEFAULT '5.0.0'
);

CREATE INDEX IF NOT EXISTS idx_obs_incident ON sensor_observations(incident_id);
CREATE INDEX IF NOT EXISTS idx_obs_tenant_time ON sensor_observations(tenant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_obs_sensor ON sensor_observations(sensor_id);

CREATE TABLE IF NOT EXISTS feature_snapshots (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    feature_schema_version VARCHAR(16) NOT NULL DEFAULT '2.0.0',
    features JSONB NOT NULL,
    raw_reading_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feat_incident ON feature_snapshots(incident_id);
CREATE INDEX IF NOT EXISTS idx_feat_tenant_time ON feature_snapshots(tenant_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL,
    model_version VARCHAR(64) NOT NULL,
    feature_snapshot_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    data_quality_score FLOAT NOT NULL,
    feature_freshness_seconds FLOAT NOT NULL,
    coverage_score FLOAT NOT NULL,
    payload JSONB NOT NULL,
    fallback_mode BOOLEAN DEFAULT FALSE,
    fallback_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pred_incident ON predictions(incident_id);
CREATE INDEX IF NOT EXISTS idx_pred_tenant_time ON predictions(tenant_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pred_model ON predictions(model_version);

CREATE TABLE IF NOT EXISTS model_registry (
    model_id VARCHAR(64) PRIMARY KEY,
    model_name VARCHAR(128) NOT NULL,
    version VARCHAR(32) NOT NULL,
    task VARCHAR(64) NOT NULL,
    framework VARCHAR(64) NOT NULL,
    training_data_reference VARCHAR(256),
    feature_schema_version VARCHAR(16) NOT NULL DEFAULT '2.0.0',
    deployment_state VARCHAR(32) NOT NULL DEFAULT 'candidate',
    metrics JSONB NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    is_shadow BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shadow_divergence_logs (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    active_model_id VARCHAR(64) NOT NULL,
    active_prediction FLOAT NOT NULL,
    shadow_model_id VARCHAR(64) NOT NULL,
    shadow_prediction FLOAT NOT NULL,
    divergence_delta FLOAT NOT NULL,
    active_latency_ms FLOAT NOT NULL,
    shadow_latency_ms FLOAT NOT NULL,
    within_acceptable_threshold BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_shadow_incident ON shadow_divergence_logs(incident_id);

CREATE TABLE IF NOT EXISTS data_quality_events (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    quality_score FLOAT NOT NULL,
    coverage_score FLOAT NOT NULL,
    freshness_seconds FLOAT NOT NULL,
    conflicting_sensors INT DEFAULT 0,
    stale_sensors INT DEFAULT 0,
    violations JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_dq_incident ON data_quality_events(incident_id);

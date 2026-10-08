# app/data/feature_engine.py
"""
Sentra Phase 5 - Multi-Dimensional Feature Engineering Engine.
Transforms persisted raw sensor observations into normalized, versioned FeatureSnapshots
across Environmental, Spatial, Crowd, Temporal, and Evidence dimensions.
Provides mathematically consistent inputs for downstream ML prediction models.
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.data.canonical_schemas import (
    CrowdFeatures,
    EnvironmentalFeatures,
    EvidenceFeatures,
    FeatureSnapshot,
    ObservationEnvelope,
    SensorModality,
    SpatialFeatures,
    TemporalFeatures,
)
from app.data.storage import data_storage


class FeatureEngineeringEngine:
    FEATURE_SCHEMA_VERSION = "2.0.0"

    def __init__(self):
        self.storage = data_storage

    def extract_features(self, incident_id: str, tenant_id: str = "TEN-BALA-HQ") -> FeatureSnapshot:
        """
        Extracts multi-family feature vector from observations belonging to the incident.
        Imputes robust default baselines if specific modalities are cold or offline.
        """
        raw_obs = self.storage.get_observations(incident_id, limit=50, tenant_id=tenant_id)
        observations = [ObservationEnvelope(**o) for o in raw_obs]
        now_utc = datetime.now(timezone.utc)

        # 1. Environmental Features
        thermal_readings = [o for o in observations if o.modality == SensorModality.FLIR_THERMAL]
        air_readings = [o for o in observations if o.modality == SensorModality.AIR_QUALITY]

        if thermal_readings:
            max_temp = max(t.metrics.get("temperature_celsius", 25.0) for t in thermal_readings)
            ambient = thermal_readings[0].metrics.get("ambient_celsius", 24.0)
            grad = max(0.0, max_temp - ambient)
            # Estimate rate of rise: degrees per minute
            rise_rate = min(30.0, grad / max(1.0, len(thermal_readings)))
        else:
            max_temp = 24.0
            rise_rate = 0.0

        if air_readings:
            peak_ppm = max(a.metrics.get("combustion_aerosol_ppm", 0.0) for a in air_readings)
            pm25 = max(a.metrics.get("particulate_pm25", 12.0) for a in air_readings)
            surge_ratio = min(10.0, pm25 / 15.0)
        else:
            peak_ppm = 0.0
            surge_ratio = 1.0

        hazard_index = min(1.0, (max(0.0, max_temp - 25.0) / 100.0) * 0.6 + (peak_ppm / 50.0) * 0.4)
        env_features = EnvironmentalFeatures(
            max_temperature_c=round(max_temp, 1),
            thermal_rise_rate_c_per_min=round(rise_rate, 2),
            particulate_peak_ppm=round(peak_ppm, 1),
            particulate_surge_ratio=round(surge_ratio, 2),
            hazard_index=round(hazard_index, 3),
        )

        # 2. Spatial Features
        # Zone bounds and distance to nearest egress
        zone_id = observations[0].location.zone_id if observations else "ZONE-B"
        nearest_exit_m = 18.0 if "B" in zone_id else 25.0
        active_sensor_count = len({o.sensor_id for o in observations})
        density = active_sensor_count / 150.0  # sensors per square meter (approx 150 sqm zone)

        spatial_features = SpatialFeatures(
            affected_zone_radius_m=12.5,
            active_sensor_density_per_sqm=round(density, 4),
            distance_to_nearest_exit_m=nearest_exit_m,
            perimeter_isolation_pct=75.0 if hazard_index > 0.5 else 95.0,
        )

        # 3. Crowd Features
        camera_readings = [o for o in observations if o.modality == SensorModality.CCTV_OPTICAL]
        if camera_readings:
            occupancy = sum(c.metrics.get("crowd_count", 0) for c in camera_readings)
            avg_vel = sum(c.metrics.get("optical_flow_velocity_mps", 1.2) for c in camera_readings) / len(camera_readings)
            obstruction = max(c.metrics.get("egress_obstruction_ratio", 0.0) for c in camera_readings)
        else:
            occupancy = 14
            avg_vel = 1.2
            obstruction = 0.0

        crowd_density = occupancy / 80.0  # occupants per sqm in egress foyer
        decel_rate = max(0.0, 1.4 - avg_vel)
        congestion_risk = min(1.0, (crowd_density * 0.5) + (obstruction * 0.3) + (decel_rate * 0.2))

        crowd_features = CrowdFeatures(
            estimated_occupancy=occupancy,
            crowd_density_per_sqm=round(crowd_density, 2),
            egress_velocity_mps=round(avg_vel, 2),
            flow_deceleration_rate=round(decel_rate, 2),
            corridor_congestion_risk=round(congestion_risk, 3),
        )

        # 4. Temporal Features
        if observations:
            oldest_ts = min(o.timestamp for o in observations)
            duration_minutes = max(0.5, (now_utc - oldest_ts).total_seconds() / 60.0)
            obs_freq = len(observations) / max(1.0, duration_minutes * 60.0)
        else:
            duration_minutes = 1.0
            obs_freq = 0.2

        temporal_features = TemporalFeatures(
            incident_duration_minutes=round(duration_minutes, 1),
            observation_frequency_hz=round(obs_freq, 3),
            volatility_index=round(min(1.0, hazard_index * 0.7 + congestion_risk * 0.3), 3),
        )

        # 5. Evidence Features
        modalities = {o.modality for o in observations}
        modality_count = max(1, len(modalities))
        avg_conf = sum(o.confidence for o in observations) / len(observations) if observations else 0.88

        evidence_features = EvidenceFeatures(
            sensor_agreement_ratio=0.94 if modality_count >= 2 else 0.80,
            cross_modal_conflict_delta=0.04,
            fused_confidence_score=round(avg_conf, 2),
            modality_coverage_count=modality_count,
        )

        snapshot = FeatureSnapshot(
            incident_id=incident_id,
            tenant_id=tenant_id,
            timestamp=now_utc,
            feature_schema_version=self.FEATURE_SCHEMA_VERSION,
            environmental=env_features,
            spatial=spatial_features,
            crowd=crowd_features,
            temporal=temporal_features,
            evidence=evidence_features,
            raw_reading_ids=[o.reading_id for o in observations],
        )

        self.storage.save_features(snapshot)
        return snapshot


feature_engine = FeatureEngineeringEngine()

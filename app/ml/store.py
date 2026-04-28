from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings

DEMO_TENANTS = (
    "TEN-BALA-UNI",
    "TEN-BALA-MFG",
    "TEN-BALA-HOSP",
    "TEN-GOVSECURE",
    "TEN-GRAND-MERIDIAN",
)


def utc_now_iso() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


SEED_DATASETS: tuple[dict[str, Any], ...] = (
    {"dataset_id": "DS-HOTEL-INC-2024", "name": "hotel_incidents_2024", "domain": "incidents", "rows": 148200, "columns": 42, "missing_percent": 1.8, "freshness_minutes": 18, "label_coverage": 92, "quality_score": 96, "source": "incident warehouse", "status": "ready"},
    {"dataset_id": "DS-MALL-CROWD-Q1", "name": "mall_crowd_behavior_q1", "domain": "behavior", "rows": 382000, "columns": 58, "missing_percent": 2.6, "freshness_minutes": 42, "label_coverage": 88, "quality_score": 93, "source": "crowd dynamics + mobile responses", "status": "ready"},
    {"dataset_id": "DS-HOSP-ALERT", "name": "hospital_alert_response", "domain": "communications", "rows": 96400, "columns": 36, "missing_percent": 3.4, "freshness_minutes": 25, "label_coverage": 86, "quality_score": 91, "source": "alert acknowledgements", "status": "labeling"},
    {"dataset_id": "DS-SENSOR-ARCHIVE", "name": "sensor_stream_archive", "domain": "sensor telemetry", "rows": 2480000, "columns": 64, "missing_percent": 0.9, "freshness_minutes": 5, "label_coverage": 81, "quality_score": 95, "source": "IoT telemetry lake", "status": "ready"},
    {"dataset_id": "DS-REV-USAGE", "name": "revenue_tenants_usage", "domain": "revenue", "rows": 52400, "columns": 48, "missing_percent": 2.1, "freshness_minutes": 60, "label_coverage": 90, "quality_score": 94, "source": "billing + product usage", "status": "ready"},
    {"dataset_id": "DS-EVAC-OUTCOMES", "name": "evacuation_outcomes", "domain": "outcomes", "rows": 117600, "columns": 52, "missing_percent": 1.4, "freshness_minutes": 14, "label_coverage": 94, "quality_score": 97, "source": "human behavior memory graph", "status": "ready"},
)

SEED_FEATURES: tuple[dict[str, Any], ...] = (
    {"feature_id": "FEAT-RESP-TIME", "name": "avg_response_time", "domain": "operations", "freshness": "5 min", "drift_score": 8, "importance": 91, "status": "healthy"},
    {"feature_id": "FEAT-PANIC-DENSITY", "name": "panic_density", "domain": "behavior", "freshness": "2 min", "drift_score": 11, "importance": 96, "status": "healthy"},
    {"feature_id": "FEAT-SMOKE-SLOPE", "name": "smoke_trend_slope", "domain": "iot", "freshness": "real time", "drift_score": 6, "importance": 93, "status": "healthy"},
    {"feature_id": "FEAT-OCC-RATIO", "name": "occupancy_ratio", "domain": "facility", "freshness": "1 min", "drift_score": 14, "importance": 88, "status": "watch"},
    {"feature_id": "FEAT-RENEWAL", "name": "renewal_probability", "domain": "revenue", "freshness": "1 hour", "drift_score": 18, "importance": 84, "status": "watch"},
    {"feature_id": "FEAT-TRUST-DRIFT", "name": "trust_drift_rate", "domain": "behavior", "freshness": "10 min", "drift_score": 9, "importance": 90, "status": "healthy"},
    {"feature_id": "FEAT-TEAM-LOAD", "name": "team_load", "domain": "operations", "freshness": "3 min", "drift_score": 12, "importance": 87, "status": "healthy"},
)

SEED_JOBS: tuple[dict[str, Any], ...] = (
    {"job_id": "JOB-RISK-XGB-024", "model_domain": "Crisis Risk Prediction", "algorithm": "XGBoost", "status": "running", "dataset": "hotel_incidents_2024", "training_time_minutes": 18, "accuracy": 94.2, "precision": 93.1, "recall": 91.8, "f1": 92.4, "latency_score": 88, "gpu_usage": 42, "owner": "AI Platform"},
    {"job_id": "JOB-PANIC-LGBM-017", "model_domain": "Panic Probability", "algorithm": "LightGBM", "status": "queued", "dataset": "mall_crowd_behavior_q1", "training_time_minutes": 24, "accuracy": 92.8, "precision": 91.4, "recall": 93.6, "f1": 92.5, "latency_score": 91, "gpu_usage": 0, "owner": "Behavior AI"},
    {"job_id": "JOB-CROWD-ENS-031", "model_domain": "Crowd Congestion", "algorithm": "Ensemble", "status": "completed", "dataset": "evacuation_outcomes", "training_time_minutes": 31, "accuracy": 95.1, "precision": 94.5, "recall": 94.2, "f1": 94.3, "latency_score": 85, "gpu_usage": 68, "owner": "Crowd Lab"},
)

SEED_EXPERIMENTS: tuple[dict[str, Any], ...] = (
    {"experiment_id": "EXP-RISK-ENSEMBLE", "name": "risk_model_ensemble_sweep", "model_domain": "Crisis Risk Prediction", "runs": 18, "winner_run": "RUN-014", "best_accuracy": 95.4, "feature_count": 32, "hyperparameters": {"max_depth": 7, "eta": 0.06, "subsample": 0.82}, "status": "winner"},
    {"experiment_id": "EXP-PANIC-MSG", "name": "panic_message_weighting", "model_domain": "Panic Probability", "runs": 12, "winner_run": "RUN-009", "best_accuracy": 93.2, "feature_count": 27, "hyperparameters": {"leaves": 64, "learning_rate": 0.04}, "status": "active"},
    {"experiment_id": "EXP-CHURN-USAGE", "name": "tenant_churn_usage_blend", "model_domain": "Churn Prediction", "runs": 9, "winner_run": "RUN-006", "best_accuracy": 89.7, "feature_count": 22, "hyperparameters": {"n_estimators": 240, "max_features": "sqrt"}, "status": "staging"},
)

SEED_MODELS: tuple[dict[str, Any], ...] = (
    {"model_id": "MODEL-RISK-V3", "name": "Risk Model", "version": "v3.2.0", "domain": "Crisis Risk Prediction", "status": "production", "created_date": "2026-04-18", "owner": "AI Platform", "score": 95.4, "production": True, "latency_ms": 42, "rollback_to": "v3.1.4"},
    {"model_id": "MODEL-PANIC-V2", "name": "Panic Model", "version": "v2.7.1", "domain": "Panic Probability", "status": "staging", "created_date": "2026-04-22", "owner": "Behavior AI", "score": 93.2, "production": False, "latency_ms": 38, "rollback_to": "v2.6.9"},
    {"model_id": "MODEL-CROWD-V4", "name": "Crowd Flow Model", "version": "v4.0.3", "domain": "Crowd Congestion", "status": "production", "created_date": "2026-04-19", "owner": "Crowd Lab", "score": 95.1, "production": True, "latency_ms": 51, "rollback_to": "v3.9.8"},
    {"model_id": "MODEL-FORECAST-V2", "name": "Forecast Model", "version": "v2.4.0", "domain": "Revenue Forecast", "status": "staging", "created_date": "2026-04-21", "owner": "Revenue AI", "score": 90.6, "production": False, "latency_ms": 74, "rollback_to": "v2.3.5"},
    {"model_id": "MODEL-CHURN-V1", "name": "Churn Model", "version": "v1.8.2", "domain": "Churn Prediction", "status": "production", "created_date": "2026-04-16", "owner": "Growth AI", "score": 89.7, "production": True, "latency_ms": 46, "rollback_to": "v1.7.8"},
    {"model_id": "MODEL-ETA-V5", "name": "ETA Model", "version": "v5.1.0", "domain": "Resource ETA", "status": "production", "created_date": "2026-04-20", "owner": "Ops AI", "score": 92.9, "production": True, "latency_ms": 29, "rollback_to": "v5.0.5"},
    {"model_id": "MODEL-SEV-V2", "name": "Severity Model", "version": "v2.3.4", "domain": "Incident Severity", "status": "training", "created_date": "2026-04-24", "owner": "Crisis AI", "score": 91.8, "production": False, "latency_ms": 44, "rollback_to": "v2.2.9"},
    {"model_id": "MODEL-OVERLOAD-V1", "name": "Operator Overload Model", "version": "v1.2.1", "domain": "Operator Overload Risk", "status": "staging", "created_date": "2026-04-23", "owner": "Ops AI", "score": 88.4, "production": False, "latency_ms": 33, "rollback_to": "v1.1.7"},
)


class MLStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"datasets": [], "features": [], "jobs": [], "experiments": [], "models": [], "events": []}

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        with self._lock:
            payload = self._read()
            seed_groups = {
                "datasets": (SEED_DATASETS, "dataset_id"),
                "features": (SEED_FEATURES, "feature_id"),
                "jobs": (SEED_JOBS, "job_id"),
                "experiments": (SEED_EXPERIMENTS, "experiment_id"),
                "models": (SEED_MODELS, "model_id"),
            }
            for table, (rows, key) in seed_groups.items():
                existing = {(row["tenant_id"], row[key]) for row in payload[table]}
                for tenant_id in DEMO_TENANTS:
                    for row in rows:
                        if (tenant_id, row[key]) in existing:
                            continue
                        payload[table].append({**row, "tenant_id": tenant_id, "updated_at": utc_now_iso()})
                        created += 1
            self._write(payload)
        return {"created": created}

    def rows(self, table: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(row) for row in self._read()[table] if row["tenant_id"] in tenant_ids]
        return rows

    def record_event(self, tenant_ids: list[str], action: str, payload_data: dict[str, Any] | None = None) -> dict[str, Any]:
        event = {
            "event_id": "",
            "tenant_id": tenant_ids[0],
            "action": action,
            "payload": payload_data or {},
            "created_at": utc_now_iso(),
        }
        with self._lock:
            payload = self._read()
            event["event_id"] = f"ML-EVT-{len(payload['events']) + 1:05d}"
            payload["events"].append(event)
            self._write(payload)
        return event

    def add_training_job(self, tenant_ids: list[str], data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            job = {
                "job_id": f"JOB-AUTO-{len(payload['jobs']) + 1:04d}",
                "tenant_id": tenant_ids[0],
                "model_domain": data.get("model_domain") or "Crisis Risk Prediction",
                "algorithm": data.get("algorithm") or "Ensemble",
                "status": "queued",
                "dataset": data.get("dataset") or "evacuation_outcomes",
                "training_time_minutes": 26,
                "accuracy": 94.8,
                "precision": 93.9,
                "recall": 94.1,
                "f1": 94.0,
                "latency_score": 87,
                "gpu_usage": 0,
                "owner": "AI Platform",
                "updated_at": utc_now_iso(),
            }
            payload["jobs"].append(job)
            payload["events"].append({"event_id": f"ML-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_ids[0], "action": "training_job_queued", "payload": {"job_id": job["job_id"]}, "created_at": utc_now_iso()})
            self._write(payload)
        return job

    def upload_dataset(self, tenant_ids: list[str], data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            dataset = {
                "dataset_id": f"DS-UPLOAD-{len(payload['datasets']) + 1:04d}",
                "tenant_id": tenant_ids[0],
                "name": data.get("name") or "uploaded_incident_batch",
                "domain": data.get("domain") or "incidents",
                "rows": int(data.get("rows") or 24000),
                "columns": int(data.get("columns") or 32),
                "missing_percent": float(data.get("missing_percent") or 2.4),
                "freshness_minutes": 1,
                "label_coverage": int(data.get("label_coverage") or 78),
                "quality_score": int(data.get("quality_score") or 89),
                "source": "secure upload center",
                "status": "validating",
                "updated_at": utc_now_iso(),
            }
            payload["datasets"].append(dataset)
            payload["events"].append({"event_id": f"ML-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_ids[0], "action": "dataset_uploaded", "payload": {"dataset_id": dataset["dataset_id"]}, "created_at": utc_now_iso()})
            self._write(payload)
        return dataset

    def update_model_status(self, tenant_ids: list[str], model_id: str, status_value: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            selected = None
            for model in payload["models"]:
                if model["tenant_id"] in tenant_ids and model["model_id"] == model_id:
                    model["status"] = status_value
                    model["production"] = status_value == "production"
                    model["updated_at"] = utc_now_iso()
                    selected = dict(model)
            if selected is not None:
                payload["events"].append({"event_id": f"ML-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_ids[0], "action": f"model_{status_value}", "payload": {"model_id": model_id}, "created_at": utc_now_iso()})
                self._write(payload)
        return selected


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEMO_TENANTS)
    return [str(tenant["tenant_id"])]


ml_store = MLStore(settings.sentra_ml_store_path)

from __future__ import annotations

from statistics import mean
from typing import Any

from app.ml.store import ml_store, utc_now_iso


def _round(value: float) -> float:
    return round(value, 1)


class MLService:
    def datasets(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(ml_store.rows("datasets", tenant_ids), key=lambda row: int(row["rows"]), reverse=True)

    def features(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(ml_store.rows("features", tenant_ids), key=lambda row: int(row["importance"]), reverse=True)

    def jobs(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(ml_store.rows("jobs", tenant_ids), key=lambda row: (row["status"] != "running", -float(row["accuracy"])))

    def experiments(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(ml_store.rows("experiments", tenant_ids), key=lambda row: float(row["best_accuracy"]), reverse=True)

    def models(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(ml_store.rows("models", tenant_ids), key=lambda row: (not bool(row["production"]), -float(row["score"])))

    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        datasets = self.datasets(tenant_ids)
        features = self.features(tenant_ids)
        jobs = self.jobs(tenant_ids)
        experiments = self.experiments(tenant_ids)
        models = self.models(tenant_ids)
        ready = [dataset for dataset in datasets if dataset["status"] == "ready"]
        production = [model for model in models if bool(model["production"])]
        best_model = max(models, key=lambda row: float(row["score"]))
        return {
            "generated_at": utc_now_iso(),
            "active_datasets": len(datasets),
            "ready_datasets": len(ready),
            "total_rows": sum(int(dataset["rows"]) for dataset in datasets),
            "avg_quality_score": _round(mean(float(dataset["quality_score"]) for dataset in datasets)),
            "avg_label_coverage": _round(mean(float(dataset["label_coverage"]) for dataset in datasets)),
            "training_jobs": len(jobs),
            "running_jobs": len([job for job in jobs if job["status"] == "running"]),
            "experiment_runs": sum(int(experiment["runs"]) for experiment in experiments),
            "model_count": len(models),
            "production_models": len(production),
            "best_model": best_model,
            "accuracy_leaderboard": models[:5],
            "feature_drift_watch": [feature for feature in features if int(feature["drift_score"]) >= 12],
            "training_queue": [job for job in jobs if job["status"] in {"queued", "running"}],
            "gpu_usage": {"active_percent": 42, "queued_percent": 31, "cluster": "sentra-demo-gpu-pool"},
            "next_recommended_models": [
                {"domain": "Panic Probability", "algorithm": "LightGBM", "why": "High label coverage and behavior outcomes now support a sharper panic classifier."},
                {"domain": "Operator Overload Risk", "algorithm": "Random Forest", "why": "Team load and approval bottleneck features show stable predictive signal."},
                {"domain": "Resource ETA", "algorithm": "Ensemble", "why": "Route, responder, and traffic features can reduce ETA error."},
            ],
        }

    def data_operations(self, tenant_ids: list[str]) -> dict[str, Any]:
        datasets = self.datasets(tenant_ids)
        return {
            "generated_at": utc_now_iso(),
            "incident_data_volume": sum(int(dataset["rows"]) for dataset in datasets if dataset["domain"] == "incidents"),
            "sensor_streams": sum(int(dataset["rows"]) for dataset in datasets if dataset["domain"] == "sensor telemetry"),
            "behavior_events": sum(int(dataset["rows"]) for dataset in datasets if dataset["domain"] in {"behavior", "outcomes"}),
            "revenue_signals": sum(int(dataset["rows"]) for dataset in datasets if dataset["domain"] == "revenue"),
            "label_status": _round(mean(float(dataset["label_coverage"]) for dataset in datasets)),
            "missing_fields": _round(mean(float(dataset["missing_percent"]) for dataset in datasets)),
            "data_quality_score": _round(mean(float(dataset["quality_score"]) for dataset in datasets)),
            "freshness_monitor_minutes": min(int(dataset["freshness_minutes"]) for dataset in datasets),
            "source_connectors": ["incidents", "sensor telemetry", "building occupancy", "communication responses", "financial signals", "behavior outcomes"],
            "datasets": datasets,
        }

    def train(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        return ml_store.add_training_job(tenant_ids, payload)

    def upload_dataset(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        return ml_store.upload_dataset(tenant_ids, payload)

    def promote(self, tenant_ids: list[str], model_id: str | None) -> dict[str, Any] | None:
        selected_id = model_id or "MODEL-PANIC-V2"
        return ml_store.update_model_status(tenant_ids, selected_id, "production")

    def archive(self, tenant_ids: list[str], model_id: str | None) -> dict[str, Any] | None:
        selected_id = model_id or "MODEL-SEV-V2"
        return ml_store.update_model_status(tenant_ids, selected_id, "archived")


ml_service = MLService()

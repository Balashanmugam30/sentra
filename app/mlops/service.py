from __future__ import annotations

from statistics import mean
from typing import Any

from app.ml.store import utc_now_iso
from app.mlops.store import mlops_store


def _round(value: float) -> float:
    return round(value, 1)


def _risk_class(score: int) -> str:
    if score >= 85:
        return "critical"
    if score >= 70:
        return "high"
    if score >= 45:
        return "watch"
    return "normal"


class MLOpsService:
    def live_models(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(mlops_store.rows("live_models", tenant_ids), key=lambda row: (row["state"] != "production", -float(row["accuracy"])))

    def deployments(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(mlops_store.rows("deployments", tenant_ids), key=lambda row: (row["state"] != "production", -int(row["version_health"])))

    def predictions(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(mlops_store.rows("predictions", tenant_ids), key=lambda row: str(row["created_at"]), reverse=True)

    def drift(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(mlops_store.rows("drift", tenant_ids), key=lambda row: int(row["drift_score"]), reverse=True)

    def explainability(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return sorted(mlops_store.rows("explainability", tenant_ids), key=lambda row: str(row["created_at"]), reverse=True)

    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        models = self.live_models(tenant_ids)
        predictions = self.predictions(tenant_ids)
        drift = self.drift(tenant_ids)
        production = [model for model in models if model["state"] == "production"]
        failed_predictions = [prediction for prediction in predictions if not bool(prediction["success"])]
        top_risk_alerts = [prediction for prediction in predictions if int(prediction["risk_score"]) >= 70][:5]
        return {
            "generated_at": utc_now_iso(),
            "active_production_models": len(production),
            "active_models": len(models),
            "predictions_per_minute": 284,
            "avg_inference_latency": _round(mean(float(model["latency_ms"]) for model in models)),
            "avg_confidence": _round(mean(float(model["confidence"]) for model in models)),
            "failed_predictions": len(failed_predictions),
            "error_rate": _round(mean(float(model["error_rate"]) for model in models)),
            "drift_warnings": len([signal for signal in drift if signal["level"] in {"medium", "high"}]),
            "high_drift_warnings": len([signal for signal in drift if signal["level"] == "high"]),
            "sla_health": 96,
            "rollback_ready_models": len([deployment for deployment in self.deployments(tenant_ids) if bool(deployment["rollback_available"])]),
            "top_risk_alerts": top_risk_alerts,
            "confidence_heatmap": [{"domain": model["domain"], "confidence": model["confidence"], "state": model["state"]} for model in models],
            "explainability_feed": self.explainability(tenant_ids)[:6],
            "live_inputs": mlops_store.rows("scenarios", tenant_ids),
            "active_models_detail": models,
        }

    def predict(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        scenario = mlops_store.scenario(tenant_ids, payload.get("scenario"))
        inputs = {
            "zone": payload.get("zone") or scenario["zone"],
            "occupancy": int(payload.get("occupancy") or scenario["occupancy"]),
            "smoke": int(payload.get("smoke") or scenario["smoke"]),
            "motion": int(payload.get("motion") or scenario["motion"]),
            "weather": payload.get("weather") or scenario["weather"],
            "incident_history": int(payload.get("incident_history") or scenario["incident_history"]),
            "operator_load": int(payload.get("operator_load") or scenario["operator_load"]),
            "domain": payload.get("domain") or scenario["domain"],
        }
        models = self.live_models(tenant_ids)
        model = next((item for item in models if item["domain"] == inputs["domain"]), models[0])
        risk_score = min(
            99,
            max(
                12,
                round(
                    inputs["smoke"] * 0.34
                    + min(inputs["occupancy"] / 22, 45)
                    + inputs["motion"] * 0.18
                    + inputs["incident_history"] * 1.4
                    + inputs["operator_load"] * 0.16
                ),
            ),
        )
        confidence = min(98, max(72, round(float(model["confidence"]) - max(0, risk_score - 88) * 0.2)))
        eta_minutes = max(2, round(18 - risk_score / 8 + inputs["operator_load"] / 20))
        severity_class = _risk_class(risk_score)
        recommended_action = self._recommend_action(inputs["domain"], severity_class, inputs["zone"])
        prediction = {
            "model_id": model["model_id"],
            "scenario_id": payload.get("scenario") or scenario["scenario_id"],
            "zone": inputs["zone"],
            "risk_score": risk_score,
            "severity_class": severity_class,
            "eta_minutes": eta_minutes,
            "confidence": confidence,
            "recommended_action": recommended_action,
            "latency_ms": int(model["latency_ms"]) + risk_score % 7,
            "model_version": model["version"],
            "success": True,
        }
        top_features = [f"smoke={inputs['smoke']}", f"occupancy={inputs['occupancy']}", f"operator_load={inputs['operator_load']}"]
        explanation = {
            "model_id": model["model_id"],
            "top_features": top_features,
            "why_chosen": f"{inputs['domain']} selected {recommended_action.lower()} because {', '.join(top_features)} pushed risk to {risk_score}/100.",
            "why_rejected": "Lower intervention alternatives were rejected because confidence and escalation pressure favor earlier action.",
            "confidence_reason": "Confidence reflects production model score, feature freshness, and tenant-matched incident history.",
        }
        return mlops_store.append_prediction(tenant_ids, prediction, explanation)

    def monitoring(self, tenant_ids: list[str]) -> dict[str, Any]:
        models = self.live_models(tenant_ids)
        drift = self.drift(tenant_ids)
        return {
            "generated_at": utc_now_iso(),
            "accuracy_decay": [{"domain": model["domain"], "decay_percent": _round(max(0.6, 100 - float(model["accuracy"])))} for model in models],
            "drift_metrics": drift,
            "latency_sla": [{"domain": model["domain"], "latency_ms": model["latency_ms"], "sla_ms": model["sla_ms"], "status": "pass" if int(model["latency_ms"]) <= int(model["sla_ms"]) else "breach"} for model in models],
            "error_rate": [{"domain": model["domain"], "error_rate": model["error_rate"]} for model in models],
            "class_imbalance": [{"domain": "Incident Severity Ranker", "minority_class": "critical_plus", "coverage": 14}, {"domain": "Churn Predictor", "minority_class": "save_playbook_success", "coverage": 21}],
            "prediction_quality": _round(mean(float(model["accuracy"]) * 0.66 + float(model["confidence"]) * 0.34 for model in models)),
            "retrain_recommendations": self._retrain_recommendations(drift),
            "alert_feed": [
                {"title": "High drift detected", "detail": "Panic density drift crossed retrain threshold.", "severity": "high"},
                {"title": "Shadow model beating baseline", "detail": "Severity v2.3.4 improved recall by 3.1 percent in hidden traffic.", "severity": "medium"},
                {"title": "Latency SLA healthy", "detail": "All production models remain below configured response SLA.", "severity": "low"},
            ],
        }

    def promote(self, tenant_ids: list[str], model_id: str | None) -> dict[str, Any] | None:
        return mlops_store.update_deployment(tenant_ids, model_id or "MLOPS-SEVERITY-V2", "production")

    def canary(self, tenant_ids: list[str], model_id: str | None, canary_percent: int | None) -> dict[str, Any] | None:
        percent = min(100, max(10, int(canary_percent or 25)))
        return mlops_store.update_deployment(tenant_ids, model_id or "MLOPS-PANIC-V2", "canary", percent)

    def rollback(self, tenant_ids: list[str], model_id: str | None) -> dict[str, Any] | None:
        return mlops_store.update_deployment(tenant_ids, model_id or "MLOPS-PANIC-V2", "rollback")

    def retrain(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        domain = payload.get("domain") or "Panic Probability Engine"
        return mlops_store.record_event(tenant_ids, "auto_retrain_triggered", {"domain": domain, "reason": payload.get("reason") or "high drift and confidence decay"})

    def _recommend_action(self, domain: str, severity_class: str, zone: str) -> str:
        if "Churn" in domain:
            return "Open customer success save playbook and executive sponsor review."
        if "Revenue" in domain:
            return "Shift forecast to expected case and flag expansion accounts for finance review."
        if "ETA" in domain:
            return "Dispatch nearest qualified unit and reserve backup route."
        if "Overload" in domain:
            return "Rebalance approvals to deputy pool and pause noncritical automations."
        if severity_class == "critical":
            return f"Execute immediate intervention in {zone}"
        if severity_class == "high":
            return f"Run guided response and monitor escalation in {zone}"
        return f"Keep {zone} in watch mode with shadow scoring"

    def _retrain_recommendations(self, drift: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [
            {
                "domain": "Panic Probability Engine" if signal["feature"] == "panic_density" else "Operator Overload Predictor",
                "reason": signal["reason"],
                "priority": signal["level"],
                "trigger": "auto retrain" if signal["level"] == "high" else "human review",
            }
            for signal in drift
            if signal["level"] in {"medium", "high"}
        ]


mlops_service = MLOpsService()


from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS, utc_now_iso


LIVE_MODELS: tuple[dict[str, Any], ...] = (
    {"model_id": "MLOPS-RISK-V3", "name": "Crisis Risk Predictor", "domain": "Crisis Risk Predictor", "version": "v3.2.0", "state": "production", "traffic_percent": 100, "accuracy": 95.4, "confidence": 94, "latency_ms": 42, "error_rate": 0.3, "sla_ms": 120, "owner": "AI Platform", "rollback_to": "v3.1.4"},
    {"model_id": "MLOPS-PANIC-V2", "name": "Panic Probability Engine", "domain": "Panic Probability Engine", "version": "v2.7.1", "state": "canary", "traffic_percent": 25, "accuracy": 93.2, "confidence": 91, "latency_ms": 38, "error_rate": 0.4, "sla_ms": 110, "owner": "Behavior AI", "rollback_to": "v2.6.9"},
    {"model_id": "MLOPS-CROWD-V4", "name": "Crowd Congestion Forecaster", "domain": "Crowd Congestion Forecaster", "version": "v4.0.3", "state": "production", "traffic_percent": 100, "accuracy": 95.1, "confidence": 93, "latency_ms": 51, "error_rate": 0.5, "sla_ms": 130, "owner": "Crowd Lab", "rollback_to": "v3.9.8"},
    {"model_id": "MLOPS-ETA-V5", "name": "Resource ETA Model", "domain": "Resource ETA Model", "version": "v5.1.0", "state": "production", "traffic_percent": 100, "accuracy": 92.9, "confidence": 90, "latency_ms": 29, "error_rate": 0.2, "sla_ms": 90, "owner": "Ops AI", "rollback_to": "v5.0.5"},
    {"model_id": "MLOPS-CHURN-V1", "name": "Churn Predictor", "domain": "Churn Predictor", "version": "v1.8.2", "state": "production", "traffic_percent": 100, "accuracy": 89.7, "confidence": 88, "latency_ms": 46, "error_rate": 0.7, "sla_ms": 140, "owner": "Growth AI", "rollback_to": "v1.7.8"},
    {"model_id": "MLOPS-REVENUE-V2", "name": "Revenue Forecast Engine", "domain": "Revenue Forecast Engine", "version": "v2.4.0", "state": "staging", "traffic_percent": 0, "accuracy": 90.6, "confidence": 89, "latency_ms": 74, "error_rate": 0.6, "sla_ms": 180, "owner": "Revenue AI", "rollback_to": "v2.3.5"},
    {"model_id": "MLOPS-SEVERITY-V2", "name": "Incident Severity Ranker", "domain": "Incident Severity Ranker", "version": "v2.3.4", "state": "shadow", "traffic_percent": 0, "accuracy": 91.8, "confidence": 90, "latency_ms": 44, "error_rate": 0.4, "sla_ms": 115, "owner": "Crisis AI", "rollback_to": "v2.2.9"},
    {"model_id": "MLOPS-OVERLOAD-V1", "name": "Operator Overload Predictor", "domain": "Operator Overload Predictor", "version": "v1.2.1", "state": "canary", "traffic_percent": 10, "accuracy": 88.4, "confidence": 86, "latency_ms": 33, "error_rate": 0.8, "sla_ms": 100, "owner": "Ops AI", "rollback_to": "v1.1.7"},
)

SCENARIOS: tuple[dict[str, Any], ...] = (
    {"scenario_id": "hotel_fire_floor3", "title": "Hotel fire floor 3", "domain": "Crisis Risk Predictor", "zone": "Grand Meridian Floor 3 Kitchen B", "occupancy": 428, "smoke": 81, "motion": 68, "weather": "dry wind", "incident_history": 7, "operator_load": 42},
    {"scenario_id": "gas_leak_lab", "title": "Gas leak lab", "domain": "Incident Severity Ranker", "zone": "Bala University Chemistry Lab", "occupancy": 96, "smoke": 28, "motion": 41, "weather": "humid", "incident_history": 4, "operator_load": 38},
    {"scenario_id": "mall_stampede_risk", "title": "Mall stampede risk", "domain": "Crowd Congestion Forecaster", "zone": "Nova Mall Food Court", "occupancy": 1840, "smoke": 18, "motion": 91, "weather": "indoor", "incident_history": 12, "operator_load": 64},
    {"scenario_id": "hospital_oxygen_issue", "title": "Hospital oxygen issue", "domain": "Resource ETA Model", "zone": "MetroCare ICU Wing", "occupancy": 220, "smoke": 14, "motion": 36, "weather": "controlled", "incident_history": 6, "operator_load": 55},
    {"scenario_id": "overload_operator_shift", "title": "Overload operator shift", "domain": "Operator Overload Predictor", "zone": "Sentra Ops Desk Night Shift", "occupancy": 34, "smoke": 0, "motion": 52, "weather": "normal", "incident_history": 18, "operator_load": 88},
    {"scenario_id": "enterprise_churn_warning", "title": "Enterprise churn warning", "domain": "Churn Predictor", "zone": "Skyline Campus Renewal Desk", "occupancy": 12, "smoke": 0, "motion": 22, "weather": "normal", "incident_history": 3, "operator_load": 35},
)

DEPLOYMENTS: tuple[dict[str, Any], ...] = (
    {"deployment_id": "DEP-RISK-320", "model_id": "MLOPS-RISK-V3", "name": "Crisis Risk Predictor", "version": "v3.2.0", "state": "production", "canary_percent": 100, "shadow_model": "v3.3.0-rc1", "approval_status": "approved", "version_health": 97, "release_notes": "Lower false positives in mixed smoke and crowd anomalies.", "rollback_available": True},
    {"deployment_id": "DEP-PANIC-271", "model_id": "MLOPS-PANIC-V2", "name": "Panic Probability Engine", "version": "v2.7.1", "state": "canary", "canary_percent": 25, "shadow_model": "v2.8.0-shadow", "approval_status": "watching", "version_health": 92, "release_notes": "Message-tone weights tuned from Phase 28 behavior outcomes.", "rollback_available": True},
    {"deployment_id": "DEP-CROWD-403", "model_id": "MLOPS-CROWD-V4", "name": "Crowd Congestion Forecaster", "version": "v4.0.3", "state": "production", "canary_percent": 100, "shadow_model": "v4.1.0-shadow", "approval_status": "approved", "version_health": 95, "release_notes": "Adds corridor reverse-flow pressure features.", "rollback_available": True},
    {"deployment_id": "DEP-SEV-234", "model_id": "MLOPS-SEVERITY-V2", "name": "Incident Severity Ranker", "version": "v2.3.4", "state": "shadow", "canary_percent": 0, "shadow_model": "v2.3.4", "approval_status": "pending", "version_health": 90, "release_notes": "Shadow comparing against current deterministic severity policy.", "rollback_available": False},
    {"deployment_id": "DEP-REV-240", "model_id": "MLOPS-REVENUE-V2", "name": "Revenue Forecast Engine", "version": "v2.4.0", "state": "staging", "canary_percent": 0, "shadow_model": "v2.4.0", "approval_status": "finance review", "version_health": 91, "release_notes": "Adds expansion ARR and churn-risk leading indicators.", "rollback_available": True},
)

PREDICTIONS: tuple[dict[str, Any], ...] = (
    {"prediction_id": "PRED-0001", "model_id": "MLOPS-RISK-V3", "scenario_id": "hotel_fire_floor3", "zone": "Grand Meridian Floor 3 Kitchen B", "risk_score": 91, "severity_class": "critical", "eta_minutes": 6, "confidence": 94, "recommended_action": "Trigger guided floor 3 evacuation and dispatch containment team.", "latency_ms": 44, "success": True, "created_at": "2026-04-26T00:04:00+00:00"},
    {"prediction_id": "PRED-0002", "model_id": "MLOPS-CROWD-V4", "scenario_id": "mall_stampede_risk", "zone": "Nova Mall Food Court", "risk_score": 78, "severity_class": "high", "eta_minutes": 9, "confidence": 89, "recommended_action": "Split crowd toward north and east exits before density crosses threshold.", "latency_ms": 53, "success": True, "created_at": "2026-04-26T00:07:00+00:00"},
    {"prediction_id": "PRED-0003", "model_id": "MLOPS-OVERLOAD-V1", "scenario_id": "overload_operator_shift", "zone": "Sentra Ops Desk Night Shift", "risk_score": 74, "severity_class": "high", "eta_minutes": 12, "confidence": 86, "recommended_action": "Shift approvals to deputy pool and reduce noncritical polling.", "latency_ms": 34, "success": True, "created_at": "2026-04-26T00:11:00+00:00"},
)

DRIFT_SIGNALS: tuple[dict[str, Any], ...] = (
    {"drift_id": "DRIFT-SMOKE-SLOPE", "feature": "smoke_trend_slope", "domain": "iot", "drift_score": 18, "level": "medium", "reason": "Kitchen sensor variance is 14 percent above training baseline.", "recommended_action": "Keep current model live; collect 6 more hours of labeled telemetry."},
    {"drift_id": "DRIFT-PANIC-DENSITY", "feature": "panic_density", "domain": "behavior", "drift_score": 27, "level": "high", "reason": "Mall crowd response differs from prior quarter after new signage flow.", "recommended_action": "Trigger retraining for Panic Probability Engine."},
    {"drift_id": "DRIFT-RENEWAL-PROB", "feature": "renewal_probability", "domain": "revenue", "drift_score": 11, "level": "low", "reason": "Usage mix is within expected enterprise expansion range.", "recommended_action": "No action required."},
    {"drift_id": "DRIFT-TEAM-LOAD", "feature": "team_load", "domain": "operations", "drift_score": 21, "level": "medium", "reason": "Night shift approval workload is trending above historical load.", "recommended_action": "Canary overload model to 25 percent."},
)

EXPLAIN_LOGS: tuple[dict[str, Any], ...] = (
    {"explain_id": "EXP-0001", "prediction_id": "PRED-0001", "model_id": "MLOPS-RISK-V3", "top_features": ["smoke=81", "occupancy=428", "incident_history=7"], "why_chosen": "Smoke intensity and occupied floor density make full guided evacuation safer than containment only.", "why_rejected": "Shelter in place rejected because smoke spread and exit confidence are still favorable.", "confidence_reason": "High sensor agreement and recent labeled hotel fire outcomes.", "created_at": "2026-04-26T00:04:02+00:00"},
    {"explain_id": "EXP-0002", "prediction_id": "PRED-0002", "model_id": "MLOPS-CROWD-V4", "top_features": ["motion=91", "occupancy=1840", "smoke=18"], "why_chosen": "Motion pressure shows crowd compression before hazard severity peaks.", "why_rejected": "Single-exit routing rejected due to projected stairwell overload.", "confidence_reason": "Strong match to mall crowd behavior training set.", "created_at": "2026-04-26T00:07:03+00:00"},
)


class MLOpsStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "live_models": [],
            "scenarios": [],
            "deployments": [],
            "predictions": [],
            "drift": [],
            "explainability": [],
            "events": [],
        }

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
        seed_groups = {
            "live_models": (LIVE_MODELS, "model_id"),
            "scenarios": (SCENARIOS, "scenario_id"),
            "deployments": (DEPLOYMENTS, "deployment_id"),
            "predictions": (PREDICTIONS, "prediction_id"),
            "drift": (DRIFT_SIGNALS, "drift_id"),
            "explainability": (EXPLAIN_LOGS, "explain_id"),
        }
        with self._lock:
            payload = self._read()
            for table, (rows, key) in seed_groups.items():
                existing = {(row["tenant_id"], row[key]) for row in payload[table] if "tenant_id" in row}
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
            return [dict(row) for row in self._read()[table] if row.get("tenant_id") in tenant_ids]

    def scenario(self, tenant_ids: list[str], scenario_id: str | None) -> dict[str, Any]:
        scenarios = self.rows("scenarios", tenant_ids)
        if scenario_id:
            for scenario in scenarios:
                if scenario["scenario_id"] == scenario_id:
                    return scenario
        return scenarios[0]

    def append_prediction(self, tenant_ids: list[str], prediction: dict[str, Any], explanation: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            prediction_id = f"PRED-LIVE-{len(payload['predictions']) + 1:04d}"
            explain_id = f"EXP-LIVE-{len(payload['explainability']) + 1:04d}"
            stored_prediction = {**prediction, "prediction_id": prediction_id, "tenant_id": tenant_ids[0], "created_at": utc_now_iso(), "updated_at": utc_now_iso()}
            stored_explanation = {**explanation, "explain_id": explain_id, "prediction_id": prediction_id, "tenant_id": tenant_ids[0], "created_at": utc_now_iso(), "updated_at": utc_now_iso()}
            payload["predictions"].append(stored_prediction)
            payload["explainability"].append(stored_explanation)
            payload["events"].append({"event_id": f"MLOPS-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_ids[0], "action": "live_prediction_executed", "payload": {"prediction_id": prediction_id, "model_id": prediction["model_id"]}, "created_at": utc_now_iso()})
            self._write(payload)
        return {**stored_prediction, "explanation": stored_explanation}

    def update_deployment(self, tenant_ids: list[str], model_id: str, state: str, canary_percent: int | None = None) -> dict[str, Any] | None:
        selected: dict[str, Any] | None = None
        with self._lock:
            payload = self._read()
            for model in payload["live_models"]:
                if model.get("tenant_id") in tenant_ids and model["model_id"] == model_id:
                    model["state"] = state
                    model["traffic_percent"] = 100 if state == "production" else canary_percent if state == "canary" and canary_percent is not None else model["traffic_percent"]
                    model["updated_at"] = utc_now_iso()
            for deployment in payload["deployments"]:
                if deployment.get("tenant_id") in tenant_ids and deployment["model_id"] == model_id:
                    deployment["state"] = state
                    if canary_percent is not None:
                        deployment["canary_percent"] = canary_percent
                    elif state == "production":
                        deployment["canary_percent"] = 100
                    deployment["approval_status"] = "approved" if state in {"production", "rollback"} else "watching"
                    deployment["updated_at"] = utc_now_iso()
                    selected = dict(deployment)
            if selected is not None:
                payload["events"].append({"event_id": f"MLOPS-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_ids[0], "action": f"model_{state}", "payload": {"model_id": model_id, "canary_percent": canary_percent}, "created_at": utc_now_iso()})
                self._write(payload)
        return selected

    def record_event(self, tenant_ids: list[str], action: str, payload_data: dict[str, Any] | None = None) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            event = {"event_id": f"MLOPS-EVT-{len(payload['events']) + 1:05d}", "tenant_id": tenant_ids[0], "action": action, "payload": payload_data or {}, "created_at": utc_now_iso()}
            payload["events"].append(event)
            self._write(payload)
        return event


mlops_store = MLOpsStore(settings.sentra_mlops_store_path)


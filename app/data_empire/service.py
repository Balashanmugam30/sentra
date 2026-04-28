from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.data_empire.anomaly import anomaly_radar, run_anomaly_scan
from app.data_empire.data_marketplace import data_products, launch_data_product
from app.data_empire.entity_graph import build_entity_graph
from app.data_empire.forecast_engine import build_forecasts, run_forecast_job
from app.data_empire.ingestion import run_ingestion_job, seed_data_sources
from app.data_empire.knowledge_core import knowledge_compounding, run_learning_cycle
from app.data_empire.moat_engine import moat_score
from app.data_empire.models import DEMO_TENANTS, data_empire_id, utc_now_iso
from app.data_empire.pipelines import cleansing_summary, pipeline_health
from app.data_empire.privacy_guard import privacy_posture
from app.data_empire.scoring import live_data_score, predictive_dataset_catalog
from app.data_empire.signal_engine import score_signals, signal_value_summary
from app.data_empire.value_engine import data_value


class DataEmpireStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "sources": [],
            "jobs": [],
            "products_launched": [],
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
        with self._lock:
            payload = self._read()
            existing = {(item["tenant_id"], item["source_id"]) for item in payload["sources"]}
            for tenant_id in DEMO_TENANTS:
                for source in seed_data_sources(tenant_id):
                    if (tenant_id, source["source_id"]) not in existing:
                        payload["sources"].append(source)
                        created += 1
            self._write(payload)
        return {"created": created}

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        return {"generated_at": utc_now_iso(), **live_data_score()}

    def sources(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        self.seed_demo()
        return sorted(self._list("sources", tenant_ids), key=lambda item: int(item["signals_day"]), reverse=True)

    def signals(self, tenant_ids: list[str]) -> dict[str, Any]:
        sources = self.sources(tenant_ids)
        signals = score_signals(sources)
        return {
            "sources": sources,
            "pipelines": pipeline_health(sources),
            "signals": signals,
            "summary": {**cleansing_summary(sources), **signal_value_summary(signals)},
        }

    def graph(self, tenant_ids: list[str]) -> dict[str, Any]:
        return build_entity_graph(tenant_ids[0])

    def insights(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        tenant_id = tenant_ids[0]
        return [
            {"insight_id": "INS-001", "tenant_id": tenant_id, "title": "Region likely to fail in 6 days", "category": "crisis_forecast", "confidence": 91, "estimated_value": 1_200_000, "action": "Pre-position response capacity in South corridor."},
            {"insight_id": "INS-002", "tenant_id": tenant_id, "title": "Customer likely to churn in 18 days", "category": "retention", "confidence": 86, "estimated_value": 240_000, "action": "Trigger executive success rescue motion."},
            {"insight_id": "INS-003", "tenant_id": tenant_id, "title": "Supply chain collapse probability rising", "category": "operations", "confidence": 84, "estimated_value": 780_000, "action": "Activate alternate vendor route."},
            {"insight_id": "INS-004", "tenant_id": tenant_id, "title": "Hidden fraud pattern in API usage", "category": "security", "confidence": 79, "estimated_value": 420_000, "action": "Throttle suspicious automation cluster."},
            {"insight_id": "INS-005", "tenant_id": tenant_id, "title": "Expansion region with lowest CAC detected", "category": "growth", "confidence": 88, "estimated_value": 640_000, "action": "Prioritize UAE enterprise partner campaign."},
            {"insight_id": "INS-006", "tenant_id": tenant_id, "title": "Government budget season opening", "category": "government", "confidence": 82, "estimated_value": 1_500_000, "action": "Launch sovereign procurement sequence."},
            {"insight_id": "INS-007", "tenant_id": tenant_id, "title": "Viral sentiment before trend breakout", "category": "market", "confidence": 81, "estimated_value": 310_000, "action": "Publish crisis intelligence benchmark report."},
        ]

    def forecast(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return build_forecasts(tenant_ids[0])

    def value(self, tenant_ids: list[str]) -> dict[str, Any]:
        products = data_products(tenant_ids[0])
        datasets = predictive_dataset_catalog(tenant_ids[0])
        signals = self.signals(tenant_ids)["signals"]
        return {
            "products": products,
            "datasets": datasets,
            "value": data_value(signals, products),
            "knowledge": knowledge_compounding(tenant_ids[0]),
            "anomalies": anomaly_radar(tenant_ids[0]),
        }

    def moat(self) -> dict[str, Any]:
        return moat_score()

    def privacy(self, tenant_ids: list[str]) -> dict[str, Any]:
        return privacy_posture(tenant_ids[0])

    def run_ingestion(self, tenant_id: str) -> dict[str, Any]:
        job = run_ingestion_job(tenant_id)
        self._record_job(tenant_id, "ingestion_run", job)
        return job

    def run_learning(self, tenant_id: str) -> dict[str, Any]:
        job = run_learning_cycle(tenant_id)
        self._record_job(tenant_id, "learning_run", job)
        return job

    def run_forecast(self, tenant_id: str) -> dict[str, Any]:
        job = run_forecast_job(tenant_id)
        self._record_job(tenant_id, "forecast_run", job)
        return job

    def launch_product(self, tenant_id: str, product_id: str | None) -> dict[str, Any]:
        product = launch_data_product(tenant_id, product_id)
        with self._lock:
            payload = self._read()
            payload["products_launched"].append(product)
            self._append_event(payload, tenant_id, "data_product_launched", str(product["product_id"]))
            self._write(payload)
        return product

    def run_anomaly_scan(self, tenant_id: str) -> dict[str, Any]:
        job = run_anomaly_scan(tenant_id)
        self._record_job(tenant_id, "anomaly_scan_run", job)
        return job

    def _record_job(self, tenant_id: str, action: str, job: dict[str, Any]) -> None:
        with self._lock:
            payload = self._read()
            payload["jobs"].append(job)
            self._append_event(payload, tenant_id, action, str(job.get("job_id") or job.get("learning_job_id") or job.get("forecast_job_id") or job.get("scan_id") or data_empire_id("JOB")))
            self._write(payload)

    def _list(self, key: str, tenant_ids: list[str]) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(item) for item in self._read()[key] if item["tenant_id"] in tenant_ids]

    def _append_event(self, payload: dict[str, Any], tenant_id: str, action: str, target: str) -> None:
        payload["events"].append({"event_id": data_empire_id("DEVT"), "tenant_id": tenant_id, "action": action, "target": target, "created_at": utc_now_iso()})


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    tenant_id = str(tenant["tenant_id"])
    if str(identity.get("role")) == "super_admin":
        return sorted(set(DEMO_TENANTS + [tenant_id]))
    return [tenant_id]


data_empire_store = DataEmpireStore(settings.sentra_data_empire_store_path)

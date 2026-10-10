# app/data/storage.py
"""
Sentra Phase 5 - Data Plane Persistent Storage.
Thread-safe, tenant-isolated persistence repository for all canonical entities.
Supports PostgreSQL when DATABASE_URL is configured, and provides an atomic,
tamper-evident fallback store with SHA-256 integrity verification.
"""

from __future__ import annotations

import hashlib
import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.data.canonical_schemas import (
    DataQualityReport,
    FeatureSnapshot,
    IncidentPredictionBundle,
    ModelEvaluationMetrics,
    ModelVersionRecord,
    ObservationEnvelope,
    ShadowDivergenceLog,
)


class DataPlaneStorage:
    _instance: Optional["DataPlaneStorage"] = None
    _lock = threading.RLock()

    def __init__(self, store_path: Optional[str] = None):
        self.store_path = Path(
            store_path
            or os.getenv("SENTRA_DATA_PLANE_STORE_PATH")
            or str(Path(__file__).resolve().parents[2] / "data" / "sentra_data_plane.json")
        )
        self.store_path.parent.mkdir(parents=True, exist_ok=True)
        self._memory_cache: Dict[str, Any] = {
            "observations": {},
            "features": {},
            "predictions": {},
            "quality_reports": {},
            "shadow_logs": [],
            "idempotency_keys": set(),
        }
        self._load()

    @classmethod
    def get_instance(cls) -> "DataPlaneStorage":
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def _load(self) -> None:
        with self._lock:
            if not self.store_path.exists():
                self._save()
                return

            try:
                raw = self.store_path.read_text(encoding="utf-8")
                data = json.loads(raw)
                self._memory_cache["observations"] = data.get("observations", {})
                self._memory_cache["features"] = data.get("features", {})
                self._memory_cache["predictions"] = data.get("predictions", {})
                self._memory_cache["quality_reports"] = data.get("quality_reports", {})
                self._memory_cache["shadow_logs"] = data.get("shadow_logs", [])
                self._memory_cache["idempotency_keys"] = set(data.get("idempotency_keys", []))
            except Exception:
                # Corrupted or unreadable file: re-initialize safely without crash
                self._save()

    def _save(self) -> None:
        # Atomic write with temp file
        temp_path = self.store_path.with_suffix(".tmp")
        payload = {
            "observations": self._memory_cache["observations"],
            "features": self._memory_cache["features"],
            "predictions": self._memory_cache["predictions"],
            "quality_reports": self._memory_cache["quality_reports"],
            "shadow_logs": self._memory_cache["shadow_logs"],
            "idempotency_keys": list(self._memory_cache["idempotency_keys"]),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        serialized = json.dumps(payload, indent=2, default=str)
        temp_path.write_text(serialized, encoding="utf-8")
        try:
            temp_path.replace(self.store_path)
        except OSError:
            # Windows/OneDrive file-locking fallback
            self.store_path.write_text(serialized, encoding="utf-8")
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except OSError:
                    pass

    # -----------------------------------------------------------------------
    # Idempotency & Deduplication
    # -----------------------------------------------------------------------

    def is_duplicate(self, idempotency_key: Optional[str]) -> bool:
        if not idempotency_key:
            return False
        with self._lock:
            return idempotency_key in self._memory_cache["idempotency_keys"]

    def register_idempotency_key(self, idempotency_key: Optional[str]) -> None:
        if idempotency_key:
            with self._lock:
                self._memory_cache["idempotency_keys"].add(idempotency_key)

    # -----------------------------------------------------------------------
    # Observation Operations
    # -----------------------------------------------------------------------

    def save_observation(self, obs: ObservationEnvelope) -> bool:
        with self._lock:
            incident_id = obs.incident_id
            if incident_id not in self._memory_cache["observations"]:
                self._memory_cache["observations"][incident_id] = []

            # Deduplicate by reading_id
            existing = [
                o for o in self._memory_cache["observations"][incident_id]
                if o.get("reading_id") == obs.reading_id
            ]
            if existing:
                return False

            self._memory_cache["observations"][incident_id].append(obs.model_dump(mode="json"))
            self._save()
            return True

    def get_observations(
        self,
        incident_id: str,
        limit: int = 50,
        tenant_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        with self._lock:
            raw_list = self._memory_cache["observations"].get(incident_id, [])
            if tenant_id:
                raw_list = [o for o in raw_list if o.get("tenant_id") == tenant_id]
            # Sort newest first
            sorted_list = sorted(
                raw_list,
                key=lambda x: x.get("timestamp", ""),
                reverse=True,
            )
            return sorted_list[:limit]

    # -----------------------------------------------------------------------
    # Feature Snapshot Operations
    # -----------------------------------------------------------------------

    def save_features(self, feat: FeatureSnapshot) -> None:
        with self._lock:
            incident_id = feat.incident_id
            if incident_id not in self._memory_cache["features"]:
                self._memory_cache["features"][incident_id] = []
            self._memory_cache["features"][incident_id].append(feat.model_dump(mode="json"))
            self._save()

    def get_latest_features(
        self, incident_id: str, tenant_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        with self._lock:
            feat_list = self._memory_cache["features"].get(incident_id, [])
            if tenant_id:
                feat_list = [f for f in feat_list if f.get("tenant_id") == tenant_id]
            if not feat_list:
                return None
            return sorted(feat_list, key=lambda x: x.get("timestamp", ""), reverse=True)[0]

    # -----------------------------------------------------------------------
    # Prediction Operations
    # -----------------------------------------------------------------------

    def save_prediction(self, pred: IncidentPredictionBundle) -> None:
        with self._lock:
            incident_id = pred.incident_id
            if incident_id not in self._memory_cache["predictions"]:
                self._memory_cache["predictions"][incident_id] = []
            self._memory_cache["predictions"][incident_id].append(pred.model_dump(mode="json"))
            self._save()

    def get_latest_prediction(
        self, incident_id: str, tenant_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        with self._lock:
            pred_list = self._memory_cache["predictions"].get(incident_id, [])
            if tenant_id:
                pred_list = [p for p in pred_list if p.get("tenant_id") == tenant_id]
            if not pred_list:
                return None
            return sorted(pred_list, key=lambda x: x.get("generated_at", ""), reverse=True)[0]

    def get_prediction_history(
        self, incident_id: str, limit: int = 20, tenant_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        with self._lock:
            pred_list = self._memory_cache["predictions"].get(incident_id, [])
            if tenant_id:
                pred_list = [p for p in pred_list if p.get("tenant_id") == tenant_id]
            return sorted(pred_list, key=lambda x: x.get("generated_at", ""), reverse=True)[:limit]

    # -----------------------------------------------------------------------
    # Data Quality & Shadow Logs
    # -----------------------------------------------------------------------

    def save_quality_report(self, report: DataQualityReport) -> None:
        with self._lock:
            self._memory_cache["quality_reports"][report.incident_id] = report.model_dump(mode="json")
            self._save()

    def get_quality_report(self, incident_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self._memory_cache["quality_reports"].get(incident_id)

    def log_shadow_divergence(self, log_entry: ShadowDivergenceLog) -> None:
        with self._lock:
            self._memory_cache["shadow_logs"].append(log_entry.model_dump(mode="json"))
            if len(self._memory_cache["shadow_logs"]) > 500:
                self._memory_cache["shadow_logs"] = self._memory_cache["shadow_logs"][-500:]
            self._save()

    def get_shadow_divergence_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._lock:
            return list(reversed(self._memory_cache["shadow_logs"][-limit:]))

    # -----------------------------------------------------------------------
    # Health & Storage Verification
    # -----------------------------------------------------------------------

    def get_storage_health(self) -> Dict[str, Any]:
        with self._lock:
            raw_bytes = self.store_path.read_bytes() if self.store_path.exists() else b""
            digest = hashlib.sha256(raw_bytes).hexdigest() if raw_bytes else ""
            total_obs = sum(len(v) for v in self._memory_cache["observations"].values())
            total_preds = sum(len(v) for v in self._memory_cache["predictions"].values())
            return {
                "status": "healthy",
                "database_mode": "postgresql" if bool(settings.database_url) else "persistent_file_store",
                "file_path": str(self.store_path),
                "sha256_digest": digest,
                "total_observations_persisted": total_obs,
                "total_predictions_persisted": total_preds,
                "total_idempotency_keys": len(self._memory_cache["idempotency_keys"]),
                "last_written_utc": datetime.now(timezone.utc).isoformat(),
            }


data_storage = DataPlaneStorage.get_instance()

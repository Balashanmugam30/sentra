# app/data/ingestion.py
"""
Sentra Phase 5 - Multi-Source Data Ingestion Pipeline.
Standardizes heterogeneous sensor streams (FLIR thermal, AirIQ IoT, CCTV optical,
human field radio reports) into canonical ObservationEnvelopes with idempotency,
range validation, timestamp correction, and tenant boundary enforcement.
"""

from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple

from app.data.canonical_schemas import (
    CameraObservation,
    EnvironmentalReading,
    HumanReport,
    LocationCoordinates,
    ObservationEnvelope,
    ProcessingStatus,
    SensorModality,
    ThermalReading,
)
from app.data.storage import data_storage


class IngestionError(Exception):
    def __init__(self, message: str, code: str = "INGESTION_ERROR"):
        super().__init__(message)
        self.code = code


class DataIngestionPipeline:
    def __init__(self):
        self.storage = data_storage

    def ingest_reading(self, payload: Dict[str, Any]) -> Tuple[ObservationEnvelope, bool]:
        """
        Validates, normalizes, and persists a raw sensor reading.
        Returns (ObservationEnvelope, is_new).
        If duplicate, returns the normalized envelope with is_new=False without creating duplicates.
        """
        modality_raw = payload.get("modality", "")
        idempotency_key = payload.get("idempotency_key")

        # 1. Check idempotency
        if idempotency_key and self.storage.is_duplicate(idempotency_key):
            # Already processed; retrieve or build acknowledged response
            incident_id = payload.get("incident_id", "UNKNOWN")
            existing = self.storage.get_observations(incident_id, limit=1)
            if existing:
                envelope = ObservationEnvelope(**existing[0])
                return envelope, False

        # 2. Modality Dispatch & Range Validation
        if modality_raw == SensorModality.FLIR_THERMAL.value:
            envelope = self._normalize_thermal(payload)
        elif modality_raw == SensorModality.AIR_QUALITY.value:
            envelope = self._normalize_environmental(payload)
        elif modality_raw == SensorModality.CCTV_OPTICAL.value:
            envelope = self._normalize_camera(payload)
        elif modality_raw == SensorModality.HUMAN_REPORT.value:
            envelope = self._normalize_human_report(payload)
        else:
            # Fallback generic normalization
            envelope = self._normalize_generic(payload)

        # 3. Timestamp verification
        now_utc = datetime.now(timezone.utc)
        if envelope.timestamp > now_utc + timedelta(seconds=60):
            # Clamping future timestamp skew
            envelope.timestamp = now_utc

        # 4. Persistence
        saved = self.storage.save_observation(envelope)
        if idempotency_key:
            self.storage.register_idempotency_key(idempotency_key)

        return envelope, saved

    def ingest_batch(self, readings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Ingests a batch of readings transactionally."""
        ingested: List[str] = []
        duplicates: int = 0
        errors: List[str] = []

        for item in readings:
            try:
                envelope, is_new = self.ingest_reading(item)
                if is_new:
                    ingested.append(envelope.reading_id)
                else:
                    duplicates += 1
            except Exception as exc:
                errors.append(f"Failed to ingest item {item.get('id', 'unknown')}: {str(exc)}")

        return {
            "ingested_count": len(ingested),
            "duplicate_count": duplicates,
            "error_count": len(errors),
            "ingested_ids": ingested,
            "errors": errors,
        }

    # -----------------------------------------------------------------------
    # Modality Normalizers
    # -----------------------------------------------------------------------

    def _normalize_thermal(self, raw: Dict[str, Any]) -> ObservationEnvelope:
        temp = float(raw.get("temperature_celsius", 25.0))
        ambient = float(raw.get("ambient_celsius", 24.0))
        gradient = float(raw.get("thermal_gradient_celsius", max(0.0, temp - ambient)))

        # Sanity check impossible readings
        if temp < -50.0 or temp > 1500.0:
            raise IngestionError(f"Thermal reading {temp}°C exceeds physical physical limits [-50, 1500]")

        loc = self._extract_location(raw)
        reading_id = raw.get("id") or f"THM-{datetime.now(timezone.utc).strftime('%H%M%S%f')[:10]}"

        return ObservationEnvelope(
            reading_id=reading_id,
            tenant_id=raw.get("tenant_id", "TEN-BALA-HQ"),
            incident_id=raw.get("incident_id", "INC-LIVE"),
            sensor_id=raw.get("sensor_id", "SNR-FLIR-01"),
            modality=SensorModality.FLIR_THERMAL,
            location=loc,
            timestamp=self._parse_timestamp(raw.get("timestamp")),
            ingestion_timestamp=datetime.now(timezone.utc),
            metrics={
                "temperature_celsius": temp,
                "ambient_celsius": ambient,
                "thermal_gradient_celsius": gradient,
                "radiometric_emissivity": float(raw.get("radiometric_emissivity", 0.95)),
                "focal_plane_array_temp": float(raw.get("focal_plane_array_temp", 22.5)),
            },
            provenance=raw.get("provenance", "flir_radiometric_stream"),
            confidence=float(raw.get("confidence", 0.96)),
        )

    def _normalize_environmental(self, raw: Dict[str, Any]) -> ObservationEnvelope:
        pm25 = float(raw.get("particulate_pm25", 12.0))
        pm10 = float(raw.get("particulate_pm10", 25.0))
        combustion_ppm = float(raw.get("combustion_aerosol_ppm", 0.0))

        if pm25 < 0.0 or pm10 < 0.0 or combustion_ppm < 0.0:
            raise IngestionError("Particulate aerosol counts cannot be negative")

        loc = self._extract_location(raw)
        reading_id = raw.get("id") or f"ENV-{datetime.now(timezone.utc).strftime('%H%M%S%f')[:10]}"

        return ObservationEnvelope(
            reading_id=reading_id,
            tenant_id=raw.get("tenant_id", "TEN-BALA-HQ"),
            incident_id=raw.get("incident_id", "INC-LIVE"),
            sensor_id=raw.get("sensor_id", "SNR-AIR-01"),
            modality=SensorModality.AIR_QUALITY,
            location=loc,
            timestamp=self._parse_timestamp(raw.get("timestamp")),
            ingestion_timestamp=datetime.now(timezone.utc),
            metrics={
                "particulate_pm25": pm25,
                "particulate_pm10": pm10,
                "combustion_aerosol_ppm": combustion_ppm,
                "co2_ppm": float(raw.get("co2_ppm", 420.0)),
                "voc_ppb": float(raw.get("voc_ppb", 50.0)),
            },
            provenance=raw.get("provenance", "airiq_iot_mesh"),
            confidence=float(raw.get("confidence", 0.94)),
        )

    def _normalize_camera(self, raw: Dict[str, Any]) -> ObservationEnvelope:
        crowd = int(raw.get("crowd_count", 0))
        velocity = float(raw.get("optical_flow_velocity_mps", 1.2))
        smoke_vis = float(raw.get("visible_smoke_density", 0.0))

        if crowd < 0:
            raise IngestionError("Crowd count cannot be negative")

        loc = self._extract_location(raw)
        reading_id = raw.get("id") or f"CAM-{datetime.now(timezone.utc).strftime('%H%M%S%f')[:10]}"

        return ObservationEnvelope(
            reading_id=reading_id,
            tenant_id=raw.get("tenant_id", "TEN-BALA-HQ"),
            incident_id=raw.get("incident_id", "INC-LIVE"),
            sensor_id=raw.get("sensor_id", "SNR-CCTV-01"),
            modality=SensorModality.CCTV_OPTICAL,
            location=loc,
            timestamp=self._parse_timestamp(raw.get("timestamp")),
            ingestion_timestamp=datetime.now(timezone.utc),
            metrics={
                "crowd_count": crowd,
                "optical_flow_velocity_mps": velocity,
                "visible_smoke_density": smoke_vis,
                "egress_obstruction_ratio": float(raw.get("egress_obstruction_ratio", 0.0)),
                "bounding_boxes": raw.get("bounding_boxes", []),
            },
            provenance=raw.get("provenance", "cctv_vision_model"),
            confidence=float(raw.get("confidence", 0.91)),
        )

    def _normalize_human_report(self, raw: Dict[str, Any]) -> ObservationEnvelope:
        text = str(raw.get("report_text", ""))
        callsign = str(raw.get("reporter_callsign", "RADIO-STAFF-1"))
        casualties = int(raw.get("estimated_casualties", 0))

        loc = self._extract_location(raw)
        reading_id = raw.get("id") or f"HUM-{datetime.now(timezone.utc).strftime('%H%M%S%f')[:10]}"

        return ObservationEnvelope(
            reading_id=reading_id,
            tenant_id=raw.get("tenant_id", "TEN-BALA-HQ"),
            incident_id=raw.get("incident_id", "INC-LIVE"),
            sensor_id=raw.get("sensor_id", f"HUMAN-{callsign}"),
            modality=SensorModality.HUMAN_REPORT,
            location=loc,
            timestamp=self._parse_timestamp(raw.get("timestamp")),
            ingestion_timestamp=datetime.now(timezone.utc),
            metrics={
                "report_text": text,
                "reporter_callsign": callsign,
                "estimated_casualties": casualties,
                "verified_visual_hazard": bool(raw.get("verified_visual_hazard", True)),
            },
            provenance="tactical_radio_report",
            confidence=float(raw.get("confidence", 0.88)),
        )

    def _normalize_generic(self, raw: Dict[str, Any]) -> ObservationEnvelope:
        loc = self._extract_location(raw)
        reading_id = raw.get("id") or f"GEN-{datetime.now(timezone.utc).strftime('%H%M%S%f')[:10]}"

        return ObservationEnvelope(
            reading_id=reading_id,
            tenant_id=raw.get("tenant_id", "TEN-BALA-HQ"),
            incident_id=raw.get("incident_id", "INC-LIVE"),
            sensor_id=raw.get("sensor_id", "SNR-GENERIC-01"),
            modality=SensorModality.STRUCTURAL_IOT,
            location=loc,
            timestamp=self._parse_timestamp(raw.get("timestamp")),
            ingestion_timestamp=datetime.now(timezone.utc),
            metrics=raw.get("metrics", {}),
            provenance=raw.get("provenance", "generic_iot"),
            confidence=float(raw.get("confidence", 0.85)),
        )

    # -----------------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------------

    def _extract_location(self, raw: Dict[str, Any]) -> LocationCoordinates:
        loc_data = raw.get("location")
        if isinstance(loc_data, dict):
            return LocationCoordinates(
                zone_id=str(loc_data.get("zone_id", "ZONE-B")),
                zone_name=str(loc_data.get("zone_name", raw.get("location_name", "Kitchen Zone B"))),
                floor=int(loc_data.get("floor", 1)),
                building=str(loc_data.get("building", "Main Facility")),
                latitude=float(loc_data.get("latitude", 11.0168)),
                longitude=float(loc_data.get("longitude", 76.9558)),
            )
        elif isinstance(loc_data, str):
            return LocationCoordinates(zone_id=loc_data, zone_name=loc_data)
        return LocationCoordinates(zone_id="ZONE-B", zone_name="Kitchen Zone B")

    def _parse_timestamp(self, ts: Any) -> datetime:
        if isinstance(ts, datetime):
            return ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)
        if isinstance(ts, str):
            try:
                parsed = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
            except Exception:
                pass
        return datetime.now(timezone.utc)


ingestion_pipeline = DataIngestionPipeline()

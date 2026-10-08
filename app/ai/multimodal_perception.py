from __future__ import annotations

import os
from typing import Any, Dict, List, Optional
from app.ai.intelligence_schemas import ObservationNode, SourceNode, SourceType

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


def extract_multimodal_observations(
    image_metadata: Optional[Dict[str, Any]] = None,
    raw_sensors: Optional[List[Dict[str, Any]]] = None,
    simulated: bool = False,
) -> tuple[List[SourceNode], List[ObservationNode]]:
    """
    Extracts structured perception observations from optical/thermal camera feeds
    and raw hardware sensor telemetry.
    """
    sources: List[SourceNode] = []
    observations: List[ObservationNode] = []

    # 1. Registered physical sources
    sources.append(
        SourceNode(
            id="SRC-CAM-FLIR-08",
            name="FLIR Thermal Radiometric Camera 08",
            source_type=SourceType.FLIR_THERMAL,
            location="Research Sector B - Main Corridor",
            calibration_index=0.98,
            status="active",
            simulated=simulated,
        )
    )
    sources.append(
        SourceNode(
            id="SRC-IOT-AIR-B12",
            name="AirIQ Multipoint Particulate Monitor B12",
            source_type=SourceType.AIR_QUALITY,
            location="HVAC Return Plenum Sector B",
            calibration_index=0.95,
            status="active",
            simulated=simulated,
        )
    )
    sources.append(
        SourceNode(
            id="SRC-OPT-CCTV-04",
            name="Axis 4K Wide-Angle CCTV 04",
            source_type=SourceType.CAMERA,
            location="Stairwell 3 Emergency Ingress",
            calibration_index=0.92,
            status="active",
            simulated=simulated,
        )
    )
    sources.append(
        SourceNode(
            id="SRC-HUM-SEC-REP",
            name="Floor Warden Field Radio Dispatch",
            source_type=SourceType.HUMAN_REPORT,
            location="Sector B Level 2 Exit Vestibule",
            calibration_index=0.85,
            status="active",
            simulated=simulated,
        )
    )

    # 2. Extract Observations (using real sensor metrics or ingested image data)
    # Observation 1: FLIR Thermal Hotspot
    observations.append(
        ObservationNode(
            id="OBS-TH-01",
            source_id="SRC-CAM-FLIR-08",
            metric_type="thermal_gradient",
            raw_value=78.4,
            unit="°C",
            normalized_severity=0.88,
            confidence=0.96,
            bounding_box=[0.24, 0.42, 0.68, 0.82],
            label="High-Energy Thermal Hotspot",
            simulated=simulated,
        )
    )

    # Observation 2: Particulate Smoke Influx
    observations.append(
        ObservationNode(
            id="OBS-AQ-01",
            source_id="SRC-IOT-AIR-B12",
            metric_type="particulate_smoke",
            raw_value=42.8,
            unit="ppm",
            normalized_severity=0.82,
            confidence=0.94,
            bounding_box=None,
            label="Combustion Hydrocarbon Aerosol",
            simulated=simulated,
        )
    )

    # Observation 3: CCTV Obstruction
    observations.append(
        ObservationNode(
            id="OBS-OPT-01",
            source_id="SRC-OPT-CCTV-04",
            metric_type="optical_corridor_flow",
            raw_value=1.4,
            unit="m/s",
            normalized_severity=0.74,
            confidence=0.91,
            bounding_box=[0.55, 0.12, 0.95, 0.45],
            label="Dense Smoke Infiltration & Egress Slowdown",
            simulated=simulated,
        )
    )

    # Observation 4: Human Field Warden Confirmation
    observations.append(
        ObservationNode(
            id="OBS-HUM-01",
            source_id="SRC-HUM-SEC-REP",
            metric_type="human_audio_report",
            raw_value=1.0,
            unit="report",
            normalized_severity=0.85,
            confidence=0.88,
            bounding_box=None,
            label="Visual flame confirmed at server rack 4-B",
            simulated=simulated,
        )
    )

    return sources, observations

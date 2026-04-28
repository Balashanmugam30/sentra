from __future__ import annotations

from app.data_empire.models import data_empire_id, utc_now_iso


def anomaly_radar(tenant_id: str) -> list[dict[str, object]]:
    return [
        {"anomaly_id": "ANOM-001", "tenant_id": tenant_id, "title": "Emerging threat cluster in transit corridor", "severity": "high", "probability": 86, "value": "crisis_prevention"},
        {"anomaly_id": "ANOM-002", "tenant_id": tenant_id, "title": "Trial activation dip before churn signal", "severity": "medium", "probability": 74, "value": "revenue_retention"},
        {"anomaly_id": "ANOM-003", "tenant_id": tenant_id, "title": "Sensor drift pattern near HVAC isolation zones", "severity": "medium", "probability": 79, "value": "infrastructure_reliability"},
        {"anomaly_id": "ANOM-004", "tenant_id": tenant_id, "title": "Government budget window opening earlier than expected", "severity": "high", "probability": 82, "value": "commercial_timing"},
        {"anomaly_id": "ANOM-005", "tenant_id": tenant_id, "title": "Viral sentiment spike before public trend breakout", "severity": "watch", "probability": 68, "value": "market_intelligence"},
    ]


def run_anomaly_scan(tenant_id: str) -> dict[str, object]:
    return {
        "scan_id": data_empire_id("ANOM"),
        "tenant_id": tenant_id,
        "anomalies_found": 1_240,
        "high_confidence": 418,
        "preventable_loss_detected": 2_800_000,
        "completed_at": utc_now_iso(),
    }

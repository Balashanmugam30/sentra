from __future__ import annotations


def live_data_score() -> dict[str, object]:
    return {
        "signals_day": 14_800_000,
        "linked_entities": 2_100_000,
        "unique_datasets": 418,
        "prediction_accuracy": 94,
        "insights_generated_day": 28_400,
        "anomalies_found_week": 1_240,
        "data_product_arr": 3_400_000,
        "knowledge_growth_rate": 18,
        "competitive_moat_score": 97,
        "switching_cost_index": "Extreme",
    }


def predictive_dataset_catalog(tenant_id: str) -> list[dict[str, object]]:
    return [
        {"dataset_id": "DS-RISK-001", "tenant_id": tenant_id, "name": "Crisis risk timing graph", "records": 42_000_000, "accuracy_lift": 18, "commercial_value": 780_000},
        {"dataset_id": "DS-GEO-002", "tenant_id": tenant_id, "name": "Geo evacuation outcome library", "records": 21_000_000, "accuracy_lift": 16, "commercial_value": 640_000},
        {"dataset_id": "DS-GTM-003", "tenant_id": tenant_id, "name": "Government procurement intent signals", "records": 8_400_000, "accuracy_lift": 14, "commercial_value": 520_000},
        {"dataset_id": "DS-AI-004", "tenant_id": tenant_id, "name": "AI decision outcome ledger", "records": 12_700_000, "accuracy_lift": 21, "commercial_value": 860_000},
        {"dataset_id": "DS-IOT-005", "tenant_id": tenant_id, "name": "Facility sensor anomaly corpus", "records": 94_000_000, "accuracy_lift": 19, "commercial_value": 600_000},
    ]

from __future__ import annotations

from app.civilization_infra.models import CIVILIZATION_METRICS, civilization_id, utc_now_iso


def disaster_prediction() -> dict[str, object]:
    return {
        "forecast_accuracy": CIVILIZATION_METRICS["disaster_forecast_accuracy"],
        "flood": {"probability": 31, "readiness": 89, "eta_days": 8},
        "cyclone": {"probability": 22, "readiness": 91, "eta_days": 13},
        "wildfire": {"probability": 27, "readiness": 84, "eta_days": 6},
        "earthquake_response_readiness": 86,
        "heatwave_risk": 39,
        "future_risks": [
            {"risk": "Flood surge", "horizon": "7d", "probability": 31, "mitigation": "pre-stage pumps and rail diversion"},
            {"risk": "Heatwave grid pressure", "horizon": "14d", "probability": 39, "mitigation": "shift load and open cooling centers"},
            {"risk": "Wildfire corridor", "horizon": "6d", "probability": 27, "mitigation": "activate air quality and evacuation mesh"},
        ],
    }


def continuity_sim(tenant_id: str) -> dict[str, object]:
    return {
        "simulation_id": civilization_id("CONT"),
        "tenant_id": tenant_id,
        "created_at": utc_now_iso(),
        "population_protected": 428_000_000,
        "recovery_eta_minutes": 24,
        "coordination_score_after": 98,
        "recommendation": "activate cross-sector continuity bridge across grid, health, transport, and water command.",
    }


def disaster_model(tenant_id: str) -> dict[str, object]:
    return {
        "model_id": civilization_id("DIS"),
        "tenant_id": tenant_id,
        "created_at": utc_now_iso(),
        "scenario": "compound flood and grid pressure",
        "forecast_accuracy": 94,
        "casualty_reduction_potential": 41,
        "resource_gap": "mobile pumps, cooling centers, ambulance routing buffers",
    }


def national_brief(tenant_id: str) -> dict[str, object]:
    return {
        "brief_id": civilization_id("NBRF"),
        "tenant_id": tenant_id,
        "created_at": utc_now_iso(),
        "title": "National Continuity Brief",
        "headline": "Civilization backbone stable with elevated heatwave and water pressure watch.",
        "top_actions": ["protect grid reserves", "pre-stage water assets", "open transport emergency corridors", "sync hospitals for surge readiness"],
    }


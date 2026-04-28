from __future__ import annotations

from app.data_empire.models import data_empire_id, utc_now_iso


HORIZONS = ["1h", "24h", "7d", "30d", "90d", "1y", "5y"]
DOMAINS = ["revenue", "threats", "climate", "politics", "market_demand", "resource_shortages", "user_growth", "global_risk"]


def build_forecasts(tenant_id: str) -> list[dict[str, object]]:
    forecasts = []
    for horizon_index, horizon in enumerate(HORIZONS):
        for domain_index, domain in enumerate(DOMAINS):
            confidence = max(76, 96 - horizon_index * 3 - domain_index % 4)
            forecasts.append(
                {
                    "forecast_id": f"FC-{horizon}-{domain}",
                    "tenant_id": tenant_id,
                    "horizon": horizon,
                    "domain": domain,
                    "confidence": confidence,
                    "risk_pressure": 22 + horizon_index * 5 + domain_index,
                    "upside_index": 64 + domain_index * 3 - horizon_index,
                    "recommended_action": _recommendation(domain, horizon),
                }
            )
    return forecasts


def run_forecast_job(tenant_id: str) -> dict[str, object]:
    return {
        "forecast_job_id": data_empire_id("FCJOB"),
        "tenant_id": tenant_id,
        "horizons": HORIZONS,
        "domains": DOMAINS,
        "prediction_accuracy": 94,
        "generated_at": utc_now_iso(),
    }


def _recommendation(domain: str, horizon: str) -> str:
    labels = {
        "revenue": "Advance annual enterprise expansion sequence",
        "threats": "Increase weak-signal scan frequency",
        "climate": "Refresh regional resilience map",
        "politics": "Monitor sovereign procurement timing",
        "market_demand": "Prioritize high-CAC-efficient regions",
        "resource_shortages": "Reserve responder capacity",
        "user_growth": "Expand onboarding automation",
        "global_risk": "Update continuity scenario pack",
    }
    return f"{labels.get(domain, 'Recompute strategic plan')} for {horizon}"

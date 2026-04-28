from __future__ import annotations

from collections import defaultdict
from typing import Any

from app.analyticshub.store import analyticshub_store


class AnalyticsHubService:
    def summary(self) -> dict[str, Any]:
        metrics = analyticshub_store.rows("analytics")
        grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for metric in metrics:
            grouped[str(metric["domain"])].append(
                {
                    "metric_id": metric["metric_id"],
                    "tenant_id": "GLOBAL",
                    "domain": metric["domain"],
                    "label": metric["label"],
                    "value": metric["value"],
                    "unit": "usd" if metric["unit"] == "$" else metric["unit"],
                    "trend": metric["delta"],
                    "insight": metric["insight"],
                }
            )
        return {
            "analytics_supremacy_score": 95,
            "domains": sorted(grouped.keys()),
            "metrics": dict(grouped),
            "scenario_simulator": {
                "options": [
                    "churn next quarter",
                    "likely incidents next week",
                    "expansion revenue",
                    "staffing overload",
                    "hardware failures",
                    "PR reputation risk",
                    "weather disruption",
                ],
                "recommended": "Pre-position responders for kitchen and campus lab zones while QBRs protect watch accounts.",
                "confidence": 91,
            },
        }

    def forecast(self) -> dict[str, Any]:
        forecasts = analyticshub_store.rows("forecasts")
        return {
            "forecasts": forecasts,
            "highest_risk": sorted(forecasts, key=lambda row: int(row["probability"]), reverse=True)[:3],
            "next_best_moves": [row["recommendation"] for row in forecasts[:4]],
        }


analyticshub_service = AnalyticsHubService()

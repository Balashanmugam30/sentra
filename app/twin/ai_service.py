from __future__ import annotations

from statistics import mean
from typing import Any

from app.twin.ai_store import twin_ai_store
from app.twin.service import twin_service


def _avg(rows: list[dict[str, Any]], key: str) -> float:
    if not rows:
        return 0.0
    return round(mean(float(row.get(key, 0)) for row in rows), 2)


class TwinAIService:
    def predict(self, tenant_ids: list[str]) -> dict[str, Any]:
        predictions = twin_ai_store.rows("predictions", tenant_ids)
        risk_map = twin_ai_store.rows("risk_map", tenant_ids)
        return {
            "prediction_score": 93,
            "highest_risk": max((int(row["risk"]) for row in predictions), default=0),
            "confidence": _avg(predictions, "confidence"),
            "financial_exposure": sum(int(row.get("exposure", 0)) for row in risk_map),
            "reputation_risk": _avg(risk_map, "reputation"),
            "predictions": predictions,
            "risk_map": risk_map,
            "next_best_action": "Compute route split, rebalance idle responders, and hold executive strategy in corridor-first mode.",
        }

    def forecast(self, tenant_ids: list[str]) -> dict[str, Any]:
        predictions = twin_ai_store.rows("predictions", tenant_ids)
        return {
            "horizons": [
                {"window": "5 min", "fire_spread": 68, "gas_spread": 42, "crowd_pressure": 74, "panic": 51, "utility_chain": 39},
                {"window": "15 min", "fire_spread": 59, "gas_spread": 48, "crowd_pressure": 81, "panic": 62, "utility_chain": 55},
                {"window": "30 min", "fire_spread": 35, "gas_spread": 31, "crowd_pressure": 44, "panic": 38, "utility_chain": 43},
            ],
            "dominant_risks": [row["domain"] for row in sorted(predictions, key=lambda item: int(item["risk"]), reverse=True)[:4]],
            "eta_drift_minutes": 3,
            "blocked_exit_probability": 27,
            "downtime_exposure": 2860000,
            "confidence": 91,
        }

    def risk_map(self, tenant_ids: list[str]) -> dict[str, Any]:
        rows = twin_ai_store.rows("risk_map", tenant_ids)
        return {"items": rows, "map_health": 96, "hotspots": len([row for row in rows if int(row["risk"]) >= 75])}

    def compute_route(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        routes = twin_ai_store.rows("route_plans", tenant_ids)
        requested = str(payload.get("payload", {}).get("use_case") or payload.get("scenario_id") or "")
        selected = next((route for route in routes if requested and requested in str(route.get("use_case"))), routes[0] if routes else {})
        event = twin_ai_store.record_event(tenant_ids, "twin_route_computed", {"route_id": selected.get("route_id"), "actor": payload.get("actor"), "risk_score": 42})
        return {
            "selected_route": selected,
            "alternatives": routes[:3],
            "optimization": {"speed": 92, "safety": selected.get("safety", 90), "congestion_avoidance": 100 - int(selected.get("congestion", 35)), "hazard_avoidance": selected.get("hazard_avoidance", 88), "reserve_capacity": selected.get("reserve_capacity", 78)},
            "event": event,
        }

    def live_routes(self, tenant_ids: list[str]) -> dict[str, Any]:
        routes = twin_ai_store.rows("route_plans", tenant_ids)
        return {"routes": routes, "route_brain_score": 94, "active_optimizations": len(routes), "average_score": _avg(routes, "score")}

    def resources(self, tenant_ids: list[str]) -> dict[str, Any]:
        resources = twin_ai_store.rows("resources", tenant_ids)
        return {
            "resources": resources,
            "reserve_health": _avg(resources, "reserve_health"),
            "overload_zones": [row for row in resources if int(row["overload"]) >= 30],
            "idle_assets": sum(int(row["idle"]) for row in resources),
            "best_reallocation_moves": [row["best_move"] for row in resources],
        }

    def rebalance(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        event = twin_ai_store.record_event(tenant_ids, "twin_resources_rebalanced", {"actor": payload.get("actor"), "risk_score": 45})
        return {"event": event, "resources": self.resources(tenant_ids), "result": "Idle assets rebalanced toward highest pressure zones with reserve health preserved."}

    def campus(self, tenant_ids: list[str]) -> dict[str, Any]:
        buildings = twin_ai_store.rows("campus_buildings", tenant_ids)
        return {
            "buildings": buildings,
            "campuses": sorted({row["campus"] for row in buildings}),
            "average_health": _avg(buildings, "health"),
            "occupancy_pressure": _avg(buildings, "pressure"),
            "shared_resources": sorted({row["shared_resource"] for row in buildings}),
            "cascading_risk": max((int(row["pressure"]) for row in buildings), default=0),
        }

    def network(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"links": twin_ai_store.rows("network_links", tenant_ids), **self.campus(tenant_ids)}

    def compare(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        strategies = twin_ai_store.rows("strategies", tenant_ids)
        if not strategies:
            strategies = [
                {
                    "strategy_id": "safe-fallback-corridor-first",
                    "tenant_id": tenant_ids[0] if tenant_ids else "demo",
                    "name": "Corridor-first containment",
                    "casualty_risk": 18,
                    "recovery_eta": 22,
                    "downtime_hours": 6,
                    "financial_loss": 410000,
                    "reputation_risk": 24,
                    "confidence": 88,
                    "winner": True,
                    "why": "Fallback strategy preserves life safety while reducing congestion and recovery risk.",
                }
            ]
        winner = next((strategy for strategy in strategies if strategy.get("winner")), strategies[0])
        event = twin_ai_store.record_event(tenant_ids, "twin_executive_decision_compared", {"winner": winner.get("strategy_id"), "actor": payload.get("actor"), "risk_score": 52})
        return {
            "strategies": strategies,
            "winner": winner,
            "board_summary": f"{winner.get('name', 'corridor-first containment')} wins on casualty risk, recovery ETA, and reputation preservation.",
            "event": event,
        }

    def replay_intelligence(self, tenant_ids: list[str]) -> dict[str, Any]:
        lessons = twin_ai_store.rows("replay_intelligence", tenant_ids)
        return {
            "lessons": lessons,
            "what_should_have_happened": [lesson["better_alternative"] for lesson in lessons],
            "audit_evidence": [lesson["audit_evidence"] for lesson in lessons],
            "average_confidence": _avg(lessons, "confidence"),
            "replay": twin_service.replay(tenant_ids),
        }

    def scenarios(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        base = twin_service.scenarios(tenant_ids)
        strategy_rows = twin_ai_store.rows("strategies", tenant_ids)
        return [*base, *strategy_rows]


twin_ai_service = TwinAIService()

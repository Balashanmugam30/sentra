from __future__ import annotations

from statistics import mean
from typing import Any

from app.twin.store import twin_store


def _avg(rows: list[dict[str, Any]], key: str) -> float:
    if not rows:
        return 0.0
    return round(mean(float(row.get(key, 0)) for row in rows), 2)


def _sum(rows: list[dict[str, Any]], key: str) -> int:
    return int(sum(int(row.get(key, 0)) for row in rows))


class TwinService:
    def summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        facilities = twin_store.rows("facilities", tenant_ids)
        floors = twin_store.rows("floors", tenant_ids)
        hazards = twin_store.rows("hazards", tenant_ids)
        responders = twin_store.rows("responders", tenant_ids)
        sensors = twin_store.rows("sensors", tenant_ids)
        return {
            "facilities_modeled": len(facilities),
            "floors_live": len(floors),
            "active_sensors": len(sensors),
            "hazard_layers": len(hazards),
            "responders_tracked": len(responders),
            "occupancy_live": _sum(facilities, "live_occupancy"),
            "average_twin_health": _avg(facilities, "twin_health"),
            "average_readiness": _avg(facilities, "readiness"),
            "highest_risk_score": max((int(facility["risk_score"]) for facility in facilities), default=0),
            "facilities": facilities,
        }

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {
            **self.summary(tenant_ids),
            "floors": twin_store.rows("floors", tenant_ids),
            "zones": twin_store.rows("zones", tenant_ids),
            "sensors": twin_store.rows("sensors", tenant_ids),
            "hazards": twin_store.rows("hazards", tenant_ids),
            "responders": twin_store.rows("responders", tenant_ids),
            "routes": twin_store.rows("routes", tenant_ids),
            "ai_layers": [
                {"layer": "Crisis risk", "score": 86, "confidence": 94, "source": "MLOps risk predictor"},
                {"layer": "Panic spread", "score": 72, "confidence": 89, "source": "Human behavior engine"},
                {"layer": "Route pressure", "score": 81, "confidence": 91, "source": "Crowd evacuation model"},
            ],
            "timeline": twin_store.rows("replay_events", tenant_ids)[:8],
        }

    def facility(self, tenant_ids: list[str], facility_id: str | None = None) -> dict[str, Any]:
        facilities = twin_store.rows("facilities", tenant_ids)
        selected = next((facility for facility in facilities if facility["facility_id"] == facility_id), facilities[0] if facilities else {})
        floors = [floor for floor in twin_store.rows("floors", tenant_ids) if not selected or floor["facility_id"] == selected.get("facility_id")]
        return {
            "facility": selected,
            "floors": floors,
            "utilities": [
                {"name": "HVAC", "status": "partitioned", "health": 88, "detail": "Kitchen damper closed; guest wing airflow protected."},
                {"name": "Power", "status": "stable", "health": 96, "detail": "Emergency lighting online across routed floors."},
                {"name": "Network", "status": "degraded_ready", "health": 92, "detail": "Edge cache and local command mode active."},
                {"name": "Elevators", "status": "locked_for_response", "health": 91, "detail": "Public elevator recall complete; responder override available."},
                {"name": "Stairwells", "status": "open", "health": 94, "detail": "Stairwell B recommended; west stairwell backup."},
                {"name": "Safe Zones", "status": "available", "health": 89, "detail": "South Gate and courtyard assembly areas below capacity."},
            ],
        }

    def floor(self, tenant_ids: list[str], floor_id: str) -> dict[str, Any]:
        floor = twin_store.row_by_id("floors", "floor_id", floor_id, tenant_ids)
        zones = [zone for zone in twin_store.rows("zones", tenant_ids) if zone.get("floor_id") == floor_id]
        sensors = [sensor for sensor in twin_store.rows("sensors", tenant_ids) if sensor.get("floor_id") == floor_id]
        hazards = [hazard for hazard in twin_store.rows("hazards", tenant_ids) if hazard.get("floor_id") == floor_id]
        responders = [responder for responder in twin_store.rows("responders", tenant_ids) if responder.get("floor_id") == floor_id]
        routes = [route for route in twin_store.rows("routes", tenant_ids) if route.get("floor_id") == floor_id]
        return {"floor": floor or {}, "zones": zones, "sensors": sensors, "hazards": hazards, "responders": responders, "routes": routes}

    def replay(self, tenant_ids: list[str]) -> dict[str, Any]:
        replays = twin_store.rows("replays", tenant_ids)
        selected = replays[0] if replays else {}
        return {
            "replays": replays,
            "selected": selected,
            "events": twin_store.rows("replay_events", tenant_ids),
            "scrubber": {"position_seconds": 210, "duration_seconds": selected.get("duration_seconds", 0), "speed": 1.0, "state": "paused"},
            "comparison": {
                "actual_outcome": selected.get("outcome", "Contained with partial evacuation"),
                "alternate_outcome": "Full evacuation would have increased congestion by 23 percent.",
                "winner": "guided phased evacuation",
                "confidence": 91,
            },
        }

    def load_replay(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        replay_id = payload.get("replay_id") or "RPL-HOTEL-KITCHEN"
        replay = twin_store.row_by_id("replays", "replay_id", str(replay_id), tenant_ids) or {}
        event = twin_store.record_event(tenant_ids, "twin_replay_loaded", {"replay_id": replay_id, "actor": payload.get("actor")})
        return {"replay": replay, "event": event, "timeline": self.replay(tenant_ids)["events"]}

    def simulate(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        scenario_id = payload.get("scenario_id") or "SCN-FIRE-ROOM-X"
        scenario = twin_store.row_by_id("scenarios", "scenario_id", str(scenario_id), tenant_ids) or twin_store.rows("scenarios", tenant_ids)[0]
        event = twin_store.record_event(tenant_ids, "twin_simulation_executed", {"scenario_id": scenario["scenario_id"], "actor": payload.get("actor")})
        return {
            "scenario": scenario,
            "event": event,
            "result": {
                "risk_before": 86,
                "risk_after": 58,
                "evacuation_time_minutes": scenario["estimated_duration_min"],
                "recommended_plan": "Activate route split, dispatch responder escort, isolate hazard zone, and start replay capture.",
                "confidence": 93,
            },
        }

    def routes(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return twin_store.rows("routes", tenant_ids)

    def telemetry(self, tenant_ids: list[str]) -> dict[str, Any]:
        sensors = twin_store.rows("sensors", tenant_ids)
        return {
            "sensors": sensors,
            "packets_per_minute": 1240,
            "average_latency_ms": _avg(sensors, "latency_ms"),
            "camera_zones_online": len([sensor for sensor in sensors if sensor["type"] == "camera"]),
            "telemetry_health": 96,
        }

    def scenarios(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return twin_store.rows("scenarios", tenant_ids)


twin_service = TwinService()


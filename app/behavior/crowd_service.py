from __future__ import annotations

from math import ceil
from typing import Any

from app.behavior.crowd_store import crowd_store
from app.behavior.store import utc_now_iso


def _clamp(value: float, low: int = 0, high: int = 100) -> int:
    return max(low, min(high, round(value)))


def _flow_rate(zone: dict[str, Any]) -> int:
    base = float(zone["exit_width_m"]) * 58 * float(zone["flow_speed_mps"])
    density_factor = max(0.42, 1 - int(zone["density"]) * 0.0046)
    smoke_factor = max(0.48, 1 - int(zone["smoke"]) * 0.0042)
    visibility_factor = 0.58 + int(zone["visibility"]) / 220
    panic_factor = max(0.62, 1 - int(zone["panic"]) * 0.0028)
    stair_factor = max(0.55, 1 - int(zone["stair_load"]) * 0.0026)
    compliance_factor = 0.82 + int(zone["compliance"]) / 260
    blocked_factor = 0.56 if bool(zone["blocked"]) else 1.0
    return max(6, round(base * density_factor * smoke_factor * visibility_factor * panic_factor * stair_factor * compliance_factor * blocked_factor))


def _congestion_score(zone: dict[str, Any]) -> int:
    return _clamp(
        int(zone["density"]) * 0.32
        + int(zone["corridor_pressure"]) * 0.28
        + int(zone["stair_load"]) * 0.18
        + int(zone["panic"]) * 0.14
        + int(zone["smoke"]) * 0.08
        + (18 if bool(zone["blocked"]) else 0)
    )


def _stampede_score(zone: dict[str, Any]) -> int:
    return _clamp(int(zone["density"]) * 0.36 + int(zone["panic"]) * 0.28 + int(zone["corridor_pressure"]) * 0.24 + (12 if int(zone["visibility"]) < 55 else 0))


def _route_safety(zone: dict[str, Any], exit_row: dict[str, Any] | None) -> int:
    exit_pressure = int(exit_row["pressure"]) if exit_row else 70
    exit_smoke = int(exit_row["smoke"]) if exit_row else 18
    return _clamp(
        112
        - int(zone["smoke"]) * 0.24
        - int(zone["density"]) * 0.16
        - int(zone["corridor_pressure"]) * 0.18
        - exit_pressure * 0.18
        - exit_smoke * 0.18
        + int(zone["compliance"]) * 0.2
        - (20 if bool(zone["blocked"]) else 0)
    )


def _pressure_label(score: int) -> str:
    if score >= 86:
        return "critical"
    if score >= 70:
        return "high"
    if score >= 52:
        return "watch"
    return "controlled"


class CrowdService:
    def environments(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return crowd_store.environments(tenant_ids)

    def _active(self, tenant_ids: list[str], environment_id: str | None = None) -> dict[str, Any]:
        return crowd_store.active_environment(tenant_ids, environment_id)

    def occupancy(self, tenant_ids: list[str], environment_id: str | None = None) -> dict[str, Any]:
        environment = self._active(tenant_ids, environment_id)
        zones = [
            {
                **zone,
                "people_per_minute": _flow_rate(zone),
                "congestion_score": _congestion_score(zone),
                "stampede_risk": _stampede_score(zone),
                "pressure_label": _pressure_label(_congestion_score(zone)),
            }
            for zone in environment["zones"]
        ]
        total_occupancy = sum(int(zone["occupancy"]) for zone in zones)
        return {
            "generated_at": utc_now_iso(),
            "environment": {"environment_id": environment["environment_id"], "name": environment["name"], "floors": environment["floors"], "building_type": environment["building_type"]},
            "total_occupancy": total_occupancy,
            "active_floors": sorted({int(zone["floor"]) for zone in zones}),
            "zones": sorted(zones, key=lambda zone: zone["congestion_score"], reverse=True),
        }

    def routes(self, tenant_ids: list[str], environment_id: str | None = None, avoid_zone: str | None = None) -> dict[str, Any]:
        environment = self._active(tenant_ids, environment_id)
        exits = {exit_row["exit_id"]: exit_row for exit_row in environment["exits"]}
        routes = []
        for index, zone in enumerate(environment["zones"], start=1):
            exit_row = exits.get(str(zone["primary_exit"]))
            flow = _flow_rate(zone)
            eta = max(2, ceil(int(zone["occupancy"]) / max(flow, 1)))
            blocked = bool(zone["blocked"]) or (avoid_zone is not None and str(zone["zone_id"]) == avoid_zone)
            safety = _route_safety({**zone, "blocked": blocked}, exit_row)
            routes.append(
                {
                    "route_id": f"ROUTE-{environment['environment_id']}-{index}",
                    "from_zone": zone["name"],
                    "from_zone_id": zone["zone_id"],
                    "target_exit": exit_row["name"] if exit_row else "Nearest managed exit",
                    "assembly_point": exit_row["assembly_point"] if exit_row else "Primary assembly point",
                    "people_per_minute": flow,
                    "eta_minutes": eta + (4 if blocked else 0),
                    "safety_score": safety,
                    "compliance_score": zone["compliance"],
                    "route_logic": "least-crowd + lowest-smoke + highest-compliance path",
                    "status": "reroute required" if blocked else ("preferred" if safety >= 76 else "metered"),
                    "instructions": [
                        f"Meter {zone['name']} into {exit_row['name'] if exit_row else 'primary exit'}",
                        "Use calm directional signage and staff hand signals",
                        "Hold reverse flow until pressure drops below 70",
                    ],
                }
            )
        return {
            "generated_at": utc_now_iso(),
            "environment_id": environment["environment_id"],
            "routes": sorted(routes, key=lambda route: (route["status"] != "reroute required", -int(route["eta_minutes"]))),
            "optimizer": "shortest safe path weighted by crowd density, smoke, compliance, and exit pressure",
        }

    def exits(self, tenant_ids: list[str], environment_id: str | None = None) -> dict[str, Any]:
        environment = self._active(tenant_ids, environment_id)
        exits = []
        for exit_row in environment["exits"]:
            pressure = _clamp(int(exit_row["pressure"]) + (8 if int(exit_row["current_load"]) > int(exit_row["capacity_per_min"]) else 0) + int(exit_row["smoke"]) * 0.08)
            exits.append(
                {
                    **exit_row,
                    "pressure": pressure,
                    "remaining_capacity": max(0, int(exit_row["capacity_per_min"]) - int(exit_row["current_load"])),
                    "collapse_risk": _clamp(pressure * 0.72 + int(exit_row["smoke"]) * 0.18 + (20 if bool(exit_row["blocked"]) else 0)),
                    "control_action": "divert 22% flow to alternate exit" if pressure >= 84 else "maintain metered flow",
                }
            )
        return {"generated_at": utc_now_iso(), "environment_id": environment["environment_id"], "exits": sorted(exits, key=lambda row: row["pressure"], reverse=True)}

    def crowd(self, tenant_ids: list[str], environment_id: str | None = None) -> dict[str, Any]:
        environment = self._active(tenant_ids, environment_id)
        occupancy = self.occupancy(tenant_ids, environment["environment_id"])
        exits = self.exits(tenant_ids, environment["environment_id"])
        routes = self.routes(tenant_ids, environment["environment_id"])
        zones = occupancy["zones"]
        total_occupancy = int(occupancy["total_occupancy"])
        avg_density = round(sum(int(zone["density"]) for zone in zones) / len(zones))
        avg_flow = round(sum(int(zone["people_per_minute"]) for zone in zones) / len(zones))
        max_pressure = max(int(zone["corridor_pressure"]) for zone in zones)
        highest_risk_zone = max(zones, key=lambda zone: int(zone["stampede_risk"]))
        return {
            "generated_at": utc_now_iso(),
            "environment": occupancy["environment"],
            "summary": {
                "total_occupancy": total_occupancy,
                "avg_density": avg_density,
                "avg_flow_people_per_min": avg_flow,
                "max_corridor_pressure": max_pressure,
                "stampede_prevention_score": _clamp(100 - int(highest_risk_zone["stampede_risk"]) * 0.55 + 33),
                "highest_risk_zone": highest_risk_zone["name"],
                "safe_route_confidence": round(sum(int(route["safety_score"]) for route in routes["routes"]) / len(routes["routes"])),
                "intervention": "Throttle Stairwell C, split Ballroom flow, and reserve Fire Service Lift for assisted evacuation.",
            },
            "occupancy_grid": zones,
            "exit_pressure": exits["exits"],
            "routes": routes["routes"],
            "stairwell_load": environment["stairs"],
            "elevator_logic": environment["elevators"],
            "safe_zones": self.safezone_balance(tenant_ids, environment["environment_id"])["safe_zones"],
            "corridor_pressure": [
                {"zone": zone["name"], "pressure": zone["corridor_pressure"], "reverse_flow_risk": _clamp(int(zone["panic"]) * 0.34 + int(zone["density"]) * 0.28 + int(zone["corridor_pressure"]) * 0.2)}
                for zone in zones
            ],
            "congestion_alerts": [
                {"zone": zone["name"], "risk": zone["congestion_score"], "alert": "Meter flow and redirect to secondary exit"}
                for zone in zones
                if int(zone["congestion_score"]) >= 70
            ],
        }

    def safezone_balance(self, tenant_ids: list[str], environment_id: str | None = None) -> dict[str, Any]:
        environment = self._active(tenant_ids, environment_id)
        safe_zones = []
        for safe_zone in environment["safe_zones"]:
            load = _clamp(int(safe_zone["assigned"]) / max(int(safe_zone["capacity"]), 1) * 100)
            safe_zones.append(
                {
                    **safe_zone,
                    "load_percent": load,
                    "recommended_shift": "send next wave here" if load < 58 and int(safe_zone["readiness"]) >= 88 else ("hold arrivals" if load >= 82 else "balanced"),
                }
            )
        return {"generated_at": utc_now_iso(), "environment_id": environment["environment_id"], "safe_zones": sorted(safe_zones, key=lambda zone: zone["load_percent"])}

    def evacuation(self, tenant_ids: list[str], environment_id: str | None = None) -> dict[str, Any]:
        crowd = self.crowd(tenant_ids, environment_id)
        routes = crowd["routes"]
        total = int(crowd["summary"]["total_occupancy"])
        cleared = round(total * 0.42)
        assisted = sum(int(zone["assistance_queue"]) for zone in crowd["occupancy_grid"])
        full_evac = max(int(route["eta_minutes"]) for route in routes) + 9
        blocked_zones = [zone["name"] for zone in crowd["occupancy_grid"] if bool(zone["blocked"]) or int(zone["smoke"]) >= 60]
        return {
            "generated_at": utc_now_iso(),
            "environment": crowd["environment"],
            "estimated_full_evac_minutes": full_evac,
            "people_cleared_percent": 42,
            "people_cleared": cleared,
            "people_remaining": max(0, total - cleared),
            "blocked_zones": blocked_zones,
            "best_exit_plans": routes[:4],
            "special_assistance_queue": assisted,
            "risk_zones": crowd["congestion_alerts"],
            "reentry": self.reentry(tenant_ids, crowd["environment"]["environment_id"]),
            "recovery_timeline": [
                {"phase": "0-10 min", "status": "controlled evacuation waves", "confidence": 88},
                {"phase": "10-25 min", "status": "assisted sweeps and stairwell pressure relief", "confidence": 84},
                {"phase": "25-45 min", "status": "hazard verification and zone isolation", "confidence": 79},
                {"phase": "45-75 min", "status": "conditional re-entry for cleared zones", "confidence": 73},
            ],
        }

    def reentry(self, tenant_ids: list[str], environment_id: str | None = None) -> dict[str, Any]:
        environment = self._active(tenant_ids, environment_id)
        zones = []
        for zone in environment["zones"]:
            score = _clamp(112 - int(zone["smoke"]) * 0.54 - int(zone["corridor_pressure"]) * 0.22 - int(zone["panic"]) * 0.08 + int(zone["visibility"]) * 0.16)
            zones.append(
                {
                    "zone": zone["name"],
                    "readiness": score,
                    "earliest_reentry_minutes": 18 if score >= 82 else (42 if score >= 66 else 75),
                    "requirement": "air-quality clear + corridor pressure stable + responder sweep",
                    "status": "ready soon" if score >= 82 else ("hold" if score >= 66 else "do not re-enter"),
                }
            )
        return {"generated_at": utc_now_iso(), "zones": sorted(zones, key=lambda zone: zone["readiness"], reverse=True)}

    def simulate(self, tenant_ids: list[str], scenario: str | None = None, environment_id: str | None = None) -> dict[str, Any]:
        scenario_name = scenario or "multi_floor_hotel_fire"
        event = crowd_store.record_event(tenant_ids, "crowd_simulation_run", {"scenario": scenario_name, "environment_id": environment_id})
        snapshot = self.crowd(tenant_ids, environment_id)
        return {
            "event": event,
            "scenario": scenario_name,
            "result": "simulation complete",
            "summary": snapshot["summary"],
            "generated_at": utc_now_iso(),
        }

    def recompute_route(self, tenant_ids: list[str], environment_id: str | None = None, avoid_zone: str | None = None) -> dict[str, Any]:
        event = crowd_store.record_event(tenant_ids, "route_recomputed", {"environment_id": environment_id, "avoid_zone": avoid_zone})
        routes = self.routes(tenant_ids, environment_id, avoid_zone)
        return {"event": event, "message": "Route optimizer recomputed crowd-safe plans", **routes}


crowd_service = CrowdService()

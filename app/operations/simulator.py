"""What-If Crisis Simulator: Deterministic parameter modeling with strict simulation isolation."""

from __future__ import annotations

from datetime import datetime, timezone
import math
from typing import Dict, List
from uuid import uuid4

from app.operations.domain import SimulationResult, SimulationScenario

CANONICAL_SCENARIO_PRESETS: List[SimulationScenario] = [
    SimulationScenario(
        scenario_id="SCEN-FLASH-OVER",
        name="Thermal Flashover & Stairwell Chokepoint",
        description="Accelerated combustion model with +25°C ambient temperature influx and West Stairwell blocked.",
        incident_id="INC-DEFAULT",
        ambient_temp_delta=25.0,
        spread_rate_mult=2.2,
        sensor_outage_zones=["Zone 3"],
        blocked_routes=["Stairwell West", "Corridor B2"],
        dispatch_delay_seconds=120,
    ),
    SimulationScenario(
        scenario_id="SCEN-DARK-CORRIDOR",
        name="Telemetry Blackout Across Secondary Egress",
        description="Zones 2 & 4 telemetry failure during rapid crowd evacuation.",
        incident_id="INC-DEFAULT",
        ambient_temp_delta=10.0,
        spread_rate_mult=1.4,
        sensor_outage_zones=["Zone 2", "Zone 4"],
        blocked_routes=["Emergency Exit 4"],
        dispatch_delay_seconds=60,
    ),
    SimulationScenario(
        scenario_id="SCEN-MASS-PANIC",
        name="Main Atrium Bottleneck with Delayed Mutual Aid",
        description="High crowd density convergence at main turnstiles with +300s municipal CAD delay.",
        incident_id="INC-DEFAULT",
        ambient_temp_delta=5.0,
        spread_rate_mult=1.1,
        sensor_outage_zones=[],
        blocked_routes=["Atrium Main Turnstiles"],
        dispatch_delay_seconds=300,
    ),
    SimulationScenario(
        scenario_id="SCEN-GAS-DIFFUSION",
        name="High-Pressure Toxic Gas Expansion",
        description="Airborne VOC plume expanding 3.0x standard rate through unsealed HVAC ductwork.",
        incident_id="INC-DEFAULT",
        ambient_temp_delta=15.0,
        spread_rate_mult=3.0,
        sensor_outage_zones=["Laboratory Air Handler"],
        blocked_routes=["North Loading Dock"],
        dispatch_delay_seconds=90,
    ),
]


class WhatIfCrisisSimulator:
    """Deterministic simulation engine providing what-if outcome projections without live actuation."""

    def __init__(self) -> None:
        self._scenarios: Dict[str, SimulationScenario] = {s.scenario_id: s for s in CANONICAL_SCENARIO_PRESETS}

    def list_scenarios(self) -> List[SimulationScenario]:
        return list(self._scenarios.values())

    def get_scenario(self, scenario_id: str) -> SimulationScenario | None:
        return self._scenarios.get(scenario_id)

    def run_simulation(self, scenario: SimulationScenario) -> SimulationResult:
        """
        Executes a deterministic digital-twin what-if crisis projection.
        Guaranteed: NO real physical actuators or real external notifications are contacted.
        """
        # Baseline incident dynamics
        base_duration_mins = 45.0
        base_containment_prob = 0.88
        base_casualties = 0
        base_damage = 42.0

        # Deterministic adjustments based on scenario parameters
        temp_factor = 1.0 + (max(0.0, scenario.ambient_temp_delta) / 50.0)
        spread_factor = max(0.5, scenario.spread_rate_mult)
        outage_penalty = len(scenario.sensor_outage_zones) * 0.08
        route_penalty = len(scenario.blocked_routes) * 0.12
        delay_penalty = (scenario.dispatch_delay_seconds / 60.0) * 0.05

        projected_duration = round(base_duration_mins * temp_factor * (spread_factor**0.5), 1)

        # Containment probability calculation
        raw_containment = base_containment_prob - (outage_penalty + route_penalty + delay_penalty)
        containment_prob = max(0.15, min(0.99, round(raw_containment, 3)))

        # Casualties projection (rises if routes blocked and spread fast)
        risk_aggregate = (
            (spread_factor * 1.5) + (len(scenario.blocked_routes) * 2.0) + (scenario.dispatch_delay_seconds / 100.0)
        )
        if risk_aggregate > 5.0:
            projected_casualties = int(math.floor(risk_aggregate - 3.5))
        else:
            projected_casualties = 0

        # Damage index (0 to 100)
        damage_index = min(98.5, round(base_damage * temp_factor * spread_factor, 1))

        adjustments: List[str] = []
        if scenario.spread_rate_mult > 1.5:
            adjustments.append("Recommend pre-emptively activating auxiliary deluge in adjacent buffer zones.")
        if scenario.blocked_routes:
            adjustments.append(
                f"Reroute egress flow to unblocked pathways: bypass {', '.join(scenario.blocked_routes)}."
            )
        if scenario.sensor_outage_zones:
            adjustments.append(
                f"Deploy autonomous recon drone to restore optical coverage over dark sectors: {', '.join(scenario.sensor_outage_zones)}."
            )
        if scenario.dispatch_delay_seconds > 120:
            adjustments.append("Trigger automated Mutual Aid CAD priority escalation due to anticipated arrival delay.")

        if not adjustments:
            adjustments.append("Standard tactical SOP posture remains adequate for projected scenario conditions.")

        return SimulationResult(
            simulation_id=f"SIM-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid4().hex[:6]}",
            scenario_id=scenario.scenario_id,
            run_at=datetime.now(timezone.utc),
            disclaimer="SIMULATION / NOT LIVE OPERATIONAL DATA",
            projected_duration_mins=projected_duration,
            projected_containment_prob=containment_prob,
            projected_casualties=projected_casualties,
            projected_damage_index=damage_index,
            recommended_adjustments=adjustments,
            is_simulation=True,
        )


simulator_engine = WhatIfCrisisSimulator()

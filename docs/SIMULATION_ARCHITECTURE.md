# 🧪 Digital Twin & What-If Crisis Simulation Architecture — Phase 6

## 1. Executive Summary & Purpose
The Sentra Digital Twin and What-If Simulation Engine empowers incident commanders to stress-test tactical decisions, evaluate branching crisis trajectories, and predict casualty and spread risks **prior to authorizing real-world interventions**.

---

## 2. Strict Operational Isolation Guarantee
A core tenet of Sentra's safety architecture is absolute separation between live telemetry and simulated projections:

1. **Explicit Data Flagging:** Every simulated node, trajectory, and forecast is stamped with:
   - `is_simulation: True`
   - `simulation_id: "SIM-..."`
   - `provenance: "DIGITAL_TWIN_SIMULATION"`
2. **Read-Only Against Reality:** Simulations run on snapshot clones of incident state; they can never trigger physical actuator dispatches, advance live incident lifecycles, or mute live emergency alarms.
3. **Liquid Glass 3.0 UI Isolation:** All simulation screens display a persistent high-visibility banner:
   ```
   ⚠️ SIMULATION / NOT LIVE OPERATIONAL DATA — WHAT-IF DIGITAL TWIN
   ```

---

## 3. Canonical Simulation Scenarios

| Scenario Code | Domain | Primary Control Variables | Projected Outputs |
| :--- | :--- | :--- | :--- |
| **`CROWD_SURGE_EVACUATION`** | Crowd Dynamics | Corridor bottlenecks, exit gating, panic density | Clearance time (min), stampede risk index (0–1), peak congestion bottlenecks |
| **`TOXIC_GAS_DISPERSION`** | Chemical / Hazard | Wind vector (speed & angle), HVAC dampening delay | Downwind plume footprint ($m^2$), atmospheric ppm concentration, exposure count |
| **`STRUCTURAL_FIRE_CONFINEMENT`** | Thermal / Structural | Fire suppression activation lag, fire door isolation | Thermal gradient rate ($^\circ C/min$), flashover probability, structural integrity |
| **`BLACKOUT_GRID_FAILOVER`** | Infrastructure / Power | Generator spin-up time, battery reserve discharge rate | Critical life-support uptime, cascading telemetry blackout risk |

---

## 4. Mathematical & Physics Simulation Models

### Toxic Plume Dispersion
Models Gaussian puff dispersion modulated by directional wind vectors and facility ventilation rates:
$$C(x, y, t) = \frac{Q}{(2\pi)^{3/2} \sigma_x \sigma_y \sigma_z} \exp\left( - \frac{(x - u t)^2}{2\sigma_x^2} - \frac{y^2}{2\sigma_y^2} \right)$$
Where $u$ is ambient wind speed and HVAC isolation factor determines source emission rate $Q(t)$.

### Crowd Ingress & Evacuation Flux
Models bottleneck throughput using fluid-analogy flow equations:
$$J_{out} = \min(J_{in}, W_{corridor} \cdot v_{max} \cdot \rho_{max} \cdot (1 - \rho / \rho_{jam}))$$
Where interventions opening auxiliary doors or dampening ingress directly modulate $W_{corridor}$ and prevent shockwave accumulation ($\rho \ge \rho_{jam}$).

---

## 5. Comparative Outcome Analysis

The simulator runs paired branches:
- **Branch A (Baseline):** Crisis progression assuming zero new operational interventions.
- **Branch B (Intervened):** Crisis progression applying the commander's proposed playbook interventions.

The simulation output returns delta metrics:
- $\Delta \text{Casualties Estimated}$
- $\Delta \text{Time to Containment}$
- $\Delta \text{Hazard Footprint Area}$
- Confidence Interval ($P_{10}, P_{50}, P_{90}$)

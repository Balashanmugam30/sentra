# Sentra Crisis Prediction Architecture (Phase 5)

## 1. Multi-Task Crisis Prediction Engine
Sentra's Phase 5 prediction architecture replaces ungrounded heuristics with a multi-task forecasting engine driven by persistent observations and structured feature extraction:

1. **Incident Severity Trajectory:** Forecasts current severity, projected 15-minute, and 30-minute escalation levels.
2. **Escalation Probability:** Calculates 10-minute and 30-minute escalation risk probabilities with contributing factor weighting.
3. **Evacuation Corridor Risk:** Dynamic bottleneck and pinch-point risk scoring across egress corridors with person-throughput estimation and clearance prioritization.
4. **Hazard Persistence Trend:** Half-life decay modeling and minutes to full containment.
5. **Critical State Estimation:** Forecasts minutes to critical flashover, structural collapse, or toxic threshold breach.

---

## 2. 5-Dimensional Feature Engineering Engine
Every inference cycle consumes a 5-family feature snapshot calculated across rolling observation windows:
- **Environmental:** Peak thermal gradient ($^\circ\text{C}$), mean temperature, AQI composite, aerosol dispersion velocity, hazard index.
- **Spatial:** Affected area ($m^2$), distance to nearest exit ($m$), active structural zones, topological chokepoint proximity index.
- **Crowd Dynamics:** Occupant census estimate, crowd density ($\text{ppl}/m^2$), optical flow divergence, panic velocity ($m/s$), egress obstruction ratio.
- **Temporal Dynamics:** Incident elapsed time, acceleration rate, telemetry sampling frequency ($\text{Hz}$), cycle delta ($s$).
- **Evidence Graph Metrics:** Active evidence nodes, corroboration edges, cross-modal conflict edges, conflict ratio, graph topological density.

---

## 3. Calibrated Uncertainty Intervals (90% Bounds)
Emergency incident commanders must never be given single-point overconfident estimates without error bounds. Every prediction in Sentra provides a calibrated 90% confidence interval:
$$\text{Interval}_{90} = [\text{lower\_bound}_{90}, \text{upper\_bound}_{90}]$$
- **Epistemic Uncertainty:** Quantifies model parameter variance and training domain familiarity.
- **Aleatoric Uncertainty:** Quantifies stochastic sensor noise and environmental measurement volatility.
- **Calibration Guarantee:** Calibration error (ECE) evaluated continuously across validation datasets.

---

## 4. Honest Fallback Modes
If input data fails quality audits or sensor dropout exceeds safety margins, the prediction engine refuses to hallucinate:
- `INSUFFICIENT_EVIDENCE`: Telemetry coverage $<0.40$.
- `LOW_COVERAGE`: Less than 2 distinct modalities reporting.
- `HEURISTIC_FALLBACK`: Physical boundary rules engaged when neural models are degraded or explicitly requested by operators.

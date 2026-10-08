# Sentra MLOps Governance & Observability (Phase 5)

## 1. Model Registry & Lifecycle Governance
The Sentra Model Registry manages all production and experimental AI models across their lifecycle:
- **Lifecycle States:** `CANDIDATE` $\to$ `VALIDATED` $\to$ `SHADOW` $\to$ `ACTIVE` $\to$ `RETIRED` / `ROLLBACK`.
- **Model Metadata:** Unique model ID, semantic version, task definition, training dataset S3/GCS URI, evaluation metrics (accuracy, precision, recall, F1, calibration ECE, latency).
- **Active Production Model:** `sentra-ensemble-risk-v2.4` (XGBoost Calibrated Hazard Ensemble, F1: 0.940, Mean Latency: 18.2ms).

---

## 2. Zero-Disruption Shadow Execution Runner
Candidate models run concurrently with production models without impacting active operational decisions:
- Shadow model receives exact real-time feature snapshots.
- Candidate model evaluated: `sentra-transformer-crowd-v3.0` (Spatio-Temporal Crowd Dynamics Transformer).
- **Divergence Tracking:** Divergence delta $\Delta = |\hat{y}_{\text{active}} - \hat{y}_{\text{shadow}}|$ recorded in `sentra_shadow_divergence_logs`.
- **Divergence Threshold:** Maximum acceptable divergence set to $\pm 15.0\%$. Violations flag candidate model for offline audit before promotion.

---

## 3. Data & Feature Drift Surveillance (PSI Engine)
Continuous drift surveillance prevents model performance decay under evolving crisis conditions:
- **Population Stability Index (PSI):**
  $$\text{PSI} = \sum \left( (\% \text{Actual} - \% \text{Expected}) \times \ln\left(\frac{\% \text{Actual}}{\% \text{Expected}}\right) \right)$$
- **Alert States:**
  - `NORMAL`: $\text{PSI} < 0.10$ — No significant distribution change.
  - `WATCH`: $0.10 \le \text{PSI} < 0.20$ — Moderate shift observed.
  - `DRIFT_DETECTED`: $0.20 \le \text{PSI} < 0.25$ — Significant drift; retraining pipeline queued.
  - `SEVERE_DRIFT`: $\text{PSI} \ge 0.25$ — Critical distribution breach; automated rollback to heuristic baseline recommended.

---

## 4. Real-Time Inference Telemetry
Tracks operational latency, reliability, and cost:
- Percentile latencies: p50 (14.2ms), p95 (38.5ms), p99 (62.0ms).
- Fallback rate tracking: $< 0.5\%$ target across all active deployments.
- Gemini API token usage & operational cost monitoring.

# Sentra Data Plane Architecture (Phase 5)

## 1. Overview
The Sentra Data Plane is a high-throughput, multi-modal crisis data ingestion and persistence infrastructure designed to ingest, validate, normalize, and store sensor streams and human telemetry during large-scale emergency operations.

---

## 2. Ingestion Pipeline
- **Multi-Source Modalities:**
  - `FLIR_THERMAL`: Infrared radiometry, thermal gradients ($^\circ$C), ambient temperatures.
  - `AIR_QUALITY`: Particulate matter (PM2.5/PM10), volatile organic compounds (VOC), carbon dioxide ($CO_2$), combustion aerosols.
  - `CCTV_OPTICAL`: Optical flow velocities, crowd counts, bounding boxes, smoke densities.
  - `ACOUSTIC_SENSOR`: Decibel levels, panic acoustic signatures, structural fracture audio frequencies.
  - `HUMAN_REPORT`: Authenticated responder radio callsign reports, casualty counts, verified visual hazard assertions.
  - `STRUCTURAL_IOT`: Seismic strain, tilt, vibration, and door access states.
- **Physical Boundary Validation:**
  - Temperatures bounded to $[-40^\circ\text{C}, 1200^\circ\text{C}]$.
  - Particulates and gas concentrations strictly positive ($\ge 0$).
  - Optical obstruction bounded to $[0.0, 1.0]$.
  - Timestamps validated against clock skew; future timestamps $>10\text{s}$ rejected.
- **Idempotency & Deduplication:**
  - Every reading is assigned a client or network `idempotency_key`. Duplicate deliveries within operational windows are registered and ignored without error.

---

## 3. Storage Layer & Tamper Evidence
- **PostgreSQL / TimescaleDB Mode:**
  - Relational schema defined in `app/data/migrations/001_phase5_data_plane.sql`.
  - Tables: `sentra_observations`, `sentra_data_quality_reports`, `sentra_feature_snapshots`, `sentra_incident_predictions`, `sentra_models`, `sentra_shadow_divergence_logs`, `sentra_drift_reports`, `sentra_idempotency_keys`.
  - Multi-tenant indexing on `(tenant_id, incident_id, timestamp)`.
- **Atomic Persistent Fallback Engine:**
  - Thread-safe repository in `app/data/storage.py` backed by re-entrant locks (`threading.RLock`).
  - Writes are committed via atomic temporary files (`.tmp` $\to$ `.replace()`) with continuous SHA-256 digest validation to prevent write corruption during unexpected server restarts.

---

## 4. Real-Time Data Quality Engine
- **Quality Scoring ($0.0 - 1.0$):**
  - **Staleness Penalty:** Evaluates stream lag against 60-second threshold.
  - **Coverage Ratio:** Compares active sensor modalities against expected facility baselines.
  - **Physical Breach Detection:** Flags impossible physical measurements.
  - **Cross-Modal Discrepancy Auditing:** Audits conflicting sensor reports (e.g. extreme thermal plume $>80^\circ\text{C}$ with zero smoke aerosol reported by co-located AirIQ units).
- **Inference Gate:**
  - Datasets with overall quality $<0.50$ or excessive stale readings automatically trigger the `HEURISTIC_FALLBACK` state in the prediction engine.

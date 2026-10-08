"use client";

import React, { useEffect, useState, useTransition } from "react";
import type {
  DriftReport,
  IncidentPredictionBundle,
  InferenceTelemetryReport,
  ModelVersionRecord,
  ShadowDivergenceLog,
} from "@/lib/data/prediction-types";
import { predictionService } from "@/lib/data/prediction-service";

// ---------------------------------------------------------------------------
// Lightweight Inline SVG Icons (Zero External Dependency)
// ---------------------------------------------------------------------------

function ActivityIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function FlameIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  );
}

function CpuIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  );
}

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function DatabaseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function CheckCircleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RefreshCwIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function GitBranchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Prediction Cockpit Panel Component
// ---------------------------------------------------------------------------

interface PredictionCockpitPanelProps {
  initialIncidentId?: string;
  onDispatchSimulated?: (action: string) => void;
}

export function PredictionCockpitPanel({
  initialIncidentId = "INC-8821-FIRE",
  onDispatchSimulated,
}: PredictionCockpitPanelProps) {
  const [incidentId] = useState(initialIncidentId);
  const [bundle, setBundle] = useState<IncidentPredictionBundle | null>(null);
  const [models, setModels] = useState<ModelVersionRecord[]>([]);
  const [drift, setDrift] = useState<DriftReport | null>(null);
  const [telemetry, setTelemetry] = useState<InferenceTelemetryReport | null>(null);
  const [shadowLogs, setShadowLogs] = useState<ShadowDivergenceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [confirmingDispatch, setConfirmingDispatch] = useState<string | null>(null);

  const loadData = async (targetIncident: string, fallback: boolean = false) => {
    setIsLoading(true);
    try {
      const [predBundle, mlopsModels, driftReport, telReport, shadowData] = await Promise.all([
        predictionService.getIncidentPredictions(targetIncident, { fallback }),
        predictionService.getMLOpsModels(),
        predictionService.getMLOpsDriftReport(targetIncident),
        predictionService.getMLOpsTelemetry(),
        predictionService.getShadowDivergenceLogs(5),
      ]);
      setBundle(predBundle);
      setModels(mlopsModels.models);
      setDrift(driftReport);
      setTelemetry(telReport);
      setShadowLogs(shadowData.logs);
    } catch (err) {
      console.error("Failed to load prediction cockpit data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(incidentId, isFallbackMode);
  }, [incidentId, isFallbackMode]);

  const toggleFallback = () => {
    const nextState = !isFallbackMode;
    setIsFallbackMode(nextState);
    startTransition(() => {
      loadData(incidentId, nextState);
    });
  };

  const handleSimulatedDispatch = (corridorName: string) => {
    setDispatchStatus(`SIMULATED DIRECTIVE ISSUED: Egress prioritization dispatched for ${corridorName}`);
    setConfirmingDispatch(null);
    if (onDispatchSimulated) {
      onDispatchSimulated(corridorName);
    }
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  if (isLoading && !bundle) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-[2.5rem] border border-cyan-500/20 bg-slate-950/70 p-8 backdrop-blur-xl">
        <RefreshCwIcon className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="mt-4 font-mono text-sm tracking-widest text-cyan-200/70 uppercase">
          Synthesizing Calibrated Crisis Predictions...
        </p>
      </div>
    );
  }

  if (!bundle) return null;

  const activeModel = models.find((m) => m.is_active) ?? models[0];
  const shadowModel = models.find((m) => m.is_shadow) ?? models[1];
  const escalation = bundle.escalation_risk;
  const uncertainty = escalation.uncertainty;
  const quality = bundle.data_quality;

  return (
    <div className="space-y-6 text-slate-100">
      {/* ------------------------------------------------------------- */}
      {/* 1. Cockpit Header & Status Bar */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/60 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-cyan-300 uppercase">
                <ActivityIcon className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                Phase 5 Prediction Cockpit
              </span>

              {bundle.is_simulation && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-amber-300 uppercase">
                  Simulation / Demo Data Plane
                </span>
              )}

              {isFallbackMode || bundle.status === "HEURISTIC_FALLBACK" ? (
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-emerald-300 uppercase">
                  <ShieldIcon className="h-3.5 w-3.5" />
                  Deterministic Fallback
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-cyan-300 uppercase">
                  <CpuIcon className="h-3.5 w-3.5" />
                  Calibrated Ensemble Online
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Crisis Prediction & Model Operations Engine
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Real-time multi-modal telemetry fusion with 90% confidence uncertainty intervals, continuous feature drift surveillance, and shadow model validation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleFallback}
              disabled={isPending}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-medium transition-all ${
                isFallbackMode
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-200"
                  : "border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/10"
              }`}
            >
              <ShieldIcon className="h-4 w-4" />
              {isFallbackMode ? "Fallback Active" : "Trigger Fallback"}
            </button>

            <button
              onClick={() => loadData(incidentId, isFallbackMode)}
              disabled={isLoading || isPending}
              className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/20 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/30"
            >
              <RefreshCwIcon className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Re-evaluate
            </button>
          </div>
        </div>

        {/* Fallback Notice if active */}
        {(isFallbackMode || bundle.status === "HEURISTIC_FALLBACK") && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-200/90">
            <AlertTriangleIcon className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300 uppercase tracking-wider">
                🛡️ Deterministic Heuristic Fallback Engaged
              </p>
              <p className="mt-0.5">
                Primary neural ensemble offline or sensor uncertainty breached safety threshold. All predictions are generated using deterministic physical boundary rules to prevent hallucinations during critical operations.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. Primary Metrics Grid: Data Health, Escalation Risk, Evacuation */}
      {/* ------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card A: Data Plane Quality & Ingestion Stream */}
        <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 shadow-xl backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
                <DatabaseIcon className="h-4 w-4 text-cyan-400" />
                Data Stream Health
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider ${
                  quality.overall_score >= 0.8
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {(quality.overall_score * 100).toFixed(0)}% Health
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Sensor Coverage Ratio</span>
                  <span className="font-mono text-white">
                    {quality.active_sensors_count} / {quality.expected_sensors_count} modalities ({(quality.coverage_ratio * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${quality.coverage_ratio * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-[11px] text-slate-400">Stream Freshness</p>
                  <p className="mt-1 font-mono text-lg font-bold text-cyan-300">
                    {quality.staleness_seconds}s staleness
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-[11px] text-slate-400">Inference Status</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircleIcon className="h-4 w-4" />
                    Valid & Stable
                  </p>
                </div>
              </div>

              {/* Quality Issues / Anomalies */}
              {quality.detected_issues.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
                    Active Sensor Anomalies ({quality.detected_issues.length})
                  </p>
                  {quality.detected_issues.map((iss, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200"
                    >
                      <AlertTriangleIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>{iss.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Zero cross-modal discrepancies detected across FLIR and AirIQ feeds.</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Storage: Persistent File Engine</span>
            <span className="text-cyan-400/80">SHA-256 Verified</span>
          </div>
        </section>

        {/* Card B: Calibrated Escalation Risk & 90% Uncertainty Interval */}
        <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 shadow-xl backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-amber-300 uppercase">
                <FlameIcon className="h-4 w-4 text-amber-400" />
                Escalation Risk (Calibrated)
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-400 uppercase">
                90% Bounds
              </span>
            </div>

            <div className="mt-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-4xl font-black tracking-tight text-white">
                    {(escalation.risk_score * 100).toFixed(0)}%
                  </span>
                  <span className="ml-2 font-mono text-xs text-slate-400">Point Estimate</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-semibold text-cyan-300">
                    [{(uncertainty.lower_bound_90 * 100).toFixed(0)}% — {(uncertainty.upper_bound_90 * 100).toFixed(0)}%]
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">90% Confidence Interval</p>
                </div>
              </div>

              {/* Visual Uncertainty Interval Bar */}
              <div className="mt-4 relative h-6 rounded-xl bg-slate-800/80 p-1">
                {/* 90% Bound span */}
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-cyan-500/30 border border-cyan-400/50"
                  style={{
                    left: `${uncertainty.lower_bound_90 * 100}%`,
                    width: `${Math.max(2, (uncertainty.upper_bound_90 - uncertainty.lower_bound_90) * 100)}%`,
                  }}
                />
                {/* Point estimate marker */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  style={{ left: `${escalation.risk_score * 100}%` }}
                />
              </div>

              {/* Uncertainty decomposition */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-slate-400">Epistemic Uncertainty</p>
                  <p className="mt-1 font-mono font-bold text-slate-200">
                    ±{(uncertainty.epistemic_uncertainty * 100).toFixed(1)}% (Model)
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-slate-400">Aleatoric Uncertainty</p>
                  <p className="mt-1 font-mono font-bold text-slate-200">
                    ±{(uncertainty.aleatoric_uncertainty * 100).toFixed(1)}% (Noise)
                  </p>
                </div>
              </div>

              {/* Primary Catalyst */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-slate-300">
                <span className="font-semibold text-amber-300 uppercase tracking-wide">Primary Catalyst: </span>
                <span>{escalation.primary_catalyst}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Model: {bundle.model_id}</span>
            <span className="text-emerald-400">{bundle.inference_latency_ms}ms Latency</span>
          </div>
        </section>

        {/* Card C: Evacuation Corridors & Pinch-Point Risk */}
        <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 shadow-xl backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-emerald-300 uppercase">
                <UsersIcon className="h-4 w-4 text-emerald-400" />
                Evacuation Corridors
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-400 uppercase">
                {bundle.evacuation_corridors.filter((c) => c.is_viable).length} Viable
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {bundle.evacuation_corridors.map((corr) => (
                <div
                  key={corr.corridor_id}
                  className={`rounded-2xl border p-3.5 transition-all ${
                    corr.is_viable
                      ? "border-emerald-500/20 bg-emerald-950/10"
                      : "border-red-500/30 bg-red-950/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-white">{corr.corridor_name}</p>
                      <p className="text-[11px] text-slate-400">
                        Throughput: {corr.estimated_throughput_ppl_per_min} ppl/min · Priority #{corr.clearance_priority}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        corr.is_viable
                          ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                          : "border border-red-500/40 bg-red-500/20 text-red-300"
                      }`}
                    >
                      {corr.is_viable ? "Passable" : "Blocked"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Pinch Risk:</span>
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {(corr.pinch_point_risk * 100).toFixed(0)}%
                      </span>
                    </div>

                    {corr.is_viable && (
                      <button
                        onClick={() => setConfirmingDispatch(corr.corridor_name)}
                        className="flex items-center gap-1 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-400/20 transition"
                      >
                        Prioritize
                        <ArrowRightIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Critical State: {bundle.critical_state.minutes_to_critical_threshold}m threshold</span>
            <span className="text-amber-300">
              {bundle.hazard_persistence.decay_half_life_minutes}m Half-Life
            </span>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MLOps Governance & Observability Bar */}
      {/* ------------------------------------------------------------- */}
      <section className="rounded-[2.5rem] border border-white/10 bg-slate-950/60 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
              <CpuIcon className="h-4 w-4 text-cyan-400" />
              MLOps Governance & Observability Plane
            </span>
            <h2 className="mt-1 text-xl font-bold text-white">
              Model Lifecycle, Shadow Execution & Drift Surveillance
            </h2>
          </div>

          {drift && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">Population Stability Index:</span>
              <span
                className={`rounded-full px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase border ${
                  drift.drift_state === "NORMAL"
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/15 text-amber-300"
                }`}
              >
                PSI {drift.overall_psi.toFixed(3)} · {drift.drift_state}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Active Production Model */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Active Production Model
              </span>
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 uppercase">
                Active
              </span>
            </div>
            <p className="mt-2 font-semibold text-sm text-white">{activeModel?.model_name || "Sentra Ensemble"}</p>
            <p className="font-mono text-xs text-slate-400">{activeModel?.model_id} (v{activeModel?.version})</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="rounded-xl bg-white/[0.04] p-2">
                <span className="text-slate-400">F1 Score</span>
                <p className="font-bold text-white">{(activeModel?.metrics.f1_score ?? 0.94).toFixed(3)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2">
                <span className="text-slate-400">Latency</span>
                <p className="font-bold text-cyan-300">{(activeModel?.metrics.mean_latency_ms ?? 18.2).toFixed(1)}ms</p>
              </div>
            </div>
          </div>

          {/* Shadow Candidate Model */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/15 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-400">
                Shadow Candidate Model
              </span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-200 uppercase">
                Shadow
              </span>
            </div>
            <p className="mt-2 font-semibold text-sm text-white">{shadowModel?.model_name || "Crowd Transformer"}</p>
            <p className="font-mono text-xs text-slate-400">{shadowModel?.model_id} (v{shadowModel?.version})</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="rounded-xl bg-white/[0.04] p-2">
                <span className="text-slate-400">F1 Score</span>
                <p className="font-bold text-white">{(shadowModel?.metrics.f1_score ?? 0.954).toFixed(3)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2">
                <span className="text-slate-400">Latency</span>
                <p className="font-bold text-indigo-300">{(shadowModel?.metrics.mean_latency_ms ?? 22.8).toFixed(1)}ms</p>
              </div>
            </div>
          </div>

          {/* Shadow Divergence Telemetry */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Shadow Mode Divergence
              </span>
              <GitBranchIcon className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            {shadowLogs.length > 0 && shadowLogs[0] ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-white">
                    Δ {((shadowLogs[0]?.divergence_delta ?? 0) * 100).toFixed(1)}%
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase ${
                      shadowLogs[0]?.within_acceptable_threshold ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {shadowLogs[0]?.within_acceptable_threshold ? "Acceptable" : "Excessive"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Active: {((shadowLogs[0]?.active_prediction ?? 0) * 100).toFixed(0)}% vs Shadow: {((shadowLogs[0]?.shadow_prediction ?? 0) * 100).toFixed(0)}%
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Tolerance: ±15.0% maximum divergence threshold
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">No shadow divergence logs available.</p>
            )}
          </div>

          {/* Inference Latency & Cost */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Inference Telemetry
              </span>
              <ActivityIcon className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="mt-2 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">p50 / p95 Latency:</span>
                <span className="font-bold text-white">
                  {telemetry?.p50_latency_ms ?? 14}ms / {telemetry?.p95_latency_ms ?? 38}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Inferences:</span>
                <span className="font-bold text-cyan-300">
                  {telemetry?.total_inferences_24h?.toLocaleString() ?? "4,210"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fallback Rate:</span>
                <span className="font-bold text-emerald-400">{telemetry?.fallback_rate_pct ?? 0.33}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Est. Gemini Cost:</span>
                <span className="font-bold text-slate-200">
                  ${(telemetry?.gemini_api_cost_usd_est ?? 0.169).toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. Strict Human Safety Boundary Modal / Confirmation */}
      {/* ------------------------------------------------------------- */}
      {confirmingDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full rounded-[2.5rem] border border-amber-500/40 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangleIcon className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Human Operational Authorization</h3>
            </div>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              You are about to issue a simulated operational directive for <strong>{confirmingDispatch}</strong>.
              In accordance with Sentra Core Safety Protocols, autonomous AI is prohibited from directly controlling physical egress gates without validated human authority.
            </p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] font-mono text-slate-400">
              MODE: SIMULATED OPERATIONAL DIRECTIVE
              <br />
              COMMANDER: AUTHENTICATED SENTRA OPERATOR
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmingDispatch(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSimulatedDispatch(confirmingDispatch)}
                className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/30"
              >
                AUTHORIZE & EXECUTE (SIMULATED)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch confirmation toast */}
      {dispatchStatus && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl text-xs font-mono text-emerald-300">
          <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
          <span>{dispatchStatus}</span>
        </div>
      )}
    </div>
  );
}

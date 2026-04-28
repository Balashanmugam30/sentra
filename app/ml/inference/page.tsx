"use client";

import type { Route } from "next";
import Link from "next/link";

import { ConfidenceGrid } from "@/components/ml/confidence-grid";
import { DriftRadar } from "@/components/ml/drift-radar";
import { ExplainFeed } from "@/components/ml/explain-feed";
import { LatencyChart } from "@/components/ml/latency-chart";
import { LivePredictions } from "@/components/ml/live-predictions";
import { ModelHealth } from "@/components/ml/model-health";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMLOps } from "@/lib/mlops/use-mlops";

export default function MLInferencePage() {
  const { summary, liveModels, drift, monitoring, loading, error, busyAction, lastAction, refresh, predict, rollback } = useMLOps();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,_rgba(34,211,238,0.22),_transparent_34%),radial-gradient(circle_at_90%_6%,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">MLOps Production Layer</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Live AI Inference Center</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Production models now score live crisis, behavior, operations, growth, and revenue signals with explainability, SLA monitoring, drift warnings, and rollback readiness.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => predict("hotel_fire_floor3")} disabled={busyAction === "predict"} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60">
                  {busyAction === "predict" ? "Scoring..." : "Run live prediction"}
                </button>
                <button type="button" onClick={() => rollback("MLOPS-PANIC-V2")} disabled={busyAction === "rollback"} className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/20 disabled:opacity-60">
                  Rollback canary
                </button>
                <Link href={"/ml/deployments" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Deployments
                </Link>
                <Link href={"/ml/monitoring" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Monitoring
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Production", summary.active_production_models.toString()],
                ["Pred/min", summary.predictions_per_minute.toString()],
                ["Latency", `${summary.avg_inference_latency}ms`],
                ["Confidence", `${summary.avg_confidence}%`],
                ["SLA", `${summary.sla_health}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}
          {lastAction ? <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{lastAction}</div> : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <LivePredictions predictions={summary.top_risk_alerts} />
            <ConfidenceGrid items={summary.confidence_heatmap} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ExplainFeed logs={summary.explainability_feed} />
            <DriftRadar drift={drift} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <LatencyChart monitoring={monitoring} />
            <ModelHealth models={liveModels} />
          </section>

          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => refresh()} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
              {loading ? "Syncing..." : "Refresh inference state"}
            </button>
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

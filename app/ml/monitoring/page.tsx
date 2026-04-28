"use client";

import type { Route } from "next";
import Link from "next/link";

import { ConfidenceGrid } from "@/components/ml/confidence-grid";
import { DriftRadar } from "@/components/ml/drift-radar";
import { LatencyChart } from "@/components/ml/latency-chart";
import { ModelHealth } from "@/components/ml/model-health";
import { RetrainCenter } from "@/components/ml/retrain-center";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMLOps } from "@/lib/mlops/use-mlops";

export default function MLMonitoringPage() {
  const { summary, liveModels, drift, monitoring, loading, error, busyAction, lastAction, refresh, retrain } = useMLOps();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(251,191,36,0.17),_transparent_30%),radial-gradient(circle_at_88%_8%,_rgba(34,211,238,0.18),_transparent_32%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">AI Health Center</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">MLOps Monitoring</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Monitor accuracy decay, drift, latency, class imbalance, prediction quality, and automatic retraining triggers across every live Sentra model domain.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh health"}
                </button>
                <Link href={"/ml/inference" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Inference
                </Link>
                <Link href={"/ml/deployments" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Deployments
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Quality", `${monitoring.prediction_quality}%`],
                ["High drift", summary.high_drift_warnings.toString()],
                ["Warnings", summary.drift_warnings.toString()],
                ["SLA", `${summary.sla_health}%`],
                ["Error rate", `${summary.error_rate}%`],
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <RetrainCenter monitoring={monitoring} busy={busyAction === "retrain"} onRetrain={retrain} />
            <DriftRadar drift={drift} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <LatencyChart monitoring={monitoring} />
            <ConfidenceGrid items={summary.confidence_heatmap} />
          </section>

          <section className="mt-6">
            <ModelHealth models={liveModels} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}


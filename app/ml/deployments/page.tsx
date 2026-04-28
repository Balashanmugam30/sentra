"use client";

import type { Route } from "next";
import Link from "next/link";

import { CanaryPanel } from "@/components/ml/canary-panel";
import { DeploymentBoard } from "@/components/ml/deployment-board";
import { ExplainFeed } from "@/components/ml/explain-feed";
import { ModelHealth } from "@/components/ml/model-health";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMLOps } from "@/lib/mlops/use-mlops";

export default function MLDeploymentsPage() {
  const { summary, liveModels, deployments, loading, error, busyAction, lastAction, refresh, promote, canary, rollback } = useMLOps();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_4%,_rgba(34,211,238,0.2),_transparent_32%),radial-gradient(circle_at_86%_0%,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">MLOps Release Center</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Model Deployment Pipeline</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Promote, canary, shadow test, and roll back AI models with governed release health, approval state, and production safety controls.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh releases"}
                </button>
                <Link href={"/ml/inference" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Inference
                </Link>
                <Link href={"/ml/monitoring" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Monitoring
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Models", summary.active_models.toString()],
                ["Rollback ready", summary.rollback_ready_models.toString()],
                ["Drift warnings", summary.drift_warnings.toString()],
                ["Failed", summary.failed_predictions.toString()],
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
            <DeploymentBoard deployments={deployments} busy={Boolean(busyAction)} onPromote={promote} onRollback={rollback} />
            <CanaryPanel deployments={deployments} busy={Boolean(busyAction)} onCanary={canary} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <ModelHealth models={liveModels} />
            <ExplainFeed logs={summary.explainability_feed} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}


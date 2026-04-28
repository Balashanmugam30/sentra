"use client";

import type { Route } from "next";
import Link from "next/link";

import { ExperimentBoard } from "@/components/ml/experiment-board";
import { FeatureHealth } from "@/components/ml/feature-health";
import { GPUMeter } from "@/components/ml/gpu-meter";
import { ModelLeaderboard } from "@/components/ml/model-leaderboard";
import { TrainPanel } from "@/components/ml/train-panel";
import { TrainingQueue } from "@/components/ml/training-queue";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useML } from "@/lib/ml/use-ml";

export default function MLLabPage() {
  const { summary, features, jobs, experiments, models, loading, error, busyAction, lastAction, refresh, train, uploadDataset } = useML();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(34,211,238,0.2),_transparent_32%),radial-gradient(circle_at_88%_10%,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Machine Learning Lab</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Machine Learning Command Lab</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Dataset ingestion, feature health, training jobs, experiment tracking, model registry, and AI readiness in one enterprise ML foundation layer.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh lab"}
                </button>
                <Link href={"/ml/data" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Data Ops
                </Link>
                <Link href={"/ml/registry" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Registry
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Datasets", summary.active_datasets.toString()],
                ["Rows", summary.total_rows.toLocaleString()],
                ["Jobs", summary.training_jobs.toString()],
                ["Experiments", summary.experiment_runs.toString()],
                ["Production", summary.production_models.toString()],
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
            <TrainPanel busy={busyAction === "train" || busyAction === "upload"} onTrain={train} onUpload={uploadDataset} />
            <GPUMeter summary={summary} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <TrainingQueue jobs={jobs} />
            <FeatureHealth features={features} />
          </section>

          <section className="mt-6">
            <ModelLeaderboard models={models} />
          </section>

          <section className="mt-6">
            <ExperimentBoard experiments={experiments} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

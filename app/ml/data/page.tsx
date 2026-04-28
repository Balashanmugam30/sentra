"use client";

import type { Route } from "next";
import Link from "next/link";

import { DataQuality } from "@/components/ml/data-quality";
import { DatasetTable } from "@/components/ml/dataset-table";
import { FeatureHealth } from "@/components/ml/feature-health";
import { TrainPanel } from "@/components/ml/train-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useML } from "@/lib/ml/use-ml";

export default function MLDataPage() {
  const { summary, datasets, features, loading, error, busyAction, lastAction, refresh, uploadDataset, train } = useML();
  const incidentRows = datasets.filter((dataset) => dataset.domain === "incidents").reduce((sum, dataset) => sum + dataset.rows, 0);
  const behaviorRows = datasets.filter((dataset) => dataset.domain === "behavior" || dataset.domain === "outcomes").reduce((sum, dataset) => sum + dataset.rows, 0);
  const sensorRows = datasets.filter((dataset) => dataset.domain === "sensor telemetry").reduce((sum, dataset) => sum + dataset.rows, 0);
  const revenueRows = datasets.filter((dataset) => dataset.domain === "revenue").reduce((sum, dataset) => sum + dataset.rows, 0);

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_88%_10%,_rgba(245,158,11,0.14),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Data operations center</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Training Data Warehouse</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Incident data, sensor streams, behavior outcomes, revenue signals, labels, missing fields, freshness, and connectors for trainable Sentra intelligence.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh data"}
                </button>
                <Link href={"/ml/lab" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  ML Lab
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Incidents", incidentRows.toLocaleString()],
                ["Sensors", sensorRows.toLocaleString()],
                ["Behavior", behaviorRows.toLocaleString()],
                ["Revenue", revenueRows.toLocaleString()],
                ["Quality", `${summary.avg_quality_score}%`],
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <DataQuality datasets={datasets} />
            <TrainPanel busy={busyAction === "upload" || busyAction === "train"} onTrain={train} onUpload={uploadDataset} />
          </section>

          <section className="mt-6">
            <DatasetTable datasets={datasets} />
          </section>

          <section className="mt-6">
            <FeatureHealth features={features} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

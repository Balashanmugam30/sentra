"use client";

import { DataMonetization } from "@/components/data/data-monetization";
import { PipelineBoard } from "@/components/data/pipeline-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useDataHub } from "@/lib/data/use-data";

export default function DataPlatformPage() {
  const { summary, pipelines, loading, error, busyAction, lastAction, refresh, runPipeline } = useDataHub();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(59,130,246,0.17),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.13),transparent_32%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100/65">Data Platform</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">Sentra proprietary intelligence moat</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Ingestion, ETL, schema validation, masking, freshness, lineage, dead-letter queues, replay pipelines, and tenant-scoped intelligence products.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href="/data/graph">Knowledge graph</a>
                <button className="rounded-2xl bg-blue-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">
                  {loading ? "Refreshing" : "Refresh data"}
                </button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>
          <section className="grid gap-4 md:grid-cols-5">
            <Kpi label="Moat Score" value={summary.data_moat_score} />
            <Kpi label="Pipelines" value={summary.pipeline_count} />
            <Kpi label="Quality" value={`${summary.avg_quality}%`} />
            <Kpi label="Freshness" value={`${summary.avg_freshness_minutes}m`} />
            <Kpi label="Dead Letters" value={summary.dead_letters} />
          </section>
          <PipelineBoard pipelines={pipelines} busyAction={busyAction} onRun={(pipelineId) => void runPipeline(pipelineId)} />
          <DataMonetization products={summary.intelligence_products} monetizationArr={summary.monetization_arr} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-3 font-mono text-3xl text-white">{value}</p>
    </div>
  );
}

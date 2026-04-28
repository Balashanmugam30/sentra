import type { DataHubPipelines } from "@/lib/data/types";

export function PipelineBoard({ pipelines, busyAction, onRun }: { pipelines: DataHubPipelines; busyAction: string | null; onRun: (pipelineId: string) => void }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Data Empire</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Tenant-isolated ingestion pipelines</h2>
        </div>
        <p className="text-sm text-white/50">{pipelines.masking_enabled} pipelines masking sensitive fields before feature-store publish.</p>
      </div>
      <div className="mt-6 grid gap-4">
        {pipelines.pipelines.map((pipeline) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={pipeline.pipeline_id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{pipeline.source} {"->"} {pipeline.destination}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{pipeline.name}</h3>
              </div>
              <button className="rounded-2xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={() => onRun(pipeline.pipeline_id)} type="button">
                Run replay
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              <Metric label="Rows today" value={pipeline.rows_today.toLocaleString()} />
              <Metric label="Quality" value={`${pipeline.quality_score}%`} />
              <Metric label="Freshness" value={`${pipeline.freshness_minutes}m`} />
              <Metric label="Privacy" value={pipeline.privacy_tier} />
              <Metric label="Dead letters" value={pipeline.dead_letters} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 font-mono text-lg text-white">{value}</p>
    </div>
  );
}

"use client";

import { formatMoney } from "@/lib/channel/runtime";
import type { ChannelPipelineState } from "@/lib/channel/types";

export function RegionalPipeline({ pipeline, busyAction, onAdvance }: { pipeline: ChannelPipelineState; busyAction: string | null; onAdvance: (pipelineId: string) => void }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Regional pipeline</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Weighted ARR forecast</h2>
        </div>
        <p className="font-mono text-2xl text-white">{formatMoney(pipeline.weighted_forecast)}</p>
      </div>
      <div className="mt-5 space-y-3">
        {pipeline.pipeline.map((opportunity) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-4" key={opportunity.pipeline_id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-white">{opportunity.country} · {opportunity.segment}</h3>
                <p className="mt-1 text-sm text-white/50">{opportunity.stage} · {opportunity.next_step}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg text-cyan-100">{formatMoney(opportunity.weighted_arr)}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">{opportunity.probability}%</span>
                <button className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50" disabled={busyAction === `pipeline-${opportunity.pipeline_id}`} onClick={() => onAdvance(opportunity.pipeline_id)} type="button">
                  Advance
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function NegotiationTablePanel() {
  const { negotiation } = useAutonomousAI();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,22,0.78)] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
            AI-vs-AI Negotiation Table
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Demands, concessions, and winning compromise
          </h2>
        </div>
        <div className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50">
          Score {negotiation?.negotiation_score ?? 0}%
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-white">Winning compromise</p>
        <p className="mt-2 text-sm leading-6 text-white/62">
          {negotiation?.winning_compromise ?? "Negotiation compromise is syncing."}
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {(negotiation?.demands ?? []).map((demand) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={demand.agent}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">{demand.agent}</h3>
              <span className="rounded-full border border-amber-200/18 bg-amber-200/8 px-3 py-1 text-xs text-amber-50">
                Priority {demand.priority}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/62">Demand: {demand.demand}</p>
            <p className="mt-2 text-sm leading-6 text-cyan-50/72">Concession: {demand.concession}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function ResourceRebalancerPanel() {
  const { resources } = useAutonomousAI();

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.76)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
            Live Resource Rebalancer
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Allocation map for responders, drones, medical, and perimeter resources
          </h2>
        </div>
        <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50">
          Reserve {resources?.reserve_readiness ?? 0}%
        </span>
      </div>
      <p className="mt-4 text-sm text-white/58">{resources?.recommended_shift}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(resources?.allocations ?? []).map((allocation) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={allocation.resource}>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/42">
              {allocation.resource.replaceAll("_", " ")}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {allocation.zone} × {allocation.assigned}
            </h3>
            <p className="mt-2 text-sm text-white/58">ETA {allocation.eta_minutes}m · reserve {allocation.reserve}%</p>
            <p className="mt-3 text-xs leading-5 text-white/46">{allocation.rationale}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


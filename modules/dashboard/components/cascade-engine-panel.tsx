"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function CascadeEnginePanel() {
  const { busyAction, cascade, testCascade } = useAutonomousAI();

  return (
    <section className="rounded-[30px] border border-orange-100/14 bg-[rgba(10,10,18,0.8)] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-orange-100/62">
            Cascading Crisis Chain Engine
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Simulating second-order effects before they compound
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            {cascade?.summary ?? "Cascade chain is syncing from current threat and forecast horizons."}
          </p>
        </div>
        <button
          className="rounded-full border border-orange-200/24 bg-orange-200/10 px-4 py-2 text-sm font-semibold text-orange-50 transition hover:bg-orange-200/16 disabled:opacity-55"
          disabled={busyAction === "test-cascade"}
          onClick={() => {
            void testCascade("fire_corridor_blocked");
          }}
          type="button"
        >
          {busyAction === "test-cascade" ? "Simulating..." : "Test Cascade"}
        </button>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/22 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-white">Best interruption node</p>
          <span className="rounded-full border border-cyan-200/18 bg-cyan-200/8 px-3 py-1 text-xs text-cyan-50">
            Risk {cascade?.cascade_risk_score ?? 0}%
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-white/62">
          {cascade?.best_interruption_node ?? "Waiting for cascade interruption analysis."}
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {(cascade?.chain_nodes ?? []).map((node) => (
          <div className="grid gap-3 rounded-[22px] border border-white/10 bg-white/[0.045] p-4 md:grid-cols-[auto_1fr_auto]" key={node.node_id}>
            <span className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/58">
              {node.stage}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{node.label}</p>
              <p className="mt-1 text-xs text-white/46">{node.time_window}</p>
            </div>
            <div className="text-right text-sm font-semibold text-orange-50">{node.probability}%</div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useGrowth } from "@/lib/growth/use-growth";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function GlobalCommandCenter() {
  const { live, loading, refresh, runSimulation, busyAction } = useGrowth();

  return (
    <section className="rounded-[32px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(4,10,24,0.95),rgba(34,211,238,0.08),rgba(245,158,11,0.07))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/58">Global GTM Operating System</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white">
            {money.format(live?.pipeline_arr ?? 18_400_000)} pipeline across {live?.countries_live ?? 10} countries
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            Country launches, enterprise procurement, government contracts, channel distribution, white-label rollout, and expansion AI in one IPO-scale command layer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50" onClick={() => void refresh()} type="button">
            {loading ? "Syncing..." : "Refresh"}
          </button>
          <button className="rounded-full border border-amber-200/24 bg-amber-200/12 px-4 py-2 text-sm font-semibold text-amber-50 disabled:opacity-50" disabled={busyAction === "simulation"} onClick={() => void runSimulation()} type="button">
            {busyAction === "simulation" ? "Simulating..." : "Run Simulation"}
          </button>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ["Regions", `${live?.regions_active ?? 7}`, "active"],
          ["Gov Deals", `${live?.open_government_deals ?? 9}`, "open"],
          ["Partners", `${live?.partners_active ?? 27}`, "active"],
          ["Score", `${live?.expansion_score ?? 91}`, "dominance"],
        ].map(([label, value, note]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-cyan-50/56">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


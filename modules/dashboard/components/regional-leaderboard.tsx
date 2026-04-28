"use client";

import { useGrowth } from "@/lib/growth/use-growth";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function RegionalLeaderboard() {
  const { regions } = useGrowth();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Regional Leaderboard</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Active regions ranked by pipeline</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {regions.slice(0, 8).map((region, index) => (
          <article className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${region.region_id}-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{region.name}</p>
                <p className="mt-1 text-xs text-white/45">{region.regional_hq} - {region.owner}</p>
              </div>
              <span className="text-sm font-semibold text-cyan-50">{money.format(region.pipeline_arr)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

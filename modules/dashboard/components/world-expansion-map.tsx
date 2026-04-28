"use client";

import { useGrowth } from "@/lib/growth/use-growth";

const statusClass: Record<string, string> = {
  launched: "border-cyan-200/30 bg-cyan-200/14 text-cyan-50",
  pilot: "border-sky-200/24 bg-sky-200/12 text-sky-50",
  pipeline: "border-amber-200/24 bg-amber-200/12 text-amber-50",
  blocked: "border-orange-300/24 bg-orange-300/12 text-orange-50",
};

export function WorldExpansionMap() {
  const { countries } = useGrowth();

  return (
    <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.14),transparent_34%),rgba(5,10,20,0.82)] p-5 shadow-[0_20px_65px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">World Expansion Map</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Launched, pilot, pipeline, and blocked markets</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {countries.slice(0, 10).map((country, index) => (
          <article className={`rounded-[22px] border p-4 ${statusClass[country.status] ?? statusClass.pipeline}`} key={`${country.country_id}-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">{country.name}</h3>
              <span className="text-xs uppercase tracking-[0.16em]">{country.status}</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-cyan-200/80" style={{ width: `${country.deployment_readiness}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/55">Readiness {country.deployment_readiness} / Market {country.market_score}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


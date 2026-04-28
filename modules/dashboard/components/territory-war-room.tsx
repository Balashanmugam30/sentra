"use client";

import { useGrowth } from "@/lib/growth/use-growth";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function TerritoryWarRoom() {
  const { territories } = useGrowth();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Territory War Room</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Highest-potential global territories</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {territories.slice(0, 6).map((territory, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${territory.territory_id}-${index}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{territory.name}</h3>
                <p className="mt-1 text-xs text-white/45">{territory.vertical_focus} - {territory.cities}</p>
              </div>
              <span className="rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">{territory.score}</span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-cyan-50">{money.format(territory.ARR_potential)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


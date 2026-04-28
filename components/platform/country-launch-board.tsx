"use client";

import type { CountriesState } from "@/lib/channel/types";

export function CountryLaunchBoard({ countries }: { countries: CountriesState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Launch queue</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Next country plays</h2>
      <div className="mt-5 space-y-3">
        {countries.next_launch.map((country) => (
          <div className="rounded-3xl border border-white/10 bg-black/25 p-4" key={country.country_id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{country.name}</h3>
                <p className="mt-1 text-sm text-white/50">{country.next_action}</p>
              </div>
              <span className="font-mono text-2xl text-emerald-200">{country.readiness_score}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


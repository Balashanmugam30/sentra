"use client";

import { channelTone } from "@/lib/channel/runtime";
import type { ChannelSummary, CountriesState } from "@/lib/channel/types";

export function ChannelMap({ countries, summary, busyAction, onLaunch }: { countries: CountriesState; summary: ChannelSummary; busyAction: string | null; onLaunch: (country: string) => void }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.14),transparent_36%),rgba(255,255,255,0.045)] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Global control</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Country launch command map</h2>
        </div>
        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          Next best: {summary.next_best_country}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {countries.countries.map((country) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-4" key={country.country_id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{country.name}</h3>
                <p className="text-sm text-white/45">{country.region} · {country.status}</p>
              </div>
              <span className={`font-mono text-3xl ${channelTone(country.readiness_score)}`}>{country.readiness_score}</span>
            </div>
            <div className="mt-4 space-y-2">
              <Bar label="Legal" value={100 - country.legal_complexity} />
              <Bar label="Pricing" value={country.pricing_fit} />
              <Bar label="Partners" value={country.partner_coverage} />
            </div>
            <p className="mt-4 min-h-10 text-sm text-white/50">{country.next_action}</p>
            <button className="mt-4 rounded-2xl border border-cyan-200/25 bg-cyan-200/10 px-3 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-50" disabled={busyAction === `launch-${country.name}`} onClick={() => onLaunch(country.name)} type="button">
              Launch country
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-white/45">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyan-200" style={{ width: `${Math.max(5, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}


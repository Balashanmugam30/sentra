import type { SiteGlobal } from "@/lib/site/types";

export function GlobalMap({ global }: { global: SiteGlobal }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative min-h-[430px] overflow-hidden rounded-[36px] border border-white/10 bg-[#061019] p-6">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.07)_1px,transparent_1px),linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:54px_54px]" />
        {global.presence.map((city, index) => (
          <div
            className="absolute rounded-full border border-cyan-100/30 bg-cyan-100/15 p-2 shadow-[0_0_42px_rgba(34,211,238,0.32)]"
            key={city.city}
            style={{ left: `${12 + ((index * 13) % 70)}%`, top: `${18 + ((index * 17) % 58)}%` }}
            title={`${city.city}, ${city.country}`}
          >
            <span className="block size-3 rounded-full bg-cyan-100" />
          </div>
        ))}
        <div className="absolute inset-x-6 bottom-6 rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">Expansion radar</p>
          <p className="mt-2 text-sm text-white/58">Seeded global presence across {global.countries_supported} countries, {global.cities_modeled} cities, and {global.facilities_protected} modeled facilities.</p>
        </div>
      </div>
      <div className="space-y-3">
        {global.presence.map((city) => (
          <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-4" key={`${city.city}-${city.country}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{city.city}, {city.country}</p>
                <p className="mt-1 text-xs text-white/45">{city.sector}</p>
              </div>
              <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">{city.status}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

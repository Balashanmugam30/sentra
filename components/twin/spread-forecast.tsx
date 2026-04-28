import type { TwinForecast } from "@/lib/twin/types";

const metrics = ["fire_spread", "gas_spread", "crowd_pressure", "panic", "utility_chain"] as const;

export function SpreadForecast({ forecast }: { forecast: TwinForecast }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-orange-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200/70">Forecast Engine</p>
      <h2 className="mt-2 text-2xl font-black text-white">5 / 15 / 30 Minute Spread</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {forecast.horizons.map((horizon) => (
          <article key={horizon.window} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <h3 className="font-black text-white">{horizon.window}</h3>
            <div className="mt-4 space-y-3">
              {metrics.map((metric) => (
                <div key={metric}>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{metric.replaceAll("_", " ")}</span>
                    <span>{horizon[metric]}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-rose-400" style={{ width: `${horizon[metric]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


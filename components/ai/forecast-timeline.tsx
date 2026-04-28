import type { AIDecisionForecastItem } from "@/lib/ai/types";

type ForecastTimelineProps = {
  forecast: AIDecisionForecastItem[];
};

export function ForecastTimeline({ forecast }: ForecastTimelineProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Timeline Forecast</p>
      <h2 className="mt-2 text-xl font-semibold text-white">Next 5 / 15 / 60 minutes</h2>

      <div className="mt-6 space-y-4">
        {forecast.map((item, index) => (
          <article key={`${item.window}-${item.prediction}`} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            {index < forecast.length - 1 ? (
              <div className="absolute left-7 top-14 h-8 w-px bg-gradient-to-b from-cyan-300/50 to-transparent" />
            ) : null}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-xs font-black text-cyan-100">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">{item.window}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    Risk {item.risk}%
                  </span>
                </div>
                <p className="mt-2 text-sm text-white">{item.prediction}</p>
                <p className="mt-2 text-sm text-slate-400">Watch: {item.recommended_watch}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

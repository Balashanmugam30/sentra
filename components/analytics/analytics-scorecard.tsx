import type { AnalyticsHubSummary } from "@/lib/analytics/types";

export function AnalyticsScorecard({ summary }: { summary: AnalyticsHubSummary }) {
  const metrics = Object.values(summary.metrics).flat();

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Analytics Supremacy</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Cross-company intelligence cockpit</h2>
        </div>
        <div className="rounded-3xl border border-cyan-200/20 bg-cyan-200/10 px-5 py-4 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/55">Supremacy score</p>
          <p className="mt-1 font-mono text-3xl text-cyan-50">{summary.analytics_supremacy_score}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={metric.metric_id}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{metric.domain}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{metric.label}</h3>
            <p className="mt-3 font-mono text-3xl text-white">{formatValue(metric.value, metric.unit)}</p>
            <p className={`mt-2 text-xs ${metric.trend >= 0 ? "text-emerald-200" : "text-cyan-200"}`}>{metric.trend >= 0 ? "+" : ""}{metric.trend}% trend</p>
            <p className="mt-4 text-sm leading-6 text-white/55">{metric.insight}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatValue(value: number, unit: string) {
  if (unit === "usd") {
    return `$${value.toLocaleString()}`;
  }
  return `${value}${unit === "%" ? "%" : unit === "min" ? "m" : ""}`;
}

import type { AnalyticsHubSummary } from "@/lib/analytics/types";

export function ForecastPanel({ summary }: { summary: AnalyticsHubSummary }) {
  return (
    <section className="rounded-[30px] border border-blue-200/10 bg-blue-200/[0.045] p-5 backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/55">Forecast Engine</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Scenario simulator and next-best moves</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {summary.scenario_simulator.options.map((option) => (
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/60" key={option}>
            {option}
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-cyan-200/20 bg-cyan-200/10 p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/50">Recommended action</p>
        <p className="mt-2 text-lg font-semibold text-white">{summary.scenario_simulator.recommended}</p>
        <p className="mt-2 text-sm text-cyan-100/70">{summary.scenario_simulator.confidence}% confidence</p>
      </div>
    </section>
  );
}

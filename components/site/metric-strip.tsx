import type { SiteMetric } from "@/lib/site/types";

export function MetricStrip({ metrics }: { metrics: SiteMetric[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="grid gap-3 rounded-[30px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur md:grid-cols-5">
        {metrics.map((metric) => (
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4" key={metric.label}>
            <p className="text-xs text-white/42">{metric.label}</p>
            <p className="mt-2 font-mono text-2xl text-cyan-100">{metric.value.toLocaleString()}{metric.unit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

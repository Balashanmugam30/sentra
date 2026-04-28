import type { MLOpsMonitoring } from "@/lib/mlops/types";

type LatencyChartProps = {
  monitoring: MLOpsMonitoring;
};

export function LatencyChart({ monitoring }: LatencyChartProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Latency SLA</p>
      <div className="mt-5 space-y-4">
        {monitoring.latency_sla.map((item) => {
          const width = Math.min(100, Math.round((item.latency_ms / Math.max(1, item.sla_ms)) * 100));
          return (
            <article key={item.domain}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-white">{item.domain}</span>
                <span className="text-slate-300">{item.latency_ms}ms / {item.sla_ms}ms</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${width}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}


"use client";

import { demoMetricValue } from "@/lib/demo/runtime";
import type { WowMetric } from "@/lib/demo/types";

export function WowMetrics({ metrics }: { metrics: WowMetric[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric) => (
        <article className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5" key={metric.metric_id}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">{metric.label}</p>
          <p className="mt-3 font-mono text-3xl text-white">{demoMetricValue(metric.prefix, metric.value, metric.suffix)}</p>
          <p className="mt-2 text-sm text-emerald-200">{metric.trend}</p>
        </article>
      ))}
    </section>
  );
}


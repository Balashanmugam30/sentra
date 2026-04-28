import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionImpact } from "@/lib/submission/types";

export function ImpactBoard({ impact }: { impact: SubmissionImpact }) {
  return (
    <SubmissionPanel eyebrow="Impact Proof Center" title="Measurable outcomes judges and funders can remember" subtitle={impact.proof_statement}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {impact.metrics.map((metric) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={metric.metric_id}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{metric.label}</p>
            <p className="mt-3 font-mono text-3xl text-white">{formatMetric(metric.value, metric.unit)}</p>
            <p className="mt-3 text-sm leading-6 text-white/55">{metric.proof}</p>
          </article>
        ))}
      </div>
    </SubmissionPanel>
  );
}

function formatMetric(value: number, unit: string) {
  if (unit === "$") {
    return `$${value.toLocaleString()}`;
  }
  if (unit === "%") {
    return `${value}%`;
  }
  return `${value.toLocaleString()} ${unit}`;
}

import type { OpsGovernanceAnalytics } from "@/lib/ops/types";

type ApprovalAnalyticsProps = {
  analytics: OpsGovernanceAnalytics;
};

export function ApprovalAnalytics({ analytics }: ApprovalAnalyticsProps) {
  const metrics = [
    ["Auto approval", `${analytics.auto_approval_percent}%`],
    ["Avg approval", analytics.avg_approval_time],
    ["Escalations avoided", analytics.escalations_avoided],
    ["Workflows completed", analytics.workflows_completed],
    ["Efficiency", `${analytics.governance_efficiency}%`],
    ["Acceleration", analytics.response_acceleration],
  ];

  return (
    <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {metrics.map(([label, value]) => (
        <article key={label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        </article>
      ))}
    </section>
  );
}

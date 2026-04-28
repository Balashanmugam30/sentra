import type { MLSummary } from "@/lib/ml/types";

type GPUMeterProps = {
  summary: MLSummary;
};

export function GPUMeter({ summary }: GPUMeterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">GPU usage</p>
      <div className="mt-5 space-y-4">
        {[
          ["Active", summary.gpu_usage.active_percent],
          ["Queued", summary.gpu_usage.queued_percent],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{label}</span>
              <span className="text-cyan-100">{value}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-400">{summary.gpu_usage.cluster}</p>
    </section>
  );
}

import type { DecisionSnapshot } from "@/lib/behavior/decision";

type ConfidenceMeterProps = {
  decision: DecisionSnapshot;
};

export function ConfidenceMeter({ decision }: ConfidenceMeterProps) {
  const rows = [
    ["Overall", decision.confidence_meter.overall],
    ["Sensor quality", decision.confidence_meter.sensor_quality],
    ["Crowd model", decision.confidence_meter.crowd_model],
    ["Human compliance", decision.confidence_meter.human_compliance],
  ] as const;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Confidence meter</p>
      <div className="mt-5 space-y-4">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{label}</span>
              <span className="text-cyan-100">{value}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400" style={{ width: `${Math.min(value, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      {decision.confidence_meter.commander_review_required ? (
        <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">Human approval required before autonomous escalation.</div>
      ) : null}
    </section>
  );
}

import { GlassCard } from "./glass-card";

type SafetyCardProps = {
  confidence: number;
  safetyScore: number;
};

export function SafetyCard({ confidence, safetyScore }: SafetyCardProps) {
  return (
    <GlassCard glow={safetyScore >= 90 ? "safe" : "warning"}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/60">Route assurance</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.06em] text-white">{safetyScore}% safe path</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Validated against exit telemetry, blocked zones, and responder staging.</p>
        </div>
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-emerald-300/20 bg-emerald-400/12 text-center shadow-[0_0_34px_rgba(16,185,129,0.12)]">
          <span className="text-lg font-black text-emerald-50">{confidence}%</span>
        </div>
      </div>
    </GlassCard>
  );
}

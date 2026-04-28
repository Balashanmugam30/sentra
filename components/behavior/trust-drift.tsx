import type { TrustDrift as TrustDriftType } from "@/lib/behavior/learning";

type TrustDriftProps = {
  drift: TrustDriftType[];
};

export function TrustDrift({ drift }: TrustDriftProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Trust drift</p>
      <div className="mt-5 space-y-4">
        {drift.map((row) => (
          <div key={row.source}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{row.source}</span>
              <span className="text-cyan-100">{row.trust}% / {row.drift}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400" style={{ width: `${Math.min(row.trust, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

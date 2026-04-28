import type { LearningTrustDrift } from "@/lib/ai/types";

type TrustDriftProps = {
  drift: LearningTrustDrift[];
};

export function TrustDrift({ drift }: TrustDriftProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Trust Adaptation</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Agent, sensor, and operator drift</h2>
      <div className="mt-5 grid gap-3">
        {drift.map((item) => (
          <article key={item.subject} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{item.subject}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.driver}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-sm font-bold ${item.drift.startsWith("+") ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" : "border-amber-300/25 bg-amber-400/10 text-amber-100"}`}>
                {item.drift}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${item.trust_score}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

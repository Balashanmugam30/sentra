import type { DecisionSnapshot } from "@/lib/behavior/decision";

type RiskForecastProps = {
  decision: DecisionSnapshot;
};

export function RiskForecast({ decision }: RiskForecastProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Response timeline</p>
      <div className="mt-5 space-y-3">
        {decision.response_timeline.map((item) => (
          <article key={item.minute} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{item.minute}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{item.decision}</p>
              </div>
              <span className="text-xl font-black text-cyan-100">{item.confidence}%</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

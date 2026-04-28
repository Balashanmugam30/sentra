import type { MasterBoardSummary } from "@/lib/master/types";

export function IPOScore({ summary }: { summary: MasterBoardSummary }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Board Supremacy</p>
      <h2 className="mt-2 text-2xl font-black text-white">IPO Readiness</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-[0.55fr_1fr]">
        <div className="rounded-full border border-blue-300/25 bg-blue-300/10 p-8 text-center shadow-[0_0_40px_rgba(96,165,250,0.18)]">
          <p className="text-6xl font-black text-white">{summary.ipo_score}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-blue-100/70">score</p>
        </div>
        <div className="space-y-3">
          {summary.strategic_risks.map((risk) => (
            <article key={risk.risk} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="font-bold text-white">{risk.risk}</p>
              <p className="mt-1 text-sm text-slate-400">{risk.mitigation}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


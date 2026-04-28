import type { ExplainLog } from "@/lib/mlops/types";

type ExplainFeedProps = {
  logs: ExplainLog[];
};

export function ExplainFeed({ logs }: ExplainFeedProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Explainability ledger</p>
      <div className="mt-5 space-y-3">
        {logs.slice(0, 5).map((log) => (
          <article key={log.explain_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap gap-2">
              {log.top_features.map((feature) => (
                <span key={feature} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">{feature}</span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-200">{log.why_chosen}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{log.why_rejected}</p>
            <p className="mt-3 text-sm text-emerald-100">{log.confidence_reason}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


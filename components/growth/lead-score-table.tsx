import type { LeadScore } from "@/lib/growth/types";

type LeadScoreTableProps = {
  leads: LeadScore[];
};

export function LeadScoreTable({ leads }: LeadScoreTableProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">AI lead scoring</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden grid-cols-[1fr_0.7fr_0.6fr_0.7fr_1.2fr] gap-3 bg-white/[0.06] px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-500 md:grid">
          <span>Company</span>
          <span>Source</span>
          <span>Score</span>
          <span>Intent</span>
          <span>Next action</span>
        </div>
        {leads.map((lead) => (
          <div key={lead.lead_id} className="grid gap-3 border-t border-white/10 px-4 py-4 text-sm md:grid-cols-[1fr_0.7fr_0.6fr_0.7fr_1.2fr]">
            <div>
              <p className="font-semibold text-white">{lead.company}</p>
              <p className="text-xs text-slate-500">{lead.industry} · {lead.geography}</p>
            </div>
            <p className="text-slate-300">{lead.source}</p>
            <p className="text-2xl font-black text-emerald-100">{lead.ai_score}</p>
            <p className="font-semibold text-cyan-100">{lead.buying_intent}%</p>
            <p className="text-slate-300">{lead.recommended_action}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


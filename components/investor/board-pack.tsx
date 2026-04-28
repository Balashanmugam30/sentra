type BoardPackProps = {
  boardpack: Record<string, unknown> | null;
  board: Record<string, unknown> | null;
  busyAction: string | null;
  onGenerate: () => void;
};

function listFrom(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.map(String) : fallback;
}

export function BoardPack({ boardpack, board, busyAction, onGenerate }: BoardPackProps) {
  const title = String(boardpack?.title ?? "Sentra Institutional Board Pack");
  const asks = listFrom(boardpack?.asks ?? board?.top_asks, ["Approve Series A outreach", "Prioritize SOC2 readiness", "Open UAE strategic partner motion"]);
  const risks = listFrom(boardpack?.risks ?? board?.risks, ["SOC2 completion timing", "Government procurement cycles", "Founder-led enterprise sales concentration"]);
  const next90 = listFrom(boardpack?.next_90_days, ["Close lighthouse enterprise accounts", "Complete SOC2 evidence sprint", "Run strategic UAE investor process"]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Board pack generator</p>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
        </div>
        <button type="button" onClick={onGenerate} disabled={busyAction === "board-pack"} className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-60">
          Generate pack
        </button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {[["Strategic asks", asks], ["Risks", risks], ["Next 90 days", next90]].map(([label, items]) => (
          <article key={String(label)} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">{String(label)}</p>
            <div className="mt-3 space-y-2">
              {(items as string[]).map((item) => (
                <p key={item} className="text-sm leading-6 text-slate-300">{item}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


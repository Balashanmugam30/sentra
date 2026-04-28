"use client";

import type { OpsAutoHealAction } from "@/lib/ops/types";

type AutohealFeedProps = {
  actions: OpsAutoHealAction[];
  busyAction: string | null;
  onHeal: (actionId: string) => void;
};

export function AutohealFeed({ actions, busyAction, onHeal }: AutohealFeedProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Auto-Heal Actions</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Governed autonomous recovery</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {actions.map((action) => (
          <article key={action.action_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{action.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{action.impact}</p>
              </div>
              <span className={action.status === "healed" ? "font-bold text-emerald-100" : "font-bold text-cyan-100"}>{action.confidence}%</span>
            </div>
            <button
              type="button"
              onClick={() => onHeal(action.action_id)}
              disabled={busyAction === action.action_id}
              className="mt-4 rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60"
            >
              {busyAction === action.action_id ? "Healing..." : action.status === "healed" ? "Run Again" : "Run Heal"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

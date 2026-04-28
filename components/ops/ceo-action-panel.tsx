"use client";

import type { OpsCeoAction } from "@/lib/ops/types";

type CeoActionPanelProps = {
  actions: OpsCeoAction[];
  selected: OpsCeoAction;
  busyAction: string | null;
  onRun: (actionId: string) => void;
};

export function CeoActionPanel({ actions, selected, busyAction, onRun }: CeoActionPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">CEO Recommended Actions</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">One-click executive command</h2>
      <div className="mt-5 rounded-3xl border border-amber-300/20 bg-amber-400/10 p-4">
        <h3 className="font-semibold text-white">{selected.label}</h3>
        <p className="mt-2 text-sm text-amber-100/80">{selected.plan}</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.action_id}
            type="button"
            onClick={() => onRun(action.action_id)}
            disabled={busyAction === action.action_id}
            className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-white/[0.07] disabled:opacity-60"
          >
            <span className="font-semibold text-white">{action.label}</span>
            <span className="mt-2 block text-xs text-slate-400">{action.confidence}% confidence</span>
          </button>
        ))}
      </div>
    </section>
  );
}

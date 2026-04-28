"use client";

import { getAutomationTone, isN8nReady } from "@/lib/ops/automation";
import type { OpsAutomationAction } from "@/lib/ops/types";

type AutomationCenterProps = {
  actions: OpsAutomationAction[];
  busyAction: string | null;
  onRun: (actionId: string) => void;
};

export function AutomationCenter({ actions, busyAction, onRun }: AutomationCenterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Automation Engine</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">n8n-ready execution actions</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {actions.map((action) => (
          <article key={action.action_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{action.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{action.connector}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${getAutomationTone(action)}`}>
                {action.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{action.system} - fallback: {action.fallback}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">{isN8nReady(action) ? "Webhook-ready" : "Connector pending"} - {action.success_rate}% success</span>
              <button
                type="button"
                onClick={() => onRun(action.action_id)}
                disabled={busyAction === action.action_id}
                className="rounded-xl bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
              >
                Run
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

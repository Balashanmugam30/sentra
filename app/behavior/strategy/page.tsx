"use client";

import type { Route } from "next";
import Link from "next/link";

import { ConfidenceMeter } from "@/components/behavior/confidence-meter";
import { MessageCenter } from "@/components/behavior/message-center";
import { OutcomePanel } from "@/components/behavior/outcome-panel";
import { StrategyCompare } from "@/components/behavior/strategy-compare";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useDecision } from "@/lib/behavior/use-decision";

export default function BehaviorStrategyPage() {
  const { decision, strategy, messages, loading, error, refresh, runEngine } = useDecision();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(16,185,129,0.18),_transparent_32%),radial-gradient(circle_at_90%_12%,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Executive Strategy Compare</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Human Response Strategy Center</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Compare full evacuation, partial evacuation, shelter-in-place, lockdown, and guided phased evacuation by safety, panic, trust, cost, and reputation impact.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20">
                  {loading ? "Syncing..." : "Refresh strategy"}
                </button>
                <button type="button" onClick={() => runEngine("DEC-HOSP-OXYGEN")} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  Run hospital scenario
                </button>
                <Link href={"/behavior/decision" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Decision War-Room
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Winner", strategy.winner.strategy],
                ["Score", `${strategy.winner.score}/100`],
                ["Evac Time", `${strategy.winner.evac_time_minutes}m`],
                ["Panic", `${strategy.winner.panic_probability}%`],
                ["Trust", `${strategy.winner.trust_impact}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}

          <section className="mt-6">
            <StrategyCompare strategy={strategy} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ConfidenceMeter decision={decision} />
            <MessageCenter messages={messages} />
          </section>

          <section className="mt-6">
            <OutcomePanel decision={decision} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

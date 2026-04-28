"use client";

import type { Route } from "next";
import Link from "next/link";

import { HumanRiskScore } from "@/components/behavior/human-risk-score";
import { PanicMeter } from "@/components/behavior/panic-meter";
import { VulnerablePanel } from "@/components/behavior/vulnerable-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useBehavior } from "@/lib/behavior/use-behavior";

export default function BehaviorExecutivePage() {
  const { summary, executive, zones, loading, error, refresh } = useBehavior();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,_rgba(16,185,129,0.16),_transparent_30%),radial-gradient(circle_at_86%_8%,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Executive Behavior Summary</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Occupant Stability + Public Safety Narrative
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Board-level human-factor intelligence for panic spread, evacuation confidence, at-risk population, and recommended executive actions.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20">
                  {loading ? "Syncing..." : "Refresh Executive"}
                </button>
                <Link href={"/behavior/intelligence" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Intelligence Core
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                ["Stability", `${executive.occupant_stability_score}/100`],
                ["Panic spread", `${executive.panic_spread_risk}/100`],
                ["Evacuation", `${executive.evacuation_confidence}%`],
                ["At risk", executive.at_risk_population.toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <HumanRiskScore summary={summary} />
            <PanicMeter score={executive.panic_spread_risk} title="Panic spread risk" caption="Executive estimate of emotional contagion, crowd convergence, and delayed compliance." />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <VulnerablePanel summary={summary} zones={zones} />
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Recommended executive actions</p>
              <div className="mt-4 grid gap-3">
                {executive.recommended_executive_actions.map((action, index) => (
                  <article key={action} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan-400/15 text-sm font-black text-cyan-100">{index + 1}</span>
                      <p className="text-sm leading-6 text-slate-100">{action}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Public safety narrative</p>
            <p className="mt-4 max-w-5xl text-2xl font-black leading-tight text-white md:text-3xl">{executive.public_safety_narrative}</p>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}


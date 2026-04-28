"use client";

import type { Route } from "next";
import Link from "next/link";

import { FutureSignals } from "@/components/behavior/future-signals";
import { LearningScore } from "@/components/behavior/learning-score";
import { MemoryLedger } from "@/components/behavior/memory-ledger";
import { PlaybookEvolution } from "@/components/behavior/playbook-evolution";
import { TrustDrift } from "@/components/behavior/trust-drift";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useLearning } from "@/lib/behavior/use-learning";

export default function BehaviorLearningPage() {
  const { learning, memory, loading, error, busyAction, lastAction, refresh, runLearning } = useLearning();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(34,211,238,0.2),_transparent_32%),radial-gradient(circle_at_90%_12%,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Adaptive Behavior Learning</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Self-Learning Human Behavior Intelligence</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Sentra learns from human outcomes, updates population playbooks, tracks trust drift, predicts secondary reactions, and improves every future response.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh learning"}
                </button>
                <button
                  type="button"
                  onClick={() => runLearning("latest_human_outcome")}
                  disabled={busyAction === "learn"}
                  className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-60"
                >
                  {busyAction === "learn" ? "Learning..." : "Run learning cycle"}
                </button>
                <Link href={"/behavior/council" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  AI Council
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Score", `${learning.model_improvement_score}/100`],
                ["Episodes", learning.episodes_learned.toString()],
                ["Panic Reduced", `${learning.avg_panic_reduction}%`],
                ["Injuries Prevented", learning.injuries_prevented.toString()],
                ["ROI Saved", `$${Math.round(learning.roi_saved_estimate / 1000)}K`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}
          {lastAction ? <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{lastAction}</div> : null}

          <section className="mt-6">
            <LearningScore learning={learning} />
          </section>

          <section className="mt-6">
            <MemoryLedger incidents={learning.incident_memory_ledger} memory={memory} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <PlaybookEvolution playbooks={learning.updated_playbooks} />
            <FutureSignals signals={learning.future_risk_signals} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <TrustDrift drift={learning.trust_drift} />
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Learning timeline</p>
              <div className="mt-5 space-y-3">
                {learning.learning_timeline.map((item) => (
                  <article key={item.phase} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{item.phase}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
                      </div>
                      <span className="text-xl font-black text-emerald-100">{item.gain}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

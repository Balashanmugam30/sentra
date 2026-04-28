"use client";

import type { Route } from "next";
import Link from "next/link";

import { ConfidenceTrail } from "@/components/ai/confidence-trail";
import { LearningLedger } from "@/components/ai/learning-ledger";
import { TrustScore } from "@/components/ai/trust-score";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useAICouncilCore } from "@/lib/ai/use-ai";

export default function AILearningPage() {
  const { summary, agents, learning, loading, error, busyAction, lastAction, refresh, retrainWeights } = useAICouncilCore();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_88%_8%,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Self-improvement center</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">AI Council Learning</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Accepted decisions, overrides, delay costs, strategy win rates, confidence drift, policy updates, and strategic weight retraining for the executive AI brain.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => retrainWeights("strategic weights")} disabled={busyAction === "retrain"} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-60">
                  {busyAction === "retrain" ? "Retraining..." : "Retrain weights"}
                </button>
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  {loading ? "Syncing..." : "Refresh learning"}
                </button>
                <Link href={"/ai/council" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Council
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Episodes", learning.episodes.length.toString()],
                ["Accepted", learning.accepted_decisions.toString()],
                ["Rejected", learning.rejected_decisions.toString()],
                ["Trust", `${summary.trust_score}/100`],
                ["Objective", summary.objective],
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <LearningLedger learning={learning} />
            <TrustScore score={summary.trust_score} agents={agents} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ConfidenceTrail trail={summary.confidence_trail} />
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200/70">Policy updates</p>
              <div className="mt-5 grid gap-3">
                {learning.policy_updates.map((policy) => (
                  <article key={policy.policy_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">{policy.title}</h3>
                        <p className="mt-1 text-sm text-slate-300">{policy.impact}</p>
                      </div>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">{policy.status}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Override reasons</p>
              <div className="mt-5 space-y-3">
                {learning.override_reasons.map((reason) => (
                  <article key={reason.reason} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <p className="font-semibold text-white">{reason.reason}</p>
                    <p className="mt-2 text-sm text-slate-300">{reason.policy_update}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Best playbooks</p>
              <div className="mt-5 space-y-3">
                {learning.best_playbooks.map((playbook) => (
                  <p key={playbook} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm font-semibold text-white">{playbook}</p>
                ))}
              </div>
              <p className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-cyan-50/80">{learning.summary}</p>
            </section>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}


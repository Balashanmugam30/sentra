"use client";

import type { Route } from "next";
import Link from "next/link";

import { AgentCards } from "@/components/behavior/agent-cards";
import { ConsensusMeter } from "@/components/behavior/consensus-meter";
import { DebateFeed } from "@/components/behavior/debate-feed";
import { FutureSignals } from "@/components/behavior/future-signals";
import { PolicyGate } from "@/components/behavior/policy-gate";
import { UnifiedPlan } from "@/components/behavior/unified-plan";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useLearning } from "@/lib/behavior/use-learning";

export default function BehaviorCouncilPage() {
  const { council, loading, error, busyAction, lastAction, refresh, runCouncil, approvePolicy } = useLearning();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(244,63,94,0.16),_transparent_32%),radial-gradient(circle_at_90%_12%,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Behavior AI Council Room</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Multi-Agent Human Response Supremacy</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Safety, crowd, medical, communications, security, and ethics agents debate crisis response and merge into one governed human-aware plan.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh council"}
                </button>
                <button
                  type="button"
                  onClick={() => runCouncil("active_crisis")}
                  disabled={busyAction === "council"}
                  className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-300/20 disabled:opacity-60"
                >
                  {busyAction === "council" ? "Debating..." : "Run council"}
                </button>
                <Link href={"/behavior/learning" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Learning Center
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Agents", council.agents.length.toString()],
                ["Consensus", `${council.consensus.score}/100`],
                ["Confidence", `${council.consensus.confidence}%`],
                ["Approval SLA", `${council.human_approval_gate.sla_minutes}m`],
                ["Alignment", council.consensus.alignment],
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
            <AgentCards agents={council.agents} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <DebateFeed council={council} />
            <ConsensusMeter council={council} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <UnifiedPlan council={council} />
            <PolicyGate council={council} busy={busyAction === "policy"} onApprove={() => approvePolicy("POLICY-MSG-CLARITY-001")} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <FutureSignals signals={council.secondary_reactions} />
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Adaptive messaging by population</p>
              <div className="mt-5 space-y-3">
                {council.adaptive_messages.map((message) => (
                  <article key={message.population} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <p className="font-black text-white">{message.population}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{message.style}</p>
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

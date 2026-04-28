"use client";

import type { Route } from "next";
import Link from "next/link";

import { ConfidenceTrail } from "@/components/ai/confidence-trail";
import { DebateChamber } from "@/components/ai/debate-chamber";
import { ObjectivePanel } from "@/components/ai/objective-panel";
import { OverrideCenter } from "@/components/ai/override-center";
import { WarActions } from "@/components/ai/war-actions";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useAICouncilCore } from "@/lib/ai/use-ai";

export default function AIWarRoomPage() {
  const { summary, debate, plan, loading, error, busyAction, lastAction, refresh, setObjective, approvePlan, overrideAction } = useAICouncilCore();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,_rgba(248,113,113,0.18),_transparent_32%),radial-gradient(circle_at_88%_10%,_rgba(34,211,238,0.17),_transparent_32%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-red-200/70">Autonomous command center</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">AI War Room</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Live objective control, threat stack, ranked actions, cross-agent conflicts, resource orders, ETA to stability, and human override in one tactical board.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh war room"}
                </button>
                <Link href={"/ai/council" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Council
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Objective", summary.objective],
                ["Threats", summary.scenario.threat_stack.length.toString()],
                ["ETA", summary.scenario.eta_to_stability],
                ["Consensus", `${summary.consensus_score}%`],
                ["Plan", summary.plan_status.replaceAll("_", " ")],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}
          {lastAction ? <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{lastAction}</div> : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <ObjectivePanel activeObjective={summary.objective} busyAction={busyAction} onSelect={setObjective} />
            <WarActions plan={plan} busyAction={busyAction} onApprove={approvePlan} onOverride={overrideAction} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-red-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-red-200/70">Current threat stack</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {summary.scenario.threat_stack.map((threat) => (
                  <div key={threat} className="rounded-3xl border border-red-300/15 bg-red-500/10 p-4">
                    <p className="font-semibold text-red-50">{threat}</p>
                  </div>
                ))}
              </div>
            </section>
            <OverrideCenter status={summary.plan_status} mode={summary.governance_mode} busyAction={busyAction} onApprove={approvePlan} onOverride={() => overrideAction()} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <DebateChamber rounds={debate.rounds} />
            <ConfidenceTrail trail={summary.confidence_trail} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}


"use client";

import type { Route } from "next";
import Link from "next/link";

import { AICouncilAnalytics } from "@/components/analytics/premium-charts";
import { AgentGrid } from "@/components/ai/agent-grid";
import { ConfidenceTrail } from "@/components/ai/confidence-trail";
import { DebateChamber } from "@/components/ai/debate-chamber";
import { ObjectivePanel } from "@/components/ai/objective-panel";
import { OverrideCenter } from "@/components/ai/override-center";
import { TrustScore } from "@/components/ai/trust-score";
import { WarActions } from "@/components/ai/war-actions";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useAICouncilCore } from "@/lib/ai/use-ai";
import { aiCouncilScenarios } from "@/lib/aicouncil/runtime";

export default function AICouncilPage() {
  const { summary, agents, debate, plan, loading, error, busyAction, lastAction, refresh, debateScenario, setObjective, approvePlan, overrideAction } = useAICouncilCore();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">AI Decision Council</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">AI Decision Council</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Persistent AI specialists now debate strategy, compare objectives, orchestrate cross-module actions, and produce governed executive recommendations.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => debateScenario(summary.scenario.scenario_id, summary.objective)} disabled={busyAction === "debate"} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60">
                  {busyAction === "debate" ? "Debating..." : "Run debate"}
                </button>
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  {loading ? "Syncing..." : "Refresh"}
                </button>
                <Link href={"/ai/war-room" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  War Room
                </Link>
                <Link href={"/ai/learning" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Learning
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Consensus", `${summary.consensus_score}%`],
                ["Alignment", `${summary.alignment_score}%`],
                ["Trust", `${summary.trust_score}/100`],
                ["Agents", summary.active_agents.toString()],
                ["Status", summary.plan_status.replaceAll("_", " ")],
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
            <AICouncilAnalytics agents={agents} summary={summary} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Live objective</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">{summary.objective}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{summary.scenario.label} - ETA to stability {summary.scenario.eta_to_stability}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {summary.scenario.threat_stack.map((threat) => (
                  <span key={threat} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200">{threat}</span>
                ))}
              </div>
              <p className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-cyan-50/80">{summary.executive_copilot.summary}</p>
            </div>
            <ObjectivePanel activeObjective={summary.objective} busyAction={busyAction} onSelect={setObjective} />
          </section>

          <section className="mt-6">
            <AgentGrid agents={agents} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <DebateChamber rounds={debate.rounds} />
            <TrustScore score={summary.trust_score} agents={agents} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <WarActions plan={plan} busyAction={busyAction} onApprove={approvePlan} onOverride={overrideAction} />
            <OverrideCenter status={summary.plan_status} mode={summary.governance_mode} busyAction={busyAction} onApprove={approvePlan} onOverride={() => overrideAction()} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ConfidenceTrail trail={summary.confidence_trail} />
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Scenario library</p>
              <div className="mt-5 grid gap-3">
                {aiCouncilScenarios.map((scenario) => (
                  <button key={scenario.scenario_id} type="button" onClick={() => debateScenario(scenario.scenario_id, scenario.objective)} disabled={Boolean(busyAction)} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-white/[0.06] disabled:opacity-60">
                    <p className="font-semibold text-white">{scenario.label}</p>
                    <p className="mt-1 text-sm text-slate-400">{scenario.objective} - {scenario.eta_to_stability}</p>
                  </button>
                ))}
              </div>
            </section>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

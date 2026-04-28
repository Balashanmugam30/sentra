"use client";

import Link from "next/link";

import { ActionList } from "@/components/ai/action-list";
import { ConfidenceCard } from "@/components/ai/confidence-card";
import { ExecutiveSummary } from "@/components/ai/executive-summary";
import { ExplainPanel } from "@/components/ai/explain-panel";
import { ForecastTimeline } from "@/components/ai/forecast-timeline";
import { IncidentOverview } from "@/components/ai/incident-overview";
import { ResourcePanel } from "@/components/ai/resource-panel";
import { ScenarioLoader } from "@/components/ai/scenario-loader";
import { SeverityMeter } from "@/components/ai/severity-meter";
import { StrategyTable } from "@/components/ai/strategy-table";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useAIDecision } from "@/lib/ai/use-ai";

function LoadingShell() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-slate-950 text-white">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-cyan-950/30">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full border border-cyan-300/40 bg-cyan-300/10" />
        <p className="mt-5 text-sm uppercase tracking-[0.32em] text-cyan-100/70">Loading AI command core</p>
      </div>
    </div>
  );
}

export default function AIDecisionPage() {
  const { decision, scenarios, loading, busyScenario, error, usingFallback, runScenario, refreshDecision } =
    useAIDecision();
  const isRunning = loading || Boolean(busyScenario);

  if (loading && !decision) {
    return (
      <ProtectedWorkspaceShell>
        <LoadingShell />
      </ProtectedWorkspaceShell>
    );
  }

  if (!decision) {
    return (
      <ProtectedWorkspaceShell>
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-rose-300/20 bg-rose-500/10 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-rose-100/70">AI Decision Core</p>
            <h1 className="mt-3 text-3xl font-black">Decision model unavailable</h1>
            <p className="mt-3 text-slate-300">{error ?? "Sentra could not load the incident model."}</p>
            <button
              type="button"
              onClick={refreshDecision}
              className="mt-6 rounded-2xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Retry AI core
            </button>
          </div>
        </main>
      </ProtectedWorkspaceShell>
    );
  }

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(135deg,_#020617,_#06111f_45%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
                  AI Decision Engine
                </p>
                <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  AI Crisis Decision Core
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Real-time severity scoring, strategy comparison, executive reasoning, and resource optimization for
                  command-grade incident response.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={refreshDecision}
                  disabled={isRunning}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRunning ? "Refreshing..." : "Refresh Decision"}
                </button>
                <Link
                  href="/app"
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Back to Command
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Recommended strategy</p>
                <p className="mt-2 text-lg font-semibold text-white">{decision.recommended_strategy.name}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Escalation risk</p>
                <p className="mt-2 text-2xl font-black text-amber-100">{decision.scores.escalation_risk}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Confidence</p>
                <p className="mt-2 text-2xl font-black text-cyan-100">
                  {decision.confidence.recommendation_confidence}%
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mode</p>
                <p className="mt-2 text-lg font-semibold text-emerald-100">
                  {usingFallback ? "Local fallback" : "Backend decision"}
                </p>
              </div>
            </div>
          </header>

          {error ? (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          <div className="mt-6">
            <ScenarioLoader
              scenarios={scenarios}
              activeScenarioId={decision.scenario_id}
              busyScenario={busyScenario}
              onLoad={runScenario}
            />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <IncidentOverview incident={decision.active_incident} scores={decision.scores} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <SeverityMeter
                label="Severity Score"
                score={decision.scores.severity_score}
                detail="Composite incident danger from sensor, vision, occupancy, and route signals."
              />
              <SeverityMeter
                label="People Impact"
                score={decision.scores.people_impact_score}
                detail="Estimated risk to occupants based on density, zone, exits, and responder ETA."
              />
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <StrategyTable strategies={decision.strategies} recommendedId={decision.recommended_strategy.option_id} />
            <ActionList actions={decision.actions} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            <ExecutiveSummary summary={decision.executive_summary} generatedAt={decision.generated_at} />
            <ConfidenceCard confidence={decision.confidence} />
            <ResourcePanel resources={decision.resources} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <ExplainPanel explanations={decision.explainability} />
            <ForecastTimeline forecast={decision.forecast} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

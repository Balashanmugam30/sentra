"use client";

import type { Route } from "next";
import Link from "next/link";

import { ForecastPanel } from "@/components/growth/forecast-panel";
import { LeadScoreTable } from "@/components/growth/lead-score-table";
import { PipelineBoard } from "@/components/growth/pipeline-board";
import { RepLeaderboard } from "@/components/growth/rep-leaderboard";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { formatCurrency } from "@/lib/revenue/helpers";
import { useGrowth } from "@/lib/growth/use-growth";

export default function GrowthCrmPage() {
  const { summary, deals, leads, reps, busyAction, error, loading, refresh, updateDeal } = useGrowth();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_86%_8%,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Growth CRM Command</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Sales CRM Command Center
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Enterprise pipeline, AI-scored leads, rep attainment, stuck-deal detection, and board-ready ARR forecasting.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh CRM"}
                </button>
                <Link href={"/growth/funnel" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Funnel OS
                </Link>
                <Link href={"/growth/success" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Success OS
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                ["Pipeline", formatCurrency(summary.pipeline_value)],
                ["Weighted", formatCurrency(summary.weighted_forecast)],
                ["Quarter", formatCurrency(summary.quarter_forecast)],
                ["Close", `${summary.close_percent}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}

          <section className="mt-6">
            <PipelineBoard deals={deals} busyAction={busyAction} onMoveDeal={updateDeal} />
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <LeadScoreTable leads={leads} />
            <RepLeaderboard reps={reps} />
          </section>
          <section className="mt-6">
            <ForecastPanel summary={summary} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

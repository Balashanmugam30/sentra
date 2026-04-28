"use client";

import type { Route } from "next";
import Link from "next/link";

import { ConfidenceMeter } from "@/components/twin/confidence-meter";
import { ExecutiveSummary } from "@/components/twin/executive-summary";
import { FinancialImpact } from "@/components/twin/financial-impact";
import { PredictiveRiskRadar } from "@/components/twin/predictive-risk-radar";
import { SpreadForecast } from "@/components/twin/spread-forecast";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useTwin } from "@/lib/twin/use-twin";

export default function TwinPredictivePage() {
  const { predictive, forecast, resources, campus, compare, loading, error, refresh } = useTwin();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-rose-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-rose-200/70">Predictive Twin Intelligence</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight md:text-6xl">Predictive Twin Intelligence</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Fire spread, gas propagation, smoke movement, crowd pressure, blocked exits, ETA drift, utilities, panic, financial exposure, and reputation risk in one AI command twin.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-300/20">
                  {loading ? "Syncing..." : "Refresh intelligence"}
                </button>
                <Link href={"/twin/live" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Live twin
                </Link>
                <Link href={"/twin/executive" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Executive
                </Link>
              </div>
            </div>
          </header>
          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}
          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <ConfidenceMeter label="Prediction score" value={predictive.prediction_score} tone="rose" />
            <ConfidenceMeter label="Forecast confidence" value={forecast.confidence} />
            <ConfidenceMeter label="Reserve health" value={Math.round(resources.reserve_health)} tone="emerald" />
            <ConfidenceMeter label="Campus health" value={Math.round(campus.average_health)} tone="amber" />
          </section>
          <section className="mt-6">
            <ExecutiveSummary predictive={predictive} forecast={forecast} resources={resources} campus={campus} />
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <PredictiveRiskRadar predictive={predictive} />
            <FinancialImpact predictive={predictive} compare={compare} />
          </section>
          <section className="mt-6">
            <SpreadForecast forecast={forecast} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

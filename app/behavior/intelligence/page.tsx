"use client";

import type { Route } from "next";
import Link from "next/link";

import { ComplianceChart } from "@/components/behavior/compliance-chart";
import { DelayTimeline } from "@/components/behavior/delay-timeline";
import { FreezeBoard } from "@/components/behavior/freeze-board";
import { HumanRiskScore } from "@/components/behavior/human-risk-score";
import { InterventionActions } from "@/components/behavior/intervention-actions";
import { PanicMeter } from "@/components/behavior/panic-meter";
import { RecommendationCenter } from "@/components/behavior/recommendation-center";
import { TrustLedger } from "@/components/behavior/trust-ledger";
import { VulnerablePanel } from "@/components/behavior/vulnerable-panel";
import { ZonePsychologyMap } from "@/components/behavior/zone-psychology-map";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useBehavior } from "@/lib/behavior/use-behavior";

export default function BehaviorIntelligencePage() {
  const { summary, zones, recommendations, delayTimeline, trustLedger, loading, error, busyAction, refresh, runModel } = useBehavior();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,_rgba(34,211,238,0.18),_transparent_32%),radial-gradient(circle_at_88%_8%,_rgba(244,63,94,0.15),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Human Behavior Intelligence</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Human Behavior Intelligence Core
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Panic probability, freeze risk, crowd-following, vulnerable occupants, human delay, compliance, and zone-specific communication intelligence.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20"
                >
                  {loading ? "Syncing..." : "Refresh Intelligence"}
                </button>
                <button
                  type="button"
                  onClick={() => runModel("mixed_signal_evacuation")}
                  disabled={busyAction === "run-model"}
                  className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-300/20 disabled:opacity-60"
                >
                  Run behavior model
                </button>
                <Link href={"/behavior/executive" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Executive View
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Panic", `${summary.panic_index}/100`],
                ["Freeze", `${summary.freeze_risk}/100`],
                ["Compliance", `${summary.compliance_confidence}%`],
                ["Bottleneck", `${summary.bottleneck_risk}/100`],
                ["At risk", summary.at_risk_population.toLocaleString()],
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
            <HumanRiskScore summary={summary} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <PanicMeter score={summary.panic_index} />
            <ComplianceChart zones={zones} />
          </section>

          <section className="mt-6">
            <ZonePsychologyMap zones={zones} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <FreezeBoard zones={zones} />
            <VulnerablePanel summary={summary} zones={zones} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <RecommendationCenter recommendations={recommendations} />
            <DelayTimeline timeline={delayTimeline} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <InterventionActions zones={zones} />
            <TrustLedger ledger={trustLedger} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

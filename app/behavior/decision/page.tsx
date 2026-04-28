"use client";

import type { Route } from "next";
import Link from "next/link";

import { ActionPriority } from "@/components/behavior/action-priority";
import { ApprovalQueue } from "@/components/behavior/approval-queue";
import { ConfidenceMeter } from "@/components/behavior/confidence-meter";
import { DecisionBoard } from "@/components/behavior/decision-board";
import { MessageCenter } from "@/components/behavior/message-center";
import { OutcomePanel } from "@/components/behavior/outcome-panel";
import { OverridePanel } from "@/components/behavior/override-panel";
import { RiskForecast } from "@/components/behavior/risk-forecast";
import { TrustMeter } from "@/components/behavior/trust-meter";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useDecision } from "@/lib/behavior/use-decision";

export default function BehaviorDecisionPage() {
  const { decision, messages, approval, loading, error, busyAction, lastAction, refresh, runEngine, approve, override } = useDecision();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(34,211,238,0.2),_transparent_32%),radial-gradient(circle_at_90%_12%,_rgba(244,63,94,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Human Response Decision Engine</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Autonomous Human Response War-Room</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Sentra now decides how to stop panic, increase compliance, split crowds, control exits, route responders, and stabilize movement in real time.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh decisions"}
                </button>
                <button
                  type="button"
                  onClick={() => runEngine("DEC-STADIUM-RUSH")}
                  disabled={busyAction === "run"}
                  className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-300/20 disabled:opacity-60"
                >
                  {busyAction === "run" ? "Running..." : "Run decision engine"}
                </button>
                <Link href={"/behavior/strategy" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Strategy Compare
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Risk", `${decision.live_human_risk_score}/100`],
                ["Urgency", decision.urgency],
                ["Confidence", `${decision.confidence_meter.overall}%`],
                ["Approvals", approval.total_pending.toString()],
                ["Time Saved", `${decision.expected_outcome.evacuation_time_saved_minutes}m`],
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
            <DecisionBoard decision={decision} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <ActionPriority actions={decision.recommended_actions} />
            <ConfidenceMeter decision={decision} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <MessageCenter messages={messages} />
            <TrustMeter decision={decision} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <RiskForecast decision={decision} />
            <OutcomePanel decision={decision} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ApprovalQueue approval={approval} busy={busyAction === "approve"} onApprove={(approvalId) => approve(approvalId)} />
            <OverridePanel options={decision.override_options} busy={busyAction === "override"} onOverride={(reason) => override(reason)} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

"use client";

import Link from "next/link";
import type { Route } from "next";

import { AutomationCenter } from "@/components/ops/automation-center";
import { EvidencePanel } from "@/components/ops/evidence-panel";
import { RetryHealth } from "@/components/ops/retry-health";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useGovernance } from "@/lib/ops/use-governance";

export default function OperationsAutomationPage() {
  const { snapshot, busyAction, error, usingFallback, runAutomation } = useGovernance();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Automation Engine</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  External Execution Control
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Run governed actions through n8n-ready connectors, monitor retry health, and preserve evidence for
                  every automated step.
                </p>
              </div>
              <Link
                href={"/operations/governance" as Route}
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Governance OS
              </Link>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ready Connectors</p>
                <p className="mt-2 text-3xl font-black text-cyan-100">{snapshot.summary.automation_ready}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Response Acceleration</p>
                <p className="mt-2 text-3xl font-black text-emerald-100">{snapshot.analytics.response_acceleration}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Source</p>
                <p className="mt-2 text-lg font-semibold text-amber-100">{usingFallback ? "Local fallback" : "Ops backend"}</p>
              </div>
            </div>
          </header>

          {error ? (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <AutomationCenter actions={snapshot.automation} busyAction={busyAction} onRun={runAutomation} />
            <RetryHealth providers={snapshot.retry_health} />
          </section>

          <section className="mt-6">
            <EvidencePanel evidence={snapshot.evidence} ledger={snapshot.ledger} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

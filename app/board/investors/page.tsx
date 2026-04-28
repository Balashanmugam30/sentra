"use client";

import type { Route } from "next";
import Link from "next/link";

import { InvestorPipeline } from "@/components/master/investor-pipeline";
import { ValuationCard } from "@/components/master/valuation-card";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function BoardInvestorsPage() {
  const { board, investors, busyAction, forecast, valuation } = useMaster();
  const weightedRaise = investors.reduce((sum, investor) => sum + investor.check_size * (investor.conviction / 100), 0);

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.2),transparent_34%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-violet-950/30 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-violet-200/70">Investor OS</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Capital Command Center</h1>
                <p className="mt-4 max-w-3xl text-slate-300">Investor CRM, conviction scores, check sizes, valuation simulation, and probability-weighted raise readiness.</p>
              </div>
              <Link href={"/board/executive" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Executive
              </Link>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <Metric label="Weighted raise" value={`$${(weightedRaise / 1_000_000).toFixed(1)}M`} />
              <Metric label="Base valuation" value={`$${(board.valuation_base / 1_000_000).toFixed(0)}M`} />
              <Metric label="Runway" value={`${board.runway_months} mo`} />
            </div>
          </header>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <InvestorPipeline investors={investors} />
            <ValuationCard summary={board} busyAction={busyAction} onSimulate={valuation} onForecast={forecast} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}


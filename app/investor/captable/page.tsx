"use client";

import type { Route } from "next";
import Link from "next/link";

import { CapTableChart } from "@/components/investor/cap-table-chart";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useInvestor } from "@/lib/investor/use-investor";
import { formatCurrency } from "@/lib/revenue/helpers";

function rounds(captable: Record<string, unknown> | null) {
  const value = captable?.rounds;
  return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
}

export default function InvestorCapTablePage() {
  const { summary, captable, busyAction, error, loading, refresh, updateCapTable } = useInvestor();
  const captableRounds = rounds(captable);

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,_rgba(245,158,11,0.16),_transparent_32%),radial-gradient(circle_at_88%_10%,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-amber-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-amber-200/70">Ownership Engine</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Cap Table + Dilution Simulator
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Founder dilution, ESOP planning, SAFE conversion, future rounds, post-money valuation, and ownership waterfall modeling.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/20">
                  {loading ? "Syncing..." : "Refresh Ownership"}
                </button>
                <Link href={"/investor/overview" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Overview
                </Link>
                <Link href={"/investor/boardroom" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Boardroom
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                ["Post-money", formatCurrency(Number(captable?.post_money_valuation ?? 180_000_000))],
                ["Founder stake", `${String(captable?.founder_ownership_remaining ?? 55.7)}%`],
                ["Employee pool", `${String(captable?.ESOP_percent ?? 10)}%`],
                ["Base valuation", formatCurrency(summary.base_valuation)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <CapTableChart captable={captable} busyAction={busyAction} onUpdate={updateCapTable} />
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Round waterfall</p>
              <div className="mt-4 grid gap-3">
                {captableRounds.map((round) => (
                  <article key={String(round.round)} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{String(round.round)}</p>
                      <p className="text-xl font-black text-cyan-100">{formatCurrency(Number(round.post_money ?? 0))}</p>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-300 md:grid-cols-3">
                      <span>Founder {String(round.founder_percent)}%</span>
                      <span>Investor {String(round.investor_percent)}%</span>
                      <span>ESOP {String(round.esop_percent)}%</span>
                    </div>
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


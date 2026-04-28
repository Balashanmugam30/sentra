"use client";

import type { Route } from "next";
import Link from "next/link";

import { BoardPack } from "@/components/investor/board-pack";
import { MaTargets } from "@/components/investor/ma-targets";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useInvestor } from "@/lib/investor/use-investor";

function listFrom(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.map(String) : fallback;
}

function scorecards(value: unknown) {
  return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
}

export default function InvestorBoardroomPage() {
  const { summary, board, boardpack, mna, busyAction, error, loading, refresh, generateBoardPack } = useInvestor();
  const risks = listFrom(boardpack?.risks ?? board?.risks, ["SOC2 completion timing", "Government procurement cycles", "Founder-led enterprise sales concentration"]);
  const asks = listFrom(boardpack?.asks ?? board?.top_asks, ["Approve Series A outreach", "Prioritize SOC2 readiness", "Open UAE strategic partner motion"]);
  const departments = scorecards(boardpack?.department_scorecards);

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_88%_10%,_rgba(245,158,11,0.13),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-slate-300/80">Boardroom Capital Engine</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Board Pack + Strategic Finance AI
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Monthly board narrative, KPI summaries, risks, strategic asks, department scorecards, M&A targets, and capital allocation posture.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh Boardroom"}
                </button>
                <Link href={"/investor/overview" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Overview
                </Link>
                <Link href={"/investor/fundraise" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Fundraise
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                ["Rule of 40", summary.rule_of_40],
                ["Readiness", `${summary.fundraising_readiness}/100`],
                ["Burn multiple", `${summary.burn_multiple}x`],
                ["IPO score", `${summary.ipo_score}/100`],
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
            <BoardPack boardpack={boardpack} board={board} busyAction={busyAction} onGenerate={generateBoardPack} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-rose-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-200/70">Board risk desk</p>
              <div className="mt-4 grid gap-3">
                {risks.map((risk) => (
                  <p key={risk} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-200">
                    {risk}
                  </p>
                ))}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Strategic asks</p>
              <div className="mt-3 grid gap-3">
                {asks.map((ask) => (
                  <p key={ask} className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-50">
                    {ask}
                  </p>
                ))}
              </div>
            </article>
            <div className="grid gap-6">
              <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Department scorecards</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {departments.map((item) => (
                    <div key={String(item.department)} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{String(item.department)}</p>
                        <p className="text-2xl font-black text-cyan-100">{String(item.score)}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{String(item.status)}</p>
                    </div>
                  ))}
                </div>
              </article>
              <MaTargets mna={mna} />
            </div>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}


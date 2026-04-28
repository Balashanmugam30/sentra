"use client";

import type { Route } from "next";
import Link from "next/link";

import { ChannelRoi } from "@/components/growth/channel-roi";
import { ForecastPanel } from "@/components/growth/forecast-panel";
import { FunnelChart } from "@/components/growth/funnel-chart";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { formatCurrency } from "@/lib/revenue/helpers";
import { useGrowth } from "@/lib/growth/use-growth";

export default function GrowthFunnelPage() {
  const { summary, funnel, error, loading, refresh } = useGrowth();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_90%_10%,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#06111f_45%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-blue-200/70">Growth Intelligence</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Funnel + Acquisition OS
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Visitor-to-won funnel analytics, CAC/CPL, referral loops, viral coefficient, channel ROI, and conversion leak detection.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-blue-300/30 bg-blue-300/10 px-5 py-3 text-sm font-semibold text-blue-50 transition hover:bg-blue-300/20">
                  {loading ? "Syncing..." : "Refresh Funnel"}
                </button>
                <Link href={"/growth/crm" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  CRM OS
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Visitors", summary.visitors.toLocaleString()],
                ["Leads", summary.leads.toLocaleString()],
                ["CAC", formatCurrency(summary.cac)],
                ["CPL", formatCurrency(summary.cpl)],
                ["Viral", `${summary.viral_coefficient}x`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <FunnelChart stages={funnel.stages} />
            <ChannelRoi channels={funnel.channels} leaks={funnel.leaks} />
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <ForecastPanel summary={summary} />
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Referral engine</p>
              <p className="mt-4 text-5xl font-black text-white">{funnel.referral_engine.viral_coefficient}x</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {funnel.referral_engine.accepted.toLocaleString()} accepted referrals from {funnel.referral_engine.referrals_sent.toLocaleString()} invites.
                Top ambassador: {funnel.referral_engine.best_ambassador}.
              </p>
              <p className="mt-4 text-2xl font-black text-emerald-100">{formatCurrency(funnel.referral_engine.revenue_generated)}</p>
            </div>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}


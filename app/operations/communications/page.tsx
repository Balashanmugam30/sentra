"use client";

import type { Route } from "next";
import Link from "next/link";

import { AckDashboard } from "@/components/ops/ack-dashboard";
import { AlertComposer } from "@/components/ops/alert-composer";
import { AudienceTargeting } from "@/components/ops/audience-targeting";
import { BroadcastFeed } from "@/components/ops/broadcast-feed";
import { ChannelGrid } from "@/components/ops/channel-grid";
import { CommsLedger } from "@/components/ops/comms-ledger";
import { DeliveryMetrics } from "@/components/ops/delivery-metrics";
import { SilenceQueue } from "@/components/ops/silence-queue";
import { StatusMap } from "@/components/ops/status-map";
import { TemplateCenter } from "@/components/ops/template-center";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useCommunications } from "@/lib/ops/use-communications";

export default function OperationsCommunicationsPage() {
  const {
    snapshot,
    isRefreshing,
    busyAction,
    error,
    usingFallback,
    refresh,
    send,
    respond,
  } = useCommunications();

  const defaultAudience =
    snapshot.audiences.find((audience) => audience.audience_id === snapshot.composer.default_audience_id) ??
    snapshot.audiences[0];

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
                  Communications Command
                </p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Live Communication + Mass Notification OS
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Sentra now reaches humans instantly during crisis: multi-channel broadcasts, role and zone targeting,
                  two-way acknowledgements, silence escalation, n8n delivery, and audit-ready accountability.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Comms"}
                </button>
                <Link
                  href={"/operations/governance" as Route}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Governance OS
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Reached</p>
                <p className="mt-2 text-3xl font-black text-cyan-100">{snapshot.summary.population_reached}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Acked</p>
                <p className="mt-2 text-3xl font-black text-emerald-100">{snapshot.summary.acknowledged}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Need Help</p>
                <p className="mt-2 text-3xl font-black text-rose-100">{snapshot.summary.need_help}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Delivery</p>
                <p className="mt-2 text-3xl font-black text-white">{snapshot.summary.delivery_success_percent}%</p>
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

          <div className="mt-6">
            <DeliveryMetrics snapshot={snapshot} />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <AlertComposer snapshot={snapshot} busyAction={busyAction} onSend={send} />
            <ChannelGrid channels={snapshot.channels} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <AudienceTargeting audiences={snapshot.audiences} />
            <AckDashboard snapshot={snapshot} busyAction={busyAction} onRespond={respond} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <SilenceQueue escalations={snapshot.silence_escalations} />
            <StatusMap zones={snapshot.status_map} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <TemplateCenter
              templates={snapshot.templates}
              defaultAudience={defaultAudience}
              busyAction={busyAction}
              onSend={send}
            />
            <BroadcastFeed feed={snapshot.feed} />
          </section>

          <section className="mt-6">
            <CommsLedger snapshot={snapshot} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

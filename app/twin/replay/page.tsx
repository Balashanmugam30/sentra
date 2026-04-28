"use client";

import type { Route } from "next";
import Link from "next/link";

import { EventScrubber } from "@/components/twin/event-scrubber";
import { ReplayIntelligence } from "@/components/twin/replay-intelligence";
import { ReplayTimeline } from "@/components/twin/replay-timeline";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useTwin } from "@/lib/twin/use-twin";

export default function TwinReplayPage() {
  const { replay, replayIntelligence, busyAction, lastAction, loadReplay } = useTwin();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_82%_0%,rgba(168,85,247,0.2),transparent_34%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-purple-950/30 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-purple-200/70">Incident Playback Lab</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Replay, Compare, Improve</h1>
                <p className="mt-4 max-w-3xl text-slate-300">Timeline scrubber, crowd motion replay, responder replay, message replay, decision replay, and outcome comparison.</p>
              </div>
              <Link href={"/twin/training" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Training
              </Link>
            </div>
          </header>
          {lastAction ? <div className="mt-4 rounded-2xl border border-purple-300/20 bg-purple-400/10 p-4 text-sm text-purple-100">{lastAction}</div> : null}
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <EventScrubber replay={replay} busyAction={busyAction} onLoad={loadReplay} />
            <ReplayTimeline events={replay.events} />
          </section>
          <section className="mt-6">
            <ReplayIntelligence replay={replayIntelligence} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

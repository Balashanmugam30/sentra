"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyMetricTile,
  AutonomyPanelChrome,
  AutonomyPill,
  autoList,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function DecisionMemoryLedger() {
  const { memory, live } = useAutonomy();
  const episodes = autoList<Record<string, unknown>>(memory?.episodes);

  return (
    <AutonomyPanelChrome title="Decision Memory Ledger" eyebrow="Accepted, Rejected, Modified, and Learned">
      <div className="grid gap-3 md:grid-cols-4">
        <AutonomyMetricTile label="Episodes" value={episodes.length || 4} />
        <AutonomyMetricTile label="Accepted" value={autoNumber(live?.metrics?.accepted_decisions_percent, 71)} suffix="%" />
        <AutonomyMetricTile label="Rejected" value={autoNumber(live?.metrics?.rejected_decisions_percent, 12)} suffix="%" tone="orange" />
        <AutonomyMetricTile label="Override Rate" value={autoNumber(live?.metrics?.override_rate_percent, 17)} suffix="%" tone="gold" />
      </div>

      <div className="space-y-3">
        {episodes.slice(0, 6).map((episode, index) => (
          <article key={`${autoString(episode.episode_id, "memory")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-cyan-100/50">
                  {autoString(episode.scenario, "scenario")} - {autoString(episode.outcome, "learned")}
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">{autoString(episode.decision, "Autonomy decision")}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{autoString(episode.lesson, "Lesson stored for future recommendations.")}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/68">
                <AutonomyPill>{autoNumber(episode.time_to_recovery_minutes, 11)}m recovery</AutonomyPill>
                <AutonomyPill tone={episode.accepted === false ? "orange" : "gold"}>
                  {episode.accepted === false ? "rejected" : "accepted"}
                </AutonomyPill>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AutonomyPanelChrome>
  );
}


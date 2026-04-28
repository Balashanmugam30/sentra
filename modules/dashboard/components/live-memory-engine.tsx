"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyMetricTile,
  AutonomyPanelChrome,
  AutonomyPill,
  autoList,
  autoNumber,
  autoRecord,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function LiveMemoryEngine() {
  const { memory, live } = useAutonomy();
  const episodes = autoList<Record<string, unknown>>(memory?.episodes);
  const trustedPlaybooks = autoList<Record<string, unknown>>(memory?.trusted_playbooks);

  return (
    <AutonomyPanelChrome title="Live Memory Engine" eyebrow="Outcome-Weighted Intelligence">
      <div className="grid gap-3 md:grid-cols-3">
        <AutonomyMetricTile label="Episodes" value={episodes.length || 4} />
        <AutonomyMetricTile label="Playbooks Learned" value={autoNumber(live?.metrics?.playbooks_learned, 37)} />
        <AutonomyMetricTile label="Best Objective" value={autoString(live?.metrics?.best_objective, "fastest recovery")} tone="gold" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {episodes.slice(0, 4).map((episode, index) => {
          const record = autoRecord(episode);
          return (
            <article key={`${autoString(record.episode_id, "episode")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-white">{autoString(record.scenario, "Autonomy episode")}</h4>
                <AutonomyPill>{autoString(record.outcome, "learned")}</AutonomyPill>
              </div>
              <p className="mt-2 text-sm text-slate-300">{autoString(record.lesson, "Outcome stored for future recommendations.")}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-100/60">
                Confidence {autoNumber(record.confidence_before, 70)}% to {autoNumber(record.confidence_after, 86)}%
              </p>
            </article>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {trustedPlaybooks.slice(0, 3).map((playbook, index) => (
          <AutonomyPill key={`${autoString(playbook.name, "playbook")}-${index}`} tone="gold">
            {autoString(playbook.name, "Trusted playbook")} {autoNumber(playbook.win_rate, 88)}%
          </AutonomyPill>
        ))}
      </div>
    </AutonomyPanelChrome>
  );
}


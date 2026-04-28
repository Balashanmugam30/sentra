"use client";

import { memo } from "react";

import { rankResponderMission } from "../../lib/mobile/tasks";
import type { ResponderMission } from "../../lib/mobile/types";
import { GlassCard } from "./glass-card";

type IncidentPriorityListProps = {
  missions: ResponderMission[];
};

export const IncidentPriorityList = memo(function IncidentPriorityList({ missions }: IncidentPriorityListProps) {
  return (
    <GlassCard glow="critical">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">Priority system</p>
      <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Rescue target ranking</h2>
      <div className="mt-4 space-y-3">
        {missions.slice(0, 4).map((mission, index) => (
          <article className="rounded-3xl border border-white/10 bg-black/20 p-4" key={mission.id}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-red-500 text-sm font-black text-white">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{mission.target}</p>
                <p className="mt-1 text-xs text-slate-400">Score {Math.round(rankResponderMission(mission))}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </GlassCard>
  );
});

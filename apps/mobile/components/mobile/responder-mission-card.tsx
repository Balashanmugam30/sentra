"use client";

import { memo } from "react";

import { cn, formatEta } from "../../lib/mobile/helpers";
import { PRIORITY_LABELS } from "../../lib/mobile/tasks";
import type { ResponderMission, ResponderMissionStatus } from "../../lib/mobile/types";

type ResponderMissionCardProps = {
  mission: ResponderMission;
  onAccept: (missionId: string) => void;
  onUpdate: (missionId: string, status: ResponderMissionStatus) => void;
};

export const ResponderMissionCard = memo(function ResponderMissionCard({ mission, onAccept, onUpdate }: ResponderMissionCardProps) {
  return (
    <article
      className={cn(
        "rounded-[26px] border p-4",
        mission.priority === "critical" && "border-red-300/25 bg-red-400/12",
        mission.priority === "high" && "border-amber-300/25 bg-amber-400/12",
        mission.priority === "normal" && "border-blue-300/20 bg-blue-400/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-white">{mission.target}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{mission.ingressRoute}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-100">
          {PRIORITY_LABELS[mission.priority]}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-[0.65rem] text-slate-400">ETA</p>
          <p className="mt-1 text-sm font-bold text-white">{formatEta(mission.etaSeconds)}</p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-[0.65rem] text-slate-400">Safety</p>
          <p className="mt-1 text-sm font-bold text-white">{mission.routeSafety}%</p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-[0.65rem] text-slate-400">Trapped</p>
          <p className="mt-1 text-sm font-bold text-white">{mission.trappedMinutes}m</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="min-h-10 rounded-2xl border border-blue-300/20 bg-blue-400/12 text-xs font-bold text-blue-50" onClick={() => onAccept(mission.id)} type="button">
          Accept
        </button>
        <button className="min-h-10 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 text-xs font-bold text-emerald-50" onClick={() => onUpdate(mission.id, "arrived")} type="button">
          Arrived
        </button>
        <button className="min-h-10 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 text-xs font-bold text-emerald-50" onClick={() => onUpdate(mission.id, "victim_secured")} type="button">
          Victim Secured
        </button>
        <button className="min-h-10 rounded-2xl border border-red-300/20 bg-red-400/12 text-xs font-bold text-red-50" onClick={() => onUpdate(mission.id, "need_support")} type="button">
          Need Support
        </button>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Status: {mission.status.replaceAll("_", " ")}</p>
    </article>
  );
});

"use client";

import { memo } from "react";

import { INCIDENT_FEED } from "../../lib/mobile/constants";
import { cn, statusTone } from "../../lib/mobile/helpers";
import type { MobileIncident, SystemStatus } from "../../lib/mobile/types";
import { GlassCard } from "./glass-card";

type IncidentFeedProps = {
  incident: MobileIncident | null;
  status: SystemStatus;
};

export const IncidentFeed = memo(function IncidentFeed({ incident, status }: IncidentFeedProps) {
  const feed = incident
    ? [
        {
          detail: `${incident.zone}, Floor ${incident.floor}. ${incident.instructions[0]}`,
          id: incident.id,
          status: incident.severity,
          time: "Live",
          title: incident.title,
        },
        ...INCIDENT_FEED,
      ]
    : INCIDENT_FEED;

  return (
    <GlassCard glow={statusTone(status)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Incident feed</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Live safety events</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">
          {feed.length} events
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {feed.slice(0, 4).map((event) => {
          const tone = statusTone(event.status);
          return (
            <article className="rounded-3xl border border-white/10 bg-black/18 p-4" key={event.id}>
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 h-2.5 w-2.5 rounded-full",
                    tone === "safe" && "bg-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.55)]",
                    tone === "warning" && "bg-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.55)]",
                    tone === "critical" && "bg-red-300 shadow-[0_0_18px_rgba(239,68,68,0.58)]",
                  )}
                />
                <div>
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{event.detail}</p>
                </div>
                <time className="ml-auto text-xs font-semibold text-slate-500">{event.time}</time>
              </div>
            </article>
          );
        })}
      </div>
    </GlassCard>
  );
});

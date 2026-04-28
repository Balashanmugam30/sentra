"use client";

import { useEffect } from "react";

import { DangerZonePanel } from "../../components/mobile/danger-zone-panel";
import { GlassCard } from "../../components/mobile/glass-card";
import { IncidentPriorityList } from "../../components/mobile/incident-priority-list";
import { LiveFeedCard } from "../../components/mobile/live-feed-card";
import { ResponderMissionCard } from "../../components/mobile/responder-mission-card";
import { TeamStatusStrip } from "../../components/mobile/team-status-strip";
import { formatEta } from "../../lib/mobile/helpers";
import { useMobileStore } from "../../store/useMobileStore";

export default function ResponderPage() {
  const acceptMission = useMobileStore((state) => state.acceptMission);
  const incident = useMobileStore((state) => state.incident);
  const opsFeed = useMobileStore((state) => state.opsFeed);
  const priorityQueue = useMobileStore((state) => state.priorityQueue);
  const responderMissions = useMobileStore((state) => state.responderMissions);
  const route = useMobileStore((state) => state.route);
  const teamMembers = useMobileStore((state) => state.teamMembers);
  const tickOpsFeed = useMobileStore((state) => state.tickOpsFeed);
  const updateMission = useMobileStore((state) => state.updateMission);
  const zoneStatus = useMobileStore((state) => state.zoneStatus);
  const topMission = priorityQueue[0];

  useEffect(() => {
    const timer = window.setInterval(tickOpsFeed, 15_000);
    return () => window.clearInterval(timer);
  }, [tickOpsFeed]);

  return (
    <div className="space-y-5">
      <GlassCard glow="critical">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">Responder tactical mode</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.09em] text-white">{incident?.title ?? "FIRE DETECTED"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {incident?.zone ?? "Kitchen Zone B"}, Floor {incident?.floor ?? "3"}. Safest ingress: {topMission?.ingressRoute ?? "Service Hall C to Room 312"}.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Top priority</p>
            <p className="mt-1 font-bold text-white">{topMission?.target ?? "Injured guest Room 312"}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">ETA to scene</p>
            <p className="mt-1 text-2xl font-black text-white">{formatEta(topMission?.etaSeconds ?? route?.etaSeconds ?? 95)}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Units en route</p>
            <p className="mt-1 text-2xl font-black text-white">4</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Route safety</p>
            <p className="mt-1 text-2xl font-black text-emerald-100">{topMission?.routeSafety ?? 88}%</p>
          </div>
        </div>
      </GlassCard>

      <TeamStatusStrip members={teamMembers} />

      <IncidentPriorityList missions={priorityQueue} />

      <GlassCard glow="accent">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Mission actions</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Responder queue</h2>
        <div className="mt-4 space-y-3">
          {responderMissions.map((mission) => (
            <ResponderMissionCard key={mission.id} mission={mission} onAccept={acceptMission} onUpdate={updateMission} />
          ))}
        </div>
      </GlassCard>

      <DangerZonePanel zones={zoneStatus} />

      <LiveFeedCard feed={opsFeed} onTick={tickOpsFeed} />
    </div>
  );
}

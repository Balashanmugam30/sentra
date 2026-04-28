"use client";

import { useEffect } from "react";

import { DangerZonePanel } from "../../components/mobile/danger-zone-panel";
import { GlassCard } from "../../components/mobile/glass-card";
import { LiveFeedCard } from "../../components/mobile/live-feed-card";
import { StaffTaskList } from "../../components/mobile/staff-task-list";
import { TeamStatusStrip } from "../../components/mobile/team-status-strip";
import { STAFF_ASSIGNED_ZONE } from "../../lib/mobile/opsEngine";
import { useMobileStore } from "../../store/useMobileStore";

export default function StaffPage() {
  const acceptTask = useMobileStore((state) => state.acceptTask);
  const completeTask = useMobileStore((state) => state.completeTask);
  const escalateTask = useMobileStore((state) => state.escalateTask);
  const opsFeed = useMobileStore((state) => state.opsFeed);
  const sosRequests = useMobileStore((state) => state.sosRequests);
  const staffTasks = useMobileStore((state) => state.staffTasks);
  const teamMembers = useMobileStore((state) => state.teamMembers);
  const tickOpsFeed = useMobileStore((state) => state.tickOpsFeed);
  const zoneStatus = useMobileStore((state) => state.zoneStatus);
  const assignedZone = zoneStatus.find((zone) => zone.name === STAFF_ASSIGNED_ZONE);
  const pendingTasks = staffTasks.filter((task) => task.status !== "completed");
  const escalations = staffTasks.filter((task) => task.status === "escalated" || task.priority === "critical").length;

  useEffect(() => {
    const timer = window.setInterval(tickOpsFeed, 18_000);
    return () => window.clearInterval(timer);
  }, [tickOpsFeed]);

  return (
    <div className="space-y-5">
      <GlassCard glow="accent">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Staff mission mode</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.09em] text-white">{STAFF_ASSIGNED_ZONE} assigned</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Guide occupants, verify rooms, clear exits, and escalate hazards without leaving the mobile flow.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Civilians nearby</p>
            <p className="mt-1 text-2xl font-black text-white">{assignedZone?.civiliansNearby ?? 42}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Exits status</p>
            <p className="mt-1 text-2xl font-black text-white">{assignedZone?.exitsOpen ?? 1} open</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Pending tasks</p>
            <p className="mt-1 text-2xl font-black text-white">{pendingTasks.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Escalations</p>
            <p className="mt-1 text-2xl font-black text-red-100">{escalations}</p>
          </div>
        </div>
      </GlassCard>

      <TeamStatusStrip members={teamMembers} />

      <StaffTaskList onAccept={acceptTask} onComplete={completeTask} onEscalate={escalateTask} tasks={staffTasks} />

      <DangerZonePanel zones={zoneStatus} />

      <GlassCard glow="warning">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">Comms notice</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Keep Service Hall C clear</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {sosRequests.filter((request) => request.status !== "resolved").length} active SOS requests are being routed through responder command. Report blocked path if guest flow changes.
        </p>
      </GlassCard>

      <LiveFeedCard feed={opsFeed} onTick={tickOpsFeed} />
    </div>
  );
}

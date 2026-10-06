"use client";

import { useState } from "react";

import { GlassCard } from "@/components/mobile/glass-card";
import { SosActionGrid } from "@/components/mobile/sos-action-grid";
import { SosStatusCard } from "@/components/mobile/sos-status-card";
import { BUILDING_NAME } from "@/lib/mobile/constants";
import { formatRole } from "@/lib/mobile/helpers";
import type { SosKind } from "@/lib/mobile/types";
import { useMobileStore } from "@/store/useMobileStore";

export default function SosPage() {
  const ackSOS = useMobileStore((state) => state.ackSOS);
  const currentZone = useMobileStore((state) => state.currentZone);
  const incident = useMobileStore((state) => state.incident);
  const networkOnline = useMobileStore((state) => state.networkOnline);
  const resolveSOS = useMobileStore((state) => state.resolveSOS);
  const sendSOS = useMobileStore((state) => state.sendSOS);
  const sosRequests = useMobileStore((state) => state.sosRequests);
  const userRole = useMobileStore((state) => state.userRole);
  const [pending, setPending] = useState<{ kind: SosKind; label: string } | null>(null);
  const [lastSentId, setLastSentId] = useState<string | null>(null);

  const submitSOS = () => {
    if (!pending) {
      return;
    }

    const id = sendSOS(pending.kind, pending.label);
    setLastSentId(id);
    setPending(null);
  };

  const lastRequest = lastSentId ? sosRequests.find((request) => request.id === lastSentId) : null;

  return (
    <div className="space-y-5">
      <GlassCard glow="critical">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">SOS command</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.09em] text-white">Request emergency help</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Sentra attaches your role, zone, incident, network state, and timestamp so responders know where to go.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Location</p>
            <p className="mt-1 font-bold text-white">{currentZone}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Role</p>
            <p className="mt-1 font-bold text-white">{formatRole(userRole)}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Network</p>
            <p className={networkOnline ? "mt-1 font-bold text-emerald-100" : "mt-1 font-bold text-amber-100"}>{networkOnline ? "Online" : "Queued offline"}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-400">Incident</p>
            <p className="mt-1 font-bold text-white">{incident?.id ?? "Monitoring"}</p>
          </div>
        </div>
      </GlassCard>

      <SosActionGrid onSelect={(kind, label) => setPending({ kind, label })} selectedKind={pending?.kind ?? null} />

      {pending ? (
        <GlassCard glow="critical">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">Confirm request</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.07em] text-white">{pending.label}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Send to {BUILDING_NAME} command with current zone, role, incident, battery, and network state.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="min-h-14 rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold text-slate-100" onClick={() => setPending(null)} type="button">
              Cancel
            </button>
            <button className="min-h-14 rounded-2xl bg-red-500 text-sm font-black text-white shadow-[0_0_38px_rgba(239,68,68,0.28)]" onClick={submitSOS} type="button">
              Send SOS
            </button>
          </div>
        </GlassCard>
      ) : null}

      {lastRequest ? (
        <GlassCard glow={lastRequest.status === "queued" ? "warning" : "safe"}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/70">Request sent</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.07em] text-white">{lastRequest.id}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Status: {lastRequest.status}. {lastRequest.networkOnline ? "Command received the request." : "Stored locally until network returns."}
          </p>
        </GlassCard>
      ) : null}

      <SosStatusCard onAcknowledge={ackSOS} onResolve={resolveSOS} requests={sosRequests} />
    </div>
  );
}

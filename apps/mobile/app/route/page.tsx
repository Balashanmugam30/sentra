"use client";

import Link from "next/link";

import { EmptyState } from "../../components/mobile/empty-state";
import { EtaChip } from "../../components/mobile/eta-chip";
import { GlassCard } from "../../components/mobile/glass-card";
import { RerouteBanner } from "../../components/mobile/reroute-banner";
import { RouteMap } from "../../components/mobile/route-map";
import { RouteSteps } from "../../components/mobile/route-steps";
import { SafetyCard } from "../../components/mobile/safety-card";
import { VoiceGuidancePanel } from "../../components/mobile/voice-guidance-panel";
import { PRIMARY_BLOCKED_ZONE } from "../../lib/mobile/routing";
import { useMobileStore } from "../../store/useMobileStore";

export default function RoutePage() {
  const blockedZones = useMobileStore((state) => state.blockedZones);
  const confidence = useMobileStore((state) => state.confidence);
  const networkOnline = useMobileStore((state) => state.networkOnline);
  const rerouteReason = useMobileStore((state) => state.rerouteReason);
  const route = useMobileStore((state) => state.route);
  const routeSteps = useMobileStore((state) => state.routeSteps);
  const lastVoiceInstruction = useMobileStore((state) => state.lastVoiceInstruction);
  const setVoiceInstruction = useMobileStore((state) => state.setVoiceInstruction);
  const setVoiceRate = useMobileStore((state) => state.setVoiceRate);
  const toggleBlockedZone = useMobileStore((state) => state.toggleBlockedZone);
  const toggleVoice = useMobileStore((state) => state.toggleVoice);
  const voiceEnabled = useMobileStore((state) => state.voiceEnabled);
  const voiceRate = useMobileStore((state) => state.voiceRate);
  const blocked = blockedZones.includes(PRIMARY_BLOCKED_ZONE);
  const voiceInstructions = routeSteps.map((step) => step.title);

  return (
    <div className="space-y-5">
      <GlassCard glow={blocked ? "warning" : "accent"}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Safe Route</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.08em] text-white">{route?.destination ?? "South Gate assembly point"}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {networkOnline ? "Live evacuation guidance is synced with corridor status and responder staging." : "Offline route snapshot active. Follow posted exit signs if guidance diverges."}
            </p>
          </div>
          <Link className="rounded-full border border-red-300/25 bg-red-400/12 px-3 py-2 text-xs font-bold text-red-100" href="/alert">
            Alert
          </Link>
        </div>
      </GlassCard>

      <RerouteBanner reason={rerouteReason} />

      {route ? <RouteMap blockedZones={blockedZones} route={route} /> : <EmptyState description="No route cache is available. Stay with staff, follow posted exits, and use SOS if you need help." title="Route snapshot missing" tone="warning" />}

      {route ? <EtaChip congestion={route.congestionLevel} distanceMeters={route.distanceMeters} etaSeconds={route.etaSeconds} /> : null}

      {route ? <SafetyCard confidence={confidence} safetyScore={route.safetyScore} /> : null}

      <VoiceGuidancePanel
        enabled={voiceEnabled}
        instructions={voiceInstructions.length > 0 ? voiceInstructions : undefined}
        lastInstruction={lastVoiceInstruction}
        onInstruction={setVoiceInstruction}
        rate={voiceRate}
        setRate={setVoiceRate}
        toggleVoice={toggleVoice}
      />

      <button
        aria-pressed={blocked}
        className="min-h-14 w-full rounded-2xl border border-amber-300/25 bg-amber-400/12 px-4 text-sm font-bold text-amber-50 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
        onClick={toggleBlockedZone}
        type="button"
      >
        {blocked ? "Clear corridor hazard" : "Simulate blocked corridor"}
      </button>

      <RouteSteps steps={routeSteps} />
    </div>
  );
}

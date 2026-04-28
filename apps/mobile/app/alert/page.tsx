"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AlertCountdown } from "../../components/mobile/alert-countdown";
import { GlassCard } from "../../components/mobile/glass-card";
import { StatusChip } from "../../components/mobile/status-chip";
import { VoiceGuidancePanel } from "../../components/mobile/voice-guidance-panel";
import { BUILDING_NAME } from "../../lib/mobile/constants";
import { formatEta } from "../../lib/mobile/helpers";
import { useMobileStore } from "../../store/useMobileStore";

function elapsedSince(value: string | undefined) {
  if (!value) {
    return "Just now";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Just now";
  }

  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  return seconds < 60 ? `${seconds}s ago` : formatEta(seconds);
}

export default function AlertPage() {
  const eta = useMobileStore((state) => state.eta);
  const incident = useMobileStore((state) => state.incident);
  const lastVoiceInstruction = useMobileStore((state) => state.lastVoiceInstruction);
  const queueSOS = useMobileStore((state) => state.queueSOS);
  const setDemoScenario = useMobileStore((state) => state.setDemoScenario);
  const setVoiceInstruction = useMobileStore((state) => state.setVoiceInstruction);
  const setVoiceRate = useMobileStore((state) => state.setVoiceRate);
  const systemStatus = useMobileStore((state) => state.systemStatus);
  const toggleVoice = useMobileStore((state) => state.toggleVoice);
  const voiceEnabled = useMobileStore((state) => state.voiceEnabled);
  const voiceRate = useMobileStore((state) => state.voiceRate);
  const reduceMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState("Just now");
  const [shareState, setShareState] = useState("Share Status");

  useEffect(() => {
    if (!incident) {
      setDemoScenario("active_fire");
    }
  }, [incident, setDemoScenario]);

  useEffect(() => {
    const updateElapsed = () => setElapsed(elapsedSince(incident?.detectedAt));
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(timer);
  }, [incident?.detectedAt]);

  const title = incident?.title ?? "FIRE DETECTED";
  const zone = incident?.zone ?? "Kitchen Zone B";
  const floor = incident?.floor ?? "3";
  const instructions = incident?.instructions ?? ["Leave belongings behind.", "Follow the blue route to Stairwell B.", "Do not use elevators."];

  const handleShare = async () => {
    const message = `${title} at ${BUILDING_NAME}, ${zone}, Floor ${floor}. I am following Sentra route guidance.`;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ text: message, title: "Sentra Status" });
        setShareState("Shared");
        return;
      }
      await globalThis.navigator.clipboard?.writeText(message);
      setShareState("Copied");
    } catch {
      setShareState("Share Unavailable");
    }
  };

  return (
    <div className="space-y-5">
      <section className="relative min-h-[28rem] overflow-hidden rounded-[34px] border border-red-300/20 bg-[radial-gradient(circle_at_50%_16%,rgba(239,68,68,0.36),transparent_34%),linear-gradient(180deg,rgba(127,29,29,0.42),rgba(2,6,23,0.96))] p-5 text-center shadow-[0_30px_90px_rgba(127,29,29,0.28)]">
        <div className="absolute inset-x-0 top-8 flex justify-center" aria-hidden="true">
          <motion.div
            animate={reduceMotion ? undefined : { opacity: [0.25, 0.7, 0.25], scale: [0.9, 1.18, 0.9] }}
            className="h-44 w-44 rounded-full border border-red-200/35 bg-red-500/10 blur-[1px]"
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 flex justify-between gap-3 text-left">
          <span className="rounded-full border border-red-200/25 bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-50">Live Alert</span>
          <StatusChip status={systemStatus === "safe" ? "emergency" : systemStatus} />
        </div>

        <div className="relative z-10 mt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-100/70">Immediate action required</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.1em] text-white">{title}</h1>
          <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-6 text-red-50/85">
            {BUILDING_NAME} - {zone}, Floor {floor}
          </p>
        </div>
      </section>

      <AlertCountdown initialSeconds={eta || 130} />

      <GlassCard glow="critical">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-400">Severity</p>
            <p className="mt-1 font-bold text-red-100">{incident?.severityLevel ?? "critical"}</p>
          </div>
          <div>
            <p className="text-slate-400">Detected</p>
            <p className="mt-1 font-bold text-white">{elapsed}</p>
          </div>
          <div>
            <p className="text-slate-400">Zone</p>
            <p className="mt-1 font-bold text-white">{zone}</p>
          </div>
          <div>
            <p className="text-slate-400">Floor</p>
            <p className="mt-1 font-bold text-white">{floor}</p>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {instructions.map((instruction, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] border border-white/10 bg-white/[0.065] p-4 backdrop-blur-2xl"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            key={instruction}
            transition={{ delay: index * 0.06 }}
          >
            <p className="text-sm font-semibold text-white">
              {index + 1}. {instruction}
            </p>
          </motion.article>
        ))}
      </div>

      <VoiceGuidancePanel
        enabled={voiceEnabled}
        instructions={["Proceed to Exit B", "Avoid smoke ahead", "Turn left in 10 meters", "Assistance is on the way"]}
        lastInstruction={lastVoiceInstruction}
        onInstruction={setVoiceInstruction}
        rate={voiceRate}
        setRate={setVoiceRate}
        toggleVoice={toggleVoice}
      />

      <div className="grid grid-cols-2 gap-3">
        <Link className="grid min-h-14 place-items-center rounded-2xl bg-blue-500 px-4 text-sm font-bold text-white shadow-[0_0_34px_rgba(59,130,246,0.26)]" href="/route">
          View Safe Route
        </Link>
        <button
          className="min-h-14 rounded-2xl border border-red-300/30 bg-red-500/18 px-4 text-sm font-bold text-red-50"
          onClick={() => queueSOS("Need help from alert screen")}
          type="button"
        >
          Need Help
        </button>
        <button className="min-h-14 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-white" onClick={handleShare} type="button">
          {shareState}
        </button>
      </div>
    </div>
  );
}

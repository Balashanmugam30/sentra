"use client";

import { motion } from "framer-motion";

import type { ModeSwitcherValue } from "@/components/ui/mode-switcher";

type IntelligenceRibbonProps = {
  mode: ModeSwitcherValue;
};

const modeSignals: Record<ModeSwitcherValue, Array<{ label: string; value: string; tone: string }>> = {
  command: [
    { label: "Situation heartbeat", value: "Live", tone: "bg-emerald-300" },
    { label: "AI routing confidence", value: "94%", tone: "bg-cyan-200" },
    { label: "Responder pressure", value: "Balanced", tone: "bg-violet-200" },
  ],
  executive: [
    { label: "Briefing freshness", value: "Now", tone: "bg-cyan-200" },
    { label: "Continuity signal", value: "Strong", tone: "bg-emerald-300" },
    { label: "Exposure watch", value: "Active", tone: "bg-amber-300" },
  ],
  demo: [
    { label: "Story flow", value: "Ready", tone: "bg-violet-200" },
    { label: "Judge path", value: "2 min", tone: "bg-cyan-200" },
    { label: "Proof moments", value: "Armed", tone: "bg-emerald-300" },
  ],
  crisis: [
    { label: "War room state", value: "Focused", tone: "bg-red-300" },
    { label: "Command latency", value: "Low", tone: "bg-emerald-300" },
    { label: "Evac guidance", value: "Active", tone: "bg-amber-300" },
  ],
};

export function IntelligenceRibbon({ mode }: IntelligenceRibbonProps) {
  const signals = modeSignals[mode];

  return (
    <motion.section
      aria-label="Live situation room signals"
      aria-live="polite"
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] px-4 py-3 shadow-[0_18px_54px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 10 }}
      role="status"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-30" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-200" />
          </span>
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/46">
              Live situation room
            </p>
            <p className="mt-1 text-sm text-white/62">
              Sentra is streaming posture, confidence, and response readiness into this workspace.
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {signals.map((signal) => (
            <div
              className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2"
              key={signal.label}
            >
              <span className={`h-2 w-2 rounded-full ${signal.tone} shadow-[0_0_18px_rgba(125,211,252,0.28)]`} />
              <span className="text-xs text-white/42">{signal.label}</span>
              <span className="text-xs font-semibold text-white">{signal.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

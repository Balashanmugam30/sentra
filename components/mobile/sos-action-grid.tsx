"use client";

import { memo } from "react";

import { cn } from "@/lib/mobile/helpers";
import type { SosKind } from "@/lib/mobile/types";

const SOS_ACTIONS: Array<{ description: string; kind: SosKind; label: string; tone: "critical" | "high" | "normal" }> = [
  { description: "Blocked or unable to exit", kind: "trapped", label: "Trapped", tone: "critical" },
  { description: "Injury or bleeding", kind: "injured", label: "Injured", tone: "critical" },
  { description: "Need staff support", kind: "need_assistance", label: "Need Assistance", tone: "normal" },
  { description: "Mobility blocked", kind: "cannot_move", label: "Cannot Move", tone: "critical" },
  { description: "Smoke visible nearby", kind: "smoke_nearby", label: "Smoke Nearby", tone: "high" },
  { description: "Medical responder needed", kind: "medical_help", label: "Medical Help", tone: "high" },
];

type SosActionGridProps = {
  onSelect: (kind: SosKind, label: string) => void;
  selectedKind: SosKind | null;
};

export const SosActionGrid = memo(function SosActionGrid({ onSelect, selectedKind }: SosActionGridProps) {
  return (
    <section aria-labelledby="sos-actions-title">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">One-tap help</p>
      <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white" id="sos-actions-title">
        What do you need?
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {SOS_ACTIONS.map((action) => (
          <button
            aria-pressed={selectedKind === action.kind}
            className={cn(
              "min-h-24 rounded-[24px] border p-4 text-left transition",
              action.tone === "critical" && "border-red-300/25 bg-red-400/14 text-red-50 shadow-[0_0_28px_rgba(239,68,68,0.12)]",
              action.tone === "high" && "border-amber-300/25 bg-amber-400/12 text-amber-50",
              action.tone === "normal" && "border-blue-300/20 bg-blue-400/12 text-blue-50",
              selectedKind === action.kind && "ring-2 ring-white/50",
            )}
            key={action.kind}
            onClick={() => onSelect(action.kind, action.label)}
            type="button"
          >
            <span className="block text-base font-black tracking-[-0.04em]">{action.label}</span>
            <span className="mt-2 block text-xs leading-4 text-slate-300">{action.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
});

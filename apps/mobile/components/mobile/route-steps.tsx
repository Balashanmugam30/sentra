"use client";

import { memo } from "react";

import { cn } from "../../lib/mobile/helpers";
import type { MobileRouteStep } from "../../lib/mobile/types";
import { GlassCard } from "./glass-card";

type RouteStepsProps = {
  steps: MobileRouteStep[];
};

export const RouteSteps = memo(function RouteSteps({ steps }: RouteStepsProps) {
  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Guidance</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Turn-by-turn steps</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">{steps.length} steps</span>
      </div>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li
            className={cn(
              "rounded-3xl border p-4 transition",
              step.status === "current"
                ? "border-blue-300/30 bg-blue-400/12 shadow-[0_0_30px_rgba(59,130,246,0.14)]"
                : "border-white/10 bg-black/18",
            )}
            key={step.id}
          >
            <div className="flex gap-3">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-sm font-bold",
                  step.status === "current" ? "bg-blue-400 text-white" : "bg-white/10 text-slate-300",
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{step.detail}</p>
                <p className="mt-2 text-xs font-semibold text-slate-300">{step.distanceMeters}m segment</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </GlassCard>
  );
});

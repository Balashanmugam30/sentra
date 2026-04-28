"use client";

import type { IotMode } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

const modes: Array<{ mode: IotMode; label: string; description: string }> = [
  { mode: "REAL", label: "Real Mode", description: "Only backend and hardware telemetry" },
  { mode: "DEMO", label: "Demo Mode", description: "Live simulated smart-building stream" },
  { mode: "HYBRID", label: "Hybrid Mode", description: "Real data plus simulation overlays" },
];

export function SimulationToggle({
  mode,
  onModeChange,
}: {
  mode: IotMode;
  onModeChange: (mode: IotMode) => void;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Telemetry Mode</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {modes.map((item) => (
          <button
            aria-pressed={mode === item.mode}
            className={cn(
              "rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:bg-white/10",
              mode === item.mode
                ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-50 shadow-[0_0_35px_rgba(34,211,238,0.12)]"
                : "border-white/10 bg-black/20 text-white/65",
            )}
            key={item.mode}
            onClick={() => onModeChange(item.mode)}
            type="button"
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span className="mt-1 block text-xs leading-5 opacity-65">{item.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

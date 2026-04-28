"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";
import type { AutonomyMode } from "@/lib/ai/types";

const modes: Array<{ mode: AutonomyMode; label: string; detail: string }> = [
  { mode: "active", label: "Active", detail: "AI can recommend and prepare actions" },
  { mode: "advisory_only", label: "Advisory", detail: "AI suggests only; humans execute" },
  { mode: "paused", label: "Pause", detail: "Freeze autonomous recommendations" },
  { mode: "manual_control", label: "Manual", detail: "Human command has full control" },
];

export function HumanOverrideCenter() {
  const { busyAction, live, overrideMode } = useAutonomousAI();

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
            Human Override Center
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Governance controls for approve, pause, advisory, and emergency manual operation
          </h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          {live?.autonomy_mode?.replaceAll("_", " ") ?? "syncing"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {modes.map((item) => {
          const active = live?.autonomy_mode === item.mode;
          return (
            <button
              className={`rounded-[22px] border p-4 text-left transition ${
                active
                  ? "border-cyan-200/34 bg-cyan-200/12 text-white"
                  : "border-white/10 bg-white/[0.045] text-white/68 hover:bg-white/8"
              }`}
              disabled={busyAction !== null}
              key={item.mode}
              onClick={() => {
                void overrideMode(item.mode, `Operator switched autonomy to ${item.mode}`);
              }}
              type="button"
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-2 block text-xs leading-5 text-white/50">{item.detail}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[22px] border border-amber-200/18 bg-amber-200/8 p-4 text-sm leading-6 text-amber-50/78">
        All overrides are written to the forensic audit ledger with actor, role, reason, and risk score.
      </div>
    </section>
  );
}


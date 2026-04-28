"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";
import type { AutonomyMode } from "@/lib/ai/types";

const modes: Array<{ mode: AutonomyMode; label: string }> = [
  { mode: "advisory", label: "Advisory" },
  { mode: "approval_required", label: "Approval" },
  { mode: "semi_auto", label: "Semi Auto" },
  { mode: "full_auto", label: "Full Auto" },
  { mode: "lockdown_emergency", label: "Lockdown" },
];

export function AutonomousResponseCenter() {
  const { busyAction, executePlan, orchestration, setResponseMode } = useAutonomousAI();
  const actions = orchestration?.executed_actions ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.76)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
            Autonomous Response Center
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Observe → predict → compare → act → learn loop
          </h2>
          <p className="mt-2 text-sm text-white/56">
            State: {orchestration?.orchestration_state?.replaceAll("_", " ") ?? "syncing"}
          </p>
        </div>
        <button
          className="rounded-full border border-rose-200/22 bg-rose-200/10 px-4 py-2 text-sm font-semibold text-rose-50 disabled:opacity-50"
          disabled={busyAction !== null}
          onClick={() => {
            void executePlan();
          }}
          type="button"
        >
          {busyAction === "execute-plan" ? "Advancing Plan" : "Execute / Queue Plan"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
              orchestration?.autonomy_mode === item.mode
                ? "border-cyan-200/32 bg-cyan-200/14 text-cyan-50"
                : "border-white/10 bg-white/5 text-white/58"
            }`}
            disabled={busyAction !== null}
            key={item.mode}
            onClick={() => {
              void setResponseMode(item.mode);
            }}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={action.action_id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{action.title}</h3>
                <p className="mt-1 text-sm text-white/56">
                  {action.system} → {action.target}
                </p>
              </div>
              <span className="rounded-full border border-amber-200/18 bg-amber-200/8 px-3 py-1 text-xs uppercase tracking-[0.16em] text-amber-100/78">
                {action.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


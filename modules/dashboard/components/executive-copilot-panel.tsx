"use client";

import type { ExecutiveIntent } from "@/lib/ai/types";
import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

const intentOrder: ExecutiveIntent[] = [
  "stabilize_operations_now",
  "minimize_casualties",
  "protect_reputation",
  "preserve_revenue",
  "fastest_recovery",
];

export function ExecutiveCopilotPanel() {
  const { busyAction, copilot, executeCopilotIntent } = useAutonomousAI();
  const plans = copilot?.intent_plans ?? [];

  return (
    <section className="rounded-[32px] border border-amber-100/14 bg-[linear-gradient(135deg,rgba(10,13,25,0.86),rgba(245,158,11,0.08))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-amber-100/58">
            Executive One-Click Copilot
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white">
            Convert leadership intent into governed command plans
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
            {copilot?.summary ?? "Copilot is preparing executive intent plans."}
          </p>
        </div>
        <div className="rounded-full border border-amber-200/22 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50">
          Recommended {copilot?.recommended_intent?.replaceAll("_", " ") ?? "syncing"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-5">
        {intentOrder.map((intent) => {
          const plan = plans.find((item) => item.intent === intent);
          return (
            <button
              className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-200/28 hover:bg-amber-200/8 disabled:opacity-55"
              disabled={busyAction === `copilot-${intent}`}
              key={intent}
              onClick={() => {
                void executeCopilotIntent(intent);
              }}
              type="button"
            >
              <p className="text-sm font-semibold text-white">{plan?.label ?? intent.replaceAll("_", " ")}</p>
              <p className="mt-2 text-xs leading-5 text-white/52">{plan?.expected_outcome ?? "Preparing plan."}</p>
              <p className="mt-3 text-xs font-semibold text-amber-50">
                {busyAction === `copilot-${intent}` ? "Executing..." : `${plan?.approvals_needed ?? 0} approvals • ${plan?.eta ?? "--"}`}
              </p>
            </button>
          );
        })}
      </div>

      {copilot?.executed_plans?.length ? (
        <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-semibold text-white">Recent copilot executions</p>
          <div className="mt-3 space-y-2">
            {copilot.executed_plans.slice(0, 3).map((plan) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white/62" key={plan.execution_id}>
                {plan.label} • {plan.status} • {plan.next_action}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

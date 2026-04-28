"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

function trendMark(trend: string) {
  if (trend === "up") {
    return "Up";
  }
  if (trend === "down") {
    return "Down";
  }
  return "Stable";
}

export function PolicyEvolutionConsole() {
  const { busyAction, policies, retrainPolicies } = useAutonomousAI();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,11,21,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
            Policy Evolution Console
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Strategy weights adapt from success, failures, and overrides
          </h2>
        </div>
        <button
          className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-55"
          disabled={busyAction === "retrain-policies"}
          onClick={() => {
            void retrainPolicies();
          }}
          type="button"
        >
          {busyAction === "retrain-policies" ? "Retraining..." : "Retrain Policies"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {(policies?.strategy_weights ?? []).map((policy) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={policy.policy_id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold capitalize text-white">{policy.policy_name.replaceAll("_", " ")}</p>
              <span className="rounded-full border border-white/12 bg-black/18 px-3 py-1 text-xs text-white/72">
                {trendMark(policy.trend)}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(103,232,249,0.9),rgba(245,158,11,0.8))]"
                style={{ width: `${policy.current_weight}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/54">{policy.reason}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[22px] border border-amber-200/14 bg-amber-200/[0.055] p-4">
        <p className="text-sm font-semibold text-amber-50">Recommended updates</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-white/62">
          {(policies?.recommended_policy_updates ?? []).map((update, index) => (
            <li key={`${update}-${index}`}>{update}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

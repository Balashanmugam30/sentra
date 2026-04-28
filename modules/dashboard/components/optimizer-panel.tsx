"use client";

import { useOptimize } from "@/lib/agents/use-optimize";
import type { OptimizationScenario } from "@/lib/agents/types";

const scenarios: OptimizationScenario[] = [
  "critical_fire",
  "dual_incident",
  "gas_leak",
  "mass_panic",
  "resource_shortage",
  "citywide_pressure",
];

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for solver state";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for solver state";
  }
  return date.toLocaleString();
}

function meterStyles(value: number) {
  if (value >= 80) {
    return { color: "#bbf7d0", background: "rgba(20, 83, 45, 0.22)" };
  }
  if (value >= 60) {
    return { color: "#fcd34d", background: "rgba(120, 53, 15, 0.2)" };
  }
  return { color: "#fca5a5", background: "rgba(127, 29, 29, 0.24)" };
}

export function OptimizerPanel() {
  const { live, loading, error, lastAction, refresh, resetOptimization, runScenario } = useOptimize();
  const efficiencyStyles = meterStyles(live?.global_efficiency_score ?? 0);

  return (
    <section
      className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-panel)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[27px]"
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface-soft)",
        }}
      />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              Resource Optimization Brain
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Tactical allocation solver for responders, vehicles, drones, and reserve posture
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Refreshed {formatTimestamp(live?.generated_at)}
            </p>
          </div>

          <div
            className="rounded-full border px-4 py-2 text-sm font-medium"
            style={{
              borderColor: "rgba(148, 163, 184, 0.2)",
              background: efficiencyStyles.background,
              color: efficiencyStyles.color,
            }}
          >
            {loading ? "Refreshing solver" : `Efficiency ${live?.global_efficiency_score ?? 0}%`}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Reserve Readiness", `${live?.reserve_readiness ?? 0}%`],
            ["Containment ETA", `${live?.estimated_containment_minutes ?? 0} min`],
            ["Evac Support", `${live?.estimated_evacuation_support ?? 0}%`],
            ["Cost Index", live?.cost_index ?? 0],
          ].map(([label, value], index) => (
            <div
              className="rounded-[22px] border px-4 py-4"
              key={`${label}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                {label}
              </div>
              <div className="mt-3 text-lg font-medium text-[var(--text)]">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div
            className="rounded-[24px] border p-5"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-[var(--text)]">Top allocations</h3>
              <div className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                {live?.plan_id ?? "No plan"}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(live?.allocations ?? []).map((allocation, index) => (
                <div
                  className="rounded-[20px] border p-4"
                  key={`${allocation.zone}-${allocation.resource_type}-${index}`}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                  }}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-base font-medium text-[var(--text)]">
                        {allocation.zone} {"->"} {allocation.resource_type.replaceAll("_", " ")} x
                        {allocation.units_assigned}
                      </div>
                      <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                        {allocation.route_hint} | ETA {allocation.eta_minutes}m | Impact {allocation.impact_score}
                      </div>
                    </div>
                    <div
                      className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                      style={{
                        borderColor: "rgba(96, 165, 250, 0.24)",
                        background: "rgba(30, 64, 175, 0.14)",
                        color: "#bfdbfe",
                      }}
                    >
                      tactical allocation
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-[var(--text)]">{allocation.rationale}</div>
                  <div className="mt-2 text-xs" style={{ color: "var(--sentra-text-muted)" }}>
                    Opportunity cost: {allocation.opportunity_cost}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Unserved demands</h3>
              <div className="mt-4 space-y-2">
                {(live?.unserved_demands ?? []).map((item, index) => (
                  <div
                    className="rounded-[16px] border px-3 py-2 text-sm"
                    key={`${item}-${index}`}
                    style={{
                      borderColor: "rgba(248, 113, 113, 0.22)",
                      background: "rgba(127, 29, 29, 0.16)",
                      color: "#fecaca",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Tradeoffs</h3>
              <div className="mt-4 space-y-2">
                {(live?.tradeoffs ?? []).map((item, index) => (
                  <div
                    className="rounded-[16px] border px-3 py-2 text-sm"
                    key={`${item}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--sentra-text-muted)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Recommended follow-ups</h3>
              <div className="mt-4 space-y-2">
                {(live?.recommended_followups ?? []).map((item, index) => (
                  <div
                    className="rounded-[16px] border px-3 py-2 text-sm"
                    key={`${item}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-6 rounded-[24px] border p-5"
          style={{
            borderColor: "var(--sentra-border-subtle)",
            background: "var(--surface-soft)",
          }}
        >
          <div className="flex flex-wrap gap-2">
            {scenarios.map((scenario, index) => (
              <button
                className="rounded-full border px-4 py-2 text-sm font-medium"
                key={`${scenario}-${index}`}
                onClick={() => {
                  void runScenario(scenario);
                }}
                style={{
                  borderColor: "rgba(148, 163, 184, 0.18)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text)",
                }}
                type="button"
              >
                {scenario.replaceAll("_", " ")}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-[var(--text)]">{live?.summary}</div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => {
                void resetOptimization();
              }}
              style={{
                borderColor: "rgba(148, 163, 184, 0.28)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--sentra-text-muted)",
              }}
              type="button"
            >
              Reset
            </button>
            <button
              className="rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => {
                void refresh();
              }}
              style={{
                borderColor: "rgba(96, 165, 250, 0.26)",
                background: "rgba(30, 64, 175, 0.18)",
                color: "#dbeafe",
              }}
              type="button"
            >
              Refresh
            </button>
          </div>

          {lastAction ? (
            <p className="mt-3 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Last action: {lastAction}
            </p>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm" style={{ color: "#fca5a5" }}>
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

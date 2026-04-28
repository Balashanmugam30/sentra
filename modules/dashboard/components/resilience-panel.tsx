"use client";

import { useOperations } from "@/lib/operations/use-operations";
import { useResilience } from "@/lib/resilience/use-resilience";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for resilience state";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for resilience state";
  }
  return date.toLocaleString();
}

function stateStyles(state: string) {
  if (state === "critical" || state === "open" || state === "offline") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.28)",
      background: "rgba(127, 29, 29, 0.26)",
    };
  }
  if (state === "degraded" || state === "recovering" || state === "half_open") {
    return {
      color: "#fcd34d",
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
    };
  }
  return {
    color: "#bbf7d0",
    borderColor: "rgba(74, 222, 128, 0.22)",
    background: "rgba(20, 83, 45, 0.2)",
  };
}

export function ResiliencePanel() {
  const { live, loading, error, lastAction, refresh, resetCircuit, runTest, recoverWorkflow } =
    useResilience();
  const { live: operations } = useOperations();
  const globalStyles = stateStyles(live?.global_state ?? "healthy");
  const recoverableWorkflow = (operations?.workflows ?? []).find(
    (workflow) => workflow.status === "paused" || workflow.status === "awaiting_approval" || workflow.status === "running",
  );

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
              Self-Healing Operations Center
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Resilience metrics, circuit health, fallback posture, and recovery actions
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Refreshed {formatTimestamp(live?.generated_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                color: globalStyles.color,
                borderColor: globalStyles.borderColor,
                background: globalStyles.background,
              }}
            >
              {loading ? "Refreshing" : live?.global_state ?? "healthy"}
            </span>
            <button
              className="rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => {
                void runTest("provider_failure");
              }}
              style={{
                borderColor: "rgba(245, 158, 11, 0.24)",
                background: "rgba(120, 53, 15, 0.18)",
                color: "#fcd34d",
              }}
              type="button"
            >
              Run Failure Test
            </button>
            <button
              className="rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => {
                void resetCircuit("slack");
              }}
              style={{
                borderColor: "rgba(96, 165, 250, 0.26)",
                background: "rgba(30, 64, 175, 0.18)",
                color: "#dbeafe",
              }}
              type="button"
            >
              Reset Circuit
            </button>
            {recoverableWorkflow ? (
              <button
                className="rounded-full border px-4 py-2 text-sm font-medium"
                onClick={() => {
                  void recoverWorkflow(recoverableWorkflow.workflow_id);
                }}
                style={{
                  borderColor: "rgba(74, 222, 128, 0.22)",
                  background: "rgba(20, 83, 45, 0.2)",
                  color: "#bbf7d0",
                }}
                type="button"
              >
                Recover Workflow
              </button>
            ) : null}
            <button
              className="rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => {
                void refresh();
              }}
              style={{
                borderColor: "rgba(148, 163, 184, 0.28)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--sentra-text-muted)",
              }}
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ["Retries Attempted", live?.metrics?.retries_attempted ?? 0],
            ["Fallbacks Used", live?.metrics?.fallbacks_used ?? 0],
            ["Circuits Open", live?.metrics?.circuits_open ?? 0],
            ["Stalled Workflows", live?.metrics?.stalled_workflows ?? 0],
            ["Timeouts Today", live?.metrics?.timeouts_today ?? 0],
            ["Recoveries Completed", live?.metrics?.recoveries_completed ?? 0],
          ].map(([label, value], index) => (
            <div
              className="rounded-[22px] border px-4 py-4"
              key={`${label}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div
                className="text-[0.68rem] uppercase tracking-[0.16em]"
                style={{ color: "var(--sentra-text-soft)" }}
              >
                {label}
              </div>
              <div className="mt-3 text-lg font-medium text-[var(--text)]">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div
            className="rounded-[24px] border p-5"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface-soft)",
            }}
          >
            <h3 className="text-sm font-medium text-[var(--text)]">Provider Health</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {(live?.providers ?? []).map((provider, index) => {
                const providerStyles = stateStyles(provider.circuit_state);
                return (
                  <div
                    className="rounded-[20px] border p-4"
                    key={`${provider.name}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[var(--text)]">
                          {provider.name}
                        </div>
                        <div
                          className="mt-1 text-[0.68rem] uppercase tracking-[0.16em]"
                          style={{ color: "var(--sentra-text-soft)" }}
                        >
                          failures {provider.failures}
                        </div>
                      </div>
                      <span
                        className="rounded-full border px-2 py-1 text-[0.6rem] uppercase tracking-[0.16em]"
                        style={{
                          color: providerStyles.color,
                          borderColor: providerStyles.borderColor,
                          background: providerStyles.background,
                        }}
                      >
                        {provider.circuit_state.replaceAll("_", " ")}
                      </span>
                    </div>
                    <div className="mt-3 text-sm capitalize text-[var(--text)]">
                      {provider.status}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: "var(--sentra-text-muted)" }}>
                      Last success{" "}
                      {provider.last_success_at
                        ? new Date(provider.last_success_at).toLocaleString()
                        : "not yet"}
                    </div>
                  </div>
                );
              })}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Active Incident Pressure</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {(live?.active_incidents ?? []).map((item, index) => (
                  <span
                    className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                    key={`${item}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--sentra-text-muted)",
                    }}
                  >
                    {item}
                  </span>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Recommended Actions</h3>
              <div className="mt-4 space-y-3">
                {(live?.recommended_actions ?? []).map((item, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
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

        {lastAction ? (
          <p className="mt-4 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
            Last action: {lastAction}
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

"use client";

import { useOperations } from "@/lib/operations/use-operations";

function formatTimestamp(timestamp: string | null) {
  if (!timestamp) {
    return "In progress";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "In progress";
  }

  return date.toLocaleString();
}

export function WorkflowHistoryPanel() {
  const { history } = useOperations();

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
        <div className="space-y-2">
          <p
            className="text-[0.7rem] uppercase tracking-[0.26em]"
            style={{ color: "var(--sentra-text-soft)" }}
          >
            Workflow History Ledger
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Completed, Cancelled, and Finalized Workflow Outcomes
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {(history?.workflows ?? []).map((workflow, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${workflow.workflow_id}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-lg font-medium text-[var(--text)]">
                    {workflow.title}
                  </div>
                  <div
                    className="mt-2 text-sm"
                    style={{ color: "var(--sentra-text-muted)" }}
                  >
                    {workflow.trigger_source} · {workflow.status.replaceAll("_", " ")}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Completed", formatTimestamp(workflow.completed_at)],
                    ["Outcome", workflow.status.replaceAll("_", " ")],
                    ["Progress", `${workflow.progress_percent}%`],
                  ].map(([label, value], metricIndex) => (
                    <div
                      className="rounded-[18px] border px-4 py-3"
                      key={`${workflow.workflow_id}-${label}-${metricIndex}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                      }}
                    >
                      <div
                        className="text-[0.64rem] uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        {label}
                      </div>
                      <div className="mt-2 text-sm text-[var(--text)]">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useOperations } from "@/lib/operations/use-operations";
import type {
  WorkflowGlobalState,
  WorkflowPriority,
  WorkflowStatus,
} from "@/lib/operations/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for operations state";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for operations state";
  }

  return date.toLocaleString();
}

function priorityStyles(priority: WorkflowPriority) {
  if (priority === "critical") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.28)",
      background: "rgba(127, 29, 29, 0.26)",
    };
  }
  if (priority === "high") {
    return {
      color: "#fcd34d",
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
    };
  }
  if (priority === "medium") {
    return {
      color: "#bfdbfe",
      borderColor: "rgba(96, 165, 250, 0.24)",
      background: "rgba(30, 64, 175, 0.16)",
    };
  }
  return {
    color: "#bbf7d0",
    borderColor: "rgba(74, 222, 128, 0.22)",
    background: "rgba(20, 83, 45, 0.2)",
  };
}

function stateStyles(state: WorkflowGlobalState | WorkflowStatus) {
  if (state === "critical" || state === "failed") {
    return priorityStyles("critical");
  }
  if (state === "elevated" || state === "awaiting_approval") {
    return priorityStyles("high");
  }
  if (state === "running" || state === "queued") {
    return priorityStyles("medium");
  }
  return priorityStyles("low");
}

export function OperationsPanel() {
  const { live, loading, error, lastAction, runTest, approve, cancel, refresh } =
    useOperations();
  const globalStyles = stateStyles(live?.global_state ?? "stable");

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
              Autonomous Operations Center
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Workflow Control, Approval Queue, and Crisis Execution State
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
              {loading ? "Refreshing" : live?.global_state ?? "stable"}
            </span>
            <button
              className="rounded-full border px-4 py-2 text-sm font-medium"
              onClick={() => {
                void runTest("critical_fire");
              }}
              style={{
                borderColor: "rgba(96, 165, 250, 0.26)",
                background: "rgba(30, 64, 175, 0.18)",
                color: "#dbeafe",
              }}
              type="button"
            >
              Run Critical Fire Test
            </button>
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Active Workflows", live?.active_workflows_count ?? 0],
            ["Awaiting Approvals", live?.awaiting_approvals_count ?? 0],
            ["Completed Today", live?.completed_today ?? 0],
            ["Failed Today", live?.failed_today ?? 0],
            ["Global State", live?.global_state ?? "stable"],
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
              <div className="mt-3 text-lg font-medium capitalize text-[var(--text)]">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {(live?.workflows ?? []).map((workflow, workflowIndex) => {
            const priority = priorityStyles(workflow.priority);
            const status = stateStyles(workflow.status);
            const approvalStep = workflow.steps.find(
              (step) => step.status === "awaiting_approval",
            );

            return (
              <div
                className="rounded-[24px] border p-5"
                key={`${workflow.workflow_id}-${workflowIndex}`}
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface-soft)",
                }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                        style={{
                          color: priority.color,
                          borderColor: priority.borderColor,
                          background: priority.background,
                        }}
                      >
                        {workflow.priority}
                      </span>
                      <span
                        className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                        style={{
                          color: status.color,
                          borderColor: status.borderColor,
                          background: status.background,
                        }}
                      >
                        {workflow.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-[var(--text)]">
                        {workflow.title}
                      </h3>
                      <p
                        className="mt-2 text-sm"
                        style={{ color: "var(--sentra-text-muted)" }}
                      >
                        {workflow.trigger_source} · target {workflow.affected_target}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["Progress", `${workflow.progress_percent}%`],
                        ["Current Step", workflow.current_step ?? "Awaiting finalization"],
                        ["Started", formatTimestamp(workflow.started_at ?? workflow.created_at)],
                      ].map(([label, value], index) => (
                        <div
                          className="rounded-[18px] border px-4 py-3"
                          key={`${workflow.workflow_id}-${label}-${index}`}
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

                  <div className="w-full max-w-[280px] space-y-3">
                    <div
                      className="h-2 overflow-hidden rounded-full"
                      style={{ background: "rgba(148, 163, 184, 0.14)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${workflow.progress_percent}%`,
                          background:
                            workflow.priority === "critical"
                              ? "linear-gradient(90deg, #f87171, #fb7185)"
                              : workflow.priority === "high"
                                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                : "linear-gradient(90deg, #60a5fa, #38bdf8)",
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      {workflow.steps.map((step, stepIndex) => (
                        <div
                          className="rounded-[16px] border px-3 py-3"
                          key={`${workflow.workflow_id}-${step.step_id}-${stepIndex}`}
                          style={{
                            borderColor: "var(--sentra-border-subtle)",
                            background: "var(--surface)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium text-[var(--text)]">
                                {step.title}
                              </div>
                              <div
                                className="mt-1 text-[0.68rem] uppercase tracking-[0.16em]"
                                style={{ color: "var(--sentra-text-soft)" }}
                              >
                                {step.type} · {step.assigned_system}
                              </div>
                            </div>
                            <span
                              className="text-[0.64rem] uppercase tracking-[0.16em]"
                              style={{ color: "var(--sentra-text-muted)" }}
                            >
                              {step.status.replaceAll("_", " ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {approvalStep ? (
                        <button
                          className="rounded-full border px-4 py-2 text-sm font-medium"
                          onClick={() => {
                            void approve(workflow.workflow_id, approvalStep.step_id);
                          }}
                          style={{
                            borderColor: "rgba(74, 222, 128, 0.22)",
                            background: "rgba(20, 83, 45, 0.2)",
                            color: "#bbf7d0",
                          }}
                          type="button"
                        >
                          Approve
                        </button>
                      ) : null}
                      <button
                        className="rounded-full border px-4 py-2 text-sm font-medium"
                        onClick={() => {
                          void cancel(workflow.workflow_id);
                        }}
                        style={{
                          borderColor: "rgba(248, 113, 113, 0.24)",
                          background: "rgba(127, 29, 29, 0.16)",
                          color: "#fecaca",
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {lastAction ? (
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Last action: {lastAction}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

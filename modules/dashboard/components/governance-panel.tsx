"use client";

import { useGovernance } from "@/lib/governance/use-governance";
import { nextRole } from "@/lib/governance/utils";
import { useOperations } from "@/lib/operations/use-operations";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for governance stream";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for governance stream";
  }

  return date.toLocaleString();
}

function ageLabel(timestamp: string) {
  const now = Date.now();
  const requested = new Date(timestamp).getTime();
  if (Number.isNaN(requested)) {
    return "Age unavailable";
  }
  const minutes = Math.max(0, Math.round((now - requested) / 60000));
  return minutes === 0 ? "Just now" : `${minutes}m ago`;
}

function statusStyles(status: string) {
  if (status === "critical" || status === "pending") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.28)",
      background: "rgba(127, 29, 29, 0.26)",
    };
  }
  if (status === "elevated" || status === "paused" || status === "awaiting_approval") {
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

export function GovernancePanel() {
  const { live, loading, error, lastAction, approve, override, pause, reassign, refresh, reject, resume } =
    useGovernance();
  const { live: operations } = useOperations();
  const globalStyles = statusStyles(live?.global_status ?? "stable");
  const pausedWorkflows = (operations?.workflows ?? []).filter(
    (workflow) => workflow.status === "paused",
  );
  const controllableWorkflows = (operations?.workflows ?? []).filter(
    (workflow) => workflow.status === "running" || workflow.status === "awaiting_approval" || workflow.status === "paused",
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
              Human Approval Command Center
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Approval Gates, Workflow Controls, and Governance Load
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
              {loading ? "Refreshing" : live?.global_status ?? "stable"}
            </span>
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Pending Approvals", live?.pending_approvals_count ?? 0],
            ["Paused Workflows", live?.paused_workflows_count ?? pausedWorkflows.length],
            ["Overrides Today", live?.overrides_today ?? 0],
            ["Role Loads", live?.role_loads?.reduce((sum, item) => sum + item.pending_count, 0) ?? 0],
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
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-[var(--text)]">Approval Queue</h3>
              <div className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                {(live?.recent_requests ?? []).filter((request) => request.status === "pending").length} pending
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {(live?.recent_requests ?? [])
                .filter((request) => request.status === "pending")
                .map((request, index) => {
                  const requestStyles = statusStyles(request.status);
                  const reassignedRole = nextRole(request.required_role);

                  return (
                    <div
                      className="rounded-[22px] border p-4"
                      key={`${request.approval_id}-${index}`}
                      style={{
                        borderColor: requestStyles.borderColor,
                        background: "var(--surface)",
                      }}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em]"
                              style={{
                                color: requestStyles.color,
                                borderColor: requestStyles.borderColor,
                                background: requestStyles.background,
                              }}
                            >
                              {request.required_role}
                            </span>
                            <span
                              className="text-[0.68rem] uppercase tracking-[0.16em]"
                              style={{ color: "var(--sentra-text-soft)" }}
                            >
                              {ageLabel(request.requested_at)}
                            </span>
                          </div>
                          <h4 className="text-base font-medium text-[var(--text)]">
                            {request.action_name.replaceAll("_", " ")}
                          </h4>
                          <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                            Workflow {request.workflow_id} · Step {request.step_id}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-full border px-4 py-2 text-sm font-medium"
                            onClick={() => {
                              void approve(request.approval_id, request.required_role === "facility_admin" ? "facility_admin" : request.required_role === "security_lead" ? "security_lead" : request.required_role === "executive" ? "executive" : "commander", "Proceed immediately");
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
                          <button
                            className="rounded-full border px-4 py-2 text-sm font-medium"
                            onClick={() => {
                              void reject(request.approval_id, request.required_role === "executive" ? "executive" : "commander", "Need more intel");
                            }}
                            style={{
                              borderColor: "rgba(248, 113, 113, 0.24)",
                              background: "rgba(127, 29, 29, 0.16)",
                              color: "#fecaca",
                            }}
                            type="button"
                          >
                            Reject
                          </button>
                          <button
                            className="rounded-full border px-4 py-2 text-sm font-medium"
                            onClick={() => {
                              void reassign(request.approval_id, reassignedRole);
                            }}
                            style={{
                              borderColor: "rgba(96, 165, 250, 0.26)",
                              background: "rgba(30, 64, 175, 0.18)",
                              color: "#dbeafe",
                            }}
                            type="button"
                          >
                            Reassign
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {!(live?.recent_requests ?? []).some((request) => request.status === "pending") ? (
                <div
                  className="rounded-[22px] border px-4 py-4 text-sm"
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--sentra-text-muted)",
                  }}
                >
                  No approvals are waiting right now.
                </div>
              ) : null}
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
              <h3 className="text-sm font-medium text-[var(--text)]">Workflow Controls</h3>
              <div className="mt-4 space-y-3">
                {controllableWorkflows.slice(0, 6).map((workflow, index) => (
                  <div
                    className="rounded-[20px] border p-4"
                    key={`${workflow.workflow_id}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="text-sm font-medium text-[var(--text)]">{workflow.title}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--sentra-text-soft)" }}>
                          {workflow.status.replaceAll("_", " ")} · {workflow.affected_target}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {workflow.status === "paused" ? (
                          <button
                            className="rounded-full border px-4 py-2 text-sm font-medium"
                            onClick={() => {
                              void resume(workflow.workflow_id, "operator");
                            }}
                            style={{
                              borderColor: "rgba(74, 222, 128, 0.22)",
                              background: "rgba(20, 83, 45, 0.2)",
                              color: "#bbf7d0",
                            }}
                            type="button"
                          >
                            Resume
                          </button>
                        ) : (
                          <button
                            className="rounded-full border px-4 py-2 text-sm font-medium"
                            onClick={() => {
                              void pause(workflow.workflow_id, "operator");
                            }}
                            style={{
                              borderColor: "rgba(245, 158, 11, 0.24)",
                              background: "rgba(120, 53, 15, 0.18)",
                              color: "#fcd34d",
                            }}
                            type="button"
                          >
                            Pause
                          </button>
                        )}
                        <button
                          className="rounded-full border px-4 py-2 text-sm font-medium"
                          onClick={() => {
                            void override(workflow.workflow_id, "executive", "Immediate life safety threat");
                          }}
                          style={{
                            borderColor: "rgba(248, 113, 113, 0.24)",
                            background: "rgba(127, 29, 29, 0.16)",
                            color: "#fecaca",
                          }}
                          type="button"
                        >
                          Emergency Override
                        </button>
                      </div>
                    </div>
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
              <h3 className="text-sm font-medium text-[var(--text)]">Role Loads</h3>
              <div className="mt-4 space-y-3">
                {(live?.role_loads ?? []).map((item, index) => (
                  <div
                    className="flex items-center justify-between rounded-[18px] border px-4 py-3"
                    key={`${item.role}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <span className="text-sm text-[var(--text)]">{item.role}</span>
                    <span className="text-sm font-medium text-[var(--text)]">{item.pending_count}</span>
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

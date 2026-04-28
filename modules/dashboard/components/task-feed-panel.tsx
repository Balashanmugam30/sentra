"use client";

import { useField } from "@/lib/field/use-field";

function priorityStyles(priority: string) {
  if (priority === "critical") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.28)",
      background: "rgba(127, 29, 29, 0.2)",
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

export function TaskFeedPanel() {
  const { tasks, syncEvents } = useField();

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
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              Mission Task Feed
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Priority dispatch queue with route hints, role alignment, and offline sync support
            </h2>
          </div>
          <button
            className="rounded-full border px-4 py-3 text-sm font-medium"
            onClick={() => {
              void syncEvents("RSP-201", [
                {
                  event_type: "status",
                  task_id: tasks?.tasks?.[0]?.task_id ?? null,
                  status: "active",
                  note: "Synced after weak connectivity",
                },
              ]);
            }}
            style={{
              borderColor: "rgba(96, 165, 250, 0.24)",
              background: "rgba(30, 64, 175, 0.16)",
              color: "#dbeafe",
            }}
            type="button"
          >
            Sync Offline Queue
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {(tasks?.tasks ?? []).map((task, index) => {
            const styles = priorityStyles(task.priority);
            return (
              <div
                className="rounded-[22px] border p-4"
                key={`${task.task_id}-${index}`}
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
                          color: styles.color,
                          borderColor: styles.borderColor,
                          background: styles.background,
                        }}
                      >
                        {task.priority}
                      </span>
                      <span
                        className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                        style={{
                          borderColor: "var(--sentra-border-subtle)",
                          background: "rgba(255,255,255,0.04)",
                          color: "var(--sentra-text-muted)",
                        }}
                      >
                        {task.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-[var(--text)]">{task.title}</h3>
                      <p className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                        {task.zone} | {task.role.replaceAll("_", " ")} | ETA {task.eta_minutes}m
                      </p>
                    </div>
                    <div className="text-sm text-[var(--text)]">{task.instructions}</div>
                  </div>

                  <div className="w-full max-w-[320px] space-y-3">
                    <div
                      className="rounded-[18px] border px-4 py-3"
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                      }}
                    >
                      <div
                        className="text-[0.64rem] uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        Route hint
                      </div>
                      <div className="mt-2 text-sm text-[var(--text)]">{task.route_hint}</div>
                    </div>
                    <div
                      className="rounded-[18px] border px-4 py-3"
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                      }}
                    >
                      <div
                        className="text-[0.64rem] uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        Assignment
                      </div>
                      <div className="mt-2 text-sm text-[var(--text)]">
                        {task.assigned_to ?? "Unassigned field unit"}
                      </div>
                    </div>
                    <div
                      className="rounded-[18px] border px-4 py-3"
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                      }}
                    >
                      <div
                        className="text-[0.64rem] uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        Source
                      </div>
                      <div className="mt-2 text-sm text-[var(--text)]">
                        {task.source_system.replaceAll("_", " ")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

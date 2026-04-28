"use client";

import { useField } from "@/lib/field/use-field";

function signalLabel(signal: string) {
  return signal.replaceAll("_", " ");
}

export function ResponderGridPanel() {
  const { responders, tasks, acknowledge, checkpoint, requestBackup, updateStatus } = useField();

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
            Live Responder Grid
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Ground team availability, task ownership, and fast-tap mission updates
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(responders?.responders ?? []).map((responder, index) => {
            const activeTask =
              (tasks?.tasks ?? []).find((task) => task.task_id === responder.active_task_id) ??
              (tasks?.tasks ?? []).find(
                (task) =>
                  task.assigned_to === responder.responder_id ||
                  (!task.assigned_to && task.role === responder.role && task.zone === responder.current_zone),
              ) ??
              null;

            return (
              <div
                className="rounded-[22px] border p-4"
                key={`${responder.responder_id}-${index}`}
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface-soft)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-medium text-[var(--text)]">{responder.responder_id}</div>
                    <div className="mt-1 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                      {responder.name} | {responder.role.replaceAll("_", " ")}
                    </div>
                  </div>
                  <div
                    className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                    style={{
                      borderColor:
                        responder.status === "offline"
                          ? "rgba(248, 113, 113, 0.28)"
                          : "rgba(74, 222, 128, 0.22)",
                      background:
                        responder.status === "offline"
                          ? "rgba(127, 29, 29, 0.2)"
                          : "rgba(20, 83, 45, 0.18)",
                      color: responder.status === "offline" ? "#fecaca" : "#bbf7d0",
                    }}
                  >
                    {responder.status.replaceAll("_", " ")}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  <div>{responder.call_sign}</div>
                  <div>{responder.current_zone}</div>
                  <div>Battery {responder.battery}%</div>
                  <div>Signal {signalLabel(responder.signal)}</div>
                  <div>Task {activeTask?.task_id ?? responder.active_task_id ?? "Awaiting mission"}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-full border px-3 py-3 text-xs font-medium"
                    disabled={!activeTask}
                    onClick={() => {
                      if (activeTask) {
                        void acknowledge(activeTask.task_id, responder.responder_id);
                      }
                    }}
                    style={{
                      borderColor: "rgba(148, 163, 184, 0.18)",
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--text)",
                      opacity: activeTask ? 1 : 0.5,
                    }}
                    type="button"
                  >
                    Acknowledge
                  </button>
                  <button
                    className="rounded-full border px-3 py-3 text-xs font-medium"
                    disabled={!activeTask}
                    onClick={() => {
                      if (activeTask) {
                        void updateStatus({
                          task_id: activeTask.task_id,
                          responder_id: responder.responder_id,
                          status: "enroute",
                          note: "Moving through assigned route",
                        });
                      }
                    }}
                    style={{
                      borderColor: "rgba(96, 165, 250, 0.24)",
                      background: "rgba(30, 64, 175, 0.16)",
                      color: "#dbeafe",
                      opacity: activeTask ? 1 : 0.5,
                    }}
                    type="button"
                  >
                    Enroute
                  </button>
                  <button
                    className="rounded-full border px-3 py-3 text-xs font-medium"
                    disabled={!activeTask}
                    onClick={() => {
                      if (activeTask) {
                        void updateStatus({
                          task_id: activeTask.task_id,
                          responder_id: responder.responder_id,
                          status: "arrived",
                          note: "On scene and verifying perimeter",
                        });
                        void checkpoint(
                          responder.responder_id,
                          activeTask.zone,
                          `QR-${activeTask.zone.replaceAll(" ", "").toUpperCase()}-AUTO-01`,
                        );
                      }
                    }}
                    style={{
                      borderColor: "rgba(251, 191, 36, 0.24)",
                      background: "rgba(146, 64, 14, 0.16)",
                      color: "#fde68a",
                      opacity: activeTask ? 1 : 0.5,
                    }}
                    type="button"
                  >
                    Arrived
                  </button>
                  <button
                    className="rounded-full border px-3 py-3 text-xs font-medium"
                    disabled={!activeTask}
                    onClick={() => {
                      if (activeTask) {
                        void updateStatus({
                          task_id: activeTask.task_id,
                          responder_id: responder.responder_id,
                          status: "completed",
                          note: "Mission complete",
                        });
                      }
                    }}
                    style={{
                      borderColor: "rgba(74, 222, 128, 0.22)",
                      background: "rgba(20, 83, 45, 0.2)",
                      color: "#bbf7d0",
                      opacity: activeTask ? 1 : 0.5,
                    }}
                    type="button"
                  >
                    Complete
                  </button>
                </div>

                <button
                  className="mt-3 w-full rounded-[16px] border px-3 py-3 text-sm font-medium"
                  onClick={() => {
                    void requestBackup(
                      responder.responder_id,
                      activeTask?.zone ?? responder.current_zone,
                      "Need second suppression unit",
                    );
                  }}
                  style={{
                    borderColor: "rgba(248, 113, 113, 0.24)",
                    background: "rgba(127, 29, 29, 0.16)",
                    color: "#fecaca",
                  }}
                  type="button"
                >
                  Request Backup
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


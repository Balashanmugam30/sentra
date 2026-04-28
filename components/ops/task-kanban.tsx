"use client";

import { recommendBackupOwner } from "@/lib/ops/assignment";
import { getSlaTone } from "@/lib/ops/sla";
import type { OpsTaskBoard, OpsTaskStatus } from "@/lib/ops/types";

type TaskKanbanProps = {
  board: OpsTaskBoard;
  busyAction: string | null;
  onApprove: (taskId: string) => void;
  onPause: (taskId: string) => void;
  onReassign: (taskId: string, owner: string) => void;
};

const columns: Array<[OpsTaskStatus, string]> = [
  ["queued", "Queued"],
  ["running", "Running"],
  ["blocked", "Blocked"],
  ["awaiting_approval", "Awaiting Approval"],
  ["completed", "Completed"],
];

export function TaskKanban({ board, busyAction, onApprove, onPause, onReassign }: TaskKanbanProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Live Task Board</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Mission-critical Kanban</h2>
      <div className="mt-5 grid gap-4 xl:grid-cols-5">
        {columns.map(([key, label]) => (
          <div key={key} className="rounded-3xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">{label}</h3>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">{board[key].length}</span>
            </div>
            <div className="mt-3 space-y-3">
              {board[key].map((task) => (
                <article key={task.task_id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{task.owner}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${getSlaTone(task)}`}>
                      {task.sla_status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{task.notes}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.status === "awaiting_approval" ? (
                      <button
                        type="button"
                        onClick={() => onApprove(task.task_id)}
                        disabled={busyAction === task.task_id}
                        className="rounded-xl bg-emerald-300 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
                      >
                        Approve
                      </button>
                    ) : null}
                    {task.status === "blocked" ? (
                      <button
                        type="button"
                        onClick={() => onReassign(task.task_id, recommendBackupOwner(task))}
                        disabled={busyAction === task.task_id}
                        className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50 disabled:opacity-60"
                      >
                        Reassign
                      </button>
                    ) : null}
                    {task.status !== "completed" ? (
                      <button
                        type="button"
                        onClick={() => onPause(task.task_id)}
                        disabled={busyAction === task.task_id}
                        className="rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-100 disabled:opacity-60"
                      >
                        Pause
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

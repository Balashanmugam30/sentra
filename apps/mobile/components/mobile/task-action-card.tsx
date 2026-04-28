"use client";

import { memo } from "react";

import { cn } from "../../lib/mobile/helpers";
import { PRIORITY_LABELS, STAFF_TASK_STATUS_LABELS } from "../../lib/mobile/tasks";
import type { StaffTask } from "../../lib/mobile/types";

type TaskActionCardProps = {
  onAccept: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onEscalate: (taskId: string) => void;
  task: StaffTask;
};

export const TaskActionCard = memo(function TaskActionCard({ onAccept, onComplete, onEscalate, task }: TaskActionCardProps) {
  return (
    <article
      className={cn(
        "rounded-[24px] border p-4",
        task.priority === "critical" && "border-red-300/25 bg-red-400/12",
        task.priority === "high" && "border-amber-300/25 bg-amber-400/12",
        task.priority === "normal" && "border-blue-300/20 bg-blue-400/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">{task.title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {task.assignedZone} / {task.civilianCount} civilians nearby
          </p>
        </div>
        <div className="text-right">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-white">{PRIORITY_LABELS[task.priority]}</span>
          <span className="mt-1 block text-[0.68rem] text-slate-400">{STAFF_TASK_STATUS_LABELS[task.status]}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="min-h-10 rounded-2xl border border-blue-300/20 bg-blue-400/12 text-xs font-bold text-blue-50" onClick={() => onAccept(task.id)} type="button">
          Accept
        </button>
        <button className="min-h-10 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 text-xs font-bold text-emerald-50" onClick={() => onComplete(task.id)} type="button">
          Complete
        </button>
        <button className="min-h-10 rounded-2xl border border-red-300/20 bg-red-400/12 text-xs font-bold text-red-50" onClick={() => onEscalate(task.id)} type="button">
          Backup
        </button>
      </div>
    </article>
  );
});

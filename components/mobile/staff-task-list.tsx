"use client";

import { memo } from "react";

import type { StaffTask } from "@/lib/mobile/types";
import { GlassCard } from "./glass-card";
import { TaskActionCard } from "./task-action-card";

type StaffTaskListProps = {
  onAccept: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onEscalate: (taskId: string) => void;
  tasks: StaffTask[];
};

export const StaffTaskList = memo(function StaffTaskList({ onAccept, onComplete, onEscalate, tasks }: StaffTaskListProps) {
  const pendingCount = tasks.filter((task) => task.status !== "completed").length;

  return (
    <GlassCard glow="accent">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Mission queue</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">{pendingCount} pending tasks</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-200">Zone 3</span>
      </div>
      <div className="mt-4 space-y-3">
        {tasks.map((task) => (
          <TaskActionCard key={task.id} onAccept={onAccept} onComplete={onComplete} onEscalate={onEscalate} task={task} />
        ))}
      </div>
    </GlassCard>
  );
});

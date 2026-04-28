import type { ReactNode } from "react";

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  title: string;
  tone?: "accent" | "warning" | "critical" | "safe";
};

const toneClasses = {
  accent: "border-blue-300/20 bg-blue-400/10 text-blue-50",
  critical: "border-red-300/20 bg-red-400/10 text-red-50",
  safe: "border-emerald-300/20 bg-emerald-400/10 text-emerald-50",
  warning: "border-amber-300/20 bg-amber-400/10 text-amber-50",
};

export function EmptyState({ action, description, title, tone = "accent" }: EmptyStateProps) {
  return (
    <section className={`rounded-[28px] border p-5 text-center ${toneClasses[tone]}`}>
      <p className="text-lg font-black tracking-[-0.05em]">{title}</p>
      <p className="mx-auto mt-2 max-w-64 text-sm leading-6 text-slate-300">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionTitleProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function SectionTitle({ action, className, description, eyebrow, title }: SectionTitleProps) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-cyan-300">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
          {title}
        </h2>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

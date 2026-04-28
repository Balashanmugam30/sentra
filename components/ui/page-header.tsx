import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PageHeader({ action, className, description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/50">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
          {title}
        </h1>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

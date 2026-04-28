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
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/48">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white md:text-2xl">
          {title}
        </h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

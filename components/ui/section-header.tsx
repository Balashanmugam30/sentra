import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function SectionHeader({ action, className, description, eyebrow, title }: SectionHeaderProps) {
  return (
    <div className={cn("sentra-phase6-section-header", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="sentra-phase6-label">{eyebrow}</p> : null}
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

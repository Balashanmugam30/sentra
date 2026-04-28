import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description: string;
  eyebrow?: string;
  title: string;
};

export function EmptyState({ action, className, description, eyebrow, title }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "sentra-empty-state-premium rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        className,
      )}
    >
      <div className="sentra-empty-state-orb mx-auto mb-4" aria-hidden="true" />
      {eyebrow ? (
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/48">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/56">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

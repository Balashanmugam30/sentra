import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PremiumTabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("premium-tabs", className)} role="tablist" {...props} />;
}

interface PremiumTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export function PremiumTab({ active = false, children, className, type = "button", ...props }: PremiumTabProps) {
  return (
    <button
      aria-selected={active}
      className={cn("premium-tab", className)}
      data-active={active ? "true" : "false"}
      role="tab"
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}


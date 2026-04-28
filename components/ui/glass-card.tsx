import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "article" | "aside" | "div" | "section";
  density?: "compact" | "normal" | "spacious";
};

const densityStyles = {
  compact: "p-4",
  normal: "p-6",
  spacious: "p-7 md:p-8",
};

export function GlassCard({
  as: Component = "div",
  className,
  density = "normal",
  ...props
}: GlassCardProps) {
  return (
    <Component
      className={cn("sentra-phase6-glass-card", densityStyles[density], className)}
      {...props}
    />
  );
}

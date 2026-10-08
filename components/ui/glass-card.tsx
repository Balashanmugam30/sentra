import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "article" | "aside" | "div" | "section";
  density?: "compact" | "normal" | "spacious";
  interactive?: boolean;
  tier?: "subtle" | "elevated" | "floating";
};

const densityStyles = {
  compact: "p-3.5 sm:p-4",
  normal: "p-5 sm:p-6",
  spacious: "p-6 sm:p-8",
};

const tierStyles = {
  subtle: "border-white/8 bg-white/[0.035] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.35)]",
  elevated: "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] backdrop-blur-xl shadow-[0_16px_40px_-4px_rgba(0,0,0,0.5)]",
  floating: "border-white/16 bg-[linear-gradient(180deg,rgba(15,23,42,0.85)_0%,rgba(7,13,27,0.92)_100%)] backdrop-blur-2xl shadow-[0_28px_70px_-8px_rgba(0,0,0,0.7)]",
};

export function GlassCard({
  as: Component = "div",
  className,
  density = "normal",
  interactive = false,
  tier = "elevated",
  ...props
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-[20px] border transition-all duration-300",
        "before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/24 before:to-transparent",
        tierStyles[tier],
        densityStyles[density],
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-cyan-400/30 hover:shadow-[0_20px_50px_-8px_rgba(6,182,212,0.18)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
        className,
      )}
      {...props}
    />
  );
}


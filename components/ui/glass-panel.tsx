import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type GlassPanelTone = "default" | "hero" | "quiet" | "danger" | "gold";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article" | "aside";
  tone?: GlassPanelTone;
};

const toneStyles: Record<GlassPanelTone, string> = {
  default:
    "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))]",
  hero:
    "border-cyan-200/14 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))]",
  quiet: "border-white/8 bg-white/[0.035]",
  danger:
    "border-rose-300/18 bg-[radial-gradient(circle_at_0%_0%,rgba(248,113,113,0.16),transparent_32%),rgba(255,255,255,0.045)]",
  gold:
    "border-amber-200/16 bg-[radial-gradient(circle_at_12%_0%,rgba(251,191,36,0.16),transparent_30%),rgba(255,255,255,0.045)]",
};

export function GlassPanel({
  as: Component = "div",
  className,
  tone = "default",
  ...props
}: GlassPanelProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-[28px] border p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition duration-300 hover:border-white/16",
        "before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/28 before:to-transparent",
        "sentra-phase12-panel",
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}

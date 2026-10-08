import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type GlassTier = "subtle" | "elevated" | "floating" | "1" | "2" | "3";
export type GlassPanelTone = "default" | "hero" | "quiet" | "danger" | "gold" | "safe" | "warning" | "critical" | "intelligence";

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article" | "aside";
  tier?: GlassTier;
  tone?: GlassPanelTone;
};

const tierStyles: Record<GlassTier, string> = {
  subtle: "glass-tier-1 border-white/8 bg-white/[0.035] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.35)]",
  "1": "glass-tier-1 border-white/8 bg-white/[0.035] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.35)]",
  elevated: "glass-tier-2 border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] backdrop-blur-xl shadow-[0_16px_40px_-4px_rgba(0,0,0,0.5)]",
  "2": "glass-tier-2 border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] backdrop-blur-xl shadow-[0_16px_40px_-4px_rgba(0,0,0,0.5)]",
  floating: "glass-tier-3 border-white/16 bg-[linear-gradient(180deg,rgba(15,23,42,0.85)_0%,rgba(7,13,27,0.92)_100%)] backdrop-blur-2xl shadow-[0_28px_70px_-8px_rgba(0,0,0,0.7)]",
  "3": "glass-tier-3 border-white/16 bg-[linear-gradient(180deg,rgba(15,23,42,0.85)_0%,rgba(7,13,27,0.92)_100%)] backdrop-blur-2xl shadow-[0_28px_70px_-8px_rgba(0,0,0,0.7)]",
};

const toneStyles: Record<GlassPanelTone, string> = {
  default: "",
  hero: "border-cyan-400/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.14),transparent_60%)]",
  quiet: "border-white/6 bg-white/[0.02]",
  danger: "border-rose-500/24 bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.14),transparent_60%)]",
  critical: "border-rose-500/24 bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.14),transparent_60%)]",
  warning: "border-amber-400/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.14),transparent_60%)]",
  safe: "border-emerald-400/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.14),transparent_60%)]",
  intelligence: "border-cyan-400/24 bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.16),transparent_60%)]",
  gold: "border-amber-200/18 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,213,138,0.12),transparent_60%)]",
};

export function GlassPanel({
  as: Component = "div",
  className,
  tier = "elevated",
  tone = "default",
  ...props
}: GlassPanelProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-[24px] border p-5 transition-all duration-300 hover:border-white/18",
        "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/28 before:to-transparent",
        tierStyles[tier],
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}


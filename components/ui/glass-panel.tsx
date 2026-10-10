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
  subtle:
    "glass-tier-1 border border-slate-200 bg-white/80 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] dark:backdrop-blur-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)]",
  "1":
    "glass-tier-1 border border-slate-200 bg-white/80 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] dark:backdrop-blur-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)]",
  elevated:
    "glass-tier-2 border border-slate-200 bg-white shadow-sm dark:border-white/[0.12] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] dark:backdrop-blur-2xl dark:shadow-[0_16px_48px_rgba(0,0,0,0.48)]",
  "2":
    "glass-tier-2 border border-slate-200 bg-white shadow-sm dark:border-white/[0.12] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] dark:backdrop-blur-2xl dark:shadow-[0_16px_48px_rgba(0,0,0,0.48)]",
  floating:
    "glass-tier-3 border border-slate-300 bg-white/95 shadow-md backdrop-blur-xl dark:border-white/[0.18] dark:bg-[linear-gradient(145deg,rgba(16,24,44,0.58)_0%,rgba(8,13,28,0.68)_100%)] dark:backdrop-blur-3xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.64)]",
  "3":
    "glass-tier-3 border border-slate-300 bg-white/95 shadow-md backdrop-blur-xl dark:border-white/[0.18] dark:bg-[linear-gradient(145deg,rgba(16,24,44,0.58)_0%,rgba(8,13,28,0.68)_100%)] dark:backdrop-blur-3xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.64)]",
};

const toneStyles: Record<GlassPanelTone, string> = {
  default: "",
  hero: "border-sky-300/40 bg-sky-50/20 dark:border-cyan-400/25 dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.16),transparent_65%)]",
  quiet: "border-slate-200 bg-slate-50/50 dark:border-white/[0.06] dark:bg-white/[0.02]",
  danger: "border-rose-300/50 bg-rose-50/30 dark:border-rose-500/28 dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.16),transparent_65%)]",
  critical: "border-rose-300/50 bg-rose-50/30 dark:border-rose-500/28 dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.16),transparent_65%)]",
  warning: "border-amber-300/50 bg-amber-50/30 dark:border-amber-400/25 dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.16),transparent_65%)]",
  safe: "border-emerald-300/50 bg-emerald-50/30 dark:border-emerald-400/25 dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.16),transparent_65%)]",
  intelligence: "border-sky-300/50 bg-sky-50/30 dark:border-cyan-400/28 dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.18),transparent_65%)]",
  gold: "border-amber-200/60 bg-amber-50/25 dark:border-amber-200/22 dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,213,138,0.14),transparent_65%)]",
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
        "relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:border-slate-300 dark:hover:border-white/20",
        tierStyles[tier],
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}


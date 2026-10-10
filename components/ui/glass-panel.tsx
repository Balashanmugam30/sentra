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
    "glass-tier-1 border border-white/[0.08] bg-white/[0.03] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.36)]",
  "1":
    "glass-tier-1 border border-white/[0.08] bg-white/[0.03] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.36)]",
  elevated:
    "glass-tier-2 border border-white/[0.12] bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.15)]",
  "2":
    "glass-tier-2 border border-white/[0.12] bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.15)]",
  floating:
    "glass-tier-3 border border-white/[0.18] bg-[linear-gradient(145deg,rgba(16,24,44,0.58)_0%,rgba(8,13,28,0.68)_100%)] backdrop-blur-3xl shadow-[0_24px_64px_rgba(0,0,0,0.64),0_0_36px_rgba(56,189,248,0.08),inset_0_1px_0_rgba(255,255,255,0.22)]",
  "3":
    "glass-tier-3 border border-white/[0.18] bg-[linear-gradient(145deg,rgba(16,24,44,0.58)_0%,rgba(8,13,28,0.68)_100%)] backdrop-blur-3xl shadow-[0_24px_64px_rgba(0,0,0,0.64),0_0_36px_rgba(56,189,248,0.08),inset_0_1px_0_rgba(255,255,255,0.22)]",
};

const toneStyles: Record<GlassPanelTone, string> = {
  default: "",
  hero: "border-cyan-400/25 bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.16),transparent_65%)]",
  quiet: "border-white/[0.06] bg-white/[0.02]",
  danger: "border-rose-500/28 bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.16),transparent_65%)]",
  critical: "border-rose-500/28 bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.16),transparent_65%)]",
  warning: "border-amber-400/25 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.16),transparent_65%)]",
  safe: "border-emerald-400/25 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.16),transparent_65%)]",
  intelligence: "border-cyan-400/28 bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.18),transparent_65%)]",
  gold: "border-amber-200/22 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,213,138,0.14),transparent_65%)]",
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
        "relative overflow-hidden rounded-[24px] border p-5 transition-all duration-300 hover:border-white/25",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
        tierStyles[tier],
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}


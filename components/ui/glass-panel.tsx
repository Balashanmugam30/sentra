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
    "glass-tier-1 border border-[#E4E9E1] bg-white shadow-xs",
  "1":
    "glass-tier-1 border border-[#E4E9E1] bg-white shadow-xs",
  elevated:
    "glass-tier-2 border border-[#E4E9E1] bg-white shadow-xs",
  "2":
    "glass-tier-2 border border-[#E4E9E1] bg-white shadow-xs",
  floating:
    "glass-tier-3 border border-[#E4E9E1] bg-white shadow-sm",
  "3":
    "glass-tier-3 border border-[#E4E9E1] bg-white shadow-sm",
};

const toneStyles: Record<GlassPanelTone, string> = {
  default: "",
  hero: "border-[#84CC16]/30 bg-[#F1F8E5]/40",
  quiet: "border-[#E4E9E1] bg-[#F1F5F0]/60",
  danger: "border-rose-200 bg-rose-50/40",
  critical: "border-rose-200 bg-rose-50/40",
  warning: "border-amber-200 bg-amber-50/40",
  safe: "border-emerald-200 bg-emerald-50/40",
  intelligence: "border-sky-200 bg-sky-50/40",
  gold: "border-amber-200/60 bg-amber-50/30",
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
        "relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:border-[#D3DBD0]",
        tierStyles[tier],
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}


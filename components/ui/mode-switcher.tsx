"use client";

import { LayoutGroup, motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type ModeSwitcherValue = "command" | "executive" | "demo" | "crisis";

type ModeOption = {
  description: string;
  icon: string;
  label: string;
  value: ModeSwitcherValue;
};

const modeOptions: ModeOption[] = [
  {
    description: "Tactical operations cockpit",
    icon: "C",
    label: "Command",
    value: "command",
  },
  {
    description: "Boardroom intelligence suite",
    icon: "E",
    label: "Executive",
    value: "executive",
  },
  {
    description: "Investor showcase experience",
    icon: "D",
    label: "Demo",
    value: "demo",
  },
  {
    description: "Emergency war room",
    icon: "!",
    label: "Crisis",
    value: "crisis",
  },
];

type ModeSwitcherProps = {
  className?: string;
  mode: ModeSwitcherValue;
  onModeChange: (mode: ModeSwitcherValue) => void;
};

export function ModeSwitcher({ className, mode, onModeChange }: ModeSwitcherProps) {
  return (
    <LayoutGroup id="sentra-mode-switcher">
      <div
        aria-label="Workspace mode"
        className={cn(
          "sentra-mode-capsule sentra-phase11-mode-switcher mx-auto grid w-full max-w-[720px] gap-1 rounded-full border border-white/10 bg-black/18 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:grid-cols-4",
          "sentra-phase12-mode-switcher",
          className,
        )}
        role="tablist"
      >
        {modeOptions.map((option) => {
          const selected = option.value === mode;

          return (
            <button
              aria-selected={selected}
              className={cn(
                "group relative flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-full px-3 py-2 text-center transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(138,180,255,0.45)]",
                "sentra-phase12-mode-button",
                selected
                  ? `sentra-mode-active sentra-mode-active-${option.value} text-white`
                  : "text-white/54 hover:bg-white/[0.055] hover:text-white",
              )}
              key={option.value}
              onClick={() => onModeChange(option.value)}
              role="tab"
              type="button"
            >
              {selected ? (
                <motion.span
                  className={cn("sentra-mode-active-pill", `sentra-mode-active-pill-${option.value}`)}
                  layoutId="sentra-mode-active-pill"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  selected
                    ? "border-white/12 bg-white/10 text-white"
                    : "border-white/10 bg-white/[0.045] text-white/45 group-hover:text-cyan-100",
                )}
              >
                {option.icon}
              </span>
              <span className="relative z-10 min-w-0">
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 hidden text-xs leading-5 text-white/38 2xl:block">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

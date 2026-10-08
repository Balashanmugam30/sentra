"use client";

import { useId, useRef } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "p-0.5 text-xs",
  md: "p-1 text-sm",
  lg: "p-1.5 text-base",
};

const itemSizeStyles = {
  sm: "px-3 py-1.5 min-h-[36px] sm:min-h-[32px]",
  md: "px-4 py-2 min-h-[44px]",
  lg: "px-5 py-2.5 min-h-[48px]",
};

export function SegmentedControl<T extends string = string>({
  className,
  onChange,
  options,
  size = "md",
  value,
  ...props
}: SegmentedControlProps<T>) {
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabledOptions = options.filter((o) => !o.disabled);
    const currentIndex = enabledOptions.findIndex((o) => o.value === value);
    if (currentIndex === -1) return;

    let targetIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % enabledOptions.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = enabledOptions.length - 1;
    }

    if (targetIndex !== -1) {
      const nextOption = enabledOptions[targetIndex];
      if (nextOption) {
        onChange(nextOption.value);
        const originalIndex = options.findIndex((o) => o.value === nextOption.value);
        tabRefs.current[originalIndex]?.focus();
      }
    }
  };

  return (
    <div
      aria-orientation="horizontal"
      className={cn(
        "relative inline-flex items-center rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]",
        sizeStyles[size],
        className,
      )}
      onKeyDown={handleKeyDown}
      role="tablist"
      {...props}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const itemId = `${baseId}-${option.value}`;

        return (
          <button
            aria-selected={isSelected}
            className={cn(
              "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 select-none touch-target-safe",
              itemSizeStyles[size],
              isSelected
                ? "bg-white/[0.14] text-white shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.22)] border border-white/16"
                : "text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent",
              option.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
            )}
            disabled={option.disabled}
            id={itemId}
            key={option.value}
            onClick={() => !option.disabled && onChange(option.value)}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            tabIndex={isSelected ? 0 : -1}
            type="button"
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge && <span className="shrink-0">{option.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

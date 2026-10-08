"use client";

import { useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";

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
  sm: "px-2.5 py-1 min-h-[32px]",
  md: "px-3.5 py-1.5 min-h-[38px]",
  lg: "px-4.5 py-2 min-h-[44px]",
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

  return (
    <div
      aria-orientation="horizontal"
      className={cn(
        "relative inline-flex items-center rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]",
        sizeStyles[size],
        className,
      )}
      role="tablist"
      {...props}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const itemId = `${baseId}-${option.value}`;

        return (
          <button
            aria-selected={isSelected}
            className={cn(
              "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 select-none",
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
            role="tab"
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

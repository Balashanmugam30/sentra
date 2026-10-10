import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "executive"
  | "intelligence";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "relative border border-slate-900 bg-slate-900 text-white font-medium shadow-sm hover:bg-slate-800 active:scale-[0.99] dark:border-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500",
  secondary:
    "relative border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  ghost:
    "border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  danger:
    "relative border border-rose-600 bg-rose-600 text-white font-medium shadow-sm hover:bg-rose-700 active:bg-rose-800 dark:border-rose-500 dark:bg-rose-600",
  executive:
    "relative border border-amber-600/30 bg-amber-50 text-amber-900 font-medium shadow-sm hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-500/20 dark:text-amber-200",
  intelligence:
    "relative border border-sky-600/30 bg-sky-50 text-sky-900 font-medium shadow-sm hover:bg-sky-100 dark:border-cyan-500/35 dark:bg-cyan-950/40 dark:text-cyan-200",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs rounded-lg touch-target-safe",
  md: "min-h-10 px-4 py-2 text-sm rounded-lg touch-target-safe",
  lg: "min-h-11 px-5 py-2.5 text-base rounded-lg touch-target-safe",
  icon: "min-h-9 min-w-9 p-2 rounded-lg touch-target-safe",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    leadingIcon,
    loading = false,
    size = "md",
    trailingIcon,
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 ease-out select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#030712]",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-transparent disabled:hover:shadow-none",
        "before:pointer-events-none before:absolute before:inset-x-2 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={isDisabled}
      ref={ref}
      type={type}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2",
          loading ? "opacity-0" : "opacity-100",
        )}
      >
        {leadingIcon ? <span className="shrink-0">{leadingIcon}</span> : null}
        {children ? <span>{children}</span> : null}
        {trailingIcon ? <span className="shrink-0">{trailingIcon}</span> : null}
      </span>
      {loading ? (
        <span className="absolute inset-0 inline-flex items-center justify-center">
          <Spinner />
        </span>
      ) : null}
    </button>
  );
});

export const GlassButton = forwardRef<HTMLButtonElement, ButtonProps>(function GlassButton(
  props,
  ref,
) {
  return <Button ref={ref} variant="secondary" {...props} />;
});

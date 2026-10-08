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
    "relative border border-cyan-400/40 bg-[linear-gradient(135deg,rgba(6,182,212,0.92)_0%,rgba(14,165,233,0.85)_100%)] text-stone-950 font-semibold shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:border-cyan-300 hover:shadow-[0_6px_28px_rgba(6,182,212,0.4)] active:brightness-95",
  secondary:
    "relative border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] text-white backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-white/20 hover:bg-white/10 active:bg-white/5",
  ghost:
    "border border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white active:bg-white/8",
  danger:
    "relative border border-rose-500/40 bg-[linear-gradient(135deg,rgba(239,68,68,0.88)_0%,rgba(220,38,38,0.82)_100%)] text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:border-rose-400 hover:shadow-[0_6px_28px_rgba(239,68,68,0.4)] active:brightness-95",
  executive:
    "relative border border-amber-300/40 bg-[linear-gradient(135deg,rgba(245,213,138,0.9)_0%,rgba(217,119,6,0.8)_100%)] text-stone-950 font-semibold shadow-[0_4px_20px_rgba(245,213,138,0.2)] hover:border-amber-200 hover:shadow-[0_6px_28px_rgba(245,213,138,0.35)] active:brightness-95",
  intelligence:
    "relative border border-cyan-500/35 bg-cyan-950/40 text-cyan-200 backdrop-blur-xl hover:border-cyan-400 hover:bg-cyan-900/40 active:bg-cyan-900/60",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs rounded-xl",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-2xl touch-target-safe",
  lg: "min-h-12 px-6 py-3 text-base rounded-2xl touch-target-safe",
  icon: "min-h-11 min-w-11 p-2.5 rounded-2xl touch-target-safe",
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

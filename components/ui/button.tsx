import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-[rgba(110,168,255,0.34)] bg-[linear-gradient(135deg,rgba(110,168,255,0.95),rgba(138,167,255,0.82))] text-white shadow-[0_12px_28px_rgba(110,168,255,0.16)] hover:border-[rgba(255,255,255,0.22)] hover:shadow-[0_16px_34px_rgba(110,168,255,0.2)]",
  secondary:
    "border border-[var(--border-soft)] bg-[rgba(255,255,255,0.055)] text-[var(--text-primary)] backdrop-blur-[18px] hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.085)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]",
  danger:
    "border border-[rgba(248,113,113,0.28)] bg-[rgba(248,113,113,0.12)] text-red-100 hover:border-[rgba(248,113,113,0.38)] hover:bg-[rgba(248,113,113,0.18)]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  leadingIcon?: ReactNode;
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
        "relative inline-flex min-h-11 items-center justify-center rounded-full px-4 py-3 text-sm font-medium leading-[1.45] tracking-[-0.01em] transition-all duration-200 ease-out hover:-translate-y-px active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(110,168,255,0.54)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50",
        "sentra-button-premium",
        variantStyles[variant],
        className,
      )}
      disabled={isDisabled}
      ref={ref}
      type={type}
      {...props}
    >
      <span className={cn("inline-flex items-center justify-center gap-2", loading ? "opacity-0" : "opacity-100")}>
        {leadingIcon ? <span className="shrink-0">{leadingIcon}</span> : null}
        <span>{children}</span>
      </span>
      {loading ? (
        <span className="absolute inset-0 inline-flex items-center justify-center">
          <Spinner />
        </span>
      ) : null}
    </button>
  );
});

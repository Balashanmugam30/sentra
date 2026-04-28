import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  containerClassName?: string;
  trailingIcon?: ReactNode;
}

function ErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M8 5v4" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
      <path d="M7.1 2.3 2.2 10.8A1 1 0 0 0 3 12.3h10a1 1 0 0 0 .8-1.5L8.9 2.3a1 1 0 0 0-1.8 0Z" />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    containerClassName,
    error,
    id,
    label,
    placeholder,
    trailingIcon,
    type = "text",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasFloatingLabel = Boolean(label);

  return (
    <div className={cn("space-y-2", containerClassName)}>
      <div className="relative">
        <input
          className={cn(
            "peer w-full rounded-[var(--radius-medium)] border border-[var(--border-soft)] bg-[var(--sentra-input-surface)] px-4 py-3 text-sm leading-[1.5] text-[var(--text-primary)] outline-none backdrop-blur-[18px] transition-all duration-200 ease-out placeholder:text-[var(--text-muted)] hover:border-[color-mix(in_srgb,var(--accent-3)_28%,var(--border-strong))] focus:border-[color-mix(in_srgb,var(--accent-3)_56%,white_8%)] focus:[box-shadow:0_0_0_3px_rgba(34,211,238,0.14)]",
            hasFloatingLabel ? "pb-3 pt-6" : "",
            trailingIcon ? "pr-10" : "",
            error
              ? "border-[color-mix(in_srgb,var(--color-danger)_35%,var(--color-border))] text-[color-mix(in_srgb,var(--color-danger)_82%,var(--color-foreground))]"
              : "border-[var(--color-border)]",
            className,
          )}
          id={inputId}
          placeholder={hasFloatingLabel ? " " : placeholder}
          ref={ref}
          type={type}
          {...props}
        />
        {hasFloatingLabel ? (
          <label
            className={cn(
              "pointer-events-none absolute left-4 top-3 origin-left text-[11px] leading-none text-muted transition-all duration-150 ease-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[11px]",
              error ? "text-[color-mix(in_srgb,var(--color-danger)_82%,var(--color-muted-foreground))]" : "",
            )}
            htmlFor={inputId}
          >
            {label}
          </label>
        ) : null}
        {trailingIcon ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
            {trailingIcon}
          </span>
        ) : null}
      </div>
      {error ? (
        <div className="inline-flex items-center gap-2 text-xs leading-[1.45] text-[color-mix(in_srgb,var(--color-danger)_82%,var(--color-muted-foreground))]">
          <ErrorIcon />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
});

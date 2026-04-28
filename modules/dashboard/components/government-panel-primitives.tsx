import type { ReactNode } from "react";

export const governmentMoney = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export const compactGovernmentMoney = new Intl.NumberFormat("en-US", {
  compactDisplay: "short",
  currency: "USD",
  maximumFractionDigits: 1,
  notation: "compact",
  style: "currency",
});

export function govNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function govString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function govRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function govList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function govBar(value: unknown, fallback = 0) {
  return `${Math.min(100, Math.max(4, govNumber(value, fallback)))}%`;
}

export function GovernmentPanelChrome({
  children,
  eyebrow,
  title,
  description,
  action,
  className = "",
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[32px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(2,6,18,0.96),rgba(6,14,36,0.91),rgba(34,211,238,0.06),rgba(251,146,60,0.055))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl ${className}`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/58">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">{description}</p> : null}
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function GovernmentMetricTile({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
      {note ? <p className="mt-1 text-xs text-cyan-50/58">{note}</p> : null}
    </div>
  );
}

export function GovernmentPill({ label, tone = "cyan" }: { label: string; tone?: "cyan" | "gold" | "red" }) {
  const toneClass =
    tone === "gold"
      ? "border-amber-200/24 bg-amber-200/12 text-amber-50"
      : tone === "red"
      ? "border-orange-300/28 bg-orange-400/12 text-orange-50"
      : "border-cyan-200/20 bg-cyan-200/10 text-cyan-50";

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>{label}</span>;
}

export function GovernmentActionButton({
  children,
  disabled,
  onClick,
  tone = "cyan",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  tone?: "cyan" | "gold" | "red";
}) {
  const toneClass =
    tone === "gold"
      ? "border-amber-200/24 bg-amber-200/12 text-amber-50"
      : tone === "red"
      ? "border-orange-300/24 bg-orange-400/12 text-orange-50"
      : "border-cyan-200/22 bg-cyan-200/10 text-cyan-50";

  return (
    <button
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 ${toneClass}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

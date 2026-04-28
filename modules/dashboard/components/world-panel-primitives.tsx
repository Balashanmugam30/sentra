import type { ReactNode } from "react";

export function worldNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function worldString(value: unknown, fallback = "Global watch"): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export function worldRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function worldList<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function worldCurrency(value: unknown): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(worldNumber(value));
}

export function worldBar(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function WorldPanelChrome({
  title,
  eyebrow = "World Command Grid",
  accent = "cyan",
  action,
  children,
}: {
  title: string;
  eyebrow?: string;
  accent?: "cyan" | "gold" | "red";
  action?: ReactNode;
  children: ReactNode;
}) {
  const accentClass =
    accent === "gold"
      ? "border-amber-300/35 from-amber-300/16"
      : accent === "red"
        ? "border-red-400/30 from-red-500/14"
        : "border-cyan-300/30 from-cyan-400/14";
  return (
    <section
      className={`relative overflow-hidden rounded-[30px] border ${accentClass} bg-gradient-to-br to-slate-950/78 p-5 shadow-[0_26px_90px_rgba(0,12,30,0.45)] backdrop-blur-2xl`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(103,232,249,0.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
      <div className="relative z-10 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/58">{eyebrow}</p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

export function WorldMetricTile({
  label,
  value,
  suffix = "",
  tone = "cyan",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  tone?: "cyan" | "gold" | "red";
}) {
  const textClass = tone === "gold" ? "text-amber-200" : tone === "red" ? "text-red-100" : "text-cyan-100";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-inner shadow-white/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300/60">{label}</p>
      <div className={`mt-2 text-2xl font-semibold ${textClass}`}>
        {value}
        {suffix}
      </div>
    </div>
  );
}

export function WorldPill({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "gold" | "red" }) {
  const color =
    tone === "gold"
      ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
      : tone === "red"
        ? "border-red-400/30 bg-red-500/10 text-red-100"
        : "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
  return <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${color}`}>{children}</span>;
}

export function WorldActionButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-300/16 disabled:cursor-wait disabled:opacity-55"
    >
      {children}
    </button>
  );
}


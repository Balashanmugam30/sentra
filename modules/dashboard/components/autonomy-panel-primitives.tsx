import type { ReactNode } from "react";

export function autoNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function autoString(value: unknown, fallback = "Operational"): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export function autoRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function autoList<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function autoCurrency(value: unknown): string {
  const amount = autoNumber(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function autoBar(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

type ChromeProps = {
  title: string;
  eyebrow?: string;
  accent?: "cyan" | "gold" | "orange";
  action?: ReactNode;
  children: ReactNode;
};

const accentClasses = {
  cyan: "border-cyan-300/30 from-cyan-400/15",
  gold: "border-amber-300/35 from-amber-300/15",
  orange: "border-orange-400/35 from-orange-500/15",
};

export function AutonomyPanelChrome({ title, eyebrow = "Autonomy OS", accent = "cyan", action, children }: ChromeProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border ${accentClasses[accent]} bg-gradient-to-br to-slate-950/70 p-5 shadow-[0_24px_80px_rgba(8,20,44,0.38)] backdrop-blur-xl`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.16),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="relative z-10 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/60">{eyebrow}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

export function AutonomyMetricTile({
  label,
  value,
  suffix = "",
  tone = "cyan",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  tone?: "cyan" | "gold" | "orange";
}) {
  const color = tone === "gold" ? "text-amber-200" : tone === "orange" ? "text-orange-200" : "text-cyan-100";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-inner shadow-white/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300/60">{label}</p>
      <div className={`mt-2 text-2xl font-semibold ${color}`}>
        {value}
        {suffix}
      </div>
    </div>
  );
}

export function AutonomyPill({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "gold" | "orange" }) {
  const color =
    tone === "gold"
      ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
      : tone === "orange"
        ? "border-orange-400/30 bg-orange-500/10 text-orange-100"
        : "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
  return <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${color}`}>{children}</span>;
}

export function AutonomyActionButton({
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


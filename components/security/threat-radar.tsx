"use client";

export type RadarSignal = {
  label: string;
  value: number;
  tone?: "emerald" | "cyan" | "amber" | "red";
};

const RADAR_SIGNALS: RadarSignal[] = [
  { label: "Brute force", value: 4, tone: "emerald" },
  { label: "Impossible travel", value: 8, tone: "cyan" },
  { label: "Privilege escalation", value: 11, tone: "amber" },
  { label: "Admin hour anomaly", value: 14, tone: "cyan" },
  { label: "Token storm", value: 6, tone: "emerald" },
];

export function ThreatRadar({ signals = RADAR_SIGNALS, title = "Abuse and anomaly signals" }: { signals?: RadarSignal[]; title?: string }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-[rgba(3,8,18,0.78)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
        Security Threat Radar
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>

      <div className="mt-6 flex items-center justify-center">
        <div className="relative h-64 w-64 rounded-full border border-cyan-300/20 bg-[radial-gradient(circle,rgba(34,211,238,0.16),rgba(15,23,42,0.04)_45%,transparent_65%)]">
          <div className="absolute inset-8 rounded-full border border-white/10" />
          <div className="absolute inset-16 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-100/10" />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-cyan-100/10" />
          {signals.map((signal, index) => {
            const angle = (index / signals.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 40 + Math.min(20, signal.value / 5) * 4;
            const x = 128 + Math.cos(angle) * radius;
            const y = 128 + Math.sin(angle) * radius;
            const color =
              signal.tone === "red"
                ? "bg-red-300 text-red-300"
                : signal.tone === "amber"
                  ? "bg-amber-300 text-amber-300"
                  : signal.tone === "emerald"
                    ? "bg-emerald-300 text-emerald-300"
                    : "bg-cyan-300 text-cyan-300";
            return (
              <span
                className={[
                  "absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_22px_currentColor]",
                  color,
                ].join(" ")}
                key={signal.label}
                style={{ left: x, top: y }}
                title={signal.label}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {signals.map((signal) => (
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3" key={signal.label}>
            <span className="text-sm text-white/70">{signal.label}</span>
            <span className="font-semibold text-white">{signal.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

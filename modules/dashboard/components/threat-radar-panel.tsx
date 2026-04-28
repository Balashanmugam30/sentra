"use client";

import type { UseSocResult } from "@/lib/soc/use-soc";

function tone(severity: string) {
  if (severity === "critical") {
    return "border-rose-400/35 bg-rose-500/15 text-rose-100";
  }
  if (severity === "high") {
    return "border-amber-400/35 bg-amber-500/15 text-amber-100";
  }
  if (severity === "medium") {
    return "border-sky-400/35 bg-sky-500/15 text-sky-100";
  }
  return "border-cyan-300/25 bg-cyan-400/10 text-cyan-100";
}

type ThreatRadarPanelProps = {
  soc: UseSocResult;
};

export function ThreatRadarPanel({ soc }: ThreatRadarPanelProps) {
  const { detections, error, loading } = soc;
  const items = detections?.detections ?? [];

  return (
    <section className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl" style={{ borderColor: "var(--border)", background: "var(--surface)", boxShadow: "var(--sentra-shadow-panel)" }}>
      <div className="pointer-events-none absolute inset-[1px] rounded-[27px]" style={{ border: "1px solid var(--border)", background: "var(--surface-soft)" }} />
      <div className="relative z-10">
        <div className="space-y-2">
          <p className="text-[0.7rem] uppercase tracking-[0.26em]" style={{ color: "var(--sentra-text-soft)" }}>
            Threat Radar
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Brute force, privilege misuse, token storms, latency spikes, and command bursts
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => (
            <div className={`rounded-[22px] border p-4 ${tone(item.severity)}`} key={`${item.detection_id}-${item.source_rule}-${item.affected_module ?? "global"}-${index}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-[0.65rem] uppercase tracking-[0.14em]">{item.severity}</div>
              </div>
              <p className="mt-3 text-sm text-white/90">{item.description}</p>
              <div className="mt-3 text-[0.68rem] uppercase tracking-[0.14em] text-white/60">
                {item.affected_module ?? item.source_rule}
              </div>
            </div>
          ))}
          {!items.length ? (
            <div className="rounded-[22px] border p-4 text-sm" style={{ borderColor: "var(--sentra-border-subtle)", background: "var(--surface-soft)", color: "var(--sentra-text-muted)" }}>
              {loading
                ? "Syncing live threat radar"
                : error
                ? "Threat radar is reconnecting to the last verified SOC feed."
                : "No active SOC detections in the current command window."}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

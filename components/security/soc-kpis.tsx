"use client";

import type { SocSummary } from "@/lib/securitydefense/types";

export function SocKpis({ summary }: { summary: SocSummary }) {
  const cards = [
    { label: "Open incidents", value: summary.open_incidents, tone: "red" },
    { label: "Detections today", value: summary.detections_today, tone: "cyan" },
    { label: "Mean response", value: `${summary.mean_response_time}m`, tone: "emerald" },
    { label: "Auto containment", value: summary.auto_containment_count, tone: "amber" },
    { label: "Threat level", value: summary.threat_level, tone: "red" },
    { label: "Analyst queue", value: summary.analyst_queue, tone: "cyan" },
  ];
  return (
    <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl" key={card.label}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{card.label}</p>
          <p className={["mt-3 font-mono text-3xl", card.tone === "red" ? "text-red-100" : card.tone === "amber" ? "text-amber-100" : card.tone === "emerald" ? "text-emerald-100" : "text-cyan-100"].join(" ")}>
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
}

"use client";

import { useDeveloper } from "@/lib/developer/use-developer";

export function DeveloperHubPanel() {
  const { docs, usage } = useDeveloper();

  return (
    <section className="rounded-[32px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(4,10,24,0.94),rgba(34,211,238,0.08),rgba(255,255,255,0.035))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/58">Developer Platform</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white">
        Public API, webhooks, OAuth apps, and embedded command widgets
      </h2>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ["API Calls", (usage?.api_calls_month ?? 0).toLocaleString(), "monthly"],
          ["Webhooks", `${usage?.active_webhooks ?? 0}`, "active"],
          ["Keys", `${usage?.active_keys ?? 0}`, "scoped"],
          ["Base URL", docs?.base_url ?? "/api", "tenant-aware"],
        ].map(([label, value, note]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-cyan-50/56">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


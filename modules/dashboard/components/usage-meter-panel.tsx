"use client";

import { useTenant } from "@/lib/tenant/use-tenant";

export function UsageMeterPanel() {
  const { usage } = useTenant();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Usage Meter
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Seats, AI actions, reports, API, and storage
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Seat usage", usage?.seat_utilization_percent ?? 0, `${usage?.active_users ?? 0}/${usage?.seats_limit ?? 0}`],
          ["API calls", usage?.api_utilization_percent ?? 0, `${usage?.api_calls_month ?? 0}/mo`],
          ["Storage", usage?.storage_utilization_percent ?? 0, `${usage?.storage_used_gb ?? 0}GB`],
        ].map(([label, percent, value]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{label}</p>
              <span className="text-sm text-cyan-50">{value}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300/75" style={{ width: `${percent}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["Incidents", usage?.incidents_month ?? 0],
          ["AI actions", usage?.ai_actions_month ?? 0],
          ["Reports", usage?.reports_generated ?? 0],
        ].map(([label, value]) => (
          <div className="rounded-[20px] border border-white/10 bg-black/18 p-4" key={label}>
            <p className="text-xs uppercase tracking-[0.18em] text-white/38">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

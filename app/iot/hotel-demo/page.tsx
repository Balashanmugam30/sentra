import Link from "next/link";
import type { Route } from "next";

import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";

const architecture = [
  "No cameras inside rooms.",
  "Room detection uses smoke detector integrations, HVAC anomalies, alarm systems, and occupant panic buttons.",
  "Corridors use ESP32-CAM and public-zone smoke spread validation.",
  "Selective nodes keep deployment hardware-light and scalable.",
];

export default function IotHotelDemoPage() {
  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[38px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Hotel Scalability Mode</p>
                <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-0.06em] md:text-7xl">50 floors. 2,000 rooms. Zero room cameras.</h1>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-white/55">
                  Sentra scales by fusing existing alarms, selective edge nodes, corridor verification, and mobile panic workflows.
                </p>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10" href={"/iot" as Route}>Back</Link>
            </div>
          </header>
          <section className="grid gap-4 md:grid-cols-5">
            {[
              ["Floors", "50"],
              ["Rooms", "2,000"],
              ["Smart Nodes", "150"],
              ["Camera Zones", "18"],
              ["Response ETA", "2m 10s"],
            ].map(([label, value]) => (
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5" key={label}>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
                <p className="mt-2 text-4xl font-semibold tracking-[-0.06em]">{value}</p>
              </div>
            ))}
          </section>
          <section className="grid gap-4 lg:grid-cols-2">
            {architecture.map((item) => (
              <div className="rounded-[30px] border border-cyan-300/15 bg-cyan-300/[0.06] p-5 text-lg font-semibold leading-7 text-cyan-50/80" key={item}>
                {item}
              </div>
            ))}
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

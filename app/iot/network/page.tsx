"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { BuildingNetwork } from "@/components/iot/building-network";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { getIotNetwork } from "@/lib/iot/demo";
import type { IotNetworkData } from "@/lib/iot/types";

const fallbackNetwork: IotNetworkData = {
  summary: { buildings_online: 4, floors_monitored: 87, devices_active: 416, critical_incidents: 2, avg_response_time_seconds: 41 },
  buildings: [
    { name: "Grand Meridian Hotel", type: "hotel", floors: 50, rooms: 2000, nodes: 150, camera_zones: 18, risk: "watch", online: true },
    { name: "Bala University", type: "university", floors: 24, rooms: 780, nodes: 96, camera_zones: 22, risk: "safe", online: true },
    { name: "Bala Hospital", type: "hospital", floors: 16, rooms: 520, nodes: 110, camera_zones: 16, risk: "critical", online: true },
    { name: "Metro Mall", type: "mall", floors: 7, rooms: 240, nodes: 60, camera_zones: 12, risk: "safe", online: true },
  ],
};

export default function IotNetworkPage() {
  const [data, setData] = useState<IotNetworkData>(fallbackNetwork);

  useEffect(() => {
    let cancelled = false;
    async function loadNetwork() {
      try {
        const response = await getIotNetwork();
        if (!cancelled) {
          setData(response.data);
        }
      } catch {
        if (!cancelled) {
          setData(fallbackNetwork);
        }
      }
    }
    void loadNetwork();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Multi-Building Command</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">One fleet across every property.</h1>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10" href={"/iot" as Route}>Back to IoT</Link>
            </div>
          </header>
          <BuildingNetwork data={data} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

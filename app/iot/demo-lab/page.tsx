"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { DemoScenarios } from "@/components/iot/demo-scenarios";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { getIotDemoScenarios, runIotDemoScenario } from "@/lib/iot/demo";
import type { IotDemoRunData, IotDemoScenario } from "@/lib/iot/types";

const fallbackScenarios: IotDemoScenario[] = [
  { id: "fire_kitchen", title: "Fire in Kitchen Zone", severity: "CRITICAL+", building: "Grand Meridian Hotel", expected_eta: "2m 10s" },
  { id: "gas_basement", title: "Gas Leak Basement", severity: "CRITICAL", building: "Grand Meridian Hotel", expected_eta: "3m 20s" },
  { id: "panic_floor_8", title: "Panic in Floor 8", severity: "WARNING", building: "Grand Meridian Hotel", expected_eta: "1m 45s" },
  { id: "corridor_blockage", title: "Corridor Blockage", severity: "WARNING", building: "Grand Meridian Hotel", expected_eta: "1m 30s" },
  { id: "power_failure", title: "Power Failure", severity: "CRITICAL", building: "Metro Mall", expected_eta: "4m 00s" },
  { id: "hotel_fire_multi_floor", title: "Multi-floor Hotel Fire", severity: "CRITICAL+", building: "Grand Meridian Hotel", expected_eta: "5m 10s" },
  { id: "hospital_oxygen_leak", title: "Hospital Oxygen Leak", severity: "CRITICAL+", building: "Bala Hospital", expected_eta: "2m 40s" },
];

export default function IotDemoLabPage() {
  const [scenarios, setScenarios] = useState<IotDemoScenario[]>(fallbackScenarios);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [result, setResult] = useState<IotDemoRunData | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadScenarios() {
      try {
        const response = await getIotDemoScenarios();
        if (!cancelled) {
          setScenarios(response.data.scenarios);
        }
      } catch {
        if (!cancelled) {
          setScenarios(fallbackScenarios);
        }
      }
    }
    void loadScenarios();
    return () => {
      cancelled = true;
    };
  }, []);

  const runScenario = async (scenarioId: string) => {
    setBusyId(scenarioId);
    try {
      setResult((await runIotDemoScenario(scenarioId)).data);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-200/70">Judge Demo Lab</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">One-click emergency proof engine.</h1>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10" href={"/iot" as Route}>Back to IoT</Link>
            </div>
          </header>
          <DemoScenarios busyId={busyId} onRun={(id) => { void runScenario(id); }} result={result} scenarios={scenarios} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

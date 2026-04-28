"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { InvestorPanel } from "@/components/iot/investor-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { getIotLaunch } from "@/lib/iot/demo";
import type { IotLaunchData } from "@/lib/iot/types";

const fallbackLaunch: IotLaunchData = {
  tam: "$42B smart safety + building intelligence",
  sam: "$8.7B hotels, campuses, hospitals, malls, factories",
  pricing: [
    { tier: "Pilot", price: "$2,500/mo/building", best_for: "single flagship site" },
    { tier: "Enterprise", price: "$9,500/mo/campus", best_for: "multi-building operations" },
    { tier: "Government", price: "custom", best_for: "critical infrastructure" },
  ],
  arr_forecast: [
    { year: "Y1", arr: 850000 },
    { year: "Y2", arr: 4200000 },
    { year: "Y3", arr: 12600000 },
    { year: "Y4", arr: 31000000 },
  ],
  moats: ["Hardware-light deployment", "Privacy-safe vision", "Cross-building data moat", "AI command orchestration"],
  roadmap: ["15.C enterprise rollout", "15.D installer kits", "17 procurement pilots", "18 insurance integrations"],
};

export default function IotLaunchPage() {
  const [data, setData] = useState<IotLaunchData>(fallbackLaunch);

  useEffect(() => {
    let cancelled = false;
    async function loadLaunch() {
      try {
        const response = await getIotLaunch();
        if (!cancelled) {
          setData(response.data);
        }
      } catch {
        if (!cancelled) {
          setData(fallbackLaunch);
        }
      }
    }
    void loadLaunch();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Investor Launch Mode</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">Fundable IoT commercialization story.</h1>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10" href={"/iot" as Route}>Back to IoT</Link>
            </div>
          </header>
          <InvestorPanel data={data} />
          <section className="grid gap-4 md:grid-cols-3">
            {data.pricing.map((tier) => (
              <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5" key={tier.tier}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">{tier.tier}</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{tier.price}</p>
                <p className="mt-3 text-sm text-white/50">{tier.best_for}</p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

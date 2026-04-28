"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { RoiCalculator } from "@/components/iot/roi-calculator";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { calculateIotRoi, getIotRoiDefaults } from "@/lib/iot/roi";
import type { IotRoiData, IotRoiInputs } from "@/lib/iot/types";

const fallbackRoi: IotRoiData = {
  inputs: { rooms: 2000, floors: 50, staff_count: 420, incidents_per_year: 34, avg_loss_per_incident: 85000 },
  prevented_losses: 1791800,
  faster_response_savings: 520200,
  insurance_reduction_estimate: 136000,
  staffing_efficiency: 378000,
  annual_value: 2826000,
  estimated_year_one_cost: 294000,
  roi_percent: 861,
  payback_months: 1.2,
};

export default function IotRoiPage() {
  const [data, setData] = useState<IotRoiData>(fallbackRoi);

  useEffect(() => {
    let cancelled = false;
    async function loadRoi() {
      try {
        const response = await getIotRoiDefaults();
        if (!cancelled) {
          setData(response.data);
        }
      } catch {
        if (!cancelled) {
          setData(fallbackRoi);
        }
      }
    }
    void loadRoi();
    return () => {
      cancelled = true;
    };
  }, []);

  const calculate = async (inputs: IotRoiInputs) => {
    try {
      return (await calculateIotRoi(inputs)).data;
    } catch {
      const prevented_losses = Math.round(inputs.incidents_per_year * inputs.avg_loss_per_incident * 0.62);
      const faster_response_savings = Math.round(inputs.incidents_per_year * inputs.avg_loss_per_incident * 0.18);
      const insurance_reduction_estimate = Math.round(inputs.rooms * 38 + inputs.floors * 1200);
      const staffing_efficiency = Math.round(inputs.staff_count * 900);
      const annual_value = prevented_losses + faster_response_savings + insurance_reduction_estimate + staffing_efficiency;
      const estimated_year_one_cost = Math.round(inputs.rooms * 18 + inputs.floors * 4200 + 48000);
      return {
        inputs,
        prevented_losses,
        faster_response_savings,
        insurance_reduction_estimate,
        staffing_efficiency,
        annual_value,
        estimated_year_one_cost,
        roi_percent: Math.round(((annual_value - estimated_year_one_cost) / Math.max(1, estimated_year_one_cost)) * 100),
        payback_months: Math.max(1, Math.round((estimated_year_one_cost / Math.max(1, annual_value)) * 120) / 10),
      };
    }
  };

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">ROI Center</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">Turn deployment into a CFO case.</h1>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10" href={"/iot" as Route}>Back to IoT</Link>
            </div>
          </header>
          <RoiCalculator initial={data} onCalculate={calculate} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

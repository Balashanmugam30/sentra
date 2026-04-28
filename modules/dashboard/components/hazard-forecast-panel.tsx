"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { UseEnvironmentResult } from "@/lib/environment/use-environment";

type HazardForecastPanelProps = {
  environment: UseEnvironmentResult;
};

export function HazardForecastPanel({ environment }: HazardForecastPanelProps) {
  const forecast = environment.forecast;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Hazard Forecast Timeline
          </p>
          <h2 className="text-lg font-semibold text-white">
            Next 48 hours of rain, wind, temperature, and composite hazard pressure
          </h2>
        </div>

        <div className="h-[280px] rounded-[24px] border border-white/10 bg-white/5 p-3">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={forecast?.intervals ?? []}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="rgba(191,219,254,0.72)" />
              <YAxis stroke="rgba(191,219,254,0.72)" />
              <Tooltip
                contentStyle={{
                  background: "rgba(5, 9, 18, 0.92)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  color: "#f8fafc",
                }}
              />
              <Line dataKey="hazard_score" dot={false} stroke="#f97316" strokeWidth={3} type="monotone" />
              <Line dataKey="rain" dot={false} stroke="#38bdf8" strokeWidth={2} type="monotone" />
              <Line dataKey="wind" dot={false} stroke="#e879f9" strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(forecast?.intervals ?? []).slice(0, 3).map((interval, index) => (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${interval.label}-${interval.summary}-${index}`}>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{interval.label}</div>
              <div className="mt-2 text-sm font-medium text-white">{interval.summary}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

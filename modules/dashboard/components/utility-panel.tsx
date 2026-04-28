"use client";

import type { UsePublicSafetyResult } from "@/lib/public-safety/use-public-safety";

type UtilityPanelProps = {
  publicSafety: UsePublicSafetyResult;
};

export function UtilityPanel({ publicSafety }: UtilityPanelProps) {
  const utilities = publicSafety.utilities?.utilities ?? publicSafety.live?.utilities;

  if (!utilities) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Utility Resilience Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            Power, water, network, lighting, and generator health across civic support systems
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["Power", utilities.power_status],
            ["Water", utilities.water_status],
            ["Network", utilities.network_status],
            ["Street Lights", utilities.street_light_status],
            ["Generators", utilities.generator_status],
          ].map(([label, value], index) => (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${label}-${index}`}>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{label}</div>
              <div className="mt-2 text-sm font-medium text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white">
          {utilities.recommendation}
        </div>
      </div>
    </section>
  );
}

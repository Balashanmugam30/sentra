"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function FacilityControlBrainPanel() {
  const { facilityBrain } = useAutonomousAI();

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.76)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
        Facility Control Brain
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">
        Safe automation recommendations for doors, HVAC, elevators, PA, and lighting
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(facilityBrain?.automations ?? []).map((automation) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={automation.control}>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/42">
              {automation.control.replaceAll("_", " ")}
            </p>
            <h3 className="mt-2 text-base font-semibold text-white">{automation.zone}</h3>
            <p className="mt-2 text-sm capitalize text-cyan-100/74">{automation.state}</p>
            <p className="mt-3 text-xs leading-5 text-white/48">{automation.safe_rule}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


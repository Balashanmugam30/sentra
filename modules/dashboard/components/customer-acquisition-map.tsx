"use client";

import { useMemo } from "react";

import { useCrm } from "@/lib/crm/use-crm";

export function CustomerAcquisitionMap() {
  const { leads } = useCrm();
  const countries = useMemo(() => {
    const counts = new Map<string, number>();
    (leads?.leads ?? []).forEach((lead) => {
      counts.set(lead.country, (counts.get(lead.country) ?? 0) + 1);
    });
    return [...counts.entries()].sort((left, right) => right[1] - left[1]);
  }, [leads?.leads]);
  const max = Math.max(1, ...countries.map(([, count]) => count));

  return (
    <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.1),transparent_35%),rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Acquisition Map
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Global enterprise prospect distribution
      </h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[260px] overflow-hidden rounded-[28px] border border-cyan-100/12 bg-[#06101e] p-5">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(103,232,249,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
          {countries.slice(0, 8).map(([country, count], index) => (
            <div
              className="absolute rounded-full border border-cyan-200/30 bg-cyan-300/18 shadow-[0_0_30px_rgba(103,232,249,0.28)]"
              key={`${country}-${count}-${index}`}
              style={{
                height: `${36 + count * 14}px`,
                left: `${12 + ((index * 23) % 72)}%`,
                top: `${16 + ((index * 17) % 58)}%`,
                width: `${36 + count * 14}px`,
              }}
              title={country}
            />
          ))}
          <div className="relative z-10 rounded-[24px] border border-white/10 bg-black/24 p-4 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Live prospect geography</p>
            <p className="mt-2 text-sm text-white/62">Campus, industrial, healthcare, and government accounts are clustered by tenant-safe CRM data.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {countries.map(([country, count], index) => (
            <div className="rounded-[18px] border border-white/10 bg-white/[0.045] p-3" key={`${country}-${index}`}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{country}</span>
                <span className="text-cyan-50/70">{count} leads</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300/75" style={{ width: `${(count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

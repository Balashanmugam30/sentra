"use client";

import { useGrowth } from "@/lib/growth/use-growth";

export function WhiteLabelEnginePanel() {
  const { busyAction, createFranchise, programs } = useGrowth();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">White-label Rollout</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Partner-branded regional editions</h2>
        </div>
        <button className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 disabled:opacity-50" disabled={busyAction === "franchise"} onClick={() => void createFranchise()} type="button">
          {busyAction === "franchise" ? "Creating..." : "Create Franchise"}
        </button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {programs.slice(0, 6).map((program, index) => (
          <article className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${program.franchise_id}-${index}`}>
            <p className="font-semibold text-white">{program.name}</p>
            <p className="mt-1 text-xs text-white/45">{program.partner_name}</p>
            <p className="mt-3 font-mono text-xs text-cyan-50/70">{program.custom_domain}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


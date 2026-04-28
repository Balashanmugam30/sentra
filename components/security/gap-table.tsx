"use client";

import type { ComplianceGap } from "@/lib/securitytrust/types";

export function GapTable({ gaps }: { gaps: ComplianceGap[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">Risk Priority Queue</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Open compliance gaps</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-3 text-left">
          <thead className="text-xs uppercase tracking-[0.18em] text-white/40">
            <tr>
              <th className="px-4">Gap</th>
              <th className="px-4">Framework</th>
              <th className="px-4">Owner</th>
              <th className="px-4">Priority</th>
              <th className="px-4">ETA</th>
              <th className="px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {gaps.map((gap) => (
              <tr className="bg-black/20 text-sm text-white/70" key={gap.gap_id}>
                <td className="rounded-l-2xl px-4 py-4 font-semibold text-white">{gap.title}</td>
                <td className="px-4 py-4">{gap.framework}</td>
                <td className="px-4 py-4">{gap.owner}</td>
                <td className={gap.priority === "high" ? "px-4 py-4 text-red-100" : "px-4 py-4 text-amber-100"}>{gap.priority}</td>
                <td className="px-4 py-4 font-mono">{gap.eta_days}d</td>
                <td className="rounded-r-2xl px-4 py-4">{gap.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

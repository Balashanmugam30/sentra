"use client";

import { formatDefenseDate } from "@/lib/securitydefense/runtime";
import type { ForensicsState } from "@/lib/securitydefense/types";

export function ForensicLedger({ forensics }: { forensics: ForensicsState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Forensic Ledger</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Immutable investigation chain</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">Hash {forensics.chain_integrity}%</span>
          <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/60">CSV / JSON ready</span>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-left">
          <thead className="text-xs uppercase tracking-[0.18em] text-white/40">
            <tr>
              <th className="px-4">Time</th>
              <th className="px-4">Actor</th>
              <th className="px-4">Action</th>
              <th className="px-4">Target</th>
              <th className="px-4">Region</th>
              <th className="px-4">Result</th>
              <th className="px-4">Hash</th>
            </tr>
          </thead>
          <tbody>
            {forensics.ledger.map((entry) => (
              <tr className="bg-black/20 text-sm text-white/70" key={entry.ledger_id}>
                <td className="rounded-l-2xl px-4 py-4 font-mono text-xs text-white/45">{formatDefenseDate(entry.timestamp)}</td>
                <td className="px-4 py-4 font-mono text-xs">{entry.actor}</td>
                <td className="px-4 py-4 font-semibold text-white">{entry.action}</td>
                <td className="px-4 py-4">{entry.target}</td>
                <td className="px-4 py-4">{entry.ip_region}</td>
                <td className="px-4 py-4">{entry.result}</td>
                <td className="rounded-r-2xl px-4 py-4 font-mono text-xs text-cyan-100">{entry.chain_hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

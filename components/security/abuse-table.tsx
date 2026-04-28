"use client";

import { defenseTone } from "@/lib/securitydefense/runtime";
import type { DefenseThreat } from "@/lib/securitydefense/types";

export function AbuseTable({ threats, onIsolateKey, busyAction }: { threats: DefenseThreat[]; onIsolateKey: () => void; busyAction: string | null }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">Threat Intelligence</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Detector findings</h2>
        </div>
        <button className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={onIsolateKey} type="button">
          Isolate API Key
        </button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[920px] border-separate border-spacing-y-3 text-left">
          <thead className="text-xs uppercase tracking-[0.18em] text-white/40">
            <tr>
              <th className="px-4">Detector</th>
              <th className="px-4">Signal</th>
              <th className="px-4">Count</th>
              <th className="px-4">Confidence</th>
              <th className="px-4">Risk</th>
              <th className="px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {threats.map((threat) => (
              <tr className="bg-black/20 text-sm text-white/70" key={threat.threat_id}>
                <td className="rounded-l-2xl px-4 py-4 font-semibold text-white">{threat.detector}</td>
                <td className="px-4 py-4">{threat.signal}</td>
                <td className="px-4 py-4 font-mono">{threat.count}</td>
                <td className="px-4 py-4 font-mono">{threat.confidence}%</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full border px-3 py-1 font-mono text-xs ${defenseTone(threat.risk)}`}>{threat.risk}</span>
                </td>
                <td className="rounded-r-2xl px-4 py-4 text-white/55">{threat.recommended_action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

"use client";

import { formatMoney } from "@/lib/channel/runtime";
import type { OemState } from "@/lib/channel/types";

export function OemContracts({ oem }: { oem: OemState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">OEM licensing</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Embedded Sentra contracts</h2>
      <div className="mt-5 space-y-3">
        {oem.contracts.map((contract) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-4" key={contract.oem_id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{contract.name}</h3>
                <p className="mt-1 text-sm text-white/50">{contract.partner} · {contract.sector}</p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">{contract.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Commit" value={formatMoney(contract.annual_commitment)} />
              <Metric label="Seats" value={contract.seats.toLocaleString()} />
              <Metric label="API" value={`${Math.round(contract.api_embedded_usage / 1_000_000)}M`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 font-mono text-sm text-white">{value}</p>
    </div>
  );
}


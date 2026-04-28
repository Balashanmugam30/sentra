import type { OpsOccupancyWave, OpsVendorRecord } from "@/lib/ops/types";

type VendorPanelProps = {
  vendors: OpsVendorRecord[];
  waves: OpsOccupancyWave[];
};

export function VendorPanel({ vendors, waves }: VendorPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/70">Vendor Coordination</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">External recovery + return waves</h2>
      <div className="mt-5 grid gap-3">
        {vendors.map((vendor) => (
          <article key={vendor.vendor_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{vendor.name}</h3>
                <p className="mt-1 text-sm text-slate-300">{vendor.scope} - {vendor.status}</p>
              </div>
              <span className="font-bold text-cyan-100">{vendor.eta}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        {waves.map((wave) => (
          <div key={wave.wave} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
            <span className="text-slate-300">{wave.wave}: {wave.scope}</span>
            <span className="font-bold text-emerald-100">{wave.eta}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

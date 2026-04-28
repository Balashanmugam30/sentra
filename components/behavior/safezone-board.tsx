import type { SafeZone } from "@/lib/behavior/crowd";

type SafezoneBoardProps = {
  safeZones: SafeZone[];
};

export function SafezoneBoard({ safeZones }: SafezoneBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Safe-zone balancer</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {safeZones.map((zone) => (
          <article key={zone.safezone_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="font-black text-white">{zone.name}</p>
            <p className="mt-1 text-xs text-slate-400">{zone.assigned.toLocaleString()} / {zone.capacity.toLocaleString()} assigned</p>
            <div className="mt-4 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${Math.min(zone.load_percent, 100)}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
              <span>{zone.load_percent}% load</span>
              <span>{zone.readiness}% ready</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-cyan-100">{zone.recommended_shift}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

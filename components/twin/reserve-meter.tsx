import type { TwinResourcesState } from "@/lib/twin/types";

export function ReserveMeter({ resources }: { resources: TwinResourcesState }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Reserve Health</p>
      <h2 className="mt-2 text-2xl font-black text-white">Reserve Meter</h2>
      <div className="mt-5 rounded-full border border-blue-300/25 bg-blue-300/10 p-8 text-center">
        <p className="text-6xl font-black text-white">{Math.round(resources.reserve_health)}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-blue-100/70">reserve health</p>
      </div>
      <div className="mt-5 space-y-3">
        {resources.best_reallocation_moves.slice(0, 4).map((move) => (
          <p key={move} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">{move}</p>
        ))}
      </div>
    </section>
  );
}


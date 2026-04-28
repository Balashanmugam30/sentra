import type { CorridorPressure as CorridorPressureType } from "@/lib/behavior/crowd";

type CorridorPressureProps = {
  corridors: CorridorPressureType[];
};

export function CorridorPressure({ corridors }: CorridorPressureProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Corridor pressure control</p>
      <div className="mt-5 space-y-4">
        {corridors.map((corridor) => (
          <div key={corridor.zone}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{corridor.zone}</span>
              <span className="text-slate-300">pressure {corridor.pressure} / reverse {corridor.reverse_flow_risk}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-rose-400" style={{ width: `${Math.min(corridor.pressure, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { BehaviorZone } from "@/lib/behavior/types";

type FreezeBoardProps = {
  zones: BehaviorZone[];
};

export function FreezeBoard({ zones }: FreezeBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Freeze risk board</p>
      <div className="mt-4 grid gap-3">
        {zones.slice(0, 5).map((zone) => (
          <article key={zone.zone_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{zone.name}</p>
                <p className="mt-1 text-xs text-slate-500">{zone.alarm_status}</p>
              </div>
              <p className="text-2xl font-black text-blue-100">{zone.freeze_score}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{zone.intervention}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


import type { TwinFacilityState } from "@/lib/twin/types";

export function UtilityPanel({ facility }: { facility: TwinFacilityState }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Executive Building Twin</p>
      <h2 className="mt-2 text-2xl font-black text-white">Utilities & Safe Systems</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {facility.utilities.map((utility) => (
          <article key={utility.name} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white">{utility.name}</h3>
              <span className="text-xl font-black text-emerald-200">{utility.health}%</span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{utility.status.replaceAll("_", " ")}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{utility.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


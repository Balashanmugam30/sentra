import type { TwinResponder } from "@/lib/twin/types";

export function ResponderTracker({ responders }: { responders: TwinResponder[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Responder Movement Twin</p>
      <h2 className="mt-2 text-2xl font-black text-white">Responder Positions</h2>
      <div className="mt-5 space-y-3">
        {responders.map((responder) => (
          <article key={responder.responder_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-white">{responder.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{responder.mission}</p>
              </div>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">{responder.eta_minutes}m</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


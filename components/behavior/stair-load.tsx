import type { ElevatorLogic, StairLoad as StairLoadType } from "@/lib/behavior/crowd";

type StairLoadProps = {
  stairs: StairLoadType[];
  elevators: ElevatorLogic[];
};

export function StairLoad({ stairs, elevators }: StairLoadProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Stairwell and elevator logic</p>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          {stairs.map((stair) => (
            <article key={stair.stair_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-white">{stair.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{stair.floors_served} - {stair.status}</p>
                </div>
                <p className="text-2xl font-black text-cyan-100">{stair.load_percent}%</p>
              </div>
              <p className="mt-2 text-xs text-slate-400">Reverse-flow risk {stair.reverse_flow_risk}%</p>
            </article>
          ))}
        </div>
        <div className="space-y-3">
          {elevators.map((elevator) => (
            <article key={elevator.elevator_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-white">{elevator.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{elevator.priority}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${elevator.available ? "bg-emerald-400/15 text-emerald-100" : "bg-rose-400/15 text-rose-100"}`}>
                  {elevator.available ? "AVAILABLE" : "LOCKED"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

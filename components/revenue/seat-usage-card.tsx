import type { SeatSnapshot } from "@/lib/revenue/types";

type SeatUsageCardProps = {
  seats: SeatSnapshot;
  busyAction: string | null;
  onAddSeats: () => void;
  onRemoveSeats: () => void;
};

export function SeatUsageCard({ seats, busyAction, onAddSeats, onRemoveSeats }: SeatUsageCardProps) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Seat management</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-black text-white">{seats.utilization_percent}%</p>
          <p className="text-sm text-slate-400">capacity used</p>
        </div>
        <div className="text-right text-sm text-slate-300">
          <p>{seats.seats_used}/{seats.seats_purchased} active</p>
          <p>{seats.pending_invites} pending invites</p>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300" style={{ width: `${seats.utilization_percent}%` }} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-black/20 p-3 text-center">
          <p className="text-xl font-black text-white">{seats.available_seats}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">available</p>
        </div>
        <div className="rounded-2xl bg-black/20 p-3 text-center">
          <p className="text-xl font-black text-white">{seats.suspended_users}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">suspended</p>
        </div>
        <div className="rounded-2xl bg-black/20 p-3 text-center">
          <p className="text-xl font-black text-amber-100">{seats.pending_invites}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">invited</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{seats.recommendation}</p>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={onAddSeats} disabled={busyAction === "add-seats"} className="flex-1 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-60">
          Add seats
        </button>
        <button type="button" onClick={onRemoveSeats} disabled={busyAction === "remove-seats"} className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
          Remove seats
        </button>
      </div>
    </article>
  );
}


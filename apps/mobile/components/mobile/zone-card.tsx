import { cn } from "../../lib/mobile/helpers";
import type { ZoneStatus } from "../../lib/mobile/types";

type ZoneCardProps = {
  zone: ZoneStatus;
};

export function ZoneCard({ zone }: ZoneCardProps) {
  return (
    <article
      className={cn(
        "rounded-[22px] border p-4",
        zone.risk === "clear" && "border-emerald-300/20 bg-emerald-400/10",
        zone.risk === "watch" && "border-amber-300/20 bg-amber-400/10",
        zone.risk === "blocked" && "border-red-300/25 bg-red-400/12",
        zone.risk === "hazard" && "border-red-300/30 bg-red-500/16",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">{zone.name}</p>
          <p className="mt-1 text-xs text-slate-400">{zone.civiliansNearby} civilians nearby</p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-200">
          {zone.risk}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-300">{zone.exitsOpen} exits open</p>
    </article>
  );
}

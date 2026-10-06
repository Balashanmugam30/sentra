import { congestionLabel, formatEta } from "@/lib/mobile/helpers";
import type { CongestionLevel } from "@/lib/mobile/types";

type EtaChipProps = {
  congestion: CongestionLevel;
  distanceMeters: number;
  etaSeconds: number;
};

export function EtaChip({ congestion, distanceMeters, etaSeconds }: EtaChipProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-3xl border border-blue-300/20 bg-blue-400/12 p-3">
        <p className="text-xs text-blue-100/70">ETA</p>
        <p className="mt-1 text-lg font-bold text-white">{formatEta(etaSeconds)}</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-3">
        <p className="text-xs text-slate-400">Distance</p>
        <p className="mt-1 text-lg font-bold text-white">{distanceMeters}m</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-3">
        <p className="text-xs text-slate-400">Crowd</p>
        <p className="mt-1 text-lg font-bold text-white">{congestionLabel(congestion)}</p>
      </div>
    </div>
  );
}

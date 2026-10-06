import type { ZoneStatus } from "@/lib/mobile/types";
import { GlassCard } from "./glass-card";
import { ZoneCard } from "./zone-card";

type DangerZonePanelProps = {
  zones: ZoneStatus[];
};

export function DangerZonePanel({ zones }: DangerZonePanelProps) {
  return (
    <GlassCard glow="warning">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">Danger zones</p>
      <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Floor risk map</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {zones.map((zone) => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>
    </GlassCard>
  );
}

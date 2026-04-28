import { getNodeHealthBand } from "@/lib/iot/health";
import { cn } from "@/lib/utils";

const bandStyles = {
  green: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  yellow: "border-amber-300/35 bg-amber-400/10 text-amber-100",
  red: "border-red-300/35 bg-red-500/15 text-red-100",
};

export function HealthScore({ score, label = "Health" }: { score: number; label?: string }) {
  const band = getNodeHealthBand(score);

  return (
    <div className={cn("rounded-2xl border p-3", bandStyles[band])}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">{label}</p>
        <p className="text-xl font-semibold tracking-[-0.04em]">{score}</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-black/30">
        <div className="h-full rounded-full bg-current transition-all duration-700" style={{ width: `${Math.max(4, score)}%` }} />
      </div>
    </div>
  );
}

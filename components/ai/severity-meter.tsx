import { cn } from "@/lib/utils";

function tone(score: number) {
  if (score >= 82) {
    return "text-red-100 border-red-300/35 bg-red-500/15";
  }
  if (score >= 64) {
    return "text-amber-100 border-amber-300/35 bg-amber-400/10";
  }
  return "text-emerald-100 border-emerald-300/30 bg-emerald-400/10";
}

export function SeverityMeter({
  label,
  score,
  detail,
}: {
  label: string;
  score: number;
  detail: string;
}) {
  return (
    <article className={cn("rounded-[30px] border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl", tone(score))}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-5xl font-semibold tracking-[-0.07em]">{score}</p>
        <span className="text-xs font-bold uppercase tracking-[0.18em] opacity-65">/100</span>
      </div>
      <div className="mt-4 h-3 rounded-full bg-black/30">
        <div className="h-full rounded-full bg-current transition-all duration-700" style={{ width: `${Math.max(4, score)}%` }} />
      </div>
      <p className="mt-3 text-sm leading-6 opacity-70">{detail}</p>
    </article>
  );
}

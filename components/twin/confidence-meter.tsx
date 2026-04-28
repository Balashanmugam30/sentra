export function ConfidenceMeter({ label, value, tone = "cyan" }: { label: string; value: number; tone?: "cyan" | "emerald" | "amber" | "rose" }) {
  const color = {
    cyan: "bg-cyan-300 text-cyan-100 border-cyan-300/25",
    emerald: "bg-emerald-300 text-emerald-100 border-emerald-300/25",
    amber: "bg-amber-300 text-amber-100 border-amber-300/25",
    rose: "bg-rose-300 text-rose-100 border-rose-300/25",
  }[tone];

  return (
    <div className={`rounded-3xl border bg-white/[0.055] p-4 ${color.split(" ").slice(1).join(" ")}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <p className="text-2xl font-black text-white">{value}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
        <div className={`h-full rounded-full ${color.split(" ")[0]} shadow-[0_0_18px_rgba(103,232,249,0.35)]`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}


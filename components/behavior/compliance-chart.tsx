import type { BehaviorZone } from "@/lib/behavior/types";

type ComplianceChartProps = {
  zones: BehaviorZone[];
};

export function ComplianceChart({ zones }: ComplianceChartProps) {
  const averages = zones.reduce(
    (acc, zone) => {
      acc.obey += zone.compliance.obey_immediately;
      acc.delay += zone.compliance.delay_then_comply;
      acc.ignore += zone.compliance.ignore_warning;
      acc.opposite += zone.compliance.move_opposite_direction;
      return acc;
    },
    { obey: 0, delay: 0, ignore: 0, opposite: 0 },
  );
  const count = Math.max(1, zones.length);
  const rows = [
    ["Obey immediately", Math.round(averages.obey / count), "from-emerald-300 to-cyan-300"],
    ["Delay then comply", Math.round(averages.delay / count), "from-amber-300 to-orange-300"],
    ["Ignore warning", Math.round(averages.ignore / count), "from-rose-300 to-red-400"],
    ["Move opposite direction", Math.round(averages.opposite / count), "from-fuchsia-300 to-violet-400"],
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Compliance forecast</p>
      <div className="mt-5 space-y-4">
        {rows.map(([label, value, color]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{label}</span>
              <span className="font-black text-white">{value}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


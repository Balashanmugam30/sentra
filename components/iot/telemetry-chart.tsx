import type { IotChartPoint } from "@/lib/iot/types";

export function TelemetryChart({
  title,
  unit,
  points,
  tone = "cyan",
}: {
  title: string;
  unit: string;
  points: IotChartPoint[];
  tone?: "cyan" | "amber" | "red";
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const fill = tone === "amber" ? "bg-amber-300" : tone === "red" ? "bg-red-400" : "bg-cyan-300";

  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Telemetry Analytics</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{title}</h2>
        </div>
        <p className="text-sm font-semibold text-white/55">{unit}</p>
      </div>
      <div className="mt-6 flex h-52 items-end gap-2">
        {points.map((point) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={`${title}-${point.label}`}>
            <div className="flex h-40 w-full items-end rounded-full bg-black/25 p-1">
              <div
                className={`w-full rounded-full ${fill} shadow-[0_0_24px_currentColor] transition-all duration-700`}
                style={{ height: `${Math.max(4, (point.value / max) * 100)}%` }}
              />
            </div>
            <span className="truncate text-[10px] text-white/35">{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

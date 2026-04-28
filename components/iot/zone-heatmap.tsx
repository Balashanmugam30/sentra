import type { IotNode } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

export function ZoneHeatmap({ nodes }: { nodes: IotNode[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Zone Heatmap</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Building risk density</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {nodes.map((node) => (
          <div
            className={cn(
              "rounded-3xl border p-4",
              node.risk_level === "SAFE" && "border-emerald-300/20 bg-emerald-400/10",
              node.risk_level === "WARNING" && "border-amber-300/30 bg-amber-400/10",
              (node.risk_level === "CRITICAL" || node.risk_level === "CRITICAL+") && "border-red-300/35 bg-red-500/15",
            )}
            key={node.node_id}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{node.zone}</p>
                <p className="mt-1 text-xs text-white/45">Floor {node.floor} - {node.label}</p>
              </div>
              <span className="text-2xl font-semibold text-white">{node.risk_score}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-white/70" style={{ width: `${Math.max(5, node.risk_score)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

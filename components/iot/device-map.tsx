import type { IotNode } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

const nodePositions: Record<string, { left: string; top: string }> = {
  utility_node_01: { left: "24%", top: "62%" },
  corridor_cam_01: { left: "68%", top: "34%" },
};

export function DeviceMap({ nodes }: { nodes: IotNode[] }) {
  return (
    <section className="relative min-h-[360px] overflow-hidden rounded-[32px] border border-white/10 bg-[#020617] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.26)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_60%,rgba(245,158,11,0.14),transparent_18%),radial-gradient(circle_at_68%_34%,rgba(34,211,238,0.16),transparent_18%)]" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Device Map</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Grand Meridian Hotel</h2>
          <p className="mt-1 text-sm text-white/50">Kitchen utility zone and public corridor verification node.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
          Prototype Mesh
        </span>
      </div>

      <div className="absolute left-[12%] top-[48%] h-24 w-36 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06]" />
      <div className="absolute right-[12%] top-[20%] h-32 w-44 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06]" />
      <div className="absolute left-[31%] top-[52%] h-1 w-[36%] rotate-[-20deg] rounded-full bg-gradient-to-r from-amber-300/60 via-cyan-300/50 to-cyan-200/20" />

      {nodes.map((node, index) => {
        const position = nodePositions[node.node_id] ?? { left: `${20 + index * 18}%`, top: `${42 + index * 10}%` };
        const isCritical = node.risk_level === "CRITICAL" || node.risk_level === "CRITICAL+";
        return (
          <div key={node.node_id} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={position}>
            <div
              className={cn(
                "relative h-5 w-5 rounded-full border shadow-[0_0_30px_currentColor]",
                isCritical
                  ? "border-red-200 bg-red-400 text-red-300"
                  : node.risk_level === "WARNING"
                    ? "border-amber-200 bg-amber-300 text-amber-300"
                    : "border-cyan-100 bg-cyan-300 text-cyan-300",
              )}
            >
              <span className="absolute inset-[-10px] rounded-full border border-current opacity-30" />
            </div>
            <div className="mt-3 w-48 rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur-xl">
              <p className="text-sm font-semibold text-white">{node.label}</p>
              <p className="mt-1 text-xs text-white/45">{node.zone}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

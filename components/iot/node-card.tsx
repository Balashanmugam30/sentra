import { HealthScore } from "@/components/iot/health-score";
import type { IotNode } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

const statusStyles = {
  online: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-300/35 bg-amber-400/10 text-amber-100",
  critical: "border-red-300/35 bg-red-500/15 text-red-100",
  offline: "border-slate-400/25 bg-slate-500/10 text-slate-200",
  awaiting_telemetry: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  maintenance: "border-blue-300/25 bg-blue-400/10 text-blue-100",
  disabled: "border-white/10 bg-white/5 text-white/45",
};

function formatHeartbeat(value: string | null) {
  if (!value) {
    return "No heartbeat";
  }
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function NodeCard({
  node,
  onSelect,
}: {
  node: IotNode;
  onSelect: (node: IotNode) => void;
}) {
  return (
    <button
      className="rounded-[28px] border border-white/10 bg-white/[0.045] p-4 text-left shadow-[0_22px_70px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.065]"
      onClick={() => onSelect(node)}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/55">{node.node_id}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white">{node.label}</h3>
          <p className="mt-1 text-sm text-white/45">
            Floor {node.floor} - {node.zone}
          </p>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase", statusStyles[node.status])}>
          {node.status.replace("_", " ")}
        </span>
      </div>
      <div className="mt-4">
        <HealthScore score={node.health_score} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/55">
        <div className="rounded-2xl bg-black/20 p-3">
          <span className="block text-white/35">RSSI</span>
          <strong className="mt-1 block text-white">{node.wifi_rssi ?? "--"} dBm</strong>
        </div>
        <div className="rounded-2xl bg-black/20 p-3">
          <span className="block text-white/35">Latency</span>
          <strong className="mt-1 block text-white">{node.latency_ms} ms</strong>
        </div>
        <div className="rounded-2xl bg-black/20 p-3">
          <span className="block text-white/35">Heartbeat</span>
          <strong className="mt-1 block text-white">{formatHeartbeat(node.last_heartbeat)}</strong>
        </div>
      </div>
    </button>
  );
}

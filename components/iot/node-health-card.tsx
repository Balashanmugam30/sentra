import type { IotNode, IotNodeStatus } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<IotNodeStatus, string> = {
  online: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  offline: "border-slate-500/30 bg-slate-500/10 text-slate-200",
  warning: "border-amber-300/35 bg-amber-400/10 text-amber-100",
  critical: "border-red-300/40 bg-red-500/15 text-red-100",
  awaiting_telemetry: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  maintenance: "border-blue-300/25 bg-blue-400/10 text-blue-100",
  disabled: "border-white/10 bg-white/5 text-white/45",
};

function formatHeartbeat(value: string | null) {
  if (!value) {
    return "Awaiting first heartbeat";
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return "Heartbeat timestamp unavailable";
  }

  return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function NodeHealthCard({ node }: { node: IotNode }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">
            {node.node_type === "corridor_camera" ? "ESP32-CAM" : "ESP32 Edge Node"}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">{node.label}</h2>
          <p className="mt-1 text-sm text-white/50">{node.install_location}</p>
        </div>
        <span className={cn("rounded-full border px-3 py-1 text-xs font-bold uppercase", statusStyles[node.status])}>
          {node.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">RSSI</p>
          <p className="mt-1 text-lg font-semibold text-white">{node.wifi_rssi ?? "--"} dBm</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Battery</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {node.battery === null ? "USB" : `${node.battery.toFixed(0)}%`}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Risk</p>
          <p className="mt-1 text-lg font-semibold text-white">{node.risk_score}/100</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] px-4 py-3 text-sm text-cyan-50/75">
        Last heartbeat: <span className="font-semibold text-cyan-100">{formatHeartbeat(node.last_heartbeat)}</span>
      </div>
    </article>
  );
}

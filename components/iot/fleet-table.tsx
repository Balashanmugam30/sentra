"use client";

import type { IotNode } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

const actionLabels = {
  ping: "Ping",
  restart: "Restart",
  mute: "Mute",
  snapshot: "Snapshot",
  disable: "Disable",
};

export type FleetNodeAction = keyof typeof actionLabels;

export function FleetTable({
  nodes,
  busyNodeId,
  onAction,
  onSelect,
}: {
  nodes: IotNode[];
  busyNodeId: string | null;
  onAction: (nodeId: string, action: FleetNodeAction) => void;
  onSelect: (node: IotNode) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Fleet Management</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Node operations table</h2>
        </div>
        <p className="text-sm text-white/45">{nodes.length} registered nodes</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full text-left text-sm">
          <thead className="bg-black/25 text-[11px] uppercase tracking-[0.2em] text-white/40">
            <tr>
              {["Node", "Type", "Location", "Status", "Battery", "Wi-Fi", "Firmware", "Risk", "Actions"].map((heading) => (
                <th className="px-4 py-3 font-semibold" key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr className="border-t border-white/10 text-white/70" key={node.node_id}>
                <td className="px-4 py-4">
                  <button className="text-left" onClick={() => onSelect(node)} type="button">
                    <span className="block font-semibold text-white">{node.label}</span>
                    <span className="mt-1 block text-xs text-cyan-100/55">{node.node_id}</span>
                  </button>
                </td>
                <td className="px-4 py-4">{node.node_type.replaceAll("_", " ")}</td>
                <td className="px-4 py-4">Floor {node.floor} - {node.zone}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase">
                    {node.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-4">{node.battery === null ? "USB" : `${Math.round(node.battery)}%`}</td>
                <td className="px-4 py-4">{node.wifi_rssi ?? "--"} dBm</td>
                <td className="px-4 py-4">{node.firmware_version}</td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      node.risk_level === "SAFE" && "bg-emerald-400/10 text-emerald-100",
                      node.risk_level === "WARNING" && "bg-amber-400/10 text-amber-100",
                      (node.risk_level === "CRITICAL" || node.risk_level === "CRITICAL+") && "bg-red-500/15 text-red-100",
                    )}
                  >
                    {node.risk_score}/100
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(actionLabels) as FleetNodeAction[]).map((action) => (
                      <button
                        className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-cyan-300/10 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={busyNodeId === node.node_id}
                        key={action}
                        onClick={() => onAction(node.node_id, action)}
                        type="button"
                      >
                        {busyNodeId === node.node_id ? "..." : actionLabels[action]}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

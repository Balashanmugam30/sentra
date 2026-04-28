"use client";

import { useState } from "react";

import { HealthScore } from "@/components/iot/health-score";
import type { FleetNodeAction } from "@/components/iot/fleet-table";
import type { IotNode } from "@/lib/iot/types";

export function NodeDetailDrawer({
  node,
  busy,
  onAction,
  onClose,
  onRename,
}: {
  node: IotNode | null;
  busy: boolean;
  onAction: (nodeId: string, action: FleetNodeAction) => void;
  onClose: () => void;
  onRename: (nodeId: string, label: string) => void;
}) {
  const [draftLabel, setDraftLabel] = useState<{ nodeId: string; label: string } | null>(null);

  if (!node) {
    return null;
  }
  const label = draftLabel?.nodeId === node.node_id ? draftLabel.label : node.label;

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-white/10 bg-[#020617]/95 p-5 text-white shadow-[0_0_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Node Detail</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{node.label}</h2>
          <p className="mt-1 text-sm text-white/45">{node.node_id}</p>
        </div>
        <button
          aria-label="Close node detail"
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="mt-6">
        <HealthScore label="AI Device Health" score={node.health_score} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        {[
          ["Type", node.node_type.replaceAll("_", " ")],
          ["Building", node.building],
          ["Floor / Zone", `${node.floor} / ${node.zone}`],
          ["Firmware", node.firmware_version],
          ["Role", node.assigned_role.replaceAll("_", " ")],
          ["Packet Success", `${node.packet_success_rate.toFixed(1)}%`],
          ["Uptime", `${node.uptime_percent.toFixed(1)}%`],
          ["Latency", `${node.latency_ms} ms`],
        ].map(([labelText, value]) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4" key={labelText}>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{labelText}</p>
            <p className="mt-2 font-semibold text-white/85">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40" htmlFor="iot-node-label">
          Rename node
        </label>
        <div className="mt-3 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40"
            id="iot-node-label"
            onChange={(event) => setDraftLabel({ nodeId: node.node_id, label: event.target.value })}
            value={label}
          />
          <button
            className="rounded-2xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
            disabled={busy || !label.trim() || label.trim() === node.label}
            onClick={() => onRename(node.node_id, label.trim())}
            type="button"
          >
            Save
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {(["ping", "restart", "mute", "snapshot", "disable"] as FleetNodeAction[]).map((action) => (
          <button
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold capitalize text-white/75 transition hover:bg-cyan-300/10 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={busy}
            key={action}
            onClick={() => onAction(node.node_id, action)}
            type="button"
          >
            {action}
          </button>
        ))}
      </div>

      <div className="mt-auto rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-cyan-50/70">
        Actions are optimistic in the UI and persisted through the IoT command endpoint when the backend is available.
      </div>
    </aside>
  );
}

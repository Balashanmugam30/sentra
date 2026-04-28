"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";

import { CameraFeedCard } from "@/components/iot/camera-feed-card";
import { DeviceMap } from "@/components/iot/device-map";
import { FleetTable, type FleetNodeAction } from "@/components/iot/fleet-table";
import { LiveFeed } from "@/components/iot/live-feed";
import { NodeCard } from "@/components/iot/node-card";
import { NodeDetailDrawer } from "@/components/iot/node-detail-drawer";
import { RiskScoreCard } from "@/components/iot/risk-score-card";
import { SensorStatusGrid } from "@/components/iot/sensor-status-grid";
import { SimulationToggle } from "@/components/iot/simulation-toggle";
import { ZoneHeatmap } from "@/components/iot/zone-heatmap";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { buildIotCorrelations } from "@/lib/iot/correlation";
import { useIotTelemetry } from "@/lib/iot/use-iot";
import type { IotFeedItem, IotNode } from "@/lib/iot/types";

function formatLastUpdated(value: number | null) {
  if (!value) {
    return "Waiting for first refresh";
  }
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function buildFeedFallback(nodes: IotNode[]): IotFeedItem[] {
  return nodes.slice(0, 6).map((node) => ({
    id: `fallback-${node.node_id}`,
    timestamp: node.last_heartbeat ?? new Date().toISOString(),
    node_id: node.node_id,
    severity: node.risk_level,
    message: `${node.label} reports ${node.risk_level} with ${node.health_score}/100 device health`,
    kind: "telemetry",
  }));
}

export default function IotCommandPage() {
  const {
    fleet,
    nodes,
    events,
    camera,
    feed,
    loading,
    error,
    lastUpdatedAt,
    mode,
    usingMockBackend,
    busyNodeId,
    refresh,
    setMode,
    executeNodeAction,
    renameNode,
  } = useIotTelemetry();
  const [selectedNode, setSelectedNode] = useState<IotNode | null>(null);

  const utilityNode = useMemo(
    () => nodes.find((node) => node.node_id === "utility_node_01") ?? nodes.find((node) => node.node_type === "utility_risk_node") ?? null,
    [nodes],
  );
  const summary = fleet?.summary;
  const correlations = useMemo(() => buildIotCorrelations(nodes, events), [events, nodes]);
  const feedItems = feed?.feed?.length ? feed.feed : buildFeedFallback(nodes);

  const handleAction = (nodeId: string, action: FleetNodeAction) => {
    void executeNodeAction(nodeId, action);
  };

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.1),transparent_28%),linear-gradient(180deg,#02040a_0%,#020617_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
                  Sentra IoT Intelligence Suite
                </p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl">
                  Smart building device operations command center.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
                  Real hardware, simulation, fleet diagnostics, threshold intelligence, and incident
                  correlation for enterprise-grade smart buildings.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/iot/analytics" as Route}>
                  Analytics
                </Link>
                <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/iot/calibration" as Route}>
                  Calibration
                </Link>
                <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/iot/settings" as Route}>
                  Settings
                </Link>
                <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/iot/provisioning" as Route}>
                  Provision
                </Link>
                <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/iot/demo-lab" as Route}>
                  Demo Lab
                </Link>
                <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/iot/launch" as Route}>
                  Launch
                </Link>
                <button
                  className="rounded-2xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white"
                  onClick={() => {
                    void refresh();
                  }}
                  type="button"
                >
                  Refresh telemetry
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
              {[
                ["Active Nodes", summary?.active_nodes ?? 0],
                ["Offline", summary?.offline_nodes ?? 0],
                ["Critical", summary?.critical_alerts ?? 0],
                ["Avg Health", `${summary?.avg_health_score ?? 0}%`],
                ["Avg Latency", `${summary?.avg_latency_ms ?? 0} ms`],
                ["Events Today", summary?.total_events_today ?? events.length],
                ["Cameras Online", summary?.camera_nodes_online ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          <SimulationToggle mode={mode} onModeChange={setMode} />

          {error ? (
            <div className="rounded-3xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          {usingMockBackend ? (
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50/75">
              Mock backend fallback is active, so the command center remains fully usable without physical hardware or API availability.
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-6">
              <RiskScoreCard nodes={nodes} />
              <div className="grid gap-4 lg:grid-cols-3">
                {nodes.slice(0, 3).map((node) => (
                  <NodeCard key={node.node_id} node={node} onSelect={setSelectedNode} />
                ))}
              </div>
              <FleetTable busyNodeId={busyNodeId} nodes={nodes} onAction={handleAction} onSelect={setSelectedNode} />
              <DeviceMap nodes={nodes} />
            </div>
            <div className="grid gap-6">
              <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Correlation Engine</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Incident intelligence</h2>
                <div className="mt-5 grid gap-3">
                  {correlations.map((correlation) => (
                    <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={correlation.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{correlation.title}</p>
                          <p className="mt-2 text-sm leading-6 text-white/50">{correlation.explanation}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white/70">
                          {correlation.confidence}%
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
              <SensorStatusGrid node={utilityNode} />
              <ZoneHeatmap nodes={nodes} />
              <CameraFeedCard camera={camera} />
              <LiveFeed feed={feedItems} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/45">
            Last refresh: <span className="font-semibold text-white/70">{formatLastUpdated(lastUpdatedAt)}</span>
            {loading ? <span className="ml-3 text-cyan-100">Synchronizing...</span> : null}
          </div>
        </div>

        <NodeDetailDrawer
          busy={busyNodeId === selectedNode?.node_id}
          node={selectedNode}
          onAction={handleAction}
          onClose={() => setSelectedNode(null)}
          onRename={(nodeId, label) => {
            void renameNode(nodeId, label);
          }}
        />
      </main>
    </ProtectedWorkspaceShell>
  );
}

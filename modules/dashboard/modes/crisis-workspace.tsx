"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassPanel } from "@/components/ui/glass-panel";
import { LiveMapPanel } from "@/modules/dashboard/components/live-map-panel";

import type { ModeWorkspaceProps } from "@/modules/dashboard/modes/types";
import { getIncidentTitle } from "@/modules/dashboard/modes/workspace-metrics";

export function CrisisWorkspace({
  environment,
  geo,
  incidents,
  metrics,
  onOpenCommand,
  permissions,
}: ModeWorkspaceProps) {
  const activeIncidents = incidents.filter((incident) => incident.status !== "resolved").slice(0, 4);
  const topHazard = environment.live?.global_hazard_score ?? metrics.threatScore;
  const stabilizeEta = metrics.activeIncidents ? `${Math.max(4, 18 - metrics.criticalIncidents * 3)}m` : "standby";

  const operationalState = [
    { label: "Severity", value: `${metrics.threatScore}%` },
    { label: "Stabilize", value: stabilizeEta },
    { label: "Hazard", value: `${topHazard}%` },
    { label: "Responders", value: metrics.responderCount },
  ];

  return (
    <div className="space-y-5" data-section-id="crisis-workspace">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        {permissions.canViewGeo ? (
          <div data-section-id="crisis-map">
            <LiveMapPanel geo={geo} />
          </div>
        ) : (
          <EmptyState
            description="Your current role cannot access the emergency live map."
            eyebrow="Map restricted"
            title="Geospatial permission required"
          />
        )}

        <aside className="space-y-4">
          <GlassPanel className="sentra-obsidian-panel" tone="quiet">
            <p className="sentra-obsidian-eyebrow">War room state</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {operationalState.map((item) => (
                <div className="sentra-obsidian-stat" key={item.label}>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="sentra-obsidian-panel" tone="quiet">
            <p className="sentra-obsidian-eyebrow">Active zones</p>
            <div className="mt-4 space-y-3">
              {activeIncidents.length ? (
                activeIncidents.map((incident) => (
                  <div className="sentra-obsidian-list-card" key={incident.id}>
                    <p className="text-sm font-semibold text-white">{getIncidentTitle(incident)}</p>
                    <p className="mt-2 text-sm leading-6 text-white/54">
                      {incident.recommended_action || "Verify signal, stage responders, and monitor route pressure."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-white/56">
                  No active incident zones. Crisis controls remain armed for rapid transition.
                </p>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="sentra-obsidian-panel" tone="quiet">
            <p className="sentra-obsidian-eyebrow">Responder visibility</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="sentra-obsidian-stat">
                <p>Tracked</p>
                <strong>{metrics.responderCount}</strong>
              </div>
              <div className="sentra-obsidian-stat">
                <p>Blocked</p>
                <strong>{metrics.blockedRoutes}</strong>
              </div>
            </div>
          </GlassPanel>
        </aside>
      </div>

      <div className="sentra-crisis-command-bar sentra-obsidian-command-bar">
        <Button onClick={onOpenCommand} variant="danger">
          Lockdown
        </Button>
        <Link className="sentra-command-link sentra-command-link-danger" href="/operations/execution">
          Evacuate
        </Link>
        <Link className="sentra-command-link" href="/operations/resources">
          Medical dispatch
        </Link>
        <Link className="sentra-command-link" href="/operations/communications">
          Public alert
        </Link>
      </div>
    </div>
  );
}

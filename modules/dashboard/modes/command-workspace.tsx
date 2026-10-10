"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionTitle } from "@/components/ui/section-title";
import { LiveMapPanel } from "@/modules/dashboard/components/live-map-panel";
import { AIRecommendationsFeed } from "@/modules/dashboard/components/ai-recommendations-feed";

import type { ModeWorkspaceProps } from "@/modules/dashboard/modes/types";
import { getIncidentTitle } from "@/modules/dashboard/modes/workspace-metrics";

function statusTone(status: string) {
  if (status === "resolved") {
    return "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/14 dark:bg-white/[0.055] dark:text-white/70";
  }
  if (status === "critical" || status === "active") {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-200/20 dark:bg-rose-300/10 dark:text-rose-50";
  }
  return "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/14 dark:bg-white/[0.055] dark:text-white/70";
}

function SocSnapshot({ soc }: { soc: ModeWorkspaceProps["soc"] }) {
  const live = soc.live;
  const snapshotItems = [
    ["Open", live?.open_incidents ?? "--"],
    ["Detections", live?.detections_today ?? "--"],
    ["Health", live?.health_score ? `${live.health_score}%` : "--"],
    ["Blocked", live?.blocked_actions ?? "--"],
  ];

  return (
    <GlassPanel as="section" data-section-id="command-soc-snapshot">
      <SectionTitle
        description="Security signal condensed for operators. Open the SOC for forensic detail."
        eyebrow="SOC snapshot"
        title="Threat posture"
        action={
          <Link className="sentra-command-link" href="/security/soc">
            Open SOC
          </Link>
        }
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {snapshotItems.map(([label, value]) => (
          <div className="sentra-phase7-mini-stat" key={label}>
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/38">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {(live?.top_alerts ?? []).slice(0, 2).map((alert, index) => (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/62" key={`${alert}-${index}`}>
            {alert}
          </div>
        ))}
        {soc.error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-200/14 dark:bg-amber-400/8">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Unable to sync live data.</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/52">Showing the last verified SOC snapshot.</p>
            <Button className="mt-3" onClick={() => void soc.refresh()} variant="secondary">
              Retry
            </Button>
          </div>
        ) : null}
        {!soc.error && (live?.top_alerts?.length ?? 0) === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/52">
            No priority SOC alerts are active.
          </p>
        ) : null}
      </div>
    </GlassPanel>
  );
}

export function CommandWorkspace({
  geo,
  incidents,
  onOpenCommand,
  permissions,
  soc,
}: ModeWorkspaceProps) {
  const activeIncidents = incidents.filter((incident) => incident.status !== "resolved").slice(0, 6);

  return (
    <div className="space-y-6" data-section-id="command-workspace">
      <div className="sentra-phase7-grid-row">
        <GlassPanel as="section" tone="hero" data-section-id="command-incidents">
          <SectionTitle
            description="Operator-first feed with only the incidents that need attention now."
            eyebrow="Live incident feed"
            title="Live situation feed"
          />
          <div className="mt-5 space-y-3">
            {activeIncidents.length ? (
              activeIncidents.map((incident) => (
                <article
                  className="sentra-incident-row rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-white/[0.08] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_100%)] dark:backdrop-blur-xl dark:hover:border-cyan-400/30 dark:hover:bg-white/[0.06] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_20px_rgba(56,189,248,0.08)]"
                  key={incident.id}
                >
                  {(() => {
                    const liveIncident = incident as typeof incident & {
                      eta_minutes?: number;
                      lifecycle_status?: string;
                      spread_probability?: number;
                      timeline_logs?: Array<{ id: string; message: string }>;
                    };
                    return (
                      <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-slate-900 tracking-tight dark:text-white">{getIncidentTitle(incident)}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/54">
                        {incident.ai_summary || incident.description || incident.recommended_action || "Awaiting AI summary."}
                      </p>
                    </div>
                    <span className={`sentra-severity-chip w-fit rounded-full border px-3 py-1 font-mono text-[0.66rem] font-bold uppercase tracking-[0.16em] ${statusTone(incident.status)}`}>
                      {incident.priority || incident.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 font-mono text-[0.68rem] text-slate-500 dark:text-white/45">
                    <span className="rounded-md border border-slate-200 bg-slate-100/80 px-2 py-0.5 dark:border-white/8 dark:bg-white/[0.03]">{incident.location || "Unknown location"}</span>
                    <span className="rounded-md border border-slate-200 bg-slate-100/80 px-2 py-0.5 dark:border-white/8 dark:bg-white/[0.03]">SEV {incident.severity}</span>
                    {liveIncident.lifecycle_status ? <span className="rounded-md border border-slate-200 bg-slate-100/80 px-2 py-0.5 dark:border-white/8 dark:bg-white/[0.03]">{liveIncident.lifecycle_status}</span> : null}
                    {liveIncident.eta_minutes ? <span className="rounded-md border border-sky-400/20 bg-sky-500/10 text-sky-700 dark:text-sky-300 px-2 py-0.5">ETA {liveIncident.eta_minutes}m</span> : null}
                    {liveIncident.spread_probability ? <span className="rounded-md border border-amber-400/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5">Spread {liveIncident.spread_probability}%</span> : null}
                    {incident.decision_confidence ? <span className="rounded-md border border-emerald-400/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5">AI {incident.decision_confidence}%</span> : null}
                  </div>
                  {liveIncident.timeline_logs?.[0] ? (
                    <p className="mt-3 rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-2 text-xs leading-5 text-slate-700 dark:border-white/10 dark:bg-white/[0.045] dark:text-white/62">
                      {liveIncident.timeline_logs[0].message}
                    </p>
                  ) : null}
                      </>
                    );
                  })()}
                </article>
              ))
            ) : (
              <EmptyState
                description="No active operational incidents are waiting in the command queue."
                eyebrow="Quiet command surface"
                title="All clear for now"
              />
            )}
          </div>
        </GlassPanel>

        <AIRecommendationsFeed />
      </div>

      <div className="sentra-phase7-grid-row">
        {permissions.canViewGeo ? (
          <div data-section-id="command-map">
            <LiveMapPanel geo={geo} />
          </div>
        ) : (
          <EmptyState
            description="Your current role cannot access live geospatial overlays."
            eyebrow="Map restricted"
            title="Live map permissions required"
          />
        )}
        {permissions.canViewSoc ? <SocSnapshot soc={soc} /> : null}
      </div>

      <GlassPanel as="section" data-section-id="command-actions">
        <SectionTitle
          description="Frequent operator actions stay available without crowding the first screen."
          eyebrow="Operations queue"
          title="Command actions"
        />
        <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm leading-6 text-slate-600 dark:text-white/58">
              Move from signal to action: dispatch teams, notify leaders, start protocols, or request command search.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button onClick={onOpenCommand} variant="primary">
                Dispatch
              </Button>
              <Link className="sentra-command-link" href="/operations/communications">
                Notify teams
              </Link>
              <Link className="sentra-command-link" href="/operations/execution">
                Start protocol
              </Link>
              <Link className="sentra-command-link sentra-command-link-danger" href="/operations/governance">
                Lockdown review
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.035]">
            <SectionTitle eyebrow="Latest alerts" title="Verified signal" />
            <div className="mt-4 space-y-3">
              {(soc.live?.top_alerts ?? []).slice(0, 3).map((alert, index) => (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/62" key={`${alert}-${index}`}>
                  {alert}
                </div>
              ))}
              {(soc.live?.top_alerts?.length ?? 0) === 0 ? (
                <p className="text-sm leading-6 text-slate-500 dark:text-white/52">
                  SOC alerts are syncing. Verified command data remains available.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </GlassPanel>

    </div>
  );
}

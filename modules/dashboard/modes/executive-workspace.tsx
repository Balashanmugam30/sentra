"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionTitle } from "@/components/ui/section-title";
import { ExecutiveFocusMode } from "@/modules/dashboard/components/executive-focus-mode";
import { LiveOperationsCharts } from "@/modules/charts/live-operations-charts";
import { useLiveDataStore } from "@/lib/realtime/live-data-store";

import type { ModeWorkspaceProps } from "@/modules/dashboard/modes/types";
import { getIncidentTitle } from "@/modules/dashboard/modes/workspace-metrics";

export function ExecutiveWorkspace({
  incidents,
  metrics,
  onModeChange,
  permissions,
  soc,
}: ModeWorkspaceProps) {
  const executiveLive = useLiveDataStore((state) => state.executive);
  const activeIncidents = incidents.filter((incident) => incident.status !== "resolved").slice(0, 3);
  const continuity = executiveLive.continuityScore || Math.max(68, 100 - metrics.activeIncidents * 4 - metrics.blockedRoutes * 3);
  const resilience = Math.max(70, Math.min(99, metrics.systemHealth - metrics.criticalIncidents * 2));

  return (
    <div className="space-y-6" data-section-id="executive-workspace">
      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <GlassPanel as="section" tone="gold" data-section-id="executive-summary">
          <SectionTitle
            description="Executive mode suppresses telemetry spam and surfaces decisions, exposure, compliance, and continuity."
            eyebrow="Boardroom intelligence"
            title="Leadership summary"
            action={
              <Button onClick={() => onModeChange("demo")} variant="secondary">
                Present story
              </Button>
            }
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["AI Summary", `${metrics.activeIncidents} active incidents, ${metrics.criticalIncidents} critical threats, confidence ${metrics.aiConfidence}%.`],
              ["Business continuity", `Continuity index ${continuity}%. Priority is stabilizing high-impact zones before escalation.`],
              ["Compliance score", `${soc.live?.health_score ?? metrics.systemHealth}% security posture with audit-ready SOC telemetry.`],
              ["Resilience score", `${resilience}% resilience posture across security, response, and digital twin signals.`],
            ].map(([label, value]) => (
              <div className="rounded-2xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.015)_100%)] p-4.5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)]" key={label}>
                <p className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.22em] text-amber-200/60">{label}</p>
                <p className="mt-3 text-sm leading-6 text-white/70">{value}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel as="aside" tone="quiet" data-section-id="executive-actions">
          <SectionTitle eyebrow="Strategic recommendations" title="Next board actions" />
          <div className="mt-5 space-y-3">
            {(activeIncidents.length ? activeIncidents : incidents.slice(0, 2)).map((incident, index) => (
              <div className="rounded-2xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_100%)] p-4.5 backdrop-blur-xl" key={`${incident.id}-${index}`}>
                <p className="font-display text-sm font-semibold text-white tracking-tight">{getIncidentTitle(incident)}</p>
                <p className="mt-2 text-sm leading-6 text-white/54">
                  {incident.recommended_action || incident.ai_summary || "Maintain executive monitoring and keep response reserves staged."}
                </p>
              </div>
            ))}
            {!incidents.length ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm leading-6 text-white/54">
                No incident-driven executive actions. Continue readiness monitoring.
              </div>
            ) : null}
          </div>
        </GlassPanel>
      </div>

      <GlassPanel as="section" data-section-id="executive-trends">
        <SectionTitle
          description="A lightweight executive trend view keeps the boardroom fast while deeper analytics stay one click away."
          eyebrow="Trends"
          title="Risk, savings, and continuity trajectory"
          action={
            <Link className="sentra-command-link" href="/analytics">
              Open analytics
            </Link>
          }
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            ["Incident trend", metrics.activeIncidents ? "Elevated" : "Stable", executiveLive.threatScore || metrics.threatScore],
            ["Downtime prevented", `$${(executiveLive.downtimePrevented / 1_000_000).toFixed(1)}M`, 82],
            ["Recovery ETA", `${executiveLive.nextRecoveryEta}m`, 74],
          ].map(([label, value, score]) => (
            <div className="rounded-2xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.015)_100%)] p-4.5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)]" key={label}>
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-white">{label}</p>
                <p className="font-mono text-sm font-bold text-cyan-200">{String(value)}</p>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 shadow-[0_0_10px_rgba(56,189,248,0.4)]" style={{ width: `${Number(score)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <LiveOperationsCharts />

      <ExecutiveFocusMode canExportReports={permissions.canExportReports} incidents={incidents} />
    </div>
  );
}

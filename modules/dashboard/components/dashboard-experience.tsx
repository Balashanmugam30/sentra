"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import CountUp from "react-countup";

import { CardSkeleton } from "@/components/ui/skeleton";
import { WorkspaceShell } from "@/components/ui/workspace-shell";
import { useEnvironment } from "@/lib/environment/use-environment";
import { useGeospatial } from "@/lib/geospatial/use-geospatial";
import { useOsint } from "@/lib/osint/use-osint";
import { usePublicSafety } from "@/lib/public-safety/use-public-safety";
import { useRbac } from "@/lib/rbac/use-rbac";
import { initIncidentSync } from "@/lib/realtime/incident-sync";
import { useLiveDataStore } from "@/lib/realtime/live-data-store";
import { useLiveDataEngine } from "@/lib/realtime/use-live-data";
import { useSoc } from "@/lib/soc/use-soc";
import { useWorkspaceController, type WorkspaceMode } from "@/lib/workspace/useWorkspace";
import { CommandPalette, type CommandPaletteSection } from "@/modules/dashboard/components/command-palette";
import type { ModeWorkspaceProps, WorkspacePermissions } from "@/modules/dashboard/modes/types";
import { buildWorkspaceMetrics } from "@/modules/dashboard/modes/workspace-metrics";
import { workspaceConfigs } from "@/modules/workspaces/config";
import type { Incident } from "@/lib/api/incident";

type HeroStat = {
  decimals?: number;
  label: string;
  prefix?: string;
  suffix?: string;
  tone?: "calm" | "danger" | "success" | "warning";
  value: number;
};

const CommandWorkspace = dynamic<ModeWorkspaceProps>(
  () => import("@/modules/workspaces/command").then((mod) => mod.CommandWorkspace),
  { loading: () => <WorkspaceLoading label="Loading command cockpit" /> },
);

const ExecutiveWorkspace = dynamic<ModeWorkspaceProps>(
  () => import("@/modules/workspaces/executive").then((mod) => mod.ExecutiveWorkspace),
  { loading: () => <WorkspaceLoading label="Loading executive suite" /> },
);

const DemoWorkspace = dynamic<ModeWorkspaceProps>(
  () => import("@/modules/workspaces/demo").then((mod) => mod.DemoWorkspace),
  { loading: () => <WorkspaceLoading label="Loading demo story" /> },
);

const CrisisWorkspace = dynamic<ModeWorkspaceProps>(
  () => import("@/modules/workspaces/crisis").then((mod) => mod.CrisisWorkspace),
  { loading: () => <WorkspaceLoading label="Loading crisis war room" /> },
);

function WorkspaceLoading({ label }: { label: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <div className="lg:col-span-3">
        <CardSkeleton />
      </div>
      <p className="sr-only">{label}</p>
    </div>
  );
}

function HeroMetricPill({ stat }: { stat: HeroStat }) {
  const progressValue =
    stat.suffix === "%"
      ? stat.value
      : stat.suffix === "M"
        ? stat.value * 28
        : stat.suffix === "m"
          ? 100 - stat.value * 4
          : stat.value * 8;
  const progress = Math.max(9, Math.min(100, progressValue));

  const toneGlows = {
    calm: "border-sky-400/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.08)_0%,rgba(255,255,255,0.02)_100%)] shadow-[0_12px_36px_rgba(0,0,0,0.35),0_0_24px_rgba(56,189,248,0.06)]",
    danger: "border-rose-400/25 bg-[linear-gradient(135deg,rgba(244,63,94,0.08)_0%,rgba(255,255,255,0.02)_100%)] shadow-[0_12px_36px_rgba(0,0,0,0.35),0_0_24px_rgba(244,63,94,0.06)]",
    success: "border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.08)_0%,rgba(255,255,255,0.02)_100%)] shadow-[0_12px_36px_rgba(0,0,0,0.35),0_0_24px_rgba(16,185,129,0.06)]",
    warning: "border-amber-400/20 bg-[linear-gradient(135deg,rgba(245,158,11,0.08)_0%,rgba(255,255,255,0.02)_100%)] shadow-[0_12px_36px_rgba(0,0,0,0.35),0_0_24px_rgba(245,158,11,0.06)]",
  };

  const toneBar = {
    calm: "from-sky-500 to-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]",
    danger: "from-rose-500 to-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
    success: "from-emerald-500 to-teal-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    warning: "from-amber-500 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
  };

  const currentTone = stat.tone ?? "calm";

  return (
    <div
      aria-label={`${stat.label}: ${stat.prefix ?? ""}${stat.value}${stat.suffix ?? ""}`}
      className={`sentra-phase7-kpi-pill sentra-phase12-kpi-pill relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition hover:translate-y-[-2px] ${toneGlows[currentTone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[0.66rem] font-bold uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
        <span className={`sentra-phase12-kpi-dot is-${currentTone}`} />
      </div>
      <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
        {stat.prefix}
        <CountUp
          decimals={stat.decimals ?? 0}
          duration={0.8}
          end={stat.value}
          preserveValue
          separator=","
        />
        {stat.suffix}
      </p>
      <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${toneBar[currentTone]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function DashboardExperience() {
  const { mode, setMode } = useWorkspaceController();
  useLiveDataEngine();
  const liveIncidents = useLiveDataStore((state) => state.incidents);
  const createIncident = useLiveDataStore((state) => state.createIncident);
  const executiveLive = useLiveDataStore((state) => state.executive);
  const liveResources = useLiveDataStore((state) => state.resources);
  const runQuickAction = useLiveDataStore((state) => state.runQuickAction);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [socketIncidents, setSocketIncidents] = useState<Incident[]>([]);

  const { currentUser, hasPermission } = useRbac();
  const currentRole = currentUser?.role ?? "";
  const orgRole = currentUser?.org_role ?? "";
  const roleIn = useCallback((...roles: string[]) => roles.includes(currentRole), [currentRole]);
  const orgRoleIn = useCallback((...roles: string[]) => roles.includes(orgRole), [orgRole]);
  const platformAdmin = roleIn("super_admin", "admin");
  const commandRole = roleIn("super_admin", "admin", "security_manager", "operations_commander", "security_lead");
  const executiveRole = roleIn("super_admin", "admin", "executive");
  const viewerRole = roleIn("viewer", "guest_viewer", "analyst");

  const permissions = useMemo<WorkspacePermissions>(
    () => ({
      canExportReports: hasPermission("reports.export"),
      canManageOperations: hasPermission("operations.manage"),
      canViewEnvironment: executiveRole || commandRole || viewerRole,
      canViewGeo: executiveRole || commandRole || viewerRole,
      canViewOsint: executiveRole || commandRole || viewerRole || roleIn("staff", "communications_lead"),
      canViewPublicSafety: executiveRole || commandRole || viewerRole,
      canViewSoc: executiveRole || commandRole || platformAdmin || orgRoleIn("owner", "org_admin", "security_admin"),
    }),
    [commandRole, executiveRole, hasPermission, orgRoleIn, platformAdmin, roleIn, viewerRole],
  );

  const geoEnabled = permissions.canViewGeo && (mode === "command" || mode === "crisis");
  const environmentEnabled = permissions.canViewEnvironment && (mode === "command" || mode === "crisis");
  const publicSafetyEnabled = permissions.canViewPublicSafety && (mode === "command" || mode === "crisis");
  const osintEnabled = permissions.canViewOsint && mode !== "demo";
  const socEnabled = permissions.canViewSoc && mode !== "demo";

  const geo = useGeospatial({ enabled: geoEnabled });
  const environment = useEnvironment({ enabled: environmentEnabled });
  const publicSafety = usePublicSafety({ enabled: publicSafetyEnabled });
  const osint = useOsint({ enabled: osintEnabled });
  const soc = useSoc({ enabled: socEnabled });
  const incidents = liveIncidents.length ? liveIncidents : socketIncidents;
  const metrics = useMemo(() => buildWorkspaceMetrics({ geo, incidents, soc }), [geo, incidents, soc]);
  const activeIncidentCount = useMemo(
    () => incidents.filter((incident) => incident.status !== "resolved").length,
    [incidents],
  );
  const deployedResources = useMemo(
    () => liveResources.reduce((sum, resource) => sum + resource.deployed, 0),
    [liveResources],
  );
  const impactedZones = useMemo(
    () => new Set(incidents.map((incident) => incident.location).filter(Boolean)).size,
    [incidents],
  );
  const maxSeverity = useMemo(
    () => Math.max(0, ...incidents.map((incident) => Number(incident.severity ?? 0))),
    [incidents],
  );

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);

  useEffect(() => {
    const cleanup = initIncidentSync((updated) => {
      setSocketIncidents(updated);
    });

    return cleanup;
  }, []);

  useEffect(() => {
    window.addEventListener("sentra:open-command-palette", openCommandPalette);
    return () => window.removeEventListener("sentra:open-command-palette", openCommandPalette);
  }, [openCommandPalette]);

  useEffect(() => {
    function handleModeShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (typing || !event.altKey) {
        return;
      }

      const shortcutMap: Record<string, WorkspaceMode> = {
        "1": "command",
        "2": "executive",
        "3": "demo",
        "4": "crisis",
      };
      const nextMode = shortcutMap[event.key];
      if (!nextMode) {
        return;
      }

      event.preventDefault();
      setMode(nextMode);
    }

    window.addEventListener("keydown", handleModeShortcut);
    return () => window.removeEventListener("keydown", handleModeShortcut);
  }, [setMode]);

  const commandSections = useMemo<CommandPaletteSection[]>(
    () => [
      {
        description: "Switch to tactical operations with incidents, map, SOC, and AI actions.",
        eyebrow: "Mode",
        id: "command-workspace",
        title: "Command cockpit",
        visible: true,
      },
      {
        description: "Switch to boardroom-ready readiness, exposure, and strategic recommendations.",
        eyebrow: "Mode",
        id: "executive-workspace",
        title: "Executive suite",
        visible: true,
      },
      {
        description: "Open the investor and judge-friendly cinematic product story.",
        eyebrow: "Mode",
        id: "demo-workspace",
        title: "Demo showcase",
        visible: true,
      },
      {
        description: "Open emergency priority mode with the live map and command bar.",
        eyebrow: "Mode",
        id: "crisis-workspace",
        title: "Crisis war room",
        visible: true,
      },
      {
        action: () => createIncident("fire"),
        description: "Inject a verified fire incident into the live command state.",
        eyebrow: "Quick action",
        id: "action-create-fire",
        title: "Create fire incident",
        visible: true,
      },
      {
        action: () => runQuickAction("Trigger lockdown"),
        description: "Queue a lockdown command with audit logging and notification update.",
        eyebrow: "Quick action",
        id: "action-lockdown",
        title: "Trigger lockdown",
        visible: true,
      },
      {
        action: () => runQuickAction("Send public alert"),
        description: "Queue a public alert and update the live notification feed.",
        eyebrow: "Quick action",
        id: "action-public-alert",
        title: "Send public alert",
        visible: true,
      },
      {
        action: () => setMode("executive"),
        description: "Switch to boardroom live metrics and continuity intelligence.",
        eyebrow: "Quick action",
        id: "action-executive-mode",
        title: "Open executive mode",
        visible: true,
      },
    ],
    [createIncident, runQuickAction, setMode],
  );

  const heroStats = useMemo<HeroStat[]>(() => {
    if (mode === "executive") {
      return [
        { decimals: 1, label: "Financial Exposure", prefix: "$", suffix: "M", value: executiveLive.financialExposure / 1_000_000, tone: "warning" },
        { label: "Continuity", suffix: "%", value: executiveLive.continuityScore, tone: "success" },
        { label: "Reputation Risk", suffix: "%", value: executiveLive.reputationRisk, tone: "danger" },
        { label: "ETA Stable", suffix: "m", value: executiveLive.nextRecoveryEta, tone: "calm" },
      ];
    }

    if (mode === "demo") {
      return [
        { label: "Response Gain", suffix: "%", value: 61, tone: "success" },
        { label: "Risk Reduction", suffix: "%", value: Math.max(28, 100 - metrics.threatScore), tone: "success" },
        { decimals: 1, label: "Savings", prefix: "$", suffix: "M", value: executiveLive.downtimePrevented / 1_000_000, tone: "warning" },
        { label: "AI Moat", suffix: "%", value: metrics.aiConfidence, tone: "calm" },
      ];
    }

    if (mode === "crisis") {
      return [
        { label: "Severity", suffix: "/5", value: maxSeverity, tone: maxSeverity >= 4 ? "danger" : "warning" },
        { label: "Responders", value: deployedResources, tone: "calm" },
        { label: "Zones Impacted", value: impactedZones, tone: impactedZones > 2 ? "warning" : "calm" },
        { label: "Stabilize ETA", suffix: "m", value: executiveLive.nextRecoveryEta, tone: "success" },
      ];
    }

    return [
      { label: "Readiness", suffix: "%", value: metrics.readinessScore, tone: "success" },
      { label: "Active Incidents", value: activeIncidentCount, tone: activeIncidentCount > 2 ? "warning" : "calm" },
      { label: "Threat Level", suffix: "%", value: metrics.threatScore, tone: metrics.threatScore > 70 ? "danger" : "calm" },
      { label: "AI Confidence", suffix: "%", value: metrics.aiConfidence, tone: "success" },
    ];
  }, [
    activeIncidentCount,
    deployedResources,
    executiveLive.continuityScore,
    executiveLive.downtimePrevented,
    executiveLive.financialExposure,
    executiveLive.nextRecoveryEta,
    executiveLive.reputationRisk,
    impactedZones,
    maxSeverity,
    metrics.aiConfidence,
    metrics.readinessScore,
    metrics.threatScore,
    mode,
  ]);

  const statusStrip = (
    <div className="sentra-phase7-kpi-grid">
      {heroStats.map((stat) => (
        <HeroMetricPill key={stat.label} stat={stat} />
      ))}
    </div>
  );

  const workspaceProps: ModeWorkspaceProps = {
    environment,
    geo,
    incidents,
    metrics,
    onModeChange: setMode,
    onOpenCommand: openCommandPalette,
    osint,
    permissions,
    publicSafety,
    soc,
  };

  const config = workspaceConfigs[mode];

  return (
    <>
      <CommandPalette
        onOpenChange={setCommandPaletteOpen}
        open={commandPaletteOpen}
        sections={commandSections}
      />
      <WorkspaceShell
        description={config.description}
        eyebrow={config.eyebrow}
        mode={mode}
        status={statusStrip}
        title={config.title}
      >
        {mode === "command" ? <CommandWorkspace {...workspaceProps} /> : null}
        {mode === "executive" ? <ExecutiveWorkspace {...workspaceProps} /> : null}
        {mode === "demo" ? <DemoWorkspace {...workspaceProps} /> : null}
        {mode === "crisis" ? <CrisisWorkspace {...workspaceProps} /> : null}
      </WorkspaceShell>
    </>
  );
}

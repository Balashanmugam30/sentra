"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  AlertBanner,
  Button,
  ConfidenceIndicator,
  EvidenceCard,
  GlassCard,
  GlassPanel,
  MetricCard,
  SearchInput,
  SegmentedControl,
  StatusBadge,
} from "@/components/ui";
import type { StatusType } from "@/components/ui/status-dot";
import { useLiveDataStore } from "@/lib/realtime/live-data-store";
import { useLiveDataEngine } from "@/lib/realtime/use-live-data";
import type { LiveIncident, LiveIncidentStatus } from "@/lib/engines/incident-intelligence";
import { IncidentIntelligenceDashboard } from "@/components/analytics/premium-charts";
import { IncidentIntelligencePanel } from "@/components/intelligence/incident-intelligence-panel";
import { PredictionCockpitPanel } from "@/components/predictions/prediction-cockpit-panel";
import { OperationsCommandCenter } from "@/components/operations/operations-command-center";

function severityToStatus(severity: number): StatusType {
  if (severity >= 5) return "critical";
  if (severity === 4) return "warning";
  if (severity === 3) return "warning";
  if (severity === 2) return "info";
  return "safe";
}

function severityLabel(severity: number): string {
  if (severity >= 5) return "SEV-1 CRITICAL";
  if (severity === 4) return "SEV-2 HIGH";
  if (severity === 3) return "SEV-3 MODERATE";
  if (severity === 2) return "SEV-4 LOW";
  return "SEV-5 ROUTINE";
}

function lifecycleToStatus(status: LiveIncidentStatus): StatusType {
  switch (status) {
    case "Escalated":
    case "Responding":
      return "critical";
    case "Investigating":
      return "intelligence";
    case "Detected":
      return "warning";
    case "Contained":
    case "Recovered":
      return "safe";
    case "Closed":
      return "offline";
    default:
      return "unknown";
  }
}

export function IncidentsOperationsWorkspace() {
  useLiveDataEngine();
  const incidents = useLiveDataStore((state) => state.incidents);
  const createIncident = useLiveDataStore((state) => state.createIncident);
  const runQuickAction = useLiveDataStore((state) => state.runQuickAction);
  const resources = useLiveDataStore((state) => state.resources);

  const [activeTab, setActiveTab] = useState<"queue" | "analytics">("queue");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [cockpitSubView, setCockpitSubView] = useState<"ai_commander" | "timeline" | "telemetry">("ai_commander");

  // Fallback to first incident if selected doesn't exist
  const selectedIncident = useMemo(() => {
    if (!incidents.length) return null;
    if (selectedIncidentId) {
      const found = incidents.find((i) => i.id === selectedIncidentId);
      if (found) return found;
    }
    return incidents[0];
  }, [incidents, selectedIncidentId]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = incident.title?.toLowerCase().includes(query);
        const matchesLocation = incident.location?.toLowerCase().includes(query);
        const matchesTeam = incident.assigned_team?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation && !matchesTeam) {
          return false;
        }
      }

      // Severity filter
      if (severityFilter === "critical" && incident.severity < 5) return false;
      if (severityFilter === "high" && incident.severity !== 4) return false;
      if (severityFilter === "moderate" && incident.severity !== 3) return false;
      if (severityFilter === "low" && incident.severity > 2) return false;

      // Status filter
      if (statusFilter === "active" && incident.lifecycle_status === "Closed") return false;
      if (statusFilter === "responding" && incident.lifecycle_status !== "Responding") return false;
      if (statusFilter === "investigating" && incident.lifecycle_status !== "Investigating") return false;
      if (statusFilter === "contained" && incident.lifecycle_status !== "Contained") return false;
      if (statusFilter === "closed" && incident.lifecycle_status !== "Closed") return false;

      return true;
    });
  }, [incidents, searchQuery, severityFilter, statusFilter]);

  // Aggregate stats
  const activeCount = useMemo(
    () => incidents.filter((i) => i.lifecycle_status !== "Closed").length,
    [incidents]
  );
  const criticalCount = useMemo(
    () => incidents.filter((i) => i.severity >= 4 && i.lifecycle_status !== "Closed").length,
    [incidents]
  );
  const totalDeployedResponders = useMemo(
    () => resources.reduce((sum, r) => sum + r.deployed, 0),
    [resources]
  );
  const avgEta = useMemo(() => {
    const active = incidents.filter((i) => i.lifecycle_status !== "Closed");
    if (!active.length) return 0;
    return Math.round(active.reduce((sum, i) => sum + i.eta_minutes, 0) / active.length);
  }, [incidents]);

  const handleAction = (actionLabel: string, incidentTitle?: string) => {
    runQuickAction(`${actionLabel}: ${incidentTitle || "Incident Queue"}`);
    setActionNotice(`Command Dispatched: ${actionLabel} has been executed.`);
    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  return (
    <div className="sentra-incidents-workspace mx-auto flex w-full max-w-[1560px] flex-col gap-6 px-4 pb-12 pt-4 md:px-6 lg:px-8">
      {/* Top Header */}
      <GlassPanel tier="elevated" className="flex flex-col gap-5 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Operational Command / Phase 3
              </span>
              <StatusBadge status="safe" size="sm" pulse variant="glass">
                Live Ops Active
              </StatusBadge>
              <StatusBadge status="intelligence" size="sm" variant="glass">
                Demo / Simulation
              </StatusBadge>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              Crisis Incident Command
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              Real-time multi-hazard operational triage, rapid responder deployment, sensor telemetry, and continuous forensic audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => createIncident("fire")}
                title="Inject Simulated Fire Incident"
              >
                + Inject Fire
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => createIncident("crowd")}
                title="Inject Simulated Crowd Incident"
              >
                + Inject Crowd
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => createIncident("medical")}
                title="Inject Medical Alarm"
              >
                + Inject Medical
              </Button>
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <SegmentedControl
            options={[
              { value: "queue", label: "Tactical Operations Queue" },
              { value: "analytics", label: "Intelligence & Trend Analytics" },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as "queue" | "analytics")}
          />
          <p className="text-xs text-white/45">
            Synchronized with Sentra Realtime Mesh | 30s Simulation Heartbeat
          </p>
        </div>
      </GlassPanel>

      {/* Action Notification Banner */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <AlertBanner
              severity="info"
              title="Command Transmitted"
              description={actionNotice}
              onDismiss={() => setActionNotice(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          label="Active Incidents"
          value={activeCount}
          status={activeCount > 3 ? "warning" : "safe"}
          trend={activeCount > 2 ? "up" : "neutral"}
          trendLabel="Realtime live count"
        />
        <MetricCard
          label="Critical / High"
          value={criticalCount}
          status={criticalCount > 0 ? "critical" : "safe"}
          trend={criticalCount > 0 ? "up" : "down"}
          trendLabel="Immediate attention required"
        />
        <MetricCard
          label="Responders Deployed"
          value={totalDeployedResponders}
          unit="units"
          status="intelligence"
          trend="neutral"
          trendLabel="Active tactical teams"
        />
        <MetricCard
          label="Mean Containment ETA"
          value={avgEta}
          unit="min"
          status={avgEta < 5 ? "safe" : "warning"}
          trend="down"
          trendLabel="Decreasing with response speed"
        />
      </div>

      {activeTab === "analytics" ? (
        <IncidentIntelligenceDashboard />
      ) : (
        /* Tactical Queue Surface */
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Filterable Incident Feed (5 cols on lg) */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {/* Filters */}
            <GlassCard tier="subtle" className="flex flex-col gap-3 p-4">
              <SearchInput
                placeholder="Filter by title, zone, or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 mr-1">Severity:</span>
                  {(["all", "critical", "high", "moderate", "low"] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverityFilter(sev)}
                      className={`min-h-[32px] rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                        severityFilter === sev
                          ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-white/40 mr-1">Status:</span>
                {(["all", "active", "responding", "investigating", "contained"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`min-h-[32px] rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      statusFilter === st
                        ? "bg-cyan-500/20 text-cyan-200 shadow-sm ring-1 ring-cyan-500/30"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* List of Incidents */}
            <div className="flex flex-col gap-3">
              {filteredIncidents.length === 0 ? (
                <GlassCard tier="subtle" className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-sm font-medium text-white/70">No incidents match active filters.</p>
                  <p className="mt-1 text-xs text-white/40">Adjust search criteria or inject a test incident.</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSeverityFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear All Filters
                  </Button>
                </GlassCard>
              ) : (
                filteredIncidents.map((incident) => {
                  const isSelected = selectedIncident?.id === incident.id;
                  const sevStatus = severityToStatus(incident.severity);
                  const lifeStatus = lifecycleToStatus(incident.lifecycle_status);

                  return (
                    <GlassCard
                      key={incident.id}
                      tier={isSelected ? "elevated" : "subtle"}
                      interactive
                      onClick={() => setSelectedIncidentId(incident.id)}
                      className={`flex flex-col gap-3 p-4 transition-all duration-200 ${
                        isSelected
                          ? "border-cyan-400/40 bg-white/[0.08] shadow-[0_8px_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30"
                          : "hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={sevStatus} size="sm">
                              {severityLabel(incident.severity)}
                            </StatusBadge>
                            <StatusBadge status={lifeStatus} size="sm" variant="outline">
                              {incident.lifecycle_status}
                            </StatusBadge>
                          </div>
                          <h3 className="text-base font-semibold text-white tracking-tight">
                            {incident.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-white/60">
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          {incident.location || "Facility Zone"}
                        </span>
                        <span>ETA: {incident.eta_minutes} min</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                        <span className="text-white/45">Team: {incident.assigned_team || "Tactical Bravo"}</span>
                        <span className="font-mono text-cyan-300">
                          Spread: {Math.round(incident.spread_probability)}%
                        </span>
                      </div>
                    </GlassCard>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Tactical Incident Cockpit & Deep Dive (7 cols on lg) */}
          <div className="flex flex-col gap-5 lg:col-span-7">
            {selectedIncident ? (
              <>
                {/* Cockpit Overview Card */}
                <GlassPanel tier="elevated" className="flex flex-col gap-5 p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={severityToStatus(selectedIncident.severity)} size="md">
                          {severityLabel(selectedIncident.severity)}
                        </StatusBadge>
                        <StatusBadge status={lifecycleToStatus(selectedIncident.lifecycle_status)} size="md">
                          {selectedIncident.lifecycle_status}
                        </StatusBadge>
                        <span className="font-mono text-xs text-white/40">ID: {selectedIncident.id}</span>
                      </div>
                      <h2 className="text-2xl font-semibold tracking-tight text-white">
                        {selectedIncident.title}
                      </h2>
                      <p className="text-sm text-white/70">
                        Location: <span className="text-white font-medium">{selectedIncident.location}</span> | Source: <span className="text-white font-medium">{selectedIncident.source || "Multi-sensor fusion"}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <ConfidenceIndicator
                        score={selectedIncident.confidence ?? 92}
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Operator Command Bar */}
                  <div className="flex flex-wrap items-center gap-2.5 border-y border-white/10 py-3.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction("Deploy Tactical Response", selectedIncident.title ?? undefined)}
                    >
                      Deploy Response Team
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleAction("Initiate Zone Containment", selectedIncident.title ?? undefined)}
                    >
                      Contain Perimeter
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAction("Broadcast Safe Egress Route", selectedIncident.title ?? undefined)}
                    >
                      Issue Public Alert
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction("Acknowledge & Escalate", selectedIncident.title ?? undefined)}
                    >
                      Acknowledge
                    </Button>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
                      <p className="text-[10px] uppercase tracking-wider text-white/45">Spread Risk</p>
                      <p className="mt-1 font-mono text-lg font-semibold text-rose-300">
                        {Math.round(selectedIncident.spread_probability)}%
                      </p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-rose-400"
                          style={{ width: `${Math.min(100, selectedIncident.spread_probability)}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
                      <p className="text-[10px] uppercase tracking-wider text-white/45">Response ETA</p>
                      <p className="mt-1 font-mono text-lg font-semibold text-cyan-300">
                        {selectedIncident.eta_minutes} min
                      </p>
                      <p className="mt-1 text-[11px] text-white/40">Transit underway</p>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
                      <p className="text-[10px] uppercase tracking-wider text-white/45">Team Assigned</p>
                      <p className="mt-1 truncate font-medium text-sm text-white">
                        {selectedIncident.assigned_team || "Team Alpha"}
                      </p>
                      <p className="mt-1 text-[11px] text-white/40">
                        {selectedIncident.responders_assigned?.length || 2} specialists en route
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
                      <p className="text-[10px] uppercase tracking-wider text-white/45">Audit Status</p>
                      <p className="mt-1 font-medium text-sm text-emerald-300">Compliant</p>
                      <p className="mt-1 text-[11px] text-white/40">Tamper-evident log</p>
                    </div>
                  </div>
                </GlassPanel>

                {/* Real AI Incident Commander & Multimodal Evidence Graph (Phase 4) */}
                <IncidentIntelligencePanel
                  incidentId={selectedIncident.id}
                  incidentTitle={selectedIncident.title ?? undefined}
                  incidentLocation={selectedIncident.location ?? undefined}
                />

                {/* Real Data Plane, Calibrated Predictions & MLOps Governance (Phase 5) */}
                <PredictionCockpitPanel
                  initialIncidentId={selectedIncident.id}
                />

                {/* Autonomous Crisis Operations & Safety-Governed Action Orchestration (Phase 6) */}
                <OperationsCommandCenter />

                {/* Continuous Chronological Timeline */}
                <GlassPanel tier="subtle" className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-base font-semibold text-white tracking-tight">
                      Continuous Operational Timeline
                    </h3>
                    <span className="text-xs text-white/45">
                      {selectedIncident.timeline_logs?.length || 3} verified events recorded
                    </span>
                  </div>

                  <div className="relative pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-white/15">
                    {(selectedIncident.timeline_logs && selectedIncident.timeline_logs.length > 0
                      ? selectedIncident.timeline_logs
                      : [
                          {
                            id: "log-1",
                            message: `Thermal anomaly verified at ${selectedIncident.location}; AI verification score above baseline.`,
                            timestamp: "T-04m",
                            type: "ai" as const,
                          },
                          {
                            id: "log-2",
                            message: `Rapid response unit ${selectedIncident.assigned_team} dispatched. Ingress path confirmed.`,
                            timestamp: "T-02m",
                            type: "operator" as const,
                          },
                          {
                            id: "log-3",
                            message: `Telemetry sensor feed stable; containment envelope holding at 94%.`,
                            timestamp: "T-00m",
                            type: "sensor" as const,
                          },
                        ]
                    ).map((log, idx) => (
                      <div key={log.id || idx} className="relative mb-5 last:mb-0">
                        <span className="absolute -left-6 top-1 h-3 w-3 rounded-full border border-slate-900 bg-cyan-400 ring-4 ring-cyan-500/20" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                              {log.type}
                            </span>
                            <span className="font-mono text-xs text-white/45">{log.timestamp}</span>
                          </div>
                          <p className="text-sm leading-6 text-white/80">{log.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassPanel>

                {/* Forensic Evidence Vault */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white tracking-tight">
                      Forensic Telemetry & Sensor Evidence
                    </h3>
                    <span className="text-xs text-cyan-300">
                      Phase 3 Authenticated Evidence Vault
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <EvidenceCard
                      title="Optical & Thermal Fusion Analysis"
                      sourceName="FLIR-THERMAL-CAM-08"
                      sourceType="Camera / AI Vision"
                      timestamp="Live Telemetry"
                      verification="verified"
                      confidence={96}
                      simulated={true}
                      excerpt="Confirmed thermal gradient exceeding +42°C above ambient threshold at primary ingress."
                    />
                    <EvidenceCard
                      title="Environmental Particulate Influx"
                      sourceName="HVAC-AIR-SENSOR-B12"
                      sourceType="IoT Sensor"
                      timestamp="Live Telemetry"
                      verification="verified"
                      confidence={91}
                      simulated={true}
                      excerpt="Ionization spike consistent with early combustion smoke detected in return air plenum."
                    />
                  </div>
                </div>
              </>
            ) : (
              <GlassCard tier="subtle" className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
                <p className="text-base font-semibold text-white">Select an incident from the queue</p>
                <p className="mt-1 text-sm text-white/50">
                  Select any active incident to open its tactical cockpit, timeline, and forensic telemetry.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

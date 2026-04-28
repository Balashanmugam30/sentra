"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Incident } from "@/lib/api/incident";
import { apiClient } from "@/lib/core/api-client";

type ExecutiveFocusModeProps = {
  canExportReports: boolean;
  incidents: Incident[];
};

function scoreFromIncidents(incidents: Incident[]) {
  const critical = incidents.filter(
    (incident) =>
      incident.priority === "critical" ||
      incident.risk_level === "critical" ||
      incident.severity >= 4,
  ).length;
  const active = incidents.filter((incident) => incident.status !== "resolved").length;
  return {
    active,
    critical,
    readiness: Math.max(0, Math.min(100, 96 - critical * 8 - Math.max(0, active - 3) * 2)),
    reputation: Math.max(0, Math.min(100, 18 + critical * 10 + active * 3)),
    eta: active ? `${Math.max(8, active * 9 + critical * 7)}m` : "stable",
    exposure: `$${(0.8 + active * 0.55 + critical * 1.15).toFixed(1)}M`,
  };
}

function ExecutiveMetric({
  label,
  tone = "cyan",
  value,
}: {
  label: string;
  tone?: "cyan" | "frost" | "gold" | "rose";
  value: string;
}) {
  const toneClass =
    tone === "gold"
      ? "text-amber-100"
      : tone === "frost"
      ? "text-white"
      : tone === "rose"
      ? "text-rose-100"
      : "text-cyan-100";

  return (
    <div className="sentra-premium-card rounded-[28px] p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className={`mt-3 text-4xl font-semibold tracking-[-0.04em] ${toneClass}`}>{value}</p>
    </div>
  );
}

export function ExecutiveFocusMode({ canExportReports, incidents }: ExecutiveFocusModeProps) {
  const [reportState, setReportState] = useState<"idle" | "exporting" | "ready" | "error">("idle");
  const reportResetTimerRef = useRef<number | null>(null);
  const metrics = useMemo(() => scoreFromIncidents(incidents), [incidents]);
  const topThreats = useMemo(() => {
    const activeThreats = incidents
      .filter((incident) => incident.status !== "resolved")
      .slice(0, 3)
      .map((incident) => ({
        id: incident.id,
        title: `${incident.location} ${incident.type.replaceAll("_", " ")}`,
        action: incident.recommended_action ?? "Maintain command monitoring",
      }));

    return activeThreats.length
      ? activeThreats
      : [
          {
            id: "EXEC-DEMO-001",
            title: "Zone 2 fire risk watch",
            action: "Keep medical corridor protected and reserve responders staged",
          },
          {
            id: "EXEC-DEMO-002",
            title: "External reputation pressure stable",
            action: "Prepare holding statement for public communications",
          },
    ];
  }, [incidents]);

  useEffect(
    () => () => {
      if (reportResetTimerRef.current !== null) {
        window.clearTimeout(reportResetTimerRef.current);
      }
    },
    [],
  );

  function scheduleReportReset(delayMs: number) {
    if (reportResetTimerRef.current !== null) {
      window.clearTimeout(reportResetTimerRef.current);
    }
    reportResetTimerRef.current = window.setTimeout(() => {
      setReportState("idle");
      reportResetTimerRef.current = null;
    }, delayMs);
  }

  async function exportReport() {
    if (!canExportReports || reportState === "exporting") {
      return;
    }

    setReportState("exporting");
    try {
      const response = await apiClient.fetchResponse("/system/reports/executive.pdf", {
        method: "GET",
        priority: "background",
        timeoutMs: 15_000,
      });
      if (!response.ok) {
        throw new Error("Report export failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sentra-executive-report.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
      setReportState("ready");
      scheduleReportReset(1800);
    } catch {
      setReportState("error");
      scheduleReportReset(2200);
    }
  }

  return (
    <section className="sentra-premium-card rounded-[36px] p-5 shadow-[var(--sentra-shadow-command)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--executive-gold)]">
            Executive Mode
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-white md:text-6xl">
            One-screen decision posture.
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Technical clutter is suppressed. Leadership sees readiness, exposure, reputation, top
            threats, ETA to stability, and the next actions that matter.
          </p>
        </div>
        <button
          className="rounded-full border border-amber-200/20 bg-amber-200/12 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/20 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={!canExportReports || reportState === "exporting"}
          onClick={exportReport}
          type="button"
        >
          {reportState === "exporting"
            ? "Preparing PDF"
            : reportState === "ready"
            ? "PDF Ready"
            : reportState === "error"
            ? "Retry PDF"
            : "Export Board PDF"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ExecutiveMetric label="Readiness" tone="cyan" value={`${metrics.readiness}%`} />
        <ExecutiveMetric label="Financial exposure" tone="gold" value={metrics.exposure} />
        <ExecutiveMetric label="Reputation risk" tone={metrics.reputation > 45 ? "rose" : "cyan"} value={`${metrics.reputation}%`} />
        <ExecutiveMetric label="ETA to stability" value={metrics.eta} />
        <ExecutiveMetric label="Critical threats" tone={metrics.critical ? "rose" : "frost"} value={`${metrics.critical}`} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.78fr]">
        <div className="rounded-[30px] border border-white/10 bg-black/18 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Top threats and recommended actions</p>
          <div className="mt-4 space-y-3">
            {topThreats.map((threat, index) => (
              <div className="rounded-3xl border border-white/8 bg-white/6 p-4" key={`${threat.id}-${threat.title}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{threat.title}</p>
                  <span className="rounded-full bg-cyan-300/12 px-3 py-1 text-xs text-cyan-100">
                    action {index + 1}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">{threat.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-black/18 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Live map mini</p>
          <div className="mt-4 overflow-hidden rounded-[28px] border border-cyan-200/12 bg-[radial-gradient(circle_at_30%_35%,rgba(34,211,238,0.24),transparent_18%),radial-gradient(circle_at_68%_62%,rgba(244,63,94,0.18),transparent_16%),rgba(255,255,255,0.045)] p-5">
            <div className="grid grid-cols-3 gap-3">
              {["HQ", "Zone 2", "Gate A", "Zone 4", "Safe North", "Med Corridor"].map((zone, index) => (
                <div
                  className={`rounded-2xl border px-3 py-5 text-center text-xs font-semibold ${
                    index === 1
                      ? "sentra-status-critical border-rose-300/20 bg-rose-400/12 text-rose-100"
                      : index === 5
                      ? "border-cyan-200/20 bg-cyan-300/12 text-cyan-100"
                      : "border-white/8 bg-black/14 text-white/60"
                  }`}
                  key={zone}
                >
                  {zone}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-3xl border border-amber-200/12 bg-amber-200/8 p-4">
            <p className="text-sm font-semibold text-amber-50">Approval queue</p>
            <p className="mt-2 text-sm text-white/55">
              No blocking executive approvals. Governance queue is ready for exception review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

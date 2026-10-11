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
  value,
}: {
  label: string;
  tone?: "cyan" | "frost" | "gold" | "rose";
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#E4E9E1] bg-[#F1F5F0] p-4 shadow-xs">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#586579]">{label}</p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-[#1F2937]">{value}</p>
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
    <section className="rounded-xl border border-[#E4E9E1] bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#65A30D]">
            Executive Mode
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#1F2937] md:text-3xl">
            One-screen decision posture.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#586579]">
            Technical clutter is suppressed. Leadership sees readiness, exposure, reputation, top
            threats, ETA to stability, and the next actions that matter.
          </p>
        </div>
        <button
          className="rounded-xl border border-[#CBD5C0] bg-[#F1F8E5] px-4 py-2.5 text-xs font-semibold text-[#3F6212] transition hover:bg-[#ECF7D9] disabled:cursor-not-allowed disabled:opacity-55"
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
        <ExecutiveMetric label="Readiness" value={`${metrics.readiness}%`} />
        <ExecutiveMetric label="Financial exposure" value={metrics.exposure} />
        <ExecutiveMetric label="Reputation risk" value={`${metrics.reputation}%`} />
        <ExecutiveMetric label="ETA to stability" value={metrics.eta} />
        <ExecutiveMetric label="Critical threats" value={`${metrics.critical}`} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.78fr]">
        <div className="rounded-xl border border-[#E4E9E1] bg-[#F7F9F5] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#586579]">Top threats and recommended actions</p>
          <div className="mt-4 space-y-3">
            {topThreats.map((threat, index) => (
              <div className="rounded-xl border border-[#E4E9E1] bg-white p-4 shadow-xs" key={`${threat.id}-${threat.title}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#1F2937]">{threat.title}</p>
                  <span className="rounded-full border border-[#CBD5C0] bg-[#F1F8E5] px-2.5 py-0.5 text-xs font-medium text-[#3F6212]">
                    action {index + 1}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#586579]">{threat.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E4E9E1] bg-[#F7F9F5] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#586579]">Live map mini</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#E4E9E1] bg-white p-4 shadow-xs">
            <div className="grid grid-cols-3 gap-3">
              {["HQ", "Zone 2", "Gate A", "Zone 4", "Safe North", "Med Corridor"].map((zone, index) => (
                <div
                  className={`rounded-lg border px-3 py-3 text-center text-xs font-semibold ${
                    index === 1
                      ? "border-rose-300 bg-rose-50 text-rose-800"
                      : index === 5
                      ? "border-sky-300 bg-sky-50 text-sky-800"
                      : "border-[#E4E9E1] bg-[#F7F9F5] text-[#1F2937]"
                  }`}
                  key={zone}
                >
                  {zone}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[#E4E9E1] bg-white p-4 shadow-xs">
            <p className="text-sm font-semibold text-[#1F2937]">Approval queue</p>
            <p className="mt-1 text-xs text-[#586579]">
              No blocking executive approvals. Governance queue is ready for exception review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

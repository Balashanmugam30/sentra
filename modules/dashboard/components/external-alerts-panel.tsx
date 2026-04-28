"use client";

import type { UseOsintResult } from "@/lib/osint/use-osint";

type ExternalAlertsPanelProps = {
  osint: UseOsintResult;
};

export function ExternalAlertsPanel({ osint }: ExternalAlertsPanelProps) {
  const alerts = osint.live?.external_alerts ?? [];
  const history = osint.history?.events ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            External Alerts Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            Recommended executive, media, and public-response actions driven by external narrative pressure
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${alert.alert_id}-${alert.audience}-${alert.action}-${index}`}>
                <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">
                  {alert.audience} • {alert.severity}
                </div>
                <div className="mt-2 text-sm font-medium text-white">{alert.action}</div>
                <div className="mt-2 text-sm text-white/70">{alert.rationale}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {history.slice(0, 4).map((event, index) => (
              <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${event.event_id}-${event.timestamp}-${index}`}>
                <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">
                  {new Date(event.timestamp).toLocaleTimeString()} • {event.severity}
                </div>
                <div className="mt-2 text-sm font-medium text-white">{event.title}</div>
                <div className="mt-2 text-sm text-white/70">{event.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

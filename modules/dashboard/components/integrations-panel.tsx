"use client";

import { useIntegrations } from "@/lib/integrations/use-integrations";
import type {
  IntegrationMode,
  IntegrationProviderStatus,
  IntegrationsGlobalStatus,
} from "@/lib/integrations/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for integration state";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for integration state";
  }

  return date.toLocaleString();
}

function statusStyles(status: IntegrationsGlobalStatus | IntegrationProviderStatus) {
  if (status === "critical" || status === "offline") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (status === "degraded") {
    return {
      color: "#fcd34d",
      background: "rgba(120, 53, 15, 0.24)",
      border: "rgba(245, 158, 11, 0.24)",
    };
  }

  if (status === "ready") {
    return {
      color: "#93c5fd",
      background: "rgba(30, 64, 175, 0.2)",
      border: "rgba(96, 165, 250, 0.24)",
    };
  }

  if (status === "healthy") {
    return {
      color: "#bbf7d0",
      background: "rgba(20, 83, 45, 0.22)",
      border: "rgba(74, 222, 128, 0.22)",
    };
  }

  return {
    color: "#cbd5e1",
    background: "rgba(51, 65, 85, 0.2)",
    border: "rgba(148, 163, 184, 0.18)",
  };
}

function modeStyles(mode: IntegrationMode) {
  return mode === "live"
    ? {
        color: "#bfdbfe",
        background: "rgba(30, 64, 175, 0.18)",
        border: "rgba(96, 165, 250, 0.24)",
      }
    : {
        color: "#cbd5e1",
        background: "rgba(51, 65, 85, 0.2)",
        border: "rgba(148, 163, 184, 0.18)",
      };
}

export function IntegrationsPanel() {
  const {
    data,
    loading,
    error,
    lastRetry,
    lastTest,
    refresh,
    retryFailed,
    runTestWebhook,
  } = useIntegrations();
  const globalStyles = statusStyles(data?.global_status ?? "healthy");
  const n8nLabel = data?.n8n_enabled
    ? data?.webhook_configured
      ? "connected"
      : "enabled"
    : "mock";

  return (
    <section
      className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-panel)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[27px]"
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface-soft)",
        }}
      />

      <div className="relative z-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              Automation Integrations Center
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              External Delivery + Workflow Execution
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: globalStyles.border,
                background: globalStyles.background,
                color: globalStyles.color,
              }}
            >
              {loading ? "checking" : data?.global_status ?? "healthy"}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: "rgba(148, 163, 184, 0.18)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--sentra-text-muted)",
              }}
            >
              n8n {n8nLabel} · webhook {data?.webhook_configured ? "configured" : "not configured"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Provider Cards</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(data?.providers ?? []).map((provider, index) => {
                  const providerStyle = statusStyles(provider.status);
                  const modeStyle = modeStyles(provider.mode);

                  return (
                    <div
                      className="rounded-[18px] border px-4 py-3"
                      key={`${provider.name}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-[var(--text)]">
                            {provider.name}
                          </div>
                          <div
                            className="mt-2 text-[0.68rem] uppercase tracking-[0.16em]"
                            style={{ color: "var(--sentra-text-soft)" }}
                          >
                            success {provider.success_rate}%
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className="rounded-full border px-2 py-1 text-[0.6rem] uppercase tracking-[0.16em]"
                            style={{
                              color: providerStyle.color,
                              borderColor: providerStyle.border,
                              background: providerStyle.background,
                            }}
                          >
                            {provider.status}
                          </span>
                          <span
                            className="rounded-full border px-2 py-1 text-[0.6rem] uppercase tracking-[0.16em]"
                            style={{
                              color: modeStyle.color,
                              borderColor: modeStyle.border,
                              background: modeStyle.background,
                            }}
                          >
                            {provider.mode}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {[
                          ["Pending", provider.pending_count],
                          ["Failed", provider.failed_count],
                        ].map(([label, value], metricIndex) => (
                          <div
                            className="rounded-[14px] border px-3 py-2"
                            key={`${provider.name}-${label}-${metricIndex}`}
                            style={{
                              borderColor: "var(--sentra-border-subtle)",
                              background: "var(--surface-soft)",
                            }}
                          >
                            <div
                              className="text-[0.62rem] uppercase tracking-[0.16em]"
                              style={{ color: "var(--sentra-text-soft)" }}
                            >
                              {label}
                            </div>
                            <div className="mt-1 text-sm text-[var(--text)]">{value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 text-xs" style={{ color: "var(--sentra-text-muted)" }}>
                        Last delivery{" "}
                        {provider.last_delivery_at
                          ? new Date(provider.last_delivery_at).toLocaleString()
                          : "not yet"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Queue Metrics</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                {[
                  ["Pending", data?.queue_metrics?.pending ?? 0],
                  ["Sent", data?.queue_metrics?.sent ?? 0],
                  ["Failed", data?.queue_metrics?.failed ?? 0],
                  ["Retried", data?.queue_metrics?.retried ?? 0],
                ].map(([label, value], index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${label}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      className="text-[0.7rem] uppercase tracking-[0.18em]"
                      style={{ color: "var(--sentra-text-soft)" }}
                    >
                      {label}
                    </div>
                    <div className="mt-2 text-lg font-medium text-[var(--text)]">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                  onClick={() => {
                    void runTestWebhook();
                  }}
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.28)",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text)",
                  }}
                  type="button"
                >
                  Test Webhook
                </button>
                <button
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                  onClick={() => {
                    void retryFailed();
                  }}
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.28)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--sentra-text-muted)",
                  }}
                  type="button"
                >
                  Retry Failed
                </button>
                <button
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                  onClick={() => {
                    void refresh();
                  }}
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.28)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--sentra-text-muted)",
                  }}
                  type="button"
                >
                  Refresh
                </button>
              </div>

              {lastTest ? (
                <p className="mt-3 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  Last webhook test: {lastTest.status} · {lastTest.receipt_id} · {lastTest.mode}
                </p>
              ) : null}
              {lastRetry ? (
                <p className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  Last retry: retried {lastRetry.retried_count} · remaining failed {lastRetry.remaining_failed}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Recent Events</h3>
              <div className="mt-3 space-y-3">
                {(data?.recent_events ?? []).map((eventName, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${eventName}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    {eventName}
                  </div>
                ))}
                {error ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

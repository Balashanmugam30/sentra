"use client";

import { useAudit } from "@/lib/audit/use-audit";

function integrityStyles(valid: boolean) {
  return valid
    ? {
        color: "#bbf7d0",
        borderColor: "rgba(74, 222, 128, 0.22)",
        background: "rgba(20, 83, 45, 0.2)",
      }
    : {
        color: "#fca5a5",
        borderColor: "rgba(248, 113, 113, 0.24)",
        background: "rgba(127, 29, 29, 0.18)",
      };
}

export function AuditCommandPanel() {
  const { live, loading, error, exportLogs, refresh } = useAudit();
  const integrity = integrityStyles(live?.integrity_status?.chain_valid ?? true);

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
              Audit Command Center
            </p>
            <h2 className="text-lg font-semibold text-white">
              Forensic visibility, zero-trust review, and compliance evidence status
            </h2>
          </div>
          <div
            className="rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em]"
            style={integrity}
          >
            {loading ? "Refreshing" : live?.integrity_status?.chain_valid ? "Chain valid" : "Chain warning"}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["Events Today", String(live?.totals?.total_events_today ?? 0)],
            ["Failed Logins", String(live?.totals?.failed_logins ?? 0)],
            ["Denied Requests", String(live?.totals?.denied_requests ?? 0)],
            ["Critical Actions", String(live?.totals?.critical_actions ?? 0)],
            ["Integrity", live?.integrity_status?.chain_valid ? "healthy" : "warning"],
          ].map(([label, value], index) => (
            <div
              className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4"
              key={`${label}-${index}`}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">
                {label}
              </div>
              <div className="mt-2 text-sm font-medium capitalize text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100"
            onClick={() => {
              void refresh();
            }}
            type="button"
          >
            Refresh
          </button>
          {!live?.summary_only ? (
            <>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
                onClick={() => {
                  void exportLogs("json");
                }}
                type="button"
              >
                Export JSON
              </button>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
                onClick={() => {
                  void exportLogs("csv");
                }}
                type="button"
              >
                Export CSV
              </button>
            </>
          ) : null}
        </div>

        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      </div>
    </section>
  );
}

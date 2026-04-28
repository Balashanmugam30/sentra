"use client";

import { formatSecurityDate, riskTone } from "@/lib/securitycenter/runtime";
import type { SecurityOrg } from "@/lib/securitycenter/types";

type OrgGridProps = {
  orgs: SecurityOrg[];
  busyAction: string | null;
  onSwitch: (orgId: string) => void;
  onCreate: () => void;
};

export function OrgGrid({ orgs, busyAction, onSwitch, onCreate }: OrgGridProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Tenant Isolation</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Organization workspaces</h2>
        </div>
        <button
          className="rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-60"
          disabled={busyAction !== null}
          onClick={onCreate}
          type="button"
        >
          Create Workspace
        </button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {orgs.map((org) => {
          const seatPercent = Math.round((org.seats_used / Math.max(1, org.seats_total)) * 100);
          return (
            <article key={org.org_id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{org.org_name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{org.billing_tier} / {org.sso_provider}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 font-mono text-xs ${riskTone(org.risk_score)}`}>Risk {org.risk_score}</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Metric label="Seats" value={`${org.seats_used}/${org.seats_total}`} />
                <Metric label="SSO" value={org.sso_enabled ? "On" : "Ready"} />
                <Metric label="Owner" value={org.owner} />
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${seatPercent}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-white/45">Last active {formatSecurityDate(org.last_activity)}</p>
                <button
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-60"
                  disabled={busyAction !== null}
                  onClick={() => onSwitch(org.org_id)}
                  type="button"
                >
                  Switch
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

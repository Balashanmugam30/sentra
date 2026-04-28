"use client";

import type { SecurityScoreState } from "@/lib/securitycenter/types";

type SecurityScoreProps = {
  score: SecurityScoreState;
  averageOrgRisk: number;
  averageSessionRisk: number;
};

export function SecurityScore({ score, averageOrgRisk, averageSessionRisk }: SecurityScoreProps) {
  return (
    <section className="rounded-[32px] border border-cyan-200/15 bg-cyan-200/[0.06] p-6 shadow-[0_24px_80px_rgba(8,145,178,0.12)] backdrop-blur-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Security Score</p>
          <h2 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-white">{score.score}%</h2>
          <p className="mt-2 text-sm text-cyan-50/60">{score.grade} identity posture with tenant-scoped controls.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Metric label="Org risk" value={`${averageOrgRisk}`} />
          <Metric label="Session risk" value={`${averageSessionRisk}`} />
          <Metric label="Governance" value="Audit on" />
          <Metric label="Isolation" value="Strict" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {score.drivers.map((driver) => (
          <div key={driver.label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/50">
              <span>{driver.label}</span>
              <span className={driver.status === "strong" ? "text-emerald-200" : "text-amber-200"}>{driver.status}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={driver.status === "strong" ? "h-full rounded-full bg-emerald-300" : "h-full rounded-full bg-amber-300"}
                style={{ width: `${Math.min(100, Math.max(0, driver.value))}%` }}
              />
            </div>
            <p className="mt-3 font-mono text-2xl text-white">{driver.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-1 font-mono text-lg text-white">{value}</p>
    </div>
  );
}

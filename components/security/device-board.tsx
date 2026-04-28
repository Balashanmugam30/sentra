"use client";

import { riskTone } from "@/lib/securitycenter/runtime";
import type { SecuritySession } from "@/lib/securitycenter/types";

export function DeviceBoard({ sessions }: { sessions: SecuritySession[] }) {
  const trusted = sessions.filter((session) => session.trusted_device).length;
  const highRisk = sessions.filter((session) => session.risk_score >= 60).length;
  const active = sessions.filter((session) => session.status === "active").length;
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Trusted Devices</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Device intelligence</h2>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Metric label="Active" value={`${active}`} tone="cyan" />
        <Metric label="Trusted" value={`${trusted}`} tone="emerald" />
        <Metric label="High risk" value={`${highRisk}`} tone="red" />
      </div>
      <div className="mt-5 grid gap-3">
        {sessions.slice(0, 4).map((session) => (
          <div key={session.session_id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div>
              <p className="font-semibold text-white">{session.device}</p>
              <p className="mt-1 text-xs text-white/45">{session.browser} / {session.region}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 font-mono text-xs ${riskTone(session.risk_score)}`}>{session.risk_score}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "cyan" | "emerald" | "red" }) {
  const color = tone === "emerald" ? "text-emerald-100" : tone === "red" ? "text-red-100" : "text-cyan-100";
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className={`mt-2 font-mono text-2xl ${color}`}>{value}</p>
    </div>
  );
}

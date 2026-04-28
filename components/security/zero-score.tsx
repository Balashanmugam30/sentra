"use client";

import { trustTone } from "@/lib/securitydefense/runtime";
import type { ZeroTrustState } from "@/lib/securitydefense/types";

export function ZeroScore({ zeroTrust }: { zeroTrust: ZeroTrustState }) {
  const scores = [
    { label: "Device Trust", value: zeroTrust.device_trust },
    { label: "Network Trust", value: zeroTrust.network_trust },
    { label: "Session Trust", value: zeroTrust.session_trust },
    { label: "User Trust", value: zeroTrust.user_trust },
  ];
  return (
    <section className="rounded-[32px] border border-cyan-200/15 bg-cyan-200/[0.055] p-6 shadow-[0_24px_80px_rgba(8,145,178,0.12)] backdrop-blur-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Zero Trust Score</p>
          <h2 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-white">{zeroTrust.trust_score}%</h2>
          <p className="mt-2 text-sm text-cyan-50/60">{zeroTrust.band} posture / {zeroTrust.policy_blocks} policy blocks / {zeroTrust.step_up_triggers} step-up triggers</p>
        </div>
        <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${trustTone(zeroTrust.trust_score)}`}>{zeroTrust.band}</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {scores.map((score) => (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4" key={score.label}>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/40">
              <span>{score.label}</span>
              <span className="font-mono text-white/70">{score.value}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${score.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

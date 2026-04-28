"use client";

import { formatSecurityDate, riskTone, statusTone } from "@/lib/securitycenter/runtime";
import type { SecuritySession, SecurityUser } from "@/lib/securitycenter/types";

type SessionGridProps = {
  sessions: SecuritySession[];
  users: SecurityUser[];
  busyAction: string | null;
  onRevoke: (sessionId: string) => void;
};

export function SessionGrid({ sessions, users, busyAction, onRevoke }: SessionGridProps) {
  const userById = new Map(users.map((user) => [user.id, user]));
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Session Intelligence</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Current sessions</h2>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-sm text-white/60">{sessions.length}</span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {sessions.map((session) => {
          const user = userById.get(session.user_id);
          return (
            <article key={session.session_id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{user?.name ?? session.user_id}</h3>
                  <p className="mt-1 font-mono text-xs text-white/40">{session.session_id}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusTone(session.status)}`}>{session.status}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="Device" value={session.device} />
                <Metric label="Browser" value={session.browser} />
                <Metric label="Region" value={session.region} />
                <Metric label="Token age" value={`${session.token_age_minutes}m`} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className={`rounded-full border px-3 py-1 font-mono text-xs ${riskTone(session.risk_score)}`}>Risk {session.risk_score}</span>
                <span className={session.impossible_travel ? "text-sm text-red-100" : "text-sm text-emerald-100"}>
                  {session.impossible_travel ? "Impossible travel flag" : "Travel normal"}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-white/45">Seen {formatSecurityDate(session.last_active)}</p>
                <button
                  className="rounded-xl border border-red-200/20 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-400/10 disabled:opacity-50"
                  disabled={busyAction !== null || session.status === "revoked"}
                  onClick={() => onRevoke(session.session_id)}
                  type="button"
                >
                  Force Logout
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

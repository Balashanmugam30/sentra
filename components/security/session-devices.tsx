"use client";

import { useEffect, useState } from "react";

import {
  listSessionDevices,
  logoutAllDevices,
  revokeSessionDevice,
  SEEDED_SESSION_DEVICES,
  type SessionDevice,
} from "@/lib/security/hardening";

export function SessionDevices() {
  const [devices, setDevices] = useState<SessionDevice[]>(SEEDED_SESSION_DEVICES);
  const [status, setStatus] = useState("Concurrent device posture clean");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listSessionDevices().then((sessions) => {
      if (!cancelled) {
        setDevices(sessions);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const revoke = async (sessionId: string) => {
    setBusyId(sessionId);
    const result = await revokeSessionDevice(sessionId);
    if (result.revoked) {
      setDevices((current) =>
        current.map((device) =>
          device.session_id === sessionId ? { ...device, revoked: true } : device,
        ),
      );
      setStatus(`Revoked ${sessionId}`);
    }
    setBusyId(null);
  };

  const revokeAll = async () => {
    setBusyId("all");
    const result = await logoutAllDevices();
    setDevices((current) => current.map((device) => ({ ...device, revoked: true })));
    setStatus(`Forced logout across ${result.revoked_count} device sessions`);
    setBusyId(null);
  };

  return (
    <section className="rounded-[32px] border border-white/10 bg-[rgba(3,8,18,0.78)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
            Session Devices
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Concurrent session control</h2>
          <p className="mt-2 text-sm text-white/50">{status}</p>
        </div>
        <button
          className="rounded-2xl border border-rose-300/25 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/10 disabled:opacity-60"
          disabled={busyId === "all"}
          onClick={() => void revokeAll()}
          type="button"
        >
          Logout All Devices
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {devices.map((device) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4" key={device.session_id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{device.device_label}</h3>
                <p className="mt-1 font-mono text-xs text-white/40">{device.session_id}</p>
                <p className="mt-2 text-xs text-white/45">
                  Issued {new Date(device.issued_at).toLocaleString()} · Expires{" "}
                  {new Date(device.expires_at).toLocaleString()}
                </p>
              </div>
              <span
                className={[
                  "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                  device.revoked
                    ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
                    : device.current
                    ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                    : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
                ].join(" ")}
              >
                {device.revoked ? "revoked" : device.current ? "current" : "active"}
              </span>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={device.revoked || device.current || busyId === device.session_id}
                onClick={() => void revoke(device.session_id)}
                type="button"
              >
                {busyId === device.session_id ? "Revoking..." : "Revoke Session"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

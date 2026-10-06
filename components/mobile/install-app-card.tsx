"use client";

import { useEffect, useState } from "react";

import { canPromptInstall, isStandaloneDisplay, promptInstallSentra, readServiceWorkerReady } from "@/lib/mobile/pwa";
import { GlassCard } from "./glass-card";

export function InstallAppCard() {
  const [standalone, setStandalone] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [installState, setInstallState] = useState("Ready");

  useEffect(() => {
    const timer = window.setTimeout(() => setStandalone(isStandaloneDisplay()), 0);
    readServiceWorkerReady().then(setServiceWorkerReady).catch(() => setServiceWorkerReady(false));
    return () => window.clearTimeout(timer);
  }, []);

  const install = async () => {
    if (!canPromptInstall()) {
      setInstallState("Use browser menu to install");
      return;
    }

    const result = await promptInstallSentra();
    setInstallState(result === "accepted" ? "Install accepted" : result === "dismissed" ? "Install dismissed" : "Install unavailable");
  };

  return (
    <GlassCard glow="accent">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Install Sentra</p>
      <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">{standalone ? "Standalone mode active" : "PWA install ready"}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">Install Sentra Mobile for faster launch, cached routes, and emergency access from the home screen.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
          <p className="text-slate-400">Service worker</p>
          <p className="mt-1 font-bold text-white">{serviceWorkerReady ? "Active" : "Registering"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
          <p className="text-slate-400">Display</p>
          <p className="mt-1 font-bold text-white">{standalone ? "Standalone" : "Browser"}</p>
        </div>
      </div>
      <button className="mt-4 min-h-12 w-full rounded-2xl border border-blue-300/20 bg-blue-400/12 text-sm font-bold text-blue-50" onClick={install} type="button">
        {installState}
      </button>
    </GlassCard>
  );
}

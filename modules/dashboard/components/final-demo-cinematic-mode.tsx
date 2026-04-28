"use client";

import { useWorld } from "@/lib/world/use-world";
import {
  WorldActionButton,
  WorldPanelChrome,
  WorldPill,
  worldNumber,
} from "@/modules/dashboard/components/world-panel-primitives";

const steps = [
  "Earth twin awakens",
  "Threat matrix locks global risk",
  "Supply chain reroutes",
  "Diplomacy corridor opens",
  "Civilization continuity stabilizes",
];

export function FinalDemoCinematicMode() {
  const { live, busyAction, runDemo } = useWorld();

  return (
    <WorldPanelChrome
      title="Final Demo Cinematic Mode"
      eyebrow="Prestige Investor / Judge Flow"
      accent="gold"
      action={
        <WorldActionButton onClick={runDemo} disabled={busyAction === "demo"}>
          Start World Demo
        </WorldActionButton>
      }
    >
      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <WorldPill tone={index === 4 ? "gold" : "cyan"}>Step {index + 1}</WorldPill>
            <p className="mt-3 text-sm font-semibold text-white">{step}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[28px] border border-amber-300/20 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),rgba(2,6,23,0.7)_58%)] p-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-100/70">World Command Finale</p>
        <h4 className="mt-2 text-4xl font-semibold text-white">{worldNumber(live?.metrics?.supremacy_score, 97)}%</h4>
        <p className="mt-2 text-sm text-amber-50/75">Global Supremacy Score locked for the final Sentra showcase.</p>
      </div>
    </WorldPanelChrome>
  );
}


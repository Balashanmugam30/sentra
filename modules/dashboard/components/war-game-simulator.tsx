"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentActionButton,
  GovernmentPanelChrome,
  GovernmentPill,
  govList,
  govNumber,
  govRecord,
  govString,
  governmentMoney,
} from "@/modules/dashboard/components/government-panel-primitives";

type WarGameOption = {
  option: string;
  name: string;
  lives_saved: number;
  cost: number;
  stability: number;
  recovery_speed: number;
  reputation: number;
  international_confidence: number;
};

export function WarGameSimulator() {
  const { wargame, runSimulation, busyAction } = useGovernment();
  const winner = govRecord(wargame?.winning_option);

  return (
    <GovernmentPanelChrome
      action={
        <GovernmentActionButton disabled={busyAction === "simulation-Cyclone"} onClick={() => void runSimulation("Cyclone")} tone="gold">
          Execute War Game
        </GovernmentActionButton>
      }
      description="Compares response options by lives saved, cost, stability, recovery speed, reputation, and international confidence."
      eyebrow="War Game Simulator"
      title={`Winning option: ${govString(winner.name, "Military logistics surge")}`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {govList<WarGameOption>(wargame?.options).map((item) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4" key={item.option}>
            <div className="flex items-center justify-between gap-3">
              <GovernmentPill label={item.option} tone={item.option === govString(winner.option) ? "gold" : "cyan"} />
              <span className="text-xs text-white/44">{governmentMoney.format(item.cost)}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{item.name}</p>
            <p className="mt-2 text-xs text-cyan-50/58">Lives {item.lives_saved}% / Stability {item.stability}%</p>
            <p className="mt-1 text-xs text-white/44">Recovery {item.recovery_speed}% / Reputation {item.reputation}% / Intl {item.international_confidence}%</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-white/44">Confidence {govNumber(wargame?.confidence, 91)}% / {govString(wargame?.war_game_status, "executive_ready")}</p>
    </GovernmentPanelChrome>
  );
}

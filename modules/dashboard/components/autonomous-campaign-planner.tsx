"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyActionButton,
  AutonomyPanelChrome,
  AutonomyPill,
  autoList,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

const campaignKeys = [
  ["15m", "fifteen_minute_plan"],
  ["60m", "sixty_minute_campaign"],
  ["24h", "twenty_four_hour_stabilization"],
] as const;

export function AutonomousCampaignPlanner() {
  const { plan, live, runLearningCycle, busyAction } = useAutonomy();

  return (
    <AutonomyPanelChrome
      title="Autonomous Campaign Planner"
      eyebrow="15m / 60m / 24h Campaigns"
      accent="gold"
      action={
        <AutonomyActionButton onClick={runLearningCycle} disabled={busyAction === "learning"}>
          Re-score Campaign
        </AutonomyActionButton>
      }
    >
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-white">{autoString(plan?.campaign_status, "Active planning loop")}</h4>
          <AutonomyPill tone="gold">Objective {autoString(live?.metrics?.current_objective, "fastest recovery")}</AutonomyPill>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Sentra converts the active objective into staged recovery plans, resource allocation, communications, and board-safe action guidance.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {campaignKeys.map(([label, key]) => {
          const actions = autoList<string>(plan?.[key]);
          return (
            <article key={key} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <AutonomyPill>{label}</AutonomyPill>
              <div className="mt-4 space-y-3">
                {actions.slice(0, 4).map((action, index) => (
                  <p key={`${key}-${action}-${index}`} className="text-sm leading-6 text-slate-200">
                    {action}
                  </p>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {["resource_plan", "communications_plan", "board_plan"].map((key) => {
          const items = autoList<Record<string, unknown> | string>(plan?.[key]);
          return (
            <div key={key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h4 className="font-semibold capitalize text-white">{key.replaceAll("_", " ")}</h4>
              <div className="mt-3 space-y-2">
                {items.slice(0, 3).map((item, index) => {
                  const text =
                    typeof item === "string"
                      ? item
                      : `${autoString(item.resource ?? item.audience ?? item.channel, "Action")}: ${autoString(
                          item.assignment ?? item.message ?? item,
                          "planned",
                        )}`;
                  return (
                    <p key={`${key}-${index}`} className="text-sm text-slate-300">
                      {text}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AutonomyPanelChrome>
  );
}


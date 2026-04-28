"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyActionButton,
  AutonomyPanelChrome,
  AutonomyPill,
  autoBar,
  autoList,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

const OBJECTIVES = ["fastest recovery", "minimize casualties", "protect reputation", "maintain continuity"];

export function GoalExecutionPanel() {
  const { objectives, live, setObjective, busyAction } = useAutonomy();
  const objectiveCards = autoList<Record<string, unknown>>(objectives?.objectives);
  const activeObjective = autoString(live?.metrics?.current_objective, "fastest recovery");

  return (
    <AutonomyPanelChrome title="Goal Execution Panel" eyebrow="Objective-Driven Autonomy" accent="gold">
      <div className="flex flex-wrap gap-2">
        {OBJECTIVES.map((objective) => (
          <AutonomyActionButton
            key={objective}
            onClick={() => setObjective(objective)}
            disabled={busyAction === `objective-${objective}`}
          >
            {objective === activeObjective ? "Active: " : ""}
            {objective}
          </AutonomyActionButton>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {objectiveCards.slice(0, 6).map((objective, index) => {
          const score = autoNumber(objective.priority_score, 88);
          const name = autoString(objective.objective, "autonomy objective");
          return (
            <div key={`${name}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold capitalize text-white">{name}</h4>
                <AutonomyPill tone={name === activeObjective ? "gold" : "cyan"}>{autoString(objective.status, "available")}</AutonomyPill>
              </div>
              <p className="mt-2 text-sm text-slate-300">{autoString(objective.description, "Objective ready for autonomous planning.")}</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-200" style={{ width: autoBar(score) }} />
              </div>
            </div>
          );
        })}
      </div>
    </AutonomyPanelChrome>
  );
}


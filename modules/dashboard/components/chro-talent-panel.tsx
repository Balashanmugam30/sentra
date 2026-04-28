"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionMetricTile,
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  exNumber,
  exRecord,
  exString,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function ChroTalentPanel() {
  const { chro } = useExecution();
  const morale = exRecord(chro?.department_morale);

  return (
    <ExecutionPanelChrome
      description="Talent OS tracks team health, attrition, morale, leadership gaps, high performer retention, and strategic skill shortages."
      eyebrow="CHRO Talent OS"
      title={`${exNumber(chro?.team_health, 82)}% team health with ${exNumber(chro?.attrition_risk, 18)}% attrition risk`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <ExecutionMetricTile label="Hiring Velocity" value={exString(chro?.hiring_velocity, "8 critical hires/quarter")} />
        <ExecutionMetricTile label="High Performer Retention" value={`${exNumber(chro?.high_performer_retention, 91)}%`} />
        <ExecutionMetricTile label="Leadership Gaps" value={exList<string>(chro?.leadership_gaps).length || 3} />
        <ExecutionMetricTile label="Skill Shortages" value={exList<string>(chro?.skill_shortages).length || 3} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Department morale</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(morale).map(([team, score]) => (
              <ExecutionPill key={team} label={`${team} ${exNumber(score)}%`} />
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-amber-200/14 bg-amber-200/[0.055] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-100/54">Leadership gaps</p>
          <div className="mt-3 space-y-2">
            {exList<string>(chro?.leadership_gaps).map((item) => (
              <p className="text-sm leading-6 text-white/64" key={item}>{item}</p>
            ))}
          </div>
        </div>
      </div>
    </ExecutionPanelChrome>
  );
}

"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyMetricTile,
  AutonomyPanelChrome,
  autoBar,
  autoList,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function TrustConfidencePanel() {
  const { trust, live } = useAutonomy();
  const departments = autoList<Record<string, unknown>>(trust?.department_trust);

  return (
    <AutonomyPanelChrome title="Trust & Confidence Panel" eyebrow="Human Governance Trust System">
      <div className="grid gap-3 md:grid-cols-4">
        <AutonomyMetricTile label="Trust Score" value={autoNumber(live?.metrics?.trust_score, 88)} suffix="%" tone="gold" />
        <AutonomyMetricTile label="Accepted" value={autoNumber(trust?.accepted_percent, 71)} suffix="%" />
        <AutonomyMetricTile label="Overrides" value={autoNumber(trust?.manual_override_percent, 17)} suffix="%" tone="orange" />
        <AutonomyMetricTile label="Board Confidence" value={autoNumber(trust?.board_confidence, 86)} suffix="%" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {departments.slice(0, 4).map((department, index) => {
          const score = autoNumber(department.score, 86);
          return (
            <div key={`${autoString(department.department, "department")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{autoString(department.department, "Department")}</span>
                <span className="text-cyan-100">{score}% {autoString(department.trend, "+0")}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-200" style={{ width: autoBar(score) }} />
              </div>
            </div>
          );
        })}
      </div>
    </AutonomyPanelChrome>
  );
}


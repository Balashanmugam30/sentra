"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionMetricTile,
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  exNumber,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function CisoGovernancePanel() {
  const { ciso } = useExecution();

  return (
    <ExecutionPanelChrome
      description="CISO governance keeps the execution layer board-safe with security maturity, compliance posture, insider risk, and policy control readiness."
      eyebrow="CISO Governance Panel"
      title={`${exNumber(ciso?.security_maturity, 92)}% security maturity with ${exNumber(ciso?.org_risk_score, 23)} risk pressure`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <ExecutionMetricTile label="Compliance" value={`${exNumber(ciso?.compliance_posture, 89)}%`} />
        <ExecutionMetricTile label="Policy Violations" value={exNumber(ciso?.policy_violations, 3)} />
        <ExecutionMetricTile label="Insider Risk" value={`${exNumber(ciso?.insider_risk, 14)}%`} />
        <ExecutionMetricTile label="Board Security" value={`${exNumber(ciso?.board_security_readiness, 91)}%`} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {exList<string>(ciso?.priority_controls).map((item) => (
          <ExecutionPill key={item} label={item} tone="gold" />
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}

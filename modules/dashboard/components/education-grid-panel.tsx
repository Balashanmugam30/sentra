"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import {
  CivilizationMetricCard,
  CivilizationPanelShell,
  civNumber,
} from "@/modules/dashboard/components/civilization-panel-primitives";

const FALLBACK_NETWORKS = ["Bala University", "Metro Campus Group", "National School Mesh", "STEM Continuity Grid"];

export function EducationGridPanel() {
  const { education, live } = useCivilizationInfra();
  const networks = education?.priority_networks?.length ? education.priority_networks : FALLBACK_NETWORKS;

  return (
    <CivilizationPanelShell
      description="Universities, schools, campus safety, remote continuity capacity, and learning continuity under one national mesh."
      eyebrow="Education Grid Engine"
      title={`${civNumber.format(live?.universities ?? education?.universities ?? 910)} universities continuity-ready`}
    >
      <div className="grid gap-3 md:grid-cols-5">
        <CivilizationMetricCard label="Schools" value={civNumber.format(education?.schools ?? 18_600)} />
        <CivilizationMetricCard label="Campus safety" value={`${education?.campus_safety ?? 91}%`} />
        <CivilizationMetricCard label="Learning posture" value={`${education?.continuity_learning_posture ?? 89}%`} />
        <CivilizationMetricCard label="Remote capacity" value={`${education?.remote_continuity_capacity ?? 86}%`} />
        <CivilizationMetricCard label="Priority networks" value={networks.length} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {networks.map((network, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={network}>
            <p className="text-sm font-semibold text-white">{network}</p>
            <p className="mt-2 text-xs leading-5 text-white/50">
              Continuity tier {index + 1} with secure campus alerts, remote learning fallback, and emergency transport hooks.
            </p>
          </div>
        ))}
      </div>
    </CivilizationPanelShell>
  );
}

"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import {
  EcosystemActionButton,
  EcosystemBar,
  EcosystemMetricCard,
  EcosystemPanelShell,
  ecosystemMoney,
} from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function CertifiedExpertPanel() {
  const { busyAction, certifications, issueCertification, live } = useEcosystem();

  return (
    <EcosystemPanelShell
      action={
        <EcosystemActionButton busy={busyAction === "certification"} onClick={() => void issueCertification()}>
          {busyAction === "certification" ? "Issuing..." : "Issue Certification"}
        </EcosystemActionButton>
      }
      description="Certified admins, consultants, engineers, and agencies turn Sentra into an implementation economy."
      eyebrow="Certified Expert Network"
      title={`${(live?.certified_experts ?? 540).toLocaleString()} certified experts`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        {certifications.map((track) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={track.certification_id}>
            <p className="text-sm font-semibold text-white">{track.name}</p>
            <div className="mt-4">
              <EcosystemBar label="Completion" value={track.completion_rate} />
            </div>
            <div className="mt-4 grid gap-2">
              <EcosystemMetricCard label="Certified" value={track.certified_count.toLocaleString()} />
              <EcosystemMetricCard label="Revenue" value={ecosystemMoney.format(track.training_revenue)} />
            </div>
          </div>
        ))}
      </div>
    </EcosystemPanelShell>
  );
}

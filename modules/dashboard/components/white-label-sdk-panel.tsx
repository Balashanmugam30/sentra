"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import { EcosystemMetricCard, EcosystemPanelShell } from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function WhiteLabelSdkPanel() {
  const { whiteLabelSdk } = useEcosystem();

  return (
    <EcosystemPanelShell description="Partner branding kits, embedded command widgets, OEM tenant mode, SDK access, and private deployment kits." eyebrow="White-Label SDK Platform" title="Sentra can ship inside partner ecosystems">
      <div className="grid gap-3 md:grid-cols-5">
        <EcosystemMetricCard label="Brand kits" value={whiteLabelSdk?.branding_kits ?? 18} />
        <EcosystemMetricCard label="Widgets" value={whiteLabelSdk?.embedded_widgets ?? 42} />
        <EcosystemMetricCard label="OEM mode" value={whiteLabelSdk?.tenant_oem_mode ? "Ready" : "Disabled"} />
        <EcosystemMetricCard label="Private kits" value={whiteLabelSdk?.private_deployment_kits ?? 9} />
        <EcosystemMetricCard label="Rev share" value={`${whiteLabelSdk?.partner_revenue_share_percent ?? 18}%`} />
      </div>
      <p className="mt-4 rounded-[20px] border border-cyan-200/12 bg-cyan-200/6 p-4 text-sm text-cyan-50/68">
        SDKs: {(whiteLabelSdk?.sdk_access ?? ["typescript", "python", "go", "embedded-js"]).join(", ")}.
      </p>
    </EcosystemPanelShell>
  );
}

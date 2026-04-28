"use client";

import { usePlatformOps } from "@/lib/platform/use-platform-ops";
import { OpsMetricTile, OpsPanelChrome, opsList, opsNumber, opsRecord, opsString } from "@/modules/dashboard/components/platform-ops-primitives";

export function DeploymentHealthPanel() {
  const { deployment, dataIntegrity, billingReconciliation } = usePlatformOps();
  const readiness = opsRecord(deployment?.readiness);
  const migrations = opsRecord(deployment?.migrations);
  const logs = opsRecord(deployment?.logs);
  const backups = opsList<Record<string, unknown>>(deployment?.backups);

  return (
    <OpsPanelChrome title="Deployment Health Panel" eyebrow="Readiness + Backups + Migrations + Billing Reconciliation">
      <div className="grid gap-3 md:grid-cols-4">
        <OpsMetricTile label="Readiness" value={opsString(readiness.status, "ready")} />
        <OpsMetricTile label="Migrations" value={opsString(migrations.status, "ready")} />
        <OpsMetricTile label="Data Integrity" value={opsString(dataIntegrity?.status, "pass")} tone={opsString(dataIntegrity?.status, "pass") === "pass" ? "cyan" : "gold"} />
        <OpsMetricTile label="Billing Recon" value={opsString(billingReconciliation?.status, "pass")} tone={opsString(billingReconciliation?.status, "pass") === "pass" ? "cyan" : "gold"} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
          <h4 className="font-semibold text-white">Structured Logs</h4>
          <p className="mt-2 text-sm text-slate-300">{opsString(logs.path, "logs/sentra-backend.jsonl")}</p>
          <p className="mt-1 text-xs text-cyan-100/70">{opsNumber(logs.bytes, 0)} bytes</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
          <h4 className="font-semibold text-white">Backups</h4>
          <p className="mt-2 text-sm text-slate-300">{backups.length} recent snapshots indexed</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
          <h4 className="font-semibold text-white">Failed Payments</h4>
          <p className="mt-2 text-sm text-slate-300">{opsNumber(billingReconciliation?.failed_invoice_count, 0)} invoices need recovery</p>
        </article>
      </div>
    </OpsPanelChrome>
  );
}

